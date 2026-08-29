# 🏥 MediKiosk — Master Implementation & Architectural Execution Plan
> **Objective**: Build and deliver a production-grade, award-winning AI Clinical History Intake & ABDM Integration Platform for high-density Indian hospitals (Allopathic & AYUSH OPDs).

---

## 📌 Executive Architecture & Stack Overview

```
                                  ┌────────────────────────────────────────┐
                                  │      MediKiosk Client Surfaces         │
                                  ├───────────────────┬────────────────────┤
                                  │  21.5" Kiosk UI   │  Doctor Dashboard  │
                                  │ (Next.js/Zustand) │ (Next.js/Tailwind) │
                                  └─────────┬─────────┴─────────┬──────────┘
                                            │                   │
                                     HTTPS / WSS          HTTPS / WSS
                                            │                   │
                                            ▼                   ▼
                                  ┌────────────────────────────────────────┐
                                  │        FastAPI API Gateway Layer       │
                                  │  (CORS, Rate Limit, Auth, Session Mgr) │
                                  └─────────┬───────────────────┬──────────┘
                                            │                   │
                     ┌──────────────────────┴──────┐            │
                     │                             │            │
                     ▼                             ▼            ▼
     ┌──────────────────────────────┐    ┌──────────────────────────────┐
     │   Module A: Speech & AI      │    │  Module B: Document AI       │
     ├──────────────────────────────┤    ├──────────────────────────────┤
     │ • ASR: Bhashini / Whisper    │    │ • OCR: Azure Doc / Vision    │
     │ • TTS: Bhashini / Eleven     │    │ • NER: Gemini 1.5 / LayoutLM │
     │ • LLM: SOCRATES / AYUSH      │    │ • Lab Out-of-Range Engine    │
     └──────────────┬───────────────┘    └──────────────┬───────────────┘
                    │                                   │
                    └─────────────────┬─────────────────┘
                                      │
                                      ▼
     ┌──────────────────────────────────────────────────────────────────┐
     │   Module C & D: Clinical Summary, FHIR R4 & ABDM Gateway         │
     ├──────────────────────────────────────────────────────────────────┤
     │ • FHIR R4 Bundles (Patient, Encounter, Condition, Observation)   │
     │ • ABDM M1 (ABHA Creation/Verify), M2 (HIP Linking), M3 (HIU)     │
     │ • DPDP Act 2023 Consent & Immediate Session Data Destruction     │
     └────────────────────────────────┬─────────────────────────────────┘
                                      │
                                      ▼
     ┌──────────────────────────────────────────────────────────────────┐
     │          Persistence, Queue & Storage Infrastructure             │
     ├────────────────────────────────┬─────────────────────────────────┤
     │ MongoDB Atlas (FHIR Records)   │ Redis / Celery (Async Tasks)    │
     │ AWS S3 / MinIO (Temp OCR Docs) │ Local In-Memory Fast Cache      │
     └────────────────────────────────┴─────────────────────────────────┘
```

---

## 🔑 Required API Keys & Service Credentials Matrix

To guarantee 100% zero-failure operation during live judge evaluations and production deployment, every module incorporates a **Primary Service** with an **Automated Failover Mock/Secondary Service**.

| Service Category | Primary Provider / API | Purpose | Environment Variable Names | Fallback / Local Backup |
|---|---|---|---|---|
| **Speech Recognition (ASR)** | **Bhashini / AI4Bharat (ULCA API)** | Speech-to-Text for 22 Indian regional languages & accents | `BHASHINI_API_KEY`<br>`BHASHINI_USER_ID`<br>`BHASHINI_PIPELINE_ID` | OpenAI Whisper API (`OPENAI_API_KEY`) / Web Speech API |
| **Speech Synthesis (TTS)** | **Bhashini TTS / ElevenLabs** | Clear native-language audio prompts for non-literate patients | `BHASHINI_TTS_KEY`<br>`ELEVENLABS_API_KEY` | Browser Native SpeechSynthesis API |
| **Conversational Clinical LLM** | **Google Gemini 1.5 Pro / Flash** | SOCRATES adaptive history taking, AYUSH Dashavidha, and EMR summarization | `GEMINI_API_KEY` | OpenAI GPT-4o (`OPENAI_API_KEY`) / Anthropic Claude 3.5 Sonnet (`ANTHROPIC_API_KEY`) |
| **Medical Document OCR** | **Azure AI Document Intelligence** (or **Google Cloud Vision**) | Dense printed & cursive handwritten prescription & lab report OCR | `AZURE_VISION_ENDPOINT`<br>`AZURE_VISION_KEY`<br>`GCP_VISION_API_KEY` | Tesseract OCR / EasyOCR (local containerized) |
| **ABDM Gateway Sandbox** | **National Health Authority (NHA) Sandbox** | ABHA generation, KYC OTP, HIP/HIU Data Exchange, FHIR validation | `ABDM_CLIENT_ID`<br>`ABDM_CLIENT_SECRET`<br>`ABDM_SANDBOX_URL` | Mock ABDM Gateway (Pre-seeded real-schema dummy ABHA IDs) |
| **Database & Cache** | **MongoDB Atlas M0 + Upstash Redis** | Persistent FHIR Document Store, session states & rate limiting | `MONGODB_URI`<br>`REDIS_URL` | Local MongoDB / Local In-Memory Python Dicts |
| **Object Storage** | **Cloudinary / AWS S3 / Supabase Storage** | Encrypted temporary storage for prescription scans before parsing | `CLOUDINARY_URL`<br>`AWS_ACCESS_KEY_ID`<br>`AWS_SECRET_ACCESS_KEY` | Local temporary directory (`/temp/uploads`) |

---

## 📅 Multi-Phase Master Implementation Roadmap

```
PHASE 1: Foundation & Resilient Infrastructure (Days 1–2)
├── Setup unified repository architecture & type definitions
├── Secure API keys & configuration management (.env validation)
├── Stand up FastAPI core with Pydantic v2 & MongoDB Motor async client
└── Setup Next.js 14 App Router with Tailwind design system & sound assets

PHASE 2: Multimodal Speech & Multilingual Core (Days 3–4)
├── Implement WebSocket streaming audio server (`/ws/audio`)
├── Connect Bhashini / Whisper ASR & TTS pipelines
├── Build Voice Activity Detection (VAD) & noise cancellation filters
└── Develop high-contrast Kiosk UI with synchronous visual & audio guidance

PHASE 3: Clinical Intelligence & AYUSH Engine (Days 5–6)
├── Implement SOCRATES Adaptive Elicitation Framework
├── Build AYUSH Dashavidha & Ashtavidha Pariksha module
├── Develop Emergency Red Flag Triage detector (<50ms response)
└── Implement Doctor-in-the-Loop Clinical Summary Synthesizer

PHASE 4: Document OCR & Longitudinal Timeline Engine (Days 7–8)
├── Deploy multi-engine OCR pipeline (Azure + Cloud Vision + Tesseract)
├── Medical NER: Extract drugs, dosages, diagnoses, test parameters
├── Build Out-of-Range Lab Flagging & Drug Interaction rules
└── Construct Interactive Patient Longitudinal Timeline view

PHASE 5: ABDM Sandbox, FHIR R4 & DPDP Compliance (Days 9–10)
├── Integrate ABDM Milestones M1, M2, and M3 APIs
├── Implement ABDM compliant FHIR R4 Bundle generator & validator
├── Build Audio-visual DPDP Act 2023 Consent flow
└── Implement Zero-Trust Kiosk Session Destruction mechanism

PHASE 6: Polish, Failover Engineering & Hackathon Winning Demo (Days 11–12)
├── End-to-end integrated stress testing & edge-case handling
├── Build "Demo Mode / Sandbox Switcher" for flawless presentation
├── Create realistic patient personas (Emergency, Rural AYUSH, Chronic Diabetic)
└── Prepare pitch deck, architecture video, and interactive judge walkthrough
```

---

## 🛠️ Phase-by-Phase Technical Execution Details

---

### Phase 1: Foundation, Schemas & Infrastructure
- **Objective**: Establish the bedrock architecture, error handling, strict typing, and database connectivity.
- **Tasks**:
  1. **Config & Environment Engine**:
     - Implement `backend/app/core/config.py` using `pydantic-settings` to strictly validate all API keys on startup.
     - Provide fallback defaults so local development and offline judge environments never crash.
  2. **Database & Connection Pooling**:
     - Configure `backend/app/core/database.py` with Motor (async MongoDB) and Redis client with automatic reconnect.
  3. **Standard Response & Exception Handlers**:
     - Build centralized middleware for logging, CORS, rate limiting, and structured JSON responses (`{ success, data, error, timestamp }`).
  4. **Frontend Design Tokens & Kiosk Shell**:
     - Configure `tailwind.config.ts` with custom healthcare tokens (Accessible Emerald `#059669`, Medical Indigo `#4F46E5`, Alert Rose `#E11D48`, Warm Slate `#0F172A`).
     - Install Lucide Icons, Framer Motion, Howler.js (for tactile audio feedback), and TanStack Query.

---

### Phase 2: Speech Streaming & Multilingual Conversational Pipeline
- **Objective**: Flawless real-time voice and touch interaction for non-literate and regional language patients.
- **Tasks**:
  1. **WebSocket Real-Time Audio Server**:
     - Endpoint: `ws://localhost:8000/api/v1/ws/audio`
     - Accept binary audio chunks (PCM 16kHz / WebM Opus) from browser `AudioWorklet`.
     - Implement Voice Activity Detection (VAD) via `webrtcvad` / Silero VAD to detect when user stops speaking.
  2. **Bhashini & Whisper Integration**:
     - Create `backend/app/services/ai/speech.py`.
     - Route Indian regional languages (Hindi, Tamil, Telugu, Bengali, Odia, Marathi, Gujarati) to Bhashini ULCA pipeline.
     - Fallback to OpenAI Whisper or local Web Speech API if network latency exceeds threshold.
  3. **Interactive Audio Prompts (TTS)**:
     - Generate audio prompts dynamically for each clinical question.
     - Cache frequently used system prompts (`"Please describe where it hurts"`, `"Do you have any prior prescriptions?"`) in static audio files for zero-latency instant playback.
  4. **Kiosk UI Voice Interface**:
     - Large animated microphone ripple effect indicating listening/processing states.
     - Large on-screen dual-mode option cards: Patient can tap OR speak their answer.

---

### Phase 3: Clinical Intelligence, SOCRATES & AYUSH Engine
- **Objective**: Structure raw conversational dialogue into standard clinical ontologies and detect emergencies instantly.
- **Tasks**:
  1. **SOCRATES Question Engine**:
     - Dynamic state machine: `Site` $\rightarrow$ `Onset` $\rightarrow$ `Character` $\rightarrow$ `Radiation` $\rightarrow$ `Associations` $\rightarrow$ `Timing` $\rightarrow$ `Exacerbating/Relieving` $\rightarrow$ `Severity (1-10)`.
     - Interactive visual body map for intuitive touch selection.
  2. **AYUSH History Taking Mode**:
     - Extended questionnaire for *Dashavidha Pariksha* (Prakriti, Vikriti, Sara, Samhanana, Pramana, Satmya, Sattva, Ahara Shakti, Vyayama Shakti, Vaya).
     - Lifestyle and dietary habits analysis (*Ahara-Vihara*).
  3. **Emergency Red Flag Detection**:
     - Rule engine + zero-shot LLM classifier evaluating every response against critical symptom keywords (e.g., crushing chest pain, radiating left arm pain, unilateral weakness, hemoptysis, severe shortness of breath).
     - Instantly triggers a high-priority banner and dispatches a WebSocket notification to the Doctor & Triage Nurse desk.
  4. **Physician Clinical Summary Synthesizer**:
     - Formats raw interview and OCR data into standard SOAP/EMR format:
       `Chief Complaint -> HPI -> Past Medical/Surgical -> Medications -> Allergies -> Family/Personal -> Review of Systems -> Abnormal Labs -> Flagged Risks`.

---

### Phase 4: Medical Document OCR & Longitudinal Timeline Engine
- **Objective**: Transform messy physical prescriptions and lab test slips into structured medical timelines.
- **Tasks**:
  1. **Multi-Engine Document Pipeline**:
     - Image preprocessing: Auto-orientation, contrast enhancement, noise reduction using OpenCV/Pillow.
     - Multi-engine OCR router: Azure Document Intelligence for dense medical forms, Google Cloud Vision for handwritten cursive texts, local Tesseract for offline fallback.
  2. **Medical NER & Structured Extraction**:
     - Prompt Gemini 1.5 Pro with structured Pydantic schema to extract:
       - **Medications**: Name, Strength (mg/ml), Dosage form (tab/syr), Frequency (1-0-1), Duration.
       - **Laboratory Tests**: Parameter name, Measured value, Unit, Normal reference range, Abnormal flag (`HIGH`, `LOW`, `CRITICAL`).
       - **Diagnoses & Dates**: ICD-10 compatible problem list.
  3. **Longitudinal Patient Timeline**:
     - Chronologically sorts all historical records into an interactive doctor timeline with filtering by Lab Tests, Prescriptions, and Diagnoses.

---

### Phase 5: ABDM Sandbox, FHIR R4 & DPDP Compliance
- **Objective**: Full national digital health stack integration and legal compliance.
- **Tasks**:
  1. **ABDM M1 (ABHA Creation & Verification)**:
     - ABHA number search, Aadhaar OTP authentication, and ABHA Address creation (`patient@abdm`).
     - QR code check-in simulation (scanning ABDM card QR to instantly auto-fill demographics).
  2. **ABDM M2 & M3 (HIP/HIU Data Exchange)**:
     - Push structured health records (`CareContext`) to hospital repository.
     - Request and link prior health records via ABDM consent manager.
  3. **FHIR R4 Bundle Standardization**:
     - Standard JSON schema generator for: `Bundle`, `Patient`, `Encounter`, `Condition`, `Observation`, `MedicationRequest`, `DocumentReference`.
  4. **DPDP Act 2023 Compliance & Zero-Trust Session Wipe**:
     - Visual & Audio consent disclosure with clear plain-language audio playback.
     - **Session Termination**: After patient clicks "Finish" (or after 90s idle timer), all session state, audio buffers, and uploaded temp images are permanently wiped from the client kiosk.

---

### Phase 6: Polish, Failover Engineering & Hackathon Winning Demo
- **Objective**: Ensure the live demonstration is jaw-dropping, bulletproof, and leaves judges with zero doubts.
- **Tasks**:
  1. **"Instant Demo Mode / Persona Switcher"**:
     - Add a discreet developer drawer in the top corner allowing one-click loading of pre-recorded test cases:
       - *Scenario A (Cardiac Emergency)*: Chest pain radiating to jaw $\rightarrow$ Triggers instant Red Flag Triage banner.
       - *Scenario B (Rural Diabetic Patient)*: Spoken Hindi narration + paper lab report upload $\rightarrow$ Extracts HbA1c 10.4%, generates bilingual summary.
       - *Scenario C (AYUSH OPD Intake)*: Chronic Joint Pain $\rightarrow$ Elicits Vata-Kapha Prakriti, Agni imbalance, and dietary habits.
  2. **Live Latency & Health Indicator**:
     - Doctor dashboard displays real-time kiosk connection status, WebSocket latency metrics, and ABDM Sandbox connectivity status.
  3. **Audio-Visual WOW Factor**:
     - Smooth micro-interactions, responsive sound effects on touch, animated waveforms during speech recognition, and medical-grade dark/light mode for doctors.

---

## 👥 Persona Demonstration Walkthrough for Judges

```
   ┌─────────────────────────────────────────────────────────────┐
   │ 1. Kiosk Idle Screen: Multilingual Welcome                  │
   │    • Patient selects "हिंदी" (Hindi) or "English"           │
   │    • Audio prompt: "नमस्ते, अपना इलाज शुरू करने के लिए..." │
   └──────────────────────────────┬──────────────────────────────┘
                                  │
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ 2. ABHA Check-In & Audio-Guided DPDP Consent                │
   │    • Tap/Scan ABHA Card -> Demographics populated           │
   │    • Audio explains data privacy -> Patient taps "सहमत हूँ"│
   └──────────────────────────────┬──────────────────────────────┘
                                  │
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ 3. Voice & Touch Clinical Elicitation                       │
   │    • Patient speaks: "मुझे 3 दिन से सीने में दर्द है"       │
   │    • AI activates SOCRATES engine with dynamic follow-ups   │
   │    • Red flag triggered: Alerts nurse station immediately  │
   └──────────────────────────────┬──────────────────────────────┘
                                  │
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ 4. Document Scanning & OCR Extraction                       │
   │    • Patient uploads prior prescription / ECG photo         │
   │    • AI extracts Metformin 500mg, Troponin Positive         │
   └──────────────────────────────┬──────────────────────────────┘
                                  │
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ 5. Instant Doctor Consultation View                         │
   │    • Doctor sees structured summary in <1 second            │
   │    • Doctor reviews, edits notes, approves FHIR record      │
   │    • Record linked to ABDM Personal Health Record (PHR)     │
   └─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Verification & Automated Quality Assurance Plan

### Automated Test Suites
- **Backend API Tests** (`pytest backend/tests/`):
  - Unit tests for all endpoints: `/api/v1/kiosk/session`, `/api/v1/clinical/socrates`, `/api/v1/documents/ocr`, `/api/v1/fhir/bundle`, `/api/v1/abdm/verify`.
  - Schema validation test: Verifies that output FHIR bundles strictly adhere to HL7 FHIR R4 schema.
- **Clinical Engine Tests**:
  - Test red-flag keyword triggers (verifying 100% sensitivity for emergency cardiac and stroke symptoms).
- **Frontend E2E & Component Tests**:
  - Cypress/Playwright simulation of complete patient intake flow in both English and Hindi.

---

## 🚀 Ready for Execution

With this master plan established:
1. All architectural requirements, API keys, and fallbacks are accounted for.
2. The platform is designed for real-world hospital deployment and hackathon-winning impact.
3. Execution can proceed phase by phase with zero blockers.
