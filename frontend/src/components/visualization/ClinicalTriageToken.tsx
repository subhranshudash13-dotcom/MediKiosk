"use client";

import { motion } from "framer-motion";
import { QrCode, Stethoscope, User, MapPin, Printer, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative overflow-hidden max-w-xl mx-auto text-left rounded-[16px] bg-white border p-6 sm:p-8 shadow-sm space-y-6",
        isEmergency
          ? "border-red-200 ring-2 ring-red-100"
          : isUrgent
          ? "border-amber-200 ring-2 ring-amber-100"
          : "border-[#FDEBD0]",
        className
      )}
    >
      {/* Ticket Header */}
      <div className="flex items-center justify-between border-b border-dashed border-[#FDEBD0] pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1D2A8F]">
            MediKiosk OPD Token Slip
          </span>
          <h2 className="text-3xl font-heading font-extrabold text-[#374151] mt-0.5">#{tokenNumber}</h2>
        </div>

        <div className="text-right">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
              isEmergency
                ? "bg-red-50 text-[#C2410C] border border-red-200"
                : isUrgent
                ? "bg-amber-50 text-amber-800 border border-amber-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            )}
          >
            {isEmergency ? <AlertTriangle className="h-3 w-3 text-[#C2410C]" /> : <CheckCircle className="h-3 w-3" />}
            {isEmergency ? "Priority: Emergency" : isUrgent ? "Priority: Urgent Care" : "Priority: Routine"}
          </span>
          <p className="text-[11px] font-semibold text-[#374151]/70 mt-1">Est. Wait: {estimatedWait}</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3 rounded-[12px] bg-[#FDFBF7] p-4 border border-[#FDEBD0]">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-[#374151]/60">Patient</span>
            <p className="text-xs font-bold text-[#374151] flex items-center gap-1.5 mt-0.5">
              <User className="h-3.5 w-3.5 text-[#1D2A8F]" />
              {patientName} (54M)
            </p>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-[#374151]/60">Assigned Physician</span>
            <p className="text-xs font-bold text-[#1D2A8F] flex items-center gap-1.5 mt-0.5">
              <Stethoscope className="h-3.5 w-3.5 text-[#1D2A8F]" />
              {assignedDoctor}
            </p>
          </div>
          <div className="col-span-2 border-t border-[#FDEBD0]/80 pt-2.5">
            <span className="text-[10px] font-mono uppercase font-bold text-[#374151]/60">Location</span>
            <p className="text-xs font-semibold text-[#374151] flex items-center gap-1.5 mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-[#FB923C]" />
              {roomNumber}
            </p>
          </div>
        </div>

        {/* Triage Complaint */}
        <div className="rounded-[12px] border border-[#FDEBD0] bg-[#FDFBF7] p-4">
          <p className="text-[10px] font-mono uppercase font-bold text-[#1D2A8F]">Pre-Consultation Clinical Intake:</p>
          <p className="text-xs font-semibold text-[#374151] mt-1 leading-relaxed">
            “{chiefComplaint}”
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#FDEBD0] pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[8px] border border-[#FDEBD0] bg-white p-1 shadow-xs">
            <QrCode className="h-9 w-9 text-[#1D2A8F]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#374151]">Scan for Live Queue</p>
            <p className="text-[10px] text-[#374151]/60">ABHA Mobile App Compatible</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-full border border-[#FDEBD0] bg-[#FDFBF7] hover:bg-white text-xs font-bold text-[#374151] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="h-3.5 w-3.5 text-[#374151]/70" />
            <span>Print</span>
          </button>
          <Button
            onClick={onProceedToDoctor}
            className="rounded-full bg-[#1D2A8F] hover:bg-[#15206B] text-white text-xs font-bold px-4 py-2 shadow-xs transition-all"
          >
            <span>Enter Doctor View</span>
            <ArrowRight className="ml-1.5 h-3.5 w-3.5 text-[#FB923C]" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
