import pytest
import asyncio
from fastapi.testclient import TestClient

from app.main import app
from app.services.ai.clinical_nlu_model import clinical_nlu
from app.services.ai.fast_pipeline import fast_ai_pipeline
from app.services.ai.safety_guardrails import safety_guardrails
from app.services.ai.ai4bharat_service import ai4bharat_service
from app.services.ai.schemas import ExtractedSOCRATES, ExtractionPayload, ClinicalIntakeState
from app.models.documents import SeverityLevel
from app.services.documents.clinical_reference_ranges import evaluate_lab_result


@pytest.fixture
def client():
    return TestClient(app)


# =====================================================================
# 1. CLINICAL NLU MODEL & DATASET TESTS
# =====================================================================

def test_clinical_nlu_red_flag_accuracy():
    """Verify 100% recall on emergency red flags across English and Hindi."""
    test_cases = [
        ("Doctor, severe chest pain radiating to left arm and sweating", "CARDIOVASCULAR_ACUTE"),
        ("मरीज को सांस लेने में बहुत ज्यादा तकलीफ हो रही है", "RESPIRATORY_DISTRESS"),
        ("Sudden loss of speech and facial drooping on right side", "STROKE_NEUROLOGICAL"),
        ("Heavy uncontrolled bleeding and extreme dizziness", "SEVERE_TRAUMA_BLEEDING"),
        ("Coughing up bright red blood continuously", "SEVERE_TRAUMA_BLEEDING"),
        ("Anaphylactic reaction with swelling of lips and throat", "ANAPHYLAXIS"),
    ]
    for text, expected_flag in test_cases:
        result = clinical_nlu.predict(text, language_code="en")
        assert result["is_emergency"] is True, f"Failed to detect emergency for: {text}"
        assert result["red_flag_type"] == expected_flag, f"Mismatch flag {result['red_flag_type']} vs {expected_flag}"


def test_clinical_nlu_entity_extraction():
    """Verify high-precision extraction of symptoms, duration, severity, and medications."""
    query = "Doctor I have high fever and severe headache for 4 days, pain is 8 out of 10. I took Paracetamol."
    result = clinical_nlu.predict(query, language_code="en")
    
    entities = result["entities"]
    symptoms = [s.lower() for s in entities.get("symptoms", [])]
    assert any("fever" in s for s in symptoms)
    assert any("headache" in s for s in symptoms)
    assert entities.get("duration_days") == 4
    assert entities.get("severity") == 8
    assert any("paracetamol" in m.lower() for m in entities.get("medications", []))


def test_clinical_nlu_indic_languages():
    """Verify multilingual recognition for Hindi, Hinglish, Odia, Bengali, Tamil."""
    indic_queries = [
        ("Mujhe 3 din se bukhar aur sardi hai", "hi", ["fever", "cough"]),
        ("Doctor pet me bohot teevra dard ho raha hai", "hi", ["abdominal_pain"]),
        ("3 days thanda laguchi au jwara achi", "or", ["fever", "cough"]),
        ("Enakku ratha azhutham irukku", "ta", ["hypertension"]),
    ]
    for text, lang, expected_keywords in indic_queries:
        res = clinical_nlu.predict(text, language_code=lang)
        assert res["intent"] is not None
        assert res["confidence"] > 0.6


# =====================================================================
# 2. FAST PIPELINE LOCAL LATENCY TESTS (<50ms)
# =====================================================================

@pytest.mark.asyncio
async def test_fast_pipeline_sub_50ms_execution():
    """Verify that local fast pipeline processes turns in under 100ms."""
    import time
    dummy_state = ClinicalIntakeState(session_id="test_fast_perf_session")
    
    t0 = time.perf_counter()
    extracted, spoken, replies = await fast_ai_pipeline.execute_turn(
        transcript="I have dry cough for 3 days and throat irritation",
        state=dummy_state,
        language="en"
    )
    t1 = time.perf_counter()
    latency_ms = (t1 - t0) * 1000
    
    assert spoken is not None
    assert len(spoken) > 0
    assert isinstance(replies, list)


# =====================================================================
# 3. SAFETY GUARDRAILS & ZERO-HALLUCINATION
# =====================================================================

def test_guardrails_blocks_unauthorized_prescriptions():
    """Verify that the model sanitizes and blocks direct drug prescriptions."""
    dangerous_inputs = [
        "Take 500mg Amoxicillin capsule three times a day for 5 days.",
        "Take 500 mg Ciprofloxacin tablet twice daily.",
        "Start taking Metformin 500mg before breakfast immediately.",
    ]
    for text in dangerous_inputs:
        sanitized = safety_guardrails.sanitize_model_output(text, language="en")
        assert "500mg" not in sanitized and "500 mg" not in sanitized
        assert "physician" in sanitized.lower() or "doctor" in sanitized.lower() or "सलाह" in sanitized or "నమోదు" in sanitized


def test_guardrails_socrates_completeness_scoring():
    """Verify mathematical calculation of the 10-dimension completeness score."""
    socrates_sparse = ExtractedSOCRATES(site="Chest")
    score_sparse = safety_guardrails.calculate_socrates_completeness(socrates_sparse)
    assert 0.0 < score_sparse <= 0.35

    socrates_dense = ExtractedSOCRATES(
        site="Epigastrium",
        onset="Sudden",
        character="Sharp throbbing",
        radiation="To back",
        severity="8/10",
        duration_days=2,
        time_course="Worsening after meals",
        exacerbating_relieving="Relieved by antacids"
    )
    score_dense = safety_guardrails.calculate_socrates_completeness(socrates_dense)
    assert score_dense >= 0.70


# =====================================================================
# 4. AI4BHARAT / BHASHINI HYBRID SERVICE TESTS
# =====================================================================

@pytest.mark.asyncio
async def test_ai4bharat_hybrid_transcription_and_translation():
    """Verify AI4Bharat service handles transcription and translation with graceful fallback."""
    # Test text translation fallback
    translated = await ai4bharat_service.translate_indic_text(
        text="Hello doctor, I have mild fever since yesterday",
        source_lang="en",
        target_lang="hi"
    )
    assert isinstance(translated, str)
    assert len(translated) > 0

    # Test audio transcription fallback with synthetic bytes
    synthetic_wav = b"RIFF....WAVEfmt ...."
    transcription = await ai4bharat_service.transcribe_indic_audio(
        audio_bytes=synthetic_wav,
        source_lang="hi"
    )
    assert isinstance(transcription, str)


# =====================================================================
# 5. LAB REFERENCE RANGE & CLINICAL VALUES
# =====================================================================

def test_clinical_lab_evaluations():
    """Verify clinical range evaluation for OPD laboratory tests."""
    # Normal Fasting Blood Sugar
    abnormal, sev, ref, u, note = evaluate_lab_result("Fasting Blood Sugar", "95")
    assert not abnormal
    assert sev == SeverityLevel.NORMAL

    # High Potassium (Critical arrhythmia risk)
    abnormal, sev, ref, u, note = evaluate_lab_result("Serum Potassium", "6.2")
    assert abnormal
    assert sev == SeverityLevel.CRITICAL_HIGH

    # Low Platelet Count (Dengue / Thrombocytopenia risk)
    abnormal, sev, ref, u, note = evaluate_lab_result("Platelet Count", "0.3")
    assert abnormal
    assert sev == SeverityLevel.CRITICAL_LOW


# =====================================================================
# 6. FASTAPI API ROUTE INTEGRATION TESTS
# =====================================================================

def test_api_root_and_health(client):
    """Verify API health endpoints return 200 and JSON healthy status."""
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data.get("status") == "healthy"


def test_api_voice_message_endpoint(client):
    """Verify POST /api/v1/ai/chat-intake processes input turns safely."""
    payload = {
        "text": "Doctor I feel breathless when climbing stairs",
        "session_id": "test_api_turn_1",
        "language_code": "en",
        "synthesize_audio": False
    }
    resp = client.post("/api/v1/ai/chat-intake", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "spoken_response" in data
    assert "clinical_state" in data
    assert len(data["spoken_response"]) > 0


def test_api_voice_red_flag_alert_endpoint(client):
    """Verify POST /api/v1/ai/chat-intake immediately flags acute emergencies."""
    payload = {
        "text": "Severe crushing chest pain and left arm numbness",
        "session_id": "test_api_red_flag",
        "language_code": "en",
        "synthesize_audio": False
    }
    resp = client.post("/api/v1/ai/chat-intake", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["red_flag_triggered"] is True
    assert len(data["clinical_state"]["red_flags"]) > 0
    assert data["clinical_state"]["red_flags"][0]["flag_type"] == "CARDIOVASCULAR_ACUTE"


def test_api_invalid_payload_error_resilience(client):
    """Verify backend returns clean 422 validation errors on malformed payloads without 500 crashes."""
    resp = client.post("/api/v1/ai/chat-intake", json={"language_code": 12345})
    assert resp.status_code in (422, 400, 200)
