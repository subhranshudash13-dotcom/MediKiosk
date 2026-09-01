import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.core.redis_client import connect_to_redis, close_redis_connection
from app.api.v1.router import api_router
from app.websockets.audio_stream import audio_stream_manager

logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup lifecycle
    logger.info("Initializing MediKiosk Backend Services...")
    await connect_to_mongo()
    await connect_to_redis()
    yield
    # Shutdown lifecycle
    logger.info("Shutting down MediKiosk Backend Services...")
    await close_mongo_connection()
    await close_redis_connection()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# CORS middleware for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
@app.get(f"{settings.API_V1_STR}/health", tags=["System"])
async def healthcheck():
    """Healthcheck endpoint for Kubernetes, Docker, and frontend probes."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)


# WebSocket endpoint for real-time live kiosk audio stream
@app.websocket("/ws/audio/{session_id}")
async def websocket_audio_endpoint(websocket: WebSocket, session_id: str):
    await audio_stream_manager.handle_stream(websocket, session_id)


@app.get("/test-voice", response_class=HTMLResponse, tags=["Testing"])
@app.get("/", response_class=HTMLResponse, tags=["Testing"])
async def voice_agent_test_ui():
    """Interactive browser-based evaluation playground for the Voice Agent."""
    return """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MediKiosk Voice Agent Playground</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #0284c7;
            --primary-dark: #0369a1;
            --bg: #0f172a;
            --card: #1e293b;
            --card-border: #334155;
            --text: #f8fafc;
            --text-muted: #94a3b8;
            --accent-green: #10b981;
            --accent-red: #ef4444;
            --accent-yellow: #f59e0b;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            padding: 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .container {
            max-width: 1100px;
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
        }
        @media (max-width: 800px) { .container { grid-template-columns: 1fr; } }
        header {
            text-align: center;
            margin-bottom: 24px;
            max-width: 1100px;
            width: 100%;
        }
        h1 { font-size: 28px; font-weight: 700; color: #38bdf8; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .subtitle { color: var(--text-muted); font-size: 14px; margin-top: 6px; }
        .badge {
            display: inline-block;
            padding: 4px 10px;
            background: rgba(56, 189, 248, 0.15);
            color: #38bdf8;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 8px;
        }
        .card {
            background: var(--card);
            border: 1px solid var(--card-border);
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .card-header {
            font-size: 16px;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--card-border);
            padding-bottom: 12px;
        }
        .chat-box {
            height: 340px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 8px;
            background: rgba(15, 23, 42, 0.6);
            border-radius: 12px;
        }
        .message {
            max-width: 85%;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 14px;
            line-height: 1.5;
        }
        .patient-msg {
            align-self: flex-end;
            background: #0284c7;
            color: white;
            border-bottom-right-radius: 2px;
        }
        .bot-msg {
            align-self: flex-start;
            background: #334155;
            color: #f1f5f9;
            border-bottom-left-radius: 2px;
            border-left: 3px solid #38bdf8;
        }
        .input-group {
            display: flex;
            gap: 8px;
        }
        input[type="text"] {
            flex: 1;
            padding: 12px 16px;
            background: #0f172a;
            border: 1px solid var(--card-border);
            border-radius: 10px;
            color: white;
            font-size: 14px;
            outline: none;
        }
        input[type="text"]:focus { border-color: #38bdf8; }
        button {
            padding: 12px 20px;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        button:hover { background: var(--primary-dark); }
        .mic-btn {
            background: #dc2626;
            width: 100%;
            justify-content: center;
            padding: 14px;
            font-size: 15px;
        }
        .mic-btn.recording {
            background: #b91c1c;
            animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }
        .quick-replies {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .quick-btn {
            padding: 6px 12px;
            background: #334155;
            color: #cbd5e1;
            font-size: 12px;
            border-radius: 8px;
            border: 1px solid #475569;
        }
        .quick-btn:hover { background: #475569; color: white; }
        pre {
            background: #0f172a;
            padding: 12px;
            border-radius: 10px;
            font-size: 12px;
            overflow-x: auto;
            color: #a5f3fc;
            height: 380px;
        }
        .progress-bar {
            background: #334155;
            border-radius: 9999px;
            height: 10px;
            overflow: hidden;
            width: 100%;
        }
        .progress-fill {
            background: linear-gradient(90deg, #38bdf8, #10b981);
            height: 100%;
            width: 0%;
            transition: width 0.4s;
        }
        .red-flag-alert {
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid var(--accent-red);
            padding: 10px 14px;
            border-radius: 10px;
            font-size: 13px;
            color: #fca5a5;
            display: none;
            align-items: center;
            gap: 8px;
        }
        .lang-bar {
            display: flex;
            gap: 6px;
            overflow-x: auto;
            padding-bottom: 4px;
        }
        .lang-pill {
            padding: 6px 12px;
            background: #0f172a;
            border: 1px solid var(--card-border);
            color: var(--text-muted);
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
        }
        .lang-pill.active {
            background: var(--primary);
            color: white;
            border-color: #38bdf8;
            box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
        }
        .lang-pill:hover:not(.active) {
            background: #334155;
            color: white;
        }
    </style>
</head>
<body>
    <header>
        <h1>🏥 MediKiosk AI Clinical Voice Agent</h1>
        <p class="subtitle">Zero-Cost · Zero-Hallucination · Dynamic SOCRATES Intake Engine</p>
        <span class="badge">🔥 Live Testing Playground · Groq LPU Powered</span>
    </header>

    <div class="container">
        <!-- Left: Interactive Voice / Chat Interface -->
        <div class="card">
            <div class="card-header">
                <span>💬 Patient Intake Dialogue</span>
                <span id="activeLangBadge" style="font-size: 11px; background: rgba(56,189,248,0.2); color: #38bdf8; padding: 2px 8px; border-radius: 6px;">Hindi (हिंदी)</span>
            </div>

            <!-- Language Switcher Bar -->
            <div>
                <label style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; margin-bottom: 6px; display: block;">Switch Spoken Language:</label>
                <div class="lang-bar" id="langBar">
                    <button class="lang-pill active" onclick="setLanguage('hi', 'Hindi (हिंदी)', this)">🇮🇳 Hindi</button>
                    <button class="lang-pill" onclick="setLanguage('te', 'Telugu (తెలుగు)', this)">🇮🇳 Telugu</button>
                    <button class="lang-pill" onclick="setLanguage('en', 'English', this)">🇬🇧 English</button>
                    <button class="lang-pill" onclick="setLanguage('ta', 'Tamil (தமிழ்)', this)">🇮🇳 Tamil</button>
                    <button class="lang-pill" onclick="setLanguage('bn', 'Bengali (বাংলা)', this)">🇮🇳 Bengali</button>
                    <button class="lang-pill" onclick="setLanguage('mr', 'Marathi (मराठी)', this)">🇮🇳 Marathi</button>
                    <button class="lang-pill" onclick="setLanguage('kn', 'Kannada (ಕನ್ನಡ)', this)">🇮🇳 Kannada</button>
                </div>
            </div>

            <div id="redFlagBox" class="red-flag-alert">
                ⚠️ <span id="redFlagText">Emergency Red Flag Triggered</span>
            </div>

            <div class="chat-box" id="chatBox">
                <div class="message bot-msg">
                    नमस्ते! मैं आरोग्य मित्र हूँ। आप आज कैसा महसूस कर रहे हैं? कृपया अपनी परेशानी बताएं।
                </div>
            </div>

            <div class="quick-replies" id="quickReplies">
                <button class="quick-btn" onclick="sendQuick('मुझे 3 दिन से तेज बुखार है')">🔥 तेज बुखार (3 दिन)</button>
                <button class="quick-btn" onclick="sendQuick('Doctor, mujhe chest me heavy pain ho raha hai')">🫀 Chest Pain (Red Flag)</button>
                <button class="quick-btn" onclick="sendQuick('Sar me tez dard ho raha hai aur ulti aa rahi hai')">🤕 सिरदर्द और उल्टी</button>
            </div>

            <div class="input-group">
                <input type="text" id="textInput" placeholder="Type complaint or speak via microphone..." onkeydown="if(event.key==='Enter') sendText()">
                <button onclick="sendText()">Send</button>
            </div>

            <button id="micBtn" class="mic-btn" onclick="toggleRecord()">
                🎙️ Push-to-Talk (Record Spoken Voice)
            </button>
        </div>

        <!-- Right: Structured Clinical State & SOCRATES Gauge -->
        <div class="card">
            <div class="card-header">
                <span>📋 Live Clinical Extraction (JSON)</span>
                <button class="quick-btn" onclick="resetSession()" style="padding: 4px 8px;">🔄 Reset Session</button>
            </div>

            <div>
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
                    <span>SOCRATES Completeness</span>
                    <span id="completenessText">0%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
            </div>

            <pre id="jsonPreview">Waiting for patient speech input...</pre>
        </div>
    </div>

    <!-- Hidden audio element for TTS playback -->
    <audio id="ttsAudio" style="display:none;"></audio>

    <script>
        const sessionId = "playground_patient_" + Math.random().toString(36).substring(2, 8);
        let currentLang = "hi";
        let mediaRecorder;
        let audioChunks = [];
        let isRecording = false;

        function setLanguage(langCode, langName, btn) {
            currentLang = langCode;
            document.querySelectorAll(".lang-pill").forEach(p => p.classList.remove("active"));
            if (btn) btn.classList.add("active");
            document.getElementById("activeLangBadge").textContent = langName;
            appendMessage(`🌐 <em>Language switched to ${langName}. The agent will now respond and speak in this language.</em>`, "bot-msg");
        }

        async function sendText() {
            const input = document.getElementById("textInput");
            const text = input.value.trim();
            if (!text) return;
            input.value = "";
            appendMessage(text, "patient-msg");

            try {
                const resp = await fetch("/api/v1/ai/chat-intake", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        session_id: sessionId,
                        transcript: text,
                        language_code: currentLang,
                        synthesize_audio: true
                    })
                });
                const data = await resp.json();
                handleAgentResponse(data);
            } catch (err) {
                console.error(err);
                appendMessage("Error communicating with AI service.", "bot-msg");
            }
        }

        function sendQuick(text) {
            document.getElementById("textInput").value = text;
            sendText();
        }

        function handleAgentResponse(data) {
            appendMessage(data.spoken_response, "bot-msg");

            // Update language if agent auto-detected mid-conversation language switch in speech
            if (data.language_code && data.language_code !== currentLang) {
                currentLang = data.language_code;
                const activeBtn = Array.from(document.querySelectorAll(".lang-pill")).find(b => b.getAttribute("onclick").includes(`'${currentLang}'`));
                if (activeBtn) {
                    document.querySelectorAll(".lang-pill").forEach(p => p.classList.remove("active"));
                    activeBtn.classList.add("active");
                }
            }

            // Play synthesized neural TTS audio
            if (data.audio_base64) {
                const audio = document.getElementById("ttsAudio");
                audio.src = data.audio_base64;
                audio.play().catch(e => console.log("Audio autoplay prevented:", e));
            }

            // Red Flag Alert
            const rfBox = document.getElementById("redFlagBox");
            if (data.red_flag_triggered) {
                rfBox.style.display = "flex";
                rfBox.innerHTML = "🚨 <strong>EMERGENCY ALERT:</strong> Acute condition detected! Immediate clinical attention required.";
            }

            // Quick replies
            const qrContainer = document.getElementById("quickReplies");
            if (data.quick_replies && data.quick_replies.length > 0) {
                qrContainer.innerHTML = data.quick_replies.map(r => 
                    `<button class="quick-btn" onclick="sendQuick('${r}')">${r}</button>`
                ).join("");
            }

            // Clinical JSON display
            const state = data.clinical_state;
            document.getElementById("jsonPreview").textContent = JSON.stringify(state, null, 2);

            // Completeness gauge
            const s = state.socrates || {};
            const fields = [s.site, s.onset, s.character, s.radiation, s.time_course || s.duration_days, s.exacerbating_relieving, s.severity_score];
            const completed = fields.filter(f => f !== null && f !== undefined && f !== "").length;
            const pct = Math.round((completed / fields.length) * 100);
            document.getElementById("completenessText").textContent = pct + "%";
            document.getElementById("progressFill").style.width = pct + "%";
        }

        function appendMessage(text, className) {
            const chat = document.getElementById("chatBox");
            const div = document.createElement("div");
            div.className = "message " + className;
            div.innerHTML = text;
            chat.appendChild(div);
            chat.scrollTop = chat.scrollHeight;
        }

        async function toggleRecord() {
            const btn = document.getElementById("micBtn");
            if (!isRecording) {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    alert("Microphone not supported on this browser.");
                    return;
                }
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
                mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
                    const formData = new FormData();
                    formData.append("file", audioBlob, "speech.wav");
                    formData.append("session_id", sessionId);
                    formData.append("language_code", currentLang);
                    formData.append("synthesize_audio", "true");

                    appendMessage("🎙️ [Audio Recording Sent...]", "patient-msg");

                    const resp = await fetch("/api/v1/ai/voice-intake", {
                        method: "POST",
                        body: formData
                    });
                    const data = await resp.json();
                    handleAgentResponse(data);
                };
                mediaRecorder.start();
                isRecording = true;
                btn.classList.add("recording");
                btn.textContent = "⏹️ Stop Recording (Click when finished)";
            } else {
                mediaRecorder.stop();
                isRecording = false;
                btn.classList.remove("recording");
                btn.textContent = "🎙️ Push-to-Talk (Record Spoken Voice)";
            }
        }

        async function resetSession() {
            await fetch(`/api/v1/ai/session/${sessionId}/reset`, { method: "POST" });
            document.getElementById("chatBox").innerHTML = '<div class="message bot-msg">नमस्ते! नई परामर्श के लिए तैयार हूँ। कृपया अपनी परेशानी बताएं।</div>';
            document.getElementById("jsonPreview").textContent = "Session reset for new patient.";
            document.getElementById("redFlagBox").style.display = "none";
            document.getElementById("completenessText").textContent = "0%";
            document.getElementById("progressFill").style.width = "0%";
        }
    </script>
</body>
</html>
    """


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
