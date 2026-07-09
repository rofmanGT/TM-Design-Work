"use client";

import { useSearchParams } from "next/navigation";
import { VeracityModelPanel } from "./VeracityModelPanel";

const SAMPLE_CLAIM =
  "Hurricane Helene was caused by government weather manipulation.";

// The text-claim result page. The Model Panel design is the chosen direction
// (Consensus Spectrum was retired), so this simply renders it.
export function VeracityAB() {
  const search = useSearchParams();
  const fresh = search.get("fresh") === "1";
  const text = search.get("text") || SAMPLE_CLAIM;

  return (
    <div className="bg-white dark:bg-slate-950">
      <VeracityModelPanel text={text} fresh={fresh} />
    </div>
  );
}
