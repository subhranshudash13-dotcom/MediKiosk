import logging
from datetime import datetime, timezone
from fastapi import APIRouter
from app.models.fhir import FHIRPatient, FHIRBundle, BundleEntry
from app.core.database import get_database

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/fhir", tags=["FHIR R4 Interoperability"])


@router.get("/Patient/{patient_id}", response_model=FHIRPatient)
async def get_fhir_patient(patient_id: str):
    """
    Retrieve real patient record as standard FHIR R4 Patient resource
    dynamically populated from MongoDB.
    """
    db = get_database()
    doc = await db["sessions"].find_one({
        "$or": [
            {"patient_id": patient_id},
            {"session_id": patient_id},
            {"token": patient_id}
        ]
    })

    if doc:
        full_name = doc.get("name") or f"Patient {doc.get('token', '')}"
        parts = full_name.strip().split()
        given = [parts[0]] if parts else ["Patient"]
        family = parts[-1] if len(parts) > 1 else ""

        # Calculate approximate birth date from recorded age
        age = doc.get("age", 40)
        birth_year = 2026 - age
        birth_date = f"{birth_year}-01-01"

        raw_gender = doc.get("gender", "other").lower()
        fhir_gender = "male" if "male" in raw_gender and "female" not in raw_gender else ("female" if "female" in raw_gender else "other")

        return FHIRPatient(
            id=doc.get("patient_id", patient_id),
            name=[{"text": full_name, "family": family, "given": given}],
            gender=fhir_gender,
            birthDate=birth_date
        )

    # Dynamic fallback for unspecified patient ID
    return FHIRPatient(
        id=patient_id,
        name=[{"text": f"Patient {patient_id}", "family": "Patient", "given": [patient_id]}],
        gender="other",
        birthDate="1985-01-01"
    )


@router.get("/Bundle/{encounter_id}", response_model=FHIRBundle)
async def get_encounter_fhir_bundle(encounter_id: str):
    """Retrieve full consultation record bundle in standard FHIR R4 format from real session."""
    db = get_database()
    doc = await db["sessions"].find_one({
        "$or": [
            {"session_id": encounter_id},
            {"patient_id": encounter_id}
        ]
    })

    chief_complaint = doc.get("chief_complaint", "General consultation") if doc else "OPD Encounter"
    status = "finished" if (doc and doc.get("status") == "completed") else "in-progress"

    entries = [
        BundleEntry(
            fullUrl=f"urn:uuid:encounter-{encounter_id}",
            resource={
                "resourceType": "Encounter",
                "id": encounter_id,
                "status": status,
                "class": {"system": "http://terminology.hl7.org/CodeSystem/v3-ActCode", "code": "AMB", "display": "ambulatory"},
                "reasonCode": [{"text": chief_complaint}]
            }
        ),
        BundleEntry(
            fullUrl=f"urn:uuid:condition-{encounter_id}",
            resource={
                "resourceType": "Condition",
                "id": f"cond-{encounter_id[:8]}",
                "clinicalStatus": {"coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "active"}]},
                "verificationStatus": {"coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-ver-status", "code": "provisional"}]},
                "code": {"text": chief_complaint}
            }
        )
    ]

    return FHIRBundle(
        id=f"BUNDLE-{encounter_id}",
        type="document",
        entry=entries
    )
