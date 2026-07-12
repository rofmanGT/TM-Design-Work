"use client";

import { HiOutlineLink } from "react-icons/hi2";
import {
  FACT_CHECK_MODELS,
  ENSEMBLE_EVIDENCE,
  aggregateEnsemble,
  RESULTS_SUMMARY_BY_VERDICT,
} from "./veracityEnsembleData";
import {
  useEnsembleSim,
  ClaimVerdictBanner,
  SubmittedTextPanel,
  BehindTheVerdictPanel,
  EvidenceList,
  EvidenceLegend,
  Spinner,
} from "./veracityShared";

// ─────────────────────────────────────────────────────────────────────
// Version A — a faithful near-duplicate of today's claim page. The
// "Behind the Verdict" panel (navy header + gray body: Results Summary,
// Detectors, Disclaimer) lists the full fact-check ENSEMBLE instead of a
// single Claim Checker.
// ─────────────────────────────────────────────────────────────────────

export function VeracityModelPanel({ text, fresh }: { text: string; fresh: boolean }) {
  const { phase, doneModels, isModelDone, isLoading } = useEnsembleSim(fresh);
  const agg = aggregateEnsemble(doneModels.length ? doneModels : FACT_CHECK_MODELS);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-[#041E42] dark:text-slate-100 p-5 md:p-8">
      <ClaimVerdictBanner verdict={agg.verdict} isLoading={isLoading} />

      {/* Hero — share/export actions live at the bottom of the text box */}
      <div className="grid md:grid-cols-2 gap-5">
        <SubmittedTextPanel text={text} isLoading={isLoading} phase={phase} />
        <BehindTheVerdictPanel
          isLoading={isLoading}
          isModelDone={isModelDone}
          doneCount={doneModels.length}
          showDetectors
          summary={RESULTS_SUMMARY_BY_VERDICT[agg.verdict]}
        />
      </div>

      {/* Evidence */}
      <section className="mt-10">
        <div className="flex items-center gap-2.5 text-2xl font-bold mb-2">
          <HiOutlineLink className="w-[26px] h-[26px]" />
          Evidence &amp; Sources
        </div>
        <div className="mb-4">
          <EvidenceLegend count={ENSEMBLE_EVIDENCE.length} />
        </div>

        {isLoading ? (
          <div className="bg-[#041E42] dark:bg-slate-900 text-slate-400 rounded-lg p-8 text-center ring-1 ring-transparent dark:ring-slate-800">
            <Spinner />
            <span className="ml-2">Evidence and sources are still loading…</span>
          </div>
        ) : (
          <EvidenceList evidence={ENSEMBLE_EVIDENCE} />
        )}
      </section>
    </main>
  );
}
