import React, { useState, useEffect } from "react";
import {
  Briefcase,
  MapPin,
  Tag,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Search,
  AlertCircle,
  Building2,
  Sliders
} from "lucide-react";
import { JobPosting, CandidateProfile } from "../types";
import { NavView } from "./Sidebar";

interface JobMatchesViewProps {
  resumeText: string;
  parsedProfile: CandidateProfile | null;
  selectedJob: JobPosting | null;
  setSelectedJob: (job: JobPosting | null) => void;
  onNavigate: (view: NavView) => void;
}

export const JobMatchesView: React.FC<JobMatchesViewProps> = ({
  resumeText,
  parsedProfile,
  selectedJob,
  setSelectedJob,
  onNavigate
}) => {
  const [topN, setTopN] = useState<number>(5);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const executeSearch = async (count: number) => {
    setLoading(true);
    setErrorMsg(null);

    // Prepare candidate profile text
    const queryText = parsedProfile
      ? `Candidate: ${parsedProfile.name || ""}. Target Role: ${parsedProfile.target_role || ""}. Skills: ${parsedProfile.skills.join(", ")}. Experience: ${parsedProfile.experience.join(" ")}.`
      : resumeText;

    if (!queryText.trim()) {
      // If nothing loaded yet, fetch baseline jobs
      try {
        const res = await fetch("/api/jobs");
        const data: JobPosting[] = await res.json();
        setJobs(data.slice(0, count));
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await fetch("/api/jobs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query_text: queryText, top_n: count })
      });

      if (!res.ok) {
        throw new Error("Failed to search FAISS jobs index.");
      }

      const data: JobPosting[] = await res.json();
      setJobs(data);
    } catch (err: any) {
      console.error("Job search error:", err);
      setErrorMsg(err.message || "Error searching jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch(topN);
  }, [topN]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Semantic Job Matches
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Matching candidate profile vector against indexed tech jobs via dense similarity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-sm">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-600 font-medium">Show:</span>
            <select
              value={topN}
              onChange={(e) => setTopN(Number(e.target.value))}
              className="font-semibold text-blue-600 bg-transparent focus:outline-none"
            >
              <option value={3}>Top 3</option>
              <option value={5}>Top 5</option>
              <option value={8}>Top 8</option>
              <option value={12}>All 12</option>
            </select>
          </div>

          <button
            onClick={() => executeSearch(topN)}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Refresh search from FAISS"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Profile Context Notification */}
      {!parsedProfile && !resumeText ? (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              Showing default jobs dataset. Upload or load a candidate resume in <strong>Resume Analysis</strong> for customized similarity matching.
            </span>
          </div>
          <button
            onClick={() => onNavigate("resume")}
            className="px-3 py-1 rounded-md bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors shrink-0"
          >
            Go to Resume
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-lg bg-blue-50/80 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
          <span>
            Matched against candidate:{" "}
            <strong>{parsedProfile?.name || "Uploaded Resume"}</strong> (Target:{" "}
            <em>{parsedProfile?.target_role || "Tech Candidate"}</em>)
          </span>
          <span className="text-blue-700 font-semibold">FAISS Vector Search Active</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.map((job) => {
          const isSelected = selectedJob?.id === job.id;
          const score = job.match_score ?? 75;
          const scoreColor =
            score >= 82
              ? "text-emerald-600 bg-emerald-50 border-emerald-200"
              : score >= 65
              ? "text-blue-600 bg-blue-50 border-blue-200"
              : "text-amber-600 bg-amber-50 border-amber-200";

          return (
            <div
              key={job.id}
              className={`bg-white rounded-xl border p-5 transition-all shadow-sm ${
                isSelected
                  ? "border-blue-600 ring-2 ring-blue-500/20 shadow-md"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-900">{job.job_title}</h3>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-medium px-2 py-0.5 rounded bg-slate-100">
                      <Building2 className="w-3 h-3 text-slate-500" />
                      {job.company}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{job.description}</p>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mr-2">
                      Required Skills:
                    </span>
                    <div className="inline-flex flex-wrap gap-1 mt-1">
                      {job.skills.split(",").map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium"
                        >
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Score & Select Action */}
                <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className={`px-3 py-1.5 rounded-lg border text-center ${scoreColor}`}>
                    <div className="text-lg font-extrabold">{score}%</div>
                    <div className="text-[10px] uppercase font-semibold tracking-wider opacity-80">
                      Semantic Match
                    </div>
                  </div>

                  <button
                    id={`btn-select-job-${job.id}`}
                    onClick={() => {
                      setSelectedJob(job);
                      onNavigate("cv_improve");
                    }}
                    className={`px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" /> Select for CV Improvement
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                * Note: Score represents dense vector cosine similarity, not an absolute hiring guarantee.
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
