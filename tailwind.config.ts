import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "tm-navy": "#041E42",
        "tm-cyan": "#00B5E2",
        "tm-canvas": "#FFFCF5",
        "tm-sidebar": "#E2E2E2",
        manipulation: {
          "high-500": "#DC2626",
          "high-pill-bg": "#771D1D",
          "high-pill-text": "#F8B4B5",
          "mid-pill-bg": "#78350F",
          "mid-pill-text": "#FCD34D",
          "low-pill-bg": "#14532D",
          "low-pill-text": "#86EFAC",
        },
      },
      fontFamily: {
        sans: ["Gellix", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
