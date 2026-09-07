"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Sparkles, Check, Clock, Brain } from "lucide-react";

export type OrbState = "idle" | "ready" | "listening" | "understanding" | "structuring" | "complete";

export function VoiceOrb({ currentState = "idle" }: { currentState?: OrbState }) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (currentState === "listening") {
      const interval = setInterval(() => setPulse((p) => !p), 400);
      return () => clearInterval(interval);
    }
  }, [currentState]);

  const stateConfig = {
    idle: {
      color: "#1B4332",
      bg: "#E8F5EE",
      text: "Ready for Spoken Input",
      subtext: "Touch microphone below to start speaking",
      icon: Mic
    },
    ready: {
      color: "#1B4332",
      bg: "#E8F5EE",
      text: "Acoustic Standby",
      subtext: "Speak naturally in your native language",
      icon: Mic
    },
    listening: {
      color: "#9C4124",
      bg: "#FDF3F0",
      text: "Listening to Your Complaint...",
      subtext: "Speak clearly at a normal conversation pace",
      icon: Mic
    },
    understanding: {
      color: "#2D6A4F",
      bg: "#E8F5EE",
      text: "Processing Clinical Speech...",
      subtext: "Synthesizing medical entities & SOCRATES markers",
      icon: Brain
    },
    structuring: {
      color: "#1B4332",
      bg: "#EFEBE2",
      text: "Structuring Longitudinal Context...",
      subtext: "Connecting historical records with current symptoms",
      icon: Sparkles
    },
    complete: {
      color: "#2D6A4F",
      bg: "#D8F3DC",
      text: "Intake Successfully Structured",
      subtext: "Evidence nodes linked for consulting physician",
      icon: Check
    },
  };

  const config = stateConfig[currentState];
  const IconComponent = config.icon;

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4 text-center">
      {/* Tactile Acoustic Indicator */}
      <div className="relative flex h-16 w-16 items-center justify-center">
        <motion.div
          animate={{
            scale: currentState === "listening" ? (pulse ? 1.05 : 0.98) : 1,
          }}
          transition={{ duration: 0.3 }}
          style={{ backgroundColor: config.bg, borderColor: config.color }}
          className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border-2 shadow-subtle"
        >
          <IconComponent
            className="w-7 h-7 transition-colors duration-200"
            style={{ color: config.color }}
          />
        </motion.div>
      </div>

      {/* State Text */}
      <div className="space-y-0.5">
        <p
          className="font-heading text-sm font-bold tracking-tight"
          style={{ color: config.color }}
        >
          {config.text}
        </p>
        <p className="text-xs text-[#606963] font-medium">
          {config.subtext}
        </p>
      </div>
    </div>
  );
}
