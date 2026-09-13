# 🏥 MediKiosk — AI Clinical History Intake & ABDM Integration Platform
> **AI-Powered Multilingual Point-of-Entry Health Kiosk & Clinical Intelligence System for High-Throughput Indian Hospitals.**

---

## 🌟 Executive Summary

In high-volume Indian public hospital Out-Patient Departments (OPDs), clinicians often treat **4,000 to 10,000 patients daily**, resulting in restricted consultation times of just **2 to 5 minutes per patient**. A significant portion of this critical window is consumed by repetitive administrative data collection, decoding illegible handwritten prescriptions, and overcoming linguistic barriers.

**MediKiosk** transforms this bottleneck at the point of entry before the patient steps into the consultation room:
1. **Multilingual Voice-First Intake**: Conversational vernacular triage supporting Indian languages via AI speech recognition and adaptive clinical inquiry.
2. **Medical Document Intelligence (Vision AI + OCR)**: End-to-end extraction of complex handwritten prescriptions, lab panels, and discharge summaries with pharmacopeia normalization.
3. **Physician Consultation Cockpit**: Instant structured clinical handoff (*Chief Complaint → HPI → Longitudinal ABHA History → Active Medications → Labs → 8-Axis SOCRATES Matrix → Differential Diagnosis*).
4. **ABDM & DPDP Compliance**: Native ABHA creation/linking, FHIR R4 interoperability, and verifiable patient consent workflows.

---

## 🏛️ System Architecture

```
                                      ┌────────────────────────────────────────────────┐
                                      │           PATIENT ENTRY (KIOSK STATION)        │
                                      │   • 4-Step Streamlined Intake                  │
                                      │   • 8+ Indian Languages (Bhashini ASR/TTS)     │
                                      │   • Prescription & Lab Record Scanner          │
                                      └──────────────────────┬─────────────────────────┘
                                                             │
                                                             ▼
                                      ┌────────────────────────────────────────────────┐
                                      │            AI ORCHESTRATION LAYER              │
                                      │   • Dual-Engine Vision AI (Qwen2.5-VL / HF)    │
                                      │   • Local PyTesseract OCR Fallback             │
                                      │   • Indian Pharmacopeia Canonizer (1,800+ Rx)  │
                                      │   • Real-Time SOCRATES Matrix Extraction       │
                                      └──────────────────────┬─────────────────────────┘
                                                             │
                                    ┌────────────────────────┴────────────────────────┐
                                    ▼                                                 ▼
┌───────────────────────────────────────────────────────┐  ┌──────────────────────────────────────────────────┐
│             DOCTOR CONSULTATION COCKPIT               │  │           DYNAMIC CLINICAL REPORT ENGINE         │
│   • Pre-consultation Storyboard & Red Flags           │  │   • Vector PDF Generation on the fly             │
│   • Longitudinal EHR & ABHA Context Correlation       │  │   • Verified Medication Timelines & Dosages      │
│   • Evidence-Grounded Differential Diagnostics        │  │   • FHIR R4 Bundle Construction & Export         │
└───────────────────────────────────────────────────────┘  └──────────────────────────────────────────────────┘
```

---

## 🚀 Key Modules & Capabilities

### 1. 🗣️ Vernacular Kiosk Intake (`/kiosk/intake`)
- **Streamlined 4-Step Flow**:
  - **Step 1: Language & Identity**: Selection across 8 languages (Hindi, Telugu, Tamil, Bengali, Marathi, Gujarati, Kannada, English) with ABHA / Aadhaar / Caregiver mode.
  - **Step 2: Spoken Voice Intake & Dialogue**: Real-time conversational intake with AI audio agent, adaptive follow-ups, and live longitudinal record surfacing.
  - **Step 3: Past Prescriptions & Records Scanner**: Multi-angle camera capture and instant OCR processing of prior records.
  - **Step 4: Digital OPD Token & Smart Queue**: Generates an accessible digital token with queue status and direct report links.
- **Dynamic Localization**: 100% vernacular translation dictionary covering all UI labels, step badges, action prompts, and localized AI greeting prompts.

### 2. 📄 Medical Document Intelligence & Dual OCR Engine
- **Hybrid Vision AI Pipeline**:
  - **Qwen2.5-VL-72B-Instruct & Qwen2.5-VL-7B-Instruct** (via OpenRouter & HuggingFace Inference API): Handles degraded scans, cursive doctor handwriting, tabular lab panels, and multi-column OPD slips.
  - **PyTesseract Engine (Local Fallback)**: Grayscale conversion, Otsu adaptive thresholding, bilateral noise filtering, and heuristic text extraction when offline.
- **Indian Pharmacopeia & AYUSH Knowledge Base**:
  - Comprehensive clinical drug lexicon mapping brand names (e.g., *Augmentin, Clavam, Pan-D, Skipen-D, Tab Breezy, Montair-LC, Amlodac, Calpol*) to canonical generic molecules.
  - Auto-extracts dosage, route, frequency (*e.g., 1-0-1*), duration, therapeutic indications, clinical purposes, and patient instructions.
- **Diagnostic Lab Value Analyzer**: Extracts CBC, LFT, KFT, and lipid biomarkers, flagging abnormal lab ranges with clinical severity indicators.

### 3. 👨‍⚕️ Physician Consultation Cockpit (`/doctor`)
- **8-Axis SOCRATES Clinical Matrix**:
  - Automatically structures voice intake into **S**ite, **O**nset, **C**haracter, **R**adiation, **A**ssociated signs, **T**iming, **E**xacerbating factors, and **S**everity (0–10).
- **Longitudinal ABHA History Correlation**: Automatically retrieves and correlates prior episode context (e.g., *Completed DOTS Regimen (2022)*, *Essential Hypertension on Amlodipine*) with acute complaints.
- **Differential Diagnosis Engine**: Surfaces evidence-grounded differential diagnoses, red-flag indicators, and recommended confirmatory investigations.

### 4. 📑 Dynamic PDF Intake Report Generator
- **Live Vector PDF Creation** (`/api/v1/clinical/report/pdf/{session_id}`):
  - Curated dynamically to the active patient session (Patient Demographics, Chief Complaint, Verified Rx Timeline, Lab Values, SOCRATES Radar, and Differential Impressions).
  - Ready for physical printout or electronic health record (EHR) attachment.

### 5. 🛡️ ABDM & FHIR R4 Standards Compliance
- **ABHA Integration**: Direct linking via Aadhaar/Mobile OTP flow.
- **FHIR R4 Resources**: Automatic packaging into standardized bundles (`Patient`, `Encounter`, `Condition`, `MedicationStatement`, `Observation`).
- **DPDP Act 2023**: Verifiable patient consent logging for data sharing and processing.

---

## 📂 Repository Structure

```
MediKiosk/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/     # REST Endpoints:
│   │   │   ├── kiosk.py          # Kiosk session management & token generation
│   │   │   ├── clinical.py       # Clinical summaries, differential engine & PDF export
│   │   │   ├── documents.py      # Prescription & lab report OCR uploads
│   │   │   ├── history.py        # Longitudinal patient health records & ABHA correlation
│   │   │   ├── abdm.py           # ABDM gateway & ABHA onboarding
│   │   │   └── auth.py           # Authentication & patient profile management
│   │   ├── core/                 # App configuration, MongoDB client, Redis cache
│   │   ├── models/               # Pydantic schemas, MongoDB schemas & FHIR R4 models
│   │   ├── services/
│   │   │   ├── ai/               # AI Orchestrator, LLM clinical reasoning
│   │   │   ├── clinical/         # Report generator, SOCRATES synthesis
│   │   │   └── documents/        # OCR Engine (Qwen Vision, Tesseract, Pharmacopeia)
│   │   ├── websockets/           # Live voice streaming & bidirectional audio
│   │   └── main.py               # FastAPI application entrypoint
│   ├── requirements.txt          # Python dependencies
│   └── .env.example              # Backend environment template
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── kiosk/intake/     # 4-Step Patient Vernacular Kiosk Station
│   │   │   ├── doctor/           # Physician Consultation Cockpit
│   │   │   ├── documents/        # Document & Prescription OCR Scanner sandbox
│   │   │   ├── patient/          # Patient Health Portal & Timeline
│   │   │   ├── abha/             # ABHA Onboarding & Verification
│   │   │   └── layout.tsx        # Global Layout & Accessibility Shell
│   │   ├── components/           # Reusable UI components & clinical modules
│   │   ├── lib/                  # Kiosk translations (8 languages), API clients, Zustand
│   │   └── types/                # TypeScript interface definitions
│   ├── package.json              # Frontend dependencies
│   └── tsconfig.json             # TypeScript configuration
└── README.md
```

---

## ⚡ Quickstart Guide

### Prerequisites
- **Node.js**: v18.0 or higher
- **Python**: v3.10 to v3.12
- **Tesseract OCR** *(Optional for local fallback)*: [Install Guide](https://github.com/tesseract-ocr/tesseract)
- **MongoDB**: Local MongoDB or free [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

---

### 1. Backend Setup (FastAPI)

```bash
# 1. Navigate to backend directory
cd backend

# 2. Set up Python virtual environment
# Windows:
python -m venv .venv
.\.venv\Scripts\activate

# Linux / macOS:
python3 -m venv .venv
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, OpenRouter/HuggingFace API key (for Qwen Vision)

# 5. Start backend server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **API Documentation (Swagger UI)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check**: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

---

### 2. Frontend Setup (Next.js 14)

```bash
# 1. In a separate terminal, navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local

# 4. Start Next.js development server
npm run dev
```
- **Application Portal**: [http://localhost:3000](http://localhost:3000)

---

## 🌐 Quick Application Links

| Portal / Module | URL | Description |
| :--- | :--- | :--- |
| **Kiosk Patient Intake** | [`/kiosk/intake`](http://localhost:3000/kiosk/intake) | 4-step vernacular voice & document intake station |
| **Doctor Cockpit** | [`/doctor`](http://localhost:3000/doctor) | Real-time clinical summaries, SOCRATES radar, and differential impressions |
| **Prescription OCR Lab** | [`/documents`](http://localhost:3000/documents) | Document upload, handwriting recognition & pharmacopeia normalization |
| **Patient Health Records** | [`/patient/dashboard`](http://localhost:3000/patient/dashboard) | Longitudinal health timeline & active prescriptions |
| **ABHA Onboarding** | [`/abha`](http://localhost:3000/abha) | ABDM ID registration, verification & consent flow |
| **FastAPI Interactive Docs** | [`:8000/docs`](http://127.0.0.1:8000/docs) | Complete Swagger API documentation |

---

## 📜 License & Compliance

- **ABDM Compliance**: Follows Ayushman Bharat Digital Mission (ABDM) sandbox guidelines for M1, M2, and M3 milestones.
- **FHIR R4**: Adheres to HL7 FHIR Release 4 standard specifications for clinical resource definitions.
- **DPDP Act 2023**: Designed with strict data privacy, minimal data retention, and patient consent-first architecture.
