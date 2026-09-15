"""
AI Career Mentor RAG Chain using LangChain, FAISS, and Google Gemini LLM.
Retrieves grounded evidence from Career Guides and the Jobs Dataset before answering questions.
"""
import os
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
import pandas as pd

from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from src.config import (
    GEMINI_API_KEY,
    GEMINI_MODEL,
    CAREER_NOTES_DIR,
    JOBS_CSV_PATH,
    CAREER_FAISS_INDEX,
    VECTORSTORE_DIR,
)
from src.search.embed import get_embedding_function
from src.safety.guardrails import validate_career_input, GuardrailResult
from src.generate.prompts import CAREER_MENTOR_SYSTEM_PROMPT, CAREER_MENTOR_RAG_PROMPT


def load_knowledge_documents() -> List[Document]:
    """
    Loads all markdown notes from data/career_notes/ and chunks them.
    Also extracts job descriptions from jobs.csv to unify the knowledge base.
    """
    raw_docs: List[Document] = []

    # 1. Load Markdown career notes
    if CAREER_NOTES_DIR.exists():
        for file_path in CAREER_NOTES_DIR.glob("*.md"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    raw_docs.append(Document(
                        page_content=content,
                        metadata={
                            "source": file_path.name,
                            "title": file_path.stem.replace("_", " ").title(),
                            "type": "Career Guide"
                        }
                    ))
            except Exception as e:
                print(f"Warning: Could not read {file_path}: {e}")

    # 2. Load Jobs dataset as knowledge source
    if JOBS_CSV_PATH.exists():
        try:
            df = pd.read_csv(JOBS_CSV_PATH)
            for _, row in df.iterrows():
                job_title = str(row.get("job_title", "Tech Role"))
                skills = str(row.get("skills", ""))
                desc = str(row.get("description", ""))
                company = str(row.get("company", ""))
                
                job_text = (
                    f"Job Market Posting: {job_title} at {company}.\n"
                    f"Required Skills: {skills}\n"
                    f"Key Responsibilities & Description: {desc}"
                )
                raw_docs.append(Document(
                    page_content=job_text,
                    metadata={
                        "source": "jobs.csv",
                        "title": f"{job_title} ({company})",
                        "type": "Job Posting"
                    }
                ))
        except Exception as e:
            print(f"Warning: Could not read {JOBS_CSV_PATH}: {e}")

    # Split into clean, coherent chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=600,
        chunk_overlap=80,
        separators=["\n## ", "\n### ", "\n\n", "\n", ". ", " "]
    )
    chunked_docs = text_splitter.split_documents(raw_docs)
    return chunked_docs


class CareerMentorRAG:
    """End-to-end RAG pipeline with safety guardrails and source attribution."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or GEMINI_API_KEY
        self.embedder = get_embedding_function(self.api_key)
        self.vector_store: Optional[FAISS] = None

    def index_exists(self) -> bool:
        """Checks if pre-built career knowledge FAISS index exists on disk."""
        return (CAREER_FAISS_INDEX / "index.faiss").exists() and (CAREER_FAISS_INDEX / "index.pkl").exists()

    def build_knowledge_index(self, force_rebuild: bool = False) -> None:
        """Indexes career guides and jobs data into a persistent local FAISS store."""
        if self.index_exists() and not force_rebuild:
            self.load_index()
            return

        documents = load_knowledge_documents()
        if not documents:
            raise RuntimeError("No knowledge documents found in data/career_notes/ or data/jobs/.")

        self.vector_store = FAISS.from_documents(documents, self.embedder)
        CAREER_FAISS_INDEX.mkdir(parents=True, exist_ok=True)
        self.vector_store.save_local(str(CAREER_FAISS_INDEX))

    def load_index(self) -> None:
        """Loads existing FAISS vector database."""
        if not self.index_exists():
            self.build_knowledge_index(force_rebuild=True)
            return

        self.vector_store = FAISS.load_local(
            str(CAREER_FAISS_INDEX),
            self.embedder,
            allow_dangerous_deserialization=True
        )

    def retrieve_context(self, question: str, k: int = 4) -> List[Document]:
        """Retrieves top-k most relevant knowledge chunks."""
        if self.vector_store is None:
            self.load_index()
        return self.vector_store.similarity_search(question, k=k)

    def answer_question(self, question: str) -> Dict[str, Any]:
        """
        Executes complete RAG workflow:
        1. Guardrails check
        2. Vector document retrieval
        3. Grounded Gemini LLM synthesis
        4. Citation compilation
        """
        # Step 1: Enforce Guardrails
        guardrail_result: GuardrailResult = validate_career_input(question)
        if not guardrail_result.is_valid:
            return {
                "answer": guardrail_result.friendly_message,
                "sources": [],
                "guardrail_status": "rejected",
                "violation": guardrail_result.violation_category,
                "reason": guardrail_result.reason
            }

        # Step 2: Retrieve Relevant Knowledge Documents
        retrieved_docs = self.retrieve_context(question, k=4)
        if not retrieved_docs:
            return {
                "answer": "I could not retrieve relevant information from the SmartHire knowledge base on this topic.",
                "sources": [],
                "guardrail_status": "passed",
                "violation": None
            }

        # Format context for prompt
        context_parts = []
        sources = []
        for i, doc in enumerate(retrieved_docs, start=1):
            source_name = doc.metadata.get("title", doc.metadata.get("source", f"Source {i}"))
            source_type = doc.metadata.get("type", "Document")
            context_parts.append(f"[{i}] ({source_type}: {source_name})\n{doc.page_content}")
            sources.append({
                "index": i,
                "title": source_name,
                "type": source_type,
                "file": doc.metadata.get("source", ""),
                "snippet": doc.page_content[:150] + "..."
            })

        full_context = "\n\n".join(context_parts)
        prompt_content = CAREER_MENTOR_RAG_PROMPT.format(
            context=full_context,
            question=question
        )

        # Step 3: LLM Inference with Gemini
        if not self.api_key:
            return {
                "answer": (
                    "**Demo Response (Missing GEMINI_API_KEY):**\n\n"
                    "Based on the retrieved career guides, here is a summary:\n"
                    + "\n".join([f"- **{s['title']}**: {s['snippet']}" for s in sources])
                ),
                "sources": sources,
                "guardrail_status": "passed",
                "violation": None
            }

        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)

            model = genai.GenerativeModel(
                model_name=GEMINI_MODEL,
                system_instruction=CAREER_MENTOR_SYSTEM_PROMPT,
                generation_config={"temperature": 0.2}
            )

            response = model.generate_content(prompt_content)
            answer_text = response.text or "I was unable to formulate an answer from the retrieved notes."

            return {
                "answer": answer_text,
                "sources": sources,
                "guardrail_status": "passed",
                "violation": None
            }

        except Exception as e:
            return {
                "answer": f"Error connecting to Gemini API: {str(e)}",
                "sources": sources,
                "guardrail_status": "passed",
                "error": str(e)
            }


_mentor_instance: Optional[CareerMentorRAG] = None

def get_career_mentor(api_key: Optional[str] = None) -> CareerMentorRAG:
    """Singleton getter for CareerMentorRAG to avoid repeated index reloads."""
    global _mentor_instance
    if _mentor_instance is None:
        _mentor_instance = CareerMentorRAG(api_key=api_key)
    return _mentor_instance
