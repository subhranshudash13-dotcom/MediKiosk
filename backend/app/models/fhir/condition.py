from typing import List, Optional
from pydantic import BaseModel
from app.models.fhir.encounter import CodeableConcept, Reference


class FHIRCondition(BaseModel):
    resourceType: str = "Condition"
    id: Optional[str] = None
    clinicalStatus: Optional[CodeableConcept] = None
    verificationStatus: Optional[CodeableConcept] = None
    category: Optional[List[CodeableConcept]] = []
    severity: Optional[CodeableConcept] = None
    code: CodeableConcept
    subject: Reference
    onsetDateTime: Optional[str] = None
    recordedDate: Optional[str] = None
