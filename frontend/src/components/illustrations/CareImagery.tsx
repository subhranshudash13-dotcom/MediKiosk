"use client";

import { ArrowUpRight, Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Decorative 4-dot diamond accent from reference
export function DotAccent({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-1.5 w-3.5 h-3.5 opacity-30 text-[#455A2F]", className)}>
      <span className="h-1 w-1 rounded-full bg-current" />
      <span className="h-1 w-1 rounded-full bg-current" />
      <span className="h-1 w-1 rounded-full bg-current" />
      <span className="h-1 w-1 rounded-full bg-current" />
    </div>
  );
}

// Circular Action Badge with Diagonal Arrow from reference
export function CircleActionBadge({
  icon: Icon = ArrowUpRight,
  className,
  onClick,
}: {
  icon?: any;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#455A2F] text-white shadow-md transition-all duration-200 hover:scale-110 hover:bg-[#344722] active:scale-95",
        className
      )}
    >
      <Icon className="h-4 w-4 stroke-[2.5]" />
    </button>
  );
}

// Hero Compassionate Caregiver & Patient Photo Frame (Exact arched composition from reference)
export function HeroCareImage({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto w-full max-w-xl", className)}>
      {/* Outer Arched Photo Window */}
      <div className="relative overflow-hidden rounded-t-[200px] rounded-b-[48px] border-8 border-white shadow-[0_12px_40px_rgba(30,40,22,0.1)] bg-[#F3ECE2] aspect-[4/3] sm:aspect-[16/11]">
        <img
          src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1000&q=80"
          alt="Warm compassionate doctor and patient consulting in bright sunlight"
          className="h-full w-full object-cover object-center"
        />

        {/* Floating Circular Green Stamp from reference */}
        <div className="absolute bottom-6 left-[42%] flex h-16 w-16 items-center justify-center rounded-full bg-[#455A2F] text-white p-2 text-center text-[9px] font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-transform border-2 border-white cursor-pointer">
          Learn Who We Are
        </div>
      </div>

      {/* Signature Arched Floating Card (Warmth & Care Brought to Your Kiosk) */}
      <div className="absolute -bottom-8 -left-4 sm:left-4 max-w-[280px] rounded-t-[70px] rounded-b-[28px] bg-white p-6 text-left border border-[#EAE2D5] shadow-[0_8px_30px_rgba(30,40,22,0.08)]">
        <DotAccent className="absolute top-4 right-4" />
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#5E6E54]">
          W a r m t h   &   C a r e
        </p>
        <h3 className="font-serif text-2xl font-bold text-[#1E2816] mt-1 leading-tight">
          Brought to Your <span className="text-[#455A2F] italic">Kiosk</span>
        </h3>
      </div>
    </div>
  );
}

// Secondary Healthcare Photo Frame (Nurses & Doctor in Green Mission Section)
export function ClinicalTeamImage({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto w-full max-w-md overflow-hidden rounded-t-[160px] rounded-b-[36px] border-8 border-white shadow-xl bg-[#F3ECE2]", className)}>
      <img
        src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80"
        alt="Supportive medical assistant helping patient"
        className="h-full w-full object-cover min-h-[320px]"
      />
    </div>
  );
}
