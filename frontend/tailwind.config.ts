import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Master 5-Color Palette: Cobalt + Rust + Marigold + Almond + Slate
        cobalt: {
          DEFAULT: "#1D2A8F",
          dark: "#141E66",
          light: "#2A3ABF",
          subtle: "#EAEBFA",
        },
        rust: {
          DEFAULT: "#C2410C",
          dark: "#9A3412",
          light: "#FFEDD5",
          hover: "#EA580C",
        },
        marigold: {
          DEFAULT: "#FB923C",
          light: "#FFF7ED",
          dark: "#EA580C",
        },
        almond: {
          DEFAULT: "#FDEBD0",
          warm: "#FDEBD0",
          card: "#FFFFFF",
          subtle: "#FAF2E8",
          border: "#EAD7C0",
        },
        slate: {
          DEFAULT: "#374151",
          soft: "#1F2937",
          secondary: "#6B7280",
          muted: "#9CA3AF",
          border: "#E5E7EB",
          "border-subtle": "#F3F4F6",
        },
        emerald: {
          DEFAULT: "#059669",
          light: "#D1FAE5",
          dark: "#047857",
        },

        // Semantic Mappings
        background: "#FDEBD0",
        foreground: "#374151",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#374151",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#374151",
        },
        primary: {
          DEFAULT: "#1D2A8F",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#FB923C",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#FAF2E8",
          foreground: "#6B7280",
        },
        accent: {
          DEFAULT: "#C2410C",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#C2410C",
          foreground: "#FFFFFF",
        },
        border: "#EAD7C0",
        input: "#EAD7C0",
        ring: "#1D2A8F",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        heading: ["var(--font-dm-sans)", "DM Sans", "Manrope", "system-ui", "sans-serif"],
        display: ["var(--font-dm-sans)", "DM Sans", "Manrope", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "data": "6px",          // 4–6px: clinical data, tables, badges, vitals tags
        "clinical": "6px",      // 4–6px: clinical data values, ICD-10 tags
        "card": "14px",         // 10–14px: cards, containers, panels, previews
        "panel": "14px",        // 10–14px: panels
        "interactive": "24px",  // 20–24px: patient-facing touch targets, kiosk buttons
        "patient": "24px",      // 20–24px: patient buttons
        "control": "24px",      // 20–24px: primary action controls
        lg: "14px",
        md: "8px",
        sm: "6px",
      },
      boxShadow: {
        "subtle": "0 1px 3px 0 rgba(55, 65, 81, 0.05)",
        "card": "0 2px 6px 0 rgba(55, 65, 81, 0.06), 0 1px 3px -1px rgba(55, 65, 81, 0.04)",
        "elevated": "0 6px 18px -3px rgba(29, 42, 143, 0.1), 0 2px 6px -2px rgba(29, 42, 143, 0.05)",
        "glow-amber": "0 0 20px -2px rgba(251, 146, 60, 0.35)",
        "glow-cobalt": "0 0 20px -2px rgba(29, 42, 143, 0.25)",
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
