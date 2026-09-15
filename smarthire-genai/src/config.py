"""
Configuration management for SmartHire GenAI.
Loads environment variables and sets project directory paths.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root
ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=ROOT_DIR / ".env")

# API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

# Gemini Models
# Using gemini-2.5-flash / gemini-1.5-flash compatible for generation and text-embedding-004 for vectors
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "models/text-embedding-004")

# Paths
DATA_DIR = ROOT_DIR / "data"
JOBS_CSV_PATH = DATA_DIR / "jobs" / "jobs.csv"
CAREER_NOTES_DIR = DATA_DIR / "career_notes"
RESUMES_DIR = DATA_DIR / "resumes"
VECTORSTORE_DIR = ROOT_DIR / "vectorstore"

# FAISS index paths
JOBS_FAISS_INDEX = VECTORSTORE_DIR / "jobs_index"
CAREER_FAISS_INDEX = VECTORSTORE_DIR / "career_index"

# Ensure runtime directories exist
VECTORSTORE_DIR.mkdir(parents=True, exist_ok=True)
CAREER_NOTES_DIR.mkdir(parents=True, exist_ok=True)
RESUMES_DIR.mkdir(parents=True, exist_ok=True)
(DATA_DIR / "jobs").mkdir(parents=True, exist_ok=True)


def check_api_key() -> bool:
    """Returns True if the GEMINI_API_KEY is configured and non-empty."""
    return bool(GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here")
