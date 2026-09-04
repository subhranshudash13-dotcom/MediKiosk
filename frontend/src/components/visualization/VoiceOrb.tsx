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
    idle: { color: "var(--color-primary)", text: "● Idle", ring: "transparent" },
    ready: { color: "var(--color-primary)", text: "● Ready", ring: "var(--color-primary)" },
    listening: { color: "var(--color-pulse)", text: "◉ Listening...", ring: "var(--color-pulse)" },
    understanding: { color: "var(--color-ai)", text: "✦ Understanding...", ring: "var(--color-ai)" },
    structuring: { color: "var(--color-warning)", text: "◎ Structuring symptoms...", ring: "var(--color-warning)" },
    complete: { color: "var(--color-mint)", text: "✓ History prepared", ring: "var(--color-mint)" },
  };

  const config = stateConfig[currentState];

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8">
      {/* Orb Container */}
      <div className="relative flex h-24 w-24 items-center justify-center">
        {/* Animated Rings */}
        <AnimatePresence>
          {(currentState === "listening" || currentState === "understanding") && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0.5, 0], scale: [1, 2] }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
              className="absolute inset-0 rounded-full"
              style={{ border: `2px solid ${config.color}` }}
            />
          )}
        </AnimatePresence>

        {/* The Core Orb */}
        <motion.div
          animate={{
            scale: currentState === "listening" ? (pulse ? 1.1 : 0.95) : 1,
            backgroundColor: config.color,
            boxShadow: `0 0 40px ${config.color}33`,
          }}
          transition={{ duration: 0.4 }}
          className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full"
        >
          {currentState === "listening" && (
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ height: pulse ? [4, 16, 4] : 4 }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
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
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-sans text-sm font-bold tracking-widest text-ink uppercase"
        style={{ color: config.color === "var(--color-primary)" ? "var(--color-ink)" : config.color }}
      >
        {config.text}
      </motion.p>
    </div>
  );
}
