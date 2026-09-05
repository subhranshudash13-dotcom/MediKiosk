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
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      {/* 4-Petal Master Palette Emblem */}
      <div className="relative flex h-8 w-8 items-center justify-center">
        {/* Top Petal - Cobalt Navy */}
        <span className="absolute top-0 h-3.5 w-3.5 rounded-full bg-[#1D2A8F]" />
        {/* Left Petal - Rust */}
        <span className="absolute left-0 h-3.5 w-3.5 rounded-full bg-[#C2410C]" />
        {/* Right Petal - Marigold */}
        <span className="absolute right-0 h-3.5 w-3.5 rounded-full bg-[#FB923C]" />
        {/* Bottom Petal - Slate Charcoal */}
        <span className="absolute bottom-0 h-3.5 w-3.5 rounded-full bg-[#374151]" />
      </div>

      <div className="flex flex-col text-left">
        <span className="font-heading text-base font-bold tracking-tight text-[#1D2A8F] leading-none">
          Medi<span className="text-[#C2410C]">Kiosk</span>
        </span>
        <span className="text-[9px] font-medium uppercase tracking-wider text-[#374151]/70 mt-0.5 leading-none">
          Clinical Care
        </span>
      </div>
    </div>
  );

  if (!href) return content;
  return <Link href={href} className="inline-flex focus:outline-none">{content}</Link>;
}
