"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Users,
  ShieldCheck,
  FileText,
  Activity,
  HeartPulse,
  Sparkles,
  Zap,
  Timer,
  Stethoscope
} from "lucide-react";
import { cn } from "@/lib/utils";

export function HospitalEfficiencyFlow() {
  const [activeTab, setActiveTab] = useState<"comparison" | "metrics" | "roi">("comparison");
  const [dailyPatients, setDailyPatients] = useState<number>(350);

  // Computed ROI
  const hoursSavedDaily = ((dailyPatients * (12 - 3.8)) / 60).toFixed(1);
  const throughputGainPercent = "64%";
  const redFlagSpeedSec = "< 15 sec";

  return (
    <div className="rounded-[20px] border border-[#FDEBD0] bg-white p-6 sm:p-8 shadow-sm text-left space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#FDEBD0]/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[#1D2A8F]/10 text-[#1D2A8F]">
              <TrendingUp className="h-3.5 w-3.5 text-[#FB923C]" />
            </span>
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1D2A8F]">
              Hospital OPD Operational Transformation
            </p>
          </div>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#374151] mt-1">
            Solving the High-Volume Indian OPD Crisis
          </h3>
          <p className="text-xs sm:text-sm text-[#374151]/70 mt-1">
            From chaotic paper queues and doctor burnout to structured, voice-guided pre-consultation intelligence.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-[#FDFBF7] p-1 rounded-full border border-[#FDEBD0]">
          <button
            onClick={() => setActiveTab("comparison")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
              activeTab === "comparison" ? "bg-[#1D2A8F] text-white shadow-xs" : "text-[#374151]/70 hover:text-[#1D2A8F]"
            )}
          >
            Journey Comparison
          </button>
          <button
            onClick={() => setActiveTab("metrics")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
              activeTab === "metrics" ? "bg-[#1D2A8F] text-white shadow-xs" : "text-[#374151]/70 hover:text-[#1D2A8F]"
            )}
          >
            Clinical Telemetry
          </button>
          <button
            onClick={() => setActiveTab("roi")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
              activeTab === "roi" ? "bg-[#1D2A8F] text-white shadow-xs" : "text-[#374151]/70 hover:text-[#1D2A8F]"
            )}
          >
            Hospital ROI Simulator
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: Step-by-Step Flow Comparison */}
        {activeTab === "comparison" && (
          <motion.div
            key="tab-comparison"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"
          >
            {/* Left: Traditional Paper OPD (The Problem) */}
            <div className="rounded-[16px] border border-red-200 bg-red-50/40 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-red-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <h4 className="font-heading text-sm font-bold text-red-900">
                    Traditional Hospital OPD (Manual Bottleneck)
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  ~55+ Mins Total
                </span>
              </div>

              {/* Step Flow List */}
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white/90 rounded-[10px] border border-red-100 flex items-start gap-2.5">
                  <span className="font-mono font-bold text-red-600 shrink-0">01</span>
                  <div>
                    <p className="font-bold text-[#374151]">Manual Paper Queue Registration (15+ min)</p>
                    <p className="text-[11px] text-[#374151]/70 mt-0.5">
                      Patients wait in physical lines; clerk enters basic demographic details with spelling errors.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white/90 rounded-[10px] border border-red-100 flex items-start gap-2.5">
                  <span className="font-mono font-bold text-red-600 shrink-0">02</span>
                  <div>
                    <p className="font-bold text-[#374151]">Un-Triaged Waiting Room (30-60 min)</p>
                    <p className="text-[11px] text-[#374151]/70 mt-0.5">
                      First-come-first-serve basis; critical cardiac or septic emergencies sit unnoticed next to routine colds.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white/90 rounded-[10px] border border-red-100 flex items-start gap-2.5">
                  <span className="font-mono font-bold text-red-600 shrink-0">03</span>
                  <div>
                    <p className="font-bold text-[#374151]">Rushed Doctor Consultation (10-12 min)</p>
                    <p className="text-[11px] text-[#374151]/70 mt-0.5">
                      Physician spends 70% of the consultation typing notes, deciphering old crumbled prescription slips, and translating dialect.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white/90 rounded-[10px] border border-red-100 flex items-start gap-2.5">
                  <span className="font-mono font-bold text-red-600 shrink-0">04</span>
                  <div>
                    <p className="font-bold text-[#374151]">Disconnected Paper Rx (Zero Continuity)</p>
                    <p className="text-[11px] text-[#374151]/70 mt-0.5">
                      Patient takes handwritten paper slip home; lost records prevent longitudinal EHR tracking.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: MediKiosk Streamlined Intake (The Solution) */}
            <div className="rounded-[16px] border border-emerald-300 bg-emerald-50/40 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h4 className="font-heading text-sm font-bold text-emerald-900">
                    MediKiosk AI-Assisted Streamlined OPD
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  ~3.8 Mins Total
                </span>
              </div>

              {/* Step Flow List */}
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white/90 rounded-[10px] border border-emerald-200 flex items-start gap-2.5">
                  <span className="font-mono font-bold text-emerald-700 shrink-0">01</span>
                  <div>
                    <p className="font-bold text-[#374151]">Instant Kiosk Vernacular Voice Intake (1.5 min)</p>
                    <p className="text-[11px] text-[#374151]/70 mt-0.5">
                      Patient describes symptoms naturally in their mother tongue; optical scanner digitizes prior prescriptions.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white/90 rounded-[10px] border border-emerald-200 flex items-start gap-2.5">
                  <span className="font-mono font-bold text-emerald-700 shrink-0">02</span>
                  <div>
                    <p className="font-bold text-[#374151]">Automated ESI Triage &amp; Red-Flag Escalation (&lt; 15 sec)</p>
                    <p className="text-[11px] text-[#374151]/70 mt-0.5">
                      Acute complaints trigger instant alert popups on the doctor console; emergency cases bumped to immediate status.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white/90 rounded-[10px] border border-emerald-200 flex items-start gap-2.5">
                  <span className="font-mono font-bold text-emerald-700 shrink-0">03</span>
                  <div>
                    <p className="font-bold text-[#374151]">Focused Physician Consultation (3.8 min)</p>
                    <p className="text-[11px] text-[#374151]/70 mt-0.5">
                      Doctor enters cabin with fully structured SOCRATES HPI, past Rx timeline, and differential diagnosis suggestions ready on screen.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white/90 rounded-[10px] border border-emerald-200 flex items-start gap-2.5">
                  <span className="font-mono font-bold text-emerald-700 shrink-0">04</span>
                  <div>
                    <p className="font-bold text-[#374151]">1-Click ABDM FHIR Bundle Sync (Instant)</p>
                    <p className="text-[11px] text-[#374151]/70 mt-0.5">
                      Digital consultation note signed by doctor is automatically synced to patient's ABHA health locker.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: Clinical Telemetry & Benchmark Metrics */}
        {activeTab === "metrics" && (
          <motion.div
            key="tab-metrics"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="p-5 bg-[#FDFBF7] border border-[#FDEBD0] rounded-[16px] text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#1D2A8F] uppercase">Intake Velocity</span>
                <Clock className="w-4 h-4 text-[#FB923C]" />
              </div>
              <p className="font-heading text-2xl sm:text-3xl font-black text-[#374151] mt-2">
                2.8 <span className="text-sm font-bold text-[#374151]/70">mins</span>
              </p>
              <p className="text-xs text-[#374151]/70 mt-1">
                Average voice intake + document scan completion time per patient.
              </p>
            </div>

            <div className="p-5 bg-[#FDFBF7] border border-[#FDEBD0] rounded-[16px] text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">Doctor Time Saved</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="font-heading text-2xl sm:text-3xl font-black text-emerald-700 mt-2">
                68.2%
              </p>
              <p className="text-xs text-[#374151]/70 mt-1">
                Reduction in repetitive manual note-typing during OPD consultations.
              </p>
            </div>

            <div className="p-5 bg-[#FDFBF7] border border-[#FDEBD0] rounded-[16px] text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#C2410C] uppercase">Emergency Flag Speed</span>
                <AlertTriangle className="w-4 h-4 text-[#C2410C]" />
              </div>
              <p className="font-heading text-2xl sm:text-3xl font-black text-[#C2410C] mt-2">
                &lt; 15s
              </p>
              <p className="text-xs text-[#374151]/70 mt-1">
                From patient voice complaint to physician emergency desktop trigger.
              </p>
            </div>

            <div className="p-5 bg-[#FDFBF7] border border-[#FDEBD0] rounded-[16px] text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#1D2A8F] uppercase">ABDM Compliance</span>
                <ShieldCheck className="w-4 h-4 text-[#1D2A8F]" />
              </div>
              <p className="font-heading text-2xl sm:text-3xl font-black text-[#1D2A8F] mt-2">
                100%
              </p>
              <p className="text-xs text-[#374151]/70 mt-1">
                FHIR R4 standard data modeling with Ayushman Bharat gateway verification.
              </p>
            </div>
          </motion.div>
        )}

        {/* TAB 3: Hospital ROI Simulator */}
        {activeTab === "roi" && (
          <motion.div
            key="tab-roi"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-[16px] bg-[#FDFBF7] border border-[#FDEBD0] p-6 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-heading text-base font-bold text-[#374151]">
                  Simulate Your Hospital OPD Capacity Gains
                </h4>
                <p className="text-xs text-[#374151]/70 mt-0.5">
                  Adjust your hospital's average daily OPD patient volume:
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#1D2A8F]">Patients/Day:</span>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="25"
                  value={dailyPatients}
                  onChange={(e) => setDailyPatients(Number(e.target.value))}
                  className="accent-[#1D2A8F] cursor-pointer"
                />
                <span className="font-mono font-bold text-sm bg-white px-3 py-1 rounded-[8px] border border-[#FDEBD0] text-[#374151]">
                  {dailyPatients}
                </span>
              </div>
            </div>

            {/* Calculated Output Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-white p-4 rounded-[12px] border border-[#FDEBD0]">
                <p className="text-[10px] font-mono uppercase font-bold text-[#374151]/70">Clinical Hours Saved Daily</p>
                <p className="text-2xl font-black text-[#1D2A8F] mt-1">{hoursSavedDaily} hrs</p>
                <p className="text-[10px] text-[#374151]/60 mt-0.5">Across OPD physician staff</p>
              </div>
              <div className="bg-white p-4 rounded-[12px] border border-[#FDEBD0]">
                <p className="text-[10px] font-mono uppercase font-bold text-[#374151]/70">OPD Throughput Surge</p>
                <p className="text-2xl font-black text-emerald-700 mt-1">+{throughputGainPercent}</p>
                <p className="text-[10px] text-[#374151]/60 mt-0.5">More patients triaged safely</p>
              </div>
              <div className="bg-white p-4 rounded-[12px] border border-[#FDEBD0]">
                <p className="text-[10px] font-mono uppercase font-bold text-[#374151]/70">Emergency Escalation Time</p>
                <p className="text-2xl font-black text-[#C2410C] mt-1">{redFlagSpeedSec}</p>
                <p className="text-[10px] text-[#374151]/60 mt-0.5">Zero unnoticed critical cases</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
