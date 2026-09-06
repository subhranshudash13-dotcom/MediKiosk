"use client";

import React from "react";
import {
  CheckCircle2,
  AlertCircle,
  Activity,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
  Info
} from "lucide-react";
import { HistoryCoverageMap } from "@/lib/store";

interface HistoryCompletenessEngineProps {
  completeness: number; // 0-100
  coverage?: Partial<HistoryCoverageMap>;
  chiefComplaint?: string;
  className?: string;
}

export function HistoryCompletenessEngine({
  completeness = 91,
  coverage = {
    onset: true,
    location: true,
    character: true,
    severity: true,
    radiation: true,
    aggravating: true,
    relieving: true,
    associated: true,
    pastHistory: true,
    medications: true,
  },
  chiefComplaint = "Acute Symptoms",
  className = ""
}: HistoryCompletenessEngineProps) {
  const DIMENSIONS = [
    { key: "onset", label: "Onset & Duration", category: "Timing" },
    { key: "location", label: "Exact Site / Location", category: "Anatomy" },
    { key: "character", label: "Pain Character", category: "Quality" },
    { key: "severity", label: "Severity (1-10 Scale)", category: "Intensity" },
    { key: "radiation", label: "Radiation Path", category: "Spread" },
    { key: "aggravating", label: "Aggravating Triggers", category: "Modifiers" },
    { key: "relieving", label: "Relieving Factors", category: "Modifiers" },
    { key: "associated", label: "Associated Symptoms", category: "Systemic" },
    { key: "pastHistory", label: "Past Medical History", category: "Longitudinal" },
    { key: "medications", label: "Medications & Allergies", category: "Pharmacology" },
  ] as const;

  const coveredCount = DIMENSIONS.filter(
    (d) => coverage[d.key as keyof HistoryCoverageMap]
  ).length;

  const missingItems = DIMENSIONS.filter(
    (d) => !coverage[d.key as keyof HistoryCoverageMap]
  );

  return (
    <div className={`bg-white rounded-xl border border-[#FDEBD0] p-5 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-[#FDEBD0]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1D2A8F] text-white flex items-center justify-center font-bold">
            <Activity className="w-4 h-4 text-[#FB923C]" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#374151] font-heading flex items-center gap-2">
              Clinical History Completeness Engine
            </h3>
            <p className="text-[11px] text-[#374151]/70">
              Adaptive elicitation coverage map ({chiefComplaint})
            </p>
          </div>
        </div>

        {/* Circular Percentage Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDFBF7] border border-[#FDEBD0]">
          <span className="text-xs text-[#374151]/70 font-medium">Coverage:</span>
          <span className="text-sm font-black text-[#1D2A8F]">{completeness}%</span>
        </div>
      </div>

      {/* 10-Point Checklist Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-4">
        {DIMENSIONS.map((dim) => {
          const isCovered = Boolean(coverage[dim.key as keyof HistoryCoverageMap]);
          return (
            <div
              key={dim.key}
              className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between transition-all ${
                isCovered
                  ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                  : "bg-amber-50/70 border-amber-200 text-amber-950"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                  {dim.category}
                </span>
                {isCovered ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                )}
              </div>
              <span className="font-semibold leading-tight">{dim.label}</span>
            </div>
          );
        })}
      </div>

      {/* Adaptive Logic Explanation Bar */}
      <div className="bg-[#FDFBF7] rounded-lg border border-[#FDEBD0] p-3 text-xs flex items-start gap-2.5 text-[#374151]">
        <Sparkles className="w-4 h-4 text-[#FB923C] shrink-0 mt-0.5" />
        <div className="flex-1">
          <span className="font-bold text-[#1D2A8F]">Adaptive AI Logic: </span>
          {missingItems.length > 0 ? (
            <span>
              Identified missing dimensions (
              <span className="font-semibold text-amber-800">
                {missingItems.map((m) => m.label).join(", ")}
              </span>
              ). Targeted follow-up inquiries were triggered during conversational intake.
            </span>
          ) : (
            <span>
              All 10 fundamental clinical dimensions elicited and validated against zero-hallucination guardrails. Ready for physician examination.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
