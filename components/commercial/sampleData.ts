import type { DetectorResult, Verdict } from "@/components/ensemble";

export type CommercialDetector = DetectorResult & {
  category: string;
  runtime: string;
  methodology: string;
  citation?: string;
};

export const commercialSampleCase = {
  fileName: "Screenshot 2026-05-17 at 4.00.15 PM.png",
  fileType: "PNG",
  fileSize: "714 KB",
  processingTime: "4m 8s",
  analyzedOn: "Tue, Jun 23, 2026",
  ensembleVersion: "v2.3.1",
  ensembleCalibrated: "Mar 2026",
  priorSimilarCases: 12,
};

export const commercialDetectors: CommercialDetector[] = [
  {
    name: "General-Purpose Image Detector",
    category: "Generative AI",
    confidence: 86,
    weight: 0.25,
    runtime: "23s",
    methodology:
      "Detects AI-generated images using orthogonal subspaces to separate natural image features from manipulation patterns. Trained on 4.2M labeled image pairs collected from public diffusion-model outputs and camera-original archives.",
    citation: "Brossen et al. 2024",
  },
  {
    name: "Diffusion Fingerprint",
    category: "Generative AI",
    confidence: 79,
    weight: 0.2,
    runtime: "31s",
    methodology:
      "Identifies spectral fingerprints left by diffusion model samplers in the frequency domain. Robust to common post-processing (JPEG, resize, mild crop).",
    citation: "Chen & Park 2025",
  },
  {
    name: "Frequency-Domain Image Detector",
    category: "Visual Noise",
    confidence: 80,
    weight: 0.15,
    runtime: "18s",
    methodology:
      "Identifies visual noise patterns left behind by a frequency-based diffusion model while it generates an image. Operates on FFT-transformed image patches.",
  },
  {
    name: "Compression Artifact",
    category: "Visual Noise",
    confidence: 71,
    weight: 0.1,
    runtime: "12s",
    methodology:
      "Looks at JPEG compression patterns that diverge from camera-original encodings. Effective on re-encoded synthetic images, less so on losslessly stored content.",
  },
  {
    name: "Boundary Inconsistency",
    category: "Face Consistency",
    confidence: 64,
    weight: 0.15,
    runtime: "47s",
    methodology:
      "Compares facial features across detected regions to surface boundary inconsistencies introduced by face-swap and inpainting pipelines.",
    citation: "Almeida 2023",
  },
  {
    name: "Provenance Check",
    category: "Provenance",
    confidence: 35,
    weight: 0.15,
    runtime: "2s",
    methodology:
      "Checks for cryptographic Content Credentials (C2PA) embedded in media metadata. A missing credential does not prove manipulation — it indicates the chain of custody cannot be verified.",
  },
];

export type PriorCase = {
  name: string;
  verdict: Verdict;
  date: string;
};

export const priorCases: PriorCase[] = [
  { name: "Trump_at_NATO_summit.png", verdict: "substantial-evidence", date: "2 days ago" },
  { name: "Senator_K_speech_clip.mp4", verdict: "some-evidence", date: "5 days ago" },
  { name: "Press_pool_photo_1.jpg", verdict: "little-evidence", date: "1 week ago" },
  { name: "Whistleblower_video.mp4", verdict: "substantial-evidence", date: "2 weeks ago" },
  { name: "Cabinet_briefing.png", verdict: "uncertain", date: "3 weeks ago" },
];

// ─────────────────────────────────────────────────────────────────────
// History — full list of past analyses for the History page table.
// ─────────────────────────────────────────────────────────────────────

export type MediaType = "image" | "video" | "audio";
export type Source = "X" | "Reddit" | "Truth Social" | "Facebook" | "Instagram" | "Upload" | "Google Drive";

export type HistoryItem = {
  id: string;
  name: string;
  type: MediaType;
  verdict: Verdict;
  confidence: number;
  source: Source;
  detectorCount: number;
  analyzedAt: string; // human-readable
  analyzedAtRaw: number; // unix ms — for real sorting
};

const now = Date.UTC(2026, 5, 23, 12, 0, 0); // 2026-06-23 12:00 UTC

export const historyItems: HistoryItem[] = [
  { id: "h-001", name: "Screenshot_2026-05-17_at_4.00.15_PM.png", type: "image", verdict: "substantial-evidence", confidence: 78, source: "Upload", detectorCount: 5, analyzedAt: "moments ago", analyzedAtRaw: now - 5 * 60_000 },
  { id: "h-002", name: "Trump_at_NATO_summit.png", type: "image", verdict: "substantial-evidence", confidence: 91, source: "Truth Social", detectorCount: 4, analyzedAt: "2 days ago", analyzedAtRaw: now - 2 * 86_400_000 },
  { id: "h-003", name: "Press_briefing_clip.mp4", type: "video", verdict: "little-evidence", confidence: 8, source: "X", detectorCount: 6, analyzedAt: "3 days ago", analyzedAtRaw: now - 3 * 86_400_000 },
  { id: "h-004", name: "Whistleblower_video.mp4", type: "video", verdict: "substantial-evidence", confidence: 88, source: "Reddit", detectorCount: 6, analyzedAt: "4 days ago", analyzedAtRaw: now - 4 * 86_400_000 },
  { id: "h-005", name: "Senator_K_speech_clip.mp4", type: "video", verdict: "some-evidence", confidence: 62, source: "X", detectorCount: 5, analyzedAt: "5 days ago", analyzedAtRaw: now - 5 * 86_400_000 },
  { id: "h-006", name: "ai_gen_image_5_720.jpg", type: "image", verdict: "little-evidence", confidence: 15, source: "Upload", detectorCount: 5, analyzedAt: "5 days ago", analyzedAtRaw: now - 5 * 86_400_000 - 3 * 3600_000 },
  { id: "h-007", name: "Pentagon_explosion.jpg", type: "image", verdict: "substantial-evidence", confidence: 96, source: "X", detectorCount: 5, analyzedAt: "6 days ago", analyzedAtRaw: now - 6 * 86_400_000 },
  { id: "h-008", name: "Press_pool_photo_1.jpg", type: "image", verdict: "little-evidence", confidence: 12, source: "X", detectorCount: 4, analyzedAt: "1 week ago", analyzedAtRaw: now - 7 * 86_400_000 },
  { id: "h-009", name: "Robocall_audio_sample.mp3", type: "audio", verdict: "uncertain", confidence: 41, source: "Upload", detectorCount: 3, analyzedAt: "1 week ago", analyzedAtRaw: now - 8 * 86_400_000 },
  { id: "h-010", name: "Hollywood_sign_fire.jpg", type: "image", verdict: "substantial-evidence", confidence: 85, source: "X", detectorCount: 5, analyzedAt: "2 weeks ago", analyzedAtRaw: now - 14 * 86_400_000 },
  { id: "h-011", name: "Immigration_arrest.jpg", type: "image", verdict: "substantial-evidence", confidence: 81, source: "Truth Social", detectorCount: 4, analyzedAt: "2 weeks ago", analyzedAtRaw: now - 15 * 86_400_000 },
  { id: "h-012", name: "Cabinet_briefing.png", type: "image", verdict: "uncertain", confidence: 47, source: "X", detectorCount: 5, analyzedAt: "3 weeks ago", analyzedAtRaw: now - 21 * 86_400_000 },
  { id: "h-013", name: "Office_job_voiceover.mp3", type: "audio", verdict: "substantial-evidence", confidence: 89, source: "Instagram", detectorCount: 3, analyzedAt: "3 weeks ago", analyzedAtRaw: now - 22 * 86_400_000 },
  { id: "h-014", name: "City_council_clip.mp4", type: "video", verdict: "little-evidence", confidence: 11, source: "Facebook", detectorCount: 6, analyzedAt: "1 month ago", analyzedAtRaw: now - 30 * 86_400_000 },
  { id: "h-015", name: "Trump_hugging_jesus.jpg", type: "image", verdict: "substantial-evidence", confidence: 94, source: "Truth Social", detectorCount: 5, analyzedAt: "1 month ago", analyzedAtRaw: now - 32 * 86_400_000 },
];

// ─────────────────────────────────────────────────────────────────────
// Notable cases — curated examples shown on /notable.
// ─────────────────────────────────────────────────────────────────────

export type ManipulationType =
  | "Diffusion image generation"
  | "Face-swap (video)"
  | "Voice clone"
  | "Composite (image+audio)"
  | "Photo manipulation";

export type KeySignal = {
  detector: string;
  confidence: number;
};

export type NotableCase = {
  id: string;
  caseId: string; // TM-NC-001 etc — academic citation format
  name: string;
  type: MediaType;
  verdict: Verdict;
  source: Source;
  appearedIn: "Instagram" | "X" | "Truth Social" | "Facebook" | "TikTok" | "Reddit";
  blurb: string;
  documented: string; // e.g. "Mar 2026"
  manipulationType: ManipulationType;
  keySignals: KeySignal[];
  citationsCount: number;
  featured?: boolean;
};

// ─────────────────────────────────────────────────────────────────────
// Text-claim history for the False Content tab + /claim/veracity history.
// ─────────────────────────────────────────────────────────────────────

export type ClaimVerdict = "likely-true" | "likely-false" | "unresolved" | "mixed";

export type ClaimHistoryItem = {
  id: string;
  text: string;
  verdict: ClaimVerdict;
  analyzedAt: string;
  analyzedAtRaw: number;
};

export const claimHistory: ClaimHistoryItem[] = [
  {
    id: "c-001",
    text: "Hurricane Helene was caused by government weather manipulation.",
    verdict: "likely-false",
    analyzedAt: "2 days ago",
    analyzedAtRaw: now - 2 * 86_400_000,
  },
  {
    id: "c-002",
    text: "The 2024 Olympic opening ceremony depicted the Last Supper.",
    verdict: "likely-false",
    analyzedAt: "1 week ago",
    analyzedAtRaw: now - 7 * 86_400_000,
  },
  {
    id: "c-003",
    text: "The US national debt exceeded $34 trillion in 2024.",
    verdict: "likely-true",
    analyzedAt: "1 week ago",
    analyzedAtRaw: now - 8 * 86_400_000,
  },
  {
    id: "c-004",
    text: "A senator claimed in a recent speech that crime rates are at record highs nationwide.",
    verdict: "mixed",
    analyzedAt: "2 weeks ago",
    analyzedAtRaw: now - 14 * 86_400_000,
  },
];

export const notableCases: NotableCase[] = [
  {
    id: "n-001",
    caseId: "TM-NC-001",
    name: "Trump Hugging Jesus",
    type: "image",
    verdict: "substantial-evidence",
    source: "Truth Social",
    appearedIn: "Instagram",
    blurb: "President Donald Trump shared an AI-generated image of Jesus hugging him on Truth Social, alongside a caption about God.",
    documented: "Mar 2026",
    manipulationType: "Diffusion image generation",
    keySignals: [
      { detector: "Diffusion Fingerprint", confidence: 94 },
      { detector: "General-Purpose Image Detector", confidence: 89 },
      { detector: "Frequency-Domain Detector", confidence: 81 },
    ],
    citationsCount: 47,
    featured: true,
  },
  {
    id: "n-002",
    caseId: "TM-NC-002",
    name: "Explosion at the US Pentagon",
    type: "image",
    verdict: "substantial-evidence",
    source: "X",
    appearedIn: "X",
    blurb:
      "AI-generated image of an explosion at the US Pentagon circulated widely on X in May 2026 and briefly moved equity markets before being debunked.",
    documented: "May 2026",
    manipulationType: "Diffusion image generation",
    keySignals: [
      { detector: "General-Purpose Image Detector", confidence: 96 },
      { detector: "Compression Artifact", confidence: 88 },
    ],
    citationsCount: 312,
  },
  {
    id: "n-003",
    caseId: "TM-NC-003",
    name: "Immigration Arrest",
    type: "image",
    verdict: "substantial-evidence",
    source: "Truth Social",
    appearedIn: "X",
    blurb:
      "AI-generated still depicting an immigration arrest scene that did not occur. Reshared with implied authentic provenance.",
    documented: "Jan 2026",
    manipulationType: "Diffusion image generation",
    keySignals: [
      { detector: "Diffusion Fingerprint", confidence: 92 },
      { detector: "Boundary Inconsistency", confidence: 76 },
    ],
    citationsCount: 28,
  },
  {
    id: "n-004",
    caseId: "TM-NC-004",
    name: "Office Job Expectations",
    type: "audio",
    verdict: "substantial-evidence",
    source: "Instagram",
    appearedIn: "Instagram",
    blurb:
      "AI-generated audio-and-video clip with a tongue-in-cheek remark about earning a high salary for simple tasks. Voice and lip sync both synthetic.",
    documented: "Feb 2026",
    manipulationType: "Composite (image+audio)",
    keySignals: [
      { detector: "Voice Authenticity", confidence: 91 },
      { detector: "Lip-Sync Consistency", confidence: 84 },
    ],
    citationsCount: 14,
  },
  {
    id: "n-005",
    caseId: "TM-NC-005",
    name: "Hollywood Sign on Fire",
    type: "image",
    verdict: "substantial-evidence",
    source: "X",
    appearedIn: "X",
    blurb:
      "Image depicts the Hollywood Sign engulfed in flames during the January 2025 LA wildfires; the scene is fabricated and the sign was unharmed.",
    documented: "Jan 2026",
    manipulationType: "Diffusion image generation",
    keySignals: [
      { detector: "General-Purpose Image Detector", confidence: 85 },
      { detector: "Frequency-Domain Detector", confidence: 79 },
    ],
    citationsCount: 56,
  },
  {
    id: "n-006",
    caseId: "TM-NC-006",
    name: "Senator Robocall",
    type: "audio",
    verdict: "some-evidence",
    source: "Upload",
    appearedIn: "Facebook",
    blurb:
      "AI-cloned senator voice used in a robocall during a state primary. Two of three voice detectors flagged synthetic; one returned inconclusive.",
    documented: "Apr 2026",
    manipulationType: "Voice clone",
    keySignals: [
      { detector: "Voice Authenticity", confidence: 71 },
      { detector: "Prosody Anomaly", confidence: 64 },
    ],
    citationsCount: 8,
  },
];
