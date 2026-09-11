"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export default function PatientPortalGateway() {
  const router = useRouter();
  const { isAuthenticated, initialized, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (initialized) {
      if (isAuthenticated) {
        router.replace("/patient/dashboard");
      } else {
        router.replace("/patient/login");
      }
    }
  }, [initialized, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#0056B3]" />
    </div>
  );
}
