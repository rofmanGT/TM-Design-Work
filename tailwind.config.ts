import type { Config } from "tailwindcss";

// ─────────────────────────────────────────────────────────────────────
// Georgetown University brand palette — authoritative values from the
// GU Visual Identity color guide (Primary / Secondary / Tertiary + the
// published tint ramps). Every colour in the app resolves to one of these.
//
//  Primary   Georgetown Blue #041E42 · Georgetown Gray (Cool Gray 10) #63666A
//  Secondary Blue 280 #012169 · Blue 293 #003DA5 · Cool Gray 4 #BBBCBC ·
//            Putty 7527 #D6D2C4
//  Tertiary  Cyan 306 #00B5E2 · Red 202 #862633 · Green 369 #64A70B ·
//            Light Red 199 #D50032 · Yellow 1205 #F8E08E
//
// Grays: the neutral scale below IS the Georgetown Gray (Cool Gray 10)
// tint ramp. Because Tailwind `slate-*` is used app-wide, we OVERRIDE the
// slate scale with these tints so every existing class lands on-palette;
// the dark end (800–950) transitions into Georgetown Blue, since the GU
// palette has no near-black neutral and navy is the primary colour.
// ─────────────────────────────────────────────────────────────────────

// Georgetown Gray (Cool Gray 10 #63666A) — published 10%–90% tints + base.
const georgetownGray = {
  50: "#EDEEEE", //  10%
  100: "#DDDDDF", // 20%
  200: "#CDCECF", // 30%
  300: "#BCBDC0", // 40%
  400: "#ADAEB0", // 50%
  500: "#9D9FA2", // 60%
  600: "#8E9093", // 70%
  700: "#7F8185", // 80%
  800: "#717277", // 90%
  900: "#63666A", // base (Cool Gray 10)
  950: "#4C4E51", // shade of base for the deepest neutral text
};

// Cool Gray 4 (#BBBCBC) — the lighter published tint ramp.
const coolGray = {
  50: "#F7F7F7",
  100: "#F0F0F0",
  200: "#E9E9E9",
  300: "#E2E2E2",
  400: "#DCDCDC",
  500: "#D5D5D5",
  600: "#CECFCF",
  700: "#C7C7C7",
  800: "#C1C1C1",
  900: "#BBBCBC",
};

// Georgetown Blue (#041E42) — navy surface ramp for dark mode + dark chrome.
const navy = {
  50: "#E7ECF3",
  100: "#C3D0E0",
  200: "#8EA3C0",
  300: "#4F6E9C",
  400: "#183C6E",
  500: "#0A2A54",
  600: "#0A2348",
  700: "#071F40",
  800: "#041E42", // Georgetown Blue (base)
  900: "#031630",
  950: "#021124", // deepest navy
};

// Cyan / Tertiary Blue 306 (#00B5E2) — published tint ramp.
const gucyan = {
  50: "#EAF6FB",
  100: "#D6EFF9",
  200: "#C1E8F5",
  300: "#ACE0F3",
  400: "#95D8F0",
  500: "#7CD1EE",
  600: "#5FC9EB",
  700: "#37C2E8",
  800: "#02BAE6",
  900: "#00B5E2", // base (Tertiary 306)
};

// Green / Pantone 369 (#64A70B) — published tint ramp.
const gugreen = {
  50: "#EFF5E7",
  100: "#E0ECD0",
  200: "#D1E3BA",
  300: "#C2DBA4",
  400: "#B3D28E",
  500: "#A3C978",
  600: "#94C063",
  700: "#83B84B",
  800: "#73AF34",
  900: "#64A70B", // base (Pantone 369)
};

// Signal ramps positioned so Tailwind's "main" shades (500–600) land on
// the readable Georgetown hue — lets emerald-*/red-*/amber-* classes used
// across the app resolve on-palette without per-usage edits.
// Green (Pantone 369 #64A70B) — base at 600.
const signalGreen = {
  50: "#EFF5E7",
  100: "#E0ECD0",
  200: "#D1E3BA",
  300: "#C2DBA4",
  400: "#A3C978",
  500: "#83B84B",
  600: "#64A70B", // GU Green 369
  700: "#548A09",
  800: "#456F08",
  900: "#3F6B07",
  950: "#2E4D05",
};
// Red (Light Red 199 #D50032 main, Red 202 #862633 deep) — base at 500.
const gured = {
  50: "#FBE9ED",
  100: "#F6C6D0",
  200: "#EC8D9F",
  300: "#E1546F",
  400: "#DE2A54",
  500: "#D50032", // GU Light Red 199
  600: "#B4002A",
  700: "#862633", // GU Red 202
  800: "#6C2029",
  900: "#59191F",
  950: "#3A0F14",
};
// Yellow (Yellow 1205 #F8E08E) — base at 300; darker shades for dark use.
const guyellow = {
  50: "#FEFBEF",
  100: "#FDF5D5",
  200: "#FBEBAE",
  300: "#F8E08E", // GU Yellow 1205
  400: "#EFCB5F",
  500: "#DFB23B",
  600: "#BE922B",
  700: "#977422",
  800: "#6F561C",
  900: "#584515",
  950: "#33270C",
};

// Putty / Pantone 7527 (#D6D2C4) — warm paper tint ramp.
const guputty = {
  50: "#FCFCFA",
  100: "#FAF8F5",
  200: "#F8F6F1",
  300: "#F6F3EE",
  400: "#F5F0EB",
  500: "#F3EFE8",
  600: "#F2EDE5",
  700: "#F0EAE3",
  800: "#EEE8E0",
  900: "#D6D2C4", // base (Pantone 7527)
};

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Override the app-wide neutral so every slate-* class is on-palette.
        slate: {
          ...georgetownGray,
          700: "#63666A", // Georgetown Gray (base) — borders/chips on dark
          800: navy[600], // #0A2348 — dark chips / secondary dark surface
          900: navy[800], // #041E42 — Georgetown Blue, primary dark surface
          950: "#021124", // deepest navy background
        },
        gray: georgetownGray, // any stray gray-* also lands on GU gray

        // Signal families → Georgetown green / red / yellow, so every
        // emerald-*/green-*/lime-*/red-*/amber-*/yellow-*/orange-* class
        // in the app resolves on-palette.
        emerald: signalGreen,
        green: signalGreen,
        lime: signalGreen,
        red: gured,
        rose: gured,
        amber: guyellow,
        yellow: guyellow,
        orange: guyellow,

        // Named Georgetown tokens
        gunavy: navy,
        gugray: georgetownGray,
        coolgray: coolGray,
        navy,
        gucyan,
        gugreen,
        guputty,
        "gu-blue": "#041E42",
        "gu-blue-280": "#012169",
        "gu-blue-293": "#003DA5",
        "gu-gray": "#63666A",
        "gu-cyan": "#00B5E2",
        "gu-red": "#862633",
        "gu-red-bright": "#D50032",
        "gu-green": "#64A70B",
        "gu-yellow": "#F8E08E",
        "gu-putty": "#D6D2C4",

        // Legacy aliases (kept so existing class names resolve)
        "tm-navy": "#041E42",
        "tm-cyan": "#00B5E2",
        "tm-canvas": "#FFFCF5",
        "tm-sidebar": "#E2E2E2",

        // Manipulation signal colours — Georgetown green / yellow / red.
        manipulation: {
          "high-500": "#D50032", // GU Light Red 199
          "high-pill-bg": "#862633", // GU Red 202
          "high-pill-text": "#FFFFFF",
          "mid-pill-bg": "#F8E08E", // GU Yellow 1205
          "mid-pill-text": "#041E42", // navy text on yellow
          "low-pill-bg": "#64A70B", // GU Green 369
          "low-pill-text": "#041E42",
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
