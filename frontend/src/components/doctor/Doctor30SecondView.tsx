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
  Zap
} from "lucide-react";
import { PatientQueueItem } from "@/lib/store";

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

  return (
    <div
      className={`rounded-2xl border transition-all p-5 shadow-sm ${
        isEmergency
          ? "bg-rose-50/40 border-rose-200"
          : isUrgent
          ? "bg-amber-50/40 border-amber-200"
          : "bg-white border-[#FDEBD0]"
      } ${className}`}
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-[#FDEBD0]/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1D2A8F] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
            <Zap className="w-4 h-4 text-[#FB923C]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-black text-base text-[#374151]">
                30-Second Clinical Briefing
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#1D2A8F]/10 text-[#1D2A8F] text-[10px] font-extrabold uppercase tracking-wider">
                Doctor Rapid View
              </span>
            </div>
            <p className="text-[11px] text-[#374151]/70">
              Zero-fluff pre-consultation summary generated from multimodal kiosk intake
            </p>
          </div>
        </div>

        {/* Patient Badge Pill */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-[#374151]">{patient.name}</span>
          <span className="text-[#374151]/60">({patient.age}y / {patient.gender})</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono font-bold text-[#1D2A8F]">
            Token {patient.token}
          </span>
        </div>
      </div>

      {/* 4-Column Quick Clinical Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Col 1: Primary Concern */}
        <div className="bg-white/90 p-3.5 rounded-xl border border-[#FDEBD0] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#374151]/60 block">
            Primary Concern
          </span>
          <p className="text-sm font-bold text-[#374151] leading-snug">
            {patient.chiefComplaint}
          </p>
          <div className="pt-1 flex items-center gap-1.5 text-[11px] text-[#1D2A8F] font-semibold">
            <Clock className="w-3 h-3 text-[#FB923C]" />
            <span>Onset: {patient.hpi.onset.split(",")[0] || "Acute"}</span>
          </div>
        </div>

        {/* Col 2: Key History Points */}
        <div className="bg-white/90 p-3.5 rounded-xl border border-[#FDEBD0] space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#374151]/60 block">
            Key History (SOCRATES)
          </span>
          <ul className="text-xs text-[#374151]/80 space-y-1">
            <li className="flex items-start gap-1 truncate">
              <span className="text-[#1D2A8F] font-bold">•</span>
              <span className="truncate">{patient.hpi.character}</span>
            </li>
            <li className="flex items-start gap-1 truncate">
              <span className="text-[#1D2A8F] font-bold">•</span>
              <span className="truncate">Radiation: {patient.hpi.radiation || "None"}</span>
            </li>
            <li className="flex items-start gap-1 truncate">
              <span className="text-[#1D2A8F] font-bold">•</span>
              <span className="truncate">Severity: {patient.hpi.severity}</span>
            </li>
          </ul>
        </div>

        {/* Col 3: Medications & Evidence Sources */}
        <div className="bg-white/90 p-3.5 rounded-xl border border-[#FDEBD0] space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#374151]/60 block">
            Active Medications
          </span>
          {patient.ocrHistory?.medications?.length > 0 ? (
            <div className="space-y-1">
              {patient.ocrHistory.medications.slice(0, 2).map((m, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#374151] truncate max-w-[120px]">
                    {m.drug} {m.dose}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                    {m.source ? "✓ OCR" : "Reported"}
                  </span>
                </div>
              ))}
              {patient.ocrHistory.medications.length > 2 && (
                <span className="text-[10px] text-[#374151]/60 block">
                  +{patient.ocrHistory.medications.length - 2} more in records
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-[#374151]/60 italic">No chronic medications listed</span>
          )}
        </div>

        {/* Col 4: Triage & Alerts */}
        <div
          className={`p-3.5 rounded-xl border space-y-1.5 ${
            isEmergency
              ? "bg-rose-100/60 border-rose-300"
              : isUrgent
              ? "bg-amber-100/60 border-amber-300"
              : "bg-emerald-50 border-emerald-200"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#374151]/60 block">
            Clinical Safety Review
          </span>
          {patient.redFlags.length > 0 ? (
            <div className="flex items-start gap-1.5 text-xs text-rose-900 font-semibold leading-tight">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{patient.redFlags[0]}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>No emergency red flags detected</span>
            </div>
          )}
          <div className="pt-1 flex items-center justify-between text-[11px] text-[#374151]/70">
            <span>Completeness: <b>{patient.historyCompleteness}%</b></span>
            <span>Vitals: <b>{patient.vitals.bp}</b></span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-3 text-xs text-[#374151]/70">
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-[#1D2A8F]" />
            <b>{patient.evidenceTrail?.length || 3}</b> Timeline Evidence Nodes
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            ABHA: <b>{patient.abhaId}</b>
          </span>
        </div>

        {onOpenStoryboard && (
          <button
            onClick={onOpenStoryboard}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#1D2A8F] text-white text-xs font-bold hover:bg-[#2563EB] transition-colors shadow-2xs cursor-pointer"
          >
            <span>Open Interactive Clinical Storyboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
