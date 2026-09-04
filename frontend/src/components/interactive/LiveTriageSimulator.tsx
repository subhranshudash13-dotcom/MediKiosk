"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  ArrowRight,
  Sparkles,
  FileText,
  Clock,
  ShieldCheck,
  User,
  HeartPulse
} from "lucide-react";

interface CaseScenario {
  id: string;
  patientName: string;
  ageGender: string;
  chiefComplaint: string;
  transcript: string;
  triagePriority: "EMERGENCY" | "URGENT" | "ROUTINE";
  triageColor: string;
  triageBadgeBg: string;
  painScore: number;
  socrates: {
    site: string;
    onset: string;
    character: string;
    radiation: string;
    associated: string;
    timeCourse: string;
    exacerbating: string;
    severity: string;
  };
  icd10: string;
  redFlagWarning?: string;
  doctorRecommendation: string;
}

const CLINICAL_CASES: CaseScenario[] = [
  {
    id: "case-cardio",
    patientName: "Ramesh Sharma",
    ageGender: "58 Y / Male",
    chiefComplaint: "Acute Retrosternal Chest Heaviness & Diaphoresis",
    transcript: "Mujhe 45 minute se seene mein bohot bhari dard ho raha hai, left baazu aur gale tak jaa raha hai. Saans lene mein takleef aur paseena aa raha hai.",
    triagePriority: "EMERGENCY",
    triageColor: "text-[#EF4444]",
    triageBadgeBg: "bg-[#FEE2E2]",
    painScore: 9,
    socrates: {
      site: "Retrosternal / Precordial chest",
      onset: "45 minutes ago, sudden while resting",
      character: "Crushing, heavy pressure (9/10)",
      radiation: "Radiating to left shoulder, inner arm & jaw",
      associated: "Profuse diaphoresis (sweating), dyspnea, nausea",
      timeCourse: "Progressive, continuous for 45 mins",
      exacerbating: "Minimal physical exertion",
      severity: "Severe 9/10 (Emergency Priority)"
    },
    icd10: "I21.9 - Acute Coronary Syndrome (Suspected STEMI / NSTEMI)",
    redFlagWarning: "High-risk ACS presentation. Immediate 12-lead ECG, troponin check, and cardiology triage escalation required within 10 minutes.",
    doctorRecommendation: "Stat ECG + Sublingual Nitroglycerin + Aspirin 300mg loading dose per hospital ACS protocol."
  },
  {
    id: "case-abdo",
    patientName: "Anjali Verma",
    ageGender: "34 Y / Female",
    chiefComplaint: "Right Lower Quadrant Abdominal Pain & Low-Grade Fever",
    transcript: "Kal shaam se pet ke daayein niche hisse mein tez dard hai. Ulti jaisa lag raha hai aur halka bukhar bhi hai. Chalne mein dard badhta hai.",
    triagePriority: "URGENT",
    triageColor: "text-[#F59E0B]",
    triageBadgeBg: "bg-[#FEF3C7]",
    painScore: 7,
    socrates: {
      site: "Right Lower Quadrant (McBurney's Point)",
      onset: "Yesterday evening (~18 hours duration)",
      character: "Constant, sharp, stabbing pain",
      radiation: "Started periumbilical, migrated to right iliac fossa",
      associated: "Nausea, low-grade fever (100.2°F), anorexia",
      timeCourse: "Steadily intensifying",
      exacerbating: "Walking, coughing, deep palpation",
      severity: "Moderate-to-Severe 7/10"
    },
    icd10: "K35.80 - Acute Appendicitis (Unspecified)",
    redFlagWarning: "Migratory RLQ pain with peritoneal irritation signs. Surgical consult & ultrasound abdomen advised.",
    doctorRecommendation: "NPO status, complete blood count (leukocytosis check), USG abdomen & pelvis, and general surgery evaluation."
  },
  {
    id: "case-diab",
    patientName: "Gopal Krishna",
    ageGender: "62 Y / Male",
    chiefComplaint: "Uncontrolled Blood Sugar Fluctuations & Diabetic Peripheral Neuropathy",
    transcript: "Do hafton se sugar 220 se upar aa rahi hai. Pyaas bohot lagti hai aur dono pairo ke talwo mein jalan aur sunnpan rehta hai.",
    triagePriority: "ROUTINE",
    triageColor: "text-[#12B981]",
    triageBadgeBg: "bg-[#DCFCE7]",
    painScore: 4,
    socrates: {
      site: "Bilateral feet (stocking distribution)",
      onset: "Gradual progression over past 2-3 months",
      character: "Burning dysesthesia with numbness",
      radiation: "Distal extremities (toes to mid-calf)",
      associated: "Polyuria, polydipsia, fasting glucose > 220 mg/dL",
      timeCourse: "Chronic, worse at nighttime",
      exacerbating: "Prolonged standing",
      severity: "Mild-to-Moderate 4/10"
    },
    icd10: "E11.40 - Type 2 Diabetes Mellitus with Diabetic Neuropathy",
    doctorRecommendation: "HbA1c test, fasting/postprandial glucose profile, monofilament foot sensory test, and adjustment of oral hypoglycemic agents."
  }
];

export function LiveTriageSimulator() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>("case-cardio");

  const activeCase =
    CLINICAL_CASES.find((c) => c.id === selectedCaseId) || CLINICAL_CASES[0];

  return (
    <div className="w-full bg-white border border-[#E7E4DD] rounded-3xl p-6 sm:p-8 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F2F0EB]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEEAFE] border border-[#7C6EF7]/20 text-[#7C6EF7] text-xs font-bold mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Real-Time Clinical Extraction Engine</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#111111]">
            Live Triage &amp; SOCRATES Simulation Sandbox
          </h3>
          <p className="text-xs text-[#5F5E5A] mt-1">
            Test how conversational patient input in Indian languages is instantly structured into high-fidelity medical telemetry.
          </p>
        </div>

        {/* Case Selector Pills */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs font-bold text-[#5F5E5A] hidden md:inline">
            Try Case:
          </span>
          {CLINICAL_CASES.map((c) => {
            const isSelected = c.id === selectedCaseId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCaseId(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#7C6EF7] text-white shadow-xs"
                    : "bg-[#FAFAFC] text-[#5F5E5A] border border-[#E7E4DD] hover:border-[#7C6EF7]"
                }`}
              >
                {c.triagePriority === "EMERGENCY" && "🚨 "}
                {c.patientName.split(" ")[0]} ({c.ageGender.split("/")[0].trim()})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Simulated Voice Input & Right Live Extracted HPI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left 5 Cols: Patient Voice Input & Demographic Card */}
        <div className="lg:col-span-5 space-y-4">
          {/* Patient Profile Bar */}
          <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E7E4DD] flex items-center justify-center text-[#7C6EF7]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#111111]">
                  {activeCase.patientName}
                </h4>
                <span className="text-xs text-[#5F5E5A]">{activeCase.ageGender}</span>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold ${activeCase.triageBadgeBg} ${activeCase.triageColor}`}>
              {activeCase.triagePriority} TRIAGE
            </span>
          </div>

          {/* Voice Input Transcript */}
          <div className="p-5 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD] space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-[#7C6EF7] block">
              Live Conversational ASR Input (Hindi/Hinglish):
            </span>
            <p className="text-xs font-semibold text-[#111111] italic leading-relaxed bg-white p-3.5 rounded-xl border border-[#E7E4DD]">
              "{activeCase.transcript}"
            </p>
          </div>

          {/* Red Flag Alert if Emergency */}
          {activeCase.redFlagWarning && (
            <div className="p-4 rounded-2xl bg-[#FEE2E2] border border-[#EF4444]/30 text-xs text-[#111111] space-y-1">
              <div className="flex items-center gap-1.5 text-[#EF4444] font-extrabold">
                <AlertTriangle className="w-4 h-4" />
                <span>Immediate Clinical Action Flag</span>
              </div>
              <p className="text-[11px] text-[#5F5E5A] leading-relaxed">
                {activeCase.redFlagWarning}
              </p>
            </div>
          )}

          {/* Action CTA to open workstation */}
          <Link
            href="/doctor"
            className="w-full py-3 rounded-2xl bg-[#7C6EF7] hover:bg-[#6758F0] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Open in Doctor Workstation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Right 7 Cols: Structured 8-Factor SOCRATES HPI Telemetry */}
        <div className="lg:col-span-7 bg-[#FAFAFC] border border-[#E7E4DD] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E4DD]">
            <div>
              <span className="text-[10px] font-mono font-extrabold text-[#7C6EF7] uppercase tracking-wider block">
                Structured Clinical Entity Mapping
              </span>
              <h4 className="font-extrabold text-sm text-[#111111]">
                SOCRATES Protocol Telemetry
              </h4>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-white border border-[#E7E4DD] text-[#111111]">
              <Clock className="w-3.5 h-3.5 text-[#7C6EF7]" />
              <span>Extracted in 420ms</span>
            </div>
          </div>

          {/* SOCRATES Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-white border border-[#E7E4DD]">
              <span className="text-[10px] font-bold text-[#8A8A8A] block uppercase">
                Site &amp; Anatomical Location
              </span>
              <p className="font-extrabold text-[#111111] mt-0.5">{activeCase.socrates.site}</p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#E7E4DD]">
              <span className="text-[10px] font-bold text-[#8A8A8A] block uppercase">
                Onset &amp; Chronology
              </span>
              <p className="font-bold text-[#111111] mt-0.5">{activeCase.socrates.onset}</p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#E7E4DD]">
              <span className="text-[10px] font-bold text-[#8A8A8A] block uppercase">
                Character &amp; Intensity
              </span>
              <p className="font-bold text-[#111111] mt-0.5">{activeCase.socrates.character}</p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#E7E4DD]">
              <span className="text-[10px] font-bold text-[#8A8A8A] block uppercase">
                Radiation Pattern
              </span>
              <p className="font-bold text-[#111111] mt-0.5">{activeCase.socrates.radiation}</p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#E7E4DD] sm:col-span-2">
              <span className="text-[10px] font-bold text-[#8A8A8A] block uppercase">
                Associated Secondary Symptoms
              </span>
              <p className="font-bold text-[#111111] mt-0.5">{activeCase.socrates.associated}</p>
            </div>
          </div>

          {/* Suggested Diagnosis & Protocol Box */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E7E4DD] space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#8A8A8A] uppercase">
                SNOMED CT / ICD-10 Differential Prompt:
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EEEAFE] text-[#7C6EF7] font-extrabold">
                {activeCase.icd10.split("-")[0].trim()}
              </span>
            </div>
            <p className="font-bold text-[#111111]">{activeCase.icd10}</p>
            <div className="pt-2 border-t border-[#F2F0EB] text-[11px] text-[#5F5E5A]">
              <strong>Doctor Action Plan:</strong> {activeCase.doctorRecommendation}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
