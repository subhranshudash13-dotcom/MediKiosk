from fastapi import APIRouter
from app.models.fhir import FHIRPatient, FHIRBundle, BundleEntry

router = APIRouter(prefix="/fhir", tags=["FHIR R4 Interoperability"])


@router.get("/Patient/{patient_id}", response_model=FHIRPatient)
async def get_fhir_patient(patient_id: str):
    """Retrieve patient record as FHIR R4 Patient."""
    return FHIRPatient(
        id=patient_id,
        name=[{"text": "Ramesh Kumar", "family": "Kumar", "given": ["Ramesh"]}],
        gender="male",
        birthDate="1978-04-12"
    )


@router.get("/Bundle/{encounter_id}", response_model=FHIRBundle)
async def get_encounter_fhir_bundle(encounter_id: str):
    """Retrieve full consultation record bundle in standard FHIR R4 format."""
    return FHIRBundle(
        id=f"BUNDLE-{encounter_id}",
        type="document",
        entry=[
            BundleEntry(
                fullUrl=f"urn:uuid:{encounter_id}",
                resource={"resourceType": "Encounter", "id": encounter_id, "status": "in-progress"}
            )
        ]
    )
