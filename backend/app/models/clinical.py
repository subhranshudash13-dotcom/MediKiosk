from datetime import date, datetime
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


class EvidenceLink(BaseModel):
    """Direct evidence linkage pointing to original source document or audio transcript."""
    id: str
    timeframe: Optional[str] = "Today"
    title: str
    detail: Optional[str] = None
    source_type: str = "VOICE"  # "VOICE" | "DOCUMENT" | "LAB" | "CAREGIVER" | "ABDM"
    source_badge: Optional[str] = None
    source_snippet: Optional[str] = None
    timestamp: Optional[str] = None
    verified: bool = True
    metadata: Optional[Dict[str, Any]] = None


class CompletenessScorecard(BaseModel):
    """Clinical completeness engine score and checklist."""
    score_percentage: int = Field(0, ge=0, le=100)
    covered_dimensions: Dict[str, bool] = {
        "chief_complaint": False,
        "onset": False,
        "duration": False,
        "location": False,
        "character": False,
        "severity": False,
        "associated_symptoms": False,
        "medication_history": False,
        "allergy_history": False,
        "family_history": False
    }
    missing_critical_dimensions: List[str] = []
    adaptive_followup_prompt: Optional[str] = None


class DoctorProfile(BaseModel):
    doctor_id: str
    name: str
    specialization: str
    qualification: Optional[str] = "MBBS, MD"
    registration_number: Optional[str] = "MCI-2018-7749"
    opd_schedule: str = "09:00 AM - 01:00 PM"
    room_number: str = "Room 102"
    is_available: bool = True


class HospitalDepartment(BaseModel):
    department_id: str
    department_name: str
    description: Optional[str] = None
    floor: Optional[str] = "1st Floor, OPD Block"
    doctors: List[DoctorProfile] = []


class CareRoutingRecommendation(BaseModel):
    """Department and care routing recommendation based on complaints."""
    suggested_department: str
    department_id: str
    clinical_rationale: str
    urgency_level: str = "ROUTINE"  # "EMERGENCY" | "URGENT" | "ROUTINE"
    recommended_action: Optional[str] = None
    available_doctors: List[DoctorProfile] = []
    is_emergency_diversion: bool = False


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
    evidence_links: List[EvidenceLink] = []
    completeness: Optional[CompletenessScorecard] = None
    routing: Optional[CareRoutingRecommendation] = None
    physician_notes: Optional[str] = None
    is_confirmed_by_doctor: bool = False


class Encounter(BaseModel):
    """Immutable Longitudinal Encounter Record."""
    encounter_id: str
    patient_id: str
    patient_name: str
    age: int
    gender: str
    abha_id: Optional[str] = None
    token: Optional[str] = None
    hospital_id: str = "HOSP-APEX-01"
    hospital_name: str = "Apex Multi-Speciality Hospital"
    department: str = "General Medicine"
    doctor_name: Optional[str] = None
    doctor_registration: Optional[str] = None
    encounter_date: str = Field(default_factory=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    
    # Clinical Data
    chief_complaint: str
    hpi: Optional[str] = None
    socrates: Optional[SOCRATESHistory] = None
    ayush: Optional[AyushAssessment] = None
    vitals: Optional[Dict[str, Any]] = None
    past_history: List[str] = []
    current_medications: List[Dict[str, Any]] = []
    allergies: List[str] = []
    documents: List[Dict[str, Any]] = []
    ocr_results: Optional[Dict[str, Any]] = None
    evidence_timeline: List[Dict[str, Any]] = []
    completeness_score: int = 85
    red_flags: List[str] = []
    
    # Consultation & Outcomes
    provisional_diagnosis: Optional[str] = None
    clinical_notes: Optional[str] = None
    prescribed_medications: List[Dict[str, Any]] = []
    follow_up_recommendation: Optional[str] = None
    status: str = "completed"  # "ready_for_doctor" | "in_consultation" | "completed"
    is_abdm_synced: bool = True

