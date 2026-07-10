import type { ComponentType } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineXCircle,
  HiOutlineQuestionMarkCircle,
  HiOutlineClock,
} from "react-icons/hi2";

// ─────────────────────────────────────────────────────────────────────
// Verdict tier system
//
// One source of truth for verdict labels, pill colors, and bar colors.
// Add a new tier here and every downstream component picks it up.
// ─────────────────────────────────────────────────────────────────────

export type Verdict =
  | "substantial-evidence"
  | "some-evidence"
  | "little-evidence"
  | "uncertain"
  | "pending";

export type VerdictStyle = {
  label: string;
  pillBg: string;
  pillText: string;
  /** Text color for the verdict when shown as text on the navy result card
      (#041E42). A LIGHT tint of the verdict hue — pillText can be dark (navy
      on a yellow/green pill), which is invisible on the navy card, so this
      must always clear WCAG-AA on navy. */
  onDark: string;
  bar: string;
  /** Media-frame background — the production "neon" manipulation palette. */
  frame: string;
  /** Text color for labels sitting on the neon frame (contrast-aware). */
  frameText: string;
  Icon: ComponentType<{ className?: string }>;
};

// Signal colours are drawn from the Georgetown tertiary palette so the
// verdict system stays on-brand: Green 369 #64A70B (little), Yellow 1205
// #F8E08E (some), Red 202/199 #862633 · #D50032 (substantial), Georgetown
// Gray #63666A (uncertain / pending). Text colours are navy (#041E42) or
// white, whichever clears WCAG-AA on the given hue.
export const VERDICT_STYLES: Record<Verdict, VerdictStyle> = {
  "substantial-evidence": {
    label: "Substantial Evidence",
    pillBg: "bg-[#862633]", // GU Red 202
    pillText: "text-white",
    onDark: "text-[#EC8D9F]", // light red — readable on navy
    bar: "bg-[#D50032]", // GU Light Red 199
    frame: "bg-[#D50032]",
    frameText: "text-white",
    Icon: HiOutlineXCircle,
  },
  "some-evidence": {
    label: "Some Evidence",
    pillBg: "bg-[#F8E08E]", // GU Yellow 1205
    pillText: "text-[#041E42]",
    onDark: "text-[#F8E08E]", // yellow — reads clearly on navy
    bar: "bg-[#F8E08E]",
    frame: "bg-[#F8E08E]",
    frameText: "text-[#041E42]",
    Icon: HiOutlineExclamationCircle,
  },
  "little-evidence": {
    label: "Little Evidence",
    pillBg: "bg-[#64A70B]", // GU Green 369
    pillText: "text-[#041E42]",
    onDark: "text-[#C2DBA4]", // light green — readable on navy
    bar: "bg-[#64A70B]",
    frame: "bg-[#64A70B]",
    frameText: "text-[#041E42]",
    Icon: HiOutlineCheckCircle,
  },
  uncertain: {
    label: "Uncertain",
    pillBg: "bg-[#63666A]", // Georgetown Gray
    pillText: "text-white",
    onDark: "text-[#CDCECF]", // light gray — readable on navy
    bar: "bg-[#63666A]",
    frame: "bg-[#63666A]",
    frameText: "text-white",
    Icon: HiOutlineQuestionMarkCircle,
  },
  pending: {
    label: "Pending",
    pillBg: "bg-[#8E9093]", // GU Gray 70% tint
    pillText: "text-white",
    onDark: "text-[#CDCECF]", // light gray — readable on navy
    bar: "bg-[#8E9093]",
    frame: "bg-[#8E9093]",
    frameText: "text-white",
    Icon: HiOutlineClock,
  },
};

// Tier breakpoints used everywhere a number needs to become a verdict.
// Swap these here when TrueMedia confirms their real cutoffs.
export function verdictFromConfidence(confidence: number): Verdict {
  if (confidence >= 75) return "substantial-evidence";
  if (confidence >= 50) return "some-evidence";
  if (confidence >= 25) return "uncertain";
  return "little-evidence";
}

// ─────────────────────────────────────────────────────────────────────
// Ensemble math
//
// Placeholder weighted average until TrueMedia confirms their real
// aggregation. The function is intentionally narrow so it's easy to
// swap for majority vote, Bayesian fusion, or a per-detector calibration.
// ─────────────────────────────────────────────────────────────────────

export type DetectorResult = {
  name: string;
  confidence: number; // 0-100, manipulation probability
  verdict?: Verdict; // optional override; otherwise derived from confidence
  weight?: number; // optional weight; defaults to 1
};

export type EnsembleResult = {
  confidence: number;
  verdict: Verdict;
  agreement: number; // 0-1, fraction of detectors that agree with the ensemble verdict
  agreeingCount: number;
  activeCount: number;
};

export function ensembleConfidence(detectors: DetectorResult[]): EnsembleResult {
  const active = detectors.filter((d) => d.verdict !== "pending");

  if (active.length === 0) {
    return { confidence: 0, verdict: "pending", agreement: 0, agreeingCount: 0, activeCount: 0 };
  }

  const totalWeight = active.reduce((s, d) => s + (d.weight ?? 1), 0);
  const weightedSum = active.reduce((s, d) => s + (d.weight ?? 1) * d.confidence, 0);
  const confidence = Math.round(weightedSum / totalWeight);
  const verdict = verdictFromConfidence(confidence);

  const agreeingCount = active.filter(
    (d) => (d.verdict ?? verdictFromConfidence(d.confidence)) === verdict
  ).length;
  const agreement = agreeingCount / active.length;

  return { confidence, verdict, agreement, agreeingCount, activeCount: active.length };
}
