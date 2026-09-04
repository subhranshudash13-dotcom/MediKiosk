"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileScan,
  ArrowLeft,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Calendar,
  Layers,
  Pill,
  Thermometer,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Eye,
  ArrowRight,
  Stethoscope,
  Info,
  Check,
  Building2
} from "lucide-react";

interface ExtractedDrug {
  drug: string;
  dose: string;
  frequency: string;
  duration: string;
  confidence: number;
  source: string;
  page: number;
}

interface ExtractedLab {
  test: string;
  value: string;
  unit: string;
  refRange: string;
  status: "NORMAL" | "HIGH" | "LOW" | "CRITICAL";
  confidence: number;
  source: string;
}

interface TimelineEvent {
  year: string;
  date: string;
  title: string;
  category: "Prescription" | "Diagnosis" | "Lab Report" | "Hospitalization";
  facility: string;
  details: string;
}

export default function DocumentIntelligencePage() {
  const [selectedSample, setSelectedSample] = useState<"rx" | "lab" | "discharge">("rx");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processed, setProcessed] = useState(true);

  // Extracted entities
  const [medications, setMedications] = useState<ExtractedDrug[]>([
    {
      drug: "Tab Amlodipine",
      dose: "5 mg",
      frequency: "1-0-0 (OD Morning)",
      duration: "30 Days",
      confidence: 98.4,
      source: "Prescription_Cardiology_2024.pdf",
      page: 1,
    },
    {
      drug: "Tab Metformin SR",
      dose: "500 mg",
      frequency: "1-0-1 (BD After Meals)",
      duration: "60 Days",
      confidence: 96.1,
      source: "Prescription_Cardiology_2024.pdf",
      page: 1,
    },
    {
      drug: "Tab Atorvastatin",
      dose: "20 mg",
      frequency: "0-0-1 (HS Night)",
      duration: "30 Days",
      confidence: 95.8,
      source: "Prescription_Cardiology_2024.pdf",
      page: 1,
    },
  ]);

  const [labs, setLabs] = useState<ExtractedLab[]>([
    {
      test: "HbA1c (Glycated Hemoglobin)",
      value: "7.4",
      unit: "%",
      refRange: "< 5.7 %",
      status: "HIGH",
      confidence: 99.2,
      source: "Comprehensive_Metabolic_Panel.pdf",
    },
    {
      test: "Serum Total Cholesterol",
      value: "242",
      unit: "mg/dL",
      refRange: "< 200 mg/dL",
      status: "HIGH",
      confidence: 97.6,
      source: "Comprehensive_Metabolic_Panel.pdf",
    },
    {
      test: "Serum Creatinine",
      value: "0.9",
      unit: "mg/dL",
      refRange: "0.7 - 1.3 mg/dL",
      status: "NORMAL",
      confidence: 98.9,
      source: "Comprehensive_Metabolic_Panel.pdf",
    },
    {
      test: "Estimated GFR",
      value: "92",
      unit: "mL/min/1.73m²",
      refRange: "> 90 mL/min",
      status: "NORMAL",
      confidence: 94.5,
      source: "Comprehensive_Metabolic_Panel.pdf",
    },
  ]);

  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    {
      year: "2021",
      date: "14 Nov 2021",
      title: "Initial Type 2 Diabetes Mellitus Diagnosis",
      category: "Diagnosis",
      facility: "AIIMS New Delhi",
      details: "Fasting Blood Sugar 162 mg/dL. Initiated on lifestyle modifications + Metformin 500mg.",
    },
    {
      year: "2023",
      date: "08 Jun 2023",
      title: "Stage 1 Essential Hypertension Documented",
      category: "Prescription",
      facility: "Max Super Speciality Hospital, Saket",
      details: "Recorded sitting BP 146/92 mmHg. Added Tab Telmisartan 40mg OD to daily therapy.",
    },
    {
      year: "2024",
      date: "19 Sep 2024",
      title: "Dyslipidemia & Annual Metabolic Lab Panel",
      category: "Lab Report",
      facility: "Dr. Lal PathLabs",
      details: "Total Cholesterol 242 mg/dL, LDL 158 mg/dL. Added Tab Atorvastatin 20mg HS.",
    },
    {
      year: "2026",
      date: "Present",
      title: "Presenting Episode: Exertional Retrosternal Chest Tightness",
      category: "Prescription",
      facility: "MediKiosk Intake Station #04",
      details: "Triaged for urgent cardiology OPD evaluation with longitudinal context pre-populated.",
    },
  ]);

  const handleSimulateUpload = (type: "rx" | "lab" | "discharge") => {
    setSelectedSample(type);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setProcessed(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#111111] flex flex-col justify-between selection:bg-[#EEEAFE]">
      {/* Top Header */}
      <header className="bg-white border-b border-[#E7E4DD] px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E7E4DD] bg-[#FAFAFC] hover:bg-[#F5F3FF] hover:border-[#7C6EF7] text-[#5F5E5A] hover:text-[#7C6EF7] text-xs font-semibold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <div className="h-5 w-[1px] bg-[#E7E4DD] hidden sm:block" />
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#CFFAFE] border border-[#06B6D4]/20 flex items-center justify-center text-[#06B6D4]">
                <FileScan className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-base text-[#111111] leading-tight">
                  Document Intelligence &amp; Medical Timeline
                </h1>
                <p className="text-xs text-[#5F5E5A] flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse" />
                  Multilingual Prescription OCR &amp; Provenance Tracking (Part 4)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/doctor"
              className="px-3.5 py-1.5 rounded-xl bg-[#7C6EF7] hover:bg-[#6758F0] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#7C6EF7]/20"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>View in Doctor Workstation</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-6 py-8 flex-1 space-y-8">
        {/* Upload & Sample Selector Studio */}
        <div className="bg-white border border-[#E7E4DD] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#F2F0EB]">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#EEEAFE] text-[#7C6EF7] text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                PaddleOCR + Clinical Vision Entity Extractor
              </span>
              <h2 className="text-2xl font-extrabold text-[#111111]">
                Upload Past Medical Documents
              </h2>
              <p className="text-xs text-[#5F5E5A] mt-1">
                Upload scanned prescriptions, lab investigation reports, or discharge summaries for automated structured extraction.
              </p>
            </div>

            {/* Quick Demo Sample Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#5F5E5A] font-bold">Try Sample:</span>
              <button
                type="button"
                onClick={() => handleSimulateUpload("rx")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  selectedSample === "rx"
                    ? "bg-[#7C6EF7] text-white border-[#7C6EF7] shadow-sm"
                    : "bg-[#FAFAFC] text-[#5F5E5A] border-[#E7E4DD] hover:border-[#7C6EF7]"
                }`}
              >
                Cardiology Rx
              </button>
              <button
                type="button"
                onClick={() => handleSimulateUpload("lab")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  selectedSample === "lab"
                    ? "bg-[#7C6EF7] text-white border-[#7C6EF7] shadow-sm"
                    : "bg-[#FAFAFC] text-[#5F5E5A] border-[#E7E4DD] hover:border-[#7C6EF7]"
                }`}
              >
                Blood Lab Report
              </button>
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div className="p-8 rounded-3xl bg-[#FAFAFC] border-2 border-dashed border-[#7C6EF7]/40 text-center flex flex-col items-center justify-center relative overflow-hidden group">
            {isProcessing ? (
              <div className="py-6 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-[#7C6EF7] animate-spin" />
                <span className="font-bold text-sm text-[#111111]">
                  Running OCR &amp; Medical Entity Extraction...
                </span>
                <p className="text-xs text-[#5F5E5A]">
                  Parsing handwritten dosage notations, reference ranges, and dates
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#EEEAFE] text-[#7C6EF7] mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <span className="font-bold text-sm text-[#111111] block">
                    Drag &amp; drop prescription scans, lab reports (PDF, PNG, JPG)
                  </span>
                  <span className="text-xs text-[#5F5E5A] block mt-0.5">
                    Supports multilingual documents in Hindi, Telugu, Tamil, and English
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSimulateUpload("rx")}
                  className="px-5 py-2.5 rounded-2xl bg-[#7C6EF7] hover:bg-[#6758F0] text-white font-bold text-xs shadow-md shadow-[#7C6EF7]/20 transition-all cursor-pointer"
                >
                  Select File from Device
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results Grid: Left Extracted Entities & Right Chronological Trajectory */}
        {processed && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* LEFT: Structured Extracted Entities with Confidence & Provenance (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Medications Card */}
              <div className="bg-white border border-[#E7E4DD] rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F2F0EB]">
                  <div className="flex items-center gap-2.5">
                    <Pill className="w-5 h-5 text-[#7C6EF7]" />
                    <div>
                      <h3 className="font-bold text-sm text-[#111111]">
                        Extracted Medications &amp; Dosages
                      </h3>
                      <p className="text-[11px] text-[#5F5E5A]">
                        Parsed from Prescription_Cardiology_2024.pdf
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#12B981]">
                    3 Drugs Parsed
                  </span>
                </div>

                <div className="space-y-3">
                  {medications.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD] hover:bg-white hover:border-[#7C6EF7] transition-all text-xs"
                    >
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#111111]">
                            {item.drug}
                          </span>
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-[#EEEAFE] text-[#7C6EF7]">
                            {item.dose}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#12B981]">
                          Confidence: {item.confidence}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[#5F5E5A] mt-2 pt-2 border-t border-[#F2F0EB]">
                        <span>Frequency: <strong className="text-[#111111]">{item.frequency}</strong></span>
                        <span>Duration: <strong>{item.duration}</strong></span>
                        <span className="text-[10px] text-[#8A8A8A] font-mono">Pg {item.page}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lab Values Card */}
              <div className="bg-white border border-[#E7E4DD] rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F2F0EB]">
                  <div className="flex items-center gap-2.5">
                    <Thermometer className="w-5 h-5 text-[#06B6D4]" />
                    <div>
                      <h3 className="font-bold text-sm text-[#111111]">
                        Extracted Lab &amp; Diagnostic Parameters
                      </h3>
                      <p className="text-[11px] text-[#5F5E5A]">
                        Parsed with reference range comparison
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#CFFAFE] text-[#06B6D4]">
                    4 Tests Extracted
                  </span>
                </div>

                <div className="space-y-3">
                  {labs.map((lab, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD] flex items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-[#111111] text-xs">{lab.test}</h4>
                        <span className="text-[#8A8A8A] text-[11px]">Ref: {lab.refRange}</span>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="font-mono font-bold text-sm text-[#111111]">
                            {lab.value} <span className="text-xs font-normal text-[#5F5E5A]">{lab.unit}</span>
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                              lab.status === "HIGH"
                                ? "bg-[#FEE2E2] text-[#EF4444]"
                                : lab.status === "LOW"
                                ? "bg-[#FEF3C7] text-[#F59E0B]"
                                : "bg-[#DCFCE7] text-[#12B981]"
                            }`}
                          >
                            {lab.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#8A8A8A] block mt-0.5">
                          AI Confidence: {lab.confidence}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Longitudinal Medical Timeline (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-[#E7E4DD] rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#F2F0EB]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#7C6EF7]" />
                    <h3 className="font-bold text-sm text-[#111111]">
                      Automated Health Timeline
                    </h3>
                  </div>
                  <span className="text-xs text-[#7C6EF7] font-bold">2021 – 2026</span>
                </div>

                <div className="relative pl-6 space-y-6 border-l-2 border-[#EEEAFE]">
                  {timeline.map((event, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#7C6EF7] group-hover:scale-125 transition-transform" />
                      <div className="bg-[#FAFAFC] p-4 rounded-2xl border border-[#E7E4DD] hover:bg-white hover:border-[#7C6EF7] transition-all">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-extrabold text-[#7C6EF7]">{event.date}</span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#EEEAFE] text-[#7C6EF7]">
                            {event.category}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-[#111111] mb-1">{event.title}</h4>
                        <p className="text-[11px] text-[#5F5E5A] leading-relaxed mb-2">{event.details}</p>
                        <span className="text-[10px] text-[#8A8A8A] flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-[#7C6EF7]" />
                          {event.facility}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Direct CTA */}
                <div className="mt-8 p-4 rounded-2xl bg-[#F5F3FF] border border-[#7C6EF7]/30 flex items-center justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-xs text-[#111111]">
                      Sync with Patient Kiosk
                    </h5>
                    <p className="text-[11px] text-[#5F5E5A]">
                      Timeline attached to active consultation session.
                    </p>
                  </div>
                  <Link
                    href="/kiosk"
                    className="px-3.5 py-2 rounded-xl bg-[#7C6EF7] hover:bg-[#6758F0] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#7C6EF7]/20 whitespace-nowrap"
                  >
                    <span>Go to Kiosk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E7E4DD] py-4 px-6 mt-12 text-center text-xs text-[#5F5E5A]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MediKiosk Document Intelligence Engine • FHIR DocumentReference Linked</span>
          <span className="text-[#8A8A8A]">Compliant with DPDP Act 2023 &amp; ABDM M2/M3 Standards</span>
        </div>
      </footer>
    </div>
  );
}
