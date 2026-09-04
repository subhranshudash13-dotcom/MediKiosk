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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #0284c7;
            --primary-dark: #0369a1;
            --bg: #0b1329;
            --card: #152238;
            --card-border: #233554;
            --text: #f8fafc;
            --text-muted: #94a3b8;
            --accent-green: #10b981;
            --accent-red: #ef4444;
            --accent-yellow: #f59e0b;
            --accent-purple: #8b5cf6;
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
        header {
            text-align: center;
            margin-bottom: 20px;
            max-width: 1200px;
            width: 100%;
        }
        h1 { font-size: 28px; font-weight: 800; color: #38bdf8; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .subtitle { color: var(--text-muted); font-size: 14px; margin-top: 6px; }
        
        /* Navigation Tabs */
        .nav-tabs {
            display: flex;
            gap: 12px;
            margin-top: 16px;
            justify-content: center;
        }
        .tab-btn {
            background: #1e293b;
            border: 1px solid var(--card-border);
            color: var(--text-muted);
            padding: 10px 22px;
            border-radius: 9999px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .tab-btn.active {
            background: #0284c7;
            color: white;
            border-color: #38bdf8;
            box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);
        }
        .tab-badge {
            background: #10b981;
            color: white;
            font-size: 10px;
            padding: 2px 8px;
            border-radius: 9999px;
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
            border-radius: 16px;
            padding: 22px;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4);
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .card-header {
            font-size: 16px;
            font-weight: 700;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--card-border);
            padding-bottom: 12px;
        }

        /* Document Drop Zone */
        .drop-zone {
            border: 2px dashed #38bdf8;
            background: rgba(56, 189, 248, 0.05);
            border-radius: 14px;
            padding: 28px 16px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
        }
        .drop-zone:hover {
            background: rgba(56, 189, 248, 0.12);
            border-color: #0284c7;
        }
        .preset-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 8px;
        }
        .preset-btn {
            background: #1e293b;
            border: 1px solid var(--card-border);
            color: #cbd5e1;
            padding: 8px 14px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s;
        }
        .preset-btn:hover {
            background: #334155;
            color: white;
            border-color: #38bdf8;
        }
        .preview-img {
            max-width: 100%;
            max-height: 220px;
            object-fit: contain;
            border-radius: 10px;
            border: 1px solid var(--card-border);
            display: none;
            margin: 10px auto;
        }

        /* What This Document Is For Banner */
        .intent-banner {
            background: linear-gradient(135deg, rgba(2, 132, 199, 0.15), rgba(139, 92, 246, 0.15));
            border: 1px solid rgba(56, 189, 248, 0.4);
            border-radius: 14px;
            padding: 16px;
        }
        .intent-tag {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #38bdf8;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .intent-title {
            font-size: 18px;
            font-weight: 700;
            color: #ffffff;
        }
        .intent-desc {
            font-size: 13px;
            color: #cbd5e1;
            margin-top: 6px;
            line-height: 1.5;
        }
        .intent-action {
            margin-top: 10px;
            padding-top: 8px;
            border-top: 1px solid rgba(255,255,255,0.1);
            font-size: 12px;
            color: #34d399;
            font-weight: 600;
        }

        /* Entity list items */
        .med-card {
            background: #0f172a;
            border: 1px solid var(--card-border);
            border-radius: 12px;
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .med-title {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            font-weight: 700;
            color: #f8fafc;
        }
        .med-freq {
            color: #38bdf8;
            font-weight: 600;
            font-size: 12px;
        }
        .med-purpose {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.25);
            color: #6ee7b7;
            padding: 6px 10px;
            border-radius: 8px;
            font-size: 12px;
            line-height: 1.4;
        }
        .med-class {
            font-size: 11px;
            color: #94a3b8;
            font-weight: 500;
        }

        .lab-card {
            background: #0f172a;
            border: 1px solid var(--card-border);
            border-radius: 12px;
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .lab-title {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            font-weight: 700;
            color: #f8fafc;
        }
        .lab-val {
            font-family: monospace;
            font-size: 15px;
            font-weight: 700;
        }
        .flag-CRITICAL_HIGH {
            color: #ef4444;
            background: rgba(239, 68, 68, 0.15);
            padding: 2px 8px;
            border-radius: 6px;
            border: 1px solid #ef4444;
        }
        .flag-ELEVATED {
            color: #f59e0b;
            background: rgba(245, 158, 11, 0.15);
            padding: 2px 8px;
            border-radius: 6px;
            border: 1px solid #f59e0b;
        }
        .flag-NORMAL {
            color: #10b981;
            background: rgba(16, 185, 129, 0.15);
            padding: 2px 8px;
            border-radius: 6px;
        }

        /* Voice Chat Styles */
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
        .btn-primary {
            padding: 12px 20px;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .btn-primary:hover { background: var(--primary-dark); }
        .btn-record {
            background: #ef4444;
            padding: 16px;
            font-size: 15px;
            border-radius: 12px;
            color: white;
            border: none;
            cursor: pointer;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        .btn-record.recording {
            animation: pulse 1s infinite alternate;
            background: #b91c1c;
        }
        @keyframes pulse { from { opacity: 1; } to { opacity: 0.6; } }

        /* Timeline Items */
        .timeline-box {
            max-height: 480px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .timeline-node {
            background: #0f172a;
            border: 1px solid var(--card-border);
            border-radius: 12px;
            padding: 12px 16px;
            border-left: 4px solid #38bdf8;
        }
        .timeline-header {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #94a3b8;
            font-weight: 600;
        }
        .timeline-title {
            font-size: 14px;
            font-weight: 700;
            color: #f8fafc;
            margin-top: 4px;
        }
        .timeline-detail {
            font-size: 12px;
            color: #cbd5e1;
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

            const resp = await fetch('/api/v1/ai/dialogue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: voiceSessionId,
                    user_utterance: text,
                    language_code: document.getElementById('langSelect').value,
                    synthesize_audio: true
                })
            });
            const data = await resp.json();
            handleVoiceResponse(data);
        }

        function handleVoiceResponse(data) {
            appendMessage(data.assistant_utterance, 'bot-msg');

            // Play TTS audio if available
            if (data.audio_base64) {
                const snd = new Audio("data:audio/mp3;base64," + data.audio_base64);
                snd.play().catch(e => console.log("Audio play error:", e));
            }

            // Red flag box
            const rfBox = document.getElementById("redFlagBox");
            if (data.red_flags && data.red_flags.length > 0) {
                rfBox.style.display = "block";
                rfBox.innerHTML = "🚨 <strong>EMERGENCY ALERT:</strong> " + data.red_flags.join(", ");
            } else {
                rfBox.style.display = "none";
            }

            // Quick replies
            const qrBox = document.getElementById("quickReplies");
            if (data.quick_replies && data.quick_replies.length > 0) {
                qrBox.innerHTML = data.quick_replies.map(r =>
                    `<button class="preset-btn" onclick="sendQuickReply('${r}')">${r}</button>`
                ).join("");
            }

            // Preview JSON
            document.getElementById("jsonPreview").textContent = JSON.stringify(data.clinical_state, null, 2);

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
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
                mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
                    const formData = new FormData();
                    formData.append("file", audioBlob, "speech.wav");
                    formData.append("session_id", voiceSessionId);
                    formData.append("language_code", document.getElementById('langSelect').value);
                    formData.append("synthesize_audio", "true");

                    appendMessage("🎙️ [Audio Recording Sent...]", "patient-msg");

                    const resp = await fetch("/api/v1/ai/voice-intake", {
                        method: "POST",
                        body: formData
                    });
                    const data = await resp.json();
                    handleVoiceResponse(data);
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
