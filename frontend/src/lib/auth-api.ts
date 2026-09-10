import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const authApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Crucial for HttpOnly refresh cookies
});

// Interceptor to attach access token if stored in memory/session
let inMemoryAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      sessionStorage.setItem("mk_access_token", token);
    } else {
      sessionStorage.removeItem("mk_access_token");
    }
  }
};

export const getAccessToken = (): string | null => {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("mk_access_token");
  }
  return null;
};

authApiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface UserProfile {
  user_id: string;
  role: string;
  status: string;
  full_name: string;
  preferred_language: string;
  date_of_birth?: string;
  gender?: string;
  mobile?: string;
  email?: string;
  identities: string[];
  abha_status: "NOT_LINKED" | "VERIFIED" | "PENDING";
  abha_address?: string;
  abha_number_masked?: string;
  created_at: string;
  last_login_at?: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export interface AuthResponse {
  user: UserProfile;
  next_step: "DASHBOARD" | "ONBOARDING" | "OPTIONAL_ABHA_LINK";
  tokens: AuthTokens;
}

export interface OtpRequestResponse {
  challenge_id: string;
  expires_in: number;
  resend_after: number;
  demo_otp?: string;
}

export interface AbhaStatusResponse {
  linked: boolean;
  status: string;
  link_id?: string;
  abha_number_masked?: string;
  abha_address?: string;
  verified_at?: string;
}

export interface ConsentRecord {
  id: string;
  user_id: string;
  abha_link_id?: string;
  abdm_consent_id: string;
  purpose: string;
  hi_types: string[];
  status: string;
  requested_at: string;
  granted_at?: string;
  expires_at?: string;
  revoked_at?: string;
}

export const AuthAPI = {
  // 1. Password Signup & Login
  signup: async (payload: {
    email: string;
    password: string;
    full_name: string;
    preferred_language?: string;
    date_of_birth?: string;
    gender?: string;
    mobile?: string;
  }): Promise<AuthResponse> => {
    const res = await authApiClient.post("/auth/signup", payload);
    setAccessToken(res.data.tokens.access_token);
    return res.data;
  },

  login: async (payload: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await authApiClient.post("/auth/login", payload);
    setAccessToken(res.data.tokens.access_token);
    return res.data;
  },

  // 2. Mobile OTP
  requestOtp: async (phone: string, purpose: "login" | "signup" | "link" = "login"): Promise<OtpRequestResponse> => {
    const res = await authApiClient.post("/auth/otp/request", { phone, purpose });
    return res.data;
  },

  verifyOtp: async (payload: {
    challenge_id: string;
    otp: string;
    full_name?: string;
    preferred_language?: string;
    date_of_birth?: string;
    gender?: string;
  }): Promise<AuthResponse> => {
    const res = await authApiClient.post("/auth/otp/verify", payload);
    setAccessToken(res.data.tokens.access_token);
    return res.data;
  },

  // 3. Google Sign-In
  googleAuth: async (credential: string, preferredLanguage: string = "hi"): Promise<AuthResponse> => {
    const res = await authApiClient.post("/auth/google", {
      credential,
      preferred_language: preferredLanguage,
    });
    setAccessToken(res.data.tokens.access_token);
    return res.data;
  },

  // 4. Token & Session Management
  refreshToken: async (): Promise<AuthTokens> => {
    const res = await authApiClient.post("/auth/refresh", {});
    setAccessToken(res.data.access_token);
    return res.data;
  },

  logout: async (): Promise<{ success: boolean }> => {
    try {
      const res = await authApiClient.post("/auth/logout", {});
      setAccessToken(null);
      return res.data;
    } catch {
      setAccessToken(null);
      return { success: true };
    }
  },

  getMe: async (): Promise<UserProfile> => {
    const res = await authApiClient.get("/auth/me");
    return res.data;
  },

  updateProfile: async (payload: Partial<UserProfile>): Promise<UserProfile> => {
    const res = await authApiClient.put("/auth/profile", payload);
    return res.data;
  },

  // 5. ABHA Linking
  startAbhaVerification: async (abhaId: string, authMode: string = "mobile_otp") => {
    const res = await authApiClient.post("/abha/verification/start", {
      abha_id: abhaId,
      auth_mode: authMode,
    });
    return res.data;
  },

  confirmAbhaVerification: async (txnId: string, otp: string) => {
    const res = await authApiClient.post("/abha/verification/confirm", {
      txn_id: txnId,
      otp,
    });
    return res.data;
  },

  getAbhaStatus: async (): Promise<AbhaStatusResponse> => {
    const res = await authApiClient.get("/abha/status");
    return res.data;
  },

  unlinkAbha: async () => {
    const res = await authApiClient.delete("/abha/link");
    return res.data;
  },

  // 6. ABDM Consents
  createConsent: async (purpose: string = "CAREGIV", hiTypes: string[] = ["Prescription", "DiagnosticReport"]) => {
    const res = await authApiClient.post("/abdm/consents", { purpose, hi_types: hiTypes });
    return res.data;
  },

  listConsents: async (): Promise<ConsentRecord[]> => {
    const res = await authApiClient.get("/abdm/consents");
    return res.data;
  },

  revokeConsent: async (consentId: string) => {
    const res = await authApiClient.post(`/abdm/consents/${consentId}/revoke`, {});
    return res.data;
  },
};
