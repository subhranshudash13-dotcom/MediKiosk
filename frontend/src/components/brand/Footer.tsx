import Link from "next/link";
import { Phone, Mail, MapPin, ArrowUpRight, HeartPulse } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          {/* Left Column: Branding (7 cols) */}
          <div className="md:col-span-7 space-y-4 text-left">
            <Logo variant="light" />
            <p className="text-xs sm:text-sm text-neutral-400 max-w-lg leading-relaxed mt-2">
              Empowering hospital OPDs and primary healthcare clinics with vernacular AI voice intake, OCR document intelligence, and verified pre-consultation clinical histories.
            </p>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-400">
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-neutral-400 shrink-0" /> 1800-419-CARE (Support)
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-neutral-400 shrink-0" /> intake@medikiosk.health
              </p>
              <p className="flex items-center gap-2 sm:col-span-2">
                <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" /> OPD Wing A, AIIMS Telemedicine Hub, New Delhi
              </p>
            </div>
          </div>

          {/* Right Column: Quick Links & Modules (5 cols) */}
          <div className="md:col-span-5 space-y-3 text-left">
            <p className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
              Clinical Modules
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-neutral-400 font-medium">
              <li>
                <Link href="/kiosk" className="hover:text-white transition-colors flex items-center gap-1">
                  • Patient Kiosk <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/kiosk/intake" className="hover:text-white transition-colors flex items-center gap-1">
                  • Live Intake <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/doctor" className="hover:text-white transition-colors flex items-center gap-1">
                  • Doctor Cockpit <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/documents" className="hover:text-white transition-colors flex items-center gap-1">
                  • Document OCR <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/patient/history" className="hover:text-white transition-colors flex items-center gap-1">
                  • Patient History <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/abha" className="hover:text-white transition-colors flex items-center gap-1">
                  • ABHA Gateway <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Strip */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-left text-[11px] text-neutral-500">
          <p>
            &copy; 2026 MediKiosk Health Systems &middot; ABDM Sandbox Certified &bull; DPDP Act 2023 Compliant
          </p>
          <div className="flex items-center gap-4 text-neutral-500">
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

