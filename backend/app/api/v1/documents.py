import logging
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, UploadFile, File, Form, Query, HTTPException, Depends

from app.models.documents import (
    MedicalDocument,
    TimelineEvent,
    LongitudinalTimelineResponse,
)
from app.services.documents.ocr import ocr_service
from app.services.documents.timeline_service import timeline_service
from app.services.documents.clinical_reference_ranges import REFERENCE_RANGES_DB
from app.services.auth.dependencies import get_optional_current_user
from app.models.auth import UserContext

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["Document AI & Historical Timeline"])


ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
    "application/pdf",
}
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB


@router.post("/upload", response_model=MedicalDocument)
async def upload_medical_document(
    file: UploadFile = File(...),
    patient_id: str = Form(default="P-DEMO-001"),
    auto_sync_timeline: bool = Form(default=True),
    current_user: Optional[UserContext] = Depends(get_optional_current_user),
):
    """
    Upload a medical prescription, lab report, or discharge summary for OCR + NER extraction.
    Enforces strict 15MB size limit and allowed MIME types (JPEG, PNG, WEBP, PDF).
    Automatically evaluates lab values against clinical reference ranges and syncs to patient timeline in MongoDB.
    """
    # 1. Validate content type
    content_type = (file.content_type or "").lower()
    filename = file.filename or "medical_document.jpg"
    ext = ("." + filename.rsplit(".", 1)[-1].lower()) if "." in filename else ""
    
    valid_ext = ext in {".jpg", ".jpeg", ".png", ".webp", ".pdf"}
    valid_mime = content_type in ALLOWED_MIME_TYPES or not content_type

    if not valid_mime and not valid_ext:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported document format '{content_type or ext}'. Only JPEG, PNG, WEBP, and PDF are permitted."
        )

    # 2. Read and validate size
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read uploaded file: {str(e)}")

    if not content or len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded document file is empty.")

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Document exceeds maximum permitted size of 15MB (file size: {len(content) / (1024*1024):.2f}MB)."
        )

    # 3. Determine target patient_id and user_id
    effective_patient_id = patient_id
    effective_user_id = None
    if current_user:
        effective_user_id = current_user.user_id
        if patient_id in ("P-DEMO-001", "", None):
            effective_patient_id = current_user.user_id

    try:
        doc = await ocr_service.process_document(content, filename=filename, patient_id=effective_patient_id)
        if effective_user_id:
            doc.user_id = effective_user_id
            doc.patient_id = effective_patient_id
        
        if auto_sync_timeline:
            await timeline_service.sync_document_to_timeline_async(doc)
        else:
            await timeline_service.persist_document_to_db(doc)
            
        return doc
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing uploaded document: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")


@router.post("/process-sample", response_model=MedicalDocument)
async def process_sample_document(
    sample_type: str = Query(
        default="prescription",
        description="Sample type: 'prescription', 'diabetic_lab_report', 'renal_panel'"
    ),
    patient_id: str = Query(default="P-DEMO-001"),
    current_user: Optional[UserContext] = Depends(get_optional_current_user),
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
    
    effective_patient_id = patient_id
    effective_user_id = None
    if current_user:
        effective_user_id = current_user.user_id
        if patient_id in ("P-DEMO-001", "", None):
            effective_patient_id = current_user.user_id

    doc = await ocr_service.process_document(dummy_bytes, filename=sample_filename, patient_id=effective_patient_id)
    if effective_user_id:
        doc.user_id = effective_user_id
        doc.patient_id = effective_patient_id
    await timeline_service.sync_document_to_timeline_async(doc)
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
    return await timeline_service.sync_document_to_timeline_async(document)


@router.get("/reference-ranges", response_model=Dict[str, Any])
async def get_clinical_reference_ranges():
    """Retrieve the standard clinical reference ranges used for lab value evaluation."""
    return REFERENCE_RANGES_DB
