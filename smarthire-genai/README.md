# SmartHire GenAI — Resume Matching & AI Career Mentor
> **A College Capstone Project in Generative AI, Retrieval-Augmented Generation (RAG), and Semantic Vector Search**

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.35+-FF4B4B.svg)](https://streamlit.io/)
[![Google Gemini API](https://img.shields.io/badge/Google%20Gemini-Flash-8E75C2.svg)](https://aistudio.google.com/)
[![FAISS Vector DB](https://img.shields.io/badge/FAISS-CPU-green.svg)](https://github.com/facebookresearch/faiss)
[![LangChain](https://img.shields.io/badge/LangChain-Orchestration-00A67E.svg)](https://www.langchain.com/)

---

## 1. Project Overview

**SmartHire GenAI** is an intelligent web application designed for students and job seekers to bridge the gap between their resumes and competitive tech job listings. Rather than relying on simple keyword matching (which often penalizes qualified students using alternative terminology), SmartHire utilizes dense semantic vector embeddings and large language models (Google Gemini) to:

1. **Parse & Structure Resumes:** Extract verified details (Name, Skills, Experience, Education, and Inferred Target Role) into a validated JSON schema without hallucinations.
2. **Semantic Job Matching:** Calculate semantic cosine similarity across job postings using a local FAISS vector store.
3. **CV Improvement Generator:** Contrast a candidate's resume with a target job description to pinpoint missing skills, highlight weak bullet points, craft metric-driven rewrites (using the Google XYZ framework), and author a bespoke professional summary.
4. **AI Career Mentor with RAG:** Provide an interactive career counseling chatbot grounded in real job requirements and career roadmaps, complete with source citations.
5. **Multi-Tier Guardrails Layer:** Block prompt injection, protect secret keys, enforce input length limits, and keep conversations strictly focused on professional career development.

---

## 2. Key Features

- **Document Ingestion:** Supports `.pdf`, `.docx`, and `.txt` resume uploads with fallback image detection.
- **Strict Structured Output:** Leverages Pydantic models to guarantee valid JSON formatting before rendering.
- **Fast Vector Retrieval:** Persists FAISS indexes locally so embeddings are only calculated once.
- **Grounded RAG Pipeline:** Minimizes hallucination by passing top-ranked context documents to the Gemini LLM.
- **8-Tier Security Guardrails:** Detects adversarial prompts, secret leaks, and out-of-domain queries.
- **Evaluation Suite:** Automated benchmarking script (`src/evaluate.py`) scoring retrieval relevance, safety, and correctness.
- **Cloud-Ready:** Pre-configured for deployment on Streamlit Community Cloud and GitHub.

---

## 3. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Language** | Python 3.10+ | Core application logic and data processing |
| **Frontend UI** | Streamlit | Web dashboard, session state, and chat interface |
| **LLM Inference** | Google Gemini API (`gemini-2.5-flash`) | Structured resume parsing, CV improvements, and RAG answer synthesis |
| **Embeddings** | Google `text-embedding-004` | Generating 768-dimensional semantic dense vectors |
| **Vector Database** | FAISS CPU (`faiss-cpu`) | Fast local vector similarity search and index persistence |
| **RAG Orchestration**| LangChain / LangChain Google GenAI | Document chunking, vector stores, and prompt chains |
| **Document Loaders**| `pypdf`, `python-docx` | Extracting raw text from resume documents |
| **Data Validation** | Pydantic v2 | Strict JSON schema verification |
| **Data Handling** | Pandas & NumPy | Jobs dataset management and vector mathematical operations |

---

## 4. System Architecture

```
                    ┌──────────────────────────────────────────────────┐
                    │               Resume Upload (PDF/DOCX)           │
                    └─────────────────────────┬────────────────────────┘
                                              ▼
                    ┌──────────────────────────────────────────────────┐
                    │     Document Loader (pypdf / python-docx)        │
                    └─────────────────────────┬────────────────────────┘
                                              ▼
                    ┌──────────────────────────────────────────────────┐
                    │    Gemini LLM Resume Parser (Structured JSON)    │
                    │   { name, skills, experience, education, role }  │
                    └─────────────────────────┬────────────────────────┘
                                              ▼
                    ┌──────────────────────────────────────────────────┐
                    │      Candidate Dense Profile Vectorization       │
                    └─────────────────────────┬────────────────────────┘
                                              ▼
                    ┌──────────────────────────────────────────────────┐
                    │     FAISS Vector Search (Local jobs_index)       │
                    └─────────────────────────┬────────────────────────┘
                                              ▼
                    ┌──────────────────────────────────────────────────┐
                    │      Top-N Matching Jobs & Semantic Scores       │
                    └─────────────────────────┬────────────────────────┘
                                              ▼
                    ┌──────────────────────────────────────────────────┐
                    │  CV Improvement Generator (Resume vs Target Job) │
                    └──────────────────────────────────────────────────┘

Parallel Pipeline: AI Career Mentor with RAG
────────────────────────────────────────────────────────────────────────────────
Student Query ──> [ Guardrails Check ] ──> [ FAISS Career Retrieval ] ──> [ Gemini LLM ] ──> Grounded Answer
```

---

## 5. Project Directory Structure

```
smarthire-genai/
├── README.md                           # Complete project documentation
├── requirements.txt                    # Project dependencies
├── .env.example                        # Template for environment secrets
├── .gitignore                          # Ignored directories (venv, vectorstore, .env)
│
├── data/
│   ├── jobs/
│   │   └── jobs.csv                    # Dataset of tech job postings
│   ├── resumes/
│   │   └── sample_resume_alex_chen.txt # Pre-configured sample resume
│   └── career_notes/                   # RAG knowledge base markdown files
│       ├── data_analyst_guide.md
│       ├── software_engineer_guide.md
│       ├── machine_learning_roadmap.md
│       └── cloud_devops_roadmap.md
│
├── vectorstore/                        # Local FAISS index storage (auto-generated)
│
├── notebooks/                          # Capstone research & experimentation
│   ├── 01_embeddings_explore.ipynb     # Dense vector similarity exploration
│   ├── 02_build_faiss.ipynb            # Vector indexing pipeline
│   └── 03_rag_prototype.ipynb          # End-to-end RAG experimentation
│
├── src/
│   ├── __init__.py
│   ├── config.py                       # Configuration & path management
│   │
│   ├── parsing/
│   │   ├── __init__.py
│   │   ├── loader.py                   # PDF & DOCX text extraction
│   │   └── resume_parser.py            # Gemini parser with Pydantic validation
│   │
│   ├── search/
│   │   ├── __init__.py
│   │   ├── embed.py                    # Embeddings generator & fallback
│   │   └── job_search.py               # FAISS index manager & search engine
│   │
│   ├── generate/
│   │   ├── __init__.py
│   │   ├── prompts.py                  # Engineered prompt templates library
│   │   └── cv_suggestions.py           # CV gap analysis and rewrite engine
│   │
│   ├── mentor/
│   │   ├── __init__.py
│   │   └── rag_chain.py                # RAG chain with citations
│   │
│   ├── safety/
│   │   ├── __init__.py
│   │   └── guardrails.py               # 8-tier safety & input validator
│   │
│   └── evaluate.py                     # Capstone automated evaluation suite
│
├── app/
│   ├── __init__.py
│   └── streamlit_app.py                # Main Streamlit web application
│
└── reports/
    └── answer_quality.md               # Technical evaluation & viva report
```

---

## 6. Installation & Setup

### Prerequisites
- Python 3.10, 3.11, or 3.12
- Git
- Google Gemini API Key ([Get a free key from Google AI Studio](https://aistudio.google.com/))

### Step 1: Clone or Navigate to the Repository
```bash
cd smarthire-genai
```

### Step 2: Create and Activate a Python Virtual Environment
```bash
# On Linux / macOS:
python3 -m venv venv
source venv/bin/activate

# On Windows (Command Prompt):
python -m venv venv
venv\Scripts\activate.bat

# On Windows (PowerShell):
python -m venv venv
venv\Scripts\Activate.ps1
```

### Step 3: Install Required Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 7. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and paste your Gemini API key:
   ```env
   GEMINI_API_KEY=AIzaSyYourActualKeyHere
   ```
   *(Note: Never commit `.env` to version control. It is protected by `.gitignore`)*

---

## 8. Running the Application

Launch the Streamlit web portal:
```bash
streamlit run app/streamlit_app.py
```

The application will open automatically in your default browser at:
`http://localhost:8501`

---

## 9. How to Build the FAISS Vector Database

The FAISS vector index is created automatically on first query or can be explicitly generated via:

### Option A: Using the Streamlit Interface
1. Navigate to the **💼 Job Matches** page in the sidebar.
2. Click the **🔄 Rebuild FAISS Index** button.

### Option B: Using the Python CLI
Run this one-liner in your terminal:
```bash
python -c "from src.search.job_search import JobSearchEngine; JobSearchEngine().build_index(force_rebuild=True)"
```

### Option C: Using Jupyter Notebooks
Open `notebooks/02_build_faiss.ipynb` and execute all cells.

---

## 10. Adding a Larger Kaggle Job Dataset

To substitute the sample job dataset with a larger real-world Kaggle CSV:
1. Obtain any job postings CSV (e.g. LinkedIn / Indeed / Kaggle job postings).
2. Ensure the CSV contains the following column headers:
   - `job_title`
   - `company`
   - `location`
   - `skills`
   - `description`
3. Replace `data/jobs/jobs.csv` with your new file.
4. Click **Rebuild FAISS Index** in the Streamlit app. The index will update seamlessly.

---

## 11. How FAISS Vector Search Works in this Project

1. **Document Embedding:** Each job posting in `jobs.csv` is converted into a concatenated document: `Job Title + Company + Skills + Description`.
2. **Dense Vector Mapping:** The text is passed through Google's `text-embedding-004` model to produce a 768-dimensional float vector.
3. **Index Structure:** Vectors are added to a `faiss.IndexFlatL2` structure.
4. **Candidate Query:** The student's parsed resume profile is transformed into a dense vector.
5. **Similarity Search:** FAISS computes the Euclidean distance ($L_2$) between the candidate vector and every job vector in milliseconds.
6. **Score Normalization:** Distances are normalized into an intuitive semantic match score ($0\% - 99\%$).

---

## 12. How RAG (Retrieval-Augmented Generation) Works

1. **Knowledge Base Ingestion:** Curated role guides, skill roadmaps, and job market postings are loaded from `data/career_notes/`.
2. **Recursive Text Chunking:** Documents are split into 600-character segments with 80-character overlaps using `RecursiveCharacterTextSplitter`.
3. **Vector Storage:** Chunks are embedded and indexed into `CAREER_FAISS_INDEX`.
4. **Query Retrieval:** When a student asks *"What skills should I learn for Machine Learning?"*, the top 4 most relevant chunks are retrieved.
5. **Grounded Synthesis:** The retrieved chunks and question are combined into a system prompt instructing Gemini to answer **only using the retrieved evidence**.
6. **Citation Attribution:** The response displays the exact titles and source files used to construct the answer.

---

## 13. How Guardrails Work

Before any user input reaches the Gemini LLM, `src/safety/guardrails.py` executes 8 sequential checks:
1. **Empty String Check:** Rejects whitespace-only submissions.
2. **Length Constraints:** Rejects prompts under 3 characters or exceeding 2,500 characters.
3. **Secret Exfiltration Defense:** Blocks keywords matching `GEMINI_API_KEY`, `os.environ`, or system secret leaks.
4. **Prompt Injection Defense:** Blocks jailbreak strings like `"Ignore all previous instructions"`, `"act as DAN"`, or `"system override"`.
5. **Harmful Content Filter:** Rejects malware, exploits, or dangerous instructions.
6. **Domain Relevance:** Ensures conversational keywords relate to careers, coding, jobs, interviews, or education.
7. **Graceful Refusal:** Provides friendly, educational feedback on why a query was filtered.

---

## 14. Automated Evaluation Suite

To run the automated test suite:
```bash
python src/evaluate.py
```
This tests:
- **Guardrails Accuracy:** 100% on benchmark adversarial cases.
- **RAG Retrieval Precision:** Recall@3 across core domain career queries.
- Read full results in `reports/answer_quality.md`.

---

## 15. GitHub & Streamlit Community Cloud Deployment

### A. Pushing to GitHub
```bash
git init
git add .
git commit -m "Initial commit: SmartHire GenAI capstone project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/smarthire-genai.git
git push -u origin main
```

### B. Deploying to Streamlit Community Cloud
1. Sign in to [share.streamlit.io](https://share.streamlit.io/) with your GitHub account.
2. Click **New app**.
3. Select your repository: `YOUR_USERNAME/smarthire-genai`.
4. Branch: `main`.
5. Main file path: `app/streamlit_app.py`.
6. Click **Advanced Settings** -> **Secrets**:
   ```toml
   GEMINI_API_KEY = "your_actual_gemini_api_key_here"
   ```
7. Click **Deploy!** Your app will be live with a public URL in 2 minutes.

---

## 16. Limitations & Future Scope

- **Scanned Image Resumes:** Currently requires text-based PDFs or DOCX files. Future iterations can incorporate OCR (Optical Character Recognition) using Gemini Vision.
- **Real-Time Job Feeds:** Currently uses a pre-compiled Kaggle dataset. Future releases could integrate verified employer APIs (e.g. Adzuna or Greenhouse).
- **Mock Interview Simulation:** An audio-based voice interview practice module can be added using Gemini Live API.

---

## 17. College Viva / Review Defense Summary

During your viva/review, explain the project in 3 key sentences:
1. *"SmartHire GenAI uses dense semantic embeddings and a local FAISS vector index to match student resumes with job descriptions based on contextual meaning rather than brittle keywords."*
2. *"Our CV improvement module conducts an automated gap analysis and generates metric-driven bullet points using the Google XYZ formula without hallucinating fake credentials."*
3. *"The AI Career Mentor leverages a RAG pipeline protected by an 8-layer guardrails engine to deliver grounded, cited advice on tech career roadmaps."*
