import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediKiosk — Point-of-Entry Clinical Triage & Intake Platform",
  description: "Vernacular point-of-entry clinical intake, prescription OCR intelligence, and ABDM-integrated health kiosk for Indian healthcare institutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-screen bg-[#F8F9FA] text-[#2C3E50] antialiased selection:bg-[#CCE5FF] selection:text-[#0056B3]">
        {children}
      </body>
    </html>
  );
}

