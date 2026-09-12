"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  User,
  Activity,
  FileText,
  Pill,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Download,
  RefreshCw,
  Plus,
  HeartPulse,
} from "lucide-react";
import { Nav } from "@/components/brand/Nav";
import { Footer } from "@/components/brand/Footer";
import { useAuthStore } from "@/lib/auth-store";
import { HistoryAPI } from "@/lib/api";
import {
  PatientHistoryResponse,
  HistoryTimelineEvent,
  HistoryEncounterRecord,
  HistoryDocumentRecord,
  HistoryMedication,
  HistoryLabResult,
} from "@/lib/types";

type FilterTab = "all" | "encounters" | "prescriptions" | "labs" | "medications";

export default function PatientHistoryPage() {
  const { user, isAuthenticated, initAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState<PatientHistoryResponse | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [patientIdInput, setPatientIdInput] = useState("P-DEMO-001");
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Fetch history when user auth status or demo patient changes
  useEffect(() => {
    fetchHistory();
  }, [isAuthenticated, user]);

  const fetchHistory = async (overridePatientId?: string) => {
    setLoading(true);
    setFetchError(null);
    try {
      let data: PatientHistoryResponse;
      if (overridePatientId) {
        data = await HistoryAPI.getPatientHistory(overridePatientId);
        setUsingDemoData(overridePatientId === "P-DEMO-001");
      } else if (isAuthenticated) {
        try {
          data = await HistoryAPI.getMyHistory();
          // If authenticated user has 0 records, give them the option or auto-fallback to demo
          if (!data || (data.total_records === 0 && data.total_encounters === 0 && data.total_documents === 0)) {
            // Check if demo is preferred
            setUsingDemoData(false);
          }
        } catch {
          // Fallback to demo patient for uninterrupted evaluation
          data = await HistoryAPI.getPatientHistory("P-DEMO-001");
          setUsingDemoData(true);
        }
      } else {
        data = await HistoryAPI.getPatientHistory("P-DEMO-001");
        setUsingDemoData(true);
      }
      setHistoryData(data);
    } catch (err: any) {
      console.error("Failed to load patient history:", err);
      setFetchError("Unable to retrieve longitudinal patient history from backend.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filtered timeline records
  const filteredTimeline = useMemo(() => {
    if (!historyData) return [];
    let items = historyData.timeline || [];

    // Filter by tab
    if (activeTab === "encounters") {
      items = items.filter((i) => i.record_type === "encounter" || i.record_type === "session");
    } else if (activeTab === "prescriptions") {
      items = items.filter((i) => i.category === "prescription" || i.medications.length > 0);
    } else if (activeTab === "labs") {
      items = items.filter((i) => i.category === "lab_report" || i.abnormal_labs.length > 0);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.summary?.toLowerCase().includes(q) ||
          i.provider_name?.toLowerCase().includes(q) ||
          i.facility_name?.toLowerCase().includes(q) ||
          i.diagnoses?.some((d) => d.toLowerCase().includes(q)) ||
          i.medications?.some((m) => m.name.toLowerCase().includes(q)) ||
          i.abnormal_labs?.some((l) => l.test_name.toLowerCase().includes(q))
      );
    }

    return items;
  }, [historyData, activeTab, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#1E293B]">
      <Nav />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 py-8 md:px-8 space-y-6">
        {/* Top Header Banner */}
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0A2540] text-white p-6 md:p-8 shadow-xl border border-white/10">
          {/* Subtle decorative background glows */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-32 -bottom-16 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ABDM Longitudinal Health Record (EHR)</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-tight">
                {historyData?.patient_name || user?.full_name || "Patient Health History"}
              </h1>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                Chronological care continuum aggregating clinical consultations, physical OCR prescription scans,
                diagnostic laboratory trends, and active medication regimens.
              </p>
            </div>

            {/* Quick Demo Switcher / Patient ID Selector */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-xs">
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Viewing Record</div>
                <div className="text-xs font-mono font-bold text-white">
                  {historyData?.patient_id || patientIdInput}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPatientIdInput("P-DEMO-001");
                    fetchHistory("P-DEMO-001");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    usingDemoData
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white/10 text-slate-300 hover:bg-white/20"
                  }`}
                >
                  Demo Record
                </button>
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => {
                      setUsingDemoData(false);
                      fetchHistory();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      !usingDemoData
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white/10 text-slate-300 hover:bg-white/20"
                    }`}
                  >
                    My Account
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => fetchHistory(usingDemoData ? "P-DEMO-001" : undefined)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
                  title="Refresh records"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-center sm:text-left">
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="text-[11px] text-slate-400 font-medium">Total Timeline Records</div>
              <div className="text-xl font-bold font-mono text-white mt-0.5">
                {historyData?.total_records ?? 0}
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="text-[11px] text-slate-400 font-medium">Doctor Encounters</div>
              <div className="text-xl font-bold font-mono text-emerald-300 mt-0.5">
                {historyData?.total_encounters ?? 0}
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="text-[11px] text-slate-400 font-medium">Digitized Documents</div>
              <div className="text-xl font-bold font-mono text-blue-300 mt-0.5">
                {historyData?.total_documents ?? 0}
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="text-[11px] text-slate-400 font-medium">Active Medications</div>
              <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">
                {historyData?.active_medications?.length ?? 0}
              </div>
            </div>
          </div>
        </div>

        {/* Critical Alerts Banner (If Any Abnormal Labs Detected) */}
        {historyData?.critical_lab_alerts && historyData.critical_lab_alerts.length > 0 && (
          <div className="p-5 rounded-[22px] bg-red-50 border border-red-200 shadow-sm flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-red-100 text-red-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="text-sm font-bold text-red-900">
                Critical Clinical Alerts Flagged ({historyData.critical_lab_alerts.length})
              </h3>
              <p className="text-xs text-red-700 leading-relaxed">
                The following diagnostic parameters exceed standard clinical reference thresholds and require physician review:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {historyData.critical_lab_alerts.map((alert, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100/80 text-red-800 text-xs font-semibold border border-red-300/60"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                    {alert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Pharmacotherapy Shelf (Sticky Overview) */}
        {historyData?.active_medications && historyData.active_medications.length > 0 && (
          <div className="p-6 rounded-[24px] bg-white border border-[#E2E8F0] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Current Active Pharmacotherapy</h2>
                  <p className="text-[11px] text-slate-500">Deduplicated across current consultations &amp; digitized prescriptions</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {historyData.active_medications.length} Prescribed Regimens
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {historyData.active_medications.map((med, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-slate-900">{med.name}</span>
                    {med.dosage && (
                      <span className="text-[11px] font-mono font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md shrink-0">
                        {med.dosage}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    {med.frequency && (
                      <div>
                        <span className="text-slate-400">Frequency:</span> <span className="font-semibold">{med.frequency}</span>
                      </div>
                    )}
                    {med.indication && (
                      <div>
                        <span className="text-slate-400">Indication:</span> {med.indication}
                      </div>
                    )}
                    {med.instructions && (
                      <div>
                        <span className="text-slate-400">Timing:</span> {med.instructions}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Tabs & Search Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/80 border border-slate-300/60 overflow-x-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "all"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Records ({historyData?.total_records ?? 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("encounters")}
              className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "encounters"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Encounters ({historyData?.total_encounters ?? 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("prescriptions")}
              className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "prescriptions"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Prescriptions &amp; Scans
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("labs")}
              className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "labs"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Lab Reports
            </button>
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search diagnosis, doctor, drug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="text-xs font-semibold text-slate-500">Retrieving longitudinal patient history...</span>
          </div>
        )}

        {/* Error State */}
        {!loading && fetchError && (
          <div className="p-8 rounded-[24px] bg-red-50 border border-red-200 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
            <div className="text-sm font-bold text-red-900">{fetchError}</div>
            <button
              type="button"
              onClick={() => fetchHistory("P-DEMO-001")}
              className="px-4 py-2 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer"
            >
              Load Demo Patient P-DEMO-001
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !fetchError && filteredTimeline.length === 0 && (
          <div className="p-12 rounded-[28px] bg-white border border-slate-200 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mx-auto">
              <Clock className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">No Historical Records Found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {searchQuery
                  ? `No records match your search criteria "${searchQuery}".`
                  : "You do not have any recorded medical consultations or scanned documents yet."}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/kiosk"
                className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>Start Kiosk Intake</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/documents"
                className="px-4 py-2 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>Upload Medical Document</span>
              </Link>
              <button
                type="button"
                onClick={() => fetchHistory("P-DEMO-001")}
                className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                View Demo Patient Records
              </button>
            </div>
          </div>
        )}

        {/* Chronological Timeline Feed */}
        {!loading && !fetchError && filteredTimeline.length > 0 && (
          <div className="space-y-4">
            {filteredTimeline.map((item, index) => {
              const isExpanded = !!expandedItems[item.event_id];
              const isEncounter = item.record_type === "encounter";
              const isLab = item.category === "lab_report" || item.abnormal_labs.length > 0;
              const isPrescription = item.category === "prescription" || item.medications.length > 0;

              return (
                <div
                  key={item.event_id || index}
                  className="rounded-[24px] bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Card Header Bar */}
                  <div
                    onClick={() => toggleExpand(item.event_id)}
                    className="p-5 sm:p-6 cursor-pointer select-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-transparent hover:border-slate-100 transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`p-2.5 rounded-2xl shrink-0 ${
                          isEncounter
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : isLab
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : "bg-blue-50 text-blue-700 border border-blue-100"
                        }`}
                      >
                        {isEncounter ? (
                          <Stethoscope className="w-5 h-5" />
                        ) : isLab ? (
                          <HeartPulse className="w-5 h-5" />
                        ) : (
                          <FileText className="w-5 h-5" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                          {item.is_abdm_verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                              <ShieldCheck className="w-3 h-3" />
                              ABDM Verified
                            </span>
                          )}
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {item.record_type}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          {item.date && (
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {item.date}
                            </span>
                          )}
                          {item.provider_name && (
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              {item.provider_name}
                            </span>
                          )}
                          {item.facility_name && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              {item.facility_name}
                            </span>
                          )}
                        </div>

                        {item.summary && (
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-3xl">
                            {item.summary}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right summary tags & expand chevron */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {item.medications.length > 0 && (
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                          {item.medications.length} Meds
                        </span>
                      )}
                      {item.abnormal_labs.length > 0 && (
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700">
                          {item.abnormal_labs.length} Lab Alerts
                        </span>
                      )}
                      <div className="p-1 rounded-full bg-slate-100 text-slate-500">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail Accordion */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 bg-slate-50/70 border-t border-slate-100 space-y-5">
                      {/* Diagnoses */}
                      {item.diagnoses && item.diagnoses.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Clinical Diagnoses
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {item.diagnoses.map((diag, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-2xs"
                              >
                                {diag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Prescribed / Extracted Medications */}
                      {item.medications && item.medications.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Pill className="w-3.5 h-3.5" />
                            <span>Prescribed Pharmacotherapy ({item.medications.length})</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {item.medications.map((m, mIdx) => (
                              <div
                                key={mIdx}
                                className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1 text-xs shadow-2xs"
                              >
                                <div className="flex items-center justify-between font-bold text-slate-900">
                                  <span>{m.name}</span>
                                  {m.dosage && (
                                    <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                      {m.dosage}
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-500 text-[11px] space-y-0.5">
                                  {m.frequency && (
                                    <div>
                                      <span className="text-slate-400">Schedule:</span> {m.frequency}
                                    </div>
                                  )}
                                  {m.instructions && (
                                    <div>
                                      <span className="text-slate-400">Directions:</span> {m.instructions}
                                    </div>
                                  )}
                                  {m.duration && (
                                    <div>
                                      <span className="text-slate-400">Duration:</span> {m.duration}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Abnormal Laboratory Findings */}
                      {item.abnormal_labs && item.abnormal_labs.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-[11px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Abnormal Diagnostic Findings ({item.abnormal_labs.length})</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {item.abnormal_labs.map((l, lIdx) => (
                              <div
                                key={lIdx}
                                className="p-3.5 rounded-xl bg-red-50/70 border border-red-200 space-y-1 text-xs shadow-2xs"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900">{l.test_name}</span>
                                  <span className="font-mono font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded text-[11px]">
                                    {l.value} {l.unit || ""}
                                  </span>
                                </div>
                                {l.reference_range && (
                                  <div className="text-[11px] text-slate-500">
                                    Ref Range: <span className="font-semibold">{l.reference_range}</span>
                                  </div>
                                )}
                                {l.clinical_significance && (
                                  <div className="text-[11px] text-red-700 font-medium">
                                    {l.clinical_significance}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
