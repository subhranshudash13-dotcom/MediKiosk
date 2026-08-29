from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import date


class ExtractedMedication(BaseModel):
    name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None  # e.g., "1-0-1", "OD", "BD", "TDS"
    duration: Optional[str] = None


class ExtractedLabResult(BaseModel):
    test_name: str
    value: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    is_abnormal: bool = False


class MedicalDocument(BaseModel):
    document_id: str
    patient_id: str
    document_type: str  # "prescription" | "lab_report" | "discharge_summary" | "imaging"
    document_date: Optional[date] = None
    raw_ocr_text: Optional[str] = None
    confidence_score: Optional[float] = None
    extracted_diagnoses: List[str] = []
    extracted_medications: List[ExtractedMedication] = []
    extracted_labs: List[ExtractedLabResult] = []
    file_path: Optional[str] = None
