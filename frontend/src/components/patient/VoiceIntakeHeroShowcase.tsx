"use client";

import React, { useState } from "react";
import { Mic, Send, Radio } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";

const AudioWaveform = () => {
  const bars = [
    { height: '4px', color: 'bg-blue-300' },
    { height: '14px', color: 'bg-blue-400' },
    { height: '22px', color: 'bg-blue-400' },
    { height: '30px', color: 'bg-blue-400' },
    { height: '20px', color: 'bg-blue-600' },
    { height: '14px', color: 'bg-blue-400' },
    { height: '24px', color: 'bg-blue-400' },
    { height: '32px', color: 'bg-blue-400' },
    { height: '40px', color: 'bg-blue-400' },
    { height: '26px', color: 'bg-blue-400' },
    { height: '18px', color: 'bg-blue-400' },
    { height: '24px', color: 'bg-blue-400' },
    { height: '34px', color: 'bg-blue-400' },
    { height: '22px', color: 'bg-blue-400' },
    { height: '14px', color: 'bg-blue-400' },
    { height: '8px',  color: 'bg-blue-400' },
    { height: '18px', color: 'bg-blue-400' },
    { height: '14px', color: 'bg-blue-600' },
    { height: '4px',  color: 'bg-blue-400' },
  ];

  return (
    <div className="flex items-center justify-center py-2">
      {/* Pill Container */}
      <div className="flex items-center h-16 px-6 py-2 space-x-[3px] bg-slate-50 border-2 border-slate-100 rounded-full shadow-xs">
        {/* Render Bars */}
        {bars.map((bar, index) => (
          <div
            key={index}
            className={`w-1.5 rounded-full ${bar.color}`}
            style={{ height: bar.height }}
          />
        ))}
      </div>
    </div>
  );
};

export function VoiceIntakeHeroShowcase() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [activeLang, setActiveLang] = useState("English");
  const [inputValue, setInputValue] = useState("");

  const languages = ["English", "हिंदी (Hindi)", "తెలుగు (Telugu)", "தமிழ் (Tamil)", "বাংলা (Bengali)"];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/patient/login?returnUrl=/kiosk/intake");
    } else if (inputValue.trim()) {
      router.push(`/kiosk/intake?input=${encodeURIComponent(inputValue.trim())}`);
    } else {
      router.push("/kiosk/intake");
    }
  };

  const handleTapToSpeak = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push("/patient/login?returnUrl=/kiosk/intake");
    } else {
      router.push("/kiosk/intake");
    }
  };

  return (
    <div className="w-full h-full bg-[#FCFDFD] border border-[#DEE2E6] rounded-3xl p-7 sm:p-8 shadow-card flex flex-col justify-between space-y-6 text-left relative overflow-hidden">
      {/* Top Waveform Display & Status Header */}
      <div className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs relative space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#28A745] animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-[#155724] uppercase tracking-wider">
              Microphone Standby
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#6C7A89] uppercase tracking-wider">
            48 kHz Audio Stream
          </span>
        </div>

        {/* User-specified Pill Waveform */}
        <AudioWaveform />

        {/* Clinical Intake Preview Badge */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#17A2B8]" />
              <span className="text-[11px] font-bold text-[#2C3E50] uppercase tracking-wider font-mono">
                Live Speech Intake
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold text-[#0056B3] bg-[#EBF3FC] px-2 py-0.5 rounded-md border border-[#CCE5FF]">
                SOCRATES Mapped
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#2C3E50] font-medium italic bg-white p-2.5 sm:p-3 rounded-lg border border-[#E2E8F0] shadow-2xs">
            &ldquo;Patient reports severe throbbing headache for 2 days with photophobia.&rdquo;
          </p>
        </div>
      </div>

      {/* Center Action: Big Prominent Tap to Speak Button Redirecting to /kiosk */}
      <div className="flex flex-col items-center justify-center space-y-3 pt-2">
        <button
          type="button"
          onClick={handleTapToSpeak}
          className="px-8 py-4 rounded-full bg-[#1B4332] hover:bg-[#143225] text-white font-bold text-sm sm:text-base flex items-center gap-3 transition-all shadow-md hover:shadow-lg hover:scale-[1.03] cursor-pointer"
        >
          <Mic className="w-5 h-5 text-[#D8F3DC]" />
          <span>Tap to Speak in {activeLang}</span>
        </button>

        <p className="text-xs text-[#6C7A89] text-center font-normal">
          Speak naturally in Hindi, Telugu, Tamil, Bengali, Hinglish, or English.
        </p>

        {/* Quick Language Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          {languages.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setActiveLang(l.split(" ")[0])}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                activeLang === l.split(" ")[0]
                  ? "bg-[#0056B3] text-white border-[#0056B3] shadow-xs"
                  : "bg-white text-[#6C7A89] border-[#DEE2E6] hover:border-[#0056B3]"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Text Fallback Input Bar */}
      <div className="pt-2 border-t border-[#E9ECEF]">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Or type symptoms in any language..."
            className="flex-1 px-4 py-3 rounded-full bg-[#F8F9FA] border border-[#DEE2E6] text-xs sm:text-sm text-[#2C3E50] placeholder:text-[#95A5A6] focus:outline-none focus:border-[#0056B3] transition-colors"
          />
          <button
            type="submit"
            className="w-11 h-11 rounded-full bg-[#1B4332] hover:bg-[#143225] text-white flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shadow-xs shrink-0"
            title="Start Consultation"
          >
            <Send className="w-4 h-4 text-[#D8F3DC]" />
          </button>
        </form>
      </div>
    </div>
  );
}
