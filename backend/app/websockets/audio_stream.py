import logging
import json
import base64
from fastapi import WebSocket, WebSocketDisconnect
from app.services.ai.orchestrator import ai_orchestrator

logger = logging.getLogger(__name__)


class AudioStreamManager:
    """Manages real-time WebSocket connections for live kiosk voice interaction with session concurrency capping."""

    def __init__(self):
        self._active_connections: dict[str, int] = {}
        self.MAX_STREAMS_PER_SESSION = 2

    async def handle_stream(self, websocket: WebSocket, session_id: str):
        current_streams = self._active_connections.get(session_id, 0)
        if current_streams >= self.MAX_STREAMS_PER_SESSION:
            logger.warning(f"WebSocket rejected for {session_id}: Stream cap ({self.MAX_STREAMS_PER_SESSION}) exceeded.")
            await websocket.close(code=1008, reason="Max concurrent audio streams exceeded for this session.")
            return

        await websocket.accept()
        self._active_connections[session_id] = current_streams + 1
        logger.info(f"WebSocket connected for session: {session_id} (active: {self._active_connections[session_id]})")
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
        except Exception as e:
            logger.warning(f"WebSocket error for session {session_id}: {e}")
        finally:
            if session_id in self._active_connections:
                self._active_connections[session_id] = max(0, self._active_connections[session_id] - 1)
                if self._active_connections[session_id] == 0:
                    del self._active_connections[session_id]
            logger.info(f"WebSocket cleaned up for session: {session_id}")


audio_stream_manager = AudioStreamManager()
