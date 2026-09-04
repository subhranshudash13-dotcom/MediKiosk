"use client";

import { motion } from "framer-motion";

export function PatientDoctorIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Background Organic Ambient Glow */}
      <div className="absolute inset-0 bg-radial from-mint/30 via-transparent to-transparent blur-2xl pointer-events-none -z-10" />

      <svg
        viewBox="0 0 600 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-[560px] drop-shadow-sm"
      >
        {/* Soft Organic Background Shape */}
        <path
          d="M80 200C60 110 140 40 260 50C380 60 480 100 500 200C520 300 430 360 300 370C170 380 100 290 80 200Z"
          fill="#CDEFE0"
          fillOpacity="0.35"
        />

        {/* Botanical / Organic Line Accents */}
        <motion.path
          d="M 50 320 Q 90 280 110 330 T 150 290"
          stroke="#173B32"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.25"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* PATIENT SEATED (LEFT) */}
        <g id="patient">
          {/* Chair Base */}
          <path d="M 140 280 L 220 280 M 160 280 L 160 360 M 200 280 L 200 360" stroke="#173B32" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.4" />
          {/* Seated Body Outline */}
          <path
            d="M 170 210 C 160 230 155 250 165 275 L 210 275 C 215 250 200 230 190 210 Z"
            fill="#173B32"
            fillOpacity="0.15"
            stroke="#173B32"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Head with calm profile posture */}
          <circle cx="180" cy="180" r="24" fill="#F8F7F2" stroke="#173B32" strokeWidth="2.5" />
          {/* Shoulder/Arm leaning towards clinician */}
          <path d="M 190 220 C 210 230 230 240 250 245" stroke="#173B32" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* DOCTOR LEANING FORWARD WITH LISTEN POSTURE (RIGHT) */}
        <g id="doctor">
          {/* Stool Base */}
          <path d="M 380 290 L 440 290 M 410 290 L 410 360" stroke="#173B32" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.4" />
          {/* Leaning Body Outline */}
          <path
            d="M 370 220 C 360 245 375 270 395 285 L 435 285 C 430 260 415 235 400 215 Z"
            fill="#173B32"
            fillOpacity="0.85"
            stroke="#173B32"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Head listening attentively */}
          <circle cx="380" cy="175" r="24" fill="#F8F7F2" stroke="#173B32" strokeWidth="2.5" />
          {/* Arm holding clinical tablet / posture */}
          <path d="M 370 225 L 320 240" stroke="#F8F7F2" strokeWidth="3" strokeLinecap="round" />
          {/* Stethoscope Accent */}
          <path d="M 375 198 Q 365 215 360 230" stroke="#FF7667" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* CONNECTING PULSE WAVE BETWEEN PATIENT & CLINICIAN */}
        <motion.path
          d="M 230 235 Q 260 220 280 235 T 330 235"
          stroke="#7667F5"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0.3 }}
          animate={{ pathLength: [0, 1, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Empathy Signal Nodes */}
        <circle cx="280" cy="235" r="4" fill="#FF7667" />
        <circle cx="300" cy="230" r="3" fill="#7667F5" />
      </svg>
    </div>
  );
}
