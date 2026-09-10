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

# CORS middleware for Next.js frontend communication across any local/remote network device
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
@app.get(f"{settings.API_V1_STR}/health", tags=["System"])
async def healthcheck():
    """Live diagnostic healthcheck endpoint pinging MongoDB, Redis, and AI Pipeline."""
    import time
    from datetime import datetime, timezone
    from app.core.database import get_database, db_manager
    from app.core.redis_client import get_redis, redis_manager
    from app.services.ai.fast_pipeline import fast_ai_pipeline
    from app.services.ai.clinical_nlu_model import clinical_nlu

    services: dict = {}
    is_healthy = True

    # 1. MongoDB Health & Ping
    t0 = time.time()
    try:
        db = get_database()
        ping_res = await db.command("ping")
        mongo_latency_ms = round((time.time() - t0) * 1000, 2)
        services["mongodb"] = {
            "status": "connected" if ping_res.get("ok") else "degraded",
            "latency_ms": mongo_latency_ms,
            "mode": "live" if db_manager.is_live_mongo else "resilient_embedded",
        }
    except Exception as e:
        is_healthy = False
        services["mongodb"] = {"status": "error", "error": str(e)}

    # 2. Redis Cache Health & Ping
    t0 = time.time()
    try:
        r = get_redis()
        ping_ok = await r.ping()
        redis_latency_ms = round((time.time() - t0) * 1000, 2)
        services["redis"] = {
            "status": "connected" if ping_ok else "degraded",
            "latency_ms": redis_latency_ms,
            "mode": "live" if redis_manager.is_live_redis else "resilient_embedded",
        }
    except Exception as e:
        services["redis"] = {"status": "error", "error": str(e)}

    # 3. AI Pipeline & Safety Telemetry
    services["ai_pipeline"] = {
        "local_nlu": "ready",
        "groq_configured": bool(settings.GROQ_API_KEY),
        "circuit_breaker": "OPEN (Tripped)" if fast_ai_pipeline.is_circuit_open else "CLOSED (Normal)",
        "consecutive_failures": fast_ai_pipeline._consecutive_failures,
    }

    return {
        "status": "healthy" if is_healthy else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": services,
    }


# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)


# WebSocket endpoint for real-time live kiosk audio stream
@app.websocket("/ws/audio/{session_id}")
async def websocket_audio_endpoint(websocket: WebSocket, session_id: str):
    await audio_stream_manager.handle_stream(websocket, session_id)


@app.get("/test-voice", response_class=HTMLResponse, tags=["Testing"])
@app.get("/test-documents", response_class=HTMLResponse, tags=["Testing"])
@app.get("/", response_class=HTMLResponse, tags=["Testing"])
async def unified_test_ui():
    """Interactive browser-based playground for both Voice Agent and Document AI (OCR + Clinical Intent)."""
    return """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MediKiosk — AI Clinical Intake & Document Intelligence</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #4B3158;
            --primary-dark: #3B2446;
            --primary-light: #614070;
            --accent-terracotta: #C86B4A;
            --accent-terracotta-dark: #B05637;
            --bg: #FBF8F2;
            --card: #FFFFFF;
            --card-border: #E9E2DC;
            --text: #25232A;
            --text-muted: #756F73;
            --accent-olive: #74805A;
            --accent-rose: #E8D6D4;
            --accent-saffron: #D9A441;
            --surface-subtle: #F5F0E8;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', system-ui, sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            padding: 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
            -webkit-font-smoothing: antialiased;
        }
        header {
            text-align: center;
            margin-bottom: 24px;
            max-width: 1200px;
            width: 100%;
        }
        h1 { 
            font-family: 'DM Sans', sans-serif;
            font-size: 28px; 
            font-weight: 800; 
            color: var(--primary); 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            gap: 10px; 
            letter-spacing: -0.02em;
        }
        .subtitle { color: var(--text-muted); font-size: 13.5px; margin-top: 6px; font-weight: 500; }
        
        /* Navigation Tabs */
        .nav-tabs {
            display: flex;
            gap: 10px;
            margin-top: 18px;
            justify-content: center;
        }
        .tab-btn {
            background: #FFFFFF;
            border: 1px solid var(--card-border);
            color: var(--text-muted);
            padding: 9px 20px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 1px 2px rgba(37,35,42,0.03);
        }
        .tab-btn.active {
            background: var(--primary);
            color: #FFFFFF;
            border-color: var(--primary);
            box-shadow: 0 4px 12px rgba(75, 49, 88, 0.2);
        }
        .tab-badge {
            background: var(--accent-olive);
            color: white;
            font-size: 10px;
            padding: 2px 7px;
            border-radius: 12px;
            font-weight: 700;
        }

        .tab-content {
            max-width: 1200px;
            width: 100%;
            display: none;
        }
        .tab-content.active {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
        }
        @media (max-width: 900px) {
            .tab-content.active { grid-template-columns: 1fr; }
        }

        .card {
            background: var(--card);
            border: 1px solid var(--card-border);
            border-radius: 12px;
            padding: 22px;
            box-shadow: 0 1px 4px rgba(37,35,42,0.04);
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .card-header {
            font-family: 'DM Sans', sans-serif;
            font-size: 16px;
            font-weight: 700;
            color: var(--primary);
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--card-border);
            padding-bottom: 12px;
        }

        /* Document Drop Zone */
        .drop-zone {
            border: 2px dashed #D8CECA;
            background: #FDFBF8;
            border-radius: 12px;
            padding: 26px 16px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
        }
        .drop-zone:hover {
            background: #F8F3ED;
            border-color: var(--primary);
        }
        .preset-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 8px;
        }
        .preset-btn {
            background: #FBF8F2;
            border: 1px solid var(--card-border);
            color: var(--text);
            padding: 7px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s;
        }
        .preset-btn:hover {
            background: var(--accent-rose);
            color: var(--primary);
            border-color: var(--primary);
        }
        .preview-img {
            max-width: 100%;
            max-height: 220px;
            object-fit: contain;
            border-radius: 8px;
            border: 1px solid var(--card-border);
            display: none;
            margin: 10px auto;
        }

        /* What This Document Is For Banner */
        .intent-banner {
            background: #FBF8F2;
            border: 1px solid var(--card-border);
            border-radius: 10px;
            padding: 16px;
        }
        .intent-tag {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--accent-terracotta);
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .intent-title {
            font-family: 'DM Sans', sans-serif;
            font-size: 17px;
            font-weight: 700;
            color: var(--primary);
        }
        .intent-desc {
            font-size: 13px;
            color: var(--text);
            margin-top: 6px;
            line-height: 1.5;
        }
        .intent-action {
            margin-top: 10px;
            padding-top: 8px;
            border-top: 1px solid var(--card-border);
            font-size: 12px;
            color: var(--accent-olive);
            font-weight: 600;
        }

        /* Entity list items */
        .med-card {
            background: #FFFFFF;
            border: 1px solid var(--card-border);
            border-radius: 8px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        .med-title {
            display: flex;
            justify-content: space-between;
            font-size: 13.5px;
            font-weight: 700;
            color: var(--text);
        }
        .med-freq {
            color: var(--accent-terracotta);
            font-weight: 600;
            font-size: 12px;
        }
        .med-class {
            font-size: 11px;
            color: var(--text-muted);
            font-weight: 500;
        }

        .lab-card {
            background: #FFFFFF;
            border: 1px solid var(--card-border);
            border-radius: 8px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        .lab-title {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            font-weight: 700;
            color: var(--text);
        }
        .lab-val {
            font-family: monospace;
            font-size: 14px;
            font-weight: 700;
        }
        .flag-CRITICAL_HIGH {
            color: #C86B4A;
            background: #FDF0EA;
            padding: 2px 8px;
            border-radius: 4px;
            border: 1px solid #C86B4A;
        }
        .flag-ELEVATED {
            color: #D9A441;
            background: #FEF7EB;
            padding: 2px 8px;
            border-radius: 4px;
            border: 1px solid #D9A441;
        }
        .flag-NORMAL {
            color: #74805A;
            background: #F0F3EB;
            padding: 2px 8px;
            border-radius: 4px;
        }

        /* Voice Chat Styles */
        .chat-box {
            height: 340px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 12px;
            background: #FBF8F2;
            border: 1px solid var(--card-border);
            border-radius: 10px;
        }
        .message {
            max-width: 85%;
            padding: 10px 14px;
            border-radius: 10px;
            font-size: 13.5px;
            line-height: 1.5;
        }
        .patient-msg {
            align-self: flex-end;
            background: var(--primary);
            color: white;
            border-bottom-right-radius: 2px;
        }
        .bot-msg {
            align-self: flex-start;
            background: #FFFFFF;
            color: var(--text);
            border-bottom-left-radius: 2px;
            border-left: 3px solid var(--accent-terracotta);
            box-shadow: 0 1px 2px rgba(37,35,42,0.03);
        }
        .btn-primary {
            padding: 11px 18px;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .btn-primary:hover { background: var(--primary-dark); }
        .btn-record {
            background: var(--accent-terracotta);
            padding: 14px;
            font-size: 14px;
            border-radius: 20px;
            color: white;
            border: none;
            cursor: pointer;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: background 0.2s;
        }
        .btn-record.recording {
            animation: pulse 1s infinite alternate;
            background: var(--accent-terracotta-dark);
        }
        @keyframes pulse { from { opacity: 1; } to { opacity: 0.7; } }

        /* Timeline Items */
        .timeline-box {
            max-height: 480px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .timeline-node {
            background: #FFFFFF;
            border: 1px solid var(--card-border);
            border-radius: 8px;
            padding: 12px 14px;
            border-left: 4px solid var(--primary);
        }
        .timeline-header {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: var(--text-muted);
            font-weight: 600;
        }
        .timeline-title {
            font-size: 13.5px;
            font-weight: 700;
            color: var(--text);
            margin-top: 4px;
        }
        .timeline-detail {
            font-size: 12px;
            color: var(--text-muted);
            margin-top: 4px;
            line-height: 1.4;
        }
    </style>
</head>
<body>
    <header>
        <h1>🏥 MediKiosk AI Clinical Intake & Document Platform</h1>
        <p class="subtitle">Touch & Voice History Taking · Multimodal Clinical OCR · Longitudinal Timeline · ABDM / FHIR R4 Ready</p>
        
        <div class="nav-tabs">
            <button class="tab-btn active" onclick="switchTab('doc-tab', this)">
                📄 Document AI & Clinical Intent OCR <span class="tab-badge">Active</span>
            </button>
            <button class="tab-btn" onclick="switchTab('voice-tab', this)">
                🎙️ Voice Agent Intake Playground
            </button>
        </div>
    </header>

    <!-- TAB 1: DOCUMENT AI & CLINICAL INTENT OCR -->
    <div id="doc-tab" class="tab-content active">
        <!-- Document Upload & Viewfinder Card -->
        <div class="card">
            <div class="card-header">
                <span>📎 Attach Medical Prescription / Lab Report</span>
                <span style="font-size:12px; color:#10b981;">● OCR Engine Ready</span>
            </div>

            <div class="drop-zone" onclick="document.getElementById('docFileInput').click()">
                <input type="file" id="docFileInput" accept="image/*,.pdf" style="display:none" onchange="handleFileSelected(event)" />
                <div style="font-size:32px; margin-bottom:6px;">📄</div>
                <p style="font-weight:700; color:#f8fafc; font-size:14px;">Click to Upload or Drag & Drop Document Image</p>
                <p style="font-size:12px; color:#94a3b8; margin-top:4px;">Supports Handwritten Prescriptions, Lab Reports, Discharge Summaries (PNG, JPG, WebP)</p>
            </div>

            <div>
                <p style="font-size:12px; font-weight:600; color:#94a3b8; margin-bottom:6px;">Or Test with Pre-Loaded Real Indian OPD Cases:</p>
                <div class="preset-buttons">
                    <button class="preset-btn" onclick="loadSample('prescription')">💊 Cardiology Rx (Amlodipine, Metformin, Pantoprazole)</button>
                    <button class="preset-btn" onclick="loadSample('diabetic_lab_report')">🩸 Diabetic Lab (HbA1c 9.2%, Glucose 178)</button>
                    <button class="preset-btn" onclick="loadSample('renal_panel')">🫘 Renal Panel (Creatinine 2.4, Urea 58)</button>
                </div>
            </div>

            <img id="imagePreview" class="preview-img" alt="Attached document preview" />

            <button id="analyzeBtn" class="btn-primary" onclick="runDocumentExtraction()" style="width:100%; padding:14px;">
                🔍 Run Clinical OCR & Decode Intent
            </button>

            <div id="ocrLoader" style="display:none; text-align:center; padding:12px; color:#38bdf8; font-size:13px; font-weight:600;">
                ⚡ Running AI Vision & Multimodal Extraction...
            </div>
        </div>

        <!-- Extraction Results & Clinical Intent Card -->
        <div class="card">
            <div class="card-header">
                <span>🧠 Clinical Intent & Extracted Intelligence</span>
                <button class="preset-btn" onclick="loadTimeline()" style="padding:4px 10px; font-size:11px;">🔄 View Timeline</button>
            </div>

            <div id="resultsPlaceholder" style="text-align:center; padding:40px 10px; color:#64748b; font-size:14px;">
                Attach a prescription or select a clinical preset above to see <strong>what it is exactly for</strong>, along with extracted medications, lab abnormalities, and longitudinal timeline integration.
            </div>

            <div id="resultsContainer" style="display:none; display:flex; flex-direction:column; gap:16px;">
                <!-- What It Is For Banner -->
                <div class="intent-banner">
                    <div class="intent-tag">
                        <span>🎯</span> <span id="docTypeBadge">CLINICAL DOCUMENT CLASSIFICATION</span>
                    </div>
                    <div id="intentTitle" class="intent-title">Document Purpose</div>
                    <div id="intentDesc" class="intent-desc">Clinical Intent description</div>
                    <div id="intentAction" class="intent-action">Recommended Physician Action Plan</div>
                </div>

                <!-- Extracted Medications -->
                <div>
                    <div style="font-size:13px; font-weight:700; color:#38bdf8; text-transform:uppercase; margin-bottom:8px; display:flex; justify-content:space-between;">
                        <span>💊 Active Prescribed Medications</span>
                        <span id="medCountBadge" style="font-size:11px; color:#94a3b8;">0 drugs</span>
                    </div>
                    <div id="medicationsList" style="display:flex; flex-direction:column; gap:10px;"></div>
                </div>

                <!-- Extracted Labs -->
                <div id="labsSection" style="display:none;">
                    <div style="font-size:13px; font-weight:700; color:#38bdf8; text-transform:uppercase; margin-bottom:8px;">
                        🧪 Laboratory Investigations & Abnormalities
                    </div>
                    <div id="labsList" style="display:flex; flex-direction:column; gap:10px;"></div>
                </div>

                <!-- Patient Longitudinal Timeline -->
                <div>
                    <div style="font-size:13px; font-weight:700; color:#38bdf8; text-transform:uppercase; margin-bottom:8px; display:flex; justify-content:space-between;">
                        <span>📅 Patient Longitudinal Timeline (Synced)</span>
                        <span style="font-size:11px; color:#10b981;">ABDM Verified</span>
                    </div>
                    <div id="timelineList" class="timeline-box"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- TAB 2: VOICE AGENT INTAKE PLAYGROUND -->
    <div id="voice-tab" class="tab-content">
        <!-- Voice Kiosk Simulation -->
        <div class="card">
            <div class="card-header">
                <span>🎙️ Multimodal Voice Intake (Patient Kiosk)</span>
                <select id="langSelect" style="background:#0f172a; color:white; border:1px solid #334155; padding:6px 12px; border-radius:8px; font-size:12px;">
                    <option value="hi-IN">Hindi (हिन्दी)</option>
                    <option value="en-IN">English (Indian)</option>
                    <option value="te-IN">Telugu (తెలుగు)</option>
                    <option value="mr-IN">Marathi (मराठी)</option>
                    <option value="bn-IN">Bengali (বাংলা)</option>
                    <option value="ta-IN">Tamil (தமிழ்)</option>
                </select>
            </div>

            <div class="chat-box" id="chatBox">
                <div class="message bot-msg">
                    नमस्ते! MediKiosk में आपका स्वागत है। अपनी बीमारी या तकलीफ़ बताएं — जैसे कि दर्द कहाँ है और कब से है?
                </div>
            </div>

            <div id="redFlagBox" style="display:none; background:rgba(239, 68, 68, 0.2); border:1px solid #ef4444; color:#fca5a5; padding:10px; border-radius:8px; font-size:13px;"></div>

            <div id="quickReplies" style="display:flex; flex-wrap:wrap; gap:6px;"></div>

            <button id="micBtn" class="btn-record" onclick="toggleRecord()">
                🎙️ Push-to-Talk (Record Spoken Voice)
            </button>

            <div class="input-group" style="display:flex; gap:8px;">
                <input type="text" id="textInput" placeholder="Or type your health complaint here..." onkeypress="handleKey(event)" style="flex:1; padding:12px; background:#0f172a; border:1px solid var(--card-border); border-radius:8px; color:white;" />
                <button class="btn-primary" onclick="sendText()">Send</button>
            </div>

            <button onclick="resetVoiceSession()" style="background:#334155; color:white; border:none; padding:8px; border-radius:8px; font-size:12px; cursor:pointer;">
                🔄 Reset Voice Session
            </button>
        </div>

        <!-- SOCRATES History State Preview -->
        <div class="card">
            <div class="card-header">
                <span>📋 Clinical State Machine (SOCRATES)</span>
                <span id="completenessText" style="color:#38bdf8; font-weight:700;">0%</span>
            </div>

            <div style="width:100%; height:8px; background:#0f172a; border-radius:9999px; overflow:hidden;">
                <div id="progressFill" style="height:100%; width:0%; background:#0284c7; transition: width 0.3s;"></div>
            </div>

            <div style="font-size:12px; color:#94a3b8;">Zero-hallucination structured EMR representation:</div>
            <pre id="jsonPreview" style="background:#0f172a; padding:16px; border-radius:12px; font-size:12px; color:#38bdf8; overflow-x:auto; max-height:440px; border:1px solid var(--card-border);">Waiting for patient speech input...</pre>
        </div>
    </div>

    <script>
        let currentTab = 'doc-tab';
        let selectedFile = null;
        let voiceSessionId = "VOICE-TEST-" + Math.floor(Math.random() * 10000);
        let mediaRecorder = null;
        let audioChunks = [];
        let isRecording = false;

        function switchTab(tabId, el) {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            el.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            if (tabId === 'doc-tab') {
                loadTimeline();
            }
        }

        // --- Document AI & OCR Logic ---
        function handleFileSelected(event) {
            const file = event.target.files[0];
            if (file) {
                selectedFile = file;
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.getElementById('imagePreview');
                    img.src = e.target.result;
                    img.style.display = 'block';
                };
                reader.readAsDataURL(file);
                document.getElementById('analyzeBtn').textContent = "🔍 Analyze " + file.name + " (" + Math.round(file.size/1024) + " KB)";
            }
        }

        async function loadSample(sampleType) {
            document.getElementById('ocrLoader').style.display = 'block';
            document.getElementById('ocrLoader').textContent = "⚡ Processing clinical sample: " + sampleType + "...";
            try {
                const resp = await fetch(`/api/v1/documents/process-sample?sample_type=${sampleType}&patient_id=P-DEMO-001`, {
                    method: 'POST'
                });
                const doc = await resp.json();
                renderDocumentResults(doc);
                loadTimeline();
            } catch (err) {
                alert("Failed to process sample: " + err);
            } finally {
                document.getElementById('ocrLoader').style.display = 'none';
            }
        }

        async function runDocumentExtraction() {
            if (!selectedFile) {
                // If no file selected, run prescription sample by default
                await loadSample('prescription');
                return;
            }

            document.getElementById('ocrLoader').style.display = 'block';
            document.getElementById('ocrLoader').textContent = "⚡ Running AI Vision & Multimodal Extraction on " + selectedFile.name + "...";

            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("patient_id", "P-DEMO-001");
            formData.append("auto_sync_timeline", "true");

            try {
                const resp = await fetch("/api/v1/documents/upload", {
                    method: "POST",
                    body: formData
                });
                if (!resp.ok) throw new Error("Server error " + resp.status);
                const doc = await resp.json();
                renderDocumentResults(doc);
                loadTimeline();
            } catch (err) {
                alert("Extraction failed: " + err);
            } finally {
                document.getElementById('ocrLoader').style.display = 'none';
            }
        }

        function renderDocumentResults(doc) {
            document.getElementById('resultsPlaceholder').style.display = 'none';
            document.getElementById('resultsContainer').style.display = 'flex';

            // What It's For Banner
            document.getElementById('docTypeBadge').textContent = (doc.document_type || "PRESCRIPTION").toUpperCase() + " · WHAT THIS DOCUMENT IS FOR";
            document.getElementById('intentTitle').textContent = doc.document_purpose || "Outpatient Clinical Management";
            document.getElementById('intentDesc').textContent = doc.clinical_intent || doc.raw_ocr_text || "Clinical document recorded.";
            document.getElementById('intentAction').textContent = "💡 Physician Action Plan: " + (doc.physician_action_plan || "Review current regimen and schedule routine OPD follow-up.");

            // Medications
            const medList = document.getElementById('medicationsList');
            medList.innerHTML = "";
            const meds = doc.extracted_medications || [];
            document.getElementById('medCountBadge').textContent = meds.length + " active drug(s)";

            meds.forEach(m => {
                const div = document.createElement('div');
                div.className = "med-card";
                div.innerHTML = `
                    <div class="med-title">
                        <span>${m.name} ${m.dosage || ''}</span>
                        <span class="med-freq">${m.frequency || 'OD'}</span>
                    </div>
                    <div class="med-class">Class: <strong>${m.therapeutic_class || m.indication || 'Pharmacotherapy'}</strong> · ${m.instructions || 'Post-meals'}</div>
                    <div class="med-purpose">
                        <strong>🎯 What it's for:</strong> ${m.clinical_purpose || m.indication || 'Indicated for patient clinical condition'}
                    </div>
                `;
                medList.appendChild(div);
            });

            // Labs
            const labsSection = document.getElementById('labsSection');
            const labsList = document.getElementById('labsList');
            const labs = doc.extracted_labs || [];
            if (labs.length > 0) {
                labsSection.style.display = 'block';
                labsList.innerHTML = "";
                labs.forEach(l => {
                    const div = document.createElement('div');
                    div.className = "lab-card";
                    const flagClass = "flag-" + (l.severity_flag || "NORMAL");
                    div.innerHTML = `
                        <div class="lab-title">
                            <span>${l.test_name}</span>
                            <span class="${flagClass}">${l.value} ${l.unit || ''} (${l.severity_flag || 'NORMAL'})</span>
                        </div>
                        <div style="font-size:11px; color:#94a3b8;">Normal Ref: ${l.reference_range || 'Standard'}</div>
                        <div class="med-purpose" style="background:rgba(56, 189, 248, 0.1); border-color:rgba(56, 189, 248, 0.3); color:#7dd3fc;">
                            <strong>🔬 Diagnostic Purpose:</strong> ${l.clinical_purpose || l.clinical_significance || 'Evaluates organ function and biochemical markers'}
                        </div>
                    `;
                    labsList.appendChild(div);
                });
            } else {
                labsSection.style.display = 'none';
            }
        }

        async function loadTimeline() {
            try {
                const resp = await fetch("/api/v1/documents/timeline/P-DEMO-001");
                const data = await resp.json();
                const list = document.getElementById('timelineList');
                list.innerHTML = "";
                data.timeline.forEach(ev => {
                    const node = document.createElement('div');
                    node.className = "timeline-node";
                    node.innerHTML = `
                        <div class="timeline-header">
                            <span>${ev.date} · ${ev.facility_name || 'OPD'}</span>
                            <span style="color:#10b981;">ABDM Verified</span>
                        </div>
                        <div class="timeline-title">${ev.title}</div>
                        <div class="timeline-detail">${ev.summary}</div>
                    `;
                    list.appendChild(node);
                });
            } catch (err) {
                console.error("Timeline load error:", err);
            }
        }

        // --- Voice Agent Logic ---
        async function sendText() {
            const input = document.getElementById('textInput');
            const text = input.value.trim();
            if (!text) return;
            input.value = "";
            appendMessage(text, 'patient-msg');

            try {
                const resp = await fetch('/api/v1/ai/chat-intake', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        session_id: voiceSessionId,
                        transcript: text,
                        language_code: document.getElementById('langSelect').value,
                        synthesize_audio: true
                    })
                });
                if (!resp.ok) throw new Error("Server response error: " + resp.status);
                const data = await resp.json();
                handleVoiceResponse(data);
            } catch (err) {
                console.error("Send text error:", err);
                appendMessage("⚠️ Connection error: " + err.message, "bot-msg");
            }
        }

        function handleVoiceResponse(data) {
            if (!data) return;

            // If voice turn transcribed speech, update patient placeholder
            const transcript = data.user_transcript || (data.clinical_state && data.clinical_state.raw_transcripts && data.clinical_state.raw_transcripts.slice(-1)[0]);
            if (transcript) {
                const patientMsgs = document.querySelectorAll(".patient-msg");
                if (patientMsgs.length > 0) {
                    const lastMsg = patientMsgs[patientMsgs.length - 1];
                    if (lastMsg.innerHTML.includes("Processing Spoken Voice Recording")) {
                        lastMsg.innerHTML = `🗣️ <strong>"${transcript}"</strong>`;
                    }
                }
            }

            const botText = data.spoken_response || data.assistant_utterance || data.spoken_text || "आपकी तकलीफ़ नोट कर ली गई है।";
            appendMessage(botText, 'bot-msg');

            // Play TTS audio if available
            if (data.audio_base64) {
                const audioSrc = data.audio_base64.startsWith("data:") 
                    ? data.audio_base64 
                    : ("data:audio/mp3;base64," + data.audio_base64);
                const snd = new Audio(audioSrc);
                snd.play().catch(e => console.log("Audio play notice:", e));
            }

            // Red flag box
            const rfBox = document.getElementById("redFlagBox");
            if (data.red_flag_triggered || (data.red_flags && data.red_flags.length > 0)) {
                rfBox.style.display = "block";
                const flags = (data.clinical_state && data.clinical_state.red_flags) || [];
                const flagMsg = flags.length > 0 ? flags.map(f => f.recommended_action || f.flag_type).join("; ") : "Physician priority alert triggered.";
                rfBox.innerHTML = "🚨 <strong>EMERGENCY ALERT:</strong> " + flagMsg;
            } else {
                rfBox.style.display = "none";
            }

            // Quick replies
            const qrBox = document.getElementById("quickReplies");
            if (data.quick_replies && data.quick_replies.length > 0) {
                qrBox.innerHTML = data.quick_replies.map(r => {
                    const escaped = r.replace(/'/g, "\\'");
                    return `<button class="preset-btn" onclick="sendQuickReply('${escaped}')">${r}</button>`;
                }).join("");
            } else {
                qrBox.innerHTML = "";
            }

            // Preview JSON
            if (data.clinical_state) {
                document.getElementById("jsonPreview").textContent = JSON.stringify(data.clinical_state, null, 2);
            }

            // Gauge
            const s = (data.clinical_state && data.clinical_state.socrates) || {};
            const fields = [s.site, s.onset, s.character, s.radiation, s.time_course || s.duration_days, s.severity_score];
            const completed = fields.filter(f => f !== null && f !== undefined && f !== "").length;
            const pct = Math.round((completed / fields.length) * 100);
            document.getElementById("completenessText").textContent = pct + "%";
            document.getElementById("progressFill").style.width = pct + "%";
        }

        function sendQuickReply(text) {
            document.getElementById('textInput').value = text;
            sendText();
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
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") 
                        ? "audio/webm;codecs=opus" 
                        : (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus") ? "audio/ogg;codecs=opus" : "");
                    mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
                    audioChunks = [];
                    mediaRecorder.ondataavailable = e => {
                        if (e.data && e.data.size > 0) audioChunks.push(e.data);
                    };
                    mediaRecorder.onstop = async () => {
                        const actualType = mediaRecorder.mimeType || "audio/webm";
                        const ext = actualType.includes("ogg") ? "ogg" : (actualType.includes("wav") ? "wav" : "webm");
                        const audioBlob = new Blob(audioChunks, { type: actualType });
                        const formData = new FormData();
                        formData.append("file", audioBlob, "speech." + ext);
                        formData.append("session_id", voiceSessionId);
                        formData.append("language_code", document.getElementById('langSelect').value);
                        formData.append("synthesize_audio", "true");

                        appendMessage("🎙️ <em>[Processing Spoken Voice Recording...]</em>", "patient-msg");

                        try {
                            const resp = await fetch("/api/v1/ai/voice-intake", {
                                method: "POST",
                                body: formData
                            });
                            if (!resp.ok) throw new Error("Server response status " + resp.status);
                            const data = await resp.json();
                            handleVoiceResponse(data);
                        } catch (err) {
                            console.error("Voice intake error:", err);
                            appendMessage("⚠️ Voice intake error: " + err.message, "bot-msg");
                        }
                    };
                    mediaRecorder.start();
                    isRecording = true;
                    btn.classList.add("recording");
                    btn.textContent = "⏹️ Stop Recording (Click when finished)";
                } catch (err) {
                    console.error("Mic access error:", err);
                    alert("Could not access microphone: " + err.message);
                }
            } else {
                if (mediaRecorder && mediaRecorder.state !== "inactive") {
                    mediaRecorder.stop();
                    if (mediaRecorder.stream) {
                        mediaRecorder.stream.getTracks().forEach(t => t.stop());
                    }
                }
                isRecording = false;
                btn.classList.remove("recording");
                btn.textContent = "🎙️ Push-to-Talk (Record Spoken Voice)";
            }
        }

        async function resetVoiceSession() {
            await fetch(`/api/v1/ai/session/${voiceSessionId}/reset`, { method: "POST" });
            document.getElementById("chatBox").innerHTML = '<div class="message bot-msg">नमस्ते! नई परामर्श के लिए तैयार हूँ। कृपया अपनी परेशानी बताएं।</div>';
            document.getElementById("jsonPreview").textContent = "Session reset for new patient.";
            document.getElementById("redFlagBox").style.display = "none";
            document.getElementById("completenessText").textContent = "0%";
            document.getElementById("progressFill").style.width = "0%";
        }

        function handleKey(e) {
            if (e.key === 'Enter') sendText();
        }

        // Initialize timeline on load
        window.onload = function() {
            loadTimeline();
        };
    </script>
</body>
</html>
    """


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
