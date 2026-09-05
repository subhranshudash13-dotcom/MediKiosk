"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Stethoscope,
  ArrowRight,
  Clock,
  User,
  CheckCircle2,
  Sparkles
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
    triageColor: "text-[#C2410C]",
    triageBadgeBg: "bg-red-50 text-[#C2410C] border border-red-200",
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
    icd10: "I20.0 (Unstable Angina / Suspected ACS)",
    redFlagWarning: "High probability of Acute Myocardial Infarction. Stat 12-lead ECG and Troponin-I ordered.",
    doctorRecommendation: "Direct to Emergency Resuscitation Bay (Bed 02). Cardiology Code Alert triggered."
  },
  {
    id: "case-fever",
    patientName: "Sunita Verma",
    ageGender: "32 Y / Female",
    chiefComplaint: "High Fever, Chills & Severe Retro-Orbital Pain",
    transcript: "3 din se bohot tez bukhar hai, aankhon ke peeche dard ho raha hai aur sar dard itna hai ki aankh kholne par bhi dukh raha hai.",
    triagePriority: "URGENT",
    triageColor: "text-[#FB923C]",
    triageBadgeBg: "bg-amber-50 text-amber-800 border border-amber-200",
    painScore: 7,
    socrates: {
      site: "Frontal / Retro-orbital & Generalized body",
      onset: "3 days duration, sudden onset with rigors",
      character: "Severe throbbing headache & intense myalgia",
      radiation: "Non-radiating, localized to forehead and eyes",
      associated: "Chills, bitter taste, vomiting tendency, severe fatigue",
      timeCourse: "Spiking fever in evenings up to 103°F",
      exacerbating: "Bright light exposure (photophobia)",
      severity: "Moderate-to-Severe 7/10 (Urgent Care)"
    },
    icd10: "A90 (Dengue Fever / Acute Febrile Illness)",
    redFlagWarning: "Thrombocytopenia warning: CBC and Dengue NS1 / IgM ordered to rule out hemorrhagic manifestation.",
    doctorRecommendation: "Route to Fever Clinic (Room 04). Stat CBC with differential count and IV hydration."
  },
  {
    id: "case-neuro",
    patientName: "Deepak Patel",
    ageGender: "44 Y / Male",
    chiefComplaint: "Persistent Unilateral Throbbing Headache with Aura",
    transcript: "Kal subah se right side sar mein tez pulsating dard hai. Roshni aur aawaaz se dard badhta hai aur ulti jaisi feeling aa rahi hai.",
    triagePriority: "ROUTINE",
    triageColor: "text-emerald-700",
    triageBadgeBg: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    painScore: 6,
    socrates: {
      site: "Right hemicranial / Temporoparietal",
      onset: "Yesterday morning (~30 hours duration)",
      character: "Pulsating, throbbing vascular pattern",
      radiation: "Radiating to right occiput and neck muscles",
      associated: "Visual shimmering aura, photophobia, phonophobia",
      timeCourse: "Episodic, lasting 24-48 hours",
      exacerbating: "Physical activity, bright light, loud sound",
      severity: "Moderate 6/10 (Routine OPD)"
    },
    icd10: "G43.109 (Migraine with Aura, Not Intractable)",
    doctorRecommendation: "Route to Neurology OPD (Room 18). Triptan therapy evaluation & lifestyle review."
  }
];

export function LiveTriageSimulator() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>("case-cardio");
  const currentCase = CLINICAL_CASES.find((c) => c.id === selectedCaseId) || CLINICAL_CASES[0];

  return (
    <div className="bg-white border border-[#FDEBD0] rounded-[16px] p-6 sm:p-8 shadow-sm space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#FDEBD0]/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#FB923C]" />
            <span className="text-[11px] font-mono font-bold text-[#1D2A8F] uppercase tracking-wider">
              Interactive Triage Simulator
            </span>
          </div>
          <h3 className="font-heading font-bold text-lg text-[#374151]">
            Real-Time SOCRATES Clinical Extraction
          </h3>
        </div>
        <span className="text-xs text-[#374151]/70 font-medium">
          Select a patient scenario to see AI parsing in action
        </span>
      </div>

      {/* Case Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CLINICAL_CASES.map((c) => {
          const isSelected = c.id === selectedCaseId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCaseId(c.id)}
              className={`p-4 rounded-[12px] border text-left transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#FDFBF7] border-[#1D2A8F] shadow-xs ring-1 ring-[#1D2A8F]"
                  : "bg-white border-[#FDEBD0] hover:border-[#1D2A8F]/40 hover:bg-[#FDFBF7]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#374151] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#1D2A8F]" />
                  {c.patientName}
                </span>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${c.triageBadgeBg}`}>
                  {c.triagePriority}
                </span>
              </div>
              <p className="text-[11px] text-[#374151]/80 line-clamp-2 leading-relaxed">
                {c.chiefComplaint}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Clinical Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Vernacular Audio & Transcript Box (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-[12px] bg-[#FDFBF7] border border-[#FDEBD0] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#FDEBD0]/80">
            <span className="text-[10px] font-mono font-bold text-[#1D2A8F] uppercase">
              Spoken Vernacular Input
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white border border-[#FDEBD0] text-[#374151]">
              Hindi (hi-IN)
            </span>
          </div>

          <div className="p-4 rounded-[8px] bg-white border border-[#FDEBD0]">
            <p className="text-xs font-medium text-[#374151] italic leading-relaxed">
              "{currentCase.transcript}"
            </p>
          </div>

          {currentCase.redFlagWarning && (
            <div className="p-3.5 rounded-[8px] bg-red-50/70 border border-red-200 text-[#374151] space-y-1">
              <span className="font-bold text-[#C2410C] text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Red-Flag Clinical Warning
              </span>
              <p className="text-[11px] text-[#374151]/80 leading-relaxed">
                {currentCase.redFlagWarning}
              </p>
            </div>
          )}

          <div className="p-3 rounded-[8px] bg-white border border-[#FDEBD0] flex items-center justify-between text-xs">
            <span className="text-[#374151]/70 font-medium">Mapped ICD-10 Coding:</span>
            <span className="font-mono font-bold text-[#1D2A8F]">{currentCase.icd10}</span>
          </div>
        </div>

        {/* Right: SOCRATES 8-Factor Matrix (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#FDEBD0] rounded-[12px] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#FDEBD0]/80">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#1D2A8F]" />
              <h4 className="font-heading font-bold text-xs text-[#374151] uppercase tracking-wider">
                Extracted 8-Factor SOCRATES Matrix
              </h4>
            </div>
            <span className="text-xs font-mono font-extrabold text-[#C2410C]">
              Pain Severity: {currentCase.painScore} / 10
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 rounded-[6px] bg-[#FDFBF7] border border-[#FDEBD0]">
              <span className="text-[9px] font-mono font-semibold text-[#374151]/70 uppercase block mb-0.5">Site</span>
              <span className="font-medium text-[#374151]">{currentCase.socrates.site}</span>
            </div>
            <div className="p-2.5 rounded-[6px] bg-[#FDFBF7] border border-[#FDEBD0]">
              <span className="text-[9px] font-mono font-semibold text-[#374151]/70 uppercase block mb-0.5">Onset</span>
              <span className="font-medium text-[#374151]">{currentCase.socrates.onset}</span>
            </div>
            <div className="p-2.5 rounded-[6px] bg-[#FDFBF7] border border-[#FDEBD0]">
              <span className="text-[9px] font-mono font-semibold text-[#374151]/70 uppercase block mb-0.5">Character</span>
              <span className="font-medium text-[#374151]">{currentCase.socrates.character}</span>
            </div>
            <div className="p-2.5 rounded-[6px] bg-[#FDFBF7] border border-[#FDEBD0]">
              <span className="text-[9px] font-mono font-semibold text-[#374151]/70 uppercase block mb-0.5">Radiation</span>
              <span className="font-medium text-[#374151]">{currentCase.socrates.radiation}</span>
            </div>
            <div className="p-2.5 rounded-[6px] bg-[#FDFBF7] border border-[#FDEBD0]">
              <span className="text-[9px] font-mono font-semibold text-[#374151]/70 uppercase block mb-0.5">Associated</span>
              <span className="font-medium text-[#374151]">{currentCase.socrates.associated}</span>
            </div>
            <div className="p-2.5 rounded-[6px] bg-[#FDFBF7] border border-[#FDEBD0]">
              <span className="text-[9px] font-mono font-semibold text-[#374151]/70 uppercase block mb-0.5">Time Course</span>
              <span className="font-medium text-[#374151]">{currentCase.socrates.timeCourse}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-[8px] bg-[#FDFBF7] border border-[#FDEBD0] space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#1D2A8F] uppercase block">
              Physician Disposition Order
            </span>
            <p className="text-xs font-medium text-[#374151]">
              {currentCase.doctorRecommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
