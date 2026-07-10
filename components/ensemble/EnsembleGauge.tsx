import { VerdictBadge } from "./VerdictBadge";
import {
  VERDICT_STYLES,
  ensembleConfidence,
  verdictFromConfidence,
  type DetectorResult,
  type Verdict,
} from "./verdict";

export type CategoryRow = {
  id: string;
  name: string;
  detectorCount: number;
  verdict: Verdict;
};

type Props = {
  detectors: DetectorResult[];
  /** Individual detector list between the verdict sentence and the gauge. Default true. */
  showBreakdown?: boolean;
  /** When set, replaces the verdict sentence with TrueMedia's "Waiting for…" copy. */
  loadingPhase?: "download" | "analyses" | null;
};

// ─────────────────────────────────────────────────────────────────────
// Gauge geometry
// ─────────────────────────────────────────────────────────────────────

const CX = 100;
const CY = 100;
const R = 80;
const NEEDLE_LEN = 70;

function angleForValue(v: number) {
  return Math.PI * (1 - Math.max(0, Math.min(100, v)) / 100);
}
function needleRotation(value: number) {
  return (Math.max(0, Math.min(100, value)) - 50) * 1.8;
}

function GaugeSvg({ value }: { value: number }) {
  const rotation = needleRotation(value);

  const ticks = [25, 50, 75].map((v) => {
    const a = angleForValue(v);
    const innerR = R - 16;
    const outerR = R - 4;
    return {
      v,
      x1: CX + innerR * Math.cos(a),
      y1: CY - innerR * Math.sin(a),
      x2: CX + outerR * Math.cos(a),
      y2: CY - outerR * Math.sin(a),
    };
  });

  return (
    <svg
      viewBox="0 0 200 120"
      className="w-full max-w-[140px] mx-auto block"
      role="img"
      aria-label={`Manipulation probability gauge at ${value}%`}
    >
      <defs>
        <linearGradient
          id="gauge-arc"
          gradientUnits="userSpaceOnUse"
          x1={CX - R}
          x2={CX + R}
        >
          <stop offset="0%" stopColor="#64A70B" />
          <stop offset="22%" stopColor="#94C063" />
          <stop offset="35%" stopColor="#ADAEB0" />
          <stop offset="58%" stopColor="#EFCB5F" />
          <stop offset="78%" stopColor="#D50032" />
          <stop offset="100%" stopColor="#862633" />
        </linearGradient>
        <linearGradient id="needle-gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#EDEEEE" />
          <stop offset="100%" stopColor="#8E9093" />
        </linearGradient>
        <radialGradient id="pivot-gradient">
          <stop offset="0%" stopColor="#ADAEB0" />
          <stop offset="55%" stopColor="#63666A" />
          <stop offset="100%" stopColor="#021124" />
        </radialGradient>
      </defs>

      <path
        d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
        stroke="#021124"
        strokeWidth="22"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
        stroke="url(#gauge-arc)"
        strokeWidth="20"
        fill="none"
        strokeLinecap="round"
      />

      {ticks.map((t) => (
        <line
          key={t.v}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ))}

      <text
        x={CX - R}
        y={CY + 15}
        fontSize="9"
        fontFamily="ui-monospace, monospace"
        fill="#8E9093"
        textAnchor="middle"
      >
        0
      </text>
      <text
        x={CX + R}
        y={CY + 15}
        fontSize="9"
        fontFamily="ui-monospace, monospace"
        fill="#8E9093"
        textAnchor="middle"
      >
        100
      </text>

      <g
        transform={`rotate(${rotation} ${CX} ${CY})`}
        style={{ transition: "transform 600ms ease-out" }}
      >
        <polygon
          points={`${CX},${CY - NEEDLE_LEN} ${CX + 3},${CY - 6} ${CX - 3},${CY - 6}`}
          fill="url(#needle-gradient)"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth="0.5"
        />
      </g>

      <circle cx={CX} cy={CY} r="10" fill="url(#pivot-gradient)" />
      <circle cx={CX} cy={CY} r="4" fill="#041E42" />
      <circle cx={CX} cy={CY} r="1.6" fill="#ADAEB0" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Verbal confidence ladder — adapted from the Georgetown label-design
// exploration (labels.myassin.georgetown.domains, Ideas 2 & 5): a
// calibrated verbal scale for the score, plus an honest uncertainty band
// showing the actual min–max spread of the individual detector scores.
// Band boundaries align with the verdict tiers in verdict.ts so the two
// verbal scales can never contradict each other.
// ─────────────────────────────────────────────────────────────────────

const LADDER_BANDS = [
  { from: 0, to: 25, label: "Unlikely" },
  { from: 25, to: 50, label: "Possible" },
  { from: 50, to: 75, label: "Likely" },
  { from: 75, to: 90, label: "Very likely" },
  { from: 90, to: 100, label: "Virtually certain" },
];

function ConfidenceLadder({
  value,
  detectors,
  accent,
}: {
  value: number;
  detectors: DetectorResult[];
  accent: string;
}) {
  const active = detectors.filter((d) => d.verdict !== "pending");
  if (active.length === 0) return null;

  const lo = Math.min(...active.map((d) => d.confidence));
  const hi = Math.max(...active.map((d) => d.confidence));
  const band =
    LADDER_BANDS.find((b) => value < b.to) ?? LADDER_BANDS[LADDER_BANDS.length - 1];

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-wider text-slate-400">
          Verbal confidence
        </span>
        <span className={`text-xs font-semibold ${accent}`}>{band.label}</span>
      </div>

      {/* One clear scale: manipulation probability from 0 → 100. The severity
          gradient is bright up to the ensemble score and dimmed beyond it. */}
      <div className="relative h-2.5 rounded-full overflow-hidden ring-1 ring-white/10">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg,#64A70B,#94C063 22%,#F8E08E 45%,#EFCB5F 60%,#D50032 82%,#862633)",
          }}
        />
        {/* Dim everything past the ensemble score */}
        <div className="absolute inset-y-0 right-0 bg-[#041E42]/75" style={{ left: `${value}%` }} />
        {/* Ensemble marker */}
        <div className="absolute inset-y-0 w-0.5 bg-white" style={{ left: `calc(${value}% - 1px)` }} />
      </div>
      <div className="flex justify-between mt-1 text-[9px] text-slate-500">
        <span>0 · no manipulation</span>
        <span>100 · highly manipulated</span>
      </div>

      {/* Note line — states plainly what the bar is derived from */}
      <div className="mt-1.5 text-[10px] leading-snug text-slate-400">
        Ensemble score{" "}
        <span className="font-mono text-slate-200 tabular-nums">{value}</span>; the{" "}
        {active.length} detectors ranged{" "}
        <span className="font-mono text-slate-200 tabular-nums">{lo}–{hi}</span>.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────

export function EnsembleGauge({
  detectors,
  showBreakdown = true,
  loadingPhase = null,
}: Props) {
  const { confidence, verdict, activeCount } = ensembleConfidence(detectors);
  const totalCount = detectors.length;
  const s = VERDICT_STYLES[verdict];
  const isLoading = loadingPhase !== null;

  return (
    <div className="relative bg-[#041E42] dark:bg-slate-900 text-white rounded-lg p-5 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(0,181,226,0.06), transparent 60%)",
        }}
        aria-hidden
      />

      <div className="relative">
        {/* Verdict sentence — or loading banner — centered */}
        <div className="text-center mb-3 px-2">
          {isLoading ? (
            <div className="text-sm leading-tight flex items-center justify-center gap-2 text-slate-200">
              <span
                className="inline-block w-3.5 h-3.5 rounded-full border-2 border-slate-400 border-t-transparent"
                style={{ animation: "tm-spin 0.9s linear infinite" }}
                aria-hidden
              />
              <span>
                Waiting for{" "}
                {loadingPhase === "download"
                  ? "media download"
                  : "pending analyses"}{" "}
                to complete…
              </span>
              <style>{`@keyframes tm-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <div className="text-sm leading-tight">
              <span className="text-slate-300">TrueMedia.org verdict: </span>
              <span className={`font-semibold ${s.onDark}`}>{s.label.toLowerCase()}</span>
              <span className="text-slate-300"> of manipulation</span>
            </div>
          )}
        </div>

        {/* Combined score — compact gauge with the verbal scale beside it,
            sitting directly under the verdict line */}
        <div className="border-t border-slate-700 pt-4 flex items-center gap-5">
          <div className="shrink-0 w-[120px]">
            <GaugeSvg value={confidence} />
            <div className="flex flex-col items-center mt-0.5">
              <div className={`text-xl font-semibold tracking-tight ${s.onDark} leading-none`}>
                {confidence}%
              </div>
              <div className="text-[9px] uppercase tracking-[0.1em] text-slate-400 mt-1 text-center leading-tight">
                Manipulation probability
              </div>
            </div>
          </div>

          {/* Calibrated verbal scale + detector-spread band (hidden while loading) */}
          {!isLoading && (
            <div className="flex-1 min-w-0">
              <ConfidenceLadder value={confidence} detectors={detectors} accent={s.onDark} />
            </div>
          )}
        </div>

        {/* Detectors — condensed single-line rows under the gauge. The
            per-detector percentage is intentionally hidden; only the overall
            manipulation probability (above) carries a number. */}
        {showBreakdown && (
          <div className="mt-5 border-t border-slate-700 pt-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
              Detectors
            </div>
            <ul className="divide-y divide-slate-800">
              {detectors.map((d, i) => {
                const dv = d.verdict ?? verdictFromConfidence(d.confidence);
                return (
                  <li
                    key={`${i}-${d.name}`}
                    className="flex items-center justify-between gap-3 py-1.5"
                  >
                    <span className="text-[13px] text-slate-200 truncate">{d.name}</span>
                    <span className="shrink-0">
                      <VerdictBadge verdict={dv} size="sm" />
                    </span>
                  </li>
                );
              })}
            </ul>
            {/* Completion count sits at the foot of the Detectors list */}
            <div className="mt-2.5 pt-2.5 border-t border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                {activeCount}/{totalCount} complete
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
