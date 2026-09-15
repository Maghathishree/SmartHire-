"""
CV Improvement Generator module.
Compares a candidate resume against a target job description to generate actionable, honest improvement suggestions.
"""
import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from src.config import GEMINI_API_KEY, GEMINI_MODEL
from src.parsing.resume_parser import clean_json_response
from src.generate.prompts import CV_IMPROVEMENT_SYSTEM_PROMPT, CV_IMPROVEMENT_USER_PROMPT


class CVSuggestionsResponse(BaseModel):
    """
    Validated CV Improvement output structure.
    """
    missing_skills: List[str] = Field(default_factory=list, description="Skills present in job description but missing in resume")
    weak_bullet_points: List[str] = Field(default_factory=list, description="Passive or unquantified bullet points from resume")
    improved_bullet_points: List[str] = Field(default_factory=list, description="Active, metric-driven rewrites grounded in real work")
    rewritten_summary: str = Field(default="", description="Tailored professional summary for target job")
    overall_suggestions: List[str] = Field(default_factory=list, description="Holistic, practical career & resume enhancements")


def generate_cv_suggestions(
    resume_text: str,
    job_details: Dict[str, Any],
    api_key: Optional[str] = None
) -> CVSuggestionsResponse:
    """
    Compares candidate resume with selected job posting to yield structured CV improvements.
    """
    key = api_key or GEMINI_API_KEY
    if not key:
        raise ValueError("GEMINI_API_KEY is not configured.")

    if not resume_text or len(resume_text.strip()) < 30:
        raise ValueError("Resume text is too brief to perform meaningful gap analysis.")

    job_title = job_details.get("job_title", "Software Developer")
    company = job_details.get("company", "Target Company")
    required_skills = job_details.get("skills", "")
    job_description = job_details.get("description", "")

    user_prompt = CV_IMPROVEMENT_USER_PROMPT.format(
        resume_text=resume_text,
        job_title=job_title,
        company=company,
        required_skills=required_skills,
        job_description=job_description
    )

    try:
        import google.generativeai as genai
        genai.configure(api_key=key)

        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            system_instruction=CV_IMPROVEMENT_SYSTEM_PROMPT,
            generation_config={
                "temperature": 0.2,  # Structured, factual recommendations
                "response_mime_type": "application/json",
            },
        )

        response = model.generate_content(user_prompt)
        raw_text = response.text or "{}"
        cleaned = clean_json_response(raw_text)
        data = json.loads(cleaned)

        return CVSuggestionsResponse(**data)

    except json.JSONDecodeError as err:
        raise ValueError(f"Failed to parse CV suggestion JSON: {str(err)}") from err
    except Exception as e:
        raise RuntimeError(f"Error generating CV improvement suggestions: {str(e)}") from e
