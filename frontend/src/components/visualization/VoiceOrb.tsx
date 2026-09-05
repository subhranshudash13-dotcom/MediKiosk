"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    idle: { color: "#1D2A8F", text: "● Idle", ring: "transparent" },
    ready: { color: "#1D2A8F", text: "● Ready", ring: "#1D2A8F" },
    listening: { color: "#FB923C", text: "◉ Listening...", ring: "#FB923C" },
    understanding: { color: "#1D2A8F", text: "✦ Understanding...", ring: "#FDEBD0" },
    structuring: { color: "#C2410C", text: "◎ Structuring symptoms...", ring: "#C2410C" },
    complete: { color: "#047857", text: "✓ History prepared", ring: "#047857" },
  };

  const config = stateConfig[currentState];

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6">
      {/* Orb Container */}
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Animated Rings */}
        <AnimatePresence>
          {(currentState === "listening" || currentState === "understanding") && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0.4, 0], scale: [1, 1.8] }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
              className="absolute inset-0 rounded-full"
              style={{ border: `2px solid ${config.color}` }}
            />
          )}
        </AnimatePresence>

        {/* The Core Orb */}
        <motion.div
          animate={{
            scale: currentState === "listening" ? (pulse ? 1.08 : 0.96) : 1,
            backgroundColor: config.color,
          }}
          transition={{ duration: 0.3 }}
          className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full shadow-subtle"
        >
          {currentState === "listening" && (
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ height: pulse ? [4, 14, 4] : 4 }}
                  transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.1 }}
                  className="w-1 rounded-full bg-white"
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* State Text */}
      <motion.p
        key={currentState}
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-mono text-xs font-semibold uppercase tracking-wider"
        style={{ color: config.color }}
      >
        {config.text}
      </motion.p>
    </div>
  );
}
