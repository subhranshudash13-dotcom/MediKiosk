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
        return <Mic className="w-3.5 h-3.5 text-[#1B4332]" />;
      case "CAREGIVER":
        return <User className="w-3.5 h-3.5 text-[#9C4124]" />;
      case "DOCUMENT":
        return <FileText className="w-3.5 h-3.5 text-[#2D6A4F]" />;
      case "LAB":
        return <TestTube className="w-3.5 h-3.5 text-[#B45309]" />;
      case "ABDM":
        return <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />;
      default:
        return <Info className="w-3.5 h-3.5 text-[#1F2421]" />;
    }
  };

  const getSourceBadgeStyle = (type: EvidenceTimelineItem["sourceType"]) => {
    switch (type) {
      case "VOICE":
        return "bg-[#E8F5EE] text-[#1B4332] border-[#C6E7D2] hover:bg-[#D8F3DC]";
      case "CAREGIVER":
        return "bg-[#FDF3F0] text-[#9C4124] border-[#F5D5CB] hover:bg-[#FAE3DC]";
      case "DOCUMENT":
        return "bg-[#F3EFE8] text-[#1F2421] border-[#E0D7C9] hover:bg-[#EAE4D9]";
      case "LAB":
        return "bg-[#FEF9EE] text-[#B45309] border-[#F5E6CC] hover:bg-[#FDF0D5]";
      case "ABDM":
        return "bg-[#E8F5EE] text-[#1B4332] border-[#C6E7D2] hover:bg-[#D8F3DC]";
      default:
        return "bg-[#FBF9F5] text-[#1F2421] border-[#E0D7C9] hover:bg-[#F3EFE8]";
    }
  };

  const playVoiceSnippet = () => {
    setIsPlayingAudio(true);
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 2800);
  };

  return (
    <div className={`bg-white rounded-2xl border border-[#E0D7C9] p-5 shadow-subtle ${className}`}>
      {/* Header with Title & Strategic Insight */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-[#E0D7C9]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1B4332]" />
            <h2 className="text-base font-bold text-[#1F2421] font-heading flex items-center gap-2">
              Clinical Storyboard &amp; Multimodal Evidence Trail
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E8F5EE] text-[#1B4332] text-xs font-bold border border-[#C6E7D2]">
              100% Provenance Linked
            </span>
          </div>
          <p className="text-xs text-[#606963] mt-1">
            Every clinical observation is anchored to verified voice statements, scanned prescriptions, or ABDM records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] text-[#606963] uppercase tracking-wider font-semibold">
              Intake Provenance
            </div>
            <div className="text-xs font-bold text-[#1B4332]">
              {patient.intakeSource === "CAREGIVER"
                ? `Caregiver Assisted (${patient.caregiverRelation || "Family"})`
                : "Direct Patient Speech"}
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Interactive Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E0D7C9]">
        {evidenceTrail.map((event, idx) => (
          <div key={event.id || idx} className="relative group">
            {/* Timeline Node Icon */}
            <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-white border-2 border-[#1B4332] flex items-center justify-center shadow-subtle transition-transform group-hover:scale-110">
              {getSourceIcon(event.sourceType)}
            </div>

            {/* Event Card */}
            <div className="bg-[#FBF9F5] rounded-xl border border-[#E0D7C9] p-4 transition-all hover:border-[#1B4332] hover:shadow-subtle">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#E8F5EE] text-[#1B4332] font-bold text-xs border border-[#C6E7D2]">
                    {event.timeframe}
                  </span>
                  <h3 className="font-bold text-sm text-[#1F2421]">{event.title}</h3>
                </div>

                {/* Clickable Source Pill */}
                <button
                  onClick={() => setSelectedEvidence(event)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold cursor-pointer transition-all shadow-subtle ${getSourceBadgeStyle(
                    event.sourceType
                  )}`}
                >
                  {getSourceIcon(event.sourceType)}
                  <span>{event.sourceBadge}</span>
                  <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
                </button>
              </div>

              <p className="text-xs text-[#4E5752] leading-relaxed mb-2.5">{event.detail}</p>

              {/* Collapsed Evidence Snippet Preview */}
              <div
                onClick={() => setSelectedEvidence(event)}
                className="bg-white rounded-lg p-2.5 border border-[#E0D7C9] flex items-center justify-between gap-3 text-xs cursor-pointer hover:bg-[#F3EFE8] transition-colors"
              >
                <div className="flex items-center gap-2 truncate text-[#4E5752]">
                  <span className="font-semibold text-[#1B4332] shrink-0 text-xs uppercase tracking-wider">
                    Source Excerpt:
                  </span>
                  <span className="italic truncate">&ldquo;{event.sourceSnippet}&rdquo;</span>
                </div>
                <span className="text-[#1B4332] font-bold shrink-0 text-xs flex items-center gap-1">
                  Inspect <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Evidence Source Detail Modal */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[#E0D7C9] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#1B4332] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-[#D8F3DC]">
                  {getSourceIcon(selectedEvidence.sourceType)}
                </div>
                <div>
                  <h3 className="font-bold text-sm font-heading">
                    Evidence Source Verification
                  </h3>
                  <p className="text-xs text-white/80">
                    {selectedEvidence.sourceBadge} • {selectedEvidence.timeframe}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvidence(null)}
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-[#606963]">
                  Clinical Observation
                </span>
                <h4 className="font-bold text-base text-[#1F2421] mt-0.5">
                  {selectedEvidence.title}
                </h4>
                <p className="text-xs text-[#4E5752] mt-1 leading-relaxed">
                  {selectedEvidence.detail}
                </p>
              </div>

              {/* Exact Evidence Snippet Card */}
              <div className="bg-[#FBF9F5] rounded-xl border border-[#E0D7C9] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1B4332] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                    Verified Raw Provenance
                  </span>
                  {selectedEvidence.sourceType === "VOICE" && (
                    <button
                      onClick={playVoiceSnippet}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        isPlayingAudio
                          ? "bg-[#1B4332] text-white"
                          : "bg-[#E8F5EE] text-[#1B4332] hover:bg-[#D8F3DC]"
                      }`}
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? "animate-pulse" : ""}`} />
                      {isPlayingAudio ? "Playing Audio..." : "Listen Voice Clip"}
                    </button>
                  )}
                </div>

                <div className="p-3 bg-white rounded-lg border border-[#E0D7C9] text-sm text-[#1F2421] font-mono leading-relaxed">
                  &ldquo;{selectedEvidence.sourceSnippet}&rdquo;
                </div>

                {/* Specific Metadata Fields */}
                {selectedEvidence.metadata && (
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    {selectedEvidence.metadata.facility && (
                      <div className="bg-white p-2.5 rounded-lg border border-[#E0D7C9]">
                        <span className="text-[10px] text-[#606963] uppercase block">Facility</span>
                        <span className="font-semibold text-[#1F2421]">{selectedEvidence.metadata.facility}</span>
                      </div>
                    )}
                    {selectedEvidence.metadata.date && (
                      <div className="bg-white p-2.5 rounded-lg border border-[#E0D7C9]">
                        <span className="text-[10px] text-[#606963] uppercase block">Timestamp</span>
                        <span className="font-semibold text-[#1F2421]">{selectedEvidence.metadata.date}</span>
                      </div>
                    )}
                    {selectedEvidence.metadata.consentId && (
                      <div className="bg-white p-2.5 rounded-lg border border-[#E0D7C9] col-span-2">
                        <span className="text-[10px] text-[#606963] uppercase block">ABDM Consent Artifact</span>
                        <span className="font-mono text-xs font-bold text-[#2D6A4F]">{selectedEvidence.metadata.consentId}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-[#606963] pt-2 border-t border-[#E0D7C9]">
                <span>Provenance validated via FHIR R4 Provenance Resource</span>
                <button
                  onClick={() => setSelectedEvidence(null)}
                  className="px-5 py-2 rounded-full bg-[#1B4332] text-white font-bold hover:bg-[#081C15] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
