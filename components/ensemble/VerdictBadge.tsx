import { VERDICT_STYLES, type Verdict } from "./verdict";

type Props = {
  verdict: Verdict;
  size?: "sm" | "md";
};

export function VerdictBadge({ verdict, size = "md" }: Props) {
  if (verdict === "pending") {
    return (
      <span
        aria-label="Analysis pending"
        className="blink-pill-anim inline-block bg-slate-600 border-2 border-slate-600 rounded-lg w-12 h-[18px] align-middle"
      />
    );
  }

  const s = VERDICT_STYLES[verdict];
  const sizing =
    size === "sm" ? "text-[11px] px-1.5 py-px gap-1" : "text-xs px-2 py-0.5 gap-1.5";

  return (
    <span className={`inline-flex items-center ${sizing} ${s.pillBg} ${s.pillText} rounded`}>
      <s.Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      {s.label}
    </span>
  );
}
