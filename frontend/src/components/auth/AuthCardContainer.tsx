"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { AuthBannerGraphic } from "./AuthBannerGraphic";
import { GoogleSignInButton } from "./GoogleSignInButton";

interface AuthCardContainerProps {
  title: string;
  subtitle?: string;
  onGoogleAuth?: (credential: string) => Promise<void>;
  switchText: string;
  switchLinkText: string;
  switchLinkHref: string;
  children: ReactNode;
  showGoogle?: boolean;
}

export function AuthCardContainer({
  title,
  subtitle,
  onGoogleAuth,
  switchText,
  switchLinkText,
  switchLinkHref,
  children,
  showGoogle = true,
}: AuthCardContainerProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#EAEFF4] via-[#F3F6F9] to-[#E5ECEF] text-neutral-800">
      <div className="w-full max-w-[420px] sm:max-w-[440px] bg-white rounded-[32px] sm:rounded-[38px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-neutral-100/80 overflow-hidden flex flex-col transition-all">
        {/* Top Organic Shapes Header Banner */}
        <AuthBannerGraphic title={title} subtitle={subtitle} />

        {/* Card Body */}
        <div className="p-6 sm:p-8 flex flex-col space-y-5">
          {/* Google Sign-In Pill */}
          {showGoogle && onGoogleAuth && (
            <>
              <GoogleSignInButton onSuccess={onGoogleAuth} />

              {/* "or" Divider */}
              <div className="relative flex items-center justify-center my-1">
                <div className="w-full border-t border-neutral-200/80" />
                <span className="bg-white px-3 text-xs text-neutral-400 font-medium lowercase">
                  or
                </span>
                <div className="w-full border-t border-neutral-200/80" />
              </div>
            </>
          )}

          {/* Form Content */}
          {children}

          {/* Legal / Terms Subtext */}
          <p className="text-[11px] sm:text-xs text-center text-neutral-500 leading-relaxed pt-1">
            Signing up for a MediKiosk account means you agree to the{" "}
            <Link href="/privacy" className="text-neutral-800 underline underline-offset-2 hover:text-black">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="text-neutral-800 underline underline-offset-2 hover:text-black">
              Terms of Service
            </Link>
            .
          </p>

          {/* Bottom Switch Link */}
          <div className="pt-2 text-center text-xs sm:text-sm text-neutral-600 font-medium">
            {switchText}{" "}
            <Link
              href={switchLinkHref}
              className="text-neutral-900 font-bold underline underline-offset-2 hover:text-black"
            >
              {switchLinkHref === "/patient/login" ? "Log in here" : switchLinkText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
