# 🏥 MediKiosk — AI Clinical History Intake & ABDM Integration Platform
> **Smart India Hackathon (SIH) MVP** • AI-Powered Multilingual Point-of-Entry Health Kiosk for Indian Public Hospitals.

---

## 🌟 Overview

In high-throughput Indian government OPDs (4,000–10,000 daily patients), doctors are constrained to 2–5 minute consultations. **MediKiosk** solves this bottleneck at the point of entry before the patient meets the doctor:
1. **Module A — Conversational Voice & Touch Intake**: 22 Indian languages via ASR/TTS, adaptive SOCRATES questioning, and AYUSH Dashavidha Pariksha assessment.
2. **Module B — Medical Document Intelligence**: OCR for handwritten prescriptions, lab report extraction, abnormal value flagging, and chronological timeline ordering.
3. **Module C — Physician Clinical Summary**: Structured clinical history (`Chief Complaint -> HPI -> Past History -> Rx -> Labs -> Red Flags`) presented to the doctor in seconds.
4. **Module D — ABDM & Consent Integration**: ABHA ID verification/linking, DPDP Act 2023 audio consent, and FHIR R4 standard compliance.

---

## 📂 Project Architecture

```
MediKiosk/
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── api/v1/           # API endpoints (kiosk, clinical, documents, fhir, abdm, ai)
│   │   ├── core/             # Settings, MongoDB Motor client, Redis client
│   │   ├── models/           # FHIR R4 models & Pydantic schemas
│   │   ├── services/         # AI Orchestrator, Clinical Engine, OCR, ABDM Gateway
│   │   ├── websockets/       # Real-time WebSocket for live speech transcription
│   │   └── main.py           # FastAPI entrypoint
│   ├── requirements.txt      # Backend dependencies
│   └── .env.example          # Backend environment variables template
│
├── frontend/                 # Next.js 14+ Frontend (Vercel-ready)
│   ├── src/
│   │   ├── app/              # Routes: / (Home), /kiosk (Patient), /doctor (Clinician), /abha (ABDM)
│   │   ├── components/       # UI & Module components
│   │   └── lib/              # Zustand store, TanStack Query, Axios API client, Types
│   ├── package.json          # Frontend dependencies
│   ├── tailwind.config.ts    # Accessible healthcare color tokens
│   ├── tsconfig.json         # Strict TypeScript config
│   └── .env.example          # Frontend environment variables template
│
├── .env.example              # Global environment configuration
├── problem_statement.md      # Detailed problem statement and clinical scope
└── Architecture.md           # Architecture flow diagram
```

---

## 🚀 Quickstart Guide for Teammates (No Docker Needed!)

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10 to v3.13)
- **MongoDB Atlas** (Free cloud connection URI) or local MongoDB

---

### 2. Backend Setup (FastAPI)

```bash
# 1. Navigate to backend
cd backend

# 2. Create and activate Python virtual environment
# On Windows:
python -m venv .venv
.\.venv\Scripts\activate

# On Mac/Linux:
python3 -m venv .venv
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy environment template
cp .env.example .env

# 5. Start the FastAPI backend server
uvicorn app.main:app --reload --port 8000
```
- **Backend API & Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

### 3. Frontend Setup (Next.js)

```bash
# 1. In a new terminal tab, navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Start Next.js dev server
npm run dev
```
- **Frontend App**: [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deployment Strategy (Simple & Free)

1. **Frontend (Next.js)**:
   - Push repository to **GitHub**.
   - Import project into **[Vercel](https://vercel.com)** (Root directory: `frontend`).
   - Set environment variable `NEXT_PUBLIC_API_URL` to your backend URL.
   - Deploys globally with automatic SSL.

2. **Backend (FastAPI)**:
   - Deploy directly on **[Render](https://render.com)**, **[Railway](https://railway.app)**, or **[Koyeb](https://www.koyeb.com)** (Root directory: `backend`, Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`).
   - Or run locally for live SIH demonstration.

3. **Database**:
   - Free **[MongoDB Atlas M0](https://www.mongodb.com/atlas)** cloud database (`mongodb+srv://...`).
