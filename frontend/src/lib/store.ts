import { create } from "zustand";
import { KioskSession } from "./types";

interface KioskState {
  currentSession: KioskSession | null;
  selectedLanguage: string;
  selectedMode: "allopathy" | "ayush";
  isRecording: boolean;
  activeStep: number;
  setSession: (session: KioskSession | null) => void;
  setLanguage: (lang: string) => void;
  setMode: (mode: "allopathy" | "ayush") => void;
  setIsRecording: (recording: boolean) => void;
  setActiveStep: (step: number) => void;
  resetKiosk: () => void;
}

export const useKioskStore = create<KioskState>((set) => ({
  currentSession: null,
  selectedLanguage: "hi",
  selectedMode: "allopathy",
  isRecording: false,
  activeStep: 1,
  setSession: (session) => set({ currentSession: session }),
  setLanguage: (selectedLanguage) => set({ selectedLanguage }),
  setMode: (selectedMode) => set({ selectedMode }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setActiveStep: (activeStep) => set({ activeStep }),
  resetKiosk: () =>
    set({
      currentSession: null,
      selectedLanguage: "hi",
      selectedMode: "allopathy",
      isRecording: false,
      activeStep: 1,
    }),
}));
