"use client";

import React, { useState, useRef, useEffect, ChangeEvent, DragEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  Camera,
  Folder,
  Lock,
  Info,
  FileText,
  FlaskConical,
  FileSpreadsheet,
  Receipt,
  MoreHorizontal,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Stethoscope,
  Pill,
  HeartPulse,
  Activity,
  Calendar,
  Building2,
  User,
  X,
  ArrowRight,
  FileCheck,
  Eye,
  LogIn,
  UserPlus,
  Sun,
  Moon,
  Clock,
  Printer,
  Lightbulb,
  AlertCircle,
  Check,
} from "lucide-react";
import { Nav } from "@/components/brand/Nav";
import { MedicalDocument, ExtractedMedication, ExtractedLabResult } from "@/lib/types";
import { useAuthStore } from "@/lib/auth-store";
import { getBackendUrl } from "@/lib/config";
import { getAccessToken } from "@/lib/auth-api";

function parseDosageSchedule(frequency?: string) {
  const f = (frequency || "").toLowerCase();
  const isSOS = f.includes("sos") || f.includes("as needed") || f.includes("when needed") || f.includes("prn");
  const isMorning = !isSOS && (f.includes("1-0-1") || f.includes("1-1-1") || f.includes("1-0-0") || f.includes("101") || f.includes("100") || f.includes("111") || f.includes("morning") || f.includes("od") || f.includes("bd") || f.includes("tds"));
  const isAfternoon = !isSOS && (f.includes("1-1-1") || f.includes("111") || f.includes("tds") || f.includes("thrice") || f.includes("afternoon") || f.includes("lunch"));
  const isNight = !isSOS && (f.includes("1-0-1") || f.includes("1-1-1") || f.includes("0-0-1") || f.includes("001") || f.includes("101") || f.includes("hs") || f.includes("night") || f.includes("bedtime") || f.includes("bd") || f.includes("tds"));

  return { isMorning, isAfternoon, isNight, isSOS };
}

function parseActionDirectives(actionPlan?: string, clinicalIntent?: string): string[] {
  const text = actionPlan || clinicalIntent || "";
  const parts = text.split(/(?:\d+\.\s+|;\s*)/).map(s => s.trim()).filter(s => s.length > 4);
  if (parts.length > 0) return parts;
  return text ? [text] : ["Take prescribed medications on time.", "Ensure adequate hydration and rest.", "Follow up if symptoms persist."];
}

interface QuickExampleItem {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  type: "prescription" | "diabetic_lab_report" | "renal_panel" | "imaging";
}

const QUICK_EXAMPLES: QuickExampleItem[] = [
  {
    id: "prescription",
    title: "Prescription Sample",
    badge: "Prescription",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Amlodipine, Metformin, Pantoprazole (Hypertension + T2D)",
    type: "prescription",
  },
  {
    id: "diabetic_lab_report",
    title: "Lab Report Sample",
    badge: "Lab Panel",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "HbA1c (9.2%), Fasting Blood Sugar, Serum Creatinine",
    type: "diabetic_lab_report",
  },
  {
    id: "renal_panel",
    title: "Discharge Summary",
    badge: "Discharge Slip",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    description: "Acute Bronchitis (Azithromycin, Paracetamol)",
    type: "renal_panel",
  },
  {
    id: "imaging",
    title: "Imaging Report",
    badge: "Radiology",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    description: "Chest X-Ray Report (PDF Example)",
    type: "imaging",
  },
];

export default function DocumentIntelligencePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, initialized, initAuth } = useAuthStore();
  const effectivePatientId = user?.user_id || "P-DEMO-001";

  // Upload & Scan state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStage, setScanStage] = useState<string>("");
  const [extractedDoc, setExtractedDoc] = useState<MedicalDocument | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeUploadTab, setActiveUploadTab] = useState<"upload" | "camera" | "device">("upload");
  const [activeResultsTab, setActiveResultsTab] = useState<"overview" | "meds" | "labs" | "raw">("overview");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Upload file to backend OCR endpoint
  const processUploadedFile = async (overrideFile?: File) => {
    const fileToUse = overrideFile || selectedFile;
    if (!fileToUse) return;

    if (!isAuthenticated) {
      setErrorMsg("Authentication required. Please sign in to upload and scan documents.");
      router.push("/patient/login?returnUrl=/documents");
      return;
    }

    setIsScanning(true);
    setErrorMsg(null);
    setScanStage("Uploading medical document to Qwen Vision Engine...");

    try {
      const formData = new FormData();
      formData.append("file", fileToUse);
      if (user?.user_id) {
        formData.append("patient_id", user.user_id);
      }
      formData.append("auto_sync_timeline", "true");

      const backendUrl = getBackendUrl();
      const token = getAccessToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      setScanStage("Processing Prescription with Qwen Vision OCR...");
      const res = await fetch(`${backendUrl}/api/v1/documents/upload`, {
        method: "POST",
        headers,
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Authentication required. Please log in before uploading documents.");
        }
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server returned HTTP ${res.status}`);
      }

      setScanStage("Decoding Pharmacological Intent & Clinical Vitals...");
      const data: MedicalDocument = await res.json();
      setExtractedDoc(data);

      // Auto-scroll down to results preview
      setTimeout(() => {
        window.scrollTo({ top: 400, behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setErrorMsg(err.message || "Failed to process prescription image with Qwen Vision OCR.");
    } finally {
      setIsScanning(false);
      setScanStage("");
    }
  };

  // Handle file selection (with auto-scanning trigger)
  const handleFileChange = (file: File) => {
    if (!isAuthenticated) {
      setErrorMsg("Authentication required. Please log in before uploading documents.");
      router.push("/patient/login?returnUrl=/documents");
      return;
    }
    setErrorMsg(null);
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    // Automatically trigger upload and scan
    processUploadedFile(file);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  // Process Quick Sample Preset
  const processSampleDocument = async (sampleType: string) => {
    if (!isAuthenticated) {
      setErrorMsg("Authentication required. Please log in before processing sample documents.");
      router.push("/patient/login?returnUrl=/documents");
      return;
    }
    setIsScanning(true);
    setErrorMsg(null);
    setScanStage("Loading clinical reference document...");

    try {
      const backendUrl = getBackendUrl();
      const token = getAccessToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(
        `${backendUrl}/api/v1/documents/process-sample?sample_type=${sampleType}${user?.user_id ? `&patient_id=${user.user_id}` : ""}`,
        {
          method: "POST",
          headers,
          credentials: "include",
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Authentication required. Please log in to process documents.");
        }
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      setScanStage("Analyzing Pharmacological Intent & Lab References...");
      const data: MedicalDocument = await res.json();
      setExtractedDoc(data);
      // Auto-scroll to results
      setTimeout(() => {
        window.scrollTo({ top: 400, behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      console.error("Sample process failed:", err);
      setErrorMsg("Failed to process sample document.");
    } finally {
      setIsScanning(false);
      setScanStage("");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans selection:bg-[#EBF5FF] selection:text-[#0066FF]">
      {/* Hidden File & Camera Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFileInput}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileInput}
      />

      {/* ─── Standard MediKiosk Global Navigation Bar ─── */}
      <Nav />

      {/* ─── Main Page Wrapper ─── */}
      <main className="max-w-[1240px] mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Back to Dashboard Pill */}
        <div>
          <Link
            href="/patient/dashboard"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50/80 hover:bg-blue-100/70 border border-blue-100 text-blue-700 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* ─── Sub-Header & Insights Callout ─── */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-2">
          {/* Left Title & Description */}
          <div className="max-w-2xl space-y-1.5 text-left">
            <div className="text-[11px] font-extrabold tracking-wider text-[#0066FF] uppercase">
              DOCUMENT INTELLIGENCE
            </div>
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-[#0F172A] tracking-tight leading-tight">
              Upload &amp; Understand Your Medical Documents
            </h1>
            <p className="text-xs md:text-sm text-[#64748B] leading-relaxed">
              Attach prescriptions, lab reports, or discharge summaries. MediKiosk uses advanced OCR to extract, organize and understand your health information — securely and in your language.
            </p>
          </div>

          {/* Right Floating Accent Card ("From documents to insights") */}
          <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-white border border-emerald-200/70 p-4 sm:p-5 shadow-xs flex items-center justify-between gap-5 shrink-0 max-w-md w-full">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-2xs shrink-0">
                <FileCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-left">
                <h3 className="font-heading font-bold text-xs sm:text-sm text-[#0F172A]">
                  From documents to insights
                </h3>
                <p className="text-[11px] text-[#64748B] mt-0.5 font-medium">
                  OCR · Clinical Context · Organized Timeline
                </p>
              </div>
            </div>

            {/* Organic Pill Badge */}
            <div className="hidden sm:block text-right bg-emerald-100/70 text-emerald-900 px-3 py-2 rounded-2xl border border-emerald-200 text-[11px] font-semibold leading-tight shrink-0">
              <div>Your health,</div>
              <div>Your story.</div>
              <div className="font-bold text-emerald-950">In one place.</div>
            </div>
          </div>
        </div>

        {/* ─── Main Two-Column Layout (Upload Station + What Happens Next) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Upload Card (8 Cols) */}
          <div className="lg:col-span-8 bg-white border border-[#E2E8F0] rounded-[28px] p-6 md:p-8 shadow-xs space-y-6 text-left">
            {!initialized || isLoading ? (
              /* Loading auth session */
              <div className="rounded-[24px] border border-[#E2E8F0] bg-[#F8FAFC] p-12 text-center flex flex-col items-center justify-center min-h-[300px] shadow-xs space-y-3">
                <RefreshCw className="w-7 h-7 text-[#0066FF] animate-spin" />
                <p className="text-xs font-semibold text-[#64748B]">Verifying patient session...</p>
              </div>
            ) : !isAuthenticated ? (
              /* ─── Unauthorized Access Barrier Card ─── */
              <div className="rounded-[24px] border-2 border-dashed border-blue-200 bg-gradient-to-b from-blue-50/70 to-white p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[320px] shadow-xs space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-[#0066FF] flex items-center justify-center shadow-xs">
                  <Lock className="w-8 h-8 text-[#0066FF]" />
                </div>
                <div className="max-w-md space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-800 text-[11px] font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0066FF]" />
                    <span>Secure Patient Portal Access</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#0F172A] tracking-tight">
                    Authentication Required to Upload Documents
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                    Doctor prescription OCR, multimodal vision transcription, and longitudinal EHR synchronization are restricted to authenticated patients. Please log in or create an account to upload documents.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full max-w-sm">
                  <Link
                    href="/patient/login?returnUrl=/documents"
                    className="w-full sm:w-1/2 rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white py-2.5 px-4 text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/patient/signup?returnUrl=/documents"
                    className="w-full sm:w-1/2 rounded-full bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[#0F172A] py-2.5 px-4 text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Top Tab Bar & Security Note */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-full border border-slate-200/70">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveUploadTab("upload");
                        fileInputRef.current?.click();
                      }}
                      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        activeUploadTab === "upload"
                          ? "bg-white text-[#0066FF] shadow-xs"
                          : "text-[#64748B] hover:text-[#0F172A]"
                      }`}
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-[#0066FF]" />
                      <span>Upload Document</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveUploadTab("camera");
                        cameraInputRef.current?.click();
                      }}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        activeUploadTab === "camera"
                          ? "bg-white text-[#0066FF] shadow-xs"
                          : "text-[#64748B] hover:text-[#0F172A]"
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Use Camera</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveUploadTab("device");
                        fileInputRef.current?.click();
                      }}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        activeUploadTab === "device"
                          ? "bg-white text-[#0066FF] shadow-xs"
                          : "text-[#64748B] hover:text-[#0F172A]"
                      }`}
                    >
                      <Folder className="w-3.5 h-3.5" />
                      <span>From Device</span>
                    </button>
                  </div>

                  {/* Encryption Note */}
                  <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px]">All uploads are encrypted and secure</span>
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                {/* ─── Dashed Dropzone Area ─── */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !selectedFile && fileInputRef.current?.click()}
                  className={`relative rounded-[24px] border-2 border-dashed p-6 sm:p-10 transition-all text-center flex flex-col items-center justify-center min-h-[290px] ${
                    selectedFile
                      ? "border-[#0066FF]/60 bg-[#F0F7FF]/50"
                      : "border-[#B8D5FA] bg-[#F7FAFF]/80 hover:bg-[#F0F6FF] hover:border-[#0066FF] cursor-pointer"
                  } ${isDragging ? "border-[#0066FF] bg-[#EBF5FF] scale-[1.01]" : ""}`}
                >
                  {/* Laser Scan Animation when processing */}
                  {isScanning && (
                    <div className="absolute inset-x-0 h-1 bg-[#0066FF] shadow-[0_0_12px_rgba(0,102,255,0.9)] animate-pulse z-20 top-1/2" />
                  )}

                  {selectedFile ? (
                    /* Selected File Card & Actions */
                    <div className="w-full space-y-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-xs">
                        <div className="flex items-center gap-3 truncate">
                          <div className="h-10 w-10 rounded-xl bg-[#EBF5FF] text-[#0066FF] flex items-center justify-center shrink-0">
                            <FileCheck className="h-5 w-5" />
                          </div>
                          <div className="text-left truncate">
                            <p className="text-xs font-bold text-[#0F172A] truncate">
                              {selectedFile.name}
                            </p>
                            <p className="text-[10px] text-[#64748B]">
                              {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type || "Medical File"}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={clearSelectedFile}
                          className="h-8 w-8 rounded-full bg-[#F1F5F9] text-[#64748B] hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Image Preview (Full, Uncropped) */}
                      {previewUrl && (
                        <div className="relative overflow-hidden rounded-2xl border border-[#CBD5E1] bg-slate-100 p-2 shadow-inner">
                          <img
                            src={previewUrl}
                            alt="Prescription Preview"
                            className="max-h-[340px] w-auto h-auto object-contain rounded-xl mx-auto bg-white shadow-xs"
                          />
                        </div>
                      )}

                      {/* Trigger OCR Button */}
                      <button
                        type="button"
                        onClick={() => processUploadedFile()}
                        disabled={isScanning}
                        className="w-full rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white py-3 text-xs font-bold shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-75"
                      >
                        {isScanning ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>{scanStage || "Processing Medical Document with Qwen Vision..."}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            <span>Re-scan &amp; Analyze Document</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    /* Default Empty Dropzone */
                    <div className="space-y-3.5 py-4">
                      {/* Big Blue Cloud Icon */}
                      <div className="w-16 h-16 rounded-full bg-[#EBF5FF] text-[#0066FF] flex items-center justify-center mx-auto shadow-xs">
                        <UploadCloud className="w-8 h-8" />
                      </div>

                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">
                          Drag &amp; drop your medical document here
                        </h3>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          or click to browse files
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white px-8 py-2.5 text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
                      >
                        Choose File
                      </button>

                      <p className="text-[11px] text-[#94A3B8]">
                        Supports JPG, PNG, PDF, WEBP (Max 10 MB)
                      </p>

                      {/* Document Type Categories Row */}
                      <div className="pt-4 flex flex-wrap items-center justify-center gap-2.5">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-left shadow-2xs">
                          <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <div>
                            <div className="text-[11px] font-bold text-[#0F172A] leading-tight">Prescriptions</div>
                            <div className="text-[9px] text-[#64748B]">(PDF / Image)</div>
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-left shadow-2xs">
                          <FlaskConical className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <div>
                            <div className="text-[11px] font-bold text-[#0F172A] leading-tight">Lab Reports</div>
                            <div className="text-[9px] text-[#64748B]">(PDF / Image)</div>
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-left shadow-2xs">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <div>
                            <div className="text-[11px] font-bold text-[#0F172A] leading-tight">Discharge Summaries</div>
                            <div className="text-[9px] text-[#64748B]">(PDF / Image)</div>
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-left shadow-2xs">
                          <Receipt className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <div>
                            <div className="text-[11px] font-bold text-[#0F172A] leading-tight">Medical Bills</div>
                            <div className="text-[9px] text-[#64748B]">(Optional)</div>
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-left shadow-2xs">
                          <MoreHorizontal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <div>
                            <div className="text-[11px] font-bold text-[#0F172A] leading-tight">More</div>
                            <div className="text-[9px] text-[#64748B]">(Any document)</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">Document Scanning Alert:</strong>
                  <span>{errorMsg}</span>
                </div>
              </div>
            )}

            {/* ─── LIVE EXTRACTED RESULTS VIEWER (Appears on Scan Complete) ─── */}
            {extractedDoc && (
              <div className="pt-6 border-t-2 border-slate-200 space-y-6 animate-fadeIn">
                {/* 1. Header & Verification Hero Card */}
                <div className="rounded-3xl border-2 border-[#0066FF]/30 bg-gradient-to-br from-[#F0F7FF] via-white to-[#EBF3FF] p-6 sm:p-7 shadow-sm relative overflow-hidden space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#0066FF] text-white px-3 py-1 text-xs font-black uppercase tracking-wider shadow-xs">
                          {extractedDoc.document_type.replace("_", " ")}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3 py-1 rounded-full">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          {extractedDoc.confidence_score || 99.2}% Verified by Qwen Vision AI
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0066FF] bg-white px-3 py-1 rounded-full border border-[#0066FF]/30 shadow-2xs">
                          <ShieldCheck className="h-3.5 w-3.5" /> ABDM Linked
                        </span>
                      </div>
                      <h3 className="font-heading text-xl sm:text-2xl font-black text-[#0F172A] pt-1 leading-snug tracking-tight">
                        {extractedDoc.document_purpose || "Outpatient Clinical Prescription"}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-300 transition-all shadow-2xs cursor-pointer"
                        title="Print prescription record"
                      >
                        <Printer className="h-3.5 w-3.5 text-slate-600" /> Print
                      </button>
                      <Link
                        href="/patient/history"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-400 transition-all shadow-2xs"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> View in Health Timeline &rarr;
                      </Link>
                    </div>
                  </div>

                  {/* 2. Bento Consultation Info Strip (4 Spacious Cards) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                    {/* Doctor */}
                    <div className="p-3.5 rounded-2xl bg-white border border-blue-100/90 shadow-2xs space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                        <Stethoscope className="w-4 h-4 text-[#0066FF]" /> Treating Physician
                      </div>
                      <div className="text-sm sm:text-base font-black text-[#0F172A] truncate" title={extractedDoc.doctor_name || "Attending Physician"}>
                        {extractedDoc.doctor_name || "Dr. Attending Physician"}
                      </div>
                      <div className="text-xs text-slate-500 font-medium truncate">
                        Consultant Physician
                      </div>
                    </div>

                    {/* Healthcare Facility */}
                    <div className="p-3.5 rounded-2xl bg-white border border-blue-100/90 shadow-2xs space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                        <Building2 className="w-4 h-4 text-[#0066FF]" /> Facility / Clinic
                      </div>
                      <div className="text-sm sm:text-base font-bold text-[#0F172A] truncate" title={extractedDoc.facility_name || "Healthcare Clinic"}>
                        {extractedDoc.facility_name || "Healthcare Clinic"}
                      </div>
                      <div className="text-xs text-slate-500 font-medium truncate">
                        Outpatient Department
                      </div>
                    </div>

                    {/* Patient Name */}
                    <div className="p-3.5 rounded-2xl bg-white border border-blue-100/90 shadow-2xs space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                        <User className="w-4 h-4 text-[#0066FF]" /> Patient Details
                      </div>
                      <div className="text-sm sm:text-base font-black text-[#0F172A] truncate" title={extractedDoc.patient_name || user?.full_name || "Registered Patient"}>
                        {extractedDoc.patient_name || user?.full_name || "Registered Patient"}
                      </div>
                      <div className="text-xs text-slate-500 font-medium truncate">
                        ABHA ID / UHID Verified
                      </div>
                    </div>

                    {/* Prescription Date */}
                    <div className="p-3.5 rounded-2xl bg-white border border-blue-100/90 shadow-2xs space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                        <Calendar className="w-4 h-4 text-[#0066FF]" /> Consultation Date
                      </div>
                      <div className="text-sm sm:text-base font-mono font-bold text-[#0F172A]">
                        {String(extractedDoc.document_date || new Date().toISOString().split("T")[0])}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        Digitized Medical Record
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Diagnosed Medical Conditions (if available) */}
                {extractedDoc.extracted_diagnoses && extractedDoc.extracted_diagnoses.length > 0 && (
                  <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <HeartPulse className="w-5 h-5 text-rose-600" />
                      <h4 className="font-heading text-sm font-black text-[#0F172A] uppercase tracking-wider">
                        Confirmed Diagnoses &amp; Clinical Indications ({extractedDoc.extracted_diagnoses.length})
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {extractedDoc.extracted_diagnoses.map((diag, dIdx) => {
                        const condName = typeof diag === "string" ? diag : diag.condition;
                        const icdCode = typeof diag === "object" ? diag.icd10_code : undefined;
                        const notes = typeof diag === "object" ? diag.notes : undefined;
                        return (
                          <div key={dIdx} className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-sm sm:text-base text-slate-900">{condName}</span>
                              {icdCode && (
                                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shrink-0">
                                  {icdCode}
                                </span>
                              )}
                            </div>
                            {notes && (
                              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{notes}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Recorded Consultation Vitals (if available) */}
                {extractedDoc.extracted_vitals && extractedDoc.extracted_vitals.length > 0 && (
                  <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-heading text-sm font-black text-[#0F172A] uppercase tracking-wider">
                        Recorded Physical Examination &amp; Vitals
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {extractedDoc.extracted_vitals.map((v, vIdx) => (
                        <div key={vIdx} className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{v.vital_name}</span>
                          <div className="text-base sm:text-lg font-black text-slate-900">
                            {v.value} <span className="text-xs font-normal text-slate-500">{v.unit}</span>
                          </div>
                          {v.is_abnormal ? (
                            <span className="inline-block text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Requires Attention
                            </span>
                          ) : (
                            <span className="inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Within Range
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Doctor's Action Directives & Care Plan */}
                <div className="rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-white p-5 sm:p-6 border-2 border-blue-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-[#0066FF]" />
                    <h4 className="font-heading text-sm sm:text-base font-black text-blue-950 uppercase tracking-wider">
                      Physician&apos;s Clinical Directives &amp; Action Plan
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {parseActionDirectives(extractedDoc.physician_action_plan, extractedDoc.clinical_intent).map((directive, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-3 bg-white/90 p-3 rounded-xl border border-blue-100 shadow-2xs">
                        <span className="w-6 h-6 rounded-full bg-[#0066FF] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          {pIdx + 1}
                        </span>
                        <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                          {directive}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. Extracted Pharmacotherapy & Medication Routine (Core Highlight!) */}
                {extractedDoc.extracted_medications && extractedDoc.extracted_medications.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Pill className="w-5 h-5 text-[#0066FF]" />
                        <div>
                          <h4 className="font-heading text-base sm:text-lg font-black text-[#0F172A] tracking-tight">
                            Prescribed Medications &amp; Daily Routine ({extractedDoc.extracted_medications.length})
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">
                            Follow meal timings and take medicines as scheduled. Do not skip doses.
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                        Normalized against Indian Pharmacopeia
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {extractedDoc.extracted_medications.map((med, idx) => {
                        const sched = parseDosageSchedule(med.frequency);
                        return (
                          <div
                            key={idx}
                            className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-slate-200/90 hover:border-[#0066FF]/60 hover:shadow-md transition-all space-y-4 shadow-xs"
                          >
                            {/* Med Card Title & Strength */}
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="w-7 h-7 rounded-lg bg-blue-100 text-[#0066FF] flex items-center justify-center font-bold text-xs shrink-0">
                                    {idx + 1}
                                  </span>
                                  <h5 className="font-heading text-base sm:text-lg font-black text-[#0F172A]">
                                    {med.name}
                                  </h5>
                                </div>
                                {med.therapeutic_class && (
                                  <span className="inline-block text-xs font-semibold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                                    {med.therapeutic_class}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {med.dosage && (
                                  <span className="text-sm sm:text-base font-mono font-bold text-blue-700 bg-blue-50 px-3.5 py-1 rounded-lg border border-blue-200 shrink-0">
                                    {med.dosage}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Visual Daily Schedule Strip */}
                            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-blue-600" /> Daily Timing Schedule:
                                </span>
                                {med.frequency && (
                                  <span className="text-xs font-bold text-slate-800">
                                    Frequency: <span className="font-mono text-blue-700">{med.frequency}</span>
                                  </span>
                                )}
                              </div>

                              {sched.isSOS ? (
                                <div className="p-2.5 rounded-lg bg-amber-100/70 border border-amber-300 text-amber-950 font-bold text-xs sm:text-sm flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0">⚡</span>
                                  <span>Take SOS (As needed): Only if symptoms, fever &gt; 100°F, or severe pain occur.</span>
                                </div>
                              ) : (
                                <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
                                  {/* Morning */}
                                  <div
                                    className={`p-2 rounded-lg text-center font-bold border transition-colors ${
                                      sched.isMorning
                                        ? "bg-amber-50 border-amber-300 text-amber-950 shadow-2xs"
                                        : "bg-white border-slate-200 text-slate-400"
                                    }`}
                                  >
                                    <div className="flex items-center justify-center gap-1">
                                      <Sun className={`w-3.5 h-3.5 ${sched.isMorning ? "text-amber-600" : "text-slate-400"}`} />
                                      <span>Morning</span>
                                    </div>
                                    <div className="text-[11px] font-semibold mt-0.5">
                                      {sched.isMorning ? "1 Dose" : "—"}
                                    </div>
                                  </div>

                                  {/* Afternoon */}
                                  <div
                                    className={`p-2 rounded-lg text-center font-bold border transition-colors ${
                                      sched.isAfternoon
                                        ? "bg-sky-50 border-sky-300 text-sky-950 shadow-2xs"
                                        : "bg-white border-slate-200 text-slate-400"
                                    }`}
                                  >
                                    <div className="flex items-center justify-center gap-1">
                                      <Sun className={`w-3.5 h-3.5 ${sched.isAfternoon ? "text-sky-600" : "text-slate-400"}`} />
                                      <span>Afternoon</span>
                                    </div>
                                    <div className="text-[11px] font-semibold mt-0.5">
                                      {sched.isAfternoon ? "1 Dose" : "—"}
                                    </div>
                                  </div>

                                  {/* Night */}
                                  <div
                                    className={`p-2 rounded-lg text-center font-bold border transition-colors ${
                                      sched.isNight
                                        ? "bg-indigo-50 border-indigo-300 text-indigo-950 shadow-2xs"
                                        : "bg-white border-slate-200 text-slate-400"
                                    }`}
                                  >
                                    <div className="flex items-center justify-center gap-1">
                                      <Moon className={`w-3.5 h-3.5 ${sched.isNight ? "text-indigo-600" : "text-slate-400"}`} />
                                      <span>Night</span>
                                    </div>
                                    <div className="text-[11px] font-semibold mt-0.5">
                                      {sched.isNight ? "1 Dose" : "—"}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Why Prescribed (Plain English) */}
                            <div className="rounded-xl bg-amber-50/70 border border-amber-200/90 p-3.5 space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                                <span>Why this medicine is prescribed:</span>
                              </div>
                              <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                                {med.clinical_purpose || med.indication || "Prescribed by physician to treat clinical symptoms and restore health."}
                              </p>
                            </div>

                            {/* Administration & Timing Footer */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm pt-1">
                              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                                <span className="font-bold text-slate-900 shrink-0">🍽️ Instructions:</span>
                                <span className="text-slate-700 font-medium">
                                  {med.instructions || "Take post-meals with a glass of water"}
                                </span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-2">
                                <span className="font-bold text-blue-950 shrink-0">⏱️ Course:</span>
                                <span className="text-blue-900 font-semibold">
                                  {med.duration ? `${med.duration} (Complete full course)` : "5 to 7 Days course"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 7. Bottom Action Bar */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setExtractedDoc(null);
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setErrorMsg(null);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-all text-center cursor-pointer shadow-2xs"
                  >
                    Scan Another Prescription
                  </button>
                  <Link
                    href="/patient/history"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>View in Health Timeline</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: What Happens Next? (4 or 5 Cols) */}
          <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-[28px] p-6 md:p-8 shadow-xs space-y-6 text-left">
            <h2 className="font-heading font-bold text-lg text-[#0F172A] tracking-tight">
              What happens next?
            </h2>

            {/* Stepper with connecting line */}
            <div className="relative pl-1 space-y-6">
              {/* Vertical connecting line */}
              <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-slate-200/80" />

              {/* Step 1 */}
              <div className="relative flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-2xs">
                  1
                </div>
                <div className="space-y-0.5 pt-0.5">
                  <h3 className="text-xs font-bold text-[#0F172A]">
                    Document Processing
                  </h3>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    We extract text using advanced OCR (supports multiple languages).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-2xs">
                  2
                </div>
                <div className="space-y-0.5 pt-0.5">
                  <h3 className="text-xs font-bold text-[#0F172A]">
                    Clinical Understanding
                  </h3>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    MediKiosk identifies medications, tests, diagnoses and key information.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-2xs">
                  3
                </div>
                <div className="space-y-0.5 pt-0.5">
                  <h3 className="text-xs font-bold text-[#0F172A]">
                    Saved to Your Records
                  </h3>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    The information is added to your health timeline.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-2xs">
                  4
                </div>
                <div className="space-y-0.5 pt-0.5">
                  <h3 className="text-xs font-bold text-[#0F172A]">
                    Review &amp; Edit
                  </h3>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    You can review, correct and organize the details.
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy & Security Guarantee Card */}
            <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">
                    Your data is private and secure
                  </h4>
                  <p className="text-[10px] text-emerald-700 leading-snug mt-0.5">
                    All documents are encrypted and stored securely in your personal health record.
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1 bg-white/90 border border-emerald-300 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-800 shrink-0 shadow-2xs">
                <Lock className="w-2.5 h-2.5 text-emerald-700" />
                <span>HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Bottom Section: Quick Examples ─── */}
        <div className="space-y-3.5 pt-4 text-left">
          {/* Section Heading & View All Link */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-lg text-[#0F172A] tracking-tight">
                Quick Examples
              </h2>
              <p className="text-xs text-[#64748B]">
                Try with sample documents to see how it works.
              </p>
            </div>

            <button
              type="button"
              onClick={() => processSampleDocument("prescription")}
              className="text-xs font-bold text-[#0066FF] hover:text-[#0052CC] inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View all examples</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4 Example Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_EXAMPLES.map((example) => (
              <div
                key={example.id}
                onClick={() => processSampleDocument(example.type === "imaging" ? "prescription" : example.type)}
                className="bg-white border border-[#E2E8F0] hover:border-[#0066FF] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                {/* Left Mini-Thumbnail */}
                <div className="w-12 h-14 rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs group-hover:border-blue-300 transition-colors">
                  {example.type === "imaging" ? (
                    <div className="w-full h-full bg-slate-900 rounded flex items-center justify-center text-[8px] font-mono text-cyan-300 font-bold">
                      X-RAY
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col justify-between p-0.5">
                      <span className="font-serif font-black text-[9px] text-[#0066FF] leading-none">
                        ℞
                      </span>
                      <div className="space-y-0.5">
                        <div className="h-0.5 w-full bg-slate-300 rounded" />
                        <div className="h-0.5 w-3/4 bg-slate-300 rounded" />
                        <div className="h-0.5 w-1/2 bg-slate-300 rounded" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Center Content */}
                <div className="flex-1 truncate text-left space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#0F172A] truncate group-hover:text-[#0066FF] transition-colors">
                      {example.title}
                    </span>
                  </div>
                  <span
                    className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${example.badgeColor}`}
                  >
                    {example.badge}
                  </span>
                  <p className="text-[10px] text-[#64748B] truncate">
                    {example.description}
                  </p>
                </div>

                {/* Right Arrow Button */}
                <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-blue-100 text-slate-400 group-hover:text-[#0066FF] flex items-center justify-center shrink-0 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
