import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const KioskAPI = {
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
};

