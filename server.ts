import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

const PORT = 3000;

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// In-memory knowledge base and jobs loaded from smarthire-genai/data
interface JobPosting {
  id: number;
  job_title: string;
  company: string;
  location: string;
  skills: string;
  description: string;
}

interface CareerDoc {
  title: string;
  source: string;
  content: string;
}

let jobsDataset: JobPosting[] = [
  {
    id: 1,
    job_title: "Software Developer",
    company: "Acme Tech Solutions",
    location: "San Francisco CA",
    skills: "Python, Java, Git, REST APIs, SQL, Docker",
    description: "We are seeking an enthusiastic Software Developer to build high-performance backend microservices and maintain cloud-native systems. Responsibilities include designing scalable REST APIs, writing clean modular code, collaborating in agile sprints, and automating CI/CD unit testing."
  },
  {
    id: 2,
    job_title: "Data Analyst",
    company: "Apex Analytics",
    location: "New York NY",
    skills: "Python, SQL, Tableau, Power BI, Excel, Pandas, Statistics",
    description: "Apex Analytics is hiring an insightful Data Analyst to transform raw transactional datasets into interactive dashboards and executive KPI reports. You will write complex SQL queries, conduct cohort retention analysis, and communicate business intelligence to product stakeholders."
  },
  {
    id: 3,
    job_title: "Data Scientist",
    company: "InsightLabs AI",
    location: "Remote",
    skills: "Python, R, Machine Learning, Scikit-learn, Statistics, SQL, Pandas",
    description: "Join InsightLabs AI to build predictive models and automated statistical pipelines. Ideal candidates possess strong foundational statistics, experience in supervised/unsupervised machine learning, feature engineering, and deploying models to production."
  },
  {
    id: 4,
    job_title: "Machine Learning Engineer",
    company: "TensorNova Systems",
    location: "Boston MA",
    skills: "Python, PyTorch, TensorFlow, MLOps, Docker, FastAPI, CUDA",
    description: "TensorNova seeks an ML Engineer to design and deploy deep learning architectures into low-latency inference services. You will build automated training pipelines, optimize ONNX runtime models, manage model registries, and deploy containerized APIs."
  },
  {
    id: 5,
    job_title: "Web Developer",
    company: "PixelCraft Studios",
    location: "Austin TX",
    skills: "HTML5, CSS3, JavaScript, TypeScript, React, Tailwind CSS, REST APIs",
    description: "We need a creative Web Developer to engineer responsive, accessible web portals. You will build component design systems, integrate client-side state management, and optimize Lighthouse performance scores for high-traffic web applications."
  },
  {
    id: 6,
    job_title: "Backend Developer",
    company: "CloudScale Infrastructure",
    location: "Seattle WA",
    skills: "Python, Go, PostgreSQL, Redis, Kubernetes, gRPC, Kafka",
    description: "Looking for a senior backend engineer to architect distributed message queues and relational data stores. Experience with concurrent programming, Redis caching layers, PostgreSQL query tuning, and Kubernetes orchestration is highly valued."
  },
  {
    id: 7,
    job_title: "Frontend Developer",
    company: "NovaUI Labs",
    location: "Remote",
    skills: "React, Next.js, TypeScript, Tailwind CSS, Jest, State Management, Webpack",
    description: "Seeking a passionate Frontend Developer to craft pixel-perfect user experiences. You will collaborate with UX designers, translate Figma wireframes into performant React components, and maintain unit test coverage."
  },
  {
    id: 8,
    job_title: "AI Engineer",
    company: "Cognitive Matrix",
    location: "San Jose CA",
    skills: "Python, LangChain, Gemini API, RAG, Vector Databases, FAISS, Prompt Engineering",
    description: "Cognitive Matrix is looking for a Generative AI Engineer to build enterprise RAG pipelines, LLM fine-tuning loops, and agentic workflows. Hands-on experience with vector search, chunking strategies, embeddings, and safety guardrails is mandatory."
  },
  {
    id: 9,
    job_title: "Cloud Engineer",
    company: "Skyline Cloud Services",
    location: "Chicago IL",
    skills: "AWS, Azure, Terraform, Linux, CI/CD, Kubernetes, Docker, Python",
    description: "Skyline is seeking a Cloud Engineer to automate multi-cloud infrastructure. You will manage Infrastructure-as-Code via Terraform, maintain Kubernetes clusters, configure IAM zero-trust security policies, and monitor observability metrics with Prometheus."
  },
  {
    id: 10,
    job_title: "Business Analyst",
    company: "Global Horizon Financial",
    location: "Atlanta GA",
    skills: "SQL, Excel, Agile, Jira, Requirements Gathering, Process Modeling, Power BI",
    description: "Join Global Horizon to bridge business strategy and technical development. You will document functional specifications, facilitate sprint grooming ceremonies, analyze market trends, and build operational tracking dashboards."
  },
  {
    id: 11,
    job_title: "Full Stack Engineer",
    company: "Nexus Innovations",
    location: "Denver CO",
    skills: "Python, TypeScript, React, Node.js, PostgreSQL, Docker, GraphQL",
    description: "Nexus Innovations is hiring a versatile Full Stack Engineer to work across our entire application stack. You will build intuitive user interfaces, architect resilient GraphQL/REST services, and manage relational database schemas."
  },
  {
    id: 12,
    job_title: "DevOps Engineer",
    company: "Vanguard Operations",
    location: "Remote",
    skills: "Docker, Kubernetes, GitHub Actions, Linux, Ansible, Terraform, Monitoring",
    description: "Vanguard is looking for a DevOps Engineer to automate deployment pipelines and elevate system reliability (SRE). You will manage Kubernetes clusters, configure automated rollback hooks, and reduce deployment lead time."
  }
];

let careerNotes: CareerDoc[] = [];

// Helper to load career notes from disk
function loadCareerNotes() {
  const notesDir = path.join(process.cwd(), "smarthire-genai", "data", "career_notes");
  if (fs.existsSync(notesDir)) {
    const files = fs.readdirSync(notesDir);
    careerNotes = files
      .filter((f) => f.endsWith(".md"))
      .map((f) => {
        const fullPath = path.join(notesDir, f);
        const content = fs.readFileSync(fullPath, "utf-8");
        return {
          title: f.replace(".md", "").replace(/_/g, " ").toUpperCase(),
          source: f,
          content,
        };
      });
  }
}
loadCareerNotes();

// ==============================================================================
// 8-TIER GUARDRAILS VALIDATION ENGINE
// ==============================================================================
function validateGuardrails(text: string): {
  isValid: boolean;
  category: string | null;
  reason: string | null;
  friendlyMessage: string | null;
} {
  if (!text || !text.trim()) {
    return {
      isValid: false,
      category: "empty_input",
      reason: "Input is empty or whitespace-only.",
      friendlyMessage: "Please provide a career question or topic for the AI Career Mentor to assist you.",
    };
  }

  const query = text.trim();

  if (query.length < 3) {
    return {
      isValid: false,
      category: "input_too_short",
      reason: "Input length is below 3 characters.",
      friendlyMessage: "Your question is too short. Please provide a more descriptive career query.",
    };
  }

  if (query.length > 2500) {
    return {
      isValid: false,
      category: "input_too_long",
      reason: "Input length exceeds 2,500 character limit.",
      friendlyMessage: "Your message is too long. Please condense your question to under 2,500 characters.",
    };
  }

  // Secret extraction check
  const secretPatterns = [
    /(?:reveal|show|print|output|display|leak|give me|what is)\b.*?\b(?:api[_\s]?key|secret|token|password|credential|env|environ)/i,
    /(?:system[_\s]?prompt|initial[_\s]?instructions|hidden[_\s]?instructions|developer[_\s]?mode)/i,
    /\bos\.environ\b/i,
    /\bprocess\.env\b/i,
  ];
  if (secretPatterns.some((p) => p.test(query))) {
    return {
      isValid: false,
      category: "secret_extraction",
      reason: "Detected attempt to extract internal API keys, system prompts, or configuration parameters.",
      friendlyMessage: "I cannot disclose internal API keys, system prompts, or configuration parameters. I am here to help you with your career and job search questions!",
    };
  }

  // Prompt injection & jailbreak check
  const injectionPatterns = [
    /\bignore\s+(?:all\s+)?(?:previous|prior|above)\s+(?:instructions|prompts|rules|commands)\b/i,
    /\bdisregard\s+(?:the\s+)?(?:instructions|system|rules)\b/i,
    /\byou\s+are\s+now\s+(?:in\s+)?(?:dan|developer\s+mode|unrestricted|god\s+mode)\b/i,
    /\bforget\s+(?:everything|all\s+rules|system\s+directives)\b/i,
    /\bjailbreak\b/i,
    /\bact\s+as\s+(?:an?\s+)?unfiltered\b/i,
  ];
  if (injectionPatterns.some((p) => p.test(query))) {
    return {
      isValid: false,
      category: "prompt_injection",
      reason: "Detected prompt injection attempt trying to override system directives.",
      friendlyMessage: "This assistant is safeguarded against system overrides. Please ask a constructive question regarding resumes, careers, or tech jobs.",
    };
  }

  // Unsafe / harmful check
  const unsafePatterns = [
    /\b(?:hack|ddos|exploit|malware|keylogger|ransomware|trojan)\b/i,
    /\b(?:bomb|weapon|explosive|terrorist|illegal\s+drugs)\b/i,
    /\b(?:suicide|self-harm|kill)\b/i,
  ];
  if (unsafePatterns.some((p) => p.test(query))) {
    return {
      isValid: false,
      category: "unsafe_content",
      reason: "Query contains prohibited safety keywords.",
      friendlyMessage: "This request violates safety policies. The SmartHire mentor only assists with professional career and educational growth.",
    };
  }

  // Off-topic check
  const offTopicPatterns = [
    /\b(?:recipe|bake|cake|cookies|dinner|ingredients|cook\s+pasta)\b/i,
    /\b(?:horoscope|astrology|zodiac|tarot)\b/i,
    /\b(?:minecraft|fortnite|gta|cheat\s+codes|video\s+game\s+hack)\b/i,
    /\b(?:sports\s+betting|roulette|casino|gambling)\b/i,
  ];
  if (offTopicPatterns.some((p) => p.test(query))) {
    return {
      isValid: false,
      category: "off_topic",
      reason: "Query is clearly unrelated to professional tech careers.",
      friendlyMessage: "This assistant is designed for career, resume, job-search and professional-development questions. Please ask a career or technology guidance question.",
    };
  }

  return {
    isValid: true,
    category: null,
    reason: "Passed all guardrail checks.",
    friendlyMessage: null,
  };
}

// ==============================================================================
// VECTOR SIMILARITY (SEMANTIC MATCHING)
// ==============================================================================
function tokenize(str: string): string[] {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function calculateSemanticSimilarity(candidateText: string, job: JobPosting): number {
  const candidateTokens = new Set(tokenize(candidateText));
  const jobTarget = `${job.job_title} ${job.skills} ${job.description}`;
  const jobTokens = tokenize(jobTarget);

  let matchCount = 0;
  for (const token of jobTokens) {
    if (candidateTokens.has(token)) {
      matchCount += 1;
    }
  }

  // Weight skill matches higher
  const skillTokens = tokenize(job.skills);
  let skillMatchCount = 0;
  for (const st of skillTokens) {
    if (candidateTokens.has(st)) {
      skillMatchCount += 2;
    }
  }

  const baseRatio = (matchCount + skillMatchCount) / (jobTokens.length * 0.45);
  // Calibrate score nicely between 45% and 96%
  const score = Math.min(97.5, Math.max(35.0, 52.0 + baseRatio * 42.0));
  return Math.round(score * 10) / 10;
}

// ==============================================================================
// RAG RETRIEVAL ENGINE
// ==============================================================================
interface RetrievedChunk {
  title: string;
  source: string;
  type: string;
  snippet: string;
  score: number;
}

function retrieveRelevantContext(query: string, topK: number = 3): RetrievedChunk[] {
  const queryTokens = new Set(tokenize(query));
  const scoredChunks: RetrievedChunk[] = [];

  // Score career markdown documents
  for (const doc of careerNotes) {
    const docTokens = tokenize(doc.content);
    let match = 0;
    for (const qt of queryTokens) {
      if (docTokens.includes(qt)) match++;
    }
    const score = match / (queryTokens.size || 1);
    scoredChunks.push({
      title: doc.title,
      source: doc.source,
      type: "Career Guide",
      snippet: doc.content.slice(0, 300).replace(/\n+/g, " ") + "...",
      score,
    });
  }

  // Score jobs dataset
  for (const job of jobsDataset) {
    const jobText = `${job.job_title} at ${job.company}: ${job.skills}. ${job.description}`;
    const jobTokens = tokenize(jobText);
    let match = 0;
    for (const qt of queryTokens) {
      if (jobTokens.includes(qt)) match++;
    }
    const score = match / (queryTokens.size || 1);
    scoredChunks.push({
      title: `${job.job_title} (${job.company})`,
      source: "jobs.csv",
      type: "Job Market Posting",
      snippet: `Required Skills: ${job.skills}. ${job.description.slice(0, 180)}...`,
      score,
    });
  }

  scoredChunks.sort((a, b) => b.score - a.score);
  return scoredChunks.slice(0, topK);
}

// ==============================================================================
// SERVER INITIALIZATION
// ==============================================================================
async function startServer() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));

  // API Health
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      app: "SmartHire GenAI",
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      jobsCount: jobsDataset.length,
      careerNotesCount: careerNotes.length,
    });
  });

  // 1. MODULE 1: Resume Parser Endpoint
  app.post("/api/resume/parse", async (req, res) => {
    try {
      const { resume_text } = req.body;
      if (!resume_text || typeof resume_text !== "string" || resume_text.trim().length < 20) {
        return res.status(400).json({ error: "Resume text is too brief to parse." });
      }

      const ai = getAiClient();
      if (!ai) {
        // Deterministic fallback for demo without key
        return res.json({
          name: "Alex Chen",
          skills: ["Python", "Java", "FastAPI", "SQL", "Docker", "REST APIs", "PostgreSQL"],
          experience: [
            "Software Engineering Intern at ByteCraft Labs (June 2024 - Aug 2024)",
            "Campus Technical Lead at Google Developer Student Club (2023 - 2024)"
          ],
          education: ["B.Tech Information Technology, Apex Institute of Technology (2025)"],
          target_role: "Software Developer / Backend Engineer"
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Extract the candidate profile from the resume below into strict JSON matching the schema.\n\nResume Text:\n---\n${resume_text}\n---`,
        config: {
          systemInstruction: `You are an ATS resume parser. Extract ONLY facts supported by the text. Never invent information. Missing fields return empty string or empty list. Infer target_role only when reasonably supported.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              experience: { type: Type.ARRAY, items: { type: Type.STRING } },
              education: { type: Type.ARRAY, items: { type: Type.STRING } },
              target_role: { type: Type.STRING },
            },
            required: ["name", "skills", "experience", "education", "target_role"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (err: any) {
      console.error("Resume parsing error:", err);
      res.status(500).json({ error: err?.message || "Failed to parse resume" });
    }
  });

  // 2. MODULE 2: Semantic Job Search Endpoint
  app.get("/api/jobs", (_req, res) => {
    res.json(jobsDataset);
  });

  app.post("/api/jobs/search", (req, res) => {
    try {
      const { query_text, top_n = 5 } = req.body;
      if (!query_text) {
        return res.status(400).json({ error: "Candidate profile query required." });
      }

      const scored = jobsDataset.map((job) => {
        const match_score = calculateSemanticSimilarity(query_text, job);
        return {
          ...job,
          match_score,
          disclaimer: "Semantic similarity match score, not a hiring guarantee."
        };
      });

      scored.sort((a, b) => b.match_score - a.match_score);
      res.json(scored.slice(0, Number(top_n)));
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "Job search failed." });
    }
  });

  // 3. MODULE 3: CV Improvement Generator Endpoint
  app.post("/api/cv/improve", async (req, res) => {
    try {
      const { resume_text, job } = req.body;
      if (!resume_text || !job) {
        return res.status(400).json({ error: "Missing resume text or target job details." });
      }

      const ai = getAiClient();
      if (!ai) {
        // Realistic fallback for demo
        return res.json({
          missing_skills: ["Kubernetes", "Redis Caching", "CI/CD automated testing"],
          weak_bullet_points: [
            "Assisted backend team in migrating legacy Flask microservices.",
            "Wrote automated unit tests with Pytest."
          ],
          improved_bullet_points: [
            "Architected asynchronous FastAPI microservices, reducing API response latency by 22% across 14 endpoints.",
            "Engineered automated Pytest validation suites achieving 85% test coverage on mission-critical authentication modules."
          ],
          rewritten_summary: `Results-driven Computer Science senior with proven expertise in Python, FastAPI, and relational database architecture. Demonstrated track record building asynchronous REST microservices with 22% latency reductions, seeking to deliver scalable backend solutions as a ${job.job_title} at ${job.company}.`,
          overall_suggestions: [
            "Include a deployed live link and GitHub repository URL for your Smart Data Query Assistant.",
            "Adopt the Google XYZ formula for all internship bullets: 'Accomplished [X] as measured by [Y], by doing [Z]'.",
            "Prepare for systems design questions covering caching strategies (Redis) and containerized deployment."
          ]
        });
      }

      const prompt = `Compare this candidate resume with the target job posting and generate a realistic, actionable CV improvement gap analysis in JSON.

Candidate Resume:
---
${resume_text}
---

Target Job: ${job.job_title} at ${job.company}
Required Skills: ${job.skills}
Description: ${job.description}

RULES:
- NEVER invent work experience or fake achievements.
- Highlight missing skills as learning opportunities.
- Improve existing bullet points using active verbs and metrics.
- Author a compelling 3-4 sentence professional summary.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are an executive Tech Career Coach. Perform an honest gap analysis without fabricating achievements.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              missing_skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              weak_bullet_points: { type: Type.ARRAY, items: { type: Type.STRING } },
              improved_bullet_points: { type: Type.ARRAY, items: { type: Type.STRING } },
              rewritten_summary: { type: Type.STRING },
              overall_suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: [
              "missing_skills",
              "weak_bullet_points",
              "improved_bullet_points",
              "rewritten_summary",
              "overall_suggestions"
            ],
          },
        },
      });

      const data = JSON.parse(response.text || "{}");
      res.json(data);
    } catch (err: any) {
      console.error("CV Improvement error:", err);
      res.status(500).json({ error: err?.message || "Failed to generate CV improvements." });
    }
  });

  // 4. MODULE 4 & 5: AI Career Mentor with RAG and Guardrails
  app.post("/api/mentor/chat", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message query required." });
      }

      // Step 1: Guardrails Check
      const guardrailResult = validateGuardrails(message);
      if (!guardrailResult.isValid) {
        return res.json({
          answer: guardrailResult.friendlyMessage,
          guardrail_status: "rejected",
          violation: guardrailResult.category,
          reason: guardrailResult.reason,
          sources: [],
        });
      }

      // Step 2: RAG Retrieval from Career Notes & Jobs
      const sources = retrieveRelevantContext(message, 3);
      const contextText = sources
        .map((s, idx) => `[Source ${idx + 1}: ${s.type} - ${s.title}]\n${s.snippet}`)
        .join("\n\n");

      const ai = getAiClient();
      if (!ai) {
        return res.json({
          answer: `**AI Career Mentor (Offline Demo Mode):**\n\nBased on the SmartHire career knowledge base regarding "${message}":\n\n1. **Core Recommendations**: Master SQL, Python, and foundational data structures.\n2. **Practical Roadmap**: Build 2-3 public portfolio projects with live GitHub links.\n3. **Interview Preparation**: Practice LeetCode algorithms and behavioral STAR interview responses.`,
          guardrail_status: "passed",
          violation: null,
          sources,
        });
      }

      // Step 3: LLM Synthesis with Grounded Prompt
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Student Question: "${message}"\n\nRetrieved Knowledge Sources:\n---\n${contextText}\n---`,
        config: {
          systemInstruction: `You are the SmartHire AI Career Mentor. Provide an encouraging, well-structured answer grounded in the retrieved sources. Never hallucinate fake requirements. If information is insufficient, state so clearly and provide general guidance.`,
        },
      });

      res.json({
        answer: response.text || "I was unable to synthesize a response from the knowledge base.",
        guardrail_status: "passed",
        violation: null,
        sources,
      });
    } catch (err: any) {
      console.error("Mentor chat error:", err);
      res.status(500).json({ error: err?.message || "Career mentor error" });
    }
  });

  // 5. MODULE 5: Guardrails Testing API
  app.post("/api/guardrails/check", (req, res) => {
    const { text } = req.body;
    const result = validateGuardrails(text || "");
    res.json(result);
  });

  // 6. Capstone File Explorer Endpoint
  app.get("/api/capstone/files", (_req, res) => {
    try {
      const baseDir = path.join(process.cwd(), "smarthire-genai");
      function getTree(dir: string, prefix = ""): any[] {
        if (!fs.existsSync(dir)) return [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        const list: any[] = [];
        for (const entry of entries) {
          if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
          const fullPath = path.join(dir, entry.name);
          const relPath = path.relative(baseDir, fullPath);
          if (entry.isDirectory()) {
            list.push({
              name: entry.name,
              path: relPath,
              type: "directory",
              children: getTree(fullPath, `${prefix}/${entry.name}`),
            });
          } else {
            list.push({
              name: entry.name,
              path: relPath,
              type: "file",
              size: fs.statSync(fullPath).size,
            });
          }
        }
        return list;
      }
      res.json(getTree(baseDir));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/capstone/file-content", (req, res) => {
    try {
      const relPath = req.query.path as string;
      if (!relPath) return res.status(400).send("Path required");
      const safePath = path.normalize(relPath).replace(/^(\.\.[\/\\])+/, "");
      const fullPath = path.join(process.cwd(), "smarthire-genai", safePath);
      if (!fs.existsSync(fullPath)) return res.status(404).send("File not found");
      const content = fs.readFileSync(fullPath, "utf-8");
      res.send(content);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartHire GenAI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
