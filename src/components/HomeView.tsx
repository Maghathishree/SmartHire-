import React from "react";
import {
  FileText,
  Briefcase,
  Sparkles,
  Bot,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Check
} from "lucide-react";
import { NavView } from "./Sidebar";

interface HomeViewProps {
  onNavigate: (view: NavView) => void;
  hasResume: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, hasResume }) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-8 text-white shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wide text-blue-200 mb-4 border border-white/10">
          <Cpu className="w-3.5 h-3.5" /> Capstone Production Prototype
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
          SmartHire GenAI
        </h1>
        <p className="text-blue-100 text-base sm:text-lg max-w-2xl leading-relaxed mb-6">
          Your AI-powered career companion. Bridging the gap between student resumes and modern hiring benchmarks with semantic vector search, ATS gap analysis, and grounded RAG guidance.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="home-cta-resume"
            onClick={() => onNavigate("resume")}
            className="px-5 py-2.5 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-colors shadow-md flex items-center gap-2 text-sm"
          >
            {hasResume ? "Continue Resume Analysis" : "Upload Resume & Start"}
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            id="home-cta-mentor"
            onClick={() => onNavigate("mentor")}
            className="px-5 py-2.5 rounded-xl bg-blue-800/60 hover:bg-blue-800 text-white font-semibold transition-colors border border-blue-400/30 flex items-center gap-2 text-sm"
          >
            <Bot className="w-4 h-4" />
            Ask Career Mentor
          </button>
        </div>
      </div>

      {/* 5-Step Process Pipeline */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          Autonomous Capstone Workflow
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
          {[
            { step: "01", title: "Upload Resume", desc: "Extract raw PDF / DOCX text" },
            { step: "02", title: "Extract Profile", desc: "Pydantic validated JSON" },
            { step: "03", title: "Semantic Search", desc: "FAISS dense vector index" },
            { step: "04", title: "Improve CV", desc: "Google XYZ formula rewrites" },
            { step: "05", title: "RAG Mentor", desc: "Grounded with citations" }
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center justify-between"
            >
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mb-2">
                {item.step}
              </span>
              <p className="font-semibold text-xs text-slate-800 mb-1">{item.title}</p>
              <p className="text-[11px] text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Core Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          onClick={() => onNavigate("resume")}
          className="group cursor-pointer bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1.5 flex items-center justify-between">
            Resume Analysis
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Parses unstructured resumes into validated JSON without hallucinations. Identifies candidate skills, technical proficiencies, education history, and target career domains.
          </p>
        </div>

        <div
          onClick={() => onNavigate("jobs")}
          className="group cursor-pointer bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Briefcase className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1.5 flex items-center justify-between">
            Semantic Job Matching
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Performs dense vector similarity search via local FAISS indices over verified tech jobs. Bypasses rigid keyword exact matches to surface true conceptual skill alignments.
          </p>
        </div>

        <div
          onClick={() => onNavigate("cv_improve")}
          className="group cursor-pointer bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1.5 flex items-center justify-between">
            CV Improvement Generator
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Select any target job to unlock a detailed gap breakdown. Generates missing skill alerts, weak bullet point rewrites via Google’s XYZ formula, and an ATS-tailored executive summary.
          </p>
        </div>

        <div
          onClick={() => onNavigate("mentor")}
          className="group cursor-pointer bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1.5 flex items-center justify-between">
            AI Career Mentor (RAG)
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Ask complex career roadmap and skill-building queries. Powered by LangChain RAG grounded in authoritative role guides, verified job datasets, and 8-tier safety guardrails.
          </p>
        </div>
      </div>

      {/* Technical Architecture Overview */}
      <div className="bg-slate-900 rounded-xl p-6 text-white shadow-sm border border-slate-800">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              System Architecture & Dataflow
            </h3>
          </div>
          <span className="text-xs text-slate-400">FAISS IndexFlatL2 + Gemini Flash</span>
        </div>

        <div className="font-mono text-xs text-slate-300 bg-slate-950/70 p-4 rounded-lg overflow-x-auto leading-relaxed border border-slate-800/80">
          <div className="text-emerald-400"># Resume Processing & Job Matching Pipeline</div>
          <div>Resume PDF/DOCX ──&gt; Document Loader ──&gt; Gemini LLM ──&gt; Structured Profile</div>
          <div className="text-slate-500">                                                       │</div>
          <div className="text-slate-500">                                                       ▼</div>
          <div>Candidate Profile ──&gt; Dense Embeddings ──&gt; FAISS Index ──&gt; Top Matches &amp; Scores</div>
          <div className="text-slate-500">                                                       │</div>
          <div className="text-slate-500">                                                       ▼</div>
          <div>                                                 Selected Job ──&gt; CV Improvement Engine</div>
          <br />
          <div className="text-amber-400"># RAG Career Mentor with Guardrails</div>
          <div>Student Query ──&gt; 8-Tier Guardrails ──&gt; Vector Retrieval ──&gt; Gemini RAG ──&gt; Cited Guidance</div>
        </div>
      </div>
    </div>
  );
};
