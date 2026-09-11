import logging
import time
from typing import Dict, Any, Optional, List
import uuid

from app.services.ai.schemas import (
    ClinicalIntakeState,
    ExtractionPayload,
    DialogueTurnResponse,
    ExtractedSOCRATES,
    RedFlagAlert,
    HistoricalCorrelation,
)
from app.services.ai.safety_guardrails import safety_guardrails
from app.services.ai.clinical_nlu_model import clinical_nlu
from app.services.ai.fast_pipeline import fast_ai_pipeline
from app.services.ai.ai4bharat_service import ai4bharat_service
from app.services.ai.tts_service import tts_service
from app.services.ai.asr_service import asr_service

logger = logging.getLogger(__name__)


class AIOrchestratorService:
    """
    Master Clinical Voice Agent Orchestrator.
    Manages low-latency conversational turns, state tracking, emergency red flags,
    Bhashini / AI4Bharat Indic ASR & TTS integration, and longitudinal patient history correlation.
    """

    def __init__(self):
        self.sessions: Dict[str, ClinicalIntakeState] = {}
        self.conversation_histories: Dict[str, List[Dict[str, str]]] = {}

    def get_or_create_session(
        self,
        session_id: Optional[str] = None,
        language: str = "hi",
        patient_name: Optional[str] = None,
        age: Optional[int] = None,
        gender: Optional[str] = None,
        abha_id: Optional[str] = None,
        past_history: Optional[List[str]] = None,
        current_medications: Optional[List[str]] = None,
        allergies: Optional[List[str]] = None,
        historical_clues: Optional[List[Dict[str, Any]]] = None
    ) -> ClinicalIntakeState:
        """Retrieves or initializes a patient clinical intake session with longitudinal EHR history."""
        if not session_id or session_id not in self.sessions:
            new_id = session_id or str(uuid.uuid4())
            
            default_history = past_history if past_history is not None else []
            default_meds = current_medications if current_medications is not None else []
            default_allergies = allergies if allergies is not None else []
            default_clues = historical_clues or [
                {
                    "condition": "Pulmonary TB (Completed DOTS Regimen)",
                    "year": "2022",
                    "source": "Discharge Summary • 14-Aug-2022",
                    "relevanceNote": "Historical infectious respiratory context surfaced for physician correlation with current thoracic complaints."
                },
                {
                    "condition": "Essential Hypertension",
                    "year": "2024",
                    "source": "Prescription OCR • Apex Health OPD",
                    "relevanceNote": "Prior Amlodipine 5mg therapy documented. Important baseline for current blood pressure and chest pressure."
                }
            ]

            self.sessions[new_id] = ClinicalIntakeState(
                session_id=new_id,
                patient_name=patient_name or "Ananya Sharma",
                age=age or 28,
                gender=gender or "Female",
                abha_id=abha_id or "91-4567-8901-2345",
                language=language,
                socrates=ExtractedSOCRATES(),
                past_history=default_history,
                current_medications=default_meds,
                allergies=default_allergies,
                historical_clues=default_clues
            )
            self.conversation_histories[new_id] = []
            return self.sessions[new_id]

        state = self.sessions[session_id]
        if past_history and not state.past_history:
            state.past_history = past_history
        if current_medications and not state.current_medications:
            state.current_medications = current_medications
        if allergies and not state.allergies:
            state.allergies = allergies
        if historical_clues and not state.historical_clues:
            state.historical_clues = historical_clues
        return state

    async def process_voice_turn(
        self,
        audio_bytes: bytes,
        session_id: Optional[str] = None,
        language_code: str = "hi",
        synthesize_audio: bool = True
    ) -> DialogueTurnResponse:
        """
        Full End-to-End Voice Turn:
        Audio in -> Bhashini IndicASR / Whisper -> Single-Pass Turn -> Bhashini IndicTTS out.
        """
        start_time = time.time()
        # 1. Speech-to-Text Transcription via Bhashini with Whisper fallback
        transcript, detected_lang, _ = await ai4bharat_service.transcribe_speech(
            audio_bytes, language_code=language_code
        )
        lang = detected_lang or language_code
        logger.info(f"ASR complete in {round((time.time() - start_time) * 1000, 1)}ms: '{transcript}'")

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
        synthesize_audio: bool = True,
        patient_name: Optional[str] = None,
        patient_age: Optional[int] = None,
        patient_gender: Optional[str] = None,
        past_history: Optional[List[str]] = None,
        historical_clues: Optional[List[Dict[str, Any]]] = None
    ) -> DialogueTurnResponse:
        """
        Handles text or transcribed speech turn:
        Transcript -> Language Switch -> Red Flag Scan -> Single-Pass Fast NLU/LLM -> State Update -> Bhashini TTS.
        """
        turn_start = time.time()
        state = self.get_or_create_session(
            session_id=session_id,
            language=language_code or "hi",
            patient_name=patient_name,
            age=patient_age,
            gender=patient_gender,
            past_history=past_history,
            historical_clues=historical_clues
        )

        # Handle empty/inaudible transcript
        if not transcript or not transcript.strip():
            lang = state.language
            if lang == "hi" or "hindi" in lang or "hinglish" in lang:
                fallback_msg = "आपकी आवाज़ स्पष्ट सुनाई नहीं दी। कृपया दोबारा बताएं — आपको क्या तकलीफ़ है?"
                fallback_opts = ["छाती में दर्द है", "पेट में दर्द है", "बुखार और खांसी है"]
            elif lang == "bn":
                fallback_msg = "আপনার গলার স্বর স্পষ্ট শোনা যায়নি। অনুগ্রহ করে বলুন — কী সমস্যা হচ্ছে?"
                fallback_opts = ["বুকে ব্যথা হচ্ছে", "পেটে ব্যথা হচ্ছে", "জ্বর এবং সর্দি-কাশি"]
            elif lang == "te":
                fallback_msg = "మీ స్వరం స్పష్టంగా వినబడలేదు. దయచేసి మళ్లీ చెప్పండి — మీకు ఏమి సమస్య ఉంది?"
                fallback_opts = ["ఛాతీలో నొప్పి ఉంది", "కడుపు నొప్పి ఉంది", "జ్వరం మరియు దగ్గు ఉంది"]
            else:
                fallback_msg = "I couldn't hear you clearly. Please tell me what symptoms you are having."
                fallback_opts = ["Chest pain", "Stomach pain", "Fever and cough"]

            audio_base64 = None
            if synthesize_audio:
                try:
                    audio_base64 = await ai4bharat_service.synthesize_vernacular_speech(
                        text=fallback_msg, language_code=lang
                    )
                except Exception as e:
                    logger.error(f"TTS synthesis error: {e}")

            return DialogueTurnResponse(
                session_id=state.session_id,
                spoken_response=fallback_msg,
                language_code=lang,
                user_transcript="",
                audio_base64=audio_base64,
                clinical_state=state,
                red_flag_triggered=False,
                is_intake_complete=state.is_triage_complete,
                quick_replies=fallback_opts
            )

        state.turn_count += 1
        state.raw_transcripts.append(transcript)
        history = self.conversation_histories.setdefault(state.session_id, [])

        # 0. Dynamic Language Switch (UI or voice request)
        if language_code and language_code != state.language:
            state.language = language_code
        spoken_lang_switch = self.detect_language_switch(transcript)
        if spoken_lang_switch:
            state.language = spoken_lang_switch

        # 1. Deterministic Emergency Red Flag Check (< 1ms)
        red_flag = safety_guardrails.scan_red_flags(transcript)
        if red_flag and red_flag.is_emergency:
            state.red_flags.append(red_flag)
            logger.warning(f"EMERGENCY RED FLAG TRIGGERED: {red_flag.flag_type}")

        # 2. Unified Single-Pass Turn Execution (Trained Local NLU + Fast Cloud Race)
        extracted, spoken_response, quick_replies = await fast_ai_pipeline.execute_turn(
            transcript=transcript,
            state=state,
            language=state.language,
            session_id=session_id,
            history=history
        )

        # 3. Update Clinical Intake State with SOCRATES & Historical Correlation
        self._merge_extracted_into_state(state, extracted)

        # 4. Check SOCRATES completeness & Turn Cap (Target 7-8 deep questions for detailed doctor report)
        completeness = safety_guardrails.calculate_socrates_completeness(state.socrates)
        has_core_facts = bool(state.socrates.site and (state.socrates.onset or state.socrates.duration_days))
        if (red_flag and red_flag.is_emergency) or (completeness >= 0.90 and has_core_facts and state.turn_count >= 7) or (state.turn_count >= 8):
            state.is_triage_complete = True

        if state.is_triage_complete and not (red_flag and red_flag.is_emergency):
            # Conclude cleanly to prevent question loops
            spoken_response = self._get_completion_message(state.language)
            quick_replies = self._get_completion_replies(state.language)

        # 5. Update Conversation History
        history.append({"role": "user", "content": transcript})
        history.append({"role": "assistant", "content": spoken_response})

        # 6. Synthesize TTS Speech Audio via Bhashini IndicTTS (Cached & Fast)
        audio_base64 = None
        if synthesize_audio:
            try:
                audio_base64 = await ai4bharat_service.synthesize_vernacular_speech(
                    text=spoken_response,
                    language_code=state.language
                )
            except Exception as e:
                logger.error(f"Bhashini TTS synthesis error: {e}")

        turn_duration_ms = round((time.time() - turn_start) * 1000, 1)
        logger.info(f"Voice Agent Turn completed in {turn_duration_ms}ms (Completeness: {completeness*100}%)")

        # 7. Persist updated clinical state in-place to MongoDB & Redis
        try:
            from app.core.database import get_database
            from app.core.redis_client import get_redis
            from app.services.clinical.event_logger import event_logger
            from datetime import datetime, timezone
            import json

            db = get_database()
            now_iso = datetime.now(timezone.utc).isoformat()
            
            # Determine status & triage level
            is_emergency = bool(red_flag and red_flag.is_emergency)
            triage_level = "EMERGENCY" if is_emergency else ("URGENT" if completeness > 0.6 else "ROUTINE")
            new_status = "ready_for_doctor" if state.is_triage_complete else "in_progress"
            
            # History coverage map
            coverage_map = {
                "onset": bool(state.socrates.onset or state.socrates.duration_days),
                "location": bool(state.socrates.site),
                "character": bool(state.socrates.character),
                "severity": bool(state.socrates.severity_score),
                "radiation": bool(state.socrates.radiation),
                "aggravating": bool(state.socrates.exacerbating_relieving),
                "relieving": bool(state.socrates.exacerbating_relieving),
                "associated": bool(state.associated_symptoms or state.socrates.associations),
                "pastHistory": bool(state.past_history),
                "medications": bool(state.current_medications),
            }

            # Evidence node for this voice turn
            evidence_node = {
                "id": f"ev-{uuid.uuid4().hex[:6]}",
                "timeframe": "Today",
                "title": f"Patient Narration (Turn {state.turn_count})",
                "detail": transcript,
                "sourceType": "VOICE",
                "sourceBadge": f"🎙️ Voice Statement ({state.language.upper()})",
                "sourceSnippet": f'"{transcript}"',
                "metadata": {
                    "language": state.language,
                    "confidence": round(completeness, 2),
                    "audioDurationMs": turn_duration_ms
                }
            }

            update_fields = {
                "status": new_status,
                "triage_level": triage_level,
                "chief_complaint": state.chief_complaints[0] if state.chief_complaints else transcript[:80],
                "chief_complaints": state.chief_complaints,
                "socrates": state.socrates.model_dump(),
                "associated_symptoms": state.associated_symptoms,
                "past_history": state.past_history,
                "current_medications": state.current_medications,
                "allergies": state.allergies,
                "historical_correlation": state.historical_correlation.model_dump() if state.historical_correlation else None,
                "red_flags": [rf.model_dump() for rf in state.red_flags],
                "turn_count": state.turn_count,
                "history_completeness": int(round(completeness * 100)),
                "history_coverage": coverage_map,
                "updated_at": now_iso,
            }

            await db["sessions"].update_one(
                {"session_id": state.session_id},
                {
                    "$set": update_fields,
                    "$push": {
                        "raw_transcripts": transcript,
                        "evidence_timeline": evidence_node
                    }
                },
                upsert=True
            )

            if is_emergency and red_flag:
                await event_logger.log_event(
                    event_type="RED_FLAG_TRIGGER",
                    session_id=state.session_id,
                    severity="CRITICAL",
                    details={
                        "flag_type": red_flag.flag_type,
                        "trigger_text": red_flag.trigger_text,
                        "action": red_flag.recommended_action
                    }
                )

            redis = get_redis()
            await redis.set(
                f"session:{state.session_id}",
                json.dumps(update_fields, default=str),
                ex=86400
            )

        except Exception as e:
            logger.warning(f"Failed to sync turn to MongoDB/Redis: {e}")

        return DialogueTurnResponse(
            session_id=state.session_id,
            spoken_response=spoken_response,
            language_code=state.language,
            user_transcript=transcript,
            audio_base64=audio_base64,
            clinical_state=state,
            red_flag_triggered=bool(red_flag and red_flag.is_emergency),
            is_intake_complete=state.is_triage_complete,
            quick_replies=quick_replies
        )

    def _merge_extracted_into_state(self, state: ClinicalIntakeState, extracted: ExtractionPayload):
        """Merges new factual extractions and historical correlations into the patient intake state."""
        if extracted.chief_complaint and extracted.chief_complaint not in state.chief_complaints:
            state.chief_complaints.append(extracted.chief_complaint)

        # Merge SOCRATES
        s = state.socrates
        if extracted.site and not s.site:
            s.site = extracted.site
        if not s.onset:
            if extracted.onset:
                s.onset = extracted.onset
            elif extracted.time_course:
                s.onset = extracted.time_course
            elif extracted.duration_days is not None:
                s.onset = f"{extracted.duration_days} days"
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

        # Merge Historical Correlation
        if extracted.historical_correlation:
            state.historical_correlation = extracted.historical_correlation
        elif not state.historical_correlation and state.past_history and s.site:
            state.historical_correlation = HistoricalCorrelation(
                related_past_condition=state.past_history[0],
                clinical_link=f"Current {s.site} symptoms ({s.character or 'discomfort'}) evaluated against documented history of {state.past_history[0]}.",
                relevance_note="Surfaced for consulting doctor to differentiate acute episode from chronic progression."
            )

    def get_session_state(self, session_id: str) -> Optional[ClinicalIntakeState]:
        """Returns the current clinical intake summary."""
        return self.sessions.get(session_id)

    def _get_completion_message(self, language: str) -> str:
        if language == "hi":
            return "आपकी सभी जानकारियाँ और पुराना मेडिकल इतिहास नोट कर लिया गया है। विस्तृत रिपोर्ट डॉक्टर साहब को भेज दी गई है। कृपया ओपीडी टोकन के साथ प्रतीक्षा करें।"
        elif language == "bn":
            return "আপনার সমস্ত শারীরিক লক্ষণ ও পূর্বের চিকিৎসার ইতিহাস যথাযথভাবে রেকর্ড করা হয়েছে। বিস্তারিত রিপোর্ট ডাক্তারের কাছে পাঠানো হয়েছে। অনুগ্রহ করে ওপিडी টোকেন নিয়ে অপেক্ষা করুন।"
        elif language == "te":
            return "మీ పూర్తి వివరాలు మరియు పూర్వ అనారోగ్య చరిత్ర నమోదు చేయబడింది. రిపోర్ట్ డాక్టర్ గారికి పంపబడింది. దయచేసి OPD టోకెన్‌తో వేచి ఉండండి।"
        elif language == "ta":
            return "உங்கள் அனைத்து விவரங்களும் முந்தைய மருத்துவ பதிவுகளும் பதிவு செய்யப்பட்டு மருத்துவருக்கு அனுப்பப்பட்டுள்ளன. தயவுசெய்து உங்கள் OPD டோக்கனுடன் காத்திருக்கவும்."
        else:
            return "All your clinical details and past medical history have been compiled for the consulting physician. Please proceed with your OPD token."

    def _get_completion_replies(self, language: str) -> List[str]:
        if language == "hi":
            return ["डॉक्टर वर्कस्टेशन खोलें", "टोकन नंबर दिखाएं"]
        elif language == "bn":
            return ["ওপিডি টোকেন দেখুন", "ডাক্তার পোর্টাল খুলুন"]
        elif language == "te":
            return ["టోకెన్ సంఖ్య చూడండి", "డాక్టర్ పోర్టల్"]
        elif language == "ta":
            return ["OPD டோக்கனைப் பார்க்கவும்", "மருத்துவர் போர்ட்டலைத் திறக்கவும்"]
        else:
            return ["View OPD Token", "Open Doctor Cockpit"]

    def reset_session(self, session_id: str):
        """Resets intake session for a new patient."""
        if session_id in self.sessions:
            del self.sessions[session_id]
        if session_id in self.conversation_histories:
            del self.conversation_histories[session_id]


ai_orchestrator = AIOrchestratorService()

