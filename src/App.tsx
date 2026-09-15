import React, { useState, useEffect } from "react";
import { Sidebar, NavView } from "./components/Sidebar";
import { HomeView } from "./components/HomeView";
import { ResumeAnalysisView } from "./components/ResumeAnalysisView";
import { JobMatchesView } from "./components/JobMatchesView";
import { CVImprovementView } from "./components/CVImprovementView";
import { MentorChatView } from "./components/MentorChatView";
import { GuardrailsView } from "./components/GuardrailsView";
import { CapstoneKitView } from "./components/CapstoneKitView";
import { AboutView } from "./components/AboutView";
import { CandidateProfile, JobPosting, CVImprovementData, ChatMessage } from "./types";
import { Menu, X } from "lucide-react";

export default function App() {
  const [currentView, setCurrentView] = useState<NavView>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  // Core Application Data Flow States
  const [resumeText, setResumeText] = useState<string>("");
  const [parsedProfile, setParsedProfile] = useState<CandidateProfile | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [improvementData, setImprovementData] = useState<CVImprovementData | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am your **AI Career Mentor**, backed by the SmartHire knowledge base of real tech roles, guides, and skill roadmaps. Ask me anything about career roadmaps, skills needed for specific roles, or interview advice!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  // Check health and API status
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(Boolean(data.hasApiKey));
      })
      .catch(() => {
        setHasApiKey(false);
      });
  }, []);

  const handleSelectView = (view: NavView) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop and Mobile Drawer) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform lg:static lg:transform-none transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Sidebar
          currentView={currentView}
          onSelectView={handleSelectView}
          hasResume={Boolean(resumeText)}
          hasApiKey={hasApiKey}
          selectedJobTitle={selectedJob?.job_title}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="lg:hidden bg-slate-900 text-white p-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs">
              SH
            </div>
            <span className="font-bold text-sm">SmartHire GenAI</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 rounded text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {currentView === "home" && (
            <HomeView onNavigate={handleSelectView} hasResume={Boolean(resumeText)} />
          )}
          {currentView === "resume" && (
            <ResumeAnalysisView
              resumeText={resumeText}
              setResumeText={setResumeText}
              parsedProfile={parsedProfile}
              setParsedProfile={setParsedProfile}
              onNavigate={handleSelectView}
            />
          )}
          {currentView === "jobs" && (
            <JobMatchesView
              resumeText={resumeText}
              parsedProfile={parsedProfile}
              selectedJob={selectedJob}
              setSelectedJob={setSelectedJob}
              onNavigate={handleSelectView}
            />
          )}
          {currentView === "cv_improve" && (
            <CVImprovementView
              resumeText={resumeText}
              selectedJob={selectedJob}
              setSelectedJob={setSelectedJob}
              improvementData={improvementData}
              setImprovementData={setImprovementData}
              onNavigate={handleSelectView}
            />
          )}
          {currentView === "mentor" && (
            <MentorChatView
              chatMessages={chatMessages}
              setChatMessages={setChatMessages}
            />
          )}
          {currentView === "guardrails" && <GuardrailsView />}
          {currentView === "codebase" && <CapstoneKitView />}
          {currentView === "about" && <AboutView />}
        </main>
      </div>
    </div>
  );
}
