import Link from "next/link";
import { Phone, Mail, MapPin, ArrowUpRight, Heart } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative bg-olive-deep text-cream mt-24">
      {/* Organic Wave Top Divider */}
      <div className="absolute top-0 left-0 right-0 -translate-y-[99%] overflow-hidden leading-none">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 md:h-20 fill-olive-deep">
          <path d="M0,0 C300,90 600,0 900,60 C1050,90 1150,40 1200,30 L1200,120 L0,120 Z" />
        </svg>
      </div>

      <div className="page-shell py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          {/* Left Column: Clinic Contact & Branding (5 cols) */}
          <div className="md:col-span-5 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-white/70 font-semibold">
              <Heart className="h-3.5 w-3.5 fill-current" /> Get in Touch
            </div>
            <h3 className="font-serif text-3xl md:text-4xl text-white font-bold">
              MediKiosk Care Intelligence
            </h3>
            <p className="text-sm text-white/80 max-w-sm leading-relaxed">
              Empowering hospital OPDs and primary healthcare clinics with vernacular AI intake and verified clinical histories.
            </p>

            <div className="pt-2 space-y-2 text-xs text-white/90">
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-white/70" /> 1800-419-CARE (24/7 Clinical Support)
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-white/70" /> intake@medikiosk.health
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-white/70" /> OPD Wing A, AIIMS Telemedicine Hub, New Delhi
              </p>
            </div>
          </div>

          {/* Middle Column: Quick Links (3 cols) */}
          <div className="md:col-span-3 space-y-3 text-left">
            <p className="text-xs uppercase tracking-[0.2em] text-white/70 font-bold">
              Navigation
            </p>
            <ul className="space-y-2.5 text-xs text-white/80 font-medium">
              <li>
                <Link href="/patient" className="hover:text-white transition-colors flex items-center gap-1">
                  • Patient Voice Kiosk <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/doctor" className="hover:text-white transition-colors flex items-center gap-1">
                  • Doctor Workspace <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/records" className="hover:text-white transition-colors flex items-center gap-1">
                  • ABHA Records Sync <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/system" className="hover:text-white transition-colors flex items-center gap-1">
                  • System Architecture <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Column: Mini Map & Hospital Routing Graphic (4 cols) */}
          <div className="md:col-span-4 rounded-3xl bg-white/10 p-5 border border-white/15 text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-white/80">
              Campus Clinic Routing
            </p>
            <div className="mt-3 rounded-2xl bg-white p-3 shadow-sm text-ink">
              <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 pb-2">
                <span className="text-olive">Main OPD Station 04</span>
                <span className="text-emerald-700">● 12 Kiosks Active</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Ground Floor, West Atrium — Direct queue dispatch to Rooms 301–310.
              </p>
            </div>
            <p className="mt-3 text-[10px] text-white/60">
              © 2026 MediKiosk Health Systems LLC · ABDM Sandbox Certified
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
