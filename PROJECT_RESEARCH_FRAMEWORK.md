# MediKiosk — 6-Part Research & Engineering Framework

This document serves as the master blueprint and reference framework for the 6-person team building **MediKiosk** for Smart India Hackathon (SIH) and production deployment.

---

## 🧭 Executive Workflow & Convergence Strategy

```
         RESEARCH (Parts 1 - 6)
                   ↓
         TEAM CONVERGENCE (Day 5)
                   ↓
      TECHNICAL_DECISION_DOCUMENT.md
                   ↓
               MVP SCOPE
                   ↓
             ARCHITECTURE
                   ↓
        ┌──────────┼──────────┐
        ↓          ↓          ↓
     FRONTEND   BACKEND      AI
        │          │          │
        └──────────┼──────────┘
                   ↓
              INTEGRATION
                   ↓
              ABDM / FHIR
                   ↓
               SECURITY
                   ↓
               TESTING
                   ↓
               SIH DEMO
```

---

## PART 1 — 🏥 Clinical Workflow & Problem Research
**Owner: Teammate 1**

### Objectives:
- **Research A: Current Patient Journey**: Map steps: Arrival ➔ Registration ➔ Waiting ➔ Nurse/Staff ➔ History Taking ➔ Doctor Consultation ➔ Diagnosis ➔ Investigations ➔ Treatment. Pinpoint bottlenecks and missed critical data.
- **Research B: Clinical History Structure**: Chief Complaint, HPI (History of Present Illness - OPQRST/SOCRATES), Past Medical, Surgical, Medication, Allergy, Family, Personal, and Review of Systems.
- **Research C: Clinical Questioning Trees & Red Flags**: Decision trees for 5–10 common presentations (Fever, Chest Pain, Abdominal Pain, Headache, Cough, Dyspnea). Determine mandatory questions, emergency red flags, and triage cut-offs.
- **Research D: Healthcare Professional Alignment**: Interview doctors, nurses, triage officers to identify the most valuable dashboard data points and trust factors.
- **Deliverables**: Clinical Requirements Document (CRD), Question Trees, Doctor Dashboard Specifications, and AI Boundary/Guardrail Rules (what AI must *never* diagnose or prescribe).

---

## PART 2 — 🇮🇳 ABDM + ABHA + FHIR Research
**Owner: Teammate 2**

### Objectives:
- **Research A: ABHA Fundamentals**: Verification (OTP/Bio/Demographic), Linkage, and realistic data access boundaries (disproving the myth of "instant unconsented history lookup").
- **Research B: ABDM Ecosystem Architecture**: Health Information Provider (HIP), Health Information User (HIU), Health Information Exchange & Consent Manager (HIE-CM).
- **Research C: FHIR R4 Standards**: Schemas and mappings for `Patient`, `Encounter`, `Condition`, `Observation`, `MedicationRequest`, `AllergyIntolerance`, `DocumentReference`, `Consent`, and `Bundle`.
- **Research D: ABDM Sandbox & APIs**: Milestone 1 (M1: ABHA creation/verification), Milestone 2 (M2: HIP record linking), Milestone 3 (M3: HIU consent-based fetch). What is demonstratable in SIH.
- **Research E: Indian Privacy & Compliance**: DPDP Act compliance, data residency, consent artifacts, encryption, audit logs.
- **Deliverables**: ABDM Integration Feasibility Report with clear classification:
  - 🟢 **CAN DO** (Production & Sandbox)
  - 🟡 **CAN DO IN SANDBOX ONLY**
  - 🔴 **CANNOT CLAIM / OUT OF SCOPE**

---

## PART 3 — 🤖 AI + Voice Agent Research
**Owner: Teammate 3**

### Objectives:
- **Research A: Speech-to-Text (ASR)**: Compare Whisper, IndicWhisper, IndicConformer, Bhashini across Hindi, Telugu, and English (accuracy, latency, offline/on-prem, API costs).
- **Research B: Text-to-Speech (TTS)**: Natural Indian-language synthesis (Indic TTS, IndicF5, Edge-TTS, Cloud providers).
- **Research C: LLM & Clinical Extraction**: Cloud (Groq Llama-3.3-70b, OpenAI GPT-4o, Claude) vs. Local (Llama 3, Qwen 2.5). Structured JSON output validation and low-latency execution.
- **Research D: Voice Pipeline Architecture**: Mic ➔ Streaming/WebSockets vs. Push-to-Talk ➔ ASR ➔ Transcript ➔ Clinical Intake State ➔ Question Engine ➔ TTS ➔ Speaker.
- **Research E: LLM Safety & Hallucination Prevention**: Strict schema enforcement, confidence thresholds, system prompt guardrails, out-of-scope redirection.
- **Deliverables**: Voice AI Benchmarking Matrix, Safety Rules, and Working Voice-to-JSON Prototype.

---

## PART 4 — 📄 Document Intelligence & Medical Records
**Owner: Teammate 4**

### Objectives:
- **Research A: OCR Pipeline**: Evaluate PaddleOCR, Tesseract, and Document Vision models on multilingual printed/handwritten prescriptions, lab reports, and low-light mobile scans.
- **Research B: Structured Medical Entity Extraction**: Parse dosages, frequencies (`Tab Amlodipine 5mg OD`), lab reference ranges, diagnoses, doctor/hospital metadata.
- **Research C: Longitudinal Clinical Timeline**: Aggregate multi-year documents into a chronological clinical trajectory (e.g., 2019 Diagnosis ➔ 2021 Treatment ➔ 2023 Surgery ➔ 2025 Lab ➔ 2026 Presenting).
- **Research D: Confidence & Provenance Tracking**: Store every extracted field with `{ value, confidence, source_file, page_number, verified_status }`.
- **Deliverables**: OCR + Extraction Pipeline, Visual Timeline UI Component, and Confidence Validation System.

---

## PART 5 — 🧱 System Architecture & Technology Research
**Owner: Teammate 5**

### Objectives:
- **Research A: Backend Architecture**: FastAPI (async Python, high throughput, native AI integration, Pydantic data validation).
- **Research B: Frontend Stack**: Next.js 14/15 App Router, React, TailwindCSS, Lucide icons, accessible kiosk & doctor dashboard views.
- **Research C: MongoDB Database Schema**: Collections for `patients`, `encounters`, `clinical_records`, `documents`, `observations`, `medications`, `consents`, `ai_sessions`, `audit_logs` with compound indexing and FHIR mapping.
- **Research D: Realtime & Streaming**: WebSockets for live voice sessions, SSE for dashboard event pushes.
- **Research E: Storage**: Object storage for audio recordings, scanned PDFs, images, and FHIR export packages (MinIO / S3 / R2).
- **Research F: Background Jobs**: Celery + Redis for asynchronous OCR processing and ABDM batch synchronizations.
- **Deliverables**: Full System Architecture Blueprint & Data Flow Diagrams.

---

## PART 6 — 🔐 Security, Feasibility, Cost & Testing
**Owner: Teammate 6**

### Objectives:
- **Research A: Application Security**: End-to-end encryption, TLS 1.3, JWT/OAuth2 RBAC, secret management, audit logging.
- **Research B: Healthcare Privacy (Indian Context)**: DPDP Act compliance, anonymization / pseudonymization protocols for AI processing.
- **Research C: Threat Modeling (STRIDE)**: Token spoofing, document injection, prompt injection, unauthorized record access, and mitigating controls.
- **Research D: Unit Economics & Cost Model**: Per-patient cost calculation (ASR + LLM + TTS + OCR + Hosting) across 100, 1,000, and 10,000 daily patients.
- **Research E: Latency & Performance SLA**: Target: ASR < 300ms, LLM TTFT < 400ms, Total turn latency < 1.2s.
- **Research F: Comprehensive Testing**: Automated pytest suites, FHIR bundle validation, load testing, and clinical QA.
- **Deliverables**: Security, Feasibility & Unit Economics Report.

---

## 📋 Common 7 Questions for Every Domain
1. **What is the problem?**
2. **What are the available solutions?**
3. **What are the viable options for our team?**
4. **What does each option cost?**
5. **What are the limitations?**
6. **What is the final recommendation?**
7. **What must we build ourselves vs. reuse?**
