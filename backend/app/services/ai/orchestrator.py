import logging
from typing import Dict, Any, Optional, List
import uuid

from app.services.ai.schemas import (
    ClinicalIntakeState,
    ExtractionPayload,
    DialogueTurnResponse,
    ExtractedSOCRATES,
    RedFlagAlert,
)
from app.services.ai.safety_guardrails import safety_guardrails
from app.services.ai.extractor import clinical_extractor
from app.services.ai.dialogue_engine import dialogue_engine
from app.services.ai.tts_service import tts_service
from app.services.ai.asr_service import asr_service

logger = logging.getLogger(__name__)


class AIOrchestratorService:
    """
    Master Clinical Voice Agent Orchestrator.
    Manages conversational turns, clinical state tracking, emergency detection,
    structured zero-hallucination extraction, and vernacular speech synthesis.
    """

    def __init__(self):
        # In-memory session store (can be connected to Redis in production)
        self.sessions: Dict[str, ClinicalIntakeState] = {}
        self.conversation_histories: Dict[str, List[Dict[str, str]]] = {}

    def get_or_create_session(self, session_id: Optional[str] = None, language: str = "hi") -> ClinicalIntakeState:
        """Retrieves or initializes a patient clinical intake session."""
        if not session_id or session_id not in self.sessions:
            new_id = session_id or str(uuid.uuid4())
            self.sessions[new_id] = ClinicalIntakeState(
                session_id=new_id,
                language=language,
                socrates=ExtractedSOCRATES()
            )
            self.conversation_histories[new_id] = []
            return self.sessions[new_id]
        return self.sessions[session_id]

    async def process_voice_turn(
        self,
        audio_bytes: bytes,
        session_id: Optional[str] = None,
        language_code: str = "hi",
        synthesize_audio: bool = True
    ) -> DialogueTurnResponse:
        """
        Full End-to-End Voice Turn:
        Audio in -> ASR -> Safety/Red Flag -> Clinical Extraction -> Dialogue Reasoning -> TTS out.
        """
        # 1. Speech-to-Text Transcription
        transcript, detected_lang, _ = await asr_service.transcribe_audio(audio_bytes, language_code=language_code)
        lang = detected_lang or language_code

        # 2. Process text intake turn
        return await self.process_text_turn(
            transcript=transcript,
            session_id=session_id,
            language_code=lang,
            synthesize_audio=synthesize_audio
        )

    def detect_language_switch(self, text: str) -> Optional[str]:
        """Detects if the patient is explicitly requesting to switch the conversational language."""
        t = text.lower().strip()
        import re
        if re.search(r"(speak|talk|switch|change|tell\s*me)\s*(in\s*)?english|english\s*(me|lo|la|dalli|madhe|te)", t):
            return "en"
        if re.search(r"(hindi|हिंदी)\s*(me|mein|lo|la|dalli|madhe|te|bolo|baat\s*karo|speak)", t) or "hindi me" in t:
            return "hi"
        if re.search(r"(telugu|తెలుగు)\s*(lo|me|la|dalli|matladu|matladandi|speak)", t) or "telugu lo" in t:
            return "te"
        if re.search(r"(tamil|தமிழ்)\s*(la|pesu|pesunga|me|speak)", t) or "tamil la" in t:
            return "ta"
        if re.search(r"(bengali|bangla|বাংলা)\s*(te|bolo|speak)", t) or "bangla te" in t:
            return "bn"
        if re.search(r"(marathi|मराठी)\s*(madhe|bola|speak)", t) or "marathi madhe" in t:
            return "mr"
        if re.search(r"(kannada|ಕನ್ನಡ)\s*(dalli|mathadi|speak)", t) or "kannada dalli" in t:
            return "kn"
        return None

    async def process_text_turn(
        self,
        transcript: str,
        session_id: Optional[str] = None,
        language_code: Optional[str] = None,
        synthesize_audio: bool = True
    ) -> DialogueTurnResponse:
        """
        Handles text or transcribed speech turn:
        Transcript -> Language Switch Check -> Emergency Scan -> Entity Extraction -> State Update -> Dialogue Response -> TTS.
        """
        state = self.get_or_create_session(session_id, language=language_code or "hi")
        state.turn_count += 1
        state.raw_transcripts.append(transcript)
        history = self.conversation_histories.setdefault(state.session_id, [])

        # 0. Dynamic Language Switch (via UI toggle or spoken request)
        if language_code and language_code != state.language:
            state.language = language_code
            logger.info(f"Language updated via UI toggle to: {language_code}")

        spoken_lang_switch = self.detect_language_switch(transcript)
        if spoken_lang_switch:
            state.language = spoken_lang_switch
            logger.info(f"Language dynamically switched by user request to: {spoken_lang_switch}")

        # 1. Deterministic Emergency Red Flag Check
        red_flag = safety_guardrails.scan_red_flags(transcript)
        if red_flag and red_flag.is_emergency:
            state.red_flags.append(red_flag)
            logger.warning(f"EMERGENCY RED FLAG TRIGGERED for session {state.session_id}: {red_flag.flag_type}")

        # 2. Structured Clinical Entity Extraction (Zero-Hallucination)
        extracted: ExtractionPayload = await clinical_extractor.extract_clinical_entities(
            transcript, current_state=state.model_dump()
        )

        # 3. Update Clinical Intake State
        self._merge_extracted_into_state(state, extracted)

        # 4. Check SOCRATES completeness
        completeness = safety_guardrails.calculate_socrates_completeness(state.socrates)
        if completeness >= 0.75 or state.turn_count >= 5:
            state.is_triage_complete = True

        # 5. Dynamic Dialogue Generation (Empathetic & Personalized)
        dialogue_output = await dialogue_engine.generate_response(
            transcript=transcript,
            state=state,
            extracted=extracted,
            conversation_history=history
        )
        spoken_response = dialogue_output["spoken_response"]
        quick_replies = dialogue_output.get("quick_replies", [])

        # 6. Update Conversation History
        history.append({"role": "user", "content": transcript})
        history.append({"role": "assistant", "content": spoken_response})

        # 7. Optional Text-to-Speech Synthesis
        audio_base64 = None
        if synthesize_audio:
            try:
                audio_base64 = await tts_service.synthesize_speech_base64(
                    text=spoken_response,
                    language_code=state.language
                )
            except Exception as e:
                logger.error(f"TTS synthesis error: {e}")

        return DialogueTurnResponse(
            session_id=state.session_id,
            spoken_response=spoken_response,
            language_code=state.language,
            audio_base64=audio_base64,
            clinical_state=state,
            red_flag_triggered=bool(red_flag and red_flag.is_emergency),
            is_intake_complete=state.is_triage_complete,
            quick_replies=quick_replies
        )

    def _merge_extracted_into_state(self, state: ClinicalIntakeState, extracted: ExtractionPayload):
        """Merges new factual extractions into the patient intake state without overwriting existing valid facts."""
        if extracted.chief_complaint and extracted.chief_complaint not in state.chief_complaints:
            state.chief_complaints.append(extracted.chief_complaint)

        # Merge SOCRATES
        s = state.socrates
        if extracted.site and not s.site:
            s.site = extracted.site
        if extracted.onset and not s.onset:
            s.onset = extracted.onset
        if extracted.character and not s.character:
            s.character = extracted.character
        if extracted.radiation and not s.radiation:
            s.radiation = extracted.radiation
        if extracted.duration_days is not None:
            s.duration_days = extracted.duration_days
        if extracted.time_course and not s.time_course:
            s.time_course = extracted.time_course
        if extracted.exacerbating_relieving and not s.exacerbating_relieving:
            s.exacerbating_relieving = extracted.exacerbating_relieving
        if extracted.severity_score is not None:
            s.severity_score = extracted.severity_score

        # Merge lists
        for sym in extracted.associated_symptoms:
            if sym and sym not in state.associated_symptoms and sym not in s.associations:
                s.associations.append(sym)
                state.associated_symptoms.append(sym)

        for hist in extracted.past_history:
            if hist and hist not in state.past_history:
                state.past_history.append(hist)

        for med in extracted.current_medications:
            if med and med not in state.current_medications:
                state.current_medications.append(med)

        for alg in extracted.allergies:
            if alg and alg not in state.allergies:
                state.allergies.append(alg)

    def get_session_state(self, session_id: str) -> Optional[ClinicalIntakeState]:
        """Returns the current clinical intake summary."""
        return self.sessions.get(session_id)

    def reset_session(self, session_id: str):
        """Resets intake session for a new patient."""
        if session_id in self.sessions:
            del self.sessions[session_id]
        if session_id in self.conversation_histories:
            del self.conversation_histories[session_id]


ai_orchestrator = AIOrchestratorService()
