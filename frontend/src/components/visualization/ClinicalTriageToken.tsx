"use client";

import { motion } from "framer-motion";
import { QrCode, Stethoscope, User, MapPin, Printer, ArrowRight, CheckCircle, AlertTriangle, Clock } from "lucide-react";
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
  assignedDoctor = "Dr. S. K. Mukherjee, MD",
  roomNumber = "OPD Room 12 (1st Floor)",
  estimatedWait = "8 mins",
  onProceedToDoctor,
  className,
}: ClinicalTriageTokenProps) {
  const isEmergency = urgencyLevel === "emergency";
  const isUrgent = urgencyLevel === "urgent";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative overflow-hidden max-w-xl mx-auto text-left rounded-2xl bg-white border p-6 sm:p-8 shadow-subtle space-y-6",
        isEmergency
          ? "border-[#F5D5CB] ring-2 ring-[#FDF3F0]"
          : isUrgent
          ? "border-[#F5E6CC] ring-2 ring-[#FEF9EE]"
          : "border-[#E0D7C9]",
        className
      )}
    >
      {/* Ticket Header */}
      <div className="flex items-center justify-between border-b border-dashed border-[#E0D7C9] pb-4">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1B4332]">
            MediKiosk First-Mile OPD Token
          </span>
          <h2 className="text-3xl font-heading font-extrabold text-[#1F2421] mt-0.5">{tokenNumber}</h2>
        </div>

        <div className="text-right">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
              isEmergency
                ? "bg-[#FDF3F0] text-[#9C4124] border border-[#F5D5CB]"
                : isUrgent
                ? "bg-[#FEF9EE] text-[#B45309] border border-[#F5E6CC]"
                : "bg-[#E8F5EE] text-[#1B4332] border border-[#C6E7D2]"
            )}
          >
            {isEmergency ? <AlertTriangle className="h-3.5 w-3.5 text-[#9C4124]" /> : <CheckCircle className="h-3.5 w-3.5 text-[#1B4332]" />}
            {isEmergency ? "Emergency Triage" : isUrgent ? "Priority Care" : "Routine Consultation"}
          </span>
          <p className="text-xs font-semibold text-[#606963] mt-1 flex items-center justify-end gap-1">
            <Clock className="w-3 h-3 text-[#606963]" />
            Est. Wait: {estimatedWait}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#FBF9F5] p-4 border border-[#E0D7C9]">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-[#606963]">Patient</span>
            <p className="text-xs font-bold text-[#1F2421] flex items-center gap-1.5 mt-0.5">
              <User className="h-3.5 w-3.5 text-[#1B4332]" />
              {patientName}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-[#606963]">Assigned Consultant</span>
            <p className="text-xs font-bold text-[#1B4332] flex items-center gap-1.5 mt-0.5">
              <Stethoscope className="h-3.5 w-3.5 text-[#1B4332]" />
              {assignedDoctor}
            </p>
          </div>
          <div className="col-span-2 border-t border-[#E0D7C9] pt-2.5">
            <span className="text-[10px] font-mono uppercase font-bold text-[#606963]">Consultation Location</span>
            <p className="text-xs font-semibold text-[#1F2421] flex items-center gap-1.5 mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-[#9C4124]" />
              {roomNumber}
            </p>
          </div>
        </div>

        {/* Structured Intake Summary */}
        <div className="rounded-xl border border-[#E0D7C9] bg-[#FBF9F5] p-4">
          <p className="text-[10px] font-mono uppercase font-bold text-[#1B4332]">Reconstructed Pre-Consultation Summary:</p>
          <p className="text-xs font-semibold text-[#1F2421] mt-1 leading-relaxed">
            “{chiefComplaint}”
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E0D7C9] pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#E0D7C9] bg-white p-1 shadow-subtle">
            <QrCode className="h-9 w-9 text-[#1B4332]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#1F2421]">Scan for Live Queue</p>
            <p className="text-[10px] text-[#606963]">ABHA &amp; Mobile Compatible</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-full border border-[#E0D7C9] bg-[#FBF9F5] hover:bg-white text-xs font-bold text-[#1F2421] transition-all flex items-center gap-1.5 cursor-pointer shadow-subtle"
          >
            <Printer className="h-3.5 w-3.5 text-[#606963]" />
            <span>Print Token</span>
          </button>
          <Button
            onClick={onProceedToDoctor}
            className="rounded-full bg-[#1B4332] hover:bg-[#081C15] text-white text-xs font-bold px-4 py-2 shadow-subtle transition-all"
          >
            <span>Doctor Storyboard</span>
            <ArrowRight className="ml-1.5 h-3.5 w-3.5 text-[#D8F3DC]" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
