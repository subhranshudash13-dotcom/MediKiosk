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
        "relative overflow-hidden max-w-xl mx-auto text-left rounded-2xl bg-white border p-6 sm:p-8 shadow-md space-y-6",
        isEmergency
          ? "border-[#FECACA] ring-2 ring-[#FEF2F2]"
          : isUrgent
          ? "border-[#FDE68A] ring-2 ring-[#FEF3C7]"
          : "border-[#E2E8F0]",
        className
      )}
    >
      {/* Ticket Header */}
      <div className="flex items-center justify-between border-b border-dashed border-[#E2E8F0] pb-4">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0056B3]">
            MediKiosk First-Mile OPD Token
          </span>
          <h2 className="text-3xl font-heading font-extrabold text-[#1E293B] mt-0.5">{tokenNumber}</h2>
        </div>

        <div className="text-right">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
              isEmergency
                ? "bg-[#FEF2F2] text-[#DC3545] border border-[#FECACA]"
                : isUrgent
                ? "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]"
                : "bg-[#EAF7ED] text-[#28A745] border border-[#28A745]/20"
            )}
          >
            {isEmergency ? <AlertTriangle className="h-3.5 w-3.5 text-[#DC3545]" /> : <CheckCircle className="h-3.5 w-3.5 text-[#28A745]" />}
            {isEmergency ? "Emergency Triage" : isUrgent ? "Priority Care" : "Routine Consultation"}
          </span>
          <p className="text-xs font-semibold text-[#64748B] mt-1 flex items-center justify-end gap-1">
            <Clock className="w-3.5 h-3.5 text-[#64748B]" />
            Est. Wait: {estimatedWait}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#F8F9FA] p-4 border border-[#E2E8F0]">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-[#64748B]">Patient</span>
            <p className="text-xs font-bold text-[#1E293B] flex items-center gap-1.5 mt-0.5">
              <User className="h-3.5 w-3.5 text-[#0056B3]" />
              {patientName}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-[#64748B]">Assigned Consultant</span>
            <p className="text-xs font-bold text-[#0056B3] flex items-center gap-1.5 mt-0.5">
              <Stethoscope className="h-3.5 w-3.5 text-[#0056B3]" />
              {assignedDoctor}
            </p>
          </div>
          <div className="col-span-2 border-t border-[#E2E8F0] pt-2.5">
            <span className="text-[10px] font-mono uppercase font-bold text-[#64748B]">Consultation Location</span>
            <p className="text-xs font-semibold text-[#1E293B] flex items-center gap-1.5 mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-[#DC3545]" />
              {roomNumber}
            </p>
          </div>
        </div>

        {/* Structured Intake Summary */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#F8F9FA] p-4">
          <p className="text-[10px] font-mono uppercase font-bold text-[#0056B3]">Reconstructed Pre-Consultation Summary:</p>
          <p className="text-xs font-semibold text-[#1E293B] mt-1 leading-relaxed">
            “{chiefComplaint}”
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E2E8F0] pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white p-1 shadow-2xs">
            <QrCode className="h-9 w-9 text-[#0056B3]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#1E293B]">Scan for Live Queue</p>
            <p className="text-[10px] text-[#64748B]">ABHA &amp; Mobile Compatible</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-full border border-[#CBD5E1] bg-[#F8F9FA] hover:bg-white text-xs font-bold text-[#1E293B] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer className="h-3.5 w-3.5 text-[#64748B]" />
            <span>Print Token</span>
          </button>
          <Button
            onClick={onProceedToDoctor}
            className="rounded-full bg-[#0056B3] hover:bg-[#004494] text-white text-xs font-bold px-4 py-2 shadow-sm transition-all"
          >
            <span>Doctor Storyboard</span>
            <ArrowRight className="ml-1.5 h-3.5 w-3.5 text-white" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
