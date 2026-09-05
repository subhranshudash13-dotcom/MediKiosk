# 🎨 MediKiosk 5-Color Master Design System

> **Visual Identity**: Intelligence (`#1D2A8F` Cobalt Navy) + Human Physical Urgency (`#C2410C` Rust) + Active Acoustic Vitality (`#FB923C` Marigold) + Welcoming Warmth (`#FDEBD0` Almond Cream) + High-Precision Clinical Clarity (`#374151` Slate Charcoal).

---

## 🌈 5-Color Palette Tokens

```css
:root {
  /* 🔵 1. Primary Cobalt Navy (Intelligence / Navigation / Doctor Highlights / Headings) */
  --cobalt-primary: #1D2A8F;
  --cobalt-dark: #141E66;
  --cobalt-light: #2A3ABF;
  --cobalt-subtle: #EAEBFA;

  /* 🔴 2. Rich Rust / Burnt Terracotta (Emergency Triage / Safety Red Flags / Secondary CTAs) */
  --rust-accent: #C2410C;
  --rust-dark: #9A3412;
  --rust-hover: #EA580C;
  --rust-light: #FFEDD5;

  /* 🟠 3. Warm Marigold / Amber Orange (Microphone Waveform / Active Voice Stream / Micro-badges) */
  --marigold-vital: #FB923C;
  --marigold-light: #FFF7ED;

  /* 🥛 4. Almond Cream / Warm Neutral (Environment Canvas / Page Background) */
  --almond-canvas: #FDEBD0;
  --almond-subtle: #FAF2E8;
  --almond-border: #EAD7C0;
  --surface-white: #FFFFFF;

  /* 🖤 5. Slate Charcoal (Typography / Structural Data / High Contrast Clinical Copy) */
  --slate-text: #374151;
  --slate-dark: #1F2937;
  --slate-muted: #6B7280;
  --slate-border: #E5E7EB;

  /* 🌿 Secondary State (ABDM Verified, Healthy Vitals, Completed Sessions) */
  --emerald-success: #059669;
  --emerald-light: #D1FAE5;
}
```

---

## 📊 Semantic Distribution Matrix

| Token | Hex Code | Visual Role | Application |
| :--- | :--- | :--- | :--- |
| **Primary** | `#1D2A8F` | Cobalt Navy | Doctor sidebar, primary buttons, logo mark, key headings, active navigation |
| **Accent / Alert** | `#C2410C` | Rich Rust | Emergency red flags, severity >= 7 badges, high-priority actions |
| **Voice / Waveform** | `#FB923C` | Warm Marigold | Multi-harmonic audio waveform canvas, recording states, micro-highlights |
| **Canvas** | `#FDEBD0` | Almond Cream | Page background canvas, warm touch kiosks, subtle card containers |
| **Typography** | `#374151` | Slate Charcoal | Main body text, patient clinical quotes, medical data metrics |
| **Surface** | `#FFFFFF` | Pure White | Information cards, EHR consultation panels, OCR dropzones |
