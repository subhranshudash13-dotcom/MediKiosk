import { create } from "zustand";
import { KioskSession } from "./types";

export interface ExtractedEntity {
  id: string;
  label: string;
  value: string;
  kind?: string;
  quote?: string;
  confidence?: number;
  [key: string]: any;
}

interface KioskState {
  currentSession: KioskSession | null;
  selectedLanguage: string;
  language: string;
  selectedMode: "allopathy" | "ayush";
  isRecording: boolean;
  transcript: string;
  entities: any[];
  activeStep: number;
  setSession: (session: KioskSession | null) => void;
  setLanguage: (lang: string) => void;
  setMode: (mode: "allopathy" | "ayush") => void;
  setIsRecording: (recording: boolean) => void;
  setRecording: (recording: boolean) => void;
  setTranscript: (transcript: string) => void;
  addEntities: (entities: any[]) => void;
  setActiveStep: (step: number) => void;
  resetKiosk: () => void;
}

export const useKioskStore = create<KioskState>((set) => ({
  currentSession: null,
  selectedLanguage: "hi",
  language: "hi",
  selectedMode: "allopathy",
  isRecording: false,
  transcript: "",
  entities: [],
  activeStep: 1,
  setSession: (session) => set({ currentSession: session }),
  setLanguage: (selectedLanguage) => set({ selectedLanguage, language: selectedLanguage }),
  setMode: (selectedMode) => set({ selectedMode }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setRecording: (isRecording) => set({ isRecording }),
  setTranscript: (transcript) => set({ transcript }),
  addEntities: (newEntities) =>
    set((state) => ({ entities: [...state.entities, ...newEntities] })),
  setActiveStep: (activeStep) => set({ activeStep }),
  resetKiosk: () =>
    set({
      currentSession: null,
      selectedLanguage: "hi",
      language: "hi",
      selectedMode: "allopathy",
      isRecording: false,
      transcript: "",
      entities: [],
      activeStep: 1,
    }),
}));
