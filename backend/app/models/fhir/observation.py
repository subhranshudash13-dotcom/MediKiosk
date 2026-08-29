from typing import List, Optional, Union
from pydantic import BaseModel
from app.models.fhir.encounter import CodeableConcept, Reference


class Quantity(BaseModel):
    value: float
    unit: str
    system: Optional[str] = "http://unitsofmeasure.org"
    code: Optional[str] = None


class FHIRObservation(BaseModel):
    resourceType: str = "Observation"
    id: Optional[str] = None
    status: str = "final"
    category: Optional[List[CodeableConcept]] = []
    code: CodeableConcept
    subject: Reference
    effectiveDateTime: Optional[str] = None
    valueQuantity: Optional[Quantity] = None
    valueString: Optional[str] = None
    interpretation: Optional[List[CodeableConcept]] = []
