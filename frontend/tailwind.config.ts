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
        // v2 Primary Clinical Blue Palette
        clinical: {
          DEFAULT: "#0056B3",
          dark: "#004085",
          darker: "#002752",
          light: "#CCE5FF",
          subtle: "#EBF3FC",
          hover: "#004B9E",
        },
        // v2 Secondary Calming Teal Palette
        teal: {
          DEFAULT: "#17A2B8",
          brand: "#17A2B8",
          dark: "#117A8B",
          darker: "#0C5460",
          light: "#D1ECF1",
          subtle: "#E8F7F9",
        },
        // v2 Deep Charcoal Typography
        charcoal: {
          DEFAULT: "#2C3E50",
          dark: "#1A252F",
          secondary: "#4A5D6E",
          muted: "#6C7A89",
          subtle: "#8A9BA8",
          border: "#DEE2E6",
          "border-subtle": "#E9ECEF",
        },
        // v2 Background & Neutral Canvas
        canvas: {
          DEFAULT: "#F8F9FA",
          card: "#FFFFFF",
          subtle: "#F1F3F5",
          border: "#DEE2E6",
          borderStrong: "#CED4DA",
          disabled: "#E9ECEF",
        },
        // Semantic Action Colors
        success: {
          DEFAULT: "#28A745",
          dark: "#1E7E34",
          light: "#D4EDDA",
          subtle: "#EAF7ED",
        },
        warning: {
          DEFAULT: "#DC3545",
          dark: "#BD2130",
          light: "#F8D7DA",
          subtle: "#FCEBEC",
        },

        // Backward compatibility mappings
        pine: {
          DEFAULT: "#0056B3",
          dark: "#004085",
          light: "#17A2B8",
          subtle: "#EBF3FC",
        },
        sage: {
          DEFAULT: "#17A2B8",
          dark: "#117A8B",
          light: "#D1ECF1",
          muted: "#E8F7F9",
        },
        terracotta: {
          DEFAULT: "#DC3545",
          dark: "#BD2130",
          light: "#F8D7DA",
          hover: "#C82333",
        },
        linen: {
          DEFAULT: "#F8F9FA",
          warm: "#F1F3F5",
          card: "#FFFFFF",
          subtle: "#EBF3FC",
          border: "#DEE2E6",
          borderStrong: "#CED4DA",
        },

        // Global Semantic Tokens
        background: "#F8F9FA",
        foreground: "#2C3E50",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#2C3E50",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#2C3E50",
        },
        primary: {
          DEFAULT: "#0056B3",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#17A2B8",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F1F3F5",
          foreground: "#6C7A89",
        },
        accent: {
          DEFAULT: "#17A2B8",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#DC3545",
          foreground: "#FFFFFF",
        },
        border: "#DEE2E6",
        input: "#DEE2E6",
        ring: "#0056B3",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        heading: ["var(--font-dm-sans)", "DM Sans", "Manrope", "system-ui", "sans-serif"],
        display: ["var(--font-dm-sans)", "DM Sans", "Manrope", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "data": "6px",
        "clinical": "8px",
        "card": "16px",
        "panel": "16px",
        "interactive": "24px",
        "patient": "9999px",
        "control": "24px",
        lg: "16px",
        md: "10px",
        sm: "6px",
      },
      boxShadow: {
        "subtle": "0 1px 3px 0 rgba(44, 62, 80, 0.05)",
        "card": "0 2px 10px -1px rgba(44, 62, 80, 0.06), 0 1px 3px -1px rgba(44, 62, 80, 0.03)",
        "elevated": "0 8px 30px -4px rgba(0, 86, 179, 0.08), 0 4px 12px -2px rgba(44, 62, 80, 0.04)",
        "pressed": "inset 0 2px 4px 0 rgba(44, 62, 80, 0.08)",
        "blue-glow": "0 0 20px rgba(0, 86, 179, 0.25)",
        "teal-glow": "0 0 20px rgba(23, 162, 184, 0.25)",
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
