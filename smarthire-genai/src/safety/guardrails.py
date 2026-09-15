"""
SmartHire GenAI — Input Guardrails Layer.
Enforces safety, input length, prompt injection defense, secret extraction defense,
and career-domain topical adherence.
"""
import re
from typing import Optional
from pydantic import BaseModel, Field

# Maximum character limit for conversational inputs
MAX_INPUT_LENGTH = 2500
MIN_INPUT_LENGTH = 3

# Permitted domain keywords (flexible so as not to be overly restrictive)
CAREER_KEYWORDS = [
    "career", "job", "resume", "cv", "interview", "skill", "learn", "roadmap",
    "hire", "hiring", "salary", "portfolio", "internship", "developer", "engineer",
    "analyst", "scientist", "python", "sql", "react", "cloud", "devops", "education",
    "college", "degree", "capstone", "project", "work", "tech", "company", "application",
    "cover letter", "linkedin", "experience", "role", "promotion", "switch", "certificat",
    "coding", "programming", "software", "machine learning", "ai", "data", "web"
]

# Patterns attempting to exfiltrate secrets, system prompts, or environment
SECRET_EXTRACTION_PATTERNS = [
    r"(?i)\b(reveal|show|print|output|display|leak|give me|what is)\b.*?\b(api[_\s]?key|secret|token|password|credential|env|environ)\b",
    r"(?i)\b(system[_\s]?prompt|initial[_\s]?instructions|hidden[_\s]?instructions|developer[_\s]?mode)\b",
    r"(?i)\bos\.environ\b",
    r"(?i)\bprocess\.env\b",
]

# Prompt injection and jailbreak signatures
PROMPT_INJECTION_PATTERNS = [
    r"(?i)\bignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules|commands)\b",
    r"(?i)\bdisregard\s+(the\s+)?(instructions|system|rules)\b",
    r"(?i)\byou\s+are\s+now\s+(in\s+)?(dan|developer\s+mode|unrestricted|god\s+mode)\b",
    r"(?i)\bforget\s+(everything|all\s+rules|system\s+directives)\b",
    r"(?i)\bjailbreak\b",
    r"(?i)\bact\s+as\s+(an?\s+)?unfiltered\b",
]

# Clearly off-topic signatures (e.g. baking, sports betting, video game cheats)
OFF_TOPIC_PATTERNS = [
    r"(?i)\b(recipe|bake|cake|cookies|dinner|ingredients|cook\s+pasta)\b",
    r"(?i)\b(horoscope|astrology|zodiac|tarot)\b",
    r"(?i)\b(minecraft|fortnite|gta|cheat\s+codes|video\s+game\s+hack)\b",
    r"(?i)\b(sports\s+betting|roulette|casino|gambling)\b",
]

# Harmful and unsafe keywords
UNSAFE_PATTERNS = [
    r"(?i)\b(hack|ddos|exploit|malware|keylogger|ransomware|trojan)\b",
    r"(?i)\b(bomb|weapon|explosive|terrorist|illegal\s+drugs)\b",
    r"(?i)\b(suicide|self-harm|kill)\b",
]


class GuardrailResult(BaseModel):
    """Structured outcome from the guardrails validation layer."""
    is_valid: bool = Field(description="True if input passed all checks")
    violation_category: Optional[str] = Field(default=None, description="Category of violation if failed")
    reason: Optional[str] = Field(default=None, description="Technical rationale for inspection/audit")
    friendly_message: Optional[str] = Field(default=None, description="Polite user-facing rejection message")


def check_api_key_extraction(text: str) -> bool:
    """Checks for attempts to probe or exfiltrate system secrets or keys."""
    return any(re.search(pattern, text) for pattern in SECRET_EXTRACTION_PATTERNS)


def check_prompt_injection(text: str) -> bool:
    """Checks for prompt overrides or jailbreak patterns."""
    return any(re.search(pattern, text) for pattern in PROMPT_INJECTION_PATTERNS)


def check_unsafe_content(text: str) -> bool:
    """Checks for harmful, dangerous, or illegal prompts."""
    return any(re.search(pattern, text) for pattern in UNSAFE_PATTERNS)


def check_off_topic(text: str) -> bool:
    """Detects clearly off-topic requests."""
    # Check explicitly off-topic patterns
    if any(re.search(pattern, text) for pattern in OFF_TOPIC_PATTERNS):
        return True
    
    # If the text is decently long and has ZERO career or tech keywords, flag as off-topic
    words = text.lower().split()
    if len(words) >= 8:
        has_career_kw = any(kw in text.lower() for kw in CAREER_KEYWORDS)
        if not has_career_kw:
            return True
            
    return False


def validate_career_input(query: str) -> GuardrailResult:
    """
    Primary guardrails validator. Runs 8 sequential rule layers before any LLM inference.
    """
    # Rule 1: Reject empty or whitespace-only input
    if not query or not query.strip():
        return GuardrailResult(
            is_valid=False,
            violation_category="empty_input",
            reason="Input is empty or whitespace-only.",
            friendly_message="Please enter a question or topic so the AI Career Mentor can assist you."
        )

    clean_query = query.strip()

    # Rule 2: Reject extremely short nonsensical input
    if len(clean_query) < MIN_INPUT_LENGTH:
        return GuardrailResult(
            is_valid=False,
            violation_category="input_too_short",
            reason=f"Input length ({len(clean_query)}) is below minimum ({MIN_INPUT_LENGTH}).",
            friendly_message="Your question is too short. Please provide a more descriptive career or job question."
        )

    # Rule 3: Reject extremely long input
    if len(clean_query) > MAX_INPUT_LENGTH:
        return GuardrailResult(
            is_valid=False,
            violation_category="input_too_long",
            reason=f"Input length ({len(clean_query)}) exceeds maximum allowed ({MAX_INPUT_LENGTH}).",
            friendly_message="Your question exceeds the maximum length limit. Please condense your question to under 2,500 characters."
        )

    # Rule 4: Secret and System Prompt extraction defense
    if check_api_key_extraction(clean_query):
        return GuardrailResult(
            is_valid=False,
            violation_category="secret_extraction",
            reason="Attempted to access system credentials, API keys, or internal configuration.",
            friendly_message="I cannot disclose internal API keys, system prompts, or configuration parameters. I am here to help you with your career and job search questions!"
        )

    # Rule 5: Prompt injection & jailbreak defense
    if check_prompt_injection(clean_query):
        return GuardrailResult(
            is_valid=False,
            violation_category="prompt_injection",
            reason="Detected prompt injection or system instruction override attempt.",
            friendly_message="This assistant is safeguarded against system overrides. Please ask a constructive question regarding resumes, careers, or tech jobs."
        )

    # Rule 6: Unsafe or illegal content defense
    if check_unsafe_content(clean_query):
        return GuardrailResult(
            is_valid=False,
            violation_category="unsafe_content",
            reason="Detected prohibited safety keywords.",
            friendly_message="This request violates safety policies. The SmartHire mentor only assists with professional career and educational growth."
        )

    # Rule 7: Clearly off-topic detection
    if check_off_topic(clean_query):
        return GuardrailResult(
            is_valid=False,
            violation_category="off_topic",
            reason="Query does not relate to careers, resumes, tech skills, or employment.",
            friendly_message="This assistant is specifically designed for career guidance, resume matching, job search strategies, and tech skill roadmaps. Please ask a career-related question."
        )

    # Passed all guardrails!
    return GuardrailResult(
        is_valid=True,
        violation_category=None,
        reason="Passed all security and scope checks.",
        friendly_message=None
    )
