// ─────────────────────────────────────────────────────────────────────
// REAL DATA extracted from the production TrueMedia repo
// (/Users/rofman/tm-truemedia-main). Every string below is quoted
// verbatim from the source files noted per section — nothing invented.
// Use this module to replace the mock sample data so the design shows
// what the product looks like with the real roster and copy.
// ─────────────────────────────────────────────────────────────────────

// ── Verdict taxonomy ─────────────────────────────────────────────────
// Source: apps/detect/app/data/verdict.ts + data/model.ts (ranks)
// Badge colors are the exact hex values the real product renders.

export type RealVerdictId = "low" | "uncertain" | "high" | "unknown" | "trusted";

export const REAL_VERDICTS: Record<
  RealVerdictId,
  { longSummary: string; adjective: string; shortSummary: string; badgeBackground: string; badgeText: string }
> = {
  low: {
    longSummary: "Little Evidence of Manipulation",
    adjective: "little",
    shortSummary: "Little Evidence",
    badgeBackground: "#014737",
    badgeText: "#84E1BD",
  },
  uncertain: {
    longSummary: "Uncertain: Could Be Authentic or Manipulated",
    adjective: "some",
    shortSummary: "Uncertain",
    badgeBackground: "#623112",
    badgeText: "#FBCA16",
  },
  high: {
    longSummary: "Substantial Evidence of Manipulation",
    adjective: "substantial",
    shortSummary: "Substantial Evidence",
    badgeBackground: "#771D1D",
    badgeText: "#F8B4B5",
  },
  unknown: {
    longSummary: "Unknown",
    adjective: "unknown",
    shortSummary: "Unknown",
    badgeBackground: "#374051",
    badgeText: "#FFFFFF",
  },
  trusted: {
    // trusted media is treated the same as "low manipulation" in the real app
    longSummary: "Little Evidence of Manipulation",
    adjective: "little",
    shortSummary: "Little Evidence",
    badgeBackground: "#014737",
    badgeText: "#84E1BD",
  },
};

// ── Manipulation categories ──────────────────────────────────────────
// Source: apps/detect/app/data/model.ts (manipulationCategoryInfo)

export type RealCategoryId = "face" | "imagen" | "noise" | "audio" | "semantic" | "other";

export const REAL_CATEGORIES: Record<RealCategoryId, { label: string; descrip: string }> = {
  face: { label: "Faces", descrip: "Generation or manipulation of faces" },
  imagen: { label: "Generative AI", descrip: "Detects signatures of GenAI tools" },
  noise: { label: "Visual Noise", descrip: "Variations in pixels and color" },
  audio: { label: "Voices", descrip: "Voice cloning or generation" },
  semantic: { label: "Semantic", descrip: "Semantic inconsistencies" },
  other: { label: "Other", descrip: "Other AI analyses" },
};

// ── Detector roster ──────────────────────────────────────────────────
// Source: apps/detect/app/model-processors/*.ts — user-facing name,
// descrip, category, media type, and aggregation policy per model.
// policy: "include" = 1 vote, "trust" = 2 votes, "ignore" = not aggregated.
//
// This is deliberately NOT the full model catalog. It mirrors only the
// models the production repo still ships — those whose processor is
// `availability: "enabled"` (live in the ensemble today) or `"disabled"`
// (integrated but currently switched off = planned). Every model whose
// processor is `"archived"` (deprecated/replaced — most Hive, Nuanced,
// MMFusion, Reality Defender, the old OpenAI/UFD variants, etc.) is
// omitted so the design never advertises detectors the team has retired.

export type RealDetector = {
  key: string;
  name: string;
  descrip: string;
  category: RealCategoryId;
  mediaType: "image" | "video" | "audio" | "text";
  policy: "include" | "trust" | "ignore";
  /** Production deployment state: "enabled" = live in the ensemble today;
   *  "planned" = built/integrated but currently switched off (processor
   *  availability "disabled"). Archived models are excluded entirely. */
  availability: "enabled" | "planned";
  source: string; // in-house vs partner, from the processor file name
};

export const REAL_DETECTORS: RealDetector[] = [
  // ── Live today — processor availability "enabled" ──────────────────
  // In-house models — apps/detect/app/model-processors/truemedia.ts
  {
    key: "dire",
    name: "Diffusion-Generated Image Detector",
    descrip: "Identifies visual noise left behind by a diffusion model while it generates an image.",
    category: "noise",
    mediaType: "image",
    policy: "include",
    availability: "enabled",
    source: "truemedia (in-house)",
  },
  {
    key: "fire",
    name: "Frequency-Domain Image Detector",
    descrip: "Identifies visual noise left behind by a diffusion model while it generates an image.",
    category: "noise",
    mediaType: "image",
    policy: "include",
    availability: "enabled",
    source: "truemedia (in-house)",
  },
  {
    key: "wav2vec2",
    name: "Audio Analysis",
    descrip: "Analyzes audio for evidence that it was created by an AI generator or cloning.",
    category: "audio",
    mediaType: "audio",
    policy: "include",
    availability: "enabled",
    source: "truemedia (in-house)",
  },
  {
    key: "claim-ensemble",
    name: "Text Claim Ensemble",
    descrip: "Uses multiple LLMs to examine and determine the veracity of text claims.",
    category: "semantic",
    mediaType: "text",
    policy: "trust",
    availability: "enabled",
    source: "truemedia (in-house)",
  },

  // ── Planned — integrated but processor availability "disabled" ─────
  {
    key: "genconvit",
    name: "Video Facial Analysis",
    descrip: "Analyzes video frames for unusual patterns and discrepancies in facial features.",
    category: "face",
    mediaType: "video",
    policy: "ignore",
    availability: "planned",
    source: "truemedia (in-house)",
  },
  {
    key: "sensity-face",
    name: "Face Manipulation Detector",
    descrip:
      "Detects potential AI manipulation of faces present in images and videos, as in the case of face swaps and face reenactment.",
    category: "face",
    mediaType: "video",
    policy: "ignore",
    availability: "planned",
    source: "sensity",
  },
  {
    key: "intel",
    name: "Video Analysis",
    descrip: "Analyzes video for indications that it was generated by an AI audio generator.",
    category: "face",
    mediaType: "video",
    policy: "ignore",
    availability: "planned",
    source: "intel",
  },
  {
    key: "sensity-image",
    name: "AI-Generated Image Detector",
    descrip: "Detects AI-generated, photorealistic images created by Stable Diffusion, MidJourney, DALL·E 2 and others.",
    category: "imagen",
    mediaType: "image",
    policy: "ignore",
    availability: "planned",
    source: "sensity",
  },
  {
    key: "microsoft",
    name: "AI-Generated Image Classifier",
    descrip: "The classifier distinguishes an AI-generated image from a real one.",
    category: "imagen",
    mediaType: "image",
    policy: "ignore",
    availability: "planned",
    source: "microsoft",
  },
  {
    key: "aion-image",
    name: "AI Image Generator Analysis",
    descrip:
      "Analyzes image for indications that it was generated by popular AI image generators, like MidJourney, Dall-E, Stable Diffusion and thispersondoesnotexist.com.",
    category: "imagen",
    mediaType: "image",
    policy: "ignore",
    availability: "planned",
    source: "aion (AI or Not)",
  },
  {
    key: "dftotal",
    name: "Voice Anti-Spoofing Analysis",
    descrip: "Analyzes audio for evidence that it was created by an AI audio generator.",
    category: "audio",
    mediaType: "audio",
    policy: "ignore",
    availability: "planned",
    source: "dftotal (Deepfake Total)",
  },
  {
    key: "loccus",
    name: "Audio Authenticity Detector",
    descrip: "Analyzes audio for evidence that it was created by an AI generator or cloning.",
    category: "audio",
    mediaType: "audio",
    policy: "ignore",
    availability: "planned",
    source: "loccus (Hiya AI)",
  },
  {
    key: "pindrop",
    name: "Voice Biometric and Voiceprinting Analysis",
    descrip: "Analyzes audio for evidence that it was created by an AI generator or cloning.",
    category: "audio",
    mediaType: "audio",
    policy: "ignore",
    availability: "planned",
    source: "pindrop",
  },
  {
    key: "openai-transcript",
    name: "Audio Transcript Analysis",
    descrip: "Uses semantic understanding of speech to detect misleading audio.",
    category: "semantic",
    mediaType: "audio",
    policy: "ignore",
    availability: "planned",
    source: "openai",
  },
];

// ── Generator attribution ────────────────────────────────────────────
// Source: apps/detect/app/generators.ts — shown when a detector can name
// the generator that produced a piece of media. Icons in /generators/.

export const REAL_GENERATORS = [
  { key: "dalle", displayName: "DALL-E", abbreviation: "DE", iconPath: "/generators/openai.svg" },
  { key: "midjourney", displayName: "MidJourney", abbreviation: "MJ", iconPath: "/generators/midjourney.svg" },
  { key: "stablediffusion", displayName: "Stable Diffusion", abbreviation: "SD" },
  { key: "hive", displayName: "Hive", abbreviation: "H", iconPath: "/generators/hive.jpg" },
  { key: "bingimagecreator", displayName: "Bing Image Creator", abbreviation: "BI", iconPath: "/generators/microsoft.svg" },
];

// ── Real documented deepfake / authentic cases ───────────────────────
// Source: apps/detect/app/quiz/page.tsx (quizMedia) — the political
// deepfake quiz the team curated. Titles and descriptions verbatim;
// citation URLs from the inline links. `groundTruth` is set ONLY where
// the cited source itself states it; otherwise "unlabeled" (the quiz
// answer key is not in the repo).

export type RealCase = {
  id: string;
  title: string;
  description: string;
  mediaType: "image" | "video" | "audio";
  citationUrl?: string;
  groundTruth: "fake" | "authentic" | "unlabeled";
};

export const REAL_CASES: RealCase[] = [
  {
    id: "pf8gnScszm1EmkrCb1EuIVX_tLg.jpg",
    title: "Xóchitl Gálvez, Mexican presidential candidate",
    description: "Xóchitl Gálvez waving Mexico’s flag, manipulated to be upside down",
    mediaType: "image",
    citationUrl: "https://restofworld.org/2024/elections-ai-tracker/#/manipulated-mexico-flag",
    groundTruth: "fake",
  },
  {
    id: "lWhG0sWV537fcJL_orhbq41Y-OM.jpg",
    title: "U.S. President Joe Biden with a WWII veteran",
    description: "President Biden talking with a WWII veteran",
    mediaType: "image",
    citationUrl: "https://x.com/POTUS/status/1793390126086619204",
    groundTruth: "authentic",
  },
  {
    id: "R6VB3R9Lg13QIQqgpomXeIIEigU.jpg",
    title: "Former German Chancellor Angela Merkel",
    description: "Angela Merkel playing a video game",
    mediaType: "image",
    citationUrl:
      "https://www.politico.eu/article/spot-deepfake-artificial-intelligence-tools-undermine-eyes-ears/",
    groundTruth: "fake",
  },
  {
    id: "M9WWnSoqjxceRPNK9M6b-u9HT00.mp4",
    title: "Former U.S. President Donald Trump at Manhattan Criminal Courthouse",
    description: "Donald Trump speaking at the courthouse ahead of his conviction",
    mediaType: "video",
    groundTruth: "unlabeled",
  },
  {
    id: "XhKj2vIaqkMg8hn91JqTCiFN6VA.mp4",
    title: "Former U.K. Prime Minister Boris Johnson visits Kyiv",
    description: "Boris Johnson meeting with Ukraine President Volodymyr Zelensky in Kyiv",
    mediaType: "video",
    citationUrl:
      "https://www.cnn.com/videos/world/2022/04/10/boris-johnson-kyiv-ukraine-volodymyr-zelensky-ndwknd-vpx.cnn",
    groundTruth: "authentic",
  },
  {
    id: "lCC0X6TanDIghg8OHSPLOt0Uafk.mp4",
    title: "Russian President Vladimir Putin",
    description: "Russian President Putin discussing negotiations for peace with Ukraine",
    mediaType: "video",
    groundTruth: "unlabeled",
  },
  {
    id: "amGVbtble0pMsgvHKETZ3ZPES4s.mp4",
    title: "Actor Mark Hamill press briefing",
    description: "Mark Hamill giving a White House press briefing",
    mediaType: "video",
    citationUrl: "https://www.youtube.com/watch?v=QvlV8G-NxDk",
    groundTruth: "unlabeled",
  },
  {
    id: "PWfMimqFyAVS3lMocRqWBQYpPC8.mp4",
    title: "Kim Jong Un, supreme leader of North Korea",
    description: "Kim Jong Un explaining why democracy is at risk",
    mediaType: "video",
    citationUrl: "https://act.represent.us/sign/deepfake-release",
    groundTruth: "fake",
  },
  {
    id: "6jESKtyja_DQQHSHIM9ir-FPrxg.wav",
    title: "U.S. President Joe Biden calling voters",
    description: "A robocall telling New Hampshire Democrats not to vote in the primary",
    mediaType: "audio",
    citationUrl:
      "https://apnews.com/article/ai-robocall-biden-new-hampshire-primary-2024-f94aa2d7f835ccc3cc254a90cd481a99",
    groundTruth: "fake",
  },
  {
    id: "WrSkrmuau5CI7mS_311lQu9ecPM.mp3",
    title: "London Mayor Sadiq Kahn cancelling Armistice Day celebrations",
    description:
      "Mayor Sadiq Kahn cancelling Armistice Day celebrations to make way for a pro-Palestinian march",
    mediaType: "audio",
    citationUrl:
      "https://www.standard.co.uk/news/london/sadiq-khan-ai-misinformation-armistice-day-deepfake-b1139021.html",
    groundTruth: "fake",
  },
];

// Cover image for each case.
//  • image + video: the REAL thumbnail frame, downloaded from the
//    production bucket (truemedia-thumbnails.s3.us-east-2.amazonaws.com,
//    keyed by media id with the extension stripped).
//  • audio: a waveform graphic, since audio has no visual frame.
export function caseThumbnail(c: RealCase): string {
  if (c.mediaType === "audio") return "/waveform.jpeg";
  const baseId = c.id.replace(/\.[^.]+$/, "");
  return `/real/cases/${baseId}.jpg`;
}

/** True when the cover image is the audio waveform graphic. */
export function isWaveform(c: RealCase): boolean {
  return c.mediaType === "audio";
}

// Real case frames grouped by media type — reused as sample thumbnails in
// history/analysis views so every media slot shows a real image.
const IMAGE_CASE_IDS = [
  "pf8gnScszm1EmkrCb1EuIVX_tLg", // Gálvez
  "lWhG0sWV537fcJL_orhbq41Y-OM", // Biden + veteran
  "R6VB3R9Lg13QIQqgpomXeIIEigU", // Merkel
];
const VIDEO_CASE_IDS = [
  "M9WWnSoqjxceRPNK9M6b-u9HT00", // Trump courthouse
  "XhKj2vIaqkMg8hn91JqTCiFN6VA", // Boris in Kyiv
  "lCC0X6TanDIghg8OHSPLOt0Uafk", // Putin
  "amGVbtble0pMsgvHKETZ3ZPES4s", // Mark Hamill
  "PWfMimqFyAVS3lMocRqWBQYpPC8", // Kim Jong Un
];

/** A real, type-appropriate thumbnail for any sample media (history rows,
 *  analysis hero). Audio returns the waveform graphic. */
export function sampleThumbnail(type: "image" | "video" | "audio", seed = 0): string {
  if (type === "audio") return "/waveform.jpeg";
  const pool = type === "video" ? VIDEO_CASE_IDS : IMAGE_CASE_IDS;
  return `/real/cases/${pool[Math.abs(seed) % pool.length]}.jpg`;
}

// ── Score thresholds ─────────────────────────────────────────────────
// Source: apps/detect/app/generators.ts

export const REAL_MIN_SCORE = 0.2; // below this, no model prediction is generated
export const REAL_MIN_DISPLAY_SCORE = 0.5; // below this, not displayed in UI
