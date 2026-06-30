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
  bar: string;
  frame: string;
  Icon: ComponentType<{ className?: string }>;
};

export const VERDICT_STYLES: Record<Verdict, VerdictStyle> = {
  "substantial-evidence": {
    label: "Substantial Evidence",
    pillBg: "bg-[#771D1D]",
    pillText: "text-[#F8B4B5]",
    bar: "bg-[#DC2626]",
    frame: "bg-[#DC2626]",
    Icon: HiOutlineXCircle,
  },
  "some-evidence": {
    label: "Some Evidence",
    pillBg: "bg-[#78350F]",
    pillText: "text-[#FCD34D]",
    bar: "bg-[#F59E0B]",
    frame: "bg-[#F59E0B]",
    Icon: HiOutlineExclamationCircle,
  },
  "little-evidence": {
    label: "Little Evidence",
    pillBg: "bg-[#14532D]",
    pillText: "text-[#86EFAC]",
    bar: "bg-[#84CC16]",
    frame: "bg-[#84CC16]",
    Icon: HiOutlineCheckCircle,
  },
  uncertain: {
    label: "Uncertain",
    pillBg: "bg-slate-700",
    pillText: "text-slate-300",
    bar: "bg-slate-500",
    frame: "bg-slate-600",
    Icon: HiOutlineQuestionMarkCircle,
  },
  pending: {
    label: "Pending",
    pillBg: "bg-slate-600",
    pillText: "text-slate-300",
    bar: "bg-slate-600",
    frame: "bg-slate-600",
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
