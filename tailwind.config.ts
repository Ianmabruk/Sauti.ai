import type { Config } from "tailwindcss";

/**
 * Tailwind configuration for the Sauti AI assistant UI.
 *
 * Every colour, radius, shadow and font used by the app is declared here as a
 * named token. Components must reference these tokens (`bg-sauti-blue`,
 * `rounded-card`, `shadow-search`) rather than reaching for arbitrary values,
 * so the whole surface can be re-themed from this one file.
 */
const config: Config = {
  // Class names are only generated for files that can actually contain them.
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sauti: {
          // Neutral surfaces and text.
          bg: "#FFFFFF",
          surface: "#F5F5F7",
          border: "#E5E7EB",
          text: "#1A1A2E",
          textMuted: "#6B7280",
          textFaint: "#9CA3AF",
          // Category accents. Each pairs a saturated tone with the wash it
          // sits on, so a card can be tinted without picking a colour twice.
          blue: "#2563EB",
          blueSoft: "#EBF3FF",
          orange: "#EA580C",
          orangeSoft: "#FFF4E6",
          green: "#059669",
          greenSoft: "#E8F7F0",
          purple: "#7C3AED",
          purpleSoft: "#F3EEFF",
        },
      },
      borderRadius: {
        card: "12px",
        large: "16px",
        pill: "999px",
        // The component specs name `rounded-xl` / `rounded-2xl` directly. They
        // are pinned to the `card` / `large` token values so both spellings
        // resolve to exactly the same pixels and stay in one place.
        xl: "12px",
        "2xl": "16px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06)",
        cardHover: "0 8px 24px rgba(0,0,0,0.08)",
        search: "0 4px 16px rgba(37,99,235,0.08)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;