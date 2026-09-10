"use client";

import { useState, useEffect } from "react";

const KEYWORDS = [
  { text: "Insights", color: "from-[#7C3AED] to-[#9333EA] text-[#7C3AED]" },
  { text: "Triage", color: "from-[#0056B3] to-[#0284C7] text-[#0056B3]" },
  { text: "Rx Intake", color: "from-[#059669] to-[#10B981] text-[#059669]" },
  { text: "Histories", color: "from-[#D97706] to-[#F59E0B] text-[#D97706]" },
  { text: "ABDM", color: "from-[#DB2777] to-[#EC4899] text-[#DB2777]" },
];

export function RotatingHeroText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % KEYWORDS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const current = KEYWORDS[index];

  return (
    <span className="inline-block whitespace-nowrap text-left">
      <span
        key={current.text}
        className={`bg-gradient-to-r ${current.color} bg-clip-text text-transparent font-extrabold transition-all duration-500`}
      >
        {current.text}
      </span>
    </span>
  );
}
