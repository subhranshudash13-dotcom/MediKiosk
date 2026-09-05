import type { Metadata } from "next";
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
      <body className="min-h-screen bg-[#FBF8F2] text-[#25232A] antialiased selection:bg-[#E8D6D4] selection:text-[#4B3158]">
        {children}
      </body>
    </html>
  );
}
