from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import date, datetime, timezone
from enum import Enum


class SeverityLevel(str, Enum):
    NORMAL = "NORMAL"
    BORDERLINE = "BORDERLINE"
    ELEVATED = "ELEVATED"
    CRITICAL_HIGH = "CRITICAL_HIGH"
    CRITICAL_LOW = "CRITICAL_LOW"


class DocumentType(str, Enum):
    PRESCRIPTION = "prescription"
    LAB_REPORT = "lab_report"
    DISCHARGE_SUMMARY = "discharge_summary"
    IMAGING_REPORT = "imaging_report"
    OTHER = "other"


class ExtractedMedication(BaseModel):
    name: str
    dosage: Optional[str] = None  # e.g., "500 mg", "5 mg"
    frequency: Optional[str] = None  # e.g., "1-0-1", "OD", "BD", "TDS", "SOS"
    route: Optional[str] = "oral"  # e.g., "oral", "topical", "IV", "subcutaneous"
    duration: Optional[str] = None  # e.g., "5 days", "1 month"
    indication: Optional[str] = None  # e.g., "Hypertension", "Type 2 Diabetes"
    therapeutic_class: Optional[str] = None  # e.g., "Calcium Channel Blocker", "Biguanide"
    clinical_purpose: Optional[str] = None  # "What this drug is exactly for in this patient"
    instructions: Optional[str] = None  # e.g., "Post-meals", "Before breakfast"
    confidence: Optional[float] = Field(default=95.0, description="OCR/NER confidence percentage 0-100")


class ExtractedLabResult(BaseModel):
    test_name: str
    value: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    is_abnormal: bool = False
    severity_flag: SeverityLevel = SeverityLevel.NORMAL
    clinical_purpose: Optional[str] = None  # "What clinical condition/organ function this test investigates"
    clinical_significance: Optional[str] = None


class ExtractedDiagnosis(BaseModel):
    condition: str
    icd10_code: Optional[str] = None
    condition_type: Optional[str] = "provisional"  # "chronic", "acute", "provisional"
    notes: Optional[str] = None


class ExtractedVital(BaseModel):
    vital_name: str  # e.g., "Blood Pressure", "Pulse", "SpO2", "Temperature"
    value: str
    unit: Optional[str] = None
    is_abnormal: bool = False


class MedicalDocument(BaseModel):
    document_id: str
    patient_id: str = "P-DEMO-001"
    user_id: Optional[str] = None
    patient_name: Optional[str] = None
    document_type: DocumentType = DocumentType.PRESCRIPTION
    document_date: Optional[date] = None
    raw_ocr_text: Optional[str] = None
    confidence_score: Optional[float] = 95.0
    document_purpose: Optional[str] = None  # e.g., "Post-Myocardial Infarction Secondary Prevention & Hypertension Titration"
    clinical_intent: Optional[str] = None  # "Comprehensive explanation of what this document is for and why tests/drugs were ordered"
    physician_action_plan: Optional[str] = None  # Recommended clinical actions/alerts for the doctor
    doctor_name: Optional[str] = None
    facility_name: Optional[str] = None
    extracted_diagnoses: List[ExtractedDiagnosis] = []
    extracted_medications: List[ExtractedMedication] = []
    extracted_labs: List[ExtractedLabResult] = []
    extracted_vitals: List[ExtractedVital] = []
    file_path: Optional[str] = None
    is_abdm_linked: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TimelineEvent(BaseModel):
    event_id: str
    patient_id: str
    user_id: Optional[str] = None
    date: date
    document_type: DocumentType
    title: str
    provider_name: Optional[str] = None
    facility_name: Optional[str] = None
    summary: str
    medications: List[ExtractedMedication] = []
    abnormal_labs: List[ExtractedLabResult] = []
    diagnoses: List[str] = []
    is_abdm_verified: bool = True
    raw_document_id: Optional[str] = None


class LongitudinalTimelineResponse(BaseModel):
    patient_id: str
    total_records: int
    timeline: List[TimelineEvent]
    active_medications_summary: List[ExtractedMedication]
    critical_lab_alerts: List[str]
    abnormal_labs_summary: List[ExtractedLabResult]
