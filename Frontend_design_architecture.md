MEDIKIOSK — FRONTEND DESIGN SYSTEM
1. The core visual identity
Design direction

Human healthcare × intelligent technology

Not:

"AI medical dashboard"

Instead:

A calm, trustworthy clinical intelligence platform.

Palette

I'd use a restrained palette:S

Purpose	Direction
Background	Warm ivory / off-white
Primary	Deep charcoal
Healthcare accent	Muted emerald/teal
Secondary accent	Soft saffron
AI accent	Subtle lavender
Warning	Warm amber
Critical	Muted red
Cards	White
Borders	Very light warm gray

The accents should appear sparingly.

2. Typography

Use Geist or Inter.

Display
56–64px
Weight: 600
Letter spacing: -0.04em
Section heading
32–40px
Weight: 600
Body
15–17px
Line height: 1.5
Clinical data

Use slightly smaller typography but strong hierarchy.

The interface should feel closer to Linear / Apple Health than a traditional hospital ERP.

3. Global navigation

Keep it extremely clean.

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ✦ MEDIKIOSK        Patient    Doctor    Records    System │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Don't put 15 navigation items.

The logo can be a simple abstract mark representing:

voice → record → care

No robot, no brain icon, no stereotypical AI logo.

SCREEN 01 — LANDING / PRODUCT INTRO

This is the screen judges initially see.

Hero
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                  CLINICAL INTAKE, REIMAGINED                │
│                                                             │
│       Healthcare begins with listening.                    │
│                                                             │
│       MediKiosk listens to a patient's story,                │
│       understands the context and prepares a                │
│       structured clinical history before                     │
│       the consultation.                                      │
│                                                             │
│       [ Start Patient Experience ]                           │
│                                                             │
│                                                             │
│                 ┌───────────────────────┐                   │
│                 │                       │                   │
│                 │       ◯               │                   │
│                 │                       │                   │
│                 │    Listening...       │                   │
│                 │                       │                   │
│                 │  ~ ~ ~ ~ ~ ~ ~ ~     │                   │
│                 │                       │                   │
│                 └───────────────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

But the box shouldn't actually be a static box.

Make it a living visualization.

Have a patient illustration on one side:

             👤
             │
       "I've had fever..."
             │
             ▼
       ~~~~~~~~~~~~~
       AUDIO WAVEFORM
             │
             ▼
       ┌────────────┐
       │ Fever      │
       │ 3 days     │
       │ Fatigue    │
       └────────────┘

The information cards slowly emerge from the waveform.

That immediately demonstrates the product.

Hero animation

Use:

Framer Motion

Animation sequence:

Idle
 ↓
Microphone pulses
 ↓
Waveform responds
 ↓
Transcript appears
 ↓
Important entities highlight
 ↓
Clinical cards emerge
 ↓
Cards converge into "Clinical History"

This should take around 5–8 seconds and loop subtly.

SCREEN 01 — BELOW THE HERO

Don't immediately dump features.

Show the core transformation.

BEFORE → AFTER
             TODAY                         WITH MEDIKIOSK

        Patient speaks                 Patient speaks
              │                              │
              ▼                              ▼
        Manual notes                   AI listens
              │                              │
              ▼                              ▼
       Doctor organizes              Information structured
       the information                      │
              │                              ▼
              ▼                        Doctor reviews
        Consultation                         │
                                             ▼
                                      Consultation

Then one strong statement:

Give clinicians the story before they enter the room.
SCREEN 02 — PATIENT KIOSK

This should feel completely different from the doctor dashboard.

Principle
One screen = one decision.

No sidebar.

No dashboard.

No tiny text.

Welcome screen
┌──────────────────────────────────────────────────────┐
│                                                      │
│                    MEDIKIOSK                         │
│                                                      │
│                    नमस्ते 👋                         │
│                                                      │
│          Let's understand how you're feeling.       │
│                                                      │
│                                                      │
│                    ┌──────┐                          │
│                    │  🎙  │                          │
│                    └──────┘                          │
│                                                      │
│                 Tap to speak                        │
│                                                      │
│                                                      │
│          हिन्दी      తెలుగు      English             │
│                                                      │
└──────────────────────────────────────────────────────┘

Huge touch target.

Patient conversation screen

At the top:

YOUR STORY

●────────●────────○────────○
Symptoms   History   Medicines   Allergies

Then:

                  ◯
             ~~~~~~~~~
           ~~~~~~~~~~~~~
             LISTENING

       "Tell me what brings you
        to the hospital today."

The question itself should be large.

When the patient speaks

The interface changes dynamically.

              I'm listening

                   ◯
             ╭─────────╮
          ~~~           ~~~
       ~~~~~               ~~~~~
          ~~~           ~~~
             ╰─────────╯

       "I've had fever for three days."

Then the AI extracts:

        UNDERSTOOD

      ┌────────────┐
      │ Fever      │
      │ 3 days     │
      └────────────┘

      ┌────────────┐
      │ Symptom    │
      │ Fatigue    │
      └────────────┘

Don't show technical terms such as:

NLP entity extraction

to the patient.

Important interaction

After extraction, the AI should ask:

"Is the fever present throughout the day, or does it come and go?"

This is where the judge sees:

It's not merely speech-to-text.

It's a structured conversational clinical intake system.

SCREEN 03 — DOCTOR DASHBOARD

This is where the visual sophistication increases.

Header
┌───────────────────────────────────────────────────────────┐
│ ✦ MEDIKIOSK                         Dr. Ananya    ● Online │
└───────────────────────────────────────────────────────────┘

Then:

Ramesh Kumar
47 years · Male · OPD

Consultation #0248
AI-assisted history collected 4 min ago
The Clinical Snapshot

Make this the hero component.

┌───────────────────────────────────────────────────────────┐
│ CLINICAL SNAPSHOT                                         │
│                                                           │
│ Persistent fever for 3 days                               │
│                                                           │
│ ┌──────────┐ ┌──────────┐ ┌─────────────┐               │
│ │ Fever    │ │ Fatigue  │ │ Headache    │               │
│ │ 3 days   │ │ Moderate │ │ Intermittent│               │
│ └──────────┘ └──────────┘ └─────────────┘               │
│                                                           │
│ Patient-reported                         ● Verified       │
│                                                           │
│ [ Review full history ]                                   │
└───────────────────────────────────────────────────────────┘
4-column clinical layout

Below it:

┌──────────────────────┬───────────────────────────────────┐
│                      │                                   │
│ PATIENT STORY        │ CLINICAL TIMELINE                 │
│                      │                                   │
│ Chief complaint      │ 2019 ── Diagnosis                 │
│                      │                                   │
│ HPI                  │ 2021 ── Medication                │
│                      │                                   │
│ Past history         │ 2024 ── Lab report                │
│                      │                                   │
│ Medications          │ 2026 ── Current episode           │
│                      │                                   │
└──────────────────────┴───────────────────────────────────┘

And below:

┌──────────────────────────┬──────────────────────────────┐
│ MEDICATIONS              │ ALLERGIES                    │
│                          │                              │
│ Amlodipine 5mg           │ Penicillin                   │
│ Metformin 500mg          │                              │
└──────────────────────────┴──────────────────────────────┘
4. Clinical timeline

This should be one of your signature components.

Make it horizontally scrollable:

2019              2021              2024              2026
 │                  │                  │                  │
 ●──────────────────●──────────────────●──────────────────●
 │                  │                  │                  │
Diagnosis        Medication          Lab              Current
                                      Report            episode

Clicking an event opens its source.

5. DOCUMENT INTELLIGENCE SCREEN

This is where Person 5's work becomes visually impressive.

Layout:

┌──────────────────────────────────────────────────────────┐
│ DOCUMENT INTELLIGENCE                                    │
│                                                          │
│ ┌───────────────────┐    ┌─────────────────────────────┐ │
│ │                   │    │ EXTRACTED INFORMATION       │ │
│ │   Prescription    │    │                             │ │
│ │                   │    │ Amlodipine                  │ │
│ │      IMAGE        │    │ 5 mg · Once daily           │ │
│ │                   │    │                             │ │
│ │                   │    │ Metformin                   │ │
│ │                   │    │ 500 mg · Twice daily         │ │
│ │                   │    │                             │ │
│ └───────────────────┘    └─────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘

When the user hovers over:

Amlodipine

highlight the corresponding text on the document.

This gives you a very impressive:

source → extraction

interaction.

6. Evidence / provenance

Add a small button:

View source

When clicked:

┌───────────────────────────────────────────┐
│ SOURCE                                    │
│                                           │
│ Patient interview                         │
│ Timestamp: 14:42                          │
│                                           │
│ "I've been taking Amlodipine..."          │
│                                           │
│ [ Jump to conversation ]                  │
└───────────────────────────────────────────┘

This is extremely valuable for healthcare because you're showing:

Where did this information come from?
SCREEN 04 — UNIFIED HEALTH RECORD

This screen should communicate the longitudinal record.

Top:

RAMESH KUMAR

Unified Health Record

Then a visual timeline.

But include filters:

ALL   VISITS   MEDICATIONS   LABS   DOCUMENTS

Click:

LABS

and the timeline changes.

Add a meaningful graph

For example:

Temperature trend
Temperature

39° │             ●
38° │         ●───╯
37° │    ●────╯
36° │ ●──╯
    └──────────────────
      Day 1 Day 2 Day 3

Or:

Blood pressure

Only display this when actual data exists.

The rule should be:

No fake graphs.

Judges will notice if you manufacture medical metrics.

SCREEN 05 — SYSTEM / AI ARCHITECTURE

This is specifically your judge-facing screen.

It should look spectacular.

Title:

From Conversation to Clinical Context

Center:

                         PATIENT
                            │
                    ┌───────┴───────┐
                    │               │
                 VOICE           DOCUMENTS
                    │               │
                   ASR              OCR
                    │               │
                    └───────┬───────┘
                            │
                       AI ENGINE
                            │
             ┌──────────────┼──────────────┐
             │              │              │
          Symptoms       Medicines      Timeline
             │              │              │
             └──────────────┼──────────────┘
                            │
                     CLINICAL RECORD
                            │
                         DOCTOR

But don't make this a static flowchart.

Animate the data.

A glowing particle travels:

Patient
  ↓
Voice
  ↓
ASR
  ↓
AI
  ↓
Clinical entities
  ↓
FHIR
  ↓
Doctor

This becomes your technical wow moment.

7. ABDM visualization

Put a section underneath:

Connected through India's digital health ecosystem

Show:

                 PATIENT
                    │
                  ABHA
                    │
                 CONSENT
                    │
         ┌──────────┴──────────┐
         │                     │
      Hospital A           Hospital B
         │                     │
         └──────────┬──────────┘
                    │
                 MediKiosk
                    │
                    ▼
             Unified record

Keep this conceptual unless you have verified and implemented each connection.

Don't visually imply access to records that your actual integration cannot retrieve.

8. AI processing visualization

I would create a component called:

Understanding the patient's story
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  "I've had fever for three days and I've been feeling  │
│   very tired since yesterday..."                       │
│                                                         │
└─────────────────────────────────────────────────────────┘

                     ↓

        ┌─────────┐  ┌──────────┐  ┌───────────┐
        │ Symptom │  │ Duration │  │ Associated│
        │ Fever   │  │ 3 days   │  │ Fatigue   │
        └─────────┘  └──────────┘  └───────────┘

                     ↓

              STRUCTURED HISTORY

That is a beautiful way to explain your AI without exposing model internals.

9. Use illustrations strategically

I would create five custom illustrations.

Illustration A — Patient

Person interacting with kiosk.

Illustration B — Voice

Human speech transforming into structured information.

Illustration C — Documents

Prescription/lab report transforming into data.

Illustration D — Health ecosystem

Patient → consent → records → platform.

Illustration E — Doctor

Doctor receiving a structured clinical snapshot.

All five should use the same illustration language.

Avoid mixing:

3D icons
cartoon characters
stock photographs
random SVG packs

That instantly makes the UI look assembled rather than designed.

10. Micro-interactions

These will make a huge difference.

Voice

Waveform reacts to audio.

AI processing

Tiny nodes connect.

Extracted entity

Fade + slide into place.

Document

Scanning line moves over document.

Timeline

Events reveal sequentially.

Dashboard

Clinical snapshot builds progressively.

ABDM

Connection nodes gently pulse.

Buttons

Tiny movement:

translateY(-1px)

not giant animations.

11. The "wow" sequence for your SIH demo

This is the exact flow I'd build around.

① Start

Judge sees:

Healthcare begins with listening.

Click:

Start Patient Experience

② Patient speaks

Hindi/Telugu/English.

Waveform responds.

③ AI understands
FEVER
3 DAYS
FATIGUE
④ AI asks follow-up

This proves it's conversational.

⑤ Upload prescription

Beautiful scanning animation.

⑥ Information appears
Amlodipine 5mg
Metformin 500mg
⑦ Timeline builds

Previous medical information appears.

⑧ Doctor view

Everything transforms into:

Clinical Snapshot
⑨ Show evidence

Click an extracted item.

Source document / patient statement appears.

⑩ Show architecture

Transition to:

How MediKiosk understands

Then show:

Voice → AI → Clinical Record → FHIR/ABDM → Doctor

12. Tech stack for this frontend

Given the architecture we've discussed, I'd use:

Next.js
TypeScript
Tailwind CSS
shadcn/ui
Framer Motion
Lucide Icons
TanStack Query
Zod
Recharts

For voice:

Web Audio API
WebSocket
MediaRecorder API

For illustrations:

Custom SVG
Lottie
Framer Motion

Don't make Lottie animations the entire UI. Use them only for selected hero/processing moments.

13. Component architecture

I'd structure the frontend roughly like:

src/
│
├── app/
│   ├── page.tsx
│   ├── patient/
│   ├── doctor/
│   ├── records/
│   └── system/
│
├── components/
│   ├── patient/
│   │   ├── VoiceInterface
│   │   ├── Conversation
│   │   ├── Progress
│   │   └── LanguageSelector
│   │
│   ├── doctor/
│   │   ├── ClinicalSnapshot
│   │   ├── PatientTimeline
│   │   ├── MedicationList
│   │   ├── EvidencePanel
│   │   └── DocumentViewer
│   │
│   ├── visualization/
│   │   ├── VoiceWaveform
│   │   ├── ClinicalExtraction
│   │   ├── HealthNetwork
│   │   └── SystemArchitecture
│   │
│   └── ui/
│
├── lib/
│   ├── api.ts
│   ├── websocket.ts
│   └── utils.ts
│
└── types/
14. One important design rule

Don't let the AI coding agent design the product for you.

Give it the design system first.

Otherwise you'll get:

gradient background
+
glassmorphism
+
12 cards
+
purple glow
+
random icons
+
huge AI text

and it will look like an AI-generated hackathon project.

Instead, define:

Design principles
        ↓
Color system
        ↓
Typography
        ↓
Spacing
        ↓
Components
        ↓
Wireframes
        ↓
Interactions
        ↓
Implementation
15. Your final frontend should feel like this
                  MEDIKIOSK
                     │
                     │
             ┌───────▼───────┐
             │               │
          PATIENT            │
             │               │
        "Tell your story."   │
             │               │
             ▼               │
          🎙 VOICE           │
             │               │
             ▼               │
          AI UNDERSTANDS     │
             │               │
       ┌─────┼─────┐         │
       ▼     ▼     ▼         │
    Symptoms Meds Timeline    │
             │                │
             ▼                │
        CLINICAL SNAPSHOT     │
             │                │
             ▼                │
           DOCTOR             │
             │                │
             ▼                │
       BETTER PREPARATION     │

The product story itself becomes the UI.

What I recommend we do next

The next step shouldn't be coding yet.

We should create the actual visual mockups for these 5 screens:

Landing / Hero
Patient Voice Kiosk
Doctor Clinical Dashboard
Unified Health Record
AI + ABDM System Visualization

Then, once those are visually locked, we can turn them into a pixel-level frontend specification—component by component, including exact spacing, typography, animation behavior, responsive behavior, and the implementation structure for Next.js.