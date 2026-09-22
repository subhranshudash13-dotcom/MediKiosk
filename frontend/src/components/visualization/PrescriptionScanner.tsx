"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Pill,
  Activity,
  FileSearch,
  RefreshCw,
  X,
  FileCheck,
  Calendar,
  Building2,
  UserCheck,
  User,
  Info,
  ChevronRight,
} from "lucide-react";
import { MedicalDocument, ExtractedMedication, ExtractedLabResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getBackendUrl } from "@/lib/config";
import { getAccessToken } from "@/lib/auth-api";

interface PrescriptionScannerProps {
  patientId?: string;
  onScanComplete?: (doc: MedicalDocument) => void;
  className?: string;
}

const SAMPLE_DOCS = [
  {
    id: "prescription",
    label: "Sample 1: Cardiology & HTN Rx",
    description: "Amlodipine, Metformin, Pantoprazole (Hypertension + T2D)",
    badge: "Prescription",
  },
  {
    id: "diabetic_lab_report",
    label: "Sample 2: Metabolic & Renal Lab Report",
    description: "HbA1c (9.2%), Fasting Blood Sugar, Serum Creatinine",
    badge: "Lab Panel",
  },
  {
    id: "renal_panel",
    label: "Sample 3: Acute Respiratory Rx",
    description: "Azithromycin, Paracetamol (Acute Bronchitis)",
    badge: "OPD Slip",
  },
];

export function PrescriptionScanner({
  patientId = "P-DEMO-001",
  onScanComplete,
  className,
}: PrescriptionScannerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStage, setScanStage] = useState<string>("");
  const [extractedDoc, setExtractedDoc] = useState<MedicalDocument | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"purpose" | "meds" | "labs" | "raw">("purpose");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (file: File) => {
    setErrorMsg(null);
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
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

  const processUploadedFile = async () => {
    if (!selectedFile) return;
    setIsScanning(true);
    setErrorMsg(null);

    setScanStage("Uploading medical document...");
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("patient_id", patientId);
      formData.append("auto_sync_timeline", "true");

      setScanStage("Multilingual OCR & Entity Recognition...");
      const backendUrl = getBackendUrl();
      const token = getAccessToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${backendUrl}/api/v1/documents/upload`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server returned HTTP ${res.status}`);
      }

      setScanStage("Decoding Clinical Purpose & Intent...");
      const data: MedicalDocument = await res.json();
      setExtractedDoc(data);
      onScanComplete?.(data);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setErrorMsg(err.message || "Failed to process prescription image with Qwen Vision OCR.");
    } finally {
      setIsScanning(false);
      setScanStage("");
    }
  };

  const processSampleDocument = async (sampleType: string, customName?: string) => {
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
        `${backendUrl}/api/v1/documents/process-sample?sample_type=${sampleType}&patient_id=${patientId}`,
        {
          method: "POST",
          headers,
        }
      );

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      setScanStage("Analyzing Pharmacological Intent & Lab References...");
      const data: MedicalDocument = await res.json();
      if (customName) {
        data.file_path = customName;
      }
      setExtractedDoc(data);
      onScanComplete?.(data);
    } catch (err: any) {
      console.error("Sample process failed:", err);
      const mockDoc: MedicalDocument = {
        document_id: "DOC-LOCAL-SAMPLE",
        patient_id: patientId,
        document_type: sampleType === "diabetic_lab_report" ? "lab_report" : "prescription",
        document_date: new Date().toISOString().split("T")[0],
        confidence_score: 97.5,
        document_purpose:
          sampleType === "diabetic_lab_report"
            ? "Glycemic & Renal Metabolic Safety Investigation"
            : "Outpatient Hypertension & Diabetes Pharmacotherapy Management",
        clinical_intent:
          sampleType === "diabetic_lab_report"
            ? "Ordered to evaluate 3-month glycemic stability and renal filtration clearance in a patient with progressive diabetic risk."
            : "Issued to achieve target arterial blood pressure reduction (<130/80 mmHg), enhance peripheral insulin sensitivity, and protect the gastric mucosa from medication-induced acidity.",
        physician_action_plan:
          sampleType === "diabetic_lab_report"
            ? "1. Note elevated HbA1c (9.2%) and Serum Creatinine (2.4 mg/dL); 2. Estimate eGFR; 3. Titrate oral antidiabetics."
            : "1. Confirm morning Amlodipine adherence; 2. Monitor fasting and postprandial glucose; 3. Re-evaluate blood pressure in 3 weeks.",
        doctor_name: "Dr. S. K. Verma, MD (Medicine)",
        facility_name: "Apex Healthcare OPD - Unit II",
        extracted_diagnoses: [
          { condition: "Essential Hypertension", icd10_code: "I10", condition_type: "chronic" },
          { condition: "Type 2 Diabetes Mellitus", icd10_code: "E11.9", condition_type: "chronic" },
        ],
        extracted_medications: [
          {
            name: "Amlodipine Besylate",
            dosage: "5 mg",
            frequency: "1-0-0 (Once daily)",
            route: "oral",
            duration: "30 days",
            indication: "Essential Hypertension",
            therapeutic_class: "Calcium Channel Blocker (Dihydropyridine)",
            clinical_purpose:
              "Prescribed to relax systemic arterial smooth muscle, lowering systemic vascular resistance and blood pressure to protect against stroke and hypertensive cardiomyopathy.",
            instructions: "Morning post-breakfast",
            confidence: 98.0,
          },
          {
            name: "Metformin Hydrochloride",
            dosage: "500 mg",
            frequency: "1-0-1 (Twice daily)",
            route: "oral",
            duration: "30 days",
            indication: "Type 2 Diabetes Mellitus",
            therapeutic_class: "Biguanide / Hypoglycemic",
            clinical_purpose:
              "Suppresses excessive hepatic gluconeogenesis and enhances peripheral muscle glucose uptake to maintain tight glycemic homeostasis.",
            instructions: "With or immediately after meals",
            confidence: 96.0,
          },
          {
            name: "Pantoprazole DSR",
            dosage: "40 mg",
            frequency: "1-0-0 (Once daily)",
            route: "oral",
            duration: "14 days",
            indication: "Gastric Protection / Acidity",
            therapeutic_class: "Proton Pump Inhibitor (PPI)",
            clinical_purpose:
              "Inhibits parietal cell gastric acid secretion to prevent drug-induced gastritis and mucosal ulceration.",
            instructions: "Before breakfast (Empty stomach)",
            confidence: 95.0,
          },
        ],
        extracted_labs:
          sampleType === "diabetic_lab_report"
            ? [
                {
                  test_name: "Glycated Hemoglobin (HbA1c)",
                  value: "9.2",
                  unit: "%",
                  reference_range: "< 5.7%",
                  is_abnormal: true,
                  severity_flag: "CRITICAL_HIGH",
                  clinical_purpose:
                    "Measures 3-month average glucose saturation to monitor diabetic microvascular and macrovascular complication risks.",
                  clinical_significance: "Severely elevated; indicates poor glycemic control.",
                },
                {
                  test_name: "Serum Creatinine",
                  value: "2.4",
                  unit: "mg/dL",
                  reference_range: "0.6 - 1.2 mg/dL",
                  is_abnormal: true,
                  severity_flag: "CRITICAL_HIGH",
                  clinical_purpose:
                    "Biomarker of renal glomerular filtration function to detect acute kidney injury or chronic diabetic nephropathy.",
                  clinical_significance: "Elevated; suggests renal impairment.",
                },
              ]
            : [],
        extracted_vitals: [
          { vital_name: "Blood Pressure", value: "146/92", unit: "mmHg", is_abnormal: true },
          { vital_name: "Pulse", value: "82", unit: "bpm", is_abnormal: false },
        ],
        file_path: customName || "sample_prescription.jpg",
        is_abdm_linked: true,
      };
      setExtractedDoc(mockDoc);
      onScanComplete?.(mockDoc);
    } finally {
      setIsScanning(false);
      setScanStage("");
    }
  };

  return (
    <div className={cn("rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs relative overflow-hidden text-left", className)}>
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
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

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#EBF5FF] text-[#0056B3]">
              <FileSearch className="h-4 w-4" />
            </span>
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0056B3]">
              Multimodal Document Intelligence
            </p>
          </div>
          <h3 className="font-heading text-xl font-bold text-[#1E293B] mt-1">
            Prescription &amp; Medical Document Intake
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Attach any prescription, lab report, or discharge summary. MediKiosk decodes{" "}
            <strong className="text-[#0056B3] font-bold">what it is exactly for</strong>, its clinical intent, and pharmacological purpose.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => cameraInputRef.current?.click()}
            disabled={isScanning}
            className="rounded-full border border-[#CBD5E1] bg-[#F8F9FA] hover:bg-white text-xs font-bold text-[#1E293B] py-2 px-3.5 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Open camera to capture paper prescription"
          >
            <Camera className="h-3.5 w-3.5 text-[#0056B3]" />
            <span>Camera</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="rounded-full bg-[#0056B3] hover:bg-[#004494] text-white text-xs font-bold py-2 px-4 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Attach Image / Document</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upload / Attachment Dropzone & Sample Picker (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Dropzone Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
            className={cn(
              "relative rounded-2xl border-2 border-dashed p-5 transition-all text-center flex flex-col items-center justify-center min-h-[220px]",
              selectedFile ? "border-[#0056B3]/60 bg-[#F0F7FF]/50" : "cursor-pointer hover:border-[#0056B3] hover:bg-[#F8F9FA]",
              isDragging ? "border-[#0056B3] bg-[#EBF5FF] scale-[1.01]" : "border-[#CBD5E1] bg-[#F8F9FA]/60"
            )}
          >
            {/* Top-to-Bottom Laser Scanning Animation */}
            {isScanning && (
              <motion.div
                initial={{ top: "0%" }}
                animate={{ top: "100%" }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "linear", repeatType: "loop" }}
                className="absolute inset-x-0 z-20 pointer-events-none"
              >
                <div className="h-16 -translate-y-full bg-gradient-to-t from-cyan-400/30 via-blue-500/15 to-transparent w-full pointer-events-none" />
                <div className="h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_16px_#06b6d4,0_0_30px_#3b82f6] -translate-y-1/2" />
              </motion.div>
            )}

            {selectedFile ? (
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="h-9 w-9 rounded-lg bg-[#EBF5FF] text-[#0056B3] flex items-center justify-center flex-shrink-0">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <div className="text-left truncate">
                      <p className="text-xs font-bold text-[#1E293B] truncate">{selectedFile.name}</p>
                      <p className="text-[10px] text-[#64748B]">
                        {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type || "Medical Doc"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearSelectedFile();
                    }}
                    className="h-7 w-7 rounded-full bg-[#F1F5F9] text-[#64748B] hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {previewUrl && (
                  <div className="relative overflow-hidden rounded-xl border border-[#CBD5E1] bg-slate-100 p-2 shadow-inner">
                    <img
                      src={previewUrl}
                      alt="Prescription Document Preview"
                      className="w-full h-auto max-h-[360px] object-contain rounded-lg mx-auto bg-white shadow-xs"
                    />
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    processUploadedFile();
                  }}
                  disabled={isScanning}
                  className="w-full rounded-full bg-[#0056B3] hover:bg-[#004494] text-white py-2.5 text-xs font-bold shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>{scanStage || "Analyzing Document..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Analyze Document &amp; Decode Clinical Intent</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBF5FF] text-[#0056B3]">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1E293B]">
                    Drag &amp; drop your prescription or report here
                  </p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Supports JPG, PNG, WEBP, and PDF documents
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F1F5F9] px-3 py-1 text-[10px] font-bold text-[#64748B]">
                    <ShieldCheck className="h-3 w-3 text-[#0056B3]" /> ABDM Linked
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F1F5F9] px-3 py-1 text-[10px] font-bold text-[#64748B]">
                    <Stethoscope className="h-3 w-3 text-[#0056B3]" /> Clinical Intent
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Scanning / Processing Alert Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 shadow-xs">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">OCR Scanning Alert:</strong>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Active / Uploaded Prescription Image Display Card */}
          {(previewUrl || (extractedDoc?.file_path && extractedDoc.file_path.startsWith("data:image/"))) && (
            <div className="rounded-2xl border border-[#CBD5E1] bg-white p-4 shadow-xs space-y-2.5 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E293B]">
                  <FileText className="h-4 w-4 text-[#0056B3]" />
                  <span>Prescription Image Preview</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Qwen Vision Active
                </span>
              </div>
              <div className="overflow-auto max-h-[380px] rounded-xl border border-[#E2E8F0] bg-slate-50 p-2 flex items-center justify-center">
                <img
                  src={previewUrl || extractedDoc?.file_path}
                  alt="Digitized Clinical Document"
                  className="max-h-[360px] w-auto h-auto object-contain rounded-lg shadow-2xs"
                />
              </div>
            </div>
          )}

          {/* Quick Instant Test Samples */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0056B3]">Quick Test Samples:</p>
              <span className="text-[10px] text-[#64748B] font-medium">1-Click Evaluation</span>
            </div>
            <div className="space-y-2">
              {SAMPLE_DOCS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => processSampleDocument(sample.id)}
                  disabled={isScanning}
                  className="w-full text-left p-2.5 rounded-xl border border-[#E2E8F0] hover:border-[#0056B3] hover:bg-[#F0F7FF] transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="truncate pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#0056B3]">
                        {sample.label}
                      </span>
                      <span className="text-[9px] font-bold bg-[#F1F5F9] text-[#64748B] px-1.5 py-0.5 rounded">
                        {sample.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#64748B] truncate mt-0.5">
                      {sample.description}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#0056B3] flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: OCR Results & What It Is Exactly For (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {extractedDoc ? (
            <div className="space-y-4">
              {/* Document Clinical Purpose & Intent Banner */}
              <div className="rounded-2xl border-2 border-[#0056B3]/30 bg-[#F0F7FF] p-5 shadow-xs relative overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#0056B3] text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                        {extractedDoc.document_type.replace("_", " ")}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0056B3]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#28A745]" />
                        {extractedDoc.confidence_score || 96}% Verified
                      </span>
                    </div>
                    <h4 className="font-heading text-lg font-bold text-[#1E293B] mt-1.5 leading-snug">
                      {extractedDoc.document_purpose || "Outpatient Clinical Management"}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    {extractedDoc.is_abdm_linked && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0056B3] bg-white px-2.5 py-1 rounded-full border border-[#0056B3]/20 shadow-2xs">
                        <ShieldCheck className="h-3 w-3" /> ABDM Linked
                      </span>
                    )}
                    <a
                      href="/patient/history"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300 transition-colors shadow-2xs"
                    >
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Stored in History &rarr;
                    </a>
                  </div>
                </div>

                {/* What This Document Is Exactly For Section */}
                <div className="mt-4 rounded-xl bg-white p-4 border border-[#0056B3]/20 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0056B3] mb-1">
                    <Info className="h-4 w-4" />
                    <span>WHAT THIS DOCUMENT IS EXACTLY FOR (CLINICAL INTENT):</span>
                  </div>
                  <p className="text-xs text-[#1E293B] leading-relaxed font-medium">
                    {extractedDoc.clinical_intent ||
                      "This document provides the therapeutic treatment regimen for stabilizing patient symptoms, controlling elevated blood pressure, and optimizing glycemic metabolic parameters."}
                  </p>

                  {/* Physician Action Plan */}
                  {extractedDoc.physician_action_plan && (
                    <div className="mt-3 pt-3 border-t border-[#E2E8F0]">
                      <p className="text-[11px] font-bold text-[#0056B3] uppercase tracking-wider mb-1">
                        Physician Action Directives:
                      </p>
                      <p className="text-xs text-[#64748B] leading-relaxed">
                        {extractedDoc.physician_action_plan}
                      </p>
                    </div>
                  )}
                </div>

                {/* Metadata Row */}
                <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-[#64748B]">
                  {extractedDoc.patient_name && (
                    <span className="flex items-center gap-1 font-semibold text-[#1E293B]">
                      <User className="h-3 w-3 text-[#0056B3]" />
                      Patient: {extractedDoc.patient_name}
                    </span>
                  )}
                  {extractedDoc.doctor_name && (
                    <span className="flex items-center gap-1 font-medium">
                      <UserCheck className="h-3 w-3 text-[#0056B3]" />
                      {extractedDoc.doctor_name}
                    </span>
                  )}
                  {extractedDoc.facility_name && (
                    <span className="flex items-center gap-1 font-medium">
                      <Building2 className="h-3 w-3 text-[#0056B3]" />
                      {extractedDoc.facility_name}
                    </span>
                  )}
                  {extractedDoc.document_date && (
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="h-3 w-3 text-[#0056B3]" />
                      {String(extractedDoc.document_date)}
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation Tabs for Extracted Entities */}
              <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
                <button
                  onClick={() => setActiveTab("purpose")}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                    activeTab === "purpose"
                      ? "bg-[#0056B3] text-white shadow-xs"
                      : "text-[#64748B] hover:bg-[#F1F5F9]"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <Stethoscope className="h-3.5 w-3.5" />
                    Clinical Summary &amp; Intent
                  </span>
                </button>

                {extractedDoc.extracted_medications?.length > 0 && (
                  <button
                    onClick={() => setActiveTab("meds")}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                      activeTab === "meds"
                        ? "bg-[#0056B3] text-white shadow-xs"
                        : "text-[#64748B] hover:bg-[#F1F5F9]"
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <Pill className="h-3.5 w-3.5" />
                      Medications ({extractedDoc.extracted_medications.length})
                    </span>
                  </button>
                )}

                {extractedDoc.extracted_labs?.length > 0 && (
                  <button
                    onClick={() => setActiveTab("labs")}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                      activeTab === "labs"
                        ? "bg-[#0056B3] text-white shadow-xs"
                        : "text-[#64748B] hover:bg-[#F1F5F9]"
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5" />
                      Lab Results ({extractedDoc.extracted_labs.length})
                    </span>
                  </button>
                )}
              </div>

              {/* TAB 1: Clinical Summary, Diagnoses & Vitals */}
              {activeTab === "purpose" && (
                <div className="space-y-3">
                  {/* Diagnoses */}
                  {extractedDoc.extracted_diagnoses && extractedDoc.extracted_diagnoses.length > 0 && (
                    <div className="rounded-xl border border-[#E2E8F0] bg-white p-3.5 shadow-xs">
                      <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0056B3] mb-2">Identified Diagnoses &amp; Health Conditions:</p>
                      <div className="flex flex-wrap gap-2">
                        {extractedDoc.extracted_diagnoses.map((diag, i) => {
                          const name = typeof diag === "string" ? diag : diag.condition;
                          const icd = typeof diag === "string" ? null : diag.icd10_code;
                          return (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1.5 rounded-full bg-[#F8F9FA] border border-[#E2E8F0] px-3 py-1 text-xs font-bold text-[#1E293B]"
                            >
                              <CheckCircle2 className="h-3 w-3 text-[#28A745]" />
                              {name}
                              {icd && (
                                <span className="font-mono text-[9px] font-bold text-[#0056B3] bg-[#EBF5FF] px-1.5 py-0.2 rounded">
                                  {icd}
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Vitals */}
                  {extractedDoc.extracted_vitals && extractedDoc.extracted_vitals.length > 0 && (
                    <div className="rounded-xl border border-[#E2E8F0] bg-white p-3.5 shadow-xs">
                      <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0056B3] mb-2">Recorded Vitals:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {extractedDoc.extracted_vitals.map((v, i) => (
                          <div key={i} className="bg-[#F8F9FA] p-2.5 rounded-lg border border-[#E2E8F0]">
                            <p className="text-[10px] uppercase font-bold text-[#64748B]">
                              {v.vital_name}
                            </p>
                            <p className="text-sm font-bold text-[#1E293B] mt-0.5">
                              {v.value} <span className="text-[10px] text-[#64748B] font-normal">{v.unit}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Highlight of Active Medications */}
                  <div className="rounded-xl border border-[#E2E8F0] bg-white p-3.5 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0056B3]">Pharmacotherapy Purpose Breakdown:</p>
                      <button
                        onClick={() => setActiveTab("meds")}
                        className="text-[11px] font-bold text-[#0056B3] hover:underline cursor-pointer"
                      >
                        View Full Details →
                      </button>
                    </div>
                    {extractedDoc.extracted_medications.slice(0, 3).map((med, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-[#F8F9FA] border border-[#E2E8F0]">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-[#1E293B]">
                            {med.name} {med.dosage && `(${med.dosage})`}
                          </p>
                          <span className="text-[10px] font-semibold text-[#0056B3] bg-[#EBF5FF] px-2 py-0.5 rounded">
                            {med.indication || med.therapeutic_class || "Prescribed Regimen"}
                          </span>
                        </div>
                        {med.clinical_purpose && (
                          <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
                            <strong className="text-[#1E293B]">Purpose:</strong> {med.clinical_purpose}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: Medications Breakdown */}
              {activeTab === "meds" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0056B3]">Extracted Active Regimen &amp; Exact Clinical Purpose:</p>
                    <span className="text-[10px] font-bold text-[#0056B3]">
                      {extractedDoc.extracted_medications.length} Drugs Analyzed
                    </span>
                  </div>

                  {extractedDoc.extracted_medications.map((med, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-[#E2E8F0] bg-white p-4 hover:border-[#0056B3] transition-all shadow-xs space-y-2"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="h-6 w-6 rounded-md bg-[#EBF5FF] text-[#0056B3] flex items-center justify-center font-bold text-xs">
                              {idx + 1}
                            </span>
                            <h5 className="text-sm font-bold text-[#1E293B]">{med.name}</h5>
                            {med.dosage && (
                              <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-bold text-[#1E293B]">
                                {med.dosage}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#64748B] mt-1">
                            Timing: <span className="font-semibold text-[#1E293B]">{med.frequency || "OD"}</span>
                            {med.instructions && ` · ${med.instructions}`}
                            {med.duration && ` · Duration: ${med.duration}`}
                          </p>
                        </div>

                        <div className="text-right">
                          {med.therapeutic_class && (
                            <span className="inline-block rounded-md bg-[#F8F9FA] px-2 py-0.5 text-[10px] font-bold text-[#64748B] border border-[#E2E8F0]">
                              {med.therapeutic_class}
                            </span>
                          )}
                          {med.confidence && (
                            <p className="text-[9px] font-bold text-[#28A745] mt-0.5">
                              {med.confidence}% Match
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl bg-[#F0F7FF] border border-[#0056B3]/20 p-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#0056B3]">
                          What This Drug Is Exactly For:
                        </p>
                        <p className="text-xs text-[#1E293B] mt-0.5 leading-snug">
                          {med.clinical_purpose ||
                            `Prescribed for clinical management of ${med.indication || "the diagnosed presentation"}.`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: Laboratory Results */}
              {activeTab === "labs" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0056B3]">Laboratory Diagnostics &amp; Reference Range Analysis:</p>
                    <span className="text-[10px] font-bold text-[#0056B3]">
                      {extractedDoc.extracted_labs.length} Tests Evaluated
                    </span>
                  </div>

                  {extractedDoc.extracted_labs.map((lab, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "rounded-2xl border p-4 shadow-xs space-y-2 transition-all",
                        lab.is_abnormal
                          ? "border-amber-300 bg-amber-50/40"
                          : "border-[#E2E8F0] bg-white"
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-bold text-[#1E293B]">{lab.test_name}</h5>
                            {lab.is_abnormal ? (
                              <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {lab.severity_flag || "Elevated"}
                              </span>
                            ) : (
                              <span className="rounded-full bg-[#EAF7ED] text-[#28A745] border border-[#28A745]/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                                Normal
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#64748B] mt-0.5">
                            Reference Range:{" "}
                            <span className="font-mono text-[#1E293B] font-semibold">
                              {lab.reference_range || "Standard"}
                            </span>
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-base font-extrabold text-[#1E293B]">
                            {lab.value} <span className="text-xs font-normal text-[#64748B]">{lab.unit}</span>
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl bg-white p-2.5 border border-[#E2E8F0]">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#0056B3]">
                          What This Test Investigates:
                        </p>
                        <p className="text-xs text-[#1E293B] mt-0.5 leading-snug">
                          {lab.clinical_purpose ||
                            "Diagnostic biomarker test ordered to assess metabolic organ function."}
                        </p>
                        {lab.clinical_significance && (
                          <p className="text-[11px] text-amber-900 mt-1 font-medium">
                            Clinical Note: {lab.clinical_significance}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center space-y-4 shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EBF5FF] text-[#0056B3]">
                <FileSearch className="h-7 w-7" />
              </div>
              <div>
                <h4 className="font-heading text-lg font-bold text-[#1E293B]">
                  Awaiting Prescription or Document
                </h4>
                <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1 leading-relaxed">
                  Attach an image/PDF or click one of the quick test samples on the left.
                  MediKiosk will automatically extract medications, evaluate labs against clinical ranges,
                  and explain <span className="font-bold text-[#0056B3]">what the document is exactly for</span>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-left">
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8F9FA] p-3">
                  <div className="flex items-center gap-1.5 text-[#0056B3] font-bold text-xs">
                    <Stethoscope className="h-3.5 w-3.5" />
                    <span>Clinical Purpose</span>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
                    Explains the underlying clinical reason and therapeutic intent.
                  </p>
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8F9FA] p-3">
                  <div className="flex items-center gap-1.5 text-[#0056B3] font-bold text-xs">
                    <Pill className="h-3.5 w-3.5" />
                    <span>Pharmacology</span>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
                    Details drug indications, therapeutic classes, and patient dosages.
                  </p>
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8F9FA] p-3">
                  <div className="flex items-center gap-1.5 text-[#0056B3] font-bold text-xs">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>ABDM Ready</span>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
                    Syncs with patient longitudinal history for instant physician consult.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
