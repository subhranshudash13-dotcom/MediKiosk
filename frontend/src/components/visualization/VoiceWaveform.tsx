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
        setLevel(0.25 + Math.random() * 0.55);
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
    <div className={cn("flex flex-col items-center gap-3 rounded-3xl border border-line bg-paper p-5 shadow-xs", className)}>
      {/* Dynamic ECG Live Cardiac Rhythm Graphic */}
      <div className="relative w-full h-10 overflow-hidden border-b border-line/50">
        <svg viewBox="0 0 300 40" className="w-full h-full stroke-olive" fill="none" strokeWidth="2">
          <path
            d="M0 20 L50 20 L58 14 L66 26 L74 20 L110 20 L118 6 L124 34 L132 10 L138 24 L146 20 L210 20 L218 12 L224 28 L230 20 L300 20"
            strokeDasharray="8 4"
            className={active ? "animate-pulse" : "opacity-40"}
          />
        </svg>
        <span className="absolute top-1 right-2 text-[9px] font-mono font-bold uppercase text-ink-muted">
          {active ? "● Acoustic Stream Active" : "○ Microphone Standby"}
        </span>
      </div>

      {/* Tactile Frequency Bars */}
      <div className="flex h-12 items-center justify-center gap-1.5 px-4">
        {bars.map((weight, i) => {
          const height = active ? Math.max(12, Math.min(48, weight * level * 52)) : 6;
          return (
            <span
              key={i}
              style={{ height: `${height}px` }}
              className={cn(
                "w-1.5 rounded-full transition-all duration-75",
                active ? "bg-olive" : "bg-line"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
