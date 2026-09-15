"""
Resume Parser using Google Gemini LLM and Structured Output Validation.
Extracts candidate profile with strict grounding (no hallucinations).
"""
import json
import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, field_validator

from src.config import GEMINI_API_KEY, GEMINI_MODEL, check_api_key
from src.generate.prompts import RESUME_PARSER_SYSTEM_PROMPT, RESUME_PARSER_USER_PROMPT


class CandidateProfile(BaseModel):
    """
    Validated candidate profile structure matching module requirements.
    """
    name: str = Field(default="", description="Candidate full name")
    skills: List[str] = Field(default_factory=list, description="List of technical and domain skills")
    experience: List[str] = Field(default_factory=list, description="List of jobs, internships, practical experience")
    education: List[str] = Field(default_factory=list, description="List of degrees, institutions, and years")
    target_role: str = Field(default="", description="Inferred target professional role supported by resume")

    @field_validator("skills", "experience", "education", mode="before")
    @classmethod
    def ensure_list(cls, value):
        if value is None:
            return []
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        return []

    @field_validator("name", "target_role", mode="before")
    @classmethod
    def ensure_string(cls, value):
        if value is None:
            return ""
        return str(value).strip()

    def to_candidate_text(self) -> str:
        """
        Synthesizes a dense text representation of the profile for embedding and vector matching.
        """
        parts = []
        if self.target_role:
            parts.append(f"Target Role: {self.target_role}")
        if self.skills:
            parts.append(f"Skills: {', '.join(self.skills)}")
        if self.experience:
            parts.append(f"Experience: {' | '.join(self.experience)}")
        if self.education:
            parts.append(f"Education: {' | '.join(self.education)}")
        return "\n".join(parts)


def clean_json_response(raw_text: str) -> str:
    """
    Strips markdown code blocks, backticks, and extraneous preamble to isolate pure JSON.
    """
    text = raw_text.strip()
    # Match ```json ... ``` or ``` ... ```
    pattern = r"```(?:json)?\s*([\s\S]*?)\s*```"
    match = re.search(pattern, text)
    if match:
        text = match.group(1).strip()
    # Find outer curly braces
    first_brace = text.find("{")
    last_brace = text.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        text = text[first_brace : last_brace + 1]
    return text


def parse_resume_to_json(resume_text: str, api_key: Optional[str] = None) -> CandidateProfile:
    """
    Sends extracted resume text to Gemini LLM and returns a validated CandidateProfile.
    """
    key = api_key or GEMINI_API_KEY
    if not key:
        raise ValueError("GEMINI_API_KEY is not configured. Please set it in your .env file or Streamlit settings.")

    if not resume_text or len(resume_text.strip()) < 40:
        raise ValueError("Resume text is empty or too short to parse meaningfully.")

    # Format prompts
    user_content = RESUME_PARSER_USER_PROMPT.format(resume_text=resume_text)

    try:
        import google.generativeai as genai
        genai.configure(api_key=key)

        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            system_instruction=RESUME_PARSER_SYSTEM_PROMPT,
            generation_config={
                "temperature": 0.1,  # Low temperature for factual precision
                "response_mime_type": "application/json",
            },
        )

        response = model.generate_content(user_content)
        raw_text = response.text or ""
        cleaned_json = clean_json_response(raw_text)
        data = json.loads(cleaned_json)

        # Validate with Pydantic
        profile = CandidateProfile(**data)
        return profile

    except json.JSONDecodeError as json_err:
        raise ValueError(f"Failed to decode JSON from LLM output: {str(json_err)}") from json_err
    except Exception as e:
        raise RuntimeError(f"Error calling Gemini LLM for resume parsing: {str(e)}") from e
