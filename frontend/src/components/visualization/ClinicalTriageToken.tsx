"use client";

import { motion } from "framer-motion";
import { QrCode, Stethoscope, User, MapPin, Printer, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import { DotAccent } from "@/components/illustrations/CareImagery";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ClinicalTriageTokenProps {
  tokenNumber?: string;
  patientName?: string;
  urgencyLevel?: "emergency" | "urgent" | "routine";
  chiefComplaint?: string;
  assignedDoctor?: string;
  roomNumber?: string;
  estimatedWait?: string;
  onProceedToDoctor?: () => void;
  className?: string;
}

export function ClinicalTriageToken({
  tokenNumber = "A-104",
  patientName = "Suresh Patel",
  urgencyLevel = "urgent",
  chiefComplaint = "Sub-sternal chest heaviness & nocturnal fever spikes",
  assignedDoctor = "Dr. Ananya Sharma, MD",
  roomNumber = "OPD Room 302 (1st Floor)",
  estimatedWait = "8 mins",
  onProceedToDoctor,
  className,
}: ClinicalTriageTokenProps) {
  const isEmergency = urgencyLevel === "emergency";
  const isUrgent = urgencyLevel === "urgent";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "card-arch-top relative overflow-hidden max-w-xl mx-auto text-left",
        isEmergency
          ? "border-coral/50 bg-coral-soft/30 ring-2 ring-coral/20"
          : isUrgent
          ? "border-amber/50 bg-amber-soft/30 ring-2 ring-amber/20"
          : "border-line bg-paper",
        className
      )}
    >
      <DotAccent className="absolute top-5 right-5" />

      {/* Ticket Header */}
      <div className="flex items-center justify-between border-b border-dashed border-line pb-4">
        <div>
          <span className="label-eyebrow">Aarogya OPD Kiosk Token</span>
          <h2 className="text-3xl font-serif font-black text-ink mt-0.5">#{tokenNumber}</h2>
        </div>

        <div className="text-right">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
              isEmergency
                ? "bg-coral text-white"
                : isUrgent
                ? "bg-amber text-white"
                : "bg-olive text-white"
            )}
          >
            {isEmergency ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
            {isEmergency ? "Priority: Emergency" : isUrgent ? "Priority: Urgent Care" : "Priority: Routine"}
          </span>
          <p className="text-[11px] font-semibold text-ink-muted mt-1">Est. Wait: {estimatedWait}</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-3.5 rounded-2xl bg-oat/50 p-4 border border-line">
          <div>
            <span className="label-eyebrow">Patient</span>
            <p className="text-xs font-bold text-ink flex items-center gap-1.5 mt-0.5">
              <User className="h-3.5 w-3.5 text-olive" />
              {patientName} (54M)
            </p>
          </div>
          <div>
            <span className="label-eyebrow">Assigned Physician</span>
            <p className="text-xs font-bold text-olive flex items-center gap-1.5 mt-0.5">
              <Stethoscope className="h-3.5 w-3.5 text-olive" />
              {assignedDoctor}
            </p>
          </div>
          <div className="col-span-2 border-t border-line/60 pt-2.5">
            <span className="label-eyebrow">Location</span>
            <p className="text-xs font-semibold text-ink flex items-center gap-1.5 mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-olive" />
              {roomNumber}
            </p>
          </div>
        </div>

        {/* Triage Complaint */}
        <div className="rounded-2xl border border-olive/30 bg-olive-soft/60 p-4">
          <p className="label-eyebrow text-olive">Pre-Consultation Clinical Intake:</p>
          <p className="text-xs font-semibold text-olive-deep mt-1 leading-relaxed">
            “{chiefComplaint}”
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-paper p-1 shadow-xs">
            <QrCode className="h-9 w-9 text-ink" />
          </div>
          <div>
            <p className="text-xs font-bold text-ink">Scan for Live Queue</p>
            <p className="text-[10px] text-ink-muted">ABHA Mobile App Compatible</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="btn-pill-secondary text-xs py-2 px-3.5"
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
          <Button
            onClick={onProceedToDoctor}
            className="btn-pill-primary text-xs py-2 px-4"
          >
            Enter Doctor View <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
