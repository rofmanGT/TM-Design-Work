import { ConfidenceBar } from "./ConfidenceBar";
import { VerdictBadge } from "./VerdictBadge";
import {
  VERDICT_STYLES,
  ensembleConfidence,
  verdictFromConfidence,
  type DetectorResult,
} from "./verdict";

type Props = {
  detectors: DetectorResult[];
  /** Show the per-detector breakdown list below the bar. Default true. Set false when
      the consumer is already showing per-detector rows elsewhere. */
  showBreakdown?: boolean;
};

/**
 * EnsembleVerdict — the headline result card.
 *
 * Lead with the fraction (N of M detectors agree) — that's the trust signal,
 * borrowed from VirusTotal's "0 / 91" pattern. The combined manipulation
 * probability is supporting detail under the bar, not the headline.
 */
export function EnsembleVerdict({ detectors, showBreakdown = true }: Props) {
  const { confidence, verdict, agreeingCount, activeCount } = ensembleConfidence(detectors);
  const totalCount = detectors.length;
  const s = VERDICT_STYLES[verdict];

  return (
    <div className="bg-[#041E42] text-white rounded-lg p-5">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-4">
        <div className="text-[11px] uppercase tracking-wider text-slate-400">
          TrueMedia.org verdict
        </div>
        <div className="text-[11px] text-slate-400">
          {activeCount} of {totalCount} detectors complete
        </div>
      </div>

      {/* Headline: N of M is the trust signal */}
      <div className="flex items-end gap-4 mb-3">
        <div className="leading-none">
          <span className={`text-6xl font-semibold tracking-tight ${s.pillText}`}>
            {agreeingCount}
          </span>
          <span className="text-3xl text-slate-400 font-normal">/{activeCount}</span>
        </div>
        <div className="text-sm text-slate-300 leading-tight pb-1">
          detectors found
          <br />
          <span className="text-white font-semibold">{s.label.toLowerCase()}</span>
        </div>
      </div>

      <VerdictBadge verdict={verdict} />

      {/* Aggregate confidence bar with caption */}
      <div className="mt-5">
        <ConfidenceBar value={confidence} height={6} background="bg-slate-800" />
        <div className="text-[10px] uppercase tracking-wide text-slate-400 mt-1.5">
          Combined: {confidence}% manipulation probability
        </div>
      </div>

      {/* Per-detector breakdown */}
      {showBreakdown && (
        <div className="mt-4 border-t border-slate-700 pt-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-3">
            Per-detector breakdown
          </div>
          <ul className="space-y-3">
            {detectors.map((d) => {
              const dv = d.verdict ?? verdictFromConfidence(d.confidence);
              return (
                <li key={d.name}>
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <span className="text-sm truncate">{d.name}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <VerdictBadge verdict={dv} size="sm" />
                      <span className="font-mono text-slate-200 text-sm w-10 text-right">
                        {dv === "pending" ? "—" : `${d.confidence}%`}
                      </span>
                    </div>
                  </div>
                  <ConfidenceBar value={d.confidence} height={3} background="bg-slate-800" />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
