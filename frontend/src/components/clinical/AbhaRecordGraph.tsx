"use client";

import { motion } from "framer-motion";
import { Database, FileSpreadsheet, Pill, Activity, Stethoscope } from "lucide-react";

export function AbhaRecordGraph() {
  const recordNodes = [
    { label: "Lab Reports", desc: "CBC & Biomarkers", icon: FileSpreadsheet, pos: "top-0 left-4" },
    { label: "Prescriptions", desc: "Digital Rx Sync", icon: Pill, pos: "top-0 right-4" },
    { label: "Diagnosis", desc: "ICD-11 Linked", icon: Activity, pos: "bottom-0 left-4" },
    { label: "Visit Summary", desc: "OPD Telemetry", icon: Stethoscope, pos: "bottom-0 right-4" },
  ];

  return (
    <div className="w-full py-12 px-6 rounded-clinical border border-forest/10 bg-white/90 backdrop-blur-sm shadow-clinical">
      <div className="text-center max-w-lg mx-auto mb-12">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-forest/50">
          NATIONAL HEALTH STACK (ABDM)
        </span>
        <h3 className="text-2xl font-bold text-forest tracking-tight mt-1">
          ABHA Longitudinal Health Vault
        </h3>
        <p className="text-xs text-ink/60 mt-1 font-medium">
          Encrypted interoperable record exchange connecting patient history across healthcare providers.
        </p>
      </div>

      <div className="relative max-w-xl mx-auto h-[320px] flex items-center justify-center">
        {/* CENTER ABHA FOLDER DOCUMENT */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="z-10 flex flex-col items-center justify-center h-32 w-44 rounded-clinical border-2 border-forest bg-forest text-ivory shadow-lg text-center p-4 cursor-pointer"
        >
          <Database className="h-6 w-6 text-mint mb-1" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-mint">ABHA VAULT</p>
          <p className="font-mono text-xs font-bold mt-0.5">91-8274-1029-44</p>
        </motion.div>

        {/* CONNECTING SVG LINES */}
        <svg className="absolute inset-0 w-full h-full stroke-forest/25 fill-none" strokeWidth="1.5" strokeDasharray="4 4">
          <line x1="20%" y1="20%" x2="50%" y2="50%" />
          <line x1="80%" y1="20%" x2="50%" y2="50%" />
          <line x1="20%" y1="80%" x2="50%" y2="50%" />
          <line x1="80%" y1="80%" x2="50%" y2="50%" />
        </svg>

        {/* SATELLITE RECORD NODES */}
        {recordNodes.map((node, i) => {
          const Icon = node.icon;
          return (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className={`absolute ${node.pos} z-10 flex items-center gap-3 rounded-data border border-forest/15 bg-ivory p-3 shadow-sm min-w-[170px] cursor-pointer`}
            >
              <div className="h-8 w-8 rounded-full bg-mint/40 flex items-center justify-center text-forest shrink-0">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-forest leading-tight">{node.label}</p>
                <p className="text-[10px] text-ink/50 font-medium">{node.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
