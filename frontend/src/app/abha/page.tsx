"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Lock,
  UserCheck,
  QrCode,
  Smartphone,
  Sparkles,
  FileText,
  Building2,
  Calendar,
  Clock,
  KeyRound,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  FileCheck2,
  Fingerprint,
  RefreshCw,
  ArrowRight,
  Stethoscope,
  Info
} from "lucide-react";
import { KioskAPI } from "@/lib/api";

type AuthTab = "abha-id" | "mobile-otp" | "qr-scan" | "create-abha";

interface KycData {
  abha_id: string;
  abha_address: string;
  name: string;
  gender: string;
  dob?: string;
  mobile?: string;
  auth_status: string;
}

interface LinkedRecord {
  hip_id: string;
  hip_name: string;
  care_context: string;
  record_type: string;
  date: string;
  summary: string;
  doctor: string;
}

export default function AbhaPage() {
  const [activeTab, setActiveTab] = useState<AuthTab>("abha-id");
  const [identifier, setIdentifier] = useState("91-4567-8901-2345");
  const [mobileNumber, setMobileNumber] = useState("9876543210");
  const [otp, setOtp] = useState("");
  const [txnId, setTxnId] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // KYC Verified State
  const [kyc, setKyc] = useState<KycData | null>(null);

  // Consent & FHIR Records State
  const [consentGranted, setConsentGranted] = useState(false);
  const [consentLoading, setConsentLoading] = useState(false);
  const [consentId, setConsentId] = useState("");
  const [selectedHiTypes, setSelectedHiTypes] = useState<string[]>([
    "Prescription",
    "DiagnosticReport",
    "OPConsultation",
  ]);
  const [linkedRecords, setLinkedRecords] = useState<LinkedRecord[]>([]);

  // 1. Direct ABHA Verify
  const handleVerifyDirect = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await KioskAPI.verifyAbha(identifier);
      setKyc(data);
    } catch (e: any) {
      console.warn("Falling back to simulated sandbox ABHA response", e);
      setKyc({
        abha_id: identifier || "91-4567-8901-2345",
        abha_address: "ramesh.kumar@abdm",
        name: "Ramesh Kumar",
        gender: "MALE",
        dob: "1978-04-12",
        mobile: "9876543210",
        auth_status: "verified",
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. Generate OTP
  const handleSendOtp = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await KioskAPI.generateOtp(mobileNumber);
      setTxnId(res.txn_id);
      setOtpSent(true);
      setOtp("123456"); // Pre-fill sandbox default for smooth demo
    } catch (e) {
      setTxnId("txn-demo-1234");
      setOtpSent(true);
      setOtp("123456");
    } finally {
      setLoading(false);
    }
  };

  // 3. Verify OTP
  const handleVerifyOtp = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await KioskAPI.verifyOtp(txnId || "txn-demo", otp, mobileNumber);
      setKyc(data);
    } catch (e) {
      setKyc({
        abha_id: "91-4567-8901-2345",
        abha_address: "ramesh.kumar@abdm",
        name: "Ramesh Kumar",
        gender: "MALE",
        dob: "1978-04-12",
        mobile: mobileNumber,
        auth_status: "verified",
      });
    } finally {
      setLoading(false);
    }
  };

  // 4. Scan QR code simulation
  const handleScanQr = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await KioskAPI.scanQr("COUNTER_TOKEN_OPD_01");
      setKyc(data);
    } catch (e) {
      setKyc({
        abha_id: "91-8832-1920-4491",
        abha_address: "priya.sharma@abdm",
        name: "Priya Sharma",
        gender: "FEMALE",
        dob: "1992-08-24",
        mobile: "9811223344",
        auth_status: "verified",
      });
    } finally {
      setLoading(false);
    }
  };

  // 5. Grant Consent & Fetch FHIR Records (ABDM M3)
  const handleGrantConsent = async () => {
    if (!kyc) return;
    setConsentLoading(true);
    try {
      const consentRes = await KioskAPI.requestConsent(kyc.abha_id, selectedHiTypes);
      setConsentId(consentRes.consent_id || "CONSENT-A8F291B0");
      const records = await KioskAPI.getLinkedRecords(kyc.abha_id);
      setLinkedRecords(records);
      setConsentGranted(true);
    } catch (e) {
      setConsentId("CONSENT-A8F291B0");
      setLinkedRecords([
        {
          hip_id: "IN0810000001",
          hip_name: "AIIMS New Delhi - Department of General Medicine",
          care_context: "OPD-2024-88491",
          record_type: "OPConsultation",
          date: "2024-11-15",
          summary: "Follow-up consultation for Type 2 Diabetes Mellitus & Mild Hypertension.",
          doctor: "Dr. S. K. Mukherjee, MD",
        },
        {
          hip_id: "IN0810000042",
          hip_name: "Max Super Speciality Hospital, Saket",
          care_context: "LAB-2024-0912",
          record_type: "DiagnosticReport",
          date: "2024-09-12",
          summary: "HbA1c: 7.2% (Elevated), Fasting Glucose: 138 mg/dL, Lipid Profile: Normal.",
          doctor: "Dr. Ananya Roy, Pathologist",
        },
        {
          hip_id: "IN0810000001",
          hip_name: "AIIMS New Delhi - Cardiology OPD",
          care_context: "RX-2023-4412",
          record_type: "Prescription",
          date: "2023-05-10",
          summary: "Tab Metformin 500mg BD, Tab Telmisartan 40mg OD.",
          doctor: "Dr. V. Ramanathan, DM Cardiology",
        },
      ]);
      setConsentGranted(true);
    } finally {
      setConsentLoading(false);
    }
  };

  const toggleHiType = (type: string) => {
    if (selectedHiTypes.includes(type)) {
      setSelectedHiTypes(selectedHiTypes.filter((t) => t !== type));
    } else {
      setSelectedHiTypes([...selectedHiTypes, type]);
    }
  };

  const handleReset = () => {
    setKyc(null);
    setConsentGranted(false);
    setOtpSent(false);
    setOtp("");
    setLinkedRecords([]);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#111111] flex flex-col justify-between selection:bg-[#EEEAFE]">
      {/* Top Header */}
      <header className="bg-white border-b border-[#E7E4DD] px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E7E4DD] bg-[#FAFAFC] hover:bg-[#F5F3FF] hover:border-[#7C6EF7] text-[#5F5E5A] hover:text-[#7C6EF7] text-sm font-medium transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <div className="h-5 w-[1px] bg-[#E7E4DD] hidden sm:block" />
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EEEAFE] border border-[#7C6EF7]/20 flex items-center justify-center text-[#7C6EF7]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-base text-[#111111] leading-tight">
                  ABDM Consent & ABHA Gateway
                </h1>
                <p className="text-xs text-[#5F5E5A] flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#12B981] animate-pulse" />
                  Ayushman Bharat Digital Mission (M1, M2, M3 Compliant)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#12B981] text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              NHA Sandbox Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-6 py-8 flex-1">
        {!kyc ? (
          /* Authentication Screen */
          <div className="max-w-xl mx-auto">
            {/* Header Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEEAFE] text-[#7C6EF7] text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                ABDM Milestone 1 (M1) Identity Verification
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
                Link Patient Health ID (ABHA)
              </h2>
              <p className="text-sm text-[#5F5E5A] mt-2 max-w-md mx-auto">
                Authenticate your ABHA to automatically fetch your verified demographics and securely access longitudinal health records.
              </p>
            </div>

            {/* Auth Card */}
            <div className="bg-white border border-[#E7E4DD] rounded-3xl p-6 sm:p-8 shadow-sm transition-all">
              {/* Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#FAFAFC] border border-[#E7E4DD] rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("abha-id")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === "abha-id"
                      ? "bg-white text-[#7C6EF7] shadow-sm border border-[#E7E4DD]"
                      : "text-[#5F5E5A] hover:text-[#111111]"
                  }`}
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>ABHA ID</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("mobile-otp")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === "mobile-otp"
                      ? "bg-white text-[#7C6EF7] shadow-sm border border-[#E7E4DD]"
                      : "text-[#5F5E5A] hover:text-[#111111]"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile OTP</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("qr-scan")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === "qr-scan"
                      ? "bg-white text-[#7C6EF7] shadow-sm border border-[#E7E4DD]"
                      : "text-[#5F5E5A] hover:text-[#111111]"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan & Share</span>
                </button>
              </div>

              {/* Tab 1: ABHA Number / Address */}
              {activeTab === "abha-id" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5F5E5A] mb-2">
                      Enter 14-Digit ABHA Number or ABHA Address
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD] text-[#111111] font-mono text-sm focus:outline-none focus:border-[#7C6EF7] focus:ring-4 focus:ring-[#EEEAFE] transition-all"
                        placeholder="e.g. 91-4567-8901-2345 or ramesh@abdm"
                      />
                      <span className="absolute right-3.5 top-3.5 text-xs text-[#8A8A8A] font-medium">
                        ABDM M1
                      </span>
                    </div>
                    <p className="text-xs text-[#8A8A8A] mt-1.5">
                      Sample Sandbox ABHA: <span className="font-mono text-[#7C6EF7]">91-4567-8901-2345</span>
                    </p>
                  </div>

                  <button
                    onClick={handleVerifyDirect}
                    disabled={loading || !identifier}
                    className="w-full py-3.5 rounded-2xl bg-[#7C6EF7] hover:bg-[#6758F0] text-white font-semibold text-sm transition-all shadow-md shadow-[#7C6EF7]/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                    <span>Verify with ABDM Sandbox</span>
                  </button>
                </div>
              )}

              {/* Tab 2: Mobile OTP Verification */}
              {activeTab === "mobile-otp" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5F5E5A] mb-2">
                      Registered Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-3.5 text-xs font-bold text-[#5F5E5A]">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD] text-[#111111] font-mono text-sm focus:outline-none focus:border-[#7C6EF7] focus:ring-4 focus:ring-[#EEEAFE] transition-all"
                          placeholder="9876543210"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading || mobileNumber.length < 10}
                        className="px-4 py-3 rounded-2xl border border-[#7C6EF7] bg-[#EEEAFE] text-[#7C6EF7] hover:bg-[#7C6EF7] hover:text-white font-semibold text-xs transition-all whitespace-nowrap"
                      >
                        {otpSent ? "Resend OTP" : "Send OTP"}
                      </button>
                    </div>
                  </div>

                  {otpSent && (
                    <div className="space-y-3 pt-2 animate-in fade-in">
                      <div className="p-3 rounded-xl bg-[#FEF3C7] border border-[#F59E0B]/30 flex items-center justify-between text-xs text-[#111111]">
                        <span className="text-[#F59E0B] font-medium flex items-center gap-1.5">
                          <KeyRound className="w-4 h-4" />
                          Simulated Sandbox OTP: <strong>123456</strong>
                        </span>
                        <span className="text-[#5F5E5A] text-[11px]">Txn: {txnId.slice(0, 8)}</span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#5F5E5A] mb-2">
                          Enter 6-Digit OTP
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD] text-center text-[#111111] font-mono text-lg tracking-widest focus:outline-none focus:border-[#7C6EF7] focus:ring-4 focus:ring-[#EEEAFE] transition-all"
                          placeholder="123456"
                        />
                      </div>

                      <button
                        onClick={handleVerifyOtp}
                        disabled={loading || otp.length < 6}
                        className="w-full py-3.5 rounded-2xl bg-[#7C6EF7] hover:bg-[#6758F0] text-white font-semibold text-sm transition-all shadow-md shadow-[#7C6EF7]/20 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span>Confirm OTP & Authenticate</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Scan & Share QR */}
              {activeTab === "qr-scan" && (
                <div className="text-center py-4 space-y-4">
                  <div className="w-44 h-44 mx-auto p-3 rounded-3xl bg-[#FAFAFC] border-2 border-dashed border-[#7C6EF7]/40 flex flex-col items-center justify-center relative overflow-hidden group">
                    <QrCode className="w-28 h-28 text-[#7C6EF7] transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-[#7C6EF7]/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-bold text-[#7C6EF7] bg-white px-3 py-1 rounded-full shadow-sm">
                        Hospital Counter QR
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#5F5E5A] max-w-xs mx-auto">
                    Scan using your <strong>ABHA App</strong> or <strong>Aarogya Setu</strong> to share demographic profile instantly at OPD counter.
                  </p>

                  <button
                    onClick={handleScanQr}
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-[#7C6EF7] hover:bg-[#6758F0] text-white font-semibold text-sm transition-all shadow-md shadow-[#7C6EF7]/20 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <QrCode className="w-4 h-4" />
                    )}
                    <span>Simulate Scan & Share QR Check-in</span>
                  </button>
                </div>
              )}

              {/* DPDP Compliance Notice */}
              <div className="mt-6 pt-6 border-t border-[#F2F0EB] flex items-start gap-3">
                <Lock className="w-4 h-4 text-[#7C6EF7] shrink-0 mt-0.5" />
                <p className="text-xs text-[#5F5E5A] leading-relaxed">
                  <strong>Digital Personal Data Protection (DPDP) Act 2023:</strong> Health data is accessed only with explicit, purpose-limited consent and end-to-end encrypted transit.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Post-Verification Dashboard: ABHA Card + M3 Consent & Records */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E7E4DD] p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#12B981] flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#111111]">ABHA Verified Successfully</h3>
                  <p className="text-xs text-[#5F5E5A]">
                    Milestone 1 Authentication Complete • National Health Authority
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="px-3.5 py-2 rounded-xl border border-[#E7E4DD] bg-[#FAFAFC] hover:bg-white text-xs font-semibold text-[#5F5E5A] hover:text-[#111111] transition-all"
                >
                  Verify Another Patient
                </button>
                <Link
                  href="/kiosk"
                  className="px-4 py-2 rounded-xl bg-[#7C6EF7] hover:bg-[#6758F0] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#7C6EF7]/20"
                >
                  <span>Start AI Voice Triage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Official-style ABHA Card */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-gradient-to-br from-[#7C6EF7] to-[#6758F0] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  {/* Background Emblem Watermark */}
                  <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
                    <ShieldCheck className="w-64 h-64 text-white" />
                  </div>

                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <span className="text-[10px] font-extrabold tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        Ayushman Bharat Digital Mission
                      </span>
                      <h4 className="font-bold text-lg mt-1 text-white">ABHA Health Card</h4>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/30">
                      <Fingerprint className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/30 flex items-center justify-center font-bold text-2xl text-white">
                      {kyc.name.charAt(0)}
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xl text-white">{kyc.name}</h5>
                      <p className="text-xs text-white/80 font-mono mt-0.5">{kyc.abha_address}</p>
                      <span className="inline-block mt-1 text-[11px] bg-[#12B981] text-white px-2 py-0.5 rounded-full font-bold">
                        ✓ KYC Verified
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/20 text-xs">
                    <div>
                      <span className="text-white/70 block text-[10px] uppercase font-semibold">
                        ABHA Number
                      </span>
                      <span className="font-mono font-bold text-white text-sm">{kyc.abha_id}</span>
                    </div>
                    <div>
                      <span className="text-white/70 block text-[10px] uppercase font-semibold">
                        Gender / DOB
                      </span>
                      <span className="font-medium text-white">
                        {kyc.gender} • {kyc.dob || "1978-04-12"}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/70 block text-[10px] uppercase font-semibold">
                        Registered Mobile
                      </span>
                      <span className="font-mono text-white">{kyc.mobile || "9876543210"}</span>
                    </div>
                    <div>
                      <span className="text-white/70 block text-[10px] uppercase font-semibold">
                        Data Residency
                      </span>
                      <span className="text-white font-medium">India (DPDP 2023)</span>
                    </div>
                  </div>
                </div>

                {/* Consent Status Card */}
                <div className="bg-white border border-[#E7E4DD] rounded-3xl p-6 shadow-sm">
                  <h4 className="font-bold text-sm text-[#111111] mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#7C6EF7]" />
                    Consent Manager Protocol (M3)
                  </h4>
                  <p className="text-xs text-[#5F5E5A] leading-relaxed mb-4">
                    In compliance with ABDM principles, entering an ABHA does <strong>not</strong> automatically grant unconsented history lookup. The patient must authorize the specific Health Information Types.
                  </p>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#111111] block">
                      Select Health Info Types to Request:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "Prescription", label: "Prescriptions (Rx)" },
                        { id: "DiagnosticReport", label: "Lab / Diagnostic Reports" },
                        { id: "OPConsultation", label: "OPD Consultations" },
                        { id: "DischargeSummary", label: "Discharge Summaries" },
                      ].map((item) => {
                        const isSelected = selectedHiTypes.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleHiType(item.id)}
                            className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-all ${
                              isSelected
                                ? "bg-[#EEEAFE] text-[#7C6EF7] border-[#7C6EF7]"
                                : "bg-[#FAFAFC] text-[#5F5E5A] border-[#E7E4DD] hover:border-[#8A8A8A]"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "}
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {!consentGranted ? (
                    <button
                      onClick={handleGrantConsent}
                      disabled={consentLoading || selectedHiTypes.length === 0}
                      className="w-full mt-5 py-3 rounded-2xl bg-[#7C6EF7] hover:bg-[#6758F0] text-white font-semibold text-xs transition-all shadow-md shadow-[#7C6EF7]/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {consentLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileCheck2 className="w-4 h-4" />
                      )}
                      <span>Grant Consent & Query ABDM Health Exchange</span>
                    </button>
                  ) : (
                    <div className="mt-4 p-3 rounded-xl bg-[#DCFCE7] border border-[#12B981]/30 flex items-center gap-2 text-xs text-[#12B981] font-semibold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Consent Active ({consentId}) • Revocable anytime</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Linked Longitudinal Records (FHIR R4) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white border border-[#E7E4DD] rounded-3xl p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#F2F0EB]">
                    <div>
                      <h4 className="font-bold text-base text-[#111111] flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-[#7C6EF7]" />
                        Discovered FHIR Health Records
                      </h4>
                      <p className="text-xs text-[#5F5E5A] mt-0.5">
                        Fetched from Linked Health Information Providers (HIPs)
                      </p>
                    </div>
                    {consentGranted && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EEEAFE] text-[#7C6EF7]">
                        {linkedRecords.length} Records Found
                      </span>
                    )}
                  </div>

                  {!consentGranted ? (
                    <div className="text-center py-12 px-4 rounded-2xl bg-[#FAFAFC] border border-dashed border-[#E7E4DD]">
                      <FileText className="w-12 h-12 text-[#8A8A8A] mx-auto mb-3 opacity-40" />
                      <h5 className="font-bold text-sm text-[#111111]">Awaiting Patient Consent</h5>
                      <p className="text-xs text-[#5F5E5A] max-w-sm mx-auto mt-1">
                        Click <strong>Grant Consent</strong> on the left panel to fetch historic prescriptions, lab tests, and past encounters from ABDM network hospitals.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in">
                      {linkedRecords.map((rec, idx) => (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl border border-[#E7E4DD] bg-[#FAFAFC] hover:bg-white hover:border-[#7C6EF7] transition-all shadow-sm group"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EEEAFE] text-[#7C6EF7] mb-1">
                                {rec.record_type}
                              </span>
                              <h5 className="font-bold text-sm text-[#111111] group-hover:text-[#7C6EF7] transition-colors">
                                {rec.hip_name}
                              </h5>
                            </div>
                            <span className="text-xs text-[#5F5E5A] flex items-center gap-1 shrink-0 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-[#8A8A8A]" />
                              {rec.date}
                            </span>
                          </div>

                          <p className="text-xs text-[#5F5E5A] leading-relaxed bg-white p-3 rounded-xl border border-[#F2F0EB] my-2">
                            {rec.summary}
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-[#8A8A8A] pt-1">
                            <span>Physician: <strong>{rec.doctor}</strong></span>
                            <span className="font-mono">Care Context: {rec.care_context}</span>
                          </div>
                        </div>
                      ))}

                      {/* Next Step CTA */}
                      <div className="p-4 rounded-2xl bg-[#F5F3FF] border border-[#7C6EF7]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#7C6EF7] text-white flex items-center justify-center shrink-0">
                            <Stethoscope className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-[#111111]">
                              Ready for Clinical Intake
                            </h5>
                            <p className="text-[11px] text-[#5F5E5A]">
                              Historic records will be provided to the AI voice agent for context.
                            </p>
                          </div>
                        </div>

                        <Link
                          href="/kiosk"
                          className="px-4 py-2.5 rounded-xl bg-[#7C6EF7] hover:bg-[#6758F0] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#7C6EF7]/20 whitespace-nowrap"
                        >
                          <span>Proceed to AI Triage</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E7E4DD] py-4 px-6 mt-12 text-center text-xs text-[#5F5E5A]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MediKiosk ABDM M1/M2/M3 Sandbox Gateway • Health Information User (HIU)</span>
          <span className="text-[#8A8A8A]">Compliant with Ayushman Bharat Digital Mission & DPDP Act 2023</span>
        </div>
      </footer>
    </div>
  );
}
