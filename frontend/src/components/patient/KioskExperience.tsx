"use client";

import React from "react";
import { Nav } from "@/components/brand/Nav";
import { Footer } from "@/components/brand/Footer";
import { KioskHeroShowcase } from "@/components/patient/KioskHeroShowcase";
import { KioskHowItWorks } from "@/components/patient/KioskHowItWorks";
import { KioskDataOrganizeShowcase } from "@/components/patient/KioskDataOrganizeShowcase";

export function KioskExperience() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E293B] flex flex-col justify-between selection:bg-[#EBF5FF] selection:text-[#0056B3]">
      {/* 1. Top Navbar */}
      <Nav />

      {/* 2. Hero Section (Left-Right Split Layout with Multi-Device Mockup) */}
      <KioskHeroShowcase />

      {/* 3. 5-Step "How It Works" Section */}
      <KioskHowItWorks />

      {/* 4. "Organize All Your Health Data at One Place" (Smart Report & QR Mobile Sync) */}
      <KioskDataOrganizeShowcase />

      {/* 5. Footer */}
      <Footer />
    </div>
  );
}
