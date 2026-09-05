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
      {/* MediKiosk Cross & Wave Emblem */}
      <div className="relative flex h-8 w-8 items-center justify-center transition-transform group-hover:scale-105">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Medical Cross in Cobalt Navy */}
          <path
            d="M 37 18 A 8 8 0 0 1 45 10 L 55 10 A 8 8 0 0 1 63 18 L 63 37 L 82 37 A 8 8 0 0 1 90 45 L 90 55 A 8 8 0 0 1 82 63 L 63 63 L 63 82 A 8 8 0 0 1 55 90 L 45 90 A 8 8 0 0 1 37 82 L 37 63 L 18 63 A 8 8 0 0 1 10 55 L 10 45 A 8 8 0 0 1 18 37 L 37 37 Z"
            fill={isLight ? "#ffffff" : "#1D2A8F"}
          />
          {/* Active Voice Pulse Waveform in Rust / Marigold */}
          <path
            d="M 14 50 L 35 50 L 40 45 L 46 24 L 54 76 L 60 38 L 65 50 L 86 50"
            stroke={isLight ? "#FB923C" : "#C2410C"}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "font-heading text-lg font-bold tracking-tight leading-none",
              isLight ? "text-white" : "text-[#1D2A8F]"
            )}
          >
            Medi<span className={isLight ? "text-[#FB923C]" : "text-[#C2410C]"}>Kiosk</span>
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#FB923C]" />
        </div>
        <span
          className={cn(
            "text-[10px] font-medium tracking-wider uppercase mt-0.5 leading-none",
            isLight ? "text-white/70" : "text-[#374151]/70"
          )}
        >
          Clinical Care
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D2A8F] rounded-[6px]">
        {content}
      </Link>
    );
  }

  return content;
}
