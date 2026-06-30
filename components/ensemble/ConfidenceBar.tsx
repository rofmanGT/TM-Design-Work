import { VERDICT_STYLES, verdictFromConfidence } from "./verdict";

type Props = {
  /** 0–100, manipulation probability. Out-of-range values are clamped. */
  value: number;
  /** Bar thickness in px. Defaults to 6. */
  height?: number;
  /** Show "likely real / likely AI" labels under the bar. */
  showScale?: boolean;
  /** Tailwind class for the unfilled track. Defaults to a navy that sits on the brand card. */
  background?: string;
};

export function ConfidenceBar({
  value,
  height = 6,
  showScale = false,
  background = "bg-slate-800",
}: Props) {
  const v = Math.max(0, Math.min(100, value));
  const fillColor = VERDICT_STYLES[verdictFromConfidence(v)].bar;

  return (
    <div className="w-full">
      <div
        className={`relative rounded-full overflow-hidden ${background}`}
        style={{ height: `${height}px` }}
      >
        <div
          className={`absolute left-0 top-0 bottom-0 rounded-full ${fillColor} transition-[width] duration-700 ease-out`}
          style={{ width: `${v}%` }}
        />
      </div>
      {showScale && (
        <div className="flex justify-between text-[10px] uppercase tracking-wide text-slate-400 mt-1.5">
          <span>Likely real</span>
          <span>Likely AI</span>
        </div>
      )}
    </div>
  );
}
