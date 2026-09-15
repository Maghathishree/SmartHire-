export interface CandidateProfile {
  name: string;
  skills: string[];
  experience: string[];
  education: string[];
  target_role: string;
}

export interface JobPosting {
  id: number;
  job_title: string;
  company: string;
  location: string;
  skills: string;
  description: string;
  match_score?: number;
  disclaimer?: string;
}

export interface CVImprovementData {
  missing_skills: string[];
  weak_bullet_points: string[];
  improved_bullet_points: string[];
  rewritten_summary: string;
  overall_suggestions: string[];
}

export interface RAGSource {
  title: string;
  source: string;
  type: string;
  snippet: string;
  score?: number;
  index?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  guardrailStatus?: "passed" | "rejected";
  violation?: string | null;
  sources?: RAGSource[];
  timestamp: string;
}

export interface GuardrailTestResult {
  isValid: boolean;
  category: string | null;
  reason: string | null;
  friendlyMessage: string | null;
}
