from typing import List, Optional
from pydantic import BaseModel, Field


class HumanName(BaseModel):
    use: Optional[str] = "official"
    text: Optional[str] = None
    family: Optional[str] = None
    given: Optional[List[str]] = None


class ContactPoint(BaseModel):
    system: Optional[str] = "phone"
    value: Optional[str] = None
    use: Optional[str] = "mobile"


class Identifier(BaseModel):
    system: Optional[str] = "https://healthid.abdm.gov.in"
    value: str


class Address(BaseModel):
    line: Optional[List[str]] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    postalCode: Optional[str] = None
    country: Optional[str] = "IN"


class FHIRPatient(BaseModel):
    resourceType: str = "Patient"
    id: Optional[str] = None
    identifier: Optional[List[Identifier]] = []
    active: bool = True
    name: Optional[List[HumanName]] = []
    telecom: Optional[List[ContactPoint]] = []
    gender: Optional[str] = None  # "male" | "female" | "other" | "unknown"
    birthDate: Optional[str] = None  # YYYY-MM-DD
    address: Optional[List[Address]] = []
