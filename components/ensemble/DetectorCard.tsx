import type { ReactNode } from "react";
import { ConfidenceBar } from "./ConfidenceBar";
import { VerdictBadge } from "./VerdictBadge";
import { VERDICT_STYLES, verdictFromConfidence, type Verdict } from "./verdict";

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
};

export function DetectorCard({ name, description, confidence, verdict, weight, icon }: Props) {
  const v = verdict ?? verdictFromConfidence(confidence);
  const s = VERDICT_STYLES[v];

  return (
    <article className="bg-[#041E42] dark:bg-slate-900 text-white rounded-lg overflow-hidden ring-1 ring-transparent dark:ring-slate-800 hover:dark:ring-[#00B5E2]/30 transition">
      {/* Edge-to-edge confidence strip — color encodes the verdict tier */}
      <ConfidenceBar value={confidence} height={4} background="bg-[#0A2348] dark:bg-slate-800" />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3.5 gap-3">
          <VerdictBadge verdict={v} />
          <div className="text-right shrink-0">
            <div className={`text-lg font-semibold leading-tight ${s.pillText}`}>{confidence}%</div>
            <div className="text-[10px] uppercase tracking-wide text-slate-400 leading-tight">
              Likely AI
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 font-bold text-base mb-3">
          {icon}
          {name}
        </div>

        {description && (
          <div className="bg-gray-700 dark:bg-slate-800 rounded-md p-3 text-sm leading-relaxed text-gray-200">
            {description}
          </div>
        )}

        {weight !== undefined && (
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span className="uppercase tracking-wide">Ensemble weight</span>
            <span className="text-slate-200 font-mono">{Math.round(weight * 100)}%</span>
          </div>
        )}
      </div>
    </article>
  );
}
