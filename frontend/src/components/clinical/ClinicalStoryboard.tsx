"use client";

import React, { useState } from "react";
import {
  Clock,
  FileText,
  Mic,
  TestTube,
  ShieldCheck,
  User,
  ChevronRight,
  ExternalLink,
  Volume2,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Info,
  Calendar,
  Building2,
  Stethoscope,
  X
} from "lucide-react";
import { EvidenceTimelineItem, PatientQueueItem } from "@/lib/store";

interface ClinicalStoryboardProps {
  patient: PatientQueueItem;
  className?: string;
  onOpenDocScan?: () => void;
}

export function ClinicalStoryboard({ patient, className = "" }: ClinicalStoryboardProps) {
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceTimelineItem | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const evidenceTrail = patient.evidenceTrail || [];

  const getSourceIcon = (type: EvidenceTimelineItem["sourceType"]) => {
    switch (type) {
      case "VOICE":
        return <Mic className="w-3.5 h-3.5 text-[#FB923C]" />;
      case "CAREGIVER":
        return <User className="w-3.5 h-3.5 text-[#C2410C]" />;
      case "DOCUMENT":
        return <FileText className="w-3.5 h-3.5 text-blue-600" />;
      case "LAB":
        return <TestTube className="w-3.5 h-3.5 text-purple-600" />;
      case "ABDM":
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Info className="w-3.5 h-3.5 text-[#374151]" />;
    }
  };

  const getSourceBadgeStyle = (type: EvidenceTimelineItem["sourceType"]) => {
    switch (type) {
      case "VOICE":
        return "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100";
      case "CAREGIVER":
        return "bg-orange-50 text-orange-900 border-orange-200 hover:bg-orange-100";
      case "DOCUMENT":
        return "bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100";
      case "LAB":
        return "bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100";
      case "ABDM":
        return "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100";
      default:
        return "bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100";
    }
  };

  const playVoiceSnippet = () => {
    setIsPlayingAudio(true);
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 2800);
  };

  return (
    <div className={`bg-white rounded-xl border border-[#FDEBD0] p-5 shadow-xs ${className}`}>
      {/* Header with Title & Strategic Insight */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-[#FDEBD0]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1D2A8F]" />
            <h2 className="text-base font-bold text-[#374151] font-heading flex items-center gap-2">
              Clinical Storyboard &amp; Multimodal Evidence Trail
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
              100% Provenance Linked
            </span>
          </div>
          <p className="text-xs text-[#374151]/70 mt-1">
            Every AI observation is anchored to verified voice transcripts, OCR document scans, or ABDM records. Click any badge to inspect source evidence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] text-[#374151]/60 uppercase tracking-wider font-semibold">
              Intake Provenance
            </div>
            <div className="text-xs font-bold text-[#1D2A8F]">
              {patient.intakeSource === "CAREGIVER"
                ? `Caregiver Assisted (${patient.caregiverRelation || "Family"})`
                : "Direct Patient Speech"}
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Interactive Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-[#1D2A8F] before:via-[#FB923C] before:to-emerald-500">
        {evidenceTrail.map((event, idx) => (
          <div key={event.id || idx} className="relative group">
            {/* Timeline Node Icon */}
            <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-white border-2 border-[#1D2A8F] flex items-center justify-center shadow-xs transition-transform group-hover:scale-110">
              {getSourceIcon(event.sourceType)}
            </div>

            {/* Event Card */}
            <div className="bg-[#FDFBF7] rounded-lg border border-[#FDEBD0] p-4 transition-all hover:border-[#1D2A8F]/40 hover:shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#1D2A8F]/10 text-[#1D2A8F] font-bold text-xs">
                    {event.timeframe}
                  </span>
                  <h3 className="font-bold text-sm text-[#374151]">{event.title}</h3>
                </div>

                {/* Clickable Source Pill */}
                <button
                  onClick={() => setSelectedEvidence(event)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold cursor-pointer transition-all shadow-2xs ${getSourceBadgeStyle(
                    event.sourceType
                  )}`}
                >
                  {getSourceIcon(event.sourceType)}
                  <span>{event.sourceBadge}</span>
                  <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
                </button>
              </div>

              <p className="text-xs text-[#374151]/80 leading-relaxed mb-2.5">{event.detail}</p>

              {/* Collapsed Evidence Snippet Preview */}
              <div
                onClick={() => setSelectedEvidence(event)}
                className="bg-white/80 rounded-md p-2.5 border border-[#FDEBD0]/80 flex items-center justify-between gap-3 text-xs cursor-pointer hover:bg-white transition-colors"
              >
                <div className="flex items-center gap-2 truncate text-[#374151]/75">
                  <span className="font-semibold text-[#1D2A8F] shrink-0 text-[11px] uppercase tracking-wider">
                    Source Excerpt:
                  </span>
                  <span className="italic truncate">&ldquo;{event.sourceSnippet}&rdquo;</span>
                </div>
                <span className="text-[#1D2A8F] font-bold shrink-0 text-[11px] flex items-center gap-1">
                  Inspect <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Evidence Source Detail Modal */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[#FDEBD0] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#1E2433] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#FB923C]">
                  {getSourceIcon(selectedEvidence.sourceType)}
                </div>
                <div>
                  <h3 className="font-bold text-sm font-heading">
                    Evidence Source Verification
                  </h3>
                  <p className="text-xs text-white/70">
                    {selectedEvidence.sourceBadge} • {selectedEvidence.timeframe}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvidence(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#374151]/60">
                  Clinical Observation
                </span>
                <h4 className="font-bold text-base text-[#374151] mt-0.5">
                  {selectedEvidence.title}
                </h4>
                <p className="text-xs text-[#374151]/80 mt-1 leading-relaxed">
                  {selectedEvidence.detail}
                </p>
              </div>

              {/* Exact Evidence Snippet Card */}
              <div className="bg-[#FDFBF7] rounded-xl border border-[#FDEBD0] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D2A8F] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Verified Raw Provenance
                  </span>
                  {selectedEvidence.sourceType === "VOICE" && (
                    <button
                      onClick={playVoiceSnippet}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                        isPlayingAudio
                          ? "bg-amber-600 text-white"
                          : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                      }`}
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? "animate-pulse" : ""}`} />
                      {isPlayingAudio ? "Playing Audio..." : "Listen Voice Clip"}
                    </button>
                  )}
                </div>

                <div className="p-3 bg-white rounded-lg border border-[#FDEBD0] text-sm text-[#374151] font-mono leading-relaxed">
                  &ldquo;{selectedEvidence.sourceSnippet}&rdquo;
                </div>

                {/* Specific Metadata Fields */}
                {selectedEvidence.metadata && (
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    {selectedEvidence.metadata.prescriber && (
                      <div className="bg-white p-2 rounded border border-[#FDEBD0]/60">
                        <span className="text-[10px] text-[#374151]/60 uppercase block">Prescriber</span>
                        <span className="font-semibold text-[#374151]">{selectedEvidence.metadata.prescriber}</span>
                      </div>
                    )}
                    {selectedEvidence.metadata.facility && (
                      <div className="bg-white p-2 rounded border border-[#FDEBD0]/60">
                        <span className="text-[10px] text-[#374151]/60 uppercase block">Facility</span>
                        <span className="font-semibold text-[#374151]">{selectedEvidence.metadata.facility}</span>
                      </div>
                    )}
                    {selectedEvidence.metadata.observedValue && (
                      <div className="bg-white p-2 rounded border border-[#FDEBD0]/60">
                        <span className="text-[10px] text-[#374151]/60 uppercase block">Observed Value</span>
                        <span className="font-bold text-purple-700">{selectedEvidence.metadata.observedValue}</span>
                      </div>
                    )}
                    {selectedEvidence.metadata.refRange && (
                      <div className="bg-white p-2 rounded border border-[#FDEBD0]/60">
                        <span className="text-[10px] text-[#374151]/60 uppercase block">Reference Range</span>
                        <span className="font-semibold text-[#374151]">{selectedEvidence.metadata.refRange}</span>
                      </div>
                    )}
                    {selectedEvidence.metadata.consentId && (
                      <div className="bg-white p-2 rounded border border-[#FDEBD0]/60 col-span-2">
                        <span className="text-[10px] text-[#374151]/60 uppercase block">ABDM Consent Artifact</span>
                        <span className="font-mono text-[11px] font-bold text-emerald-700">{selectedEvidence.metadata.consentId}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-[#374151]/70 pt-2 border-t border-[#FDEBD0]">
                <span>Provenance validated via FHIR R4 Provenance Resource</span>
                <button
                  onClick={() => setSelectedEvidence(null)}
                  className="px-4 py-1.5 rounded-lg bg-[#1D2A8F] text-white font-bold hover:bg-[#2563EB] transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
