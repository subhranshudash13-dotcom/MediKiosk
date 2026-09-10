import Link from "next/link";
import {
  Mic,
  Stethoscope,
  FileScan,
  ShieldCheck,
  ArrowRight,
  HeartPulse,
  Activity,
  Building2,
  CheckCircle2,
  FileText,
  Sparkles,
  Zap,
  Globe2,
  Clock3,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Layers,
  Award,
  History,
  Check,
  Hospital,
  BrainCircuit,
  Bot,
  User
} from "lucide-react";
import { HeroMedicalRecordDropzone } from "@/components/documents/HeroMedicalRecordDropzone";
import { ClinicalMultimodalVenn } from "@/components/illustrations/ClinicalMultimodalVenn";
import { SocratesFrameworkExplorer } from "@/components/illustrations/SocratesFrameworkExplorer";
import { HospitalVisualGallery } from "@/components/illustrations/HospitalVisualGallery";
import { RotatingHeroText } from "@/components/brand/RotatingHeroText";
import { TrustPartnerRibbon } from "@/components/brand/TrustPartnerRibbon";
import { Nav } from "@/components/brand/Nav";
import { Footer } from "@/components/brand/Footer";

import { VoiceIntakeHeroShowcase } from "@/components/patient/VoiceIntakeHeroShowcase";
import { PrescriptionOCRImageShowcase } from "@/components/documents/PrescriptionOCRImageShowcase";
import { OpdIntakeRoadmap } from "@/components/clinical/OpdIntakeRoadmap";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#2C3E50] flex flex-col justify-between selection:bg-[#CCE5FF] selection:text-[#0056B3]">
      {/* Top Navigation Bar */}
      <Nav />

      {/* Main Content */}
      <main className="w-full flex-1 space-y-16 sm:space-y-20">
        
        {/* ========================================================================= */}
        {/* HOSPITAL HERO BANNER */}
        {/* ========================================================================= */}
        <section className="relative w-full min-h-[85vh] flex flex-col justify-between items-center text-center px-4 sm:px-8 py-14 sm:py-20 overflow-hidden text-slate-900 border-b border-slate-200/80">
          
          {/* Hospital Lounge Background with Balanced Legibility Scrim */}
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0">
            <img
              src="/images/eka_hospital_hero.jpg"
              alt="Hospital OPD Lounge Ambient"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Translucent Legibility Scrim */}
            <div className="absolute inset-0 bg-white/75 backdrop-blur-[1.5px]" />
          </div>

          {/* Centered Hero Heading & Action */}
          <div className="relative z-10 max-w-5xl mx-auto my-auto space-y-7 pt-4 sm:pt-8">
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-[#0056B3] text-xs font-semibold backdrop-blur-md shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#0056B3] animate-pulse" />
              <span>Smart Hospital Point-of-Entry &bull; ABDM Certified Platform</span>
            </div>

            {/* Giant Centered Headline with Dynamic Rotating Keyword */}
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-slate-900 tracking-tight leading-[1.12] drop-shadow-xs max-w-5xl mx-auto">
              <span>The AI-Native Ambient</span>
              <br />
              <span className="inline-flex items-center justify-center flex-wrap gap-x-2.5">
                <span>Healthcare Platform for</span>
                <RotatingHeroText />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              MediKiosk captures vernacular spoken complaints, scans physical paper prescriptions via vision OCR, and synthesizes structured clinical history before the doctor consultation.
            </p>

            {/* Center Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/kiosk"
                className="px-8 py-3.5 rounded-full bg-[#0056B3] hover:bg-[#004494] text-white font-bold text-sm flex items-center gap-2 transition-all shadow-md hover:shadow-blue-500/25 hover:scale-[1.02] cursor-pointer"
              >
                <span>Start Patient Intake</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/doctor"
                className="px-8 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm flex items-center gap-2 backdrop-blur-md shadow-xs transition-all hover:border-blue-400 hover:text-[#0056B3] cursor-pointer"
              >
                <Stethoscope className="w-4 h-4 text-[#0056B3]" />
                <span>Doctor Workstation</span>
              </Link>
              <Link
                href="/patient"
                className="px-6 py-3.5 rounded-full bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 font-semibold text-sm flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer shadow-xs"
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>Patient Portal</span>
              </Link>
            </div>
          </div>

          {/* Bottom Specifications Capsule Bar */}
          <div className="relative z-10 w-full max-w-6xl mx-auto mt-10">
            <TrustPartnerRibbon />
          </div>
        </section>

        {/* CONTAINER 1: PATIENT VOICE INTAKE, PRESCRIPTION OCR, HOSPITAL DEPLOYMENT */}
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 space-y-24 sm:space-y-28">
          
          {/* ========================================================================= */}
          {/* SECTION 1: DEDICATED PATIENT VOICE INTAKE STATION */}
          {/* ========================================================================= */}
          <section className="space-y-6 pt-4">
            <div className="flex items-center gap-3 pb-3.5 border-b border-[#DEE2E6]">
              <span className="w-3.5 h-3.5 rounded-full bg-[#0056B3] shadow-xs shrink-0" />
              <h3 className="text-base sm:text-lg md:text-xl font-heading font-extrabold uppercase tracking-wider text-[#0056B3]">
                First-Mile Clinical Intake
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Comprehensive Explanation of Voice Intake Station */}
              <div className="lg:col-span-6 flex flex-col justify-between text-left space-y-6">
                <div className="space-y-3">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF3FC] border border-[#CCE5FF] text-[#0056B3] text-xs font-semibold">
                      <Mic className="w-3.5 h-3.5 text-[#0056B3]" />
                      <span className="font-bold">Point-of-Entry Voice Kiosk</span>
                      <span className="text-[#A0AEC0]">&bull;</span>
                      <span className="text-[#4A5568]">Bhashini AI Engine</span>
                    </div>
                  </div>
                  <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#2C3E50] tracking-tight leading-tight">
                    Patient Voice Intake Station
                  </h2>
                  <p className="text-sm sm:text-base text-[#5A6B7C] leading-relaxed">
                    Patients simply walk up to the hospital kiosk and describe their symptoms in their native mother tongue. The ambient speech engine listens, transcribes, and structures clinical history before they step into the doctor’s chamber.
                  </p>
                </div>

                {/* Core Feature Bullet Cards */}
                <div className="space-y-3 flex-1 flex flex-col justify-center">
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF] shadow-xs flex items-start gap-3.5 hover:border-[#0056B3] hover:bg-white transition-all group">
                    <div className="w-8 h-8 rounded-xl bg-[#EBF3FC] text-[#0056B3] flex items-center justify-center shrink-0 font-bold mt-0.5 group-hover:scale-110 transition-transform">
                      <Globe2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#2C3E50]">12+ Indic Dialect Speech ASR</h4>
                      <p className="text-xs text-[#6C7A89] mt-0.5 leading-relaxed">
                        Seamlessly understands Hindi, Telugu, Tamil, Bengali, Marathi, Hinglish, and English with hospital background noise suppression.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF] shadow-xs flex items-start gap-3.5 hover:border-[#17A2B8] hover:bg-white transition-all group">
                    <div className="w-8 h-8 rounded-xl bg-[#E8F7F9] text-[#17A2B8] flex items-center justify-center shrink-0 font-bold mt-0.5 group-hover:scale-110 transition-transform">
                      <BrainCircuit className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#2C3E50]">8-Factor SOCRATES HPI Probing</h4>
                      <p className="text-xs text-[#6C7A89] mt-0.5 leading-relaxed">
                        Dynamically queries Site, Onset, Character, Radiation, Associations, Timing, Exacerbating factors, and Severity scale.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF] shadow-xs flex items-start gap-3.5 hover:border-[#DC3545] hover:bg-white transition-all group">
                    <div className="w-8 h-8 rounded-xl bg-[#FDF2F2] text-[#DC3545] flex items-center justify-center shrink-0 font-bold mt-0.5 group-hover:scale-110 transition-transform">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#2C3E50]">Instant Emergency Red Flag Alerts</h4>
                      <p className="text-xs text-[#6C7A89] mt-0.5 leading-relaxed">
                        Detects critical cardiovascular, respiratory, or neurological crisis indicators and elevates queue triage immediately.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Stats Anchor Bar */}
                <div className="pt-4 border-t border-[#E9ECEF] grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF]">
                    <span className="text-[10px] font-mono text-[#6C7A89] uppercase block font-semibold">Languages</span>
                    <span className="text-xs font-bold text-[#0056B3]">12+ Indic</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF]">
                    <span className="text-[10px] font-mono text-[#6C7A89] uppercase block font-semibold">ASR Speed</span>
                    <span className="text-xs font-bold text-[#17A2B8]">&lt; 300ms</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF]">
                    <span className="text-[10px] font-mono text-[#6C7A89] uppercase block font-semibold">Triage Rule</span>
                    <span className="text-xs font-bold text-[#28A745]">SOCRATES</span>
                  </div>
                </div>
              </div>

              {/* Right Column: High-Fidelity Voice Intake UI Showcase */}
              <div className="lg:col-span-6 h-full flex flex-col">
                <VoiceIntakeHeroShowcase />
              </div>
            </div>
          </section>


          {/* ========================================================================= */}
          {/* SECTION 2: DEDICATED PRESCRIPTION VISION OCR */}
          {/* ========================================================================= */}
          <section className="space-y-6 pt-6">
            <div className="flex items-center gap-3 pb-3.5 border-b border-[#DEE2E6]">
              <span className="w-3.5 h-3.5 rounded-full bg-[#17A2B8] shadow-xs shrink-0" />
              <h3 className="text-base sm:text-lg md:text-xl font-heading font-extrabold uppercase tracking-wider text-[#17A2B8]">
                Optical Document Intelligence
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Real-world Prescription Scanning Image Showcase */}
              <div className="lg:col-span-6 h-full flex flex-col">
                <PrescriptionOCRImageShowcase />
              </div>

              {/* Right Column: Deep Explanation of Prescription OCR */}
              <div className="lg:col-span-6 flex flex-col justify-between text-left space-y-6">
                <div className="space-y-3">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F7F9] border border-[#BEE5EB] text-[#17A2B8] text-xs font-semibold">
                      <FileScan className="w-3.5 h-3.5 text-[#17A2B8]" />
                      <span className="font-bold">Optical Vision Pipeline</span>
                      <span className="text-[#A0AEC0]">&bull;</span>
                      <span className="text-[#4A5568]">Multimodal Handwriting OCR</span>
                    </div>
                  </div>
                  <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#2C3E50] tracking-tight leading-tight">
                    Prescription Vision OCR &amp; Paperless History
                  </h2>
                  <p className="text-sm sm:text-base text-[#5A6B7C] leading-relaxed">
                    Eliminate physical paper piles at OPD counters. MediKiosk’s multimodal vision pipeline parses messy handwritten doctor prescriptions, diagnostic lab slips, and discharge summaries into structured digital records.
                  </p>
                </div>

                {/* Core Feature Bullet Cards */}
                <div className="space-y-3 flex-1 flex flex-col justify-center">
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF] shadow-xs flex items-start gap-3.5 hover:border-[#17A2B8] hover:bg-white transition-all group">
                    <div className="w-8 h-8 rounded-xl bg-[#E8F7F9] text-[#17A2B8] flex items-center justify-center shrink-0 font-bold mt-0.5 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#2C3E50]">Multimodal Handwriting Extraction</h4>
                      <p className="text-xs text-[#6C7A89] mt-0.5 leading-relaxed">
                        Extracts pharmaceutical drug molecules, dosage schedules (OD/BD/TDS), frequencies, and clinical instructions directly from physical paper.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF] shadow-xs flex items-start gap-3.5 hover:border-[#0056B3] hover:bg-white transition-all group">
                    <div className="w-8 h-8 rounded-xl bg-[#EBF3FC] text-[#0056B3] flex items-center justify-center shrink-0 font-bold mt-0.5 group-hover:scale-110 transition-transform">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#2C3E50]">Drug Interaction &amp; Safety Checks</h4>
                      <p className="text-xs text-[#6C7A89] mt-0.5 leading-relaxed">
                        Cross-references active prescriptions against existing patient medications and vitals to flag harmful contraindications.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF] shadow-xs flex items-start gap-3.5 hover:border-[#28A745] hover:bg-white transition-all group">
                    <div className="w-8 h-8 rounded-xl bg-[#EAF7ED] text-[#28A745] flex items-center justify-center shrink-0 font-bold mt-0.5 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#2C3E50]">ABDM &amp; FHIR R4 Bundle Creation</h4>
                      <p className="text-xs text-[#6C7A89] mt-0.5 leading-relaxed">
                        Converts unstructured scans into standardized HL7 FHIR DiagnosticReport and MedicationStatement resources ready for ABHA linkage.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 3: REAL-WORLD CLINICAL DEPLOYMENT GALLERY */}
          {/* ========================================================================= */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-[#EBF3FC] text-[#0056B3] text-xs font-bold uppercase tracking-wider">
                Module Showcase
              </span>
              <span className="text-xs font-bold text-[#6C7A89]">Live Hospital Deployment</span>
            </div>
            <HospitalVisualGallery />
          </section>
        </div>

        {/* ========================================================================= */}
        {/* FULL-BLEED EDGE-TO-EDGE SECTION: MULTIMODAL CONVERGENCE BENTO GRID */}
        {/* ========================================================================= */}
        <section className="w-full bg-slate-950 border-y border-slate-800 py-16 sm:py-24 text-white relative overflow-hidden">
          <div className="max-w-6xl mx-auto w-full px-4 sm:px-6">
            <ClinicalMultimodalVenn />
          </div>
        </section>

        {/* CONTAINER 2: SOCRATES DIAGNOSTIC FRAMEWORK & 4-STAGE OPD ROADMAP */}
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 space-y-24 sm:space-y-28">
          {/* ========================================================================= */}
          {/* SECTION 4: 8-FACTOR SOCRATES DIAGNOSTIC FRAMEWORK */}
          {/* ========================================================================= */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-[#EBF3FC] text-[#0056B3] text-xs font-bold uppercase tracking-wider">
                Clinical Core
              </span>
              <span className="text-xs font-bold text-[#6C7A89]">Standardized HPI Engine</span>
            </div>
            <SocratesFrameworkExplorer />
          </section>

          {/* ========================================================================= */}
          {/* SECTION 5: CLINICAL WORKFLOW ARCHITECTURE — 4-Stage Journey */}
          {/* ========================================================================= */}
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 pb-4 border-b border-[#DEE2E6]">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF3FC] text-[#0056B3] text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
                  End-to-End Clinical Flow
                </div>
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#2C3E50]">
                  The 4-Stage Hospital OPD Intake Journey
                </h2>
              </div>
              <span className="text-xs text-[#6C7A89] font-medium">
                From patient speech to verified physician consultation note
              </span>
            </div>

            <OpdIntakeRoadmap />
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

