import Link from "next/link";
import { cn } from "@/lib/utils";

export function PetalLogo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  const content = (
    <div className={cn("inline-flex items-center gap-3", className)}>
      {/* 4-Petal Multi-color Emblem from Design Spec */}
      <div className="relative flex h-9 w-9 items-center justify-center">
        {/* Top Petal - Pink */}
        <span className="absolute top-0 h-4 w-4 rounded-full bg-[#FF6B9A] opacity-90 transition-transform hover:scale-110" />
        {/* Left Petal - Purple */}
        <span className="absolute left-0 h-4 w-4 rounded-full bg-[#6A5CFF] opacity-90 transition-transform hover:scale-110" />
        {/* Right Petal - Amber */}
        <span className="absolute right-0 h-4 w-4 rounded-full bg-[#FFB703] opacity-90 transition-transform hover:scale-110" />
        {/* Bottom Petal - Mint */}
        <span className="absolute bottom-0 h-4 w-4 rounded-full bg-[#00C9A7] opacity-90 transition-transform hover:scale-110" />
      </div>

      <div className="flex flex-col text-left">
        <span className="font-sans text-lg font-black tracking-tight text-[#0D1B2A] leading-tight">
          MediKiosk
        </span>
        <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#6B7280]">
          CLINICAL CARE
        </span>
      </div>
    </div>
  );

  if (!href) return content;
  return <Link href={href} className="inline-flex">{content}</Link>;
}
