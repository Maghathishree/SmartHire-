import React from "react";
import { Info, CheckCircle2, Layers, GitBranch, Cloud, ExternalLink } from "lucide-react";

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Info className="w-6 h-6 text-blue-600" />
          About SmartHire GenAI
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          B.Tech Information Technology Capstone Project Documentation
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">Project Mission &amp; Overview</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong>SmartHire GenAI</strong> was developed as a production-style prototype for a Final Year B.Tech Information Technology Capstone. It addresses the common pitfall where students and junior job seekers are filtered out by traditional ATS keyword searches despite possessing high conceptual aptitude. By utilizing dense vector embeddings (FAISS), structured LLM prompt engineering (Google Gemini), and grounded RAG pipelines, SmartHire provides a transparent, fair, and educational career roadmap.
        </p>

        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" /> Core Technologies
            </h3>
            <ul className="space-y-1.5 text-slate-600">
              <li>• <strong>Python 3.10+</strong> &amp; Streamlit</li>
              <li>• <strong>Google Gemini Flash</strong> via Google GenAI SDK</li>
              <li>• <strong>FAISS CPU</strong> (Facebook AI Similarity Search)</li>
              <li>• <strong>LangChain</strong> RAG Orchestration</li>
              <li>• <strong>Pydantic v2</strong> Schema Enforcement</li>
              <li>• <strong>PyPDF</strong> &amp; <strong>python-docx</strong> Ingestion</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Accomplishments
            </h3>
            <ul className="space-y-1.5 text-slate-600">
              <li>• Zero-hallucination structured resume parsing</li>
              <li>• Local FAISS index caching without startup re-computation</li>
              <li>• Google XYZ metric-driven bullet point enhancements</li>
              <li>• Grounded RAG with source attribution and citations</li>
              <li>• 8-tier security guardrails against prompt injection</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Cloud className="w-4 h-4 text-indigo-600" />
          Deployment Guidelines (GitHub &amp; Streamlit Cloud)
        </h2>

        <div className="space-y-2 text-xs text-slate-600">
          <p>
            The entire Python application located in <code>/smarthire-genai</code> is 100% self-contained and ready for immediate deployment to Streamlit Community Cloud:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 font-medium">
            <li>Initialize Git inside <code>smarthire-genai/</code> and push to GitHub repository.</li>
            <li>Connect your GitHub account to <a href="https://share.streamlit.io" target="_blank" rel="noreferrer" className="text-blue-600 underline">Streamlit Community Cloud</a>.</li>
            <li>Select <code>app/streamlit_app.py</code> as the main file path.</li>
            <li>Set <code>GEMINI_API_KEY</code> in Streamlit Cloud's <strong>Advanced Settings &gt; Secrets</strong>.</li>
            <li>Deploy! The app will spin up with FAISS and RAG enabled.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
