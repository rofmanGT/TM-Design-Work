import { ConfidenceBar } from "./ConfidenceBar";
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
  /** Per-detector breakdown list under the gauge. Default true. */
  showBreakdown?: boolean;
  /** Optional category-level summary table rendered below the votes bar. */
  categoryRows?: CategoryRow[];
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
      className="w-full max-w-[240px] mx-auto block"
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
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="22%" stopColor="#84CC16" />
          <stop offset="35%" stopColor="#94A3B8" />
          <stop offset="58%" stopColor="#F59E0B" />
          <stop offset="78%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>
        <linearGradient id="needle-gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
        <radialGradient id="pivot-gradient">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="55%" stopColor="#334155" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>
      </defs>

      <path
        d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
        stroke="#0B1220"
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
        fill="#64748B"
        textAnchor="middle"
      >
        0
      </text>
      <text
        x={CX + R}
        y={CY + 15}
        fontSize="9"
        fontFamily="ui-monospace, monospace"
        fill="#64748B"
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
      <circle cx={CX} cy={CY} r="4" fill="#0F172A" />
      <circle cx={CX} cy={CY} r="1.6" fill="#94A3B8" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────

export function EnsembleGauge({
  detectors,
  showBreakdown = true,
  categoryRows,
  loadingPhase = null,
}: Props) {
  const { confidence, verdict, agreeingCount, activeCount } = ensembleConfidence(detectors);
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
        {/* Verdict sentence — or loading banner — centered, with completion count in corner */}
        <div className="relative text-center mb-3 px-12">
          <span className="absolute right-0 top-0 text-[10px] text-slate-400 font-mono">
            {activeCount}/{totalCount} complete
          </span>
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
              <span className={`font-semibold ${s.pillText}`}>{s.label.toLowerCase()}</span>
              <span className="text-slate-300"> of manipulation</span>
            </div>
          )}
        </div>

        <GaugeSvg value={confidence} />

        <div className="flex flex-col items-center mt-1">
          <div className={`text-4xl font-semibold tracking-tight ${s.pillText} leading-none`}>
            {confidence}%
          </div>
          <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400 mt-1.5">
            Manipulation probability
          </div>
        </div>

        {/* Votes bar with inline agreement count */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 shrink-0">
            Votes
          </span>
          <div className="flex-1 flex gap-1">
            {detectors.map((d, i) => {
              const dv = d.verdict ?? verdictFromConfidence(d.confidence);
              return (
                <span
                  key={i}
                  className={`flex-1 h-1.5 rounded-full ${VERDICT_STYLES[dv].bar}`}
                  title={`${d.name} — ${VERDICT_STYLES[dv].label}`}
                />
              );
            })}
          </div>
          <span className="text-[11px] text-slate-300 whitespace-nowrap font-mono shrink-0">
            {agreeingCount}/{activeCount} agree
          </span>
        </div>

        {/* Category-level summary table */}
        {categoryRows && categoryRows.length > 0 && (
          <div className="mt-4 border border-slate-700 rounded-md overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-3 py-1.5 bg-slate-800/60 text-[10px] uppercase tracking-wider text-slate-400">
              <span>Analysis</span>
              <span className="text-center w-16">Detectors</span>
              <span className="text-right">Results</span>
            </div>
            {categoryRows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[1fr_auto_auto] gap-3 px-3 py-1.5 border-t border-slate-700 items-center"
              >
                <span className="text-sm truncate">{row.name}</span>
                <span className="text-sm text-center font-mono w-16">
                  {row.detectorCount}
                </span>
                <span className="text-right">
                  <VerdictBadge verdict={row.verdict} size="sm" />
                </span>
              </div>
            ))}
          </div>
        )}

        {showBreakdown && (
          <div className="mt-5 border-t border-slate-700 pt-4">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-3">
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
                    <ConfidenceBar value={d.confidence} height={3} background="bg-slate-700" />
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
