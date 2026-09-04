"use client";

import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroClinicalIllustration({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto w-full max-w-lg select-none", className)}>
      {/* Background Soft Organic Pastel Aura */}
      <div className="absolute -top-6 -left-6 h-72 w-72 rounded-full bg-[#E6FAF3] filter blur-3xl opacity-70" />
      <div className="absolute -bottom-6 -right-6 h-72 w-72 rounded-full bg-[#F3E6FF] filter blur-3xl opacity-70" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-[#FFF7E6] filter blur-2xl opacity-60" />

      {/* Main Illustration Container without overlapping boxes */}
      <div className="relative rounded-3xl overflow-hidden bg-white/60 backdrop-blur-sm border border-slate-200/80 p-2.5 shadow-md">
        <img
          src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=900&q=80"
          alt="Compassionate healthcare professional consulting with senior patient"
          className="h-96 w-full rounded-2xl object-cover object-center shadow-xs"
        />

        {/* Floating Soundwave Badge (Top Right) */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute top-6 right-6 flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1.5 shadow-md border border-slate-100"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6B9A] text-white">
            <Volume2 className="h-3 w-3" />
          </span>
          <div className="flex items-center gap-1">
            <span className="h-2 w-1 rounded-full bg-[#FF6B9A] animate-pulse" />
            <span className="h-3.5 w-1 rounded-full bg-[#6A5CFF] animate-pulse" />
            <span className="h-2.5 w-1 rounded-full bg-[#00C9A7] animate-pulse" />
          </div>
          <span className="text-[10px] font-extrabold text-[#0D1B2A] pl-1">Live Voice Active</span>
        </motion.div>
      </div>
    </div>
  );
}
