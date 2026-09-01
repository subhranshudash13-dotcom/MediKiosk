import logging
import json
import base64
from fastapi import WebSocket, WebSocketDisconnect
from app.services.ai.orchestrator import ai_orchestrator

logger = logging.getLogger(__name__)


class AudioStreamManager:
    """Manages real-time WebSocket connections for live kiosk voice interaction."""

    async def handle_stream(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        logger.info(f"WebSocket connected for session: {session_id}")
        state = ai_orchestrator.get_or_create_session(session_id=session_id)

        try:
            while True:
                message = await websocket.receive_text()
                try:
                    payload = json.loads(message)
                except Exception:
                    payload = {"event": "text_input", "text": message}

                event_type = payload.get("event", "text_input")

                if event_type == "text_input":
                    transcript = payload.get("text", "")
                    lang = payload.get("language", state.language)
                    result = await ai_orchestrator.process_text_turn(
                        transcript=transcript,
                        session_id=session_id,
                        language_code=lang,
                        synthesize_audio=True
                    )
                    await websocket.send_json({
                        "event": "ai_response",
                        "spoken_text": result.spoken_response,
                        "audio_base64": result.audio_base64,
                        "red_flag": result.red_flag_triggered,
                        "is_complete": result.is_intake_complete,
                        "quick_replies": result.quick_replies,
                        "clinical_state": result.clinical_state.model_dump()
                    })

                elif event_type == "audio_chunk":
                    # Audio chunk encoded as base64
                    raw_b64 = payload.get("audio_data", "")
                    lang = payload.get("language", state.language)
                    if raw_b64:
                        audio_bytes = base64.b64decode(raw_b64)
                        result = await ai_orchestrator.process_voice_turn(
                            audio_bytes=audio_bytes,
                            session_id=session_id,
                            language_code=lang,
                            synthesize_audio=True
                        )
                        await websocket.send_json({
                            "event": "ai_response",
                            "spoken_text": result.spoken_response,
                            "audio_base64": result.audio_base64,
                            "red_flag": result.red_flag_triggered,
                            "is_complete": result.is_intake_complete,
                            "quick_replies": result.quick_replies,
                            "clinical_state": result.clinical_state.model_dump()
                        })

                elif event_type == "reset":
                    ai_orchestrator.reset_session(session_id)
                    await websocket.send_json({"event": "session_reset", "session_id": session_id})

        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected for session: {session_id}")


audio_stream_manager = AudioStreamManager()
