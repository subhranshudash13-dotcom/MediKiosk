"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";

export function InteractiveConversationSplit() {
  return (
    <div className="w-full rounded-clinical border border-forest/10 bg-white p-8 shadow-clinical">
      <div className="flex items-center justify-between mb-8 border-b border-forest/10 pb-4">
        <div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-violet">
            REAL-TIME INTELLIGENCE
          </span>
          <h3 className="text-2xl font-bold text-forest tracking-tight mt-0.5">
            Conversation to Clinical Record
          </h3>
        </div>
        <span className="text-xs font-bold text-ink/40 uppercase tracking-widest">
          Simulated Voice Transformation
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* LEFT: HUMAN CONVERSATION */}
        <div className="lg:col-span-5 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">
            HUMAN CONVERSATION (VOICE INPUT)
          </p>

          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-data bg-ivory p-4 border border-ink/5 shadow-xs text-sm font-medium text-ink"
            >
              <span className="text-[10px] font-bold uppercase text-forest block mb-1">PATIENT</span>
              "Pain started yesterday evening right after I came home."
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-data bg-violet/10 p-4 border border-violet/20 text-sm font-medium text-forest text-right"
            >
              <span className="text-[10px] font-bold uppercase text-violet block mb-1">MEDIKIOSK</span>
              "Where exactly do you feel the pain, and how severe is it?"
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="rounded-data bg-ivory p-4 border border-ink/5 shadow-xs text-sm font-medium text-ink"
            >
              <span className="text-[10px] font-bold uppercase text-forest block mb-1">PATIENT</span>
              "It's in the middle of my chest. Around a 6 out of 10."
            </motion.div>
          </div>
        </div>

        {/* CENTER TRANSFORMATION ARROW WITH SIGNAL PULSE */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center py-4">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-violet/10 border border-violet/30 text-violet">
            <motion.div
              animate={{ x: [-4, 6, -4] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <ArrowRight className="h-5 w-5" />
            </motion.div>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-violet mt-2">
            Structuring
          </span>
        </div>

        {/* RIGHT: MACHINE INTERPRETATION */}
        <div className="lg:col-span-5 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-forest">
            STRUCTURED CLINICAL RECORD (DOCTOR READY)
          </p>

          <div className="rounded-data bg-ivory/80 p-5 border border-forest/15 shadow-sm space-y-4">
            {[
              { label: "SITE", val: "Chest (Sub-sternal)", status: "verified" },
              { label: "ONSET", val: "Yesterday evening", status: "verified" },
              { label: "CHARACTER", val: "Awaiting response...", status: "asking" },
              { label: "RADIATION", val: "Not established", status: "pending" },
              { label: "SEVERITY", val: "6 / 10 Pain Index", status: "verified" },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-ink/5 pb-2.5 last:border-0 last:pb-0">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-ink/40">{item.label}</p>
                  <p className={`text-xs font-bold ${item.status === 'asking' ? 'text-warning italic' : 'text-forest'}`}>
                    {item.val}
                  </p>
                </div>
                <div>
                  {item.status === "verified" && <CheckCircle2 className="h-4 w-4 text-forest" />}
                  {item.status === "asking" && <Clock className="h-3.5 w-3.5 text-warning animate-spin" />}
                  {item.status === "pending" && <span className="h-2 w-2 rounded-full border border-ink/20 block" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
