import pytest
from datetime import date
from io import BytesIO
from PIL import Image
from fastapi.testclient import TestClient

from app.main import app
from app.models.documents import (
    SeverityLevel,
    DocumentType,
    MedicalDocument,
    ExtractedMedication,
    ExtractedLabResult,
)
from app.services.documents.clinical_reference_ranges import evaluate_lab_result
from app.services.documents.ocr import ocr_service
from app.services.documents.timeline_service import timeline_service


from app.models.auth import UserContext
from app.services.auth.dependencies import get_current_user


@pytest.fixture
def client():
    mock_user = UserContext(
        sid="sess-test-123",
        user_id="P-DEMO-001",
        mobile_number="9999999999",
        role="patient",
        is_anonymous=False
    )
    app.dependency_overrides[get_current_user] = lambda: mock_user
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.pop(get_current_user, None)


def test_clinical_reference_range_evaluation():
    """Verify that lab parameters are evaluated accurately against Indian OPD clinical standards."""
    # 1. Normal HbA1c
    is_abnormal, severity, ref_range, unit, note = evaluate_lab_result("HbA1c", "5.2")
    assert not is_abnormal
    assert severity == SeverityLevel.NORMAL

    # 2. Critical High HbA1c (Severe Uncontrolled Diabetes)
    is_abnormal, severity, ref_range, unit, note = evaluate_lab_result("Glycated Hemoglobin (HbA1c)", "9.5%")
    assert is_abnormal
    assert severity == SeverityLevel.CRITICAL_HIGH
    assert "CRITICAL HIGH" in note

    # 3. Critical High Serum Creatinine (Renal Impairment)
    is_abnormal, severity, ref_range, unit, note = evaluate_lab_result("Serum Creatinine", "2.8 mg/dL")
    assert is_abnormal
    assert severity == SeverityLevel.CRITICAL_HIGH

    # 4. Elevated Fasting Blood Sugar
    is_abnormal, severity, ref_range, unit, note = evaluate_lab_result("Fasting Blood Sugar (FBS)", "148")
    assert is_abnormal
    assert severity == SeverityLevel.ELEVATED

    # 5. Severe Anemia (Hemoglobin Critical Low)
    is_abnormal, severity, ref_range, unit, note = evaluate_lab_result("Hemoglobin", "6.4 g/dL")
    assert is_abnormal
    assert severity == SeverityLevel.CRITICAL_LOW


@pytest.mark.asyncio
async def test_ocr_service_heuristic_extraction():
    """Verify that OCR service extracts medications, frequencies, and labs from prescription text/filename."""
    from PIL import ImageDraw
    img = Image.new("RGB", (600, 400), color="white")
    draw = ImageDraw.Draw(img)
    draw.text((20, 20), "CITY CLINIC & CARDIAC CARE", fill="black")
    draw.text((20, 60), "Dr. Arvind Rao, MD (Medicine)", fill="black")
    draw.text((20, 100), "Pt: Ram Prakash 58/M  BP: 150/90", fill="black")
    draw.text((20, 140), "Diagnosis: Essential Hypertension", fill="black")
    draw.text((20, 180), "Rx: Tb. Amlodipine 5mg 1-0-0 post breakfast x 30 days", fill="black")
    buf = BytesIO()
    img.save(buf, format="JPEG")
    sample_bytes = buf.getvalue()
    
    doc = await ocr_service.process_document(
        sample_bytes,
        filename="rx_prescription_hypertension_amlodipine.jpg",
        patient_id="P-DEMO-001"
    )

    assert doc.patient_id == "P-DEMO-001"
    assert doc.document_type in (DocumentType.PRESCRIPTION, DocumentType.LAB_REPORT)
    assert len(doc.extracted_medications) > 0

    # Verify extracted drug properties
    med_names = [m.name for m in doc.extracted_medications]
    assert any("Amlodipine" in name for name in med_names)

    first_med = doc.extracted_medications[0]
    assert first_med.dosage is not None
    assert first_med.frequency is not None
    assert first_med.confidence is not None


def test_timeline_service_aggregation():
    """Verify that timeline service correctly orders events, aggregates active medications and critical lab alerts."""
    timeline = timeline_service.get_longitudinal_timeline("P-DEMO-001")

    assert timeline.patient_id == "P-DEMO-001"
    assert timeline.total_records >= 4

    # Verify chronological order (newest date first)
    dates = [evt.date for evt in timeline.timeline]
    assert dates == sorted(dates, reverse=True)

    # Verify active medications aggregation (deduplicated)
    active_meds = timeline.active_medications_summary
    assert len(active_meds) > 0
    active_names = [m.name for m in active_meds]
    assert any("Amlodipine" in name for name in active_names)

    # Verify critical alerts surfaced
    assert len(timeline.critical_lab_alerts) > 0
    assert any("HbA1c" in alert or "Creatinine" in alert for alert in timeline.critical_lab_alerts)


@pytest.mark.asyncio
async def test_timeline_sync_new_document():
    """Verify that a new processed document is immediately synced to the patient timeline."""
    new_doc = MedicalDocument(
        document_id="DOC-TEST-SYNC-001",
        patient_id="P-DEMO-001",
        document_type=DocumentType.LAB_REPORT,
        document_date=date.today(),
        raw_ocr_text="Lipid profile demonstrating elevated cholesterol",
        doctor_name="Dr. Pathologist",
        facility_name="Apollo Diagnostics",
        extracted_diagnoses=[],
        extracted_medications=[],
        extracted_labs=[
            ExtractedLabResult(
                test_name="Serum Triglycerides",
                value="280",
                unit="mg/dL",
                reference_range="< 150 mg/dL",
                is_abnormal=True,
                severity_flag=SeverityLevel.ELEVATED
            )
        ]
    )

    event = timeline_service.sync_document_to_timeline(new_doc)
    assert event.raw_document_id == "DOC-TEST-SYNC-001"

    updated_timeline = timeline_service.get_longitudinal_timeline("P-DEMO-001")
    assert updated_timeline.timeline[0].raw_document_id == "DOC-TEST-SYNC-001"


def test_documents_api_timeline_endpoint(client):
    """Test GET /api/v1/documents/timeline/{patient_id}."""
    resp = client.get("/api/v1/documents/timeline/P-DEMO-001")
    assert resp.status_code == 200
    data = resp.json()

    assert data["patient_id"] == "P-DEMO-001"
    assert "timeline" in data
    assert "active_medications_summary" in data
    assert "critical_lab_alerts" in data
    assert len(data["timeline"]) >= 4


def test_documents_api_process_sample_endpoint(client):
    """Test POST /api/v1/documents/process-sample."""
    resp = client.post("/api/v1/documents/process-sample?sample_type=prescription&patient_id=P-DEMO-001")
    assert resp.status_code == 200
    data = resp.json()

    assert data["patient_id"] == "P-DEMO-001"
    assert "extracted_medications" in data
    assert len(data["extracted_medications"]) > 0


def test_documents_api_upload_endpoint(client):
    """Test POST /api/v1/documents/upload with synthetic image bytes."""
    # Create small valid test image with Pillow
    img = Image.new("RGB", (100, 100), color="white")
    buf = BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    files = {"file": ("prescription_test.jpg", buf, "image/jpeg")}
    data = {"patient_id": "P-DEMO-001", "auto_sync_timeline": "true"}

    resp = client.post("/api/v1/documents/upload", files=files, data=data)
    assert resp.status_code == 200
    result = resp.json()

    assert result["patient_id"] == "P-DEMO-001"
    assert "extracted_medications" in result
    assert result["is_abdm_linked"] is True


def test_documents_api_reference_ranges(client):
    """Test GET /api/v1/documents/reference-ranges."""
    resp = client.get("/api/v1/documents/reference-ranges")
    assert resp.status_code == 200
    ranges = resp.json()
    assert "hba1c" in ranges
    assert "serum_creatinine" in ranges
    assert "fasting_blood_glucose" in ranges
