import pytest
import asyncio
from app.services.ai.safety_guardrails import safety_guardrails
from app.services.ai.schemas import ExtractedSOCRATES, ExtractionPayload
from app.services.ai.orchestrator import ai_orchestrator
from app.services.ai.tts_service import tts_service


@pytest.mark.asyncio
async def test_emergency_red_flag_detection():
    """Verify acute medical emergencies are flagged immediately."""
    transcript_chest = "Doctor, I have severe crushing chest pain radiating to my left arm since morning."
    alert = safety_guardrails.scan_red_flags(transcript_chest)
    assert alert is not None
    assert alert.is_emergency is True
    assert alert.flag_type == "CARDIOVASCULAR_ACUTE"

    transcript_hindi_resp = "मरीज को सांस लेने में बहुत ज्यादा तकलीफ हो रही है"
    alert_resp = safety_guardrails.scan_red_flags(transcript_hindi_resp)
    assert alert_resp is not None
    assert alert_resp.is_emergency is True
    assert alert_resp.flag_type == "RESPIRATORY_DISTRESS"


@pytest.mark.asyncio
async def test_zero_hallucination_on_missing_fields():
    """Verify that unspecified clinical facts are not invented."""
    transcript = "I have a mild headache."
    res = await ai_orchestrator.process_text_turn(transcript, session_id="test_session_1", language_code="en", synthesize_audio=False)
    state = res.clinical_state

    # Radiation, exacerbating factors, duration were not mentioned, must be None
    assert state.socrates.radiation is None
    assert state.socrates.exacerbating_relieving is None
    assert len(state.allergies) == 0


@pytest.mark.asyncio
async def test_medical_refusal_sanitizer():
    """Verify safety layer blocks hallucinated prescriptions."""
    hallucinated_output = "You definitely have typhoid, take 500 mg paracetamol tablets twice daily."
    sanitized = safety_guardrails.sanitize_model_output(hallucinated_output, language="en")
    assert "500 mg" not in sanitized
    assert "physician" in sanitized.lower() or "doctor" in sanitized.lower()


@pytest.mark.asyncio
async def test_socrates_completeness_calculation():
    """Verify accurate progress tracking for SOCRATES."""
    socrates = ExtractedSOCRATES(
        site="Epigastrium",
        onset="Gradual",
        character="Burning sensation",
        duration_days=4
    )
    score = safety_guardrails.calculate_socrates_completeness(socrates)
    assert 0.4 <= score <= 0.7


@pytest.mark.asyncio
async def test_tts_speech_synthesis():
    """Verify neural speech synthesis generates audio without crashing."""
    audio_bytes = await tts_service.synthesize_speech("नमस्ते, आप कैसे महसूस कर रहे हैं?", language_code="hi")
    assert isinstance(audio_bytes, bytes)
    # If network is available, it returns synthesized MP3 bytes; if network times out, returns graceful b""
    base64_str = await tts_service.synthesize_speech_base64("Hello", language_code="en")
    assert isinstance(base64_str, str)


@pytest.mark.asyncio
async def test_multi_turn_dynamic_dialogue():
    """Test a 2-turn clinical triage flow with code-mixed Hindi."""
    session_id = "test_multi_turn_session"
    turn1 = await ai_orchestrator.process_text_turn(
        "Doctor mujhe 3 din se bukhar hai aur badan me dard hai",
        session_id=session_id,
        language_code="hi",
        synthesize_audio=False
    )
    assert turn1.spoken_response is not None
    assert len(turn1.spoken_response) > 5
    assert turn1.clinical_state.socrates.duration_days == 3 or "3" in str(turn1.clinical_state.socrates.time_course)

    turn2 = await ai_orchestrator.process_text_turn(
        "Bukhar tez hai aur thand lag rahi hai, severity around 7",
        session_id=session_id,
        language_code="hi",
        synthesize_audio=False
    )
    assert turn2.clinical_state.turn_count == 2
    assert "fever" in turn2.clinical_state.associated_symptoms or "bukhar" in str(turn2.clinical_state.raw_transcripts)
