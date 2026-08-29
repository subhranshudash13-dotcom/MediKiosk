from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class KioskLanguage(BaseModel):
    code: str  # e.g., "hi", "ta", "te", "bn", "mr", "gu", "kn", "or", "pa", "en"
    name: str  # e.g., "हिन्दी", "தமிழ்", "తెలుగు", "English"


class KioskSession(BaseModel):
    session_id: str
    patient_id: Optional[str] = None
    abha_id: Optional[str] = None
    language: str = "hi"
    mode: str = "allopathy"  # "allopathy" | "ayush"
    status: str = "active"  # "active" | "intake_completed" | "triaged" | "consulted"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_emergency: bool = False
    emergency_reason: Optional[str] = None


class TriageAssessment(BaseModel):
    session_id: str
    chief_complaint: str
    urgency_level: str = "routine"  # "emergency" | "urgent" | "routine"
    red_flags: List[str] = []
    department_recommended: str = "General Medicine"
