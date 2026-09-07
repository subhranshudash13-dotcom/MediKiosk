"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function useAudioLevel(active: boolean) {
  const [level, setLevel] = useState(0.18);

  useEffect(() => {
    if (!active) {
      setLevel(0.12);
      return;
    }

    let ctx: AudioContext | null = null;
    let stream: MediaStream | null = null;
    let raf = 0;
    let cancelled = false;

    const simulate = () => {
      const tick = () => {
        if (cancelled) return;
        setLevel(0.22 + Math.random() * 0.58);
        raf = window.setTimeout(tick, 90);
      };
      tick();
    };

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const data = new Uint8Array(analyser.fftSize);

        const loop = () => {
          if (cancelled) return;
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length);
          setLevel(Math.min(1, 0.16 + rms * 4.2));
          raf = requestAnimationFrame(loop);
        };
        loop();
      } catch {
        simulate();
      }
    })();

    return () => {
      cancelled = true;
      if (typeof raf === "number") cancelAnimationFrame(raf);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (ctx) ctx.close().catch(() => {});
    };
  }, [active]);

  return { level };
}

export function VoiceWaveform({
  active = false,
  level = 0.2,
  className,
}: {
  active?: boolean;
  level?: number;
  className?: string;
}) {
  const bars = [0.35, 0.6, 0.9, 0.75, 1, 0.8, 0.95, 0.5, 0.4, 0.7, 0.85, 0.65, 0.45];

  return (
    <div className={cn("flex flex-col items-center gap-3 rounded-2xl border border-[#E0D7C9] bg-white p-5 shadow-subtle", className)}>
      {/* Physiological Acoustic Monitor Line in Sage & Pine */}
      <div className="relative w-full h-8 overflow-hidden border-b border-[#E0D7C9] pb-2">
        <svg viewBox="0 0 300 30" className="w-full h-full stroke-[#2D6A4F]" fill="none" strokeWidth="1.75">
          <path
            d="M0 15 L45 15 L52 10 L60 20 L68 15 L100 15 L108 4 L114 26 L122 8 L128 19 L136 15 L200 15 L208 9 L214 21 L220 15 L300 15"
            strokeDasharray="6 3"
            className={active ? "opacity-90" : "opacity-30"}
          />
        </svg>
        <span className="absolute top-0 right-1 text-[10px] font-mono font-semibold uppercase text-[#606963]">
          {active ? "● Live Acoustic Stream" : "○ Microphone Standby"}
        </span>
      </div>

      {/* Tactile Frequency Amplitude Bars in Terracotta & Forest Pine */}
      <div className="flex h-12 items-center justify-center gap-1.5 px-4">
        {bars.map((weight, i) => {
          const height = active ? Math.max(8, Math.min(44, weight * level * 48)) : 6;
          return (
            <span
              key={i}
              style={{ height: `${height}px` }}
              className={cn(
                "w-1.5 rounded-full transition-all duration-75",
                active ? "bg-[#1B4332]" : "bg-[#E0D7C9]"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
