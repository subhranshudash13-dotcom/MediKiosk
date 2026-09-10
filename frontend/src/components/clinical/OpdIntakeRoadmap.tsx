"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mic,
  FileScan,
  Stethoscope,
  ShieldCheck,
  Check,
  Sparkles,
  Navigation
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StageData {
  id: string;
  stepNumber: string;
  title: string;
  description: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  lightBg: string;
  borderColor: string;
}

const STAGES: StageData[] = [
  {
    id: "stage-1",
    stepNumber: "01",
    title: "Vernacular Patient Triage",
    description: "Patients speak naturally in 12+ Indic languages. AI extracts symptoms & pain metrics into structured clinical dimensions.",
    tag: "Indic Dialect ASR",
    icon: Mic,
    color: "#0056B3",
    lightBg: "#EBF3FC",
    borderColor: "#0056B3",
  },
  {
    id: "stage-2",
    stepNumber: "02",
    title: "Prescription Vision OCR",
    description: "Scans paper prescriptions and lab slips. Extracts active medications, dosages, and abnormal lab flags in seconds.",
    tag: "Active Drug Reconciliation",
    icon: FileScan,
    color: "#0891B2",
    lightBg: "#ECFEFF",
    borderColor: "#0891B2",
  },
  {
    id: "stage-3",
    stepNumber: "03",
    title: "Doctor OPD Cockpit",
    description: "Attending clinicians receive a pre-populated 1-page clinical summary, eliminating repetitive manual typing.",
    tag: "30-Sec EMR Briefing",
    icon: Stethoscope,
    color: "#4F46E5",
    lightBg: "#EEF2FF",
    borderColor: "#4F46E5",
  },
  {
    id: "stage-4",
    stepNumber: "04",
    title: "ABHA & FHIR R4 Record",
    description: "Standardizes clinical data into HL7 FHIR R4 bundles and syncs to patient's ABHA health record with DPDP consent.",
    tag: "Interoperable ABDM Grid",
    icon: ShieldCheck,
    color: "#16A34A",
    lightBg: "#F0FDF4",
    borderColor: "#16A34A",
  },
];

export function OpdIntakeRoadmap() {
  const [activeStage, setActiveStage] = useState<string | null>(null);

  return (
    <div className="w-full text-left select-none py-1">
      {/* ========================================================================= */}
      {/* DESKTOP COMPACT WINDING ROADMAP (Single-Fold Unified Height ~380px) */}
      {/* ========================================================================= */}
      <div className="hidden lg:block relative w-full px-2 py-2">
        
        {/* TOP ROW: STAGE 02 & STAGE 04 CARDS */}
        <div className="grid grid-cols-4 gap-4 mb-2">
          {/* Col 1: Empty slot above Stage 1 */}
          <div className="h-[142px]" />

          {/* Col 2: Stage 02 Card (Prescription Vision OCR) */}
          <div
            className="h-[142px] flex flex-col justify-end"
            onMouseEnter={() => setActiveStage("stage-2")}
            onMouseLeave={() => setActiveStage(null)}
          >
            <div
              className={cn(
                "p-4 rounded-xl bg-white border transition-all duration-200 flex flex-col justify-between h-full shadow-xs cursor-pointer",
                activeStage === "stage-2"
                  ? "border-[#0891B2] ring-2 ring-[#0891B2]/15 shadow-md -translate-y-0.5"
                  : "border-[#E2E8F0] hover:border-[#0891B2]"
              )}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#ECFEFF] text-[#0891B2] border border-[#A5F3FC]">
                    STAGE 02
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-[#ECFEFF] text-[#0891B2] flex items-center justify-center">
                    <FileScan className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h4 className="font-heading font-bold text-sm text-[#1E293B] leading-tight">
                  {STAGES[1].title}
                </h4>
                <p className="text-[11px] text-[#64748B] leading-snug line-clamp-2">
                  {STAGES[1].description}
                </p>
              </div>
              <div className="pt-2 border-t border-[#F1F5F9] text-[10px] font-mono font-bold text-[#0891B2] flex items-center gap-1">
                <Check className="w-3 h-3 text-[#16A34A] shrink-0" /> {STAGES[1].tag}
              </div>
            </div>
          </div>

          {/* Col 3: Empty slot above Stage 3 */}
          <div className="h-[142px]" />

          {/* Col 4: Stage 04 Card (ABHA & FHIR R4 Record) */}
          <div
            className="h-[142px] flex flex-col justify-end"
            onMouseEnter={() => setActiveStage("stage-4")}
            onMouseLeave={() => setActiveStage(null)}
          >
            <div
              className={cn(
                "p-4 rounded-xl bg-white border transition-all duration-200 flex flex-col justify-between h-full shadow-xs cursor-pointer",
                activeStage === "stage-4"
                  ? "border-[#16A34A] ring-2 ring-[#16A34A]/15 shadow-md -translate-y-0.5"
                  : "border-[#E2E8F0] hover:border-[#16A34A]"
              )}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
                    STAGE 04
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h4 className="font-heading font-bold text-sm text-[#1E293B] leading-tight">
                  {STAGES[3].title}
                </h4>
                <p className="text-[11px] text-[#64748B] leading-snug line-clamp-2">
                  {STAGES[3].description}
                </p>
              </div>
              <div className="pt-2 border-t border-[#F1F5F9] text-[10px] font-mono font-bold text-[#16A34A] flex items-center gap-1">
                <Check className="w-3 h-3 text-[#16A34A] shrink-0" /> {STAGES[3].tag}
              </div>
            </div>
          </div>
        </div>

        {/* ROADMAP SVG TRACK (Refined Asphalt Highway Conduit) */}
        <div className="relative w-full h-[100px]">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 1200 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="roadBedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="35%" stopColor="#334155" />
                <stop offset="65%" stopColor="#334155" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>

              {/* Road Shoulder / Outer Glow */}
              <filter id="roadGlow" x="-5%" y="-20%" width="110%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.2" />
              </filter>
            </defs>

            {/* Connecting Guide Lines to Cards */}
            {/* Stage 1 connector (down to card @ x=150) */}
            <line
              x1="150"
              y1="75"
              x2="150"
              y2="100"
              stroke="#0056B3"
              strokeWidth="2"
              strokeDasharray="3 3"
              opacity={activeStage === "stage-1" ? 1 : 0.45}
            />
            {/* Stage 2 connector (up to card @ x=450) */}
            <line
              x1="450"
              y1="25"
              x2="450"
              y2="0"
              stroke="#0891B2"
              strokeWidth="2"
              strokeDasharray="3 3"
              opacity={activeStage === "stage-2" ? 1 : 0.45}
            />
            {/* Stage 3 connector (down to card @ x=750) */}
            <line
              x1="750"
              y1="75"
              x2="750"
              y2="100"
              stroke="#4F46E5"
              strokeWidth="2"
              strokeDasharray="3 3"
              opacity={activeStage === "stage-3" ? 1 : 0.45}
            />
            {/* Stage 4 connector (up to card @ x=1050) */}
            <line
              x1="1050"
              y1="25"
              x2="1050"
              y2="0"
              stroke="#16A34A"
              strokeWidth="2"
              strokeDasharray="3 3"
              opacity={activeStage === "stage-4" ? 1 : 0.45}
            />

            {/* Road Outer Edge Border */}
            <path
              d="M 15 50 
                 L 60 50 
                 C 95 50 115 75 150 75 
                 C 190 75 220 25 320 25 
                 L 450 25 
                 C 530 25 560 75 630 75 
                 L 750 75 
                 C 830 75 860 25 930 25 
                 L 1050 25 
                 C 1100 25 1120 50 1150 50 
                 L 1175 50"
              stroke="#0F172A"
              strokeWidth="32"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#roadGlow)"
            />

            {/* Main Asphalt Bed */}
            <path
              d="M 15 50 
                 L 60 50 
                 C 95 50 115 75 150 75 
                 C 190 75 220 25 320 25 
                 L 450 25 
                 C 530 25 560 75 630 75 
                 L 750 75 
                 C 830 75 860 25 930 25 
                 L 1050 25 
                 C 1100 25 1120 50 1150 50 
                 L 1175 50"
              stroke="url(#roadBedGrad)"
              strokeWidth="28"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dashed Centerline Road Markings */}
            <path
              d="M 20 50 
                 L 60 50 
                 C 95 50 115 75 150 75 
                 C 190 75 220 25 320 25 
                 L 450 25 
                 C 530 25 560 75 630 75 
                 L 750 75 
                 C 830 75 860 25 930 25 
                 L 1050 25 
                 C 1100 25 1120 50 1150 50 
                 L 1170 50"
              stroke="#F8FAFC"
              strokeWidth="2.5"
              strokeDasharray="8 6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />

            {/* Destination Road Arrow Tip */}
            <polygon
              points="1170,36 1198,50 1170,64"
              fill="#0F172A"
            />
            <polygon
              points="1172,39 1193,50 1172,61"
              fill="#334155"
            />

            {/* MILESTONE WAYPOINT PINS ON THE ROAD BED */}

            {/* Waypoint 1 (Stage 1 @ x: 150, y: 75) */}
            <g
              className="cursor-pointer transition-transform duration-200"
              onMouseEnter={() => setActiveStage("stage-1")}
              onMouseLeave={() => setActiveStage(null)}
            >
              <circle
                cx="150"
                cy="75"
                r={activeStage === "stage-1" ? "14" : "12"}
                fill="#0056B3"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                className="transition-all duration-200"
              />
              <text
                x="150"
                y="79"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
              >
                01
              </text>
            </g>

            {/* Waypoint 2 (Stage 2 @ x: 450, y: 25) */}
            <g
              className="cursor-pointer transition-transform duration-200"
              onMouseEnter={() => setActiveStage("stage-2")}
              onMouseLeave={() => setActiveStage(null)}
            >
              <circle
                cx="450"
                cy="25"
                r={activeStage === "stage-2" ? "14" : "12"}
                fill="#0891B2"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                className="transition-all duration-200"
              />
              <text
                x="450"
                y="29"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
              >
                02
              </text>
            </g>

            {/* Waypoint 3 (Stage 3 @ x: 750, y: 75) */}
            <g
              className="cursor-pointer transition-transform duration-200"
              onMouseEnter={() => setActiveStage("stage-3")}
              onMouseLeave={() => setActiveStage(null)}
            >
              <circle
                cx="750"
                cy="75"
                r={activeStage === "stage-3" ? "14" : "12"}
                fill="#4F46E5"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                className="transition-all duration-200"
              />
              <text
                x="750"
                y="79"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
              >
                03
              </text>
            </g>

            {/* Waypoint 4 (Stage 4 @ x: 1050, y: 25) */}
            <g
              className="cursor-pointer transition-transform duration-200"
              onMouseEnter={() => setActiveStage("stage-4")}
              onMouseLeave={() => setActiveStage(null)}
            >
              <circle
                cx="1050"
                cy="25"
                r={activeStage === "stage-4" ? "14" : "12"}
                fill="#16A34A"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                className="transition-all duration-200"
              />
              <text
                x="1050"
                y="29"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
              >
                04
              </text>
            </g>
          </svg>
        </div>

        {/* BOTTOM ROW: STAGE 01 & STAGE 03 CARDS */}
        <div className="grid grid-cols-4 gap-4 mt-2">
          {/* Col 1: Stage 01 Card (Vernacular Patient Triage) */}
          <div
            className="h-[142px] flex flex-col justify-start"
            onMouseEnter={() => setActiveStage("stage-1")}
            onMouseLeave={() => setActiveStage(null)}
          >
            <div
              className={cn(
                "p-4 rounded-xl bg-white border transition-all duration-200 flex flex-col justify-between h-full shadow-xs cursor-pointer",
                activeStage === "stage-1"
                  ? "border-[#0056B3] ring-2 ring-[#0056B3]/15 shadow-md translate-y-0.5"
                  : "border-[#E2E8F0] hover:border-[#0056B3]"
              )}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#EBF3FC] text-[#0056B3] border border-[#CCE0F5]">
                    STAGE 01
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-[#EBF3FC] text-[#0056B3] flex items-center justify-center">
                    <Mic className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h4 className="font-heading font-bold text-sm text-[#1E293B] leading-tight">
                  {STAGES[0].title}
                </h4>
                <p className="text-[11px] text-[#64748B] leading-snug line-clamp-2">
                  {STAGES[0].description}
                </p>
              </div>
              <div className="pt-2 border-t border-[#F1F5F9] text-[10px] font-mono font-bold text-[#0056B3] flex items-center gap-1">
                <Check className="w-3 h-3 text-[#16A34A] shrink-0" /> {STAGES[0].tag}
              </div>
            </div>
          </div>

          {/* Col 2: Empty slot below Stage 2 */}
          <div className="h-[142px]" />

          {/* Col 3: Stage 03 Card (Doctor OPD Cockpit) */}
          <div
            className="h-[142px] flex flex-col justify-start"
            onMouseEnter={() => setActiveStage("stage-3")}
            onMouseLeave={() => setActiveStage(null)}
          >
            <div
              className={cn(
                "p-4 rounded-xl bg-white border transition-all duration-200 flex flex-col justify-between h-full shadow-xs cursor-pointer",
                activeStage === "stage-3"
                  ? "border-[#4F46E5] ring-2 ring-[#4F46E5]/15 shadow-md translate-y-0.5"
                  : "border-[#E2E8F0] hover:border-[#4F46E5]"
              )}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]">
                    STAGE 03
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
                    <Stethoscope className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h4 className="font-heading font-bold text-sm text-[#1E293B] leading-tight">
                  {STAGES[2].title}
                </h4>
                <p className="text-[11px] text-[#64748B] leading-snug line-clamp-2">
                  {STAGES[2].description}
                </p>
              </div>
              <div className="pt-2 border-t border-[#F1F5F9] text-[10px] font-mono font-bold text-[#4F46E5] flex items-center gap-1">
                <Check className="w-3 h-3 text-[#16A34A] shrink-0" /> {STAGES[2].tag}
              </div>
            </div>
          </div>

          {/* Col 4: Empty slot below Stage 4 */}
          <div className="h-[142px]" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RESPONSIVE VERTICAL ROADMAP FOR MOBILE & TABLET */}
      {/* ========================================================================= */}
      <div className="block lg:hidden relative px-1 py-2">
        {/* Continuous Vertical Central Road Line */}
        <div className="absolute left-[24px] top-6 bottom-6 w-4 bg-[#1E293B] rounded-full z-0">
          <div className="w-full h-full flex flex-col items-center justify-around py-3">
            <div className="w-0.5 h-5 bg-white opacity-80 rounded-full" />
            <div className="w-0.5 h-5 bg-white opacity-80 rounded-full" />
            <div className="w-0.5 h-5 bg-white opacity-80 rounded-full" />
            <div className="w-0.5 h-5 bg-white opacity-80 rounded-full" />
          </div>
        </div>

        {/* 4 Stages Vertical Sequence of Cards */}
        <div className="space-y-3 relative z-10">
          {STAGES.map((stage) => {
            const Icon = stage.icon;
            return (
              <div key={stage.id} className="flex items-start gap-3 text-left">
                {/* Road Waypoint Pin */}
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shrink-0 flex items-center justify-center shadow-sm mt-3 z-10"
                  style={{ backgroundColor: stage.color }}
                >
                  <span className="text-[9px] font-bold font-mono text-white">
                    {stage.stepNumber}
                  </span>
                </div>

                {/* Encapsulated Card Container */}
                <div className="flex-1 p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B]">
                      STAGE {stage.stepNumber}
                    </span>
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: stage.lightBg, color: stage.color }}
                    >
                      <Icon className="w-3 h-3" />
                    </div>
                  </div>

                  <h4 className="font-heading font-bold text-xs sm:text-sm text-[#1E293B]">
                    {stage.title}
                  </h4>

                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    {stage.description}
                  </p>

                  <div
                    className="pt-1.5 border-t border-[#F1F5F9] text-[10px] font-mono font-bold flex items-center gap-1"
                    style={{ color: stage.color }}
                  >
                    <Check className="w-3 h-3 text-[#16A34A]" /> {stage.tag}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
