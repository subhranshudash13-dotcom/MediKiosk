from typing import List, Optional
from pydantic import BaseModel


class Reference(BaseModel):
    reference: str
    display: Optional[str] = None


class CodeableConcept(BaseModel):
    text: Optional[str] = None
    coding: Optional[List[dict]] = []


class Period(BaseModel):
    start: Optional[str] = None
    end: Optional[str] = None


class FHIREncounter(BaseModel):
    resourceType: str = "Encounter"
    id: Optional[str] = None
    status: str = "in-progress"  # "planned" | "arrived" | "triaged" | "in-progress" | "finished"
    class_: dict = {"system": "http://terminology.hl7.org/CodeSystem/v3-ActCode", "code": "AMB", "display": "ambulatory"}
    subject: Reference
    period: Optional[Period] = None
    reasonCode: Optional[List[CodeableConcept]] = []
    priority: Optional[CodeableConcept] = None  # triage priority: routine vs emergency red-flag
