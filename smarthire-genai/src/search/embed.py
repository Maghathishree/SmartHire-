"""
Embeddings generation module for SmartHire GenAI.
Supports Google text-embedding-004 through LangChain Google GenAI,
with a resilient TF-IDF / Cosine fallback for offline testing or missing API keys.
"""
from typing import List, Optional
import numpy as np

from src.config import GEMINI_API_KEY, EMBEDDING_MODEL


class FallbackTFIDFEmbeddings:
    """
    Lightweight, dependency-free bag-of-words / TF-IDF vectorizer fallback.
    Used when running in offline mode or during unit tests without an active API key.
    """
    def __init__(self, vector_dim: int = 256):
        self.vector_dim = vector_dim

    def _hash_vector(self, text: str) -> List[float]:
        tokens = [t.lower().strip() for t in text.split() if len(t.strip()) > 2]
        vec = np.zeros(self.vector_dim, dtype=np.float32)
        if not tokens:
            return vec.tolist()
        for token in tokens:
            idx = abs(hash(token)) % self.vector_dim
            vec[idx] += 1.0
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._hash_vector(t) for t in texts]

    def embed_query(self, text: str) -> List[float]:
        return self._hash_vector(text)


def get_embedding_function(api_key: Optional[str] = None):
    """
    Returns the primary LangChain Google Generative AI Embeddings model,
    or falls back to the local deterministic embedding vectorizer if API key is absent.
    """
    key = api_key or GEMINI_API_KEY
    if key and key != "your_gemini_api_key_here":
        try:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
            return GoogleGenerativeAIEmbeddings(
                model=EMBEDDING_MODEL,
                google_api_key=key
            )
        except Exception:
            # Fall back gracefully if package initialization fails
            return FallbackTFIDFEmbeddings()
    return FallbackTFIDFEmbeddings()


def generate_text_embedding(text: str, api_key: Optional[str] = None) -> List[float]:
    """Generates an embedding vector for a single string."""
    embedder = get_embedding_function(api_key)
    return embedder.embed_query(text)
