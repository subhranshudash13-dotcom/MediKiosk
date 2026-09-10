from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field


class RedFlagAlert(BaseModel):
    """Deterministic or AI-detected medical emergency red flag."""
    is_emergency: bool = False
    flag_type: Optional[str] = None  # e.g., "CARDIOVASCULAR_ACUTE", "STROKE", "RESPIRATORY_DISTRESS"
    trigger_text: Optional[str] = None
    recommended_action: Optional[str] = None


class ExtractedSOCRATES(BaseModel):
    """Clinical SOCRATES pain/symptom history elicitation framework."""
    site: Optional[str] = Field(None, description="Exact body site of the symptom/pain (e.g. retrosternal chest, epigastrium)")
    onset: Optional[str] = Field(None, description="Onset character: sudden vs gradual")
    character: Optional[str] = Field(None, description="Quality of symptom: sharp, dull, burning, aching, pressure, etc.")
    radiation: Optional[str] = Field(None, description="Radiation path (e.g. radiating to left arm, jaw, back)")
    associations: List[str] = Field(default_factory=list, description="Associated symptoms (e.g. diaphoresis, vomiting, dyspnea)")
    time_course: Optional[str] = Field(None, description="Duration/pattern (e.g. constant, episodic, 3 days)")
    duration_days: Optional[int] = Field(None, description="Numeric duration in days if specified")
    exacerbating_relieving: Optional[str] = Field(None, description="What worsens or relieves the symptom")
    severity_score: Optional[int] = Field(None, ge=1, le=10, description="Severity from 1 to 10 scale")


class HistoricalCorrelation(BaseModel):
    """Clinical correlation connecting acute presenting symptoms with longitudinal patient medical history."""
    related_past_condition: Optional[str] = None
    correlated_past_condition: Optional[str] = None
    clinical_link: Optional[str] = None
    clinical_rationale: Optional[str] = None
    relevance_note: Optional[str] = None
    significance_level: Optional[str] = "Moderate"
    recommended_physician_focus: Optional[str] = None
    relevance_score: float = Field(default=0.85, ge=0.0, le=1.0)

    def model_post_init(self, __context: Any) -> None:
        if self.related_past_condition and not self.correlated_past_condition:
            self.correlated_past_condition = self.related_past_condition
        elif self.correlated_past_condition and not self.related_past_condition:
            self.related_past_condition = self.correlated_past_condition

        if self.clinical_link and not self.clinical_rationale:
            self.clinical_rationale = self.clinical_link
        elif self.clinical_rationale and not self.clinical_link:
            self.clinical_link = self.clinical_rationale


class ClinicalIntakeState(BaseModel):
    """Live state of the clinical consultation intake."""
    session_id: str
    patient_id: Optional[str] = None
    patient_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    abha_id: Optional[str] = None
    mode: str = "allopathy"  # "allopathy" | "ayush"
    language: str = "hi"  # "hi" | "te" | "en" | "hinglish"
    chief_complaints: List[str] = Field(default_factory=list)
    socrates: ExtractedSOCRATES = Field(default_factory=ExtractedSOCRATES)
    ayush: Optional[Dict[str, Any]] = None  # Prakriti, Vikriti, Agni, Koshtha
    associated_symptoms: List[str] = Field(default_factory=list)
    past_history: List[str] = Field(default_factory=list)
    current_medications: List[str] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)
    historical_correlation: Optional[HistoricalCorrelation] = None
    historical_clues: List[Dict[str, Any]] = Field(default_factory=list)
    red_flags: List[RedFlagAlert] = Field(default_factory=list)
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    is_triage_complete: bool = False
    turn_count: int = 0
    raw_transcripts: List[str] = Field(default_factory=list)
    asked_questions: List[str] = Field(default_factory=list)
    last_target_slot: Optional[str] = None


class ExtractionPayload(BaseModel):
    """Strict JSON payload returned by LLM extraction - missing values MUST be null."""
    chief_complaint: Optional[str] = None
    site: Optional[str] = None
    onset: Optional[str] = None
    character: Optional[str] = None
    radiation: Optional[str] = None
    associated_symptoms: List[str] = Field(default_factory=list)
    duration_days: Optional[int] = None
    time_course: Optional[str] = None
    exacerbating_relieving: Optional[str] = None
    severity_score: Optional[int] = Field(None, ge=1, le=10)
    past_history: List[str] = Field(default_factory=list)
    current_medications: List[str] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)
    historical_correlation: Optional[HistoricalCorrelation] = None
    patient_asked_question: Optional[str] = None
    extraction_confidence: float = Field(default=0.85, ge=0.0, le=1.0)


class DialogueTurnResponse(BaseModel):
    """Unified voice agent turn output."""
    session_id: str
    spoken_response: str = "आपकी तकलीफ़ नोट कर ली गई है।"
    language_code: str = "hi"
    user_transcript: Optional[str] = None
    audio_base64: Optional[str] = None
    audio_url: Optional[str] = None
    clinical_state: ClinicalIntakeState
    red_flag_triggered: bool = False
    is_intake_complete: bool = False
    quick_replies: List[str] = Field(default_factory=list)

