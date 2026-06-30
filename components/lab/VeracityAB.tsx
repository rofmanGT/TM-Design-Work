"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { VeracityModelPanel } from "./VeracityModelPanel";
import { VeracityConsensusSpectrum } from "./VeracityConsensusSpectrum";

type Variant = "panel" | "spectrum";

const SAMPLE_CLAIM =
  "Hurricane Helene was caused by government weather manipulation.";

export function VeracityAB() {
  const search = useSearchParams();
  const fresh = search.get("fresh") === "1";
  const text = search.get("text") || SAMPLE_CLAIM;
  const [variant, setVariant] = useState<Variant>(
    search.get("v") === "spectrum" ? "spectrum" : "panel"
  );

  return (
    <div className="bg-white dark:bg-slate-950">
      {/* Design-review switcher (not part of the production page) */}
      <div className="sticky top-20 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-5 md:px-8 py-3">
        <div className="flex items-center justify-end gap-4 flex-wrap">
          <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-900">
            <button
              onClick={() => setVariant("panel")}
              className={`text-xs font-semibold px-3 py-1.5 rounded transition ${
                variant === "panel"
                  ? "bg-[#041E42] text-white dark:bg-[#00B5E2] dark:text-[#041E42]"
                  : "text-slate-600 dark:text-slate-300 hover:text-[#041E42] dark:hover:text-white"
              }`}
            >
              A · Model Panel
            </button>
            <button
              onClick={() => setVariant("spectrum")}
              className={`text-xs font-semibold px-3 py-1.5 rounded transition ${
                variant === "spectrum"
                  ? "bg-[#041E42] text-white dark:bg-[#00B5E2] dark:text-[#041E42]"
                  : "text-slate-600 dark:text-slate-300 hover:text-[#041E42] dark:hover:text-white"
              }`}
            >
              B · Consensus Spectrum
            </button>
          </div>
        </div>
      </div>

      {variant === "panel" ? (
        <VeracityModelPanel text={text} fresh={fresh} />
      ) : (
        <VeracityConsensusSpectrum text={text} fresh={fresh} />
      )}
    </div>
  );
}
