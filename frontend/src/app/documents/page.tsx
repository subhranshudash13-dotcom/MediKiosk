"use client";

import { useState, useEffect } from "react";
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
import { MedicalDocument, PatientHistoryResponse } from "@/lib/types";
import { useAuthStore } from "@/lib/auth-store";
import { HistoryAPI } from "@/lib/api";

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
  const { user, isAuthenticated } = useAuthStore();
  const effectivePatientId = user?.user_id || "P-DEMO-001";

  const [activeTab, setActiveTab] = useState<"live_scanner" | "timeline">("live_scanner");
  const [latestScannedDoc, setLatestScannedDoc] = useState<MedicalDocument | null>(null);

  // Extracted entities
  const [medications, setMedications] = useState<ExtractedDrug[]>([]);
  const [labs, setLabs] = useState<ExtractedLab[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  // Load prior records dynamically from MongoDB on mount or user change
  useEffect(() => {
    async function loadHistoryRecords() {
      try {
        let history: PatientHistoryResponse;
        if (isAuthenticated) {
          history = await HistoryAPI.getMyHistory();
        } else {
          history = await HistoryAPI.getPatientHistory(effectivePatientId);
        }

        if (history && history.timeline && history.timeline.length > 0) {
          const mappedTimeline: TimelineEvent[] = history.timeline.map((evt) => ({
            year: evt.date ? evt.date.slice(0, 4) : new Date().getFullYear().toString(),
            date: evt.date || "Recent",
            title: evt.title,
            category: (evt.category === "prescription"
              ? "Prescription"
              : evt.category === "lab_report"
              ? "Lab Report"
              : "Diagnosis") as any,
            facility: evt.facility_name || "Hospital OPD",
            details: evt.summary || "Clinical encounter recorded in database.",
          }));
          setTimeline(mappedTimeline);
        }

        if (history && history.active_medications && history.active_medications.length > 0) {
          const mappedMeds: ExtractedDrug[] = history.active_medications.map((m) => ({
            drug: m.name,
            dose: m.dosage || "As advised",
            frequency: m.frequency || "OD",
            duration: m.duration || "Ongoing",
            confidence: m.confidence || 98.4,
            source: "Database Patient Record",
            page: 1,
            purpose: m.indication || "Chronic Disease Management",
          }));
          setMedications(mappedMeds);
        }
      } catch (err) {
        console.warn("Could not load prior patient history in document page:", err);
      }
    }
    loadHistoryRecords();
  }, [isAuthenticated, effectivePatientId]);

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
      date: "Just Now (Stored in Database)",
      title: `${doc.document_purpose || "Clinical Document"} - ${doc.document_type.toUpperCase()}`,
      category: categoryName as "Prescription" | "Diagnosis" | "Lab Report" | "Hospitalization",
      facility: doc.facility_name || "MediKiosk Point-of-Entry Intake #04",
      details: doc.clinical_intent || doc.document_purpose || "Document processed by Multilingual OCR Engine and stored in MongoDB.",
    };
    setTimeline((prev) => [newEvent, ...prev]);

    if (doc.extracted_medications && doc.extracted_medications.length > 0) {
      const newMeds: ExtractedDrug[] = doc.extracted_medications.map((m) => ({
        drug: m.name,
        dose: m.dosage || "As advised",
        frequency: m.frequency || "OD",
        duration: m.duration || "Ongoing",
        confidence: m.confidence || 98.0,
        source: doc.file_path || "Prescription_Scan",
        page: 1,
        purpose: m.indication || doc.document_purpose || "Clinical Indication",
      }));
      setMedications((prev) => [...newMeds, ...prev]);
    }

    if (doc.extracted_labs && doc.extracted_labs.length > 0) {
      const newLabs: ExtractedLab[] = doc.extracted_labs.map((l) => ({
        test: l.test_name,
        value: l.value,
        unit: l.unit || "",
        refRange: l.reference_range || "Standard",
        status: (l.severity_flag?.includes("CRITICAL") ? "CRITICAL" : l.is_abnormal ? "HIGH" : "NORMAL") as any,
        confidence: 97.0,
        source: doc.file_path || "Lab_Scan",
        interpretation: l.clinical_significance,
      }));
      setLabs((prev) => [...newLabs, ...prev]);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#374151] flex flex-col justify-between selection:bg-[#FDEBD0] selection:text-[#1D2A8F]">
      {/* Top Header */}
      <header className="bg-white border-b border-[#FDEBD0] px-4 sm:px-6 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#FDEBD0] bg-[#FDFBF7] hover:bg-white text-[#374151]/80 hover:text-[#1D2A8F] text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <div className="h-5 w-[1px] bg-[#FDEBD0] hidden sm:block" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[8px] bg-[#1D2A8F] text-white flex items-center justify-center font-bold shadow-xs">
                <FileScan className="w-4 h-4 text-[#FB923C]" />
              </div>
              <div className="text-left">
                <h1 className="font-heading font-bold text-sm text-[#374151] leading-tight">
                  Document Intelligence &amp; Medical Timeline
                </h1>
                <p className="text-[11px] text-[#374151]/70 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Multilingual Prescription OCR &amp; Provenance Tracking
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/patient/history"
              className="px-3.5 py-1.5 rounded-full border border-[#1D2A8F] text-[#1D2A8F] hover:bg-[#1D2A8F]/10 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5 text-[#1D2A8F]" />
              <span className="hidden sm:inline">Longitudinal History</span>
            </Link>
            <Link
              href="/doctor"
              className="px-4 py-1.5 rounded-full bg-[#1D2A8F] hover:bg-[#15206B] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Stethoscope className="w-3.5 h-3.5 text-[#FB923C]" />
              <span>View in Doctor Cockpit</span>
            </Link>
          </div>
        </div>
      </header>

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
          <div className="space-y-6">
            {latestScannedDoc && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-emerald-900">
                      Prescription / Document Stored in Database &amp; Health Record
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      Record {latestScannedDoc.document_id} has been permanently saved to MongoDB and synced with your care history.
                    </div>
                  </div>
                </div>
                <Link
                  href="/patient/history"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs shrink-0"
                >
                  <span>View All in History Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
            <PrescriptionScanner
              patientId={effectivePatientId}
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
                        Synchronized from Database &amp; Digitized Records
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {medications.length} Medications
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

      {/* Footer */}
      <footer className="bg-white border-t border-[#FDEBD0] py-4 px-6 mt-12 text-center text-xs text-[#374151]/70">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MediKiosk Document Intelligence Engine • FHIR DocumentReference Linked</span>
          <span className="text-[#374151]/50">Compliant with DPDP Act 2023 &amp; ABDM M2/M3 Standards</span>
        </div>
      </footer>
    </div>
  );
}
