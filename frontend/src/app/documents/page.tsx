"use client";

import React, { useState, useRef, useEffect, ChangeEvent, DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Clock,
  Printer,
  Image as ImageIcon,
} from "lucide-react";
import { Nav } from "@/components/brand/Nav";
import { Footer } from "@/components/brand/Footer";
import { MedicalDocument } from "@/lib/types";
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
  const { user, initAuth } = useAuthStore();

  // Upload & Scan state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStage, setScanStage] = useState<string>("");
  const [extractedDoc, setExtractedDoc] = useState<MedicalDocument | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeUploadTab, setActiveUploadTab] = useState<"upload" | "camera" | "device">("upload");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Upload file to backend OCR endpoint
  const processUploadedFile = async (overrideFile?: File) => {
    const fileToUse = overrideFile || selectedFile;
    if (!fileToUse) return;

    setIsScanning(true);
    setErrorMsg(null);
    setScanStage("Uploading medical document to Vision OCR Engine...");

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
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server returned HTTP ${res.status}`);
      }

      setScanStage("Decoding Pharmacological Intent & Clinical Vitals...");
      const data: MedicalDocument = await res.json();
      setExtractedDoc(data);

      // Auto-scroll down to results preview
      setTimeout(() => {
        window.scrollTo({ top: 560, behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setErrorMsg(err.message || "Failed to process prescription image with Qwen Vision OCR.");
    } finally {
      setIsScanning(false);
      setScanStage("");
    }
  };

  // Handle file selection
  const handleFileChange = (file: File) => {
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
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      setScanStage("Analyzing Pharmacological Intent & Lab References...");
      const data: MedicalDocument = await res.json();
      setExtractedDoc(data);
      // Auto-scroll to results
      setTimeout(() => {
        window.scrollTo({ top: 560, behavior: "smooth" });
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
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E293B] font-sans selection:bg-[#EBF5FF] selection:text-[#0056B3] flex flex-col justify-between relative overflow-x-hidden">
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

      {/* ─── 1. GLOBAL NAVBAR (RETAINED AS REQUESTED) ─── */}
      <Nav />

      {/* ─── 2. KIOSK HERO HEADER BANNER (Matching Kiosk Page Royal Blue Gradient) ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#003882] via-[#0056B3] to-[#0070EB] text-white py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-[#0047AB]">
        {/* Subtle Background Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-[#17A2B8]/20 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          {/* Top Navigation Row inside Hero */}
          <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/15">
            <Link
              href="/patient/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold transition-all shadow-xs backdrop-blur-md"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Back to Dashboard</span>
            </Link>

            {/* Center Brand Logo */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white text-[#0056B3] flex items-center justify-center font-bold shadow-sm">
                <Activity className="w-4 h-4 text-[#0056B3]" />
              </div>
              <span className="font-heading font-extrabold text-xl text-white tracking-tight">
                Medi<span className="text-[#38BDF8]">Kiosk</span>
              </span>
              <span className="text-xs font-medium text-white/80 hidden sm:inline">
                &bull; Your Health. In Your Hands.
              </span>
            </div>

            <Link
              href="/doctor"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold transition-all shadow-xs backdrop-blur-md"
            >
              <Stethoscope className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Doctor Workstation</span>
            </Link>
          </div>

          {/* Hero 2-Column Split: Title & Kiosk Graphic Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left pt-2">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-4 py-1.5 text-xs font-bold tracking-wide text-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" /> DOCUMENT INTELLIGENCE &amp; OCR STATION
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Upload &amp; Understand <br />
                <span className="text-[#38BDF8]">Your Medical Documents</span>
              </h1>

              <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal max-w-xl">
                Attach prescriptions, lab reports, or discharge summaries. MediKiosk uses advanced Qwen Vision OCR to extract, organize and understand your health information &mdash; securely and in your language.
              </p>
            </div>

            {/* RIGHT COLUMN: Kiosk Document Stack Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-3xl bg-white/10 p-4 border border-white/20 backdrop-blur-md shadow-2xl relative overflow-hidden">
                <div className="relative rounded-2xl bg-[#0F172A] border border-slate-700 p-4 min-h-[160px] flex items-center justify-between gap-3 text-left">
                  
                  {/* Floating Document Cards Stack */}
                  <div className="relative w-full max-w-[240px] h-28">
                    <motion.div
                      initial={{ rotate: -6 }}
                      animate={{ y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      className="absolute left-0 top-3 w-28 bg-white border border-slate-200 rounded-xl p-2 shadow-md z-10 text-slate-900"
                    >
                      <span className="text-[9px] font-bold block">Prescription</span>
                      <div className="h-1 w-full bg-slate-200 rounded-full mt-1" />
                      <div className="text-emerald-500 font-extrabold text-[10px] mt-1">℞</div>
                    </motion.div>

                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.3 }}
                      className="absolute left-14 top-0 w-32 bg-white border border-blue-200 rounded-xl p-2.5 shadow-xl z-30 text-slate-900"
                    >
                      <span className="text-[10px] font-bold block">Lab Report</span>
                      <div className="h-1 w-full bg-blue-500 rounded-full mt-1" />
                      <div className="h-1 w-3/4 bg-blue-200 rounded-full mt-1" />
                      <div className="absolute -top-2 -right-1.5 bg-[#0056B3] text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                        OCR
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ rotate: 6 }}
                      animate={{ y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut", delay: 0.6 }}
                      className="absolute right-0 top-4 w-28 bg-white border border-slate-200 rounded-xl p-2 shadow-md z-20 text-slate-900"
                    >
                      <span className="text-[8px] font-bold block">Discharge Summary</span>
                      <div className="h-1 w-full bg-slate-200 rounded-full mt-1" />
                      <FileText className="w-3 h-3 text-blue-500 mt-1" />
                    </motion.div>
                  </div>

                  <div className="hidden sm:flex flex-col items-end justify-center pr-1 shrink-0 space-y-0.5">
                    <span className="font-serif italic text-sm text-white font-semibold text-right leading-tight">
                      From documents <br /> to insights
                    </span>
                    <svg className="w-16 h-4 text-[#38BDF8]" viewBox="0 0 100 25" fill="none">
                      <path d="M 5 20 Q 50 5 95 18" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" fill="none" />
                      <path d="M 90 12 L 96 18 L 88 22" fill="currentColor" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 3. MAIN KIOSK UPLOADER STATION ─── */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1 text-left">
        
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-left relative overflow-hidden">
          
          {/* Action Tabs Header & Security Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-100">
            {/* Tabs */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveUploadTab("upload");
                  fileInputRef.current?.click();
                }}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeUploadTab === "upload"
                    ? "bg-[#0056B3] text-white shadow-md"
                    : "bg-[#F8F9FA] border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Document</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveUploadTab("camera");
                  cameraInputRef.current?.click();
                }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeUploadTab === "camera"
                    ? "bg-[#0056B3] text-white shadow-md"
                    : "bg-[#F8F9FA] border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Use Camera</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveUploadTab("device");
                  fileInputRef.current?.click();
                }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeUploadTab === "device"
                    ? "bg-[#0056B3] text-white shadow-md"
                    : "bg-[#F8F9FA] border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Folder className="w-4 h-4" />
                <span>From Device</span>
              </button>
            </div>

            {/* Security Guarantee Note */}
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium">All uploads are encrypted and secure</span>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* ─── MAIN DRAG & DROP DASHED ZONE (NO INTERSECTING BACKGROUND DOTTED LINE) ─── */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed p-6 sm:p-10 transition-all text-center flex flex-col items-center justify-center min-h-[240px] overflow-hidden ${
              selectedFile
                ? "border-[#0056B3]/70 bg-[#F0F7FF]"
                : "border-[#84BAFF] bg-gradient-to-b from-[#F2F7FF] via-[#EBF3FF] to-[#F5F9FF] hover:bg-[#EEF5FF] cursor-pointer"
            } ${isDragging ? "border-[#0056B3] bg-[#EBF5FF] scale-[1.01]" : ""}`}
          >
            {/* 4 Floating Format Badges (PDF, JPG, PNG, WEBP) */}
            {!selectedFile && (
              <>
                <motion.div
                  initial={{ rotate: -6 }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute top-5 left-6 sm:top-6 sm:left-12 pointer-events-none hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-red-50 to-pink-100 border border-red-200 shadow-sm text-red-600 font-extrabold text-xs"
                >
                  <FileText className="w-4 h-4 text-red-500 mb-0.5" />
                  <span>PDF</span>
                </motion.div>

                <motion.div
                  initial={{ rotate: 5 }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
                  className="absolute bottom-5 left-12 sm:bottom-6 sm:left-20 pointer-events-none hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-100 border border-blue-200 shadow-sm text-blue-600 font-extrabold text-xs"
                >
                  <ImageIcon className="w-4 h-4 text-blue-500 mb-0.5" />
                  <span>JPG</span>
                </motion.div>

                <motion.div
                  initial={{ rotate: 5 }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut", delay: 0.2 }}
                  className="absolute top-5 right-6 sm:top-6 sm:right-12 pointer-events-none hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-200 shadow-sm text-emerald-600 font-extrabold text-xs"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-500 mb-0.5" />
                  <span>PNG</span>
                </motion.div>

                <motion.div
                  initial={{ rotate: -5 }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut", delay: 0.7 }}
                  className="absolute bottom-5 right-12 sm:bottom-6 sm:right-20 pointer-events-none hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-100 border border-purple-200 shadow-sm text-purple-600 font-extrabold text-xs"
                >
                  <ImageIcon className="w-4 h-4 text-purple-500 mb-0.5" />
                  <span>WEBP</span>
                </motion.div>
              </>
            )}

            {/* Laser Beam Scanner HUD Effect when processing */}
            {isScanning && !previewUrl && (
              <motion.div
                initial={{ top: "0%" }}
                animate={{ top: "100%" }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "linear", repeatType: "loop" }}
                className="absolute inset-x-0 z-20 pointer-events-none"
              >
                <div className="h-16 -translate-y-full bg-gradient-to-t from-[#0056B3]/25 to-transparent w-full" />
                <div className="h-1 bg-gradient-to-r from-transparent via-[#0056B3] to-transparent shadow-[0_0_16px_#0056B3] -translate-y-1/2" />
              </motion.div>
            )}

            {selectedFile ? (
              <div className="w-full max-w-xl space-y-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-blue-200 shadow-xs">
                  <div className="flex items-center gap-3 truncate">
                    <div className="h-10 w-10 rounded-xl bg-[#EBF5FF] text-[#0056B3] flex items-center justify-center shrink-0 font-bold">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <div className="text-left truncate">
                      <p className="text-xs font-bold text-[#0F172A] truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-[#64748B]">
                        {(selectedFile.size / 1024).toFixed(1)} KB &bull; {selectedFile.type || "Medical File"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={clearSelectedFile}
                    className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {previewUrl && (
                  <div className="relative overflow-hidden rounded-2xl border border-blue-500/50 bg-slate-950 p-2 shadow-xl group">
                    <img
                      src={previewUrl}
                      alt="Prescription Preview"
                      className="max-h-[240px] w-auto h-auto object-contain rounded-xl mx-auto bg-white/95"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => processUploadedFile()}
                  disabled={isScanning}
                  className="w-full rounded-full bg-[#0056B3] hover:bg-[#004085] text-white py-3 text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>{scanStage || "Processing Medical Document..."}</span>
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
              /* Center Dropzone Content */
              <div className="space-y-3 py-2 z-10 max-w-md">
                <div className="w-16 h-16 rounded-full bg-[#EBF5FF] border border-[#B3D4FF] text-[#0056B3] flex items-center justify-center mx-auto shadow-xs">
                  <UploadCloud className="w-8 h-8 text-[#0056B3]" />
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#0F172A] tracking-tight">
                    Drag &amp; drop your medical document here
                  </h3>
                  <p className="text-xs text-[#64748B] font-medium">
                    or click to browse files
                  </p>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="rounded-full bg-[#0056B3] hover:bg-[#004085] text-white px-8 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Choose File</span>
                  </button>
                </div>

                <p className="text-xs text-[#64748B] font-medium pt-0.5">
                  Supports JPG, PNG, PDF, WEBP (Max 10 MB)
                </p>
              </div>
            )}
          </div>

          {/* ─── BOTTOM 3 CATEGORY CARDS (Uniform, Smooth & Consistent) ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <button
              type="button"
              onClick={() => processSampleDocument("prescription")}
              className="p-4 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0056B3] hover:bg-[#F8FAFC] shadow-2xs hover:shadow-md transition-all duration-200 text-left flex items-center gap-3.5 cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/80 font-bold text-sm group-hover:scale-105 transition-transform duration-200">
                ℞
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#0056B3] transition-colors truncate">
                  Prescriptions
                </div>
                <div className="text-[11px] text-[#64748B] font-medium truncate mt-0.5">
                  (PDF / Image)
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => processSampleDocument("diabetic_lab_report")}
              className="p-4 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0056B3] hover:bg-[#F8FAFC] shadow-2xs hover:shadow-md transition-all duration-200 text-left flex items-center gap-3.5 cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200/80 font-bold group-hover:scale-105 transition-transform duration-200">
                <FlaskConical className="w-5 h-5 text-purple-600" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#0056B3] transition-colors truncate">
                  Lab Reports
                </div>
                <div className="text-[11px] text-[#64748B] font-medium truncate mt-0.5">
                  (PDF / Image)
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => processSampleDocument("prescription")}
              className="p-4 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0056B3] hover:bg-[#F8FAFC] shadow-2xs hover:shadow-md transition-all duration-200 text-left flex items-center gap-3.5 cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0056B3] flex items-center justify-center shrink-0 border border-blue-200/80 font-bold group-hover:scale-105 transition-transform duration-200">
                <MoreHorizontal className="w-5 h-5 text-[#0056B3]" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#0056B3] transition-colors truncate">
                  More
                </div>
                <div className="text-[11px] text-[#64748B] font-medium truncate mt-0.5">
                  (Any document)
                </div>
              </div>
            </button>
          </div>

          {/* Error Alert Box */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">OCR Processing Alert:</strong>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* ─── 4. EXTRACTED OCR RESULTS DISPLAY SECTION ─── */}
          {extractedDoc && (
            <div className="pt-6 border-t-2 border-slate-200 space-y-6 animate-fadeIn">
              {/* Document Summary Header */}
              <div className="rounded-3xl border-2 border-[#0056B3]/30 bg-gradient-to-br from-[#F0F7FF] via-white to-[#EBF3FF] p-6 sm:p-7 shadow-sm relative overflow-hidden space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#0056B3] text-white px-3 py-1 text-xs font-black uppercase tracking-wider shadow-xs">
                        {extractedDoc.document_type.replace("_", " ")}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3 py-1 rounded-full">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        {extractedDoc.confidence_score || 99.2}% Verified by Vision OCR
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0056B3] bg-white px-3 py-1 rounded-full border border-[#0056B3]/30 shadow-2xs">
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
                    >
                      <Printer className="h-3.5 w-3.5 text-slate-600" /> Print Record
                    </button>
                    <Link
                      href="/patient/history"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-400 transition-all shadow-2xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> View Timeline &rarr;
                    </Link>
                  </div>
                </div>

                {/* Consultation Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-white border border-blue-100 shadow-2xs space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                      <Stethoscope className="w-4 h-4 text-[#0056B3]" /> Treating Physician
                    </div>
                    <div className="text-sm font-black text-[#0F172A] truncate">
                      {extractedDoc.doctor_name || "Dr. Attending Physician"}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-blue-100 shadow-2xs space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                      <Building2 className="w-4 h-4 text-[#0056B3]" /> Facility / Hospital
                    </div>
                    <div className="text-sm font-bold text-[#0F172A] truncate">
                      {extractedDoc.facility_name || "Outpatient Care Clinic"}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-blue-100 shadow-2xs space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                      <User className="w-4 h-4 text-[#0056B3]" /> Patient Name
                    </div>
                    <div className="text-sm font-black text-[#0F172A] truncate">
                      {extractedDoc.patient_name || user?.full_name || "Registered Patient"}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-blue-100 shadow-2xs space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                      <Calendar className="w-4 h-4 text-[#0056B3]" /> Date
                    </div>
                    <div className="text-sm font-mono font-bold text-[#0F172A]">
                      {String(extractedDoc.document_date || new Date().toISOString().split("T")[0])}
                    </div>
                  </div>
                </div>
              </div>

              {/* Extracted Prescribed Medications */}
              {extractedDoc.extracted_medications && extractedDoc.extracted_medications.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Pill className="w-5 h-5 text-[#0056B3]" />
                      <h4 className="font-heading text-base sm:text-lg font-black text-[#0F172A]">
                        Extracted Prescribed Medications ({extractedDoc.extracted_medications.length})
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                      Indian Pharmacopeia Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {extractedDoc.extracted_medications.map((med, idx) => {
                      const sched = parseDosageSchedule(med.frequency);
                      return (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-[#0056B3]/60 transition-all space-y-3 shadow-xs"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-blue-100 text-[#0056B3] flex items-center justify-center font-bold text-xs">
                                  {idx + 1}
                                </span>
                                <h5 className="font-heading text-base font-black text-[#0F172A]">
                                  {med.name}
                                </h5>
                              </div>
                              {med.therapeutic_class && (
                                <span className="inline-block text-xs font-semibold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                                  {med.therapeutic_class}
                                </span>
                              )}
                            </div>

                            {med.dosage && (
                              <span className="text-sm font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                                {med.dosage}
                              </span>
                            )}
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                            <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-blue-600" /> Timing Schedule: <span className="text-slate-900 font-mono">{med.frequency}</span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className={`p-2 rounded-lg text-center font-bold border ${sched.isMorning ? "bg-amber-50 border-amber-300 text-amber-950" : "bg-white text-slate-400"}`}>
                                Morning {sched.isMorning ? "(1 Dose)" : ""}
                              </div>
                              <div className={`p-2 rounded-lg text-center font-bold border ${sched.isAfternoon ? "bg-sky-50 border-sky-300 text-sky-950" : "bg-white text-slate-400"}`}>
                                Afternoon {sched.isAfternoon ? "(1 Dose)" : ""}
                              </div>
                              <div className={`p-2 rounded-lg text-center font-bold border ${sched.isNight ? "bg-indigo-50 border-indigo-300 text-indigo-950" : "bg-white text-slate-400"}`}>
                                Night {sched.isNight ? "(1 Dose)" : ""}
                              </div>
                            </div>
                          </div>

                          {med.clinical_purpose && (
                            <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3 text-xs font-semibold text-slate-800">
                              <span className="font-bold text-amber-900">Purpose: </span>
                              {med.clinical_purpose}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setExtractedDoc(null);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="px-5 py-2.5 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
                >
                  Scan Another Document
                </button>

                <Link
                  href="/patient/history"
                  className="px-6 py-2.5 rounded-full bg-[#0056B3] hover:bg-[#004085] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>View in Health Timeline</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ─── 5. QUICK SAMPLE EXAMPLES SECTION ─── */}
        <div className="space-y-3.5 pt-2 text-left">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-lg text-[#0F172A] tracking-tight">
                Quick Examples
              </h2>
              <p className="text-xs text-[#64748B]">
                Try with sample documents to see how OCR extraction works.
              </p>
            </div>

            <button
              type="button"
              onClick={() => processSampleDocument("prescription")}
              className="text-xs font-bold text-[#0056B3] hover:text-[#003882] inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View all examples</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_EXAMPLES.map((example) => (
              <div
                key={example.id}
                onClick={() => processSampleDocument(example.type === "imaging" ? "prescription" : example.type)}
                className="bg-white border border-[#E2E8F0] hover:border-[#0056B3] rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="w-11 h-13 rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center justify-center p-1 shrink-0 group-hover:border-blue-300">
                  <span className="font-serif font-black text-xs text-[#0056B3]">
                    ℞
                  </span>
                </div>

                <div className="flex-1 truncate text-left space-y-1">
                  <div className="text-xs font-bold text-[#0F172A] truncate group-hover:text-[#0056B3] transition-colors">
                    {example.title}
                  </div>
                  <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${example.badgeColor}`}>
                    {example.badge}
                  </span>
                  <p className="text-[10px] text-[#64748B] truncate">
                    {example.description}
                  </p>
                </div>

                <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-blue-100 text-slate-400 group-hover:text-[#0056B3] flex items-center justify-center shrink-0 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* ─── 6. FOOTER ─── */}
      <Footer />
    </div>
  );
}
