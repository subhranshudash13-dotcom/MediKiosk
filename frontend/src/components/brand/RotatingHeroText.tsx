"use client";

import { useState, useEffect } from "react";

const KEYWORDS = [
  { text: "Insights", color: "from-[#9333EA] to-[#C084FC] text-[#C084FC]" },
  { text: "Triage", color: "from-[#0056B3] to-[#38BDF8] text-[#38BDF8]" },
  { text: "Rx Intake", color: "from-[#059669] to-[#34D399] text-[#34D399]" },
  { text: "Histories", color: "from-[#D97706] to-[#FBBF24] text-[#FBBF24]" },
  { text: "ABDM", color: "from-[#DB2777] to-[#F472B6] text-[#F472B6]" },
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
