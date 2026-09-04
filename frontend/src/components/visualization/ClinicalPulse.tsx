"use client";

import { motion } from "framer-motion";

export function ClinicalPulse({ className = "" }: { className?: string }) {
  // A sleek SVG path for a single heartbeat
  const path = "M 0 50 L 30 50 L 35 20 L 45 80 L 50 50 L 100 50";

  return (
    <div className={`relative h-12 w-full overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full stroke-coral"
        fill="none"
        strokeWidth="1.5"
      >
        <motion.path
          d={path}
          initial={{ pathLength: 0, opacity: 0, x: "-100%" }}
          animate={{
            pathLength: [0, 1, 1],
            opacity: [0, 1, 0],
            x: ["0%", "0%", "10%"]
          }}
          transition={{
            duration: 2.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 0.5
          }}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {/* Grid overlay for texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSJyZ2JhKDAsMCwwLDAuMDMpIiBmaWxsPSJub25lIj48cGF0aCBkPSJNMCA0MGw0MC00ME0wIDIwbDIwLTIwTTAgNjBsNDAtNDAiLz48L2c+PC9zdmc+')] opacity-50" />
    </div>
  );
}
