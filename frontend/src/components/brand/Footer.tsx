import Link from "next/link";
import { Phone, Mail, MapPin, ArrowUpRight, HeartPulse } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-[#1D2A8F] text-[#FDEBD0] border-t border-[#15206B] mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Clinic Contact & Branding (5 cols) */}
          <div className="md:col-span-5 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#FB923C] font-semibold">
              <HeartPulse className="h-3.5 w-3.5 text-[#FB923C]" /> Point-of-Entry Clinical Platform
            </div>
            <h3 className="font-heading text-2xl text-white font-bold tracking-tight">
              MediKiosk Health Intelligence
            </h3>
            <p className="text-xs text-white/80 max-w-sm leading-relaxed">
              Empowering hospital OPDs and primary healthcare clinics with vernacular AI voice intake and verified clinical histories.
            </p>

            <div className="pt-2 space-y-2 text-xs text-white/90">
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-[#FB923C]" /> 1800-419-CARE (Clinical Support)
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-[#FB923C]" /> intake@medikiosk.health
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#FB923C]" /> OPD Wing A, AIIMS Telemedicine Hub, New Delhi
              </p>
            </div>
          </div>

          {/* Middle Column: Quick Links (3 cols) */}
          <div className="md:col-span-3 space-y-3 text-left">
            <p className="text-xs uppercase tracking-wider text-[#FB923C] font-semibold">
              Clinical Modules
            </p>
            <ul className="space-y-2.5 text-xs text-white/80 font-medium">
              <li>
                <Link href="/kiosk" className="hover:text-white transition-colors flex items-center gap-1">
                  • Patient Voice Kiosk <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/doctor" className="hover:text-white transition-colors flex items-center gap-1">
                  • Doctor Workstation <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/documents" className="hover:text-white transition-colors flex items-center gap-1">
                  • Document OCR Studio <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/abha" className="hover:text-white transition-colors flex items-center gap-1">
                  • ABHA Consent Manager <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Column: Mini Status Card (4 cols) */}
          <div className="md:col-span-4 rounded-[12px] bg-white/10 p-5 border border-white/15 text-left backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-white">
              Hospital Deployment Status
            </p>
            <div className="mt-3 rounded-[8px] bg-white p-3 shadow-xs text-[#374151]">
              <div className="flex items-center justify-between text-xs font-medium border-b border-[#FDEBD0] pb-2">
                <span className="text-[#1D2A8F] font-semibold">Main OPD Kiosk #04</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Operational
                </span>
              </div>
              <p className="text-[11px] text-[#374151]/80 mt-2">
                Ground Floor, West Atrium — Direct queue dispatch to Rooms 301–310.
              </p>
            </div>
            <p className="mt-3 text-[10px] text-white/70">
              © 2026 MediKiosk Health Systems · ABDM Sandbox Certified &bull; DPDP Act 2023
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
