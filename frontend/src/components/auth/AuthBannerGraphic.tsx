"use client";

import React from "react";

interface AuthBannerGraphicProps {
  title: string;
  subtitle?: string;
}

export function AuthBannerGraphic({ title, subtitle }: AuthBannerGraphicProps) {
  return (
    <div className="relative w-full h-[180px] sm:h-[200px] overflow-hidden rounded-t-[32px] sm:rounded-t-[40px] select-none">
      {/* Background SVG matching the warm artistic curves of the template */}
      <svg
        viewBox="0 0 400 200"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="warmTerracotta" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EB7255" />
            <stop offset="100%" stopColor="#DF6042" />
          </linearGradient>
          <linearGradient id="goldCurve" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DEC27E" />
            <stop offset="100%" stopColor="#C9A95B" />
          </linearGradient>
          <linearGradient id="sageCurve" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#56A88F" />
            <stop offset="100%" stopColor="#67B89F" />
          </linearGradient>
        </defs>

        {/* Main Warm Terracotta Base */}
        <rect width="400" height="200" fill="url(#warmTerracotta)" />

        {/* Left Ochre / Golden Circle */}
        <circle cx="40" cy="180" r="110" fill="url(#goldCurve)" />

        {/* Right Soft Sage Green Swell */}
        <circle cx="390" cy="180" r="120" fill="url(#sageCurve)" />

        {/* Subtle noise / organic overlay arc */}
        <path
          d="M0,0 Q180,60 400,20 L400,0 Z"
          fill="#FFFFFF"
          fillOpacity="0.06"
        />
      </svg>

      {/* Header Text */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center text-white">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading drop-shadow-sm">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-xs sm:text-sm font-medium text-white/90 max-w-[280px]">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
