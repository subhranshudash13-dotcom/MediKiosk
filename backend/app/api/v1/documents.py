import logging
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, UploadFile, File, Form, Query, HTTPException

from app.models.documents import (
    MedicalDocument,
    TimelineEvent,
    LongitudinalTimelineResponse,
)
from app.services.documents.ocr import ocr_service
from app.services.documents.timeline_service import timeline_service
from app.services.documents.clinical_reference_ranges import REFERENCE_RANGES_DB

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["Document AI & Historical Timeline"])


@router.post("/upload", response_model=MedicalDocument)
async def upload_medical_document(
    file: UploadFile = File(...),
    patient_id: str = Form(default="P-DEMO-001"),
    auto_sync_timeline: bool = Form(default=True)
):
    """
    Upload a medical prescription, lab report, or discharge summary for OCR + NER extraction.
    Automatically evaluates lab values against clinical reference ranges and syncs to patient timeline.
    """
    try:
        content = await file.read()
        filename = file.filename or "medical_document.jpg"
        doc = await ocr_service.process_document(content, filename=filename, patient_id=patient_id)
        
        if auto_sync_timeline:
            timeline_service.sync_document_to_timeline(doc)
            
        return doc
    except Exception as e:
        logger.error(f"Error processing uploaded document: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")


@router.post("/process-sample", response_model=MedicalDocument)
async def process_sample_document(
    sample_type: str = Query(
        default="prescription",
        description="Sample type: 'prescription', 'diabetic_lab_report', 'renal_panel'"
    ),
    patient_id: str = Query(default="P-DEMO-001")
):
    """
    Demo/evaluation endpoint: Process realistic Indian OPD documents without uploading an image.
    Enables instant testing of OCR, NER, and Timeline pipelines.
    """
    filename_map = {
        "prescription": "prescription_amlodipine_metformin.jpg",
        "diabetic_lab_report": "lab_report_hba1c_glucose.jpg",
        "renal_panel": "lab_report_creatinine_urea.jpg"
    }
    sample_filename = filename_map.get(sample_type, "prescription_amlodipine.jpg")
    dummy_bytes = b"SAMPLE_CLINICAL_DOCUMENT_BYTES"
    
    doc = await ocr_service.process_document(dummy_bytes, filename=sample_filename, patient_id=patient_id)
    timeline_service.sync_document_to_timeline(doc)
    return doc


@router.get("/timeline/{patient_id}", response_model=LongitudinalTimelineResponse)
async def get_patient_timeline(patient_id: str = "P-DEMO-001"):
    """
    Retrieve a patient's complete longitudinal care timeline sorted chronologically,
    including consolidated active medications and critical lab alerts.
    """
    return timeline_service.get_longitudinal_timeline(patient_id)


@router.post("/timeline/{patient_id}/sync", response_model=TimelineEvent)
async def sync_document_to_timeline(patient_id: str, document: MedicalDocument):
    """Sync an existing structured MedicalDocument directly into a patient's timeline."""
    document.patient_id = patient_id
    return timeline_service.sync_document_to_timeline(document)


@router.get("/reference-ranges", response_model=Dict[str, Any])
async def get_clinical_reference_ranges():
    """Retrieve the standard clinical reference ranges used for lab value evaluation."""
    return REFERENCE_RANGES_DB
