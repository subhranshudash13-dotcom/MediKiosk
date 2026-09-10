import React from "react";

export function TrustPartnerRibbon() {
  const specs = [
    {
      stat: "12+ Languages",
      label: "Indic Voice Speech-to-Text",
      accent: "text-white",
    },
    {
      stat: "SOCRATES",
      label: "Clinical Triage Protocol",
      accent: "text-[#38BDF8]",
    },
    {
      stat: "FHIR R4 & ABDM",
      label: "M1, M2, M3 & DPDP 2023",
      accent: "text-white",
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto pt-4 pb-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 bg-white/[0.06] border border-white/15 rounded-2xl backdrop-blur-md shadow-lg overflow-hidden">
        {specs.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 sm:p-4 text-center flex flex-col items-center justify-center hover:bg-white/[0.04] transition-colors"
          >
            <span className={`font-heading font-extrabold text-base sm:text-lg tracking-tight ${item.accent}`}>
              {item.stat}
            </span>
            <span className="text-[11px] sm:text-xs text-white/65 font-medium mt-0.5 tracking-normal">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
