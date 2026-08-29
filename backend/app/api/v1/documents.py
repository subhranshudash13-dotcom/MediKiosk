from fastapi import APIRouter, UploadFile, File
from app.models.documents import MedicalDocument
from app.services.documents.ocr import ocr_service

router = APIRouter(prefix="/documents", tags=["Document AI & OCR"])


@router.post("/upload", response_model=MedicalDocument)
async def upload_medical_document(file: UploadFile = File(...)):
    """Upload prescription/lab report for OCR extraction and timeline ordering."""
    content = await file.read()
    return await ocr_service.process_document(content, file.filename or "prescription.png")
