import pytest
import asyncio
from app.services.ai.clinical_nlu_model import clinical_nlu
from app.services.ai.safety_guardrails import safety_guardrails
from app.services.ai.schemas import ExtractedSOCRATES, ExtractionPayload, ClinicalIntakeState
from app.services.ai.fast_pipeline import fast_ai_pipeline
from app.services.clinical.report_generator import report_generator


def test_extended_red_flag_precision_and_recall():
    """Verify 100% emergency recall while guaranteeing 0% false positives on non-emergencies."""
    true_emergencies = [
        ("Doctor, severe crushing chest pain radiating to left arm and sweating", "CARDIOVASCULAR_ACUTE"),
        ("मरीज को सांस लेने में बहुत ज्यादा तकलीफ हो रही है", "RESPIRATORY_DISTRESS"),
        ("Sudden loss of speech and facial drooping on right side", "STROKE_NEUROLOGICAL"),
        ("Heavy uncontrolled bleeding from head wound after accident", "SEVERE_TRAUMA_BLEEDING"),
        ("Coughing up bright red blood continuously", "SEVERE_TRAUMA_BLEEDING"),
        ("Anaphylactic reaction with swelling of lips and throat closing", "ANAPHYLAXIS"),
        ("Severe sharp right lower quadrant abdominal pain and vomiting", "ACUTE_SURGICAL_ABDOMEN"),
    ]
    for text, expected_type in true_emergencies:
        res = clinical_nlu.predict(text)
        assert res["is_emergency"] is True, f"Failed true emergency detection for: {text}"
        assert res["red_flag_type"] == expected_type, f"Mismatch flag: {res['red_flag_type']} vs {expected_type}"

    non_emergencies = [
        "Doctor I have a mild headache since morning",
        "Mujhe 3 din se thoda bukhar aur khansi hai",
        "I have left arm pain after heavy lifting at the gym yesterday",
        "Saans lene me thoda thand lag rahi hai",
        "Pet me halka dard hai",
    ]
    for text in non_emergencies:
        res = clinical_nlu.predict(text)
        assert res["is_emergency"] is False, f"False positive emergency triggered for: {text}"


def test_zero_hallucination_grounding_filter():
    """Verify that unmentioned symptoms or radiation are strictly filtered out by verify_grounding."""
    transcript = "I have severe pain in my left arm since yesterday."
    unfiltered_payload = ExtractionPayload(
        site="Left Arm",
        radiation="Back",  # Unmentioned!
        character="Sharp / Stabbing",
        duration_days=1,
        associated_symptoms=["Chest pain", "Fever"]  # Unmentioned!
    )
    grounded = safety_guardrails.verify_grounding(unfiltered_payload, transcript)

    # Radiation to back and associated chest pain/fever were NOT in transcript, must be stripped!
    assert grounded.radiation is None
    assert "Chest pain" not in grounded.associated_symptoms
    assert "Fever" not in grounded.associated_symptoms
    assert grounded.duration_days == 1


def test_paracetamol_medication_vs_allergy_extraction():
    """Verify Paracetamol is extracted as active medication, not allergy."""
    transcript = "I have high fever and severe headache. I took 650 mg Paracetamol."
    extracted = clinical_nlu.extract_slots_fast(transcript)
    assert any("Paracetamol" in m for m in extracted.current_medications)
    assert len(extracted.allergies) == 0


def test_multilingual_meta_intent_detection():
    """Verify accurate recognition of identity, help, and language switch meta-intents."""
    queries = [
        ("Tumára nám kjá er?", "identity", "bn"),
        ("Apnar naam ki?", "identity", "bn"),
        ("Aapka naam kya hai?", "identity", None),
        ("How can you help me out today?", "help", None),
        ("Please speak in Bengali", "language_switch", None),
    ]
    for text, expected_type, expected_lang in queries:
        meta = clinical_nlu.detect_meta_intent(text)
        assert meta is not None, f"Failed meta intent detection for: {text}"
        assert meta["type"] == expected_type
        if expected_lang:
            assert meta.get("detected_lang") == expected_lang


@pytest.mark.asyncio
async def test_pdf_report_generator_synthesis():
    """Verify end-to-end official medical PDF report generation."""
    sample_report_data = {
        "report_id": "REP-TEST1234",
        "generated_at": "08-Sep-2026 18:45 UTC",
        "patient": {
            "name": "Subhranshu Dash",
            "age": 26,
            "gender": "Male",
            "token": "#108",
            "abha_id": "91-1234-5678-9012",
            "triage_level": "URGENT",
            "intake_language": "HI"
        },
        "chief_complaint": "Acute epigastric burning pain and nausea for 3 days",
        "vitals": {
            "bp": "124/80 mmHg",
            "pulse": "82 bpm",
            "spo2": "99%",
            "temp": "98.6 °F",
            "bmi": "22.4 (Normal)"
        },
        "socrates": {
            "site": "Epigastrium / Stomach",
            "onset": "3 days ago",
            "character": "Burning / Dyspeptic",
            "radiation": "None",
            "associations": ["Nausea", "Sour eructations"],
            "timing": "Worse after meals",
            "exacerbating_relieving": "Antacids provide temporary relief",
            "severity_score": 6
        },
        "past_history": ["Essential Hypertension (Diagnosed 2024)"],
        "allergies": ["No known drug allergies (NKDA)"],
        "active_medications": [
            {"drug": "Tab Pantoprazole", "dose": "40 mg", "frequency": "1-0-0", "source": "Prescription OCR"}
        ],
        "evidence_trail": [
            {
                "timeframe": "Today",
                "source": "Spoken Patient Voice",
                "detail": "Reported 3-day epigastric burning after eating.",
                "provenance": "Voice ASR (HI)"
            }
        ],
        "safety_assessment": {
            "red_flags": [],
            "relevance_notes": "Reconciled baseline hypertension with active dyspeptic complaints."
        },
        "assigned_consultant": "Dr. A. K. Sharma, MD",
        "opd_room": "OPD Room 04"
    }

    pdf_bytes = report_generator.generate_pdf_bytes(sample_report_data)
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 2000
    assert pdf_bytes.startswith(b"%PDF")
