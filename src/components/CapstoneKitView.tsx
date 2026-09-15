import React, { useState, useEffect } from "react";
import {
  FolderCode,
  FileCode,
  Copy,
  Check,
  GraduationCap,
  ChevronRight,
  BookOpen,
  Code2,
  Download
} from "lucide-react";

export const CapstoneKitView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"code" | "viva">("code");
  const [selectedFile, setSelectedFile] = useState<string>("app/streamlit_app.py");
  const [fileContent, setFileContent] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const keyFiles = [
    { label: "Streamlit UI", path: "app/streamlit_app.py", desc: "Full Multi-Page App" },
    { label: "RAG Pipeline", path: "src/mentor/rag_chain.py", desc: "LangChain + Gemini RAG" },
    { label: "FAISS Job Search", path: "src/search/job_search.py", desc: "Vector Semantic Search" },
    { label: "Guardrails Layer", path: "src/safety/guardrails.py", desc: "8-Tier Security System" },
    { label: "Prompts Library", path: "src/generate/prompts.py", desc: "Structured Prompt Templates" },
    { label: "CV Suggestions", path: "src/generate/cv_suggestions.py", desc: "Google XYZ Formula" },
    { label: "Evaluation Suite", path: "src/evaluate.py", desc: "Automated Benchmarking" },
    { label: "Evaluation Report", path: "reports/answer_quality.md", desc: "Benchmark Findings & Metrics" },
    { label: "Project README", path: "README.md", desc: "Complete Documentation" }
  ];

  const fetchContent = async (filePath: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/capstone/file-content?path=${encodeURIComponent(filePath)}`);
      if (res.ok) {
        const text = await res.text();
        setFileContent(text);
      } else {
        setFileContent("// Unable to read file content.");
      }
    } catch (err) {
      setFileContent("// Error fetching file.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent(selectedFile);
  }, [selectedFile]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const vivaQuestions = [
    {
      q: "1. Why use vector embeddings and FAISS instead of traditional keyword search?",
      a: "Traditional keyword search (e.g. regex, BM25) fails when students use alternative terminology (e.g. 'FastAPI microservices') while a job posting requests 'Backend REST APIs'. Vector embeddings project concepts into a 768-dimensional dense mathematical space where semantic synonyms share close spatial proximity. FAISS calculates exact Euclidean/Cosine distances in sub-milliseconds."
    },
    {
      q: "2. How does RAG (Retrieval-Augmented Generation) prevent LLM hallucinations?",
      a: "Rather than allowing the LLM to speculate or generate facts from internal parameters, RAG retrieves verified chunks from local career guides and job datasets. These chunks are injected into the context prompt with strict negative constraints instructing the model to answer ONLY from the retrieved context, refusing unsupported assertions."
    },
    {
      q: "3. Why is Pydantic validation crucial after LLM generation?",
      a: "Generative AI models are non-deterministic and can produce markdown backticks or malformed keys. Pydantic enforces an assertive schema validation contract at runtime, ensuring types (List[str], non-null strings) are guaranteed before the UI attempts rendering."
    },
    {
      q: "4. What is the Google XYZ formula utilized in your CV improvement engine?",
      a: "The Google XYZ formula dictates: 'Accomplished [X] as measured by [Y], by doing [Z]'. Our prompt specifically transforms vague student bullets (e.g., 'Worked on database') into quantifiable achievements (e.g., 'Reduced query latency by 32% across 14 endpoints by introducing PostgreSQL composite indexes')."
    },
    {
      q: "5. Explain your 8-tier guardrails defense mechanism.",
      a: "The guardrails layer intercepts every user prompt BEFORE invoking the LLM. It tests boundary lengths (<3 or >2,500 chars), blocks prompt injections (e.g. 'ignore previous rules', 'DAN'), prevents secret extraction ('GEMINI_API_KEY', 'os.environ'), filters harmful content, and restricts conversations to professional career development."
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderCode className="w-6 h-6 text-blue-600" />
            Capstone Codebase &amp; Viva Kit
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Interactive source code explorer for the Python/Streamlit project and Viva defense questions.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab("code")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "code" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600"
            }`}
          >
            Code Explorer
          </button>
          <button
            onClick={() => setActiveTab("viva")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "viva" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600"
            }`}
          >
            Viva Q&amp;A Defense
          </button>
        </div>
      </div>

      {activeTab === "code" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* File Picker */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 block">
              Project Source Files
            </span>
            {keyFiles.map((f) => (
              <button
                key={f.path}
                onClick={() => setSelectedFile(f.path)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  selectedFile === f.path
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-slate-400" />
                    <span>{f.label}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 pl-5">{f.desc}</div>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-300" />
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="lg:col-span-3 bg-slate-950 rounded-xl border border-slate-800 shadow-md flex flex-col overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span className="font-mono text-emerald-400">{selectedFile}</span>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors text-[11px]"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy Code"}
              </button>
            </div>

            <div className="p-4 overflow-auto max-h-[520px] font-mono text-xs text-slate-300 leading-relaxed">
              {loading ? (
                <div className="text-slate-500 italic">Loading file contents...</div>
              ) : (
                <pre className="whitespace-pre">{fileContent}</pre>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "viva" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900">
            <strong>Capstone Defense Prep:</strong> Review these core technical justifications to explain design decisions confidently to reviewers and examiners.
          </div>

          <div className="space-y-3">
            {vivaQuestions.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                  {item.q}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed pl-6">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
