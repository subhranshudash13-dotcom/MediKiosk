import { ExtractedEntity } from "./store";

export const PATIENT = {
  name: "Suresh Patel",
  age: 54,
  sex: "Male",
  token: "A-104",
  abha: "91-4820-9912-3841",
  department: "Internal Medicine (OPD #4)",
  doctor: "Dr. Ananya Sharma, MD",
  collectedAgo: "4 mins ago",
};

export const QUEUE = [
  { id: "q-1", name: "Suresh Patel (54M)", concern: "Sub-sternal chest heaviness & nocturnal fever", priority: "urgent", time: "4m" },
  { id: "q-2", name: "Sunita Devi (48F)", concern: "Bilateral knee arthralgia & swelling", priority: "routine", time: "12m" },
  { id: "q-3", name: "Rajesh Kumar (62M)", concern: "Acute epigastric burning post-dinner", priority: "routine", time: "18m" },
  { id: "q-4", name: "Meena Sharma (31F)", concern: "Severe throbbing migraine with visual aura", priority: "urgent", time: "25m" },
];

export const DEMO_ENTITIES: ExtractedEntity[] = [
  { id: "e-chief", label: "Chief Complaint", value: "Sub-sternal Chest Constriction", kind: "symptom" },
  { id: "e-dur", label: "Duration", value: "3 Days (Nocturnal Spikes)", kind: "duration" },
  { id: "e-sev", label: "Severity Score", value: "7 / 10 (Urgent Care)", kind: "symptom" },
  { id: "e-rad", label: "Radiation", value: "Left shoulder / non-jaw", kind: "symptom" },
  { id: "e-assoc", label: "Associated", value: "Diaphoresis, Night Sweats", kind: "symptom" },
];

export const DEMO_MEDICATIONS: ExtractedEntity[] = [
  { id: "m-amlo", label: "Medication", value: "Amlodipine Besylate 5mg", kind: "medication", quote: "Tab Amlodipine 5mg OD (Morning)", confidence: 0.98 },
  { id: "m-met", label: "Medication", value: "Metformin HCl 500mg", kind: "medication", quote: "Tab Metformin 500mg BD (Post-meals)", confidence: 0.96 },
];

export const DEMO_ALLERGY: ExtractedEntity = {
  id: "e-allergy",
  label: "Allergy Alert",
  value: "Penicillin (Severe Urticaria / Rash)",
  kind: "allergy",
};

export const HPI =
  "54-year-old male with known history of Hypertension and Type 2 Diabetes presents with sub-sternal chest tightness and nocturnal fever for the past 3 days. Pain is constricting in nature, rated 7/10, worsening upon brisk exertion and accompanied by diaphoresis and fatigue. Denies syncope, productive hemoptysis, or sudden left jaw pain radiation.";

export const PAST_HISTORY = [
  "Essential Hypertension (diagnosed 2021) — on Tab Amlodipine 5mg OD",
  "Type 2 Diabetes Mellitus (diagnosed 2024) — on Tab Metformin 500mg BD",
  "No documented history of CAD or previous myocardial infarction",
];

export const TIMELINE = [
  { id: "t-1", year: "Aug 2021", title: "Hypertension Diagnosis", detail: "Started on Amlodipine 5mg OD · BP 148/92 at presentation" },
  { id: "t-2", year: "Mar 2024", title: "Type 2 Diabetes Screening", detail: "HbA1c 7.4% · Initiated Metformin 500mg with lifestyle intervention" },
  { id: "t-3", year: "Today", title: "OPD Kiosk Triage Intake", detail: "Chief complaint captured in Hindi · Sub-sternal discomfort & nocturnal fever" },
];
