"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Volume2,
  Lock,
  FileText,
  User,
  X,
  Sparkles,
  Info
} from "lucide-react";
import { useKioskStore } from "@/lib/store";

interface AudioConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmConsent: (type: "GRANTED_ONCE" | "GRANTED_HOSPITAL") => void;
  language?: string;
}

export function AudioConsentModal({
  isOpen,
  onClose,
  onConfirmConsent,
  language = "hi"
}: AudioConsentModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const setConsent = useKioskStore((state) => state.setConsent);

  if (!isOpen) return null;

  const playConsentAudio = () => {
    setIsPlaying(true);
    setTimeout(() => {
      setIsPlaying(false);
    }, 3200);
  };

  const handleGrant = (type: "GRANTED_ONCE" | "GRANTED_HOSPITAL") => {
    setConsent(true, type);
    onConfirmConsent(type);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#FDEBD0] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#1E2433] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm font-heading">
                ABDM Transparent Clinical Consent
              </h3>
              <p className="text-[11px] text-white/70">
                Privacy-by-Design • DPDP &amp; ABDM Compliant
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Vernacular Audio Readout Pill */}
          <div className="bg-[#FDFBF7] p-3 rounded-xl border border-[#FDEBD0] flex items-center justify-between gap-3">
            <div className="text-xs text-[#374151]">
              <span className="font-bold text-[#1D2A8F] block">Audio Consent Read-Aloud:</span>
              <span>&ldquo;आपकी स्वास्थ्य जानकारी केवल डॉक्टर के परामर्श के लिए सुरक्षित रूप से साझा की जाएगी।&rdquo;</span>
            </div>
            <button
              onClick={playConsentAudio}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                isPlaying
                  ? "bg-emerald-600 text-white animate-pulse"
                  : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              {isPlaying ? "Playing..." : "Listen"}
            </button>
          </div>

          {/* Transparent Two-Column Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* What IS shared */}
            <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-900 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                What is Shared
              </span>
              <ul className="text-xs text-emerald-950 space-y-1.5">
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-600">•</span>
                  <span>Structured symptom history</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-600">•</span>
                  <span>Uploaded prescriptions &amp; labs</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-600">•</span>
                  <span>Current medications &amp; allergies</span>
                </li>
              </ul>
            </div>

            {/* What is NOT shared */}
            <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200 space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-rose-900 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                What is NOT Shared
              </span>
              <ul className="text-xs text-rose-950 space-y-1.5">
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-rose-600">•</span>
                  <span>Raw voice recordings (deleted post-intake)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-rose-600">•</span>
                  <span>Unrelated documents</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-rose-600">•</span>
                  <span>Third-party commercial ad trackers</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => handleGrant("GRANTED_HOSPITAL")}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1D2A8F] hover:bg-[#2563EB] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#FB923C]" />
              <span>Allow for this Hospital OPD Visit (Recommended)</span>
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => handleGrant("GRANTED_ONCE")}
                className="flex-1 py-2 px-3 rounded-xl border border-[#FDEBD0] bg-[#FDFBF7] hover:bg-white text-[#374151] font-semibold text-xs transition-colors cursor-pointer"
              >
                Allow One-Time Only
              </button>
              <button
                onClick={onClose}
                className="py-2 px-3 rounded-xl text-[#374151]/70 hover:text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
              >
                Do Not Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
