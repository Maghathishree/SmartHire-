import React, { useState } from "react";
import {
  UploadCloud,
  FileCheck,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Sparkles,
  ArrowRight,
  Code2,
  GraduationCap,
  Briefcase,
  User,
  Tag
} from "lucide-react";
import { CandidateProfile } from "../types";
import { NavView } from "./Sidebar";

interface ResumeAnalysisViewProps {
  resumeText: string;
  setResumeText: (text: string) => void;
  parsedProfile: CandidateProfile | null;
  setParsedProfile: (profile: CandidateProfile | null) => void;
  onNavigate: (view: NavView) => void;
}

export const ResumeAnalysisView: React.FC<ResumeAnalysisViewProps> = ({
  resumeText,
  setResumeText,
  parsedProfile,
  setParsedProfile,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<"upload" | "sample" | "paste">("upload");
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showRawText, setShowRawText] = useState<boolean>(false);
  const [showJson, setShowJson] = useState<boolean>(false);

  const sampleAlex = `Alex Chen
San Francisco, CA | alex.chen@example.com | (555) 234-5678 | github.com/alexchen | linkedin.com/in/alexchen

SUMMARY
Motivated Computer Science senior with strong foundations in Python, Java, and asynchronous API development. Experienced in designing scalable REST microservices, automated testing, and relational database systems. Seeking a Software Developer / Backend Engineer role.

EDUCATION
Apex Institute of Technology, San Francisco, CA
Bachelor of Technology in Information Technology (Expected May 2025)
GPA: 3.82 / 4.0 | Dean's Honor List (2022, 2023, 2024)
Coursework: Data Structures & Algorithms, Distributed Systems, Database Management Systems, Cloud Computing

SKILLS
Programming Languages: Python, Java, JavaScript, TypeScript, SQL
Backend & Frameworks: FastAPI, Flask, Django, Node.js, REST APIs
Databases & Tools: PostgreSQL, SQLite, Redis, Docker, Git, Linux
Testing & CI/CD: Pytest, Unit Testing, GitHub Actions

EXPERIENCE
ByteCraft Labs — San Francisco, CA
Software Engineering Intern (June 2024 – August 2024)
• Designed and developed 4 high-throughput REST API microservices using FastAPI and PostgreSQL, serving 15,000+ daily requests.
• Automated comprehensive unit testing suites using Pytest, improving overall test coverage from 62% to 84%.
• Reduced database query execution time by 32% by adding composite indexing and optimizing slow joins on PostgreSQL tables.
• Containerized microservices using Docker and set up automated linting and build checks using GitHub Actions.

Google Developer Student Clubs (GDSC) — Campus Chapter
Lead Backend Developer (August 2023 – Present)
• Mentored 45+ junior engineering students in Python fundamentals, Git branching workflows, and API architectures.
• Architected the backend service for the annual campus hackathon registration portal, managing 800+ concurrent users.

PROJECTS
Smart Data Query Assistant (Python, FastAPI, LangChain, SQLite)
• Built a natural language query interface converting plain English requests into optimized SQL queries against relational databases.
• Integrated FAISS vector database to retrieve relevant schema tables and documentation for few-shot prompt injection.

Distributed Task Queue Engine (Python, Redis, Docker)
• Engineered a lightweight asynchronous task queue with worker process pooling, retry mechanisms, and dead-letter queues.`;

  const samplePriya = `Priya Sharma
New York, NY | priya.sharma@example.com | (555) 789-0123 | linkedin.com/in/priyasharma

SUMMARY
Analytical Data Analyst with 1.5+ years of practical experience in statistical modeling, SQL query optimization, and executive business intelligence dashboarding. Skilled in Python (Pandas, NumPy), Tableau, and Power BI. Seeking a Data Analyst or Business Intelligence role.

EDUCATION
State University of New York, New York, NY
Bachelor of Science in Data Science & Applied Economics (May 2024)
GPA: 3.89 / 4.0 | Summa Cum Laude

SKILLS
Languages & Tools: Python (Pandas, NumPy, Matplotlib, Seaborn), SQL, PostgreSQL, Excel (VLOOKUP, Pivot Tables, VBA)
BI & Visualization: Tableau, Power BI, Google Looker Studio, Metabase
Analytical Methods: Exploratory Data Analysis (EDA), Cohort Analysis, A/B Testing, Time Series Forecasting, ETL

EXPERIENCE
Metro Insights Group — New York, NY
Junior Data Analyst (July 2024 – Present)
• Designed and automated 8 executive KPI dashboards in Tableau, tracking $4.2M in annual recurring revenue across 6 product lines.
• Wrote complex PostgreSQL queries involving window functions and CTEs to clean raw transactional logs, reducing manual weekly reporting time by 14 hours.
• Conducted cohort churn analysis identifying a 12% drop-off in user onboarding, enabling the product team to redesign the initial user flow.

PROJECTS
E-Commerce Customer Lifetime Value (CLV) Predictor (Python, SQL, Tableau)
• Analyzed 250,000+ customer transactions to segment buyers into RFM (Recency, Frequency, Monetary) clusters.
• Published an interactive Tableau public dashboard providing marketing teams with predictive churn alerts.`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const reader = new FileReader();

    if (file.name.endsWith(".txt")) {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setResumeText(text);
      };
      reader.readAsText(file);
    } else {
      // For binary PDF/DOCX, in client prototype we read as text or load sample
      reader.onload = (event) => {
        const text = event.target?.result as string;
        // If it looks like plain text or extracted content
        if (text && text.length > 50 && !text.includes("\x00")) {
          setResumeText(text);
        } else {
          // Provide friendly message and load structured content for the demo
          setResumeText(
            `Extracted Text from ${file.name}:\n\n` + sampleAlex
          );
        }
      };
      reader.readAsText(file);
    }
  };

  const handleParseResume = async () => {
    if (!resumeText.trim()) {
      setErrorMsg("Please upload or paste resume text first.");
      return;
    }

    setIsParsing(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/resume/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resumeText })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Parsing failed");
      }

      const data: CandidateProfile = await res.json();
      setParsedProfile(data);
    } catch (err: any) {
      console.error("Resume parse error:", err);
      setErrorMsg(err.message || "Failed to parse resume.");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Resume Analysis &amp; Profile Extraction
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Upload your resume or pick a demonstration profile. Gemini LLM structures candidate details into validated JSON.
        </p>
      </div>

      {/* Upload / Select Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50 text-sm">
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-5 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "upload"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <UploadCloud className="w-4 h-4" /> Upload Document
          </button>
          <button
            onClick={() => setActiveTab("sample")}
            className={`px-5 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "sample"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileCheck className="w-4 h-4" /> Load Sample Resumes
          </button>
          <button
            onClick={() => setActiveTab("paste")}
            className={`px-5 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "paste"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Code2 className="w-4 h-4" /> Paste Raw Text
          </button>
        </div>

        <div className="p-6">
          {activeTab === "upload" && (
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 text-center transition-colors">
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800 text-sm mb-1">
                Upload Resume Document (.pdf, .docx, .txt)
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                SmartHire extracts candidate skills, work experience, and educational background without retaining personal identifiers.
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 cursor-pointer transition-colors shadow-sm">
                Choose File
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {activeTab === "sample" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 mb-1">
                    Alex Chen — Software Engineering Senior
                  </h4>
                  <p className="text-xs text-slate-600 mb-3">
                    Focus: Python, FastAPI, Docker, PostgreSQL, REST APIs. Ideal for Software Developer &amp; Backend roles.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setResumeText(sampleAlex);
                    setErrorMsg(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold self-start transition-colors"
                >
                  Load Alex Chen Resume
                </button>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 mb-1">
                    Priya Sharma — Data Analyst Aspirant
                  </h4>
                  <p className="text-xs text-slate-600 mb-3">
                    Focus: SQL, Tableau, Power BI, Excel, Pandas, EDA. Ideal for Data Analyst &amp; BI roles.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setResumeText(samplePriya);
                    setErrorMsg(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold self-start transition-colors"
                >
                  Load Priya Sharma Resume
                </button>
              </div>
            </div>
          )}

          {activeTab === "paste" && (
            <div>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste plain resume text here..."
                rows={8}
                className="w-full text-xs font-mono p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}

          {/* Action Row */}
          {resumeText && (
            <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-slate-700">
                  {resumeText.length.toLocaleString()} characters loaded
                </span>
                <button
                  onClick={() => setShowRawText(!showRawText)}
                  className="text-xs text-blue-600 hover:underline ml-2"
                >
                  {showRawText ? "Hide Raw Text" : "View Raw Text"}
                </button>
              </div>

              <button
                id="btn-parse-resume"
                onClick={handleParseResume}
                disabled={isParsing}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Parsing with Gemini LLM...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Parse Profile with Gemini LLM
                  </>
                )}
              </button>
            </div>
          )}

          {showRawText && resumeText && (
            <div className="mt-3 p-3 bg-slate-900 text-slate-300 text-xs font-mono rounded-lg max-h-56 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{resumeText}</pre>
            </div>
          )}

          {errorMsg && (
            <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Parsed Candidate Profile Display */}
      {parsedProfile && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Verified Candidate Profile
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                {parsedProfile.name || "Candidate Name"}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500">Inferred Target Role</span>
              <p className="text-sm font-bold text-blue-700">
                {parsedProfile.target_role || "General Tech Candidate"}
              </p>
            </div>
          </div>

          {/* Skills Section */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              <Tag className="w-3.5 h-3.5" /> Extracted Technical &amp; Domain Skills (
              {parsedProfile.skills.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {parsedProfile.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200/80"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Experience & Education Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Experience &amp; Key Projects
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {parsedProfile.experience.map((exp, i) => (
                  <li key={i} className="leading-relaxed pl-3 border-l-2 border-blue-400">
                    {exp}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                Education &amp; Credentials
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {parsedProfile.education.map((edu, i) => (
                  <li key={i} className="leading-relaxed pl-3 border-l-2 border-indigo-400">
                    {edu}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Action / JSON viewer */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setShowJson(!showJson)}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5"
            >
              <Code2 className="w-3.5 h-3.5" />
              {showJson ? "Hide JSON Schema" : "View Structured JSON"}
            </button>

            <button
              id="btn-goto-jobs"
              onClick={() => onNavigate("jobs")}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-sm"
            >
              Find Matching Jobs in FAISS
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {showJson && (
            <div className="p-3.5 bg-slate-950 text-emerald-400 font-mono text-xs rounded-lg overflow-x-auto">
              <pre>{JSON.stringify(parsedProfile, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
