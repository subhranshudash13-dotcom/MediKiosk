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
    title: "OPD Triage & Intake Duration",
    subtitle: "Average minutes spent per patient at reception desk vs MediKiosk AI Intake",
    unit: "mins",
    yAxisLabel: "Minutes / Patient",
    benchmarkLabel: "Traditional Manual Desk",
    kioskLabel: "MediKiosk AI Intake",
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
        description: "Instant OPQRST pain characterization + automated ECG red-flag triage"
      },
      {
        department: "Orthopedics",
        code: "ORTHO",
        manualValue: 16.5,
        kioskValue: 2.1,
        unit: "min",
        improvement: "-87.2%",
        patientVolume: "310 pts/day",
        description: "Trauma history, anatomical pain map, and mobility assessment"
      },
      {
        department: "Pediatrics",
        code: "PEDIA",
        manualValue: 18.0,
        kioskValue: 2.5,
        unit: "min",
        improvement: "-86.1%",
        patientVolume: "190 pts/day",
        description: "Guardian proxy voice intake with developmental history prompts"
      },
      {
        department: "Pulmonary & Chest",
        code: "PULMO",
        manualValue: 20.5,
        kioskValue: 2.4,
        unit: "min",
        improvement: "-88.3%",
        patientVolume: "240 pts/day",
        description: "Cough chronology, smoking index, and SpO2 vital integration"
      }
    ]
  },
  accuracy: {
    title: "Pre-Consultation Clinical Completeness",
    subtitle: "Percentage of HPI criteria pre-populated for doctor before consultation begins",
    unit: "%",
    yAxisLabel: "Completeness %",
    benchmarkLabel: "Paper OPD Slip",
    kioskLabel: "MediKiosk Structured HPI",
    departments: [
      {
        department: "General Medicine",
        code: "GEN-MED",
        manualValue: 34.0,
        kioskValue: 98.2,
        unit: "%",
        improvement: "+188%",
        patientVolume: "420 pts/day",
        description: "Standardized 8-factor SOCRATES coverage + past Rx linkage"
      },
      {
        department: "Cardiology OPD",
        code: "CARDIO",
        manualValue: 42.0,
        kioskValue: 99.1,
        unit: "%",
        improvement: "+136%",
        patientVolume: "260 pts/day",
        description: "Radiation, onset character, and cardiac risk score captured"
      },
      {
        department: "Orthopedics",
        code: "ORTHO",
        manualValue: 38.0,
        kioskValue: 95.8,
        unit: "%",
        improvement: "+152%",
        patientVolume: "310 pts/day",
        description: "Joint radiation, trauma timeline, and visual body localization"
      },
      {
        department: "Pediatrics",
        code: "PEDIA",
        manualValue: 45.0,
        kioskValue: 96.4,
        unit: "%",
        improvement: "+114%",
        patientVolume: "190 pts/day",
        description: "Immunization history and pediatric symptom evolution"
      },
      {
        department: "Pulmonary & Chest",
        code: "PULMO",
        manualValue: 36.0,
        kioskValue: 97.5,
        unit: "%",
        improvement: "+171%",
        patientVolume: "240 pts/day",
        description: "Sputum type, nocturnal exacerbation, and allergen triggers"
      }
    ]
  },
  language: {
    title: "Indian Language Patient Autonomy",
    subtitle: "Self-service completion rate without requiring hospital staff intervention",
    unit: "%",
    yAxisLabel: "Autonomy Rate %",
    benchmarkLabel: "English/Hindi Paper Forms",
    kioskLabel: "MediKiosk Bhashini Voice AI",
    departments: [
      {
        department: "Hindi (हिंदी)",
        code: "HI-IN",
        manualValue: 52.0,
        kioskValue: 97.8,
        unit: "%",
        improvement: "+88.1%",
        patientVolume: "650 pts/day",
        description: "Dialect-aware ASR supporting colloquial medical terms"
      },
      {
        department: "Telugu (తెలుగు)",
        code: "TE-IN",
        manualValue: 31.0,
        kioskValue: 96.4,
        unit: "%",
        improvement: "+210%",
        patientVolume: "380 pts/day",
        description: "Native phonetic grammar with medical terminology mapping"
      },
      {
        department: "Tamil (தமிழ்)",
        code: "TA-IN",
        manualValue: 28.0,
        kioskValue: 95.9,
        unit: "%",
        improvement: "+242%",
        patientVolume: "310 pts/day",
        description: "Voice-first intake eliminating complex written hospital forms"
      },
      {
        department: "Bengali (বাংলা)",
        code: "BN-IN",
        manualValue: 33.0,
        kioskValue: 96.1,
        unit: "%",
        improvement: "+191%",
        patientVolume: "290 pts/day",
        description: "Natural conversational flow adapted for senior rural patients"
      },
      {
        department: "Marathi (मराठी)",
        code: "MR-IN",
        manualValue: 36.0,
        kioskValue: 97.2,
        unit: "%",
        improvement: "+170%",
        patientVolume: "270 pts/day",
        description: "Seamless AYUSH + Allopathic symptom recognition"
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
    <div className="w-full bg-white border border-[#E7E4DD] rounded-3xl p-6 sm:p-8 shadow-xs">
      {/* Chart Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#F2F0EB]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEEAFE] border border-[#7C6EF7]/20 text-[#7C6EF7] text-xs font-bold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Clinical Impact &amp; Hospital Efficiency Benchmark</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#111111]">
            {currentData.title}
          </h3>
          <p className="text-xs text-[#5F5E5A] mt-1 max-w-xl">
            {currentData.subtitle}
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAFAFC] border border-[#E7E4DD] rounded-2xl self-start lg:self-center">
          <button
            type="button"
            onClick={() => {
              setActiveMetric("wait_time");
              setHoveredIndex(0);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMetric === "wait_time"
                ? "bg-[#7C6EF7] text-white shadow-xs"
                : "text-[#5F5E5A] hover:text-[#111111] hover:bg-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Intake Speed</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMetric("accuracy");
              setHoveredIndex(0);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMetric === "accuracy"
                ? "bg-[#7C6EF7] text-white shadow-xs"
                : "text-[#5F5E5A] hover:text-[#111111] hover:bg-white"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>HPI Completeness</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMetric("language");
              setHoveredIndex(0);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMetric === "language"
                ? "bg-[#7C6EF7] text-white shadow-xs"
                : "text-[#5F5E5A] hover:text-[#111111] hover:bg-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Language Autonomy</span>
          </button>
        </div>
      </div>

      {/* Main Visual: Left Bar Chart & Right Live Department Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 items-center">
        {/* Left 8 Cols: Custom Structured Bar Chart */}
        <div className="lg:col-span-8 space-y-5">
          {/* Legend */}
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#D1CFC7] border border-[#8A8A8A]" />
              <span className="font-semibold text-[#5F5E5A]">
                {currentData.benchmarkLabel}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#7C6EF7]" />
              <span className="font-extrabold text-[#111111]">
                {currentData.kioskLabel}
              </span>
            </div>
          </div>

          {/* Department Bar Rows */}
          <div className="space-y-4 pt-2">
            {currentData.departments.map((dept, idx) => {
              const isSelected = hoveredIndex === idx;
              // Calculate percentage widths for horizontal comparison bars
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
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#FAFAFC] border-[#7C6EF7] shadow-xs"
                      : "bg-white border-[#E7E4DD] hover:border-[#7C6EF7]/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#111111]">
                        {dept.department}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F2F0EB] text-[#5F5E5A] font-bold">
                        {dept.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#12B981] px-2 py-0.5 rounded-md bg-[#DCFCE7]">
                        {dept.improvement}
                      </span>
                    </div>
                  </div>

                  {/* Paired Bars Container */}
                  <div className="space-y-1.5">
                    {/* Benchmark Bar */}
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold text-[#8A8A8A] w-16 text-right">
                        Legacy
                      </span>
                      <div className="flex-1 bg-[#F2F0EB] rounded-md h-5 overflow-hidden relative">
                        <div
                          className="bg-[#D1CFC7] h-full rounded-md transition-all duration-500 flex items-center justify-end pr-2"
                          style={{ width: `${benchmarkPercent}%` }}
                        >
                          <span className="text-[10px] font-bold text-[#111111] font-mono">
                            {dept.manualValue} {dept.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* MediKiosk Bar */}
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-extrabold text-[#7C6EF7] w-16 text-right">
                        MediKiosk
                      </span>
                      <div className="flex-1 bg-[#EEEAFE] rounded-md h-6 overflow-hidden relative">
                        <div
                          className="bg-[#7C6EF7] h-full rounded-md transition-all duration-500 flex items-center justify-end pr-2.5 shadow-xs"
                          style={{ width: `${kioskPercent}%` }}
                        >
                          <span className="text-[11px] font-extrabold text-white font-mono">
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
        <div className="lg:col-span-4 bg-[#FAFAFC] border border-[#E7E4DD] rounded-3xl p-6 flex flex-col justify-between h-full space-y-6">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E4DD]">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#7C6EF7]">
                Department Telemetry
              </span>
              <span className="text-xs font-bold text-[#5F5E5A]">
                {selectedDepartment.patientVolume}
              </span>
            </div>

            <div className="mt-4">
              <h4 className="text-lg font-extrabold text-[#111111]">
                {selectedDepartment.department}
              </h4>
              <p className="text-xs text-[#5F5E5A] mt-2 leading-relaxed">
                {selectedDepartment.description}
              </p>
            </div>

            {/* Impact Metric Box */}
            <div className="mt-6 p-4 rounded-2xl bg-white border border-[#E7E4DD] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5F5E5A]">Net Efficiency Gain:</span>
                <span className="font-extrabold text-base text-[#12B981]">
                  {selectedDepartment.improvement}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#F2F0EB]">
                <span className="text-[#5F5E5A]">Manual Baseline:</span>
                <span className="font-mono font-bold text-[#111111]">
                  {selectedDepartment.manualValue} {selectedDepartment.unit}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#F2F0EB]">
                <span className="text-[#5F5E5A]">MediKiosk AI Record:</span>
                <span className="font-mono font-extrabold text-[#7C6EF7]">
                  {selectedDepartment.kioskValue} {selectedDepartment.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Key Takeaway */}
          <div className="p-3.5 rounded-2xl bg-[#EEEAFE] border border-[#7C6EF7]/20 text-xs">
            <div className="flex items-start gap-2 text-[#7C6EF7]">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#111111] leading-relaxed">
                Pre-triage data directly hydrates the Doctor Consultation workstation without repeating routine inquiries.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
