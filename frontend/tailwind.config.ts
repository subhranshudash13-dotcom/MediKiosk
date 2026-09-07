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
        // Master Natural Clinical Palette: Forest Pine + Botanical Sage + Terracotta + Warm Linen + Mineral Charcoal
        pine: {
          DEFAULT: "#1B4332",
          dark: "#081C15",
          light: "#2D6A4F",
          subtle: "#E8F5EE",
        },
        sage: {
          DEFAULT: "#40916C",
          dark: "#2D6A4F",
          light: "#D8F3DC",
          muted: "#EBF7EE",
        },
        terracotta: {
          DEFAULT: "#9C4124",
          dark: "#7A3119",
          light: "#FDF3F0",
          hover: "#B34A29",
        },
        linen: {
          DEFAULT: "#FBF9F5",
          warm: "#F5F1E9",
          card: "#FFFFFF",
          subtle: "#EFEBE2",
          border: "#E0D7C9",
          borderStrong: "#C9BEAC",
        },
        charcoal: {
          DEFAULT: "#1F2421",
          soft: "#2A302D",
          secondary: "#4E5752",
          muted: "#76807A",
          border: "#E0D7C9",
          "border-subtle": "#EDE8DE",
        },
        emerald: {
          DEFAULT: "#2D6A4F",
          light: "#D8F3DC",
          dark: "#1B4332",
        },

        // Semantic Mappings
        background: "#FBF9F5",
        foreground: "#1F2421",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1F2421",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#1F2421",
        },
        primary: {
          DEFAULT: "#1B4332",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#9C4124",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F3EFE8",
          foreground: "#606963",
        },
        accent: {
          DEFAULT: "#9C4124",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#9C4124",
          foreground: "#FFFFFF",
        },
        border: "#E0D7C9",
        input: "#E0D7C9",
        ring: "#1B4332",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        heading: ["var(--font-dm-sans)", "DM Sans", "Manrope", "system-ui", "sans-serif"],
        display: ["var(--font-dm-sans)", "DM Sans", "Manrope", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "data": "6px",          // 4–6px: clinical data, tables, badges, vitals tags
        "clinical": "6px",      // 4–6px: clinical data values, ICD-10 tags
        "card": "16px",         // 14–16px: cards, containers, panels, previews
        "panel": "16px",        // 14–16px: panels
        "interactive": "24px",  // 20–24px: patient-facing touch targets, kiosk buttons
        "patient": "24px",      // 20–24px: patient buttons
        "control": "24px",      // 20–24px: primary action controls
        lg: "16px",
        md: "10px",
        sm: "6px",
      },
      boxShadow: {
        "subtle": "0 1px 3px 0 rgba(31, 36, 33, 0.04)",
        "card": "0 2px 8px -1px rgba(31, 36, 33, 0.06), 0 1px 3px -1px rgba(31, 36, 33, 0.03)",
        "elevated": "0 8px 24px -4px rgba(27, 67, 50, 0.08), 0 2px 8px -2px rgba(27, 67, 50, 0.04)",
        "pressed": "inset 0 2px 4px 0 rgba(31, 36, 33, 0.08)",
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
