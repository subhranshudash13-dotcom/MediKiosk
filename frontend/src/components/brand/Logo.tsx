import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
  variant = "dark",
}: {
  href?: string;
  className?: string;
  variant?: "dark" | "light";
}) {
  const isLight = variant === "light";

  const content = (
    <div className={cn("inline-flex items-center gap-3 select-none group", className)}>
      {/* Official MediKiosk Resonance Cross Emblem */}
      <div className="relative flex h-9 w-9 items-center justify-center transition-transform group-hover:scale-105">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full drop-shadow-xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Medical Cross */}
          <path
            d="M 37 18 A 8 8 0 0 1 45 10 L 55 10 A 8 8 0 0 1 63 18 L 63 37 L 82 37 A 8 8 0 0 1 90 45 L 90 55 A 8 8 0 0 1 82 63 L 63 63 L 63 82 A 8 8 0 0 1 55 90 L 45 90 A 8 8 0 0 1 37 82 L 37 63 L 18 63 A 8 8 0 0 1 10 55 L 10 45 A 8 8 0 0 1 18 37 L 37 37 Z"
            fill={isLight ? "#ffffff" : "#0f172a"}
          />
          {/* Active Voice & Vital Pulse Waveform */}
          <path
            d="M 12 50 L 35 50 L 40 45 L 46 22 L 54 78 L 60 36 L 65 50 L 88 50"
            stroke={isLight ? "#38bdf8" : "#0284c7"}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "font-sans text-xl font-black tracking-tight leading-none",
              isLight ? "text-white" : "text-[#0f172a]"
            )}
          >
            Medi<span className={isLight ? "text-sky-400" : "text-sky-600"}>Kiosk</span>
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <span
          className={cn(
            "text-[9px] font-extrabold uppercase tracking-[0.24em] mt-1 leading-none",
            isLight ? "text-slate-400" : "text-slate-500"
          )}
        >
          Intelligent OPD Intake
        </span>
      </div>
    </div>
  );

  if (!href) return content;
  return <Link href={href} className="inline-flex">{content}</Link>;
}
