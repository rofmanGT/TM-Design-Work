import type { ReactNode } from "react";
import { ConfidenceBar } from "./ConfidenceBar";
import { VerdictBadge } from "./VerdictBadge";
import { verdictFromConfidence, type Verdict } from "./verdict";

type Props = {
  name: string;
  /** Optional. Only rendered if a non-empty string. We intentionally avoid
      fabricated descriptions — populate this from the real detector's docs. */
  description?: string;
  /** 0–100, manipulation probability. */
  confidence: number;
  /** Optional explicit verdict; otherwise derived from confidence. */
  verdict?: Verdict;
  /** Optional ensemble weight (0–1). When provided, shown as a small footer label. */
  weight?: number;
  /** Optional leading icon next to the detector name. */
  icon?: ReactNode;
  /** Optional model-backbone tag (e.g. "wav2vec2") shown as a small mono chip. */
  tag?: string;
};

export function DetectorCard({ name, description, confidence, verdict, weight, icon, tag }: Props) {
  const v = verdict ?? verdictFromConfidence(confidence);

  return (
    <article className="bg-[#041E42] dark:bg-slate-900 text-white rounded-lg overflow-hidden ring-1 ring-black/5 dark:ring-slate-800 hover:ring-[#00B5E2]/40 dark:hover:ring-[#00B5E2]/30 transition">
      {/* Edge-to-edge confidence strip — color encodes the verdict tier */}
      <ConfidenceBar value={confidence} height={3} background="bg-[#0A2348] dark:bg-slate-800" />

      <div className="p-4">
        {/* Verdict pill only — the per-detector percentage is intentionally
            hidden; the overall manipulation probability carries the number. */}
        <VerdictBadge verdict={v} size="sm" />

        <div className="mt-3 flex items-center gap-2 font-semibold text-[15px] leading-snug">
          <span className="text-slate-400 shrink-0 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
          <span className="min-w-0">{name}</span>
          {tag && (
            <span className="ml-auto shrink-0 font-mono font-normal text-[10px] text-slate-400 bg-slate-800 dark:bg-slate-800 rounded px-1.5 py-0.5">
              {tag}
            </span>
          )}
        </div>

        {/* Description as quiet body copy behind a hairline — no box-in-box */}
        {description && (
          <p className="mt-2.5 pt-2.5 border-t border-white/10 text-[13px] leading-relaxed text-slate-400">
            {description}
          </p>
        )}

        {weight !== undefined && (
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span className="uppercase tracking-wide">Ensemble weight</span>
            <span className="text-slate-200 font-mono tabular-nums">{Math.round(weight * 100)}%</span>
          </div>
        )}
      </div>
    </article>
  );
}
