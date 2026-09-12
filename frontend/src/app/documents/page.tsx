"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileScan,
  ArrowLeft,
  Sparkles,
  Calendar,
  Pill,
  Thermometer,
  RefreshCw,
  ArrowRight,
  Stethoscope,
  Building2,
  FileCheck2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { PrescriptionScanner } from "@/components/visualization/PrescriptionScanner";
import { MedicalDocument } from "@/lib/types";
import { Nav } from "@/components/brand/Nav";
import { Footer } from "@/components/brand/Footer";

interface ExtractedDrug {
  drug: string;
  dose: string;
  frequency: string;
  duration: string;
  confidence: number;
  source: string;
  page: number;
  purpose?: string;
}

interface ExtractedLab {
  test: string;
  value: string;
  unit: string;
  refRange: string;
  status: "NORMAL" | "HIGH" | "LOW" | "CRITICAL";
  confidence: number;
  source: string;
  interpretation?: string;
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
  const [activeTab, setActiveTab] = useState<"live_scanner" | "timeline">("live_scanner");
  const [latestScannedDoc, setLatestScannedDoc] = useState<MedicalDocument | null>(null);

  // Extracted entities
  const [medications, setMedications] = useState<ExtractedDrug[]>([
    {
      drug: "Tab Telmisartan",
      dose: "40 mg",
      frequency: "1-0-0 (Morning OD)",
      duration: "30 days",
      confidence: 98.4,
      source: "Prescription_Cardiology_2024.pdf",
      page: 1,
      purpose: "Essential Hypertension"
    },
    {
      drug: "Tab Metformin HCl",
      dose: "500 mg",
      frequency: "1-0-1 (After Food BD)",
      duration: "30 days",
      confidence: 99.1,
      source: "Prescription_Cardiology_2024.pdf",
      page: 1,
      purpose: "Type 2 Diabetes Mellitus"
    },
    {
      drug: "Tab Atorvastatin",
      dose: "20 mg",
      frequency: "0-0-1 (Night HS)",
      duration: "30 days",
      confidence: 96.8,
      source: "Prescription_Cardiology_2024.pdf",
      page: 1,
      purpose: "Primary Dyslipidemia"
    },
  ]);

  const [labs, setLabs] = useState<ExtractedLab[]>([
    {
      test: "HbA1c (Glycated Hemoglobin)",
      value: "7.4",
      unit: "%",
      refRange: "< 5.7%",
      status: "HIGH",
      confidence: 99.4,
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

  const handleScanComplete = (doc: MedicalDocument) => {
    setLatestScannedDoc(doc);
    const categoryName =
      doc.document_type === "prescription"
        ? "Prescription"
        : doc.document_type === "lab_report"
        ? "Lab Report"
        : "Diagnosis";

    const newEvent: TimelineEvent = {
      year: new Date().getFullYear().toString(),
      date: "Today (Scanned)",
      title: `${doc.document_purpose || "Clinical Document"} - ${doc.document_type.toUpperCase()}`,
      category: categoryName as "Prescription" | "Diagnosis" | "Lab Report" | "Hospitalization",
      facility: doc.facility_name || "MediKiosk Point-of-Entry Intake #04",
      details: doc.clinical_intent || doc.document_purpose || "Document processed by Multilingual OCR Engine.",
    };
    setTimeline((prev) => [newEvent, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#2C3E50] flex flex-col justify-between selection:bg-[#CCE5FF] selection:text-[#0056B3]">
      {/* 1. Global Modern SaaS Navbar */}
      <Nav />

      {/* 2. Unified Document Intelligence Subheader */}
      <div className="bg-white border-b border-neutral-200/80 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0056B3] text-white flex items-center justify-center font-bold shadow-xs">
              <FileScan className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-sm sm:text-base text-neutral-900 leading-tight">
                Document Intelligence &amp; Medical Timeline
              </h1>
              <p className="text-[11px] text-neutral-500 hidden sm:flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Multilingual Prescription OCR &amp; Provenance Tracking
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

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 space-y-8 text-left">
        {/* Module Subheader & Tab Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#FDEBD0]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1D2A8F]/10 text-[#1D2A8F] text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#FB923C]" />
              Live Clinical Intake + ABDM Record Aggregation
            </div>
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-[#374151]">
              Document Attachment, OCR &amp; Longitudinal EHR
            </h2>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 p-1 bg-white border border-[#FDEBD0] rounded-full shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("live_scanner")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "live_scanner"
                  ? "bg-[#1D2A8F] text-white shadow-xs"
                  : "text-[#374151]/70 hover:text-[#1D2A8F] hover:bg-[#FDFBF7]"
              }`}
            >
              <FileScan className="w-3.5 h-3.5" />
              <span>Direct Upload &amp; Intent OCR</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("timeline")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "timeline"
                  ? "bg-[#1D2A8F] text-white shadow-xs"
                  : "text-[#374151]/70 hover:text-[#1D2A8F] hover:bg-[#FDFBF7]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>EHR Timeline ({timeline.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: Live Interactive Prescription & Document Scanner */}
        {activeTab === "live_scanner" && (
          <div className="space-y-8">
            <PrescriptionScanner
              patientId="P-DEMO-001"
              onScanComplete={handleScanComplete}
            />
          </div>
        )}

        {/* TAB 2: Longitudinal Timeline & Extracted Records */}
        {activeTab === "timeline" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT: Structured Extracted Entities with Confidence & Provenance (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Medications Card */}
              <div className="bg-white border border-[#FDEBD0] rounded-[16px] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#FDEBD0]/80">
                  <div className="flex items-center gap-2.5">
                    <Pill className="w-4 h-4 text-[#C2410C]" />
                    <div>
                      <h3 className="font-heading font-bold text-sm text-[#374151]">
                        Extracted Medications &amp; Dosages
                      </h3>
                      <p className="text-[11px] text-[#374151]/70">
                        Parsed from Prescription_Cardiology_2024.pdf
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    3 Drugs Parsed
                  </span>
                </div>

                <div className="space-y-2.5">
                  {medications.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0] hover:bg-white hover:border-[#1D2A8F] transition-colors text-xs"
                    >
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#374151]">
                            {item.drug}
                          </span>
                          <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-full bg-[#1D2A8F]/10 text-[#1D2A8F]">
                            {item.dose}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Confidence: {item.confidence}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[#374151]/70 mt-2 pt-2 border-t border-[#FDEBD0]/80">
                        <span>Frequency: <strong className="text-[#374151] font-semibold">{item.frequency}</strong></span>
                        <span>Duration: <strong>{item.duration}</strong></span>
                        <span className="text-[10px] text-[#374151]/50 font-mono">Pg {item.page}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lab Values Card */}
              <div className="bg-white border border-[#FDEBD0] rounded-[16px] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#FDEBD0]/80">
                  <div className="flex items-center gap-2.5">
                    <Thermometer className="w-4 h-4 text-[#FB923C]" />
                    <div>
                      <h3 className="font-heading font-bold text-sm text-[#374151]">
                        Extracted Lab &amp; Diagnostic Parameters
                      </h3>
                      <p className="text-[11px] text-[#374151]/70">
                        Parsed with reference range comparison
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-[#C2410C] border border-red-200">
                    4 Tests Extracted
                  </span>
                </div>

                <div className="space-y-2.5">
                  {labs.map((lab, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0] flex items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-[#374151] text-xs">{lab.test}</h4>
                        <span className="text-[#374151]/70 text-[11px]">Ref: {lab.refRange}</span>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="font-mono font-bold text-xs text-[#374151]">
                            {lab.value} <span className="text-[11px] font-normal text-[#374151]/70">{lab.unit}</span>
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              lab.status === "HIGH"
                                ? "bg-red-50 text-[#C2410C] border border-red-200"
                                : lab.status === "LOW"
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {lab.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#374151]/50 block mt-0.5">
                          Confidence: {lab.confidence}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Longitudinal Medical Timeline (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-[#FDEBD0] rounded-[16px] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#FDEBD0]/80">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#1D2A8F]" />
                    <h3 className="font-heading font-bold text-sm text-[#374151]">
                      Automated Health Timeline
                    </h3>
                  </div>
                  <span className="text-xs text-[#1D2A8F] font-bold">2021 – 2026</span>
                </div>

                <div className="relative pl-6 space-y-4 border-l-2 border-[#1D2A8F]/20">
                  {timeline.map((event, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#1D2A8F]" />
                      <div className="bg-[#FDFBF7] p-3.5 rounded-[10px] border border-[#FDEBD0] hover:bg-white hover:border-[#1D2A8F] transition-colors">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-[#1D2A8F]">{event.date}</span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#1D2A8F]/10 text-[#1D2A8F]">
                            {event.category}
                          </span>
                        </div>
                        <h4 className="font-heading font-bold text-xs text-[#374151] mb-1">{event.title}</h4>
                        <p className="text-[11px] text-[#374151]/70 leading-relaxed mb-2">{event.details}</p>
                        <span className="text-[10px] text-[#374151]/50 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-[#1D2A8F]" />
                          {event.facility}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Direct CTA */}
                <div className="mt-8 p-4 rounded-[12px] bg-[#1D2A8F]/5 border border-[#1D2A8F]/20 flex items-center justify-between gap-3">
                  <div>
                    <h5 className="font-heading font-bold text-xs text-[#374151]">
                      Sync with Patient Kiosk
                    </h5>
                    <p className="text-[11px] text-[#374151]/70">
                      Timeline attached to active consultation session.
                    </p>
                  </div>
                  <Link
                    href="/kiosk"
                    className="px-4 py-2 rounded-full bg-[#1D2A8F] hover:bg-[#15206B] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs whitespace-nowrap"
                  >
                    <span>Go to Kiosk</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#FB923C]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Global Footer */}
      <Footer />
    </div>
  );
}
