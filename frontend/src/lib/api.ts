import axios from "axios";
import { getApiBaseUrl } from "./config";
import { getAccessToken } from "./auth-api";

export const apiClient = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (!config.baseURL) {
    config.baseURL = getApiBaseUrl();
  }
  const token = getAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const KioskAPI = {
  // 1. Kiosk Session Lifecycle
  getLanguages: async () => {
    const res = await apiClient.get("/kiosk/languages");
    return res.data;
  },
  startSession: async (language: string = "hi", mode: string = "allopathy") => {
    const res = await apiClient.post(`/kiosk/session/start?language=${language}&mode=${mode}`);
    return res.data;
  },
  getClinicalSummary: async (sessionId: string) => {
    const res = await apiClient.get(`/clinical/summary/${sessionId}`);
    return res.data;
  },
  submitIntakeComplete: async (payload: {
    session_id: string;
    token: string;
    name: string;
    age: number;
    gender: string;
    abha_id: string;
    triage_level: string;
    chief_complaint: string;
    intake_source?: string;
    caregiver_relation?: string;
    socrates?: any;
    past_history?: string[];
    allergies?: string[];
    current_medications?: any[];
    vitals?: any;
    evidence_trail?: any[];
    language?: string;
  }) => {
    const res = await apiClient.post("/clinical/intake-complete", payload);
    return res.data;
  },

  // 2. AI Voice & Chat Intake
  sendVoiceIntake: async (audioBlob: Blob, sessionId: string, languageCode: string = "hi") => {
    const formData = new FormData();
    formData.append("file", audioBlob, "patient_speech.wav");
    formData.append("session_id", sessionId);
    formData.append("language_code", languageCode);
    formData.append("synthesize_audio", "true");

    const res = await apiClient.post("/ai/voice-intake", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  sendChatIntake: async (transcript: string, sessionId: string, languageCode: string = "hi") => {
    const res = await apiClient.post("/ai/chat-intake", {
      session_id: sessionId,
      transcript,
      language_code: languageCode,
      synthesize_audio: true,
    });
    return res.data;
  },
  getSessionState: async (sessionId: string) => {
    const res = await apiClient.get(`/ai/session/${sessionId}/state`);
    return res.data;
  },

  // 3. Document AI & OCR Extraction
  uploadDocument: async (file: File, patientId: string = "P-DEMO-001") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("patient_id", patientId);
    formData.append("auto_sync_timeline", "true");

    const res = await apiClient.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  processSampleDocument: async (sampleType: string = "prescription", patientId: string = "P-DEMO-001") => {
    const res = await apiClient.post(`/documents/process-sample?sample_type=${sampleType}&patient_id=${patientId}`);
    return res.data;
  },
  getPatientTimeline: async (patientId: string = "P-DEMO-001") => {
    const res = await apiClient.get(`/documents/timeline/${patientId}`);
    return res.data;
  },

  // 4. ABDM Gateway
  verifyAbha: async (abhaId: string) => {
    const res = await apiClient.post(`/abdm/verify-abha?abha_id=${encodeURIComponent(abhaId)}`);
    return res.data;
  },
  generateOtp: async (identifier: string) => {
    const res = await apiClient.post("/abdm/generate-otp", { identifier });
    return res.data;
  },
  verifyOtp: async (txnId: string, otp: string, identifier: string) => {
    const res = await apiClient.post("/abdm/verify-otp", { txn_id: txnId, otp, identifier });
    return res.data;
  },
  scanQr: async (qrToken: string = "COUNTER_QR_SCAN") => {
    const res = await apiClient.post("/abdm/scan-qr", JSON.stringify(qrToken));
    return res.data;
  },
  requestConsent: async (abhaId: string, hiTypes: string[], purpose: string = "CAREGIV") => {
    const res = await apiClient.post("/abdm/consent/request", { abha_id: abhaId, hi_types: hiTypes, purpose });
    return res.data;
  },
  getLinkedRecords: async (abhaId: string) => {
    const res = await apiClient.get(`/abdm/linked-records/${encodeURIComponent(abhaId)}`);
    return res.data;
  },

  // 5. Doctor Cockpit & Closed Loop
  getDoctorQueue: async (status?: string) => {
    const url = status ? `/clinical/queue?status=${status}` : "/clinical/queue";
    const res = await apiClient.get(url);
    return res.data;
  },
  seedDemoQueue: async () => {
    const res = await apiClient.post("/clinical/seed-demo");
    return res.data;
  },
  approveConsultation: async (sessionId: string, payload: {
    provisional_diagnosis?: string;
    clinical_notes?: string;
    prescribed_medications?: any[];
    doctor_name?: string;
  }) => {
    const res = await apiClient.patch(`/clinical/session/${sessionId}/approve`, payload);
    return res.data;
  },
  getAuditEvents: async (limit: number = 50) => {
    const res = await apiClient.get(`/clinical/events?limit=${limit}`);
    return res.data;
  },
};
