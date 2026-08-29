from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


class AbhaKYC(BaseModel):
    abha_id: str  # e.g., "12-3456-7890-1234"
    abha_address: str  # e.g., "patient@abdm"
    name: str
    gender: str
    dob: Optional[str] = None
    mobile: Optional[str] = None
    auth_status: str = "verified"  # "pending" | "verified" | "failed"


class ConsentArtifact(BaseModel):
    consent_id: str
    patient_id: str
    purpose: str = "CAREGIV"  # Care Management
    hi_types: List[str] = ["Prescription", "DiagnosticReport", "OPConsultation", "DischargeSummary"]
    granted_at: datetime
    expires_at: datetime
    is_revoked: bool = False


class CareContext(BaseModel):
    patient_reference: str
    care_context_reference: str  # Encounter ID / OPD Token
    display: str
