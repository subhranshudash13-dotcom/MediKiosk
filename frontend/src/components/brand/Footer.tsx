import Link from "next/link";
import { Phone, Mail, MapPin, ArrowUpRight, HeartPulse, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-[#002752] text-white border-t border-[#004085] mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          {/* Left Column: Clinic Contact & Branding (7 cols) */}
          <div className="md:col-span-7 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#17A2B8] font-semibold">
              <HeartPulse className="h-3.5 w-3.5 text-[#17A2B8]" /> Point-of-Entry Clinical Platform
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl text-white font-bold tracking-tight">
              MediKiosk Health Intelligence
            </h3>
            <p className="text-xs sm:text-sm text-white/80 max-w-lg leading-relaxed">
              Empowering hospital OPDs and primary healthcare clinics with vernacular AI voice intake, OCR document intelligence, and verified clinical histories.
            </p>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white/90">
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-[#17A2B8] shrink-0" /> 1800-419-CARE (Support)
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-[#17A2B8] shrink-0" /> intake@medikiosk.health
              </p>
              <p className="flex items-center gap-2 sm:col-span-2">
                <MapPin className="h-3.5 w-3.5 text-[#17A2B8] shrink-0" /> OPD Wing A, AIIMS Telemedicine Hub, New Delhi
              </p>
            </div>
          </div>

          {/* Right Column: Quick Links & Modules (5 cols) */}
          <div className="md:col-span-5 space-y-3 text-left">
            <p className="text-xs uppercase tracking-wider text-[#17A2B8] font-semibold">
              Clinical Modules &amp; Systems
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-white/80 font-medium">
              <li>
                <Link href="/kiosk" className="hover:text-white transition-colors flex items-center gap-1">
                  • Patient Voice Kiosk <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/kiosk/intake" className="hover:text-white transition-colors flex items-center gap-1">
                  • Live Intake Station <ArrowUpRight className="h-3 w-3 opacity-60" />
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
                <Link href="/patient/history" className="hover:text-white transition-colors flex items-center gap-1">
                  • Patient Health History <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/abha" className="hover:text-white transition-colors flex items-center gap-1">
                  • ABHA Consent Manager <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Compliance Strip */}
        <div className="mt-10 pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-left text-[11px] text-white/70">
          <p>
            &copy; 2026 MediKiosk Health Systems &middot; ABDM Sandbox Certified &bull; DPDP Act 2023 Compliant
          </p>
          <div className="flex items-center gap-4 text-white/70">
            <span className="hover:text-white transition-colors">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:text-white transition-colors">Terms of Service</span>
            <span>&bull;</span>
            <span className="hover:text-white transition-colors">Security Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
