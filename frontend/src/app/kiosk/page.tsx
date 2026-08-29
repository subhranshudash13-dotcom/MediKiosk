"use client";

import { useState } from "react";
import Link from "next/link";
import { Mic, MicOff, Volume2, ArrowLeft, HeartPulse, CheckCircle2, AlertTriangle } from "lucide-react";
import { useKioskStore } from "@/lib/store";

export default function KioskPage() {
  const { selectedLanguage, setLanguage, selectedMode, setMode, isRecording, setIsRecording } = useKioskStore();

  const languages = [
    { code: "hi", name: "हिन्दी" },
    { code: "en", name: "English" },
    { code: "ta", name: "தமிழ்" },
    { code: "te", name: "తెలుగు" },
    { code: "bn", name: "বাংলা" },
    { code: "mr", name: "मराठी" },
    { code: "gu", name: "ગુજરાતી" },
    { code: "kn", name: "ಕನ್ನಡ" },
    { code: "or", name: "ଓଡ଼ିଆ" },
    { code: "pa", name: "ਪੰਜਾਬੀ" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-6 md:p-10 select-none">
      {/* Top Header */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-blue-400 animate-pulse" />
            <span className="font-bold text-lg tracking-wide">MediKiosk • Patient Intake Station</span>
          </div>
        </div>

        {/* Mode Selector (Allopathy vs AYUSH) */}
        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setMode("allopathy")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedMode === "allopathy" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Allopathy (General OPD)
          </button>
          <button
            onClick={() => setMode("ayush")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedMode === "ayush" ? "bg-amber-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            AYUSH (Ayurvedic Intake)
          </button>
        </div>
      </header>

      {/* Main Kiosk Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center py-8 text-center max-w-4xl mx-auto w-full">
        {/* Language Selection Grid */}
        <div className="w-full mb-8">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-3">
            Choose Your Language / अपनी भाषा चुनें
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  selectedLanguage === lang.code
                    ? "bg-blue-600 text-white ring-2 ring-blue-400 scale-105"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Audio / Conversational Intake Visualizer Card */}
        <div className="w-full bg-slate-800/80 border border-slate-700 rounded-3xl p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-center gap-2 text-blue-400 text-sm font-semibold mb-4">
            <Volume2 className="w-5 h-5 animate-bounce" />
            <span>AI Voice Doctor • Speak or Tap to Answer</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            "कृपया अपनी मुख्य तकलीफ बताएं"
          </h2>
          <p className="text-slate-400 text-sm mb-8">
            (Please describe your main health problem or where it hurts)
          </p>

          {/* Large Touch/Voice Trigger Button */}
          <div className="flex flex-col items-center justify-center gap-4">
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                isRecording
                  ? "bg-red-600 ring-8 ring-red-500/30 scale-110 animate-pulse"
                  : "bg-blue-600 hover:bg-blue-500 ring-8 ring-blue-500/20 hover:scale-105"
              }`}
            >
              {isRecording ? <MicOff className="w-12 h-12 text-white" /> : <Mic className="w-12 h-12 text-white" />}
            </button>
            <span className="text-xs text-slate-400 font-medium tracking-wide">
              {isRecording ? "Listening... (बोलिए, सुन रहे हैं)" : "Tap microphone to speak (बोलने के लिए दबाएं)"}
            </span>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800 pt-4">
        <span>Session Protected • DPDP Act 2023 Compliant</span>
        <span>MediKiosk v1.0 • Smart India Hackathon</span>
      </footer>
    </div>
  );
}
