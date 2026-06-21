import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Near-monochrome, warm. One accent, used sparingly.
        canvas: "#FBFBF9",
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#1A1A19",
          muted: "#6F6E6A",
          subtle: "#9C9B96",
        },
        line: "#E9E7E2",
        accent: {
          DEFAULT: "#156458",
          ink: "#0E463E",
          soft: "#EBF1EF",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(20,20,19,0.04), 0 1px 1px rgba(20,20,19,0.03)",
        card: "0 8px 24px -10px rgba(20,20,19,0.14)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
      transitionDuration: {
        DEFAULT: "180ms",
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        shimmer: "shimmer 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
