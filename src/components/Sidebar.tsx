import React from "react";
import {
  Home,
  FileText,
  Briefcase,
  Sparkles,
  Bot,
  ShieldCheck,
  FolderCode,
  Info,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export type NavView =
  | "home"
  | "resume"
  | "jobs"
  | "cv_improve"
  | "mentor"
  | "guardrails"
  | "codebase"
  | "about";

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  hasResume: boolean;
  hasApiKey: boolean;
  selectedJobTitle?: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  hasResume,
  hasApiKey,
  selectedJobTitle
}) => {
  const navItems: { id: NavView; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "home", label: "Home", icon: <Home className="w-4 h-4" /> },
    {
      id: "resume",
      label: "Resume Analysis",
      icon: <FileText className="w-4 h-4" />,
      badge: hasResume ? "Loaded" : undefined
    },
    { id: "jobs", label: "Job Matches", icon: <Briefcase className="w-4 h-4" /> },
    {
      id: "cv_improve",
      label: "CV Improvement",
      icon: <Sparkles className="w-4 h-4" />,
      badge: selectedJobTitle ? "Ready" : undefined
    },
    { id: "mentor", label: "AI Career Mentor", icon: <Bot className="w-4 h-4" /> },
    { id: "guardrails", label: "Guardrails Lab", icon: <ShieldCheck className="w-4 h-4" /> },
    { id: "codebase", label: "Capstone Kit & Viva", icon: <FolderCode className="w-4 h-4" /> },
    { id: "about", label: "About", icon: <Info className="w-4 h-4" /> }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col h-screen shrink-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md">
            SH
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-tight">SmartHire GenAI</h1>
            <p className="text-xs text-slate-400">Resume & Career Mentor</p>
          </div>
        </div>

        {/* API Status Badge */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">Gemini LLM:</span>
          {hasApiKey ? (
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-400 font-medium" title="Demo mode enabled">
              <AlertCircle className="w-3.5 h-3.5" /> Demo Mode
            </span>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Capstone Modules
        </div>
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${
                    isActive ? "bg-blue-700 text-blue-100" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Capstone Footer Note */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-400 space-y-1">
        <p className="font-semibold text-slate-300">B.Tech IT Capstone Project</p>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Streamlit + Gemini Flash + FAISS Vector DB + LangChain RAG
        </p>
      </div>
    </aside>
  );
};
