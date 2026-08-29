from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class SOCRATESHistory(BaseModel):
    """Clinical SOCRATES pain/symptom history elicitation framework."""
    site: Optional[str] = None  # Where is the pain/symptom?
    onset: Optional[str] = None  # Sudden vs gradual onset
    character: Optional[str] = None  # Sharp, dull, burning, aching
    radiation: Optional[str] = None  # Does it radiate anywhere?
    associations: Optional[List[str]] = []  # Nausea, sweating, fever, breathlessness
    time_course: Optional[str] = None  # Constant, episodic, worsening
    exacerbating_relieving: Optional[str] = None  # What makes it worse/better?
    severity_score: Optional[int] = Field(None, ge=1, le=10)  # 1 to 10 scale


class AyushAssessment(BaseModel):
    """Ayurvedic Dashavidha & Ashtavidha Pariksha parameters."""
    prakriti: Optional[str] = None  # Vata, Pitta, Kapha, Dwandwaja
    vikriti: Optional[str] = None  # Current dosha imbalance
    agni: Optional[str] = None  # Mandagni, Tikshnagni, Vishamagni, Samagni
    koshtha: Optional[str] = None  # Krura, Mridu, Madhyama
    ahara_vihara: Optional[str] = None  # Diet and lifestyle patterns
    nidana: Optional[str] = None  # Causative factors


class ClinicalSummary(BaseModel):
    """Physician-ready structured clinical summary."""
    patient_id: str
    encounter_id: str
    chief_complaint: str
    hpi: str  # History of present illness
    socrates: Optional[SOCRATESHistory] = None
    ayush: Optional[AyushAssessment] = None
    past_medical_history: List[str] = []
    medications_current: List[str] = []
    allergies: List[str] = []
    family_history: List[str] = []
    personal_history: List[str] = []
    review_of_systems: Dict[str, Any] = {}
    red_flags: List[str] = []
    abnormal_lab_alerts: List[str] = []
    physician_notes: Optional[str] = None
    is_confirmed_by_doctor: bool = False
