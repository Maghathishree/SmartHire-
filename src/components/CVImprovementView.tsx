import React, { useState } from "react";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Briefcase,
  Building2,
  Tag,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  FileEdit
} from "lucide-react";
import { JobPosting, CVImprovementData } from "../types";
import { NavView } from "./Sidebar";

interface CVImprovementViewProps {
  resumeText: string;
  selectedJob: JobPosting | null;
  setSelectedJob: (job: JobPosting | null) => void;
  improvementData: CVImprovementData | null;
  setImprovementData: (data: CVImprovementData | null) => void;
  onNavigate: (view: NavView) => void;
}

export const CVImprovementView: React.FC<CVImprovementViewProps> = ({
  resumeText,
  selectedJob,
  setSelectedJob,
  improvementData,
  setImprovementData,
  onNavigate
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerateImprovements = async () => {
    if (!resumeText.trim()) {
      setErrorMsg("Please load or upload a resume in the Resume Analysis tab first.");
      return;
    }
    if (!selectedJob) {
      setErrorMsg("Please select a target job first.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/cv/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: resumeText,
          job: selectedJob
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate CV suggestions.");
      }

      const data: CVImprovementData = await res.json();
      setImprovementData(data);
    } catch (err: any) {
      console.error("CV improve error:", err);
      setErrorMsg(err.message || "Failed to generate improvements.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          CV Improvement Generator
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Perform granular gap analysis against target job requirements and transform bullet points using Google's XYZ formula.
        </p>
      </div>

      {/* Selected Job Card */}
      {selectedJob ? (
        <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Target Evaluation Role
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                {selectedJob.job_title}
                <span className="text-sm font-normal text-slate-500">at {selectedJob.company}</span>
              </h2>
            </div>

            <button
              id="btn-generate-cv-improve"
              onClick={handleGenerateImprovements}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Analyzing Resume with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate AI CV Enhancements
                </>
              )}
            </button>
          </div>

          <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="font-semibold text-slate-700">Target Requirements:</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono text-[11px]">
              {selectedJob.skills}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              No target job selected. Pick a role from the <strong>Job Matches</strong> tab to generate targeted CV improvements.
            </span>
          </div>
          <button
            onClick={() => onNavigate("jobs")}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors shrink-0"
          >
            Browse Jobs
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Generated Improvement Output */}
      {improvementData && (
        <div className="space-y-6">
          {/* 1. Missing Skills */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                1. Missing or Underrepresented Skills Gap
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              These required capabilities were prominent in the job listing but missing from your resume text:
            </p>
            <div className="flex flex-wrap gap-2">
              {improvementData.missing_skills.length > 0 ? (
                improvementData.missing_skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg bg-amber-50 text-amber-800 font-semibold text-xs border border-amber-200/80 flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> No critical missing skills detected!
                </span>
              )}
            </div>
          </div>

          {/* 2. Bullet Point Rewrites */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileEdit className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  2. Bullet Point Optimization (Google XYZ Formula)
                </h3>
                <p className="text-xs text-slate-500">
                  Formula: <em>"Accomplished [X], as measured by [Y], by doing [Z]"</em>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {improvementData.weak_bullet_points.map((weak, i) => {
                const improved = improvementData.improved_bullet_points[i] || "";
                return (
                  <div
                    key={i}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200/70"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Original / Passive Bullet
                      </span>
                      <p className="text-xs text-slate-700 italic border-l-2 border-slate-400 pl-2.5">
                        "{weak}"
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Metric-Driven Rewrite
                      </span>
                      <p className="text-xs font-semibold text-slate-900 border-l-2 border-emerald-500 pl-2.5">
                        {improved}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Rewritten Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                3. Tailored Professional Summary (ATS-Aligned)
              </h3>
            </div>
            <div className="p-4 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs text-slate-800 leading-relaxed italic">
              "{improvementData.rewritten_summary}"
            </div>
          </div>

          {/* 4. Overall Suggestions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                4. Actionable Career &amp; Portfolio Recommendations
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {improvementData.overall_suggestions.map((sug, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span>{sug}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
