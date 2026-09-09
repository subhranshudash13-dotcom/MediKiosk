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
  Bot
} from "lucide-react";
import { HospitalMetricsChart } from "@/components/analytics/HospitalMetricsChart";
import { ClinicalArchitectureDiagram } from "@/components/illustrations/ClinicalArchitectureDiagram";
import { LiveTriageSimulator } from "@/components/interactive/LiveTriageSimulator";
import { HeroMedicalRecordDropzone } from "@/components/documents/HeroMedicalRecordDropzone";
import { ClinicalMultimodalVenn } from "@/components/illustrations/ClinicalMultimodalVenn";
import { HospitalEfficiencyFlow } from "@/components/illustrations/HospitalEfficiencyFlow";
import { EmergencyTriageMatrix } from "@/components/illustrations/EmergencyTriageMatrix";
import { SocratesFrameworkExplorer } from "@/components/illustrations/SocratesFrameworkExplorer";
import { HospitalVisualGallery } from "@/components/illustrations/HospitalVisualGallery";
import { RotatingHeroText } from "@/components/brand/RotatingHeroText";
import { TrustPartnerRibbon } from "@/components/brand/TrustPartnerRibbon";
import { Nav } from "@/components/brand/Nav";
import { Footer } from "@/components/brand/Footer";

import { VoiceIntakeHeroShowcase } from "@/components/patient/VoiceIntakeHeroShowcase";
import { PrescriptionOCRImageShowcase } from "@/components/documents/PrescriptionOCRImageShowcase";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#2C3E50] flex flex-col justify-between selection:bg-[#CCE5FF] selection:text-[#0056B3]">
      {/* Top Navigation Bar */}
      <Nav />

      {/* Main Content */}
      <main className="w-full flex-1 space-y-16 sm:space-y-20">
        
        {/* ========================================================================= */}
        {/* FULL-BLEED EKA.CARE INSPIRED HERO BANNER */}
        {/* ========================================================================= */}
        <section className="relative w-full min-h-[85vh] flex flex-col justify-between items-center text-center px-4 sm:px-8 py-16 sm:py-24 overflow-hidden bg-slate-950 text-white">
          
          {/* Moving Blurred Hospital Lounge Background */}
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0">
            <img
              src="/images/eka_hospital_hero.jpg"
              alt="Hospital OPD Lounge Ambient"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-40 filter blur-[4px] scale-110 animate-hero-drift"
            />
            {/* Cinematic Gradient Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-slate-950/95" />
            <div className="absolute -top-32 -left-32 w-[34rem] h-[34rem] bg-[#0056B3]/25 rounded-full blur-3xl animate-float-orb-1" />
            <div className="absolute -bottom-32 -right-32 w-[34rem] h-[34rem] bg-[#17A2B8]/20 rounded-full blur-3xl animate-float-orb-2" />
          </div>

          {/* Centered Hero Heading & Action */}
          <div className="relative z-10 max-w-5xl mx-auto my-auto space-y-8 pt-8 sm:pt-12">
            {/* Trust Pill */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold backdrop-blur-md shadow-xs">
              <span>Smart Hospital Point-of-Entry &bull; ABDM Certified Platform</span>
            </div>

            {/* Giant Centered Headline with Dynamic Rotating Keyword */}
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[1.12] drop-shadow-md max-w-5xl mx-auto">
              <span>The AI-Native Ambient</span>
              <br />
              <span className="inline-flex items-center justify-center flex-wrap gap-x-2.5">
                <span>Healthcare Platform for</span>
                <RotatingHeroText />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-normal leading-relaxed">
              MediKiosk captures vernacular spoken complaints, scans physical paper prescriptions via vision OCR, and synthesizes structured clinical history before the doctor consultation.
            </p>

            {/* Center Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/kiosk"
                className="px-8 py-3.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] cursor-pointer"
              >
                <span>Start Patient Intake</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/doctor"
                className="px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-sm flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer"
              >
                <Stethoscope className="w-4 h-4 text-[#38BDF8]" />
                <span>Doctor Workstation</span>
              </Link>
            </div>
          </div>

          {/* Bottom Specifications Capsule Bar */}
          <div className="relative z-10 w-full max-w-6xl mx-auto mt-12">
            <TrustPartnerRibbon />
          </div>
        </section>

        {/* CONTAINER FOR MODULES & WORKSPACES */}
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
        {/* SECTION 1: REAL-WORLD CLINICAL DEPLOYMENT GALLERY */}
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

        {/* ========================================================================= */}
        {/* SECTION 2: MULTIMODAL CONVERGENCE VENN DIAGRAM */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[#E8F7F9] text-[#17A2B8] text-xs font-bold uppercase tracking-wider">
              AI Convergence
            </span>
            <span className="text-xs font-bold text-[#6C7A89]">Voice + Vision OCR Synthesis</span>
          </div>
          <ClinicalMultimodalVenn />
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: HOSPITAL OPD EFFICIENCY & JOURNEY COMPARISON */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[#EAF7ED] text-[#28A745] text-xs font-bold uppercase tracking-wider">
              Impact &amp; Metrics
            </span>
            <span className="text-xs font-bold text-[#6C7A89]">OPD Time Savings</span>
          </div>
          <HospitalEfficiencyFlow />
        </section>

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
        {/* SECTION 5: MANCHESTER & ESI EMERGENCY TRIAGE MATRIX */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[#FCEBEC] text-[#DC3545] text-xs font-bold uppercase tracking-wider">
              Safety Guardrails
            </span>
            <span className="text-xs font-bold text-[#6C7A89]">Triage Stratification</span>
          </div>
          <EmergencyTriageMatrix />
        </section>

        {/* ========================================================================= */}
        {/* SECTION 6: CLINICAL WORKFLOW ARCHITECTURE — 4-Stage Journey */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stage 1 */}
            <div className="p-6 rounded-2xl bg-white border border-[#DEE2E6] shadow-card flex flex-col justify-between space-y-4 text-left hover:border-[#0056B3] transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#F8F9FA] border border-[#DEE2E6] text-[#6C7A89]">
                    STAGE 01
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-[#EBF3FC] text-[#0056B3] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mic className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-heading font-bold text-base text-[#2C3E50] group-hover:text-[#0056B3] transition-colors">
                  Vernacular Patient Triage
                </h3>
                <p className="text-xs text-[#5A6B7C] leading-relaxed">
                  Patient speaks in their mother tongue at the kiosk. AI structures pain location, duration, and character without medical jargon.
                </p>
              </div>
              <div className="pt-3 border-t border-[#DEE2E6] text-xs font-mono font-bold text-[#0056B3] flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-[#28A745]" /> Hindi, Telugu, Tamil, EN
              </div>
            </div>

            {/* Stage 2 */}
            <div className="p-6 rounded-2xl bg-white border border-[#DEE2E6] shadow-card flex flex-col justify-between space-y-4 text-left hover:border-[#17A2B8] transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#F8F9FA] border border-[#DEE2E6] text-[#6C7A89]">
                    STAGE 02
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-[#E8F7F9] text-[#17A2B8] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileScan className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-heading font-bold text-base text-[#2C3E50] group-hover:text-[#17A2B8] transition-colors">
                  Prescription Vision OCR
                </h3>
                <p className="text-xs text-[#5A6B7C] leading-relaxed">
                  Paper prescriptions and lab slips are digitized instantly. Drug names, dosages, and abnormal lab flags are parsed.
                </p>
              </div>
              <div className="pt-3 border-t border-[#DEE2E6] text-xs font-mono font-bold text-[#17A2B8] flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-[#28A745]" /> Active Drug Reconciliation
              </div>
            </div>

            {/* Stage 3 */}
            <div className="p-6 rounded-2xl bg-white border border-[#DEE2E6] shadow-card flex flex-col justify-between space-y-4 text-left hover:border-[#0056B3] transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#F8F9FA] border border-[#DEE2E6] text-[#6C7A89]">
                    STAGE 03
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-[#EBF3FC] text-[#0056B3] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-heading font-bold text-base text-[#2C3E50] group-hover:text-[#0056B3] transition-colors">
                  Doctor OPD Cockpit
                </h3>
                <p className="text-xs text-[#5A6B7C] leading-relaxed">
                  Attending physician receives a pre-populated clinical summary in seconds, eliminating manual typing during consultation.
                </p>
              </div>
              <div className="pt-3 border-t border-[#DEE2E6] text-xs font-mono font-bold text-[#0056B3] flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-[#28A745]" /> 30-Second EMR Briefing
              </div>
            </div>

            {/* Stage 4 */}
            <div className="p-6 rounded-2xl bg-white border border-[#DEE2E6] shadow-card flex flex-col justify-between space-y-4 text-left hover:border-[#28A745] transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#F8F9FA] border border-[#DEE2E6] text-[#6C7A89]">
                    STAGE 04
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-[#EAF7ED] text-[#28A745] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-heading font-bold text-base text-[#2C3E50] group-hover:text-[#28A745] transition-colors">
                  ABHA &amp; FHIR R4 Record
                </h3>
                <p className="text-xs text-[#5A6B7C] leading-relaxed">
                  Encounter is structured into standard HL7 FHIR R4 bundles and linked to patient&apos;s ABHA record with explicit DPDP consent.
                </p>
              </div>
              <div className="pt-3 border-t border-[#DEE2E6] text-xs font-mono font-bold text-[#28A745] flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-[#28A745]" /> Interoperable Health Grid
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4 CORE MODULES WORKSPACES NAVIGATION */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#DEE2E6]">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF3FC] text-[#0056B3] text-[11px] font-mono font-bold uppercase tracking-wider mb-1">
                Platform Workspaces
              </div>
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-[#2C3E50]">
                Hospital Operational Modules
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Patient Voice Kiosk */}
            <Link
              href="/kiosk"
              className="p-6 bg-white rounded-2xl border border-[#DEE2E6] hover:border-[#0056B3] transition-all flex flex-col justify-between group shadow-card cursor-pointer text-left hover:shadow-elevated"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#EBF3FC] text-[#0056B3] flex items-center justify-center shadow-xs">
                  <Mic className="w-5 h-5 text-[#0056B3]" />
                </div>
                <h3 className="font-heading font-bold text-base text-[#2C3E50] group-hover:text-[#0056B3] transition-colors">
                  Patient Intake Kiosk
                </h3>
                <p className="text-xs text-[#5A6B7C] leading-relaxed">
                  Push-to-talk voice triage station with pain scoring, red flag alerts, and vernacular speech recognition.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#DEE2E6] flex items-center justify-between text-xs font-bold text-[#0056B3]">
                <span>Open Kiosk</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#0056B3] group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

            {/* 2. Doctor Workstation */}
            <Link
              href="/doctor"
              className="p-6 bg-white rounded-2xl border border-[#DEE2E6] hover:border-[#0056B3] transition-all flex flex-col justify-between group shadow-card cursor-pointer text-left hover:shadow-elevated"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#EBF3FC] text-[#0056B3] flex items-center justify-center shadow-xs">
                  <Stethoscope className="w-5 h-5 text-[#0056B3]" />
                </div>
                <h3 className="font-heading font-bold text-base text-[#2C3E50] group-hover:text-[#0056B3] transition-colors">
                  Doctor Cockpit
                </h3>
                <p className="text-xs text-[#5A6B7C] leading-relaxed">
                  Real-time triage queue, pre-consultation HPI, prescription studio, and diagnostic investigation orders.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#DEE2E6] flex items-center justify-between text-xs font-bold text-[#0056B3]">
                <span>Open Cockpit</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#0056B3] group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

            {/* 3. Document Intelligence & OCR */}
            <Link
              href="/documents"
              className="p-6 bg-white rounded-2xl border border-[#DEE2E6] hover:border-[#17A2B8] transition-all flex flex-col justify-between group shadow-card cursor-pointer text-left hover:shadow-elevated"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F7F9] text-[#17A2B8] flex items-center justify-center shadow-xs">
                  <FileScan className="w-5 h-5 text-[#17A2B8]" />
                </div>
                <h3 className="font-heading font-bold text-base text-[#2C3E50] group-hover:text-[#17A2B8] transition-colors">
                  Document Studio
                </h3>
                <p className="text-xs text-[#5A6B7C] leading-relaxed">
                  Prescription handwriting OCR, lab result parsing, drug indications, and longitudinal health timeline.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#DEE2E6] flex items-center justify-between text-xs font-bold text-[#17A2B8]">
                <span>Scan Records</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#17A2B8] group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

            {/* 4. ABHA & ABDM Consent Gateway */}
            <Link
              href="/abha"
              className="p-6 bg-white rounded-2xl border border-[#DEE2E6] hover:border-[#28A745] transition-all flex flex-col justify-between group shadow-card cursor-pointer text-left hover:shadow-elevated"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAF7ED] text-[#28A745] flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-[#28A745]" />
                </div>
                <h3 className="font-heading font-bold text-base text-[#2C3E50] group-hover:text-[#28A745] transition-colors">
                  ABHA Consent Desk
                </h3>
                <p className="text-xs text-[#5A6B7C] leading-relaxed">
                  ABDM OTP verification, QR Scan &amp; Share counter, DPDP Act consent logging, and record linking.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#DEE2E6] flex items-center justify-between text-xs font-bold text-[#28A745]">
                <span>Manage Consent</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#28A745] group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 7: LIVE TRIAGE SIMULATOR */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[#EBF3FC] text-[#0056B3] text-xs font-bold uppercase tracking-wider">
              Interactive Tool
            </span>
            <span className="text-xs font-bold text-[#6C7A89]">Live Case Simulator</span>
          </div>
          <LiveTriageSimulator />
        </section>

        {/* ========================================================================= */}
        {/* SECTION 8: CLINICAL ARCHITECTURE & ANALYTICS */}
        {/* ========================================================================= */}
        <section className="space-y-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-[#EBF3FC] text-[#0056B3] text-xs font-bold uppercase tracking-wider">
                System Topology
              </span>
              <span className="text-xs font-bold text-[#6C7A89]">5-Layer Resilient Stack</span>
            </div>
            <ClinicalArchitectureDiagram />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-[#E8F7F9] text-[#17A2B8] text-xs font-bold uppercase tracking-wider">
                Real-Time Telemetry
              </span>
              <span className="text-xs font-bold text-[#6C7A89]">OPD Metrics &amp; Throughput</span>
            </div>
            <HospitalMetricsChart />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 9: CLINICAL SAFETY & COMPLIANCE STANDARDS */}
        {/* ========================================================================= */}
        <section className="bg-white border border-[#DEE2E6] rounded-2xl p-6 sm:p-8 shadow-card text-left">
          <div className="flex items-center justify-between pb-4 border-b border-[#DEE2E6] mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EBF3FC] text-[#0056B3] flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[#0056B3]" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-[#2C3E50]">
                  Clinical Interoperability &amp; Regulatory Frameworks
                </h3>
                <span className="text-xs text-[#6C7A89]">Audited &amp; Standardized Hospital Healthcare Stack</span>
              </div>
            </div>
            <span className="text-xs font-bold text-[#28A745] px-3.5 py-1 rounded-full bg-[#EAF7ED] border border-[#D4EDDA] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#28A745]" /> Verified Compliance
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5 text-center">
            <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#DEE2E6] hover:border-[#0056B3] transition-colors">
              <span className="text-[10px] font-mono font-bold text-[#6C7A89] uppercase block mb-1">Clinical Protocol</span>
              <h4 className="text-xs font-bold text-[#0056B3]">SOCRATES</h4>
              <p className="text-[10px] text-[#6C7A89] mt-0.5">8-Factor History</p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#DEE2E6] hover:border-[#0056B3] transition-colors">
              <span className="text-[10px] font-mono font-bold text-[#6C7A89] uppercase block mb-1">Data Standard</span>
              <h4 className="text-xs font-bold text-[#0056B3]">HL7 FHIR R4</h4>
              <p className="text-[10px] text-[#6C7A89] mt-0.5">Diagnostic Bundles</p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#DEE2E6] hover:border-[#0056B3] transition-colors">
              <span className="text-[10px] font-mono font-bold text-[#6C7A89] uppercase block mb-1">Health Grid</span>
              <h4 className="text-xs font-bold text-[#0056B3]">NHA ABDM</h4>
              <p className="text-[10px] text-[#6C7A89] mt-0.5">ABHA M1/M2/M3</p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#DEE2E6] hover:border-[#0056B3] transition-colors">
              <span className="text-[10px] font-mono font-bold text-[#6C7A89] uppercase block mb-1">Privacy Law</span>
              <h4 className="text-xs font-bold text-[#0056B3]">DPDP Act 2023</h4>
              <p className="text-[10px] text-[#6C7A89] mt-0.5">Consent Governance</p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#DEE2E6] hover:border-[#0056B3] transition-colors">
              <span className="text-[10px] font-mono font-bold text-[#6C7A89] uppercase block mb-1">Speech Engine</span>
              <h4 className="text-xs font-bold text-[#0056B3]">Bhashini AI</h4>
              <p className="text-[10px] text-[#6C7A89] mt-0.5">Indic Dialect ASR</p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#DEE2E6] hover:border-[#0056B3] transition-colors">
              <span className="text-[10px] font-mono font-bold text-[#6C7A89] uppercase block mb-1">Terminology</span>
              <h4 className="text-xs font-bold text-[#0056B3]">ICD-10 / SNOMED</h4>
              <p className="text-[10px] text-[#6C7A89] mt-0.5">Standard Coding</p>
            </div>
          </div>
        </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

