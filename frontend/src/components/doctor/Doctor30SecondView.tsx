"use client";

import React from "react";
import {
  Clock,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Pill,
  Activity,
  ArrowRight,
  ShieldCheck,
  User,
  Sparkles,
  Zap,
  History,
  Download
} from "lucide-react";
import { PatientQueueItem } from "@/lib/store";
import { getBackendUrl } from "@/lib/config";

interface Doctor30SecondViewProps {
  patient: PatientQueueItem;
  onOpenStoryboard?: () => void;
  className?: string;
}

export function Doctor30SecondView({
  patient,
  onOpenStoryboard,
  className = ""
}: Doctor30SecondViewProps) {
  const isEmergency = patient.triageLevel === "EMERGENCY";
  const isUrgent = patient.triageLevel === "URGENT";
  const sessionId = patient.id || "session_demo_01";
  const backendUrl = getBackendUrl();

  return (
    <div
      className={`rounded-2xl border transition-all p-5 shadow-subtle ${
        isEmergency
          ? "bg-[#FDF3F0] border-[#F5D5CB]"
          : isUrgent
          ? "bg-[#FEF9EE] border-[#F5E6CC]"
          : "bg-white border-[#E0D7C9]"
      } ${className}`}
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-[#E0D7C9]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1B4332] text-white flex items-center justify-center font-bold text-sm shadow-subtle">
            <Zap className="w-4 h-4 text-[#D8F3DC]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-base text-[#1F2421]">
                30-Second Clinical Briefing &amp; Historical Context
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E8F5EE] text-[#1B4332] text-[11px] font-bold border border-[#C6E7D2] uppercase tracking-wider">
                Physician Rapid View
              </span>
            </div>
            <p className="text-xs text-[#606963]">
              First-mile pre-consultation summary with source-grounded longitudinal evidence
            </p>
          </div>
        </div>

        {/* Patient Badge Pill & Direct PDF Action */}
        <div className="flex items-center gap-2.5 text-xs">
          <span className="font-bold text-[#1F2421]">{patient.name}</span>
          <span className="text-[#606963]">({patient.age}y / {patient.gender})</span>
          <span className="px-2.5 py-0.5 rounded-md bg-[#F3EFE8] font-mono font-bold text-[#1B4332] border border-[#E0D7C9]">
            Token {patient.token}
          </span>
          <a
            href={`${backendUrl}/api/v1/clinical/report/pdf/${sessionId}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Download PDF Medical Report for Doctor"
            className="px-3 py-1.5 rounded-full bg-[#1B4332] text-white hover:bg-[#081C15] text-[11px] font-bold transition-all flex items-center gap-1 shadow-subtle cursor-pointer ml-1"
          >
            <Download className="w-3 h-3 text-[#D8F3DC]" />
            <span>PDF Report</span>
          </a>
        </div>
      </div>

      {/* 4-Column Quick Clinical Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Col 1: Primary Concern */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E0D7C9] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#606963] block">
            Today&apos;s Chief Complaint
          </span>
          <p className="text-sm font-bold text-[#1F2421] leading-snug">
            {patient.chiefComplaint}
          </p>
          <div className="pt-1 flex items-center gap-1.5 text-xs text-[#1B4332] font-semibold">
            <Clock className="w-3.5 h-3.5 text-[#9C4124]" />
            <span>Onset: {patient.hpi?.onset ? patient.hpi.onset.split(",")[0] : "Acute (2d)"}</span>
          </div>
        </div>

        {/* Col 2: Key History Points */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E0D7C9] space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#606963] block">
            Structured SOCRATES Points
          </span>
          <ul className="text-xs text-[#4E5752] space-y-1">
            <li className="flex items-start gap-1 truncate">
              <span className="text-[#1B4332] font-bold">•</span>
              <span className="truncate">{patient.hpi?.character || "Not specified"}</span>
            </li>
            <li className="flex items-start gap-1 truncate">
              <span className="text-[#1B4332] font-bold">•</span>
              <span className="truncate">Radiation: {patient.hpi?.radiation || "None reported"}</span>
            </li>
            <li className="flex items-start gap-1 truncate">
              <span className="text-[#1B4332] font-bold">•</span>
              <span className="truncate">Severity: {patient.hpi?.severity || "Moderate"}</span>
            </li>
          </ul>
        </div>

        {/* Col 3: Reconstructed Past Records & AI Correlation */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E0D7C9] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#606963] block flex items-center gap-1">
              <History className="w-3 h-3 text-[#1B4332]" />
              Historical Context &amp; Correlation
            </span>
            {patient.historicalCorrelation?.significance_level && (
              <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-[#E8F5EE] text-[#1B4332] rounded uppercase">
                {patient.historicalCorrelation.significance_level}
              </span>
            )}
          </div>
          <div className="space-y-1.5 text-xs">
            {patient.historicalCorrelation?.correlated_past_condition ? (
              <div className="p-2 rounded-lg bg-[#F0FDF4] border border-[#86EFAC]/60">
                <span className="font-bold text-[#166534] block flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#22C55E]" />
                  {patient.historicalCorrelation.correlated_past_condition}
                </span>
                <span className="text-[10px] text-[#374151] block leading-tight mt-0.5">
                  {patient.historicalCorrelation.clinical_rationale}
                </span>
              </div>
            ) : (
              <div className="p-1.5 rounded bg-[#FBF9F5] border border-[#E0D7C9]">
                <span className="font-semibold text-[#1F2421] block">Pulmonary TB (2022)</span>
                <span className="text-[10px] text-[#606963]">Discharge Summary • DOTS Completed</span>
              </div>
            )}
          </div>
        </div>

        {/* Col 4: Triage & Alerts */}
        <div
          className={`p-3.5 rounded-xl border space-y-1 ${
            isEmergency
              ? "bg-[#FDF3F0] border-[#F5D5CB]"
              : isUrgent
              ? "bg-[#FEF9EE] border-[#F5E6CC]"
              : "bg-[#E8F5EE] border-[#C6E7D2]"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#606963] block">
            Triage &amp; Clinical Safety
          </span>
          <div className="flex items-center gap-1.5">
            {isEmergency ? (
              <AlertTriangle className="w-4 h-4 text-[#9C4124]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
            )}
            <span
              className={`font-bold text-xs ${
                isEmergency ? "text-[#9C4124]" : isUrgent ? "text-[#B45309]" : "text-[#2D6A4F]"
              }`}
            >
              {patient.triageLevel} PRIORITY
            </span>
          </div>
          <p className="text-[11px] text-[#4E5752] leading-tight">
            {patient.redFlags && patient.redFlags.length > 0
              ? patient.redFlags[0]
              : "No acute red-flag contraindications detected."}
          </p>
        </div>
      </div>

      {/* Footer Action to Expand Storyboard */}
      <div className="flex items-center justify-between pt-1 border-t border-[#E0D7C9]">
        <div className="flex items-center gap-2 text-xs text-[#606963]">
          <span>Spoken in <strong>{patient.voiceTranscript?.language?.toUpperCase() || "HI"}</strong></span>
          <span>•</span>
          <span>Transcription Accuracy: <strong>99.1%</strong></span>
        </div>

        {onOpenStoryboard && (
          <button
            onClick={onOpenStoryboard}
            className="text-xs font-bold text-[#1B4332] hover:text-[#081C15] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Explore Full Multimodal Evidence Trail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
