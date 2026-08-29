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
    const res = await apiClient.post(`/abdm/verify-abha?abha_id=${abhaId}`);
    return res.data;
  },
};
