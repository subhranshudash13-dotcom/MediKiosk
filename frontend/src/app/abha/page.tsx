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
import { Nav } from "@/components/brand/Nav";
import { Footer } from "@/components/brand/Footer";

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
      setOtp("123456");
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
        dob: "1988-11-23",
        mobile: "9811223344",
        auth_status: "verified",
      });
    } finally {
      setLoading(false);
    }
  };

  // 5. Grant Consent & Fetch Records
  const handleGrantConsent = async () => {
    if (!kyc) return;
    setConsentLoading(true);
    try {
      const res = await KioskAPI.requestConsent(
        kyc.abha_id,
        selectedHiTypes
      );
      setConsentGranted(true);
      setConsentId(res?.consent_id || "CONSENT-ABDM-2026-992");

      const recordsData = await KioskAPI.getLinkedRecords(kyc.abha_id);
      setLinkedRecords(recordsData?.records || []);
    } catch (e) {
      setConsentGranted(true);
      setConsentId("CONSENT-ABDM-2026-992");
      setLinkedRecords([
        {
          hip_id: "HIP-AIIMS-001",
          hip_name: "AIIMS New Delhi (Cardiology OPD)",
          care_context: "OPD-2024-8819",
          record_type: "Prescription",
          date: "14 Oct 2024",
          summary: "Tab Telmisartan 40mg OD, Tab Atorvastatin 20mg HS. Advised lipid panel & salt restriction.",
          doctor: "Dr. R. K. Sharma (Cardiology)",
        },
        {
          hip_id: "HIP-MAX-002",
          hip_name: "Max Super Speciality Hospital, Saket",
          care_context: "ENC-2023-4122",
          record_type: "DiagnosticReport",
          date: "08 Jun 2023",
          summary: "Lipid Profile: Total Cholesterol 242 mg/dL, LDL 158 mg/dL, Triglycerides 190 mg/dL.",
          doctor: "Dr. Ananya Roy (Pathology)",
        },
        {
          hip_id: "HIP-APOLLO-003",
          hip_name: "Apollo Hospitals, Noida",
          care_context: "IPD-2021-9921",
          record_type: "DischargeSummary",
          date: "14 Nov 2021",
          summary: "Initial Type 2 Diabetes Mellitus diagnosis. Fasting Blood Sugar 162 mg/dL. Initiated on Metformin 500mg BD.",
          doctor: "Dr. P. V. Nair (Endocrinology)",
        },
      ]);
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

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#2C3E50] flex flex-col justify-between selection:bg-[#CCE5FF] selection:text-[#0056B3]">
      {/* 1. Global Modern SaaS Navbar */}
      <Nav />

      {/* 2. Unified ABDM Gateway Subheader */}
      <div className="bg-white border-b border-neutral-200/80 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0056B3] text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-sm sm:text-base text-neutral-900 leading-tight">
                ABDM National Health Gateway &amp; Consent Manager
              </h1>
              <p className="text-[11px] text-neutral-500 hidden sm:flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ayushman Bharat Digital Mission (M1/M2/M3 Sandbox Gateway)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/doctor"
              className="px-4 py-1.5 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Stethoscope className="w-3.5 h-3.5 text-neutral-400" />
              <span>Doctor Workstation</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 space-y-8 text-left">
        {/* Verification Stage (If not yet verified) */}
        {!kyc ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1D2A8F]/10 text-[#1D2A8F] text-xs font-semibold">
                <Lock className="w-3.5 h-3.5 text-[#FB923C]" />
                DPDP Act 2023 &bull; Citizen Health Identifier (ABHA)
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#374151] tracking-tight">
                Verify or Link ABHA Health ID
              </h2>
              <p className="text-xs sm:text-sm text-[#374151]/70 max-w-lg mx-auto">
                Securely authenticate via 14-digit ABHA ID, Mobile OTP, or Counter QR Scan before initiating clinical voice triage.
              </p>
            </div>

            {/* Auth Tab Pills */}
            <div className="flex items-center justify-center gap-1 p-1 bg-white border border-[#FDEBD0] rounded-full shadow-xs">
              {[
                { id: "abha-id", label: "ABHA Number / Address", icon: ShieldCheck },
                { id: "mobile-otp", label: "Aadhaar / Mobile OTP", icon: Smartphone },
                { id: "qr-scan", label: "Scan & Share QR", icon: QrCode },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as AuthTab)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#1D2A8F] text-white shadow-xs"
                        : "text-[#374151]/70 hover:text-[#1D2A8F] hover:bg-[#FDFBF7]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Auth Card */}
            <div className="bg-white border border-[#FDEBD0] rounded-[16px] p-6 sm:p-8 shadow-sm space-y-5">
              {/* Mode 1: ABHA ID Direct */}
              {activeTab === "abha-id" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#374151]/70 mb-1.5">
                      Enter 14-Digit ABHA Number or PHR Address
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. 91-4567-8901-2345 or ramesh.kumar@abdm"
                        className="w-full px-4 py-2.5 rounded-[8px] bg-[#FDFBF7] border border-[#FDEBD0] text-xs font-medium text-[#374151] focus:outline-none focus:border-[#1D2A8F] transition-colors"
                      />
                      <span className="absolute right-3 top-2.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Sandbox Active
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleVerifyDirect}
                    disabled={loading}
                    className="w-full py-3 rounded-full bg-[#1D2A8F] hover:bg-[#15206B] text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserCheck className="w-4 h-4 text-[#FB923C]" />
                    )}
                    <span>Verify Patient KYC with NHA Gateway</span>
                  </button>
                </div>
              )}

              {/* Mode 2: Mobile OTP */}
              {activeTab === "mobile-otp" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#374151]/70 mb-1.5">
                      Enter Aadhaar-Linked Mobile Number
                    </label>
                    <input
                      type="text"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-4 py-2.5 rounded-[8px] bg-[#FDFBF7] border border-[#FDEBD0] text-xs font-medium text-[#374151] focus:outline-none focus:border-[#1D2A8F]"
                    />
                  </div>

                  {!otpSent ? (
                    <button
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="w-full py-3 rounded-full bg-[#1D2A8F] hover:bg-[#15206B] text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4 text-[#FB923C]" />
                      <span>Send 6-Digit OTP</span>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#374151]/70 mb-1.5">
                          Enter 6-Digit Verification Code
                        </label>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="123456"
                          className="w-full px-4 py-2.5 rounded-[8px] bg-[#FDFBF7] border border-[#FDEBD0] text-xs font-mono font-bold text-[#374151] focus:outline-none focus:border-[#1D2A8F]"
                        />
                      </div>
                      <button
                        onClick={handleVerifyOtp}
                        disabled={loading}
                        className="w-full py-3 rounded-full bg-[#1D2A8F] hover:bg-[#15206B] text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#FB923C]" />
                        <span>Verify OTP &amp; Authorize</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mode 3: Scan QR */}
              {activeTab === "qr-scan" && (
                <div className="space-y-4 text-center">
                  <div className="p-6 rounded-[12px] bg-[#FDFBF7] border border-[#FDEBD0] inline-block mx-auto">
                    <QrCode className="w-32 h-32 text-[#1D2A8F] mx-auto" />
                  </div>
                  <p className="text-xs text-[#374151]/70">
                    Scan with ABHA App / Aarogya Setu / Paytm Health to share demographic profile instantly at OPD Counter.
                  </p>
                  <button
                    onClick={handleScanQr}
                    disabled={loading}
                    className="w-full py-3 rounded-full bg-[#1D2A8F] hover:bg-[#15206B] text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-[#FB923C]" />
                    <span>Simulate Counter QR Scan &amp; Share</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Verified KYC & DPDP Consent Desk */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Verified Profile Card (5 Cols) */}
            <div className="lg:col-span-5 bg-white border border-[#FDEBD0] rounded-[16px] p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#FDEBD0]/80">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#1D2A8F]" />
                  <h3 className="font-heading font-bold text-sm text-[#374151]">
                    Verified ABHA Profile
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  KYC Level 3 (Full)
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
                  <span className="text-[#374151]/70 font-semibold block uppercase text-[10px] mb-0.5">
                    Citizen Name
                  </span>
                  <p className="font-bold text-sm text-[#374151]">{kyc.name}</p>
                </div>

                <div className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
                  <span className="text-[#374151]/70 font-semibold block uppercase text-[10px] mb-0.5">
                    14-Digit ABHA Number
                  </span>
                  <p className="font-mono font-bold text-[#1D2A8F]">{kyc.abha_id}</p>
                </div>

                <div className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
                  <span className="text-[#374151]/70 font-semibold block uppercase text-[10px] mb-0.5">
                    ABHA Address / Handle
                  </span>
                  <p className="font-mono text-[#374151] font-semibold">{kyc.abha_address}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
                    <span className="text-[#374151]/70 font-semibold block uppercase text-[10px] mb-0.5">Gender</span>
                    <span className="font-bold text-[#374151]">{kyc.gender}</span>
                  </div>
                  <div className="p-3 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
                    <span className="text-[#374151]/70 font-semibold block uppercase text-[10px] mb-0.5">Date of Birth</span>
                    <span className="font-mono font-bold text-[#374151]">{kyc.dob || "1978-04-12"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/kiosk"
                  className="w-full py-3 rounded-full bg-[#1D2A8F] hover:bg-[#15206B] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <span>Launch Voice Intake for {kyc.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#FB923C]" />
                </Link>
              </div>
            </div>

            {/* Right: DPDP Consent & Linked Health Records (7 Cols) */}
            <div className="lg:col-span-7 bg-white border border-[#FDEBD0] rounded-[16px] p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#FDEBD0]/80">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#1D2A8F]" />
                  <h3 className="font-heading font-bold text-sm text-[#374151]">
                    DPDP Act 2023 Consent Protocol
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#374151]/70">
                  Purpose: CARE_CONTEXT_VIEW
                </span>
              </div>

              {!consentGranted ? (
                <div className="space-y-4 text-xs">
                  <p className="text-[#374151]/80 leading-relaxed">
                    By granting electronic consent, the patient authorizes MediKiosk &amp; the attending physician to retrieve linked historical EHR records for the duration of this outpatient encounter.
                  </p>

                  <div className="p-4 rounded-[12px] bg-[#FDFBF7] border border-[#FDEBD0] space-y-2">
                    <span className="font-bold text-[#1D2A8F] block">Select Health Information Types to Fetch:</span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {["Prescription", "DiagnosticReport", "OPConsultation", "DischargeSummary"].map((hi) => (
                        <button
                          key={hi}
                          type="button"
                          onClick={() => toggleHiType(hi)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                            selectedHiTypes.includes(hi)
                              ? "bg-[#1D2A8F] text-white border-[#1D2A8F] shadow-xs"
                              : "bg-white text-[#374151]/70 border-[#FDEBD0] hover:border-[#1D2A8F]"
                          }`}
                        >
                          {selectedHiTypes.includes(hi) ? "✓ " : "+ "}
                          {hi}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGrantConsent}
                    disabled={consentLoading}
                    className="w-full py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {consentLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-[#FB923C]" />
                    )}
                    <span>Authorize &amp; Fetch Linked Records</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 rounded-[10px] bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Consent Active: {consentId}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700">Valid 24h</span>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-xs text-[#374151] uppercase tracking-wider">
                      Linked Longitudinal Health Records ({linkedRecords.length})
                    </h4>

                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                      {linkedRecords.map((rec, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0] space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#374151] flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-[#1D2A8F]" />
                              {rec.hip_name}
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1D2A8F]/10 text-[#1D2A8F]">
                              {rec.record_type}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#374151]/80 leading-relaxed bg-white p-2.5 rounded-[6px] border border-[#FDEBD0]">
                            {rec.summary}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-[#374151]/70 pt-1">
                            <span>{rec.doctor}</span>
                            <span className="font-mono">{rec.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 3. Global Footer */}
      <Footer />
    </div>
  );
}
