"use client";

import { useState } from "react";
import {
  BarChart3,
  Clock,
  CheckCircle2,
  Users,
  Info
} from "lucide-react";

type MetricType = "wait_time" | "accuracy" | "language";

interface DepartmentMetric {
  department: string;
  code: string;
  manualValue: number;
  kioskValue: number;
  unit: string;
  improvement: string;
  patientVolume: string;
  description: string;
}

const METRICS_DATA: Record<MetricType, {
  title: string;
  subtitle: string;
  unit: string;
  yAxisLabel: string;
  benchmarkLabel: string;
  kioskLabel: string;
  departments: DepartmentMetric[];
}> = {
  wait_time: {
    title: "OPD Pre-Consultation Intake Duration",
    subtitle: "Average minutes spent per patient at manual reception desk vs MediKiosk structured intake",
    unit: "mins",
    yAxisLabel: "Minutes / Patient",
    benchmarkLabel: "Manual OPD Desk",
    kioskLabel: "MediKiosk Intake",
    departments: [
      {
        department: "General Medicine",
        code: "GEN-MED",
        manualValue: 22.0,
        kioskValue: 2.8,
        unit: "min",
        improvement: "-87.3%",
        patientVolume: "420 pts/day",
        description: "Comprehensive SOCRATES chief complaint & chronic history capture"
      },
      {
        department: "Cardiology OPD",
        code: "CARDIO",
        manualValue: 19.5,
        kioskValue: 2.3,
        unit: "min",
        improvement: "-88.2%",
        patientVolume: "260 pts/day",
        description: "Instant pain characterization + automated ECG red-flag triage"
      },
      {
        department: "Orthopedics",
        code: "ORTHO",
        manualValue: 18.0,
        kioskValue: 2.5,
        unit: "min",
        improvement: "-86.1%",
        patientVolume: "310 pts/day",
        description: "Interactive body map pain localization & joint mobility tracking"
      },
      {
        department: "Gastroenterology",
        code: "GASTRO",
        manualValue: 21.0,
        kioskValue: 3.1,
        unit: "min",
        improvement: "-85.2%",
        patientVolume: "190 pts/day",
        description: "Detailed GI quadrant mapping & prior endoscopy prescription extraction"
      }
    ]
  },
  accuracy: {
    title: "HPI Completeness & Entity Capture",
    subtitle: "Percentage of essential SOCRATES clinical parameters captured accurately prior to doctor review",
    unit: "%",
    yAxisLabel: "Completeness %",
    benchmarkLabel: "Manual Triage",
    kioskLabel: "MediKiosk AI",
    departments: [
      {
        department: "Site & Radiation",
        code: "SITE-RAD",
        manualValue: 62.0,
        kioskValue: 98.4,
        unit: "%",
        improvement: "+58.7%",
        patientVolume: "All OPDs",
        description: "Precise anatomical body map region selection"
      },
      {
        department: "Chronology & Onset",
        code: "CHRONO",
        manualValue: 54.0,
        kioskValue: 96.8,
        unit: "%",
        improvement: "+79.3%",
        patientVolume: "All OPDs",
        description: "Standardized duration, frequency, and episodic trajectory"
      },
      {
        department: "Prior Medication List",
        code: "MED-REC",
        manualValue: 41.0,
        kioskValue: 97.5,
        unit: "%",
        improvement: "+137.8%",
        patientVolume: "Pharmacy Queue",
        description: "Optical OCR drug dosage, frequency, and active reconciliation"
      },
      {
        department: "Red-Flag Alerts",
        code: "RED-FLAG",
        manualValue: 48.0,
        kioskValue: 99.2,
        unit: "%",
        improvement: "+106.7%",
        patientVolume: "Emergency / Triage",
        description: "Instant algorithmic alerts for high-risk clinical symptoms"
      }
    ]
  },
  language: {
    title: "Multilingual Patient Autonomy",
    subtitle: "Self-service intake completion rates without hospital attendant intervention across Indic dialects",
    unit: "%",
    yAxisLabel: "Autonomy %",
    benchmarkLabel: "Manual Form",
    kioskLabel: "Voice Kiosk",
    departments: [
      {
        department: "Hindi (हिन्दी)",
        code: "HI-IN",
        manualValue: 48.0,
        kioskValue: 98.6,
        unit: "%",
        improvement: "+105%",
        patientVolume: "540 pts/day",
        description: "Native dialect speech recognition & conversational empathy"
      },
      {
        department: "Telugu (తెలుగు)",
        code: "TE-IN",
        manualValue: 42.0,
        kioskValue: 97.8,
        unit: "%",
        improvement: "+132%",
        patientVolume: "380 pts/day",
        description: "Regional terminology matching for Andhra / Telangana cohorts"
      },
      {
        department: "Tamil (தமிழ்)",
        code: "TA-IN",
        manualValue: 44.0,
        kioskValue: 98.1,
        unit: "%",
        improvement: "+122%",
        patientVolume: "310 pts/day",
        description: "Natural conversational flow adapted for senior patients"
      },
      {
        department: "Marathi (मराठी)",
        code: "MR-IN",
        manualValue: 36.0,
        kioskValue: 97.2,
        unit: "%",
        improvement: "+170%",
        patientVolume: "270 pts/day",
        description: "Symptom recognition across rural & urban cohorts"
      }
    ]
  }
};

export function HospitalMetricsChart() {
  const [activeMetric, setActiveMetric] = useState<MetricType>("wait_time");
  const [hoveredIndex, setHoveredIndex] = useState<number>(0);

  const currentData = METRICS_DATA[activeMetric];
  const selectedDepartment = currentData.departments[hoveredIndex] || currentData.departments[0];

  return (
    <div className="w-full bg-white border border-[#FDEBD0] rounded-[16px] p-6 sm:p-8 shadow-sm space-y-6 text-left">
      {/* Chart Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#FDEBD0]/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1D2A8F]/10 text-[#1D2A8F] text-xs font-bold mb-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-[#FB923C]" />
            <span>Hospital Operational Telemetry</span>
          </div>
          <h3 className="font-heading font-bold text-lg text-[#374151]">
            {currentData.title}
          </h3>
          <p className="text-xs text-[#374151]/70 mt-0.5 max-w-xl leading-relaxed">
            {currentData.subtitle}
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center gap-1 p-1 bg-[#FDFBF7] border border-[#FDEBD0] rounded-full self-start lg:self-center">
          <button
            type="button"
            onClick={() => {
              setActiveMetric("wait_time");
              setHoveredIndex(0);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMetric === "wait_time"
                ? "bg-[#1D2A8F] text-white shadow-xs"
                : "text-[#374151]/70 hover:text-[#1D2A8F] hover:bg-white"
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Intake Speed</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMetric("accuracy");
              setHoveredIndex(0);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMetric === "accuracy"
                ? "bg-[#1D2A8F] text-white shadow-xs"
                : "text-[#374151]/70 hover:text-[#1D2A8F] hover:bg-white"
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>HPI Completeness</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMetric("language");
              setHoveredIndex(0);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMetric === "language"
                ? "bg-[#1D2A8F] text-white shadow-xs"
                : "text-[#374151]/70 hover:text-[#1D2A8F] hover:bg-white"
            }`}
          >
            <Users className="w-3 h-3" />
            <span>Language Autonomy</span>
          </button>
        </div>
      </div>

      {/* Main Visual: Left Bar Chart & Right Live Department Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left 8 Cols: Custom Structured Bar Chart */}
        <div className="lg:col-span-8 space-y-4">
          {/* Legend */}
          <div className="flex items-center gap-5 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-[3px] bg-[#FDEBD0]" />
              <span className="text-[#374151]/70 font-medium">
                {currentData.benchmarkLabel}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-[3px] bg-[#1D2A8F]" />
              <span className="font-bold text-[#1D2A8F]">
                {currentData.kioskLabel}
              </span>
            </div>
          </div>

          {/* Department Bar Rows */}
          <div className="space-y-2 pt-1">
            {currentData.departments.map((dept, idx) => {
              const isSelected = hoveredIndex === idx;
              const benchmarkPercent = activeMetric === "wait_time"
                ? Math.min(100, Math.max(12, (dept.manualValue / 25) * 100))
                : dept.manualValue;
              const kioskPercent = activeMetric === "wait_time"
                ? Math.min(100, Math.max(12, (dept.kioskValue / 25) * 100))
                : dept.kioskValue;

              return (
                <div
                  key={dept.code}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  className={`p-3 rounded-[10px] border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#FDFBF7] border-[#1D2A8F] shadow-xs ring-1 ring-[#1D2A8F]"
                      : "bg-white border-[#FDEBD0] hover:border-[#1D2A8F]/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#374151]">
                        {dept.department}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[#FDFBF7] text-[#374151]/70 border border-[#FDEBD0]">
                        {dept.code}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                      {dept.improvement}
                    </span>
                  </div>

                  {/* Paired Bars Container */}
                  <div className="space-y-1">
                    {/* Benchmark Bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#374151]/70 w-14 text-right font-medium">
                        Manual
                      </span>
                      <div className="flex-1 bg-[#FDFBF7] rounded-full h-4 overflow-hidden relative">
                        <div
                          className="bg-[#FDEBD0] h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                          style={{ width: `${benchmarkPercent}%` }}
                        >
                          <span className="text-[9px] font-mono text-[#374151] font-semibold">
                            {dept.manualValue} {dept.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* MediKiosk Bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#1D2A8F] w-14 text-right">
                        Intake
                      </span>
                      <div className="flex-1 bg-[#1D2A8F]/10 rounded-full h-5 overflow-hidden relative">
                        <div
                          className="bg-[#1D2A8F] h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2.5"
                          style={{ width: `${kioskPercent}%` }}
                        >
                          <span className="text-[10px] font-bold text-white font-mono">
                            {dept.kioskValue} {dept.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 4 Cols: Active Department Insight Card */}
        <div className="lg:col-span-4 bg-[#FDFBF7] border border-[#FDEBD0] rounded-[12px] p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#FDEBD0]">
              <span className="text-[10px] uppercase font-mono font-bold text-[#1D2A8F]">
                Department Context
              </span>
              <span className="text-[11px] text-[#374151]/70 font-medium">
                {selectedDepartment.patientVolume}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-sm text-[#374151]">
                {selectedDepartment.department}
              </h4>
              <p className="text-xs text-[#374151]/70 mt-1 leading-relaxed">
                {selectedDepartment.description}
              </p>
            </div>

            {/* Impact Metric Box */}
            <div className="p-3.5 rounded-[10px] bg-white border border-[#FDEBD0] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#374151]/70">OPD Throughput Gain:</span>
                <span className="font-bold text-emerald-700">
                  {selectedDepartment.improvement}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-[#FDEBD0]/80">
                <span className="text-[#374151]/70">Manual Baseline:</span>
                <span className="font-mono text-[#374151]">
                  {selectedDepartment.manualValue} {selectedDepartment.unit}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-[#FDEBD0]/80">
                <span className="text-[#374151]/70">MediKiosk Intake:</span>
                <span className="font-mono font-bold text-[#1D2A8F]">
                  {selectedDepartment.kioskValue} {selectedDepartment.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Key Takeaway */}
          <div className="p-3 rounded-[10px] bg-emerald-50 border border-emerald-200 text-xs">
            <div className="flex items-start gap-2 text-emerald-800">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
              <p className="text-[11px] leading-relaxed font-medium">
                Pre-triage data directly hydrates the Doctor Consultation workstation without repeating routine inquiries.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
