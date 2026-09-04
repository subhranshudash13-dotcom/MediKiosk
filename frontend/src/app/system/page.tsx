import {
  Cpu,
  Server,
  Zap,
  ShieldCheck,
  Languages,
  Database,
  Activity,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

const SYSTEM_METRICS = [
  { label: "Groq LPU Inference", status: "Operational", latency: "240 ms", icon: Zap, iconBg: "bg-[#F3E6FF] text-[#6A5CFF]" },
  { label: "Whisper ASR Engine", status: "Operational", latency: "420 ms", icon: Cpu, iconBg: "bg-[#E6FAF3] text-[#00C9A7]" },
  { label: "Clinical Safety Gate", status: "Operational", latency: "15 ms", icon: ShieldCheck, iconBg: "bg-[#FFF7E6] text-[#FFB703]" },
  { label: "ABDM FHIR Bridge", status: "Operational", latency: "110 ms", icon: Database, iconBg: "bg-[#FF6B9A]/15 text-[#FF6B9A]" },
];

export default function SystemPage() {
  return (
    <AppShell>
      <div className="space-y-8 text-left">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F2FF] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#6A5CFF]">
            Architecture & Microservice Health
          </span>
          <h1 className="font-sans text-3xl md:text-4xl font-extrabold text-[#0D1B2A] mt-2">
            System Telemetry & Performance
          </h1>
          <p className="text-sm text-[#6B7280] leading-relaxed mt-2">
            Real-time latency metrics and operational health across our clinical NLP, speech recognition, and ABDM bridges.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {SYSTEM_METRICS.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div key={idx} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs text-left">
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${m.iconBg}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-[#00C9A7]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00C9A7] animate-pulse" />
                    {m.status}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#0D1B2A] mt-4">{m.label}</p>
                <p className="text-2xl font-sans font-black text-[#0D1B2A] mt-0.5">{m.latency}</p>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
