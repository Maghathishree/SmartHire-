"""
FAISS-powered Semantic Job Search Engine.
Indexes job postings and performs vector similarity search against candidate profiles.
"""
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np

from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

from src.config import JOBS_CSV_PATH, JOBS_FAISS_INDEX, VECTORSTORE_DIR
from src.search.embed import get_embedding_function


def load_jobs_dataframe(csv_path: Optional[Path] = None) -> pd.DataFrame:
    """Loads and standardizes the jobs CSV dataset."""
    target_path = csv_path or JOBS_CSV_PATH
    if not target_path.exists():
        raise FileNotFoundError(f"Jobs dataset not found at {target_path}")

    df = pd.read_csv(target_path)
    # Fill missing values and standardize column names
    required_cols = ["job_title", "company", "location", "skills", "description"]
    for col in required_cols:
        if col not in df.columns:
            df[col] = "Not Specified"
        df[col] = df[col].fillna("Not Specified").astype(str).str.strip()

    return df


def prepare_job_document(row: pd.Series, doc_id: int) -> Document:
    """Prepares a cohesive text representation and metadata for vector indexing."""
    text_content = (
        f"Job Title: {row['job_title']}\n"
        f"Company: {row['company']}\n"
        f"Location: {row['location']}\n"
        f"Required Skills: {row['skills']}\n"
        f"Job Description: {row['description']}"
    )
    metadata = {
        "doc_id": doc_id,
        "job_title": row["job_title"],
        "company": row["company"],
        "location": row["location"],
        "skills": row["skills"],
        "description": row["description"],
        "source_type": "job_posting"
    }
    return Document(page_content=text_content, metadata=metadata)


class JobSearchEngine:
    """Manages the FAISS index and handles semantic similarity queries."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.embedder = get_embedding_function(api_key)
        self.vector_store: Optional[FAISS] = None
        self.df: Optional[pd.DataFrame] = None

    def index_exists(self) -> bool:
        """Checks if a pre-computed FAISS index folder exists locally."""
        index_file = JOBS_FAISS_INDEX / "index.faiss"
        pkl_file = JOBS_FAISS_INDEX / "index.pkl"
        return index_file.exists() and pkl_file.exists()

    def build_index(self, force_rebuild: bool = False) -> None:
        """Loads jobs CSV, creates embeddings, and saves FAISS index to disk."""
        if self.index_exists() and not force_rebuild:
            self.load_index()
            return

        self.df = load_jobs_dataframe()
        documents = [prepare_job_document(row, idx) for idx, row in self.df.iterrows()]

        # Build FAISS index
        self.vector_store = FAISS.from_documents(documents, self.embedder)
        JOBS_FAISS_INDEX.mkdir(parents=True, exist_ok=True)
        self.vector_store.save_local(str(JOBS_FAISS_INDEX))

    def load_index(self) -> None:
        """Loads the persisted local FAISS index."""
        if not self.index_exists():
            self.build_index(force_rebuild=True)
            return

        self.vector_store = FAISS.load_local(
            str(JOBS_FAISS_INDEX),
            self.embedder,
            allow_dangerous_deserialization=True
        )

    def search_jobs(self, candidate_profile_text: str, top_n: int = 5) -> List[Dict[str, Any]]:
        """
        Executes semantic vector search for candidate text against indexed jobs.
        Returns top-N results with normalized matching scores (0 - 100%).
        """
        if self.vector_store is None:
            self.load_index()

        if not candidate_profile_text.strip():
            return []

        # Perform similarity search with distance score
        results_with_score = self.vector_store.similarity_search_with_score(
            candidate_profile_text,
            k=top_n
        )

        matched_jobs = []
        for doc, score in results_with_score:
            # Score conversion: FAISS L2 distance (0 = identical, larger = more distant)
            # Or cosine distance: score in [0, 2]
            # Convert to an intuitive 0-100% semantic match score
            if score < 0:
                normalized_score = 95.0
            else:
                # Sigmoid or inverse mapping: score 0 -> ~98%, score 1 -> ~75%, score 2 -> ~50%
                normalized_score = max(10.0, min(99.0, 100.0 / (1.0 + float(score) * 0.45)))

            meta = doc.metadata
            matched_jobs.append({
                "job_title": meta.get("job_title", "Unknown Role"),
                "company": meta.get("company", "Unknown Company"),
                "location": meta.get("location", "Remote"),
                "skills": meta.get("skills", ""),
                "description": meta.get("description", ""),
                "raw_distance": round(float(score), 4),
                "match_score": round(normalized_score, 1),
                "disclaimer": "Semantic similarity match score, not a hiring guarantee."
            })

        # Sort descending by match score
        matched_jobs.sort(key=lambda x: x["match_score"], reverse=True)
        return matched_jobs
