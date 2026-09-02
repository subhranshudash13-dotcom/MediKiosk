# 🎨 MediKiosk Design System & Color Palette

This document defines the official design system and color palette tokens for MediKiosk. All frontend interfaces, components, kiosk screens, and doctor dashboards must strictly adhere to this color system.

---

## 🌈 Master Color Palette Specification

```css
:root {
  /* Brand */
  --brand-primary: #7C6EF7;
  --brand-primary-dark: #6758F0;
  --brand-primary-light: #EEEAFE;

  /* Success */
  --success: #12B981;
  --success-light: #DCFCE7;

  /* Warning */
  --warning: #F59E0B;
  --warning-light: #FEF3C7;

  /* AI */
  --ai: #06B6D4;
  --ai-light: #CFFAFE;

  /* Neutral */
  --black: #111111;
  --white: #FFFFFF;

  /* Text */
  --text-primary: #111111;
  --text-secondary: #5F5E5A;
  --text-muted: #8A8A8A;

  /* Borders */
  --border: #E7E4DD;
  --border-light: #F2F0EB;

  /* Backgrounds */
  --bg-main: #FAFAFC;
  --bg-alt: #F5F3FF;
  --bg-dark: #111111;
  --bg-dark-card: #1A1A1A;
}
```

---

## 📊 Palette Breakdown & Semantic Usage

| Category | Token Variable | Hex Code | Purpose & Semantic Usage |
| :--- | :--- | :--- | :--- |
| **Brand** | `--brand-primary` | `#7C6EF7` | Primary buttons, active highlights, key CTAs |
| **Brand** | `--brand-primary-dark` | `#6758F0` | Button hover states, emphasized accents |
| **Brand** | `--brand-primary-light` | `#EEEAFE` | Badge backgrounds, secondary highlight containers |
| **Success** | `--success` | `#12B981` | Routine triage, verified ABHA status, healthy vitals |
| **Success** | `--success-light` | `#DCFCE7` | Success chip/badge backgrounds |
| **Warning** | `--warning` | `#F59E0B` | Urgent triage, caution alerts, pending consents |
| **Warning** | `--warning-light` | `#FEF3C7` | Warning badge & banner backgrounds |
| **AI** | `--ai` | `#06B6D4` | Voice agent waveforms, OCR confidence, AI insights |
| **AI** | `--ai-light` | `#CFFAFE` | AI reasoning containers, transcription bubbles |
| **Neutral** | `--black` | `#111111` | Pure dark accents, high-contrast borders |
| **Neutral** | `--white` | `#FFFFFF` | Card surfaces, clean canvas backgrounds |
| **Text** | `--text-primary` | `#111111` | Headings, primary clinical copy, essential labels |
| **Text** | `--text-secondary` | `#5F5E5A` | Sub-headings, metadata, helper descriptions |
| **Text** | `--text-muted` | `#8A8A8A` | Placeholders, timestamps, disabled indicators |
| **Borders** | `--border` | `#E7E4DD` | Card dividers, input borders, structural separators |
| **Borders** | `--border-light` | `#F2F0EB` | Subtle row separators, table borders |
| **Backgrounds** | `--bg-main` | `#FAFAFC` | Main app background canvas |
| **Backgrounds** | `--bg-alt` | `#F5F3FF` | Hero sections, highlighted sidebars, subtle tint cards |
| **Backgrounds** | `--bg-dark` | `#111111` | Dark mode canvas / Kiosk high-contrast theme |
| **Backgrounds** | `--bg-dark-card` | `#1A1A1A` | Dark mode surface cards |

---

## ⚡ Tailwind CSS Class Reference

Use the customized Tailwind classes mapped directly to this palette:

```html
<!-- Primary Brand Button -->
<button className="bg-brand-primary hover:bg-brand-primary-dark text-white">
  Continue
</button>

<!-- AI Assistant Tag -->
<span className="bg-ai-light text-ai px-2.5 py-1 rounded-full">
  Voice Agent Active
</span>

<!-- Verified ABHA Card -->
<div className="bg-bg-main border border-border p-6 rounded-2xl">
  <p className="text-text-primary font-bold">ABHA Verified</p>
  <p className="text-text-secondary">Health ID: 91-4567-8901-2345</p>
</div>
```
