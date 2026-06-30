"use client";

import { HiOutlineLink, HiOutlineChartBarSquare, HiOutlineCpuChip } from "react-icons/hi2";
import type { ClaimVerdict } from "@/components/commercial/sampleData";
import {
  FACT_CHECK_MODELS,
  ENSEMBLE_EVIDENCE,
  aggregateEnsemble,
  veracityToVerdict,
  STANCE_META,
  type FactCheckModel,
  type EvidenceStance,
} from "./veracityEnsembleData";
import {
  useEnsembleSim,
  ClaimHeader,
  ClaimVerdictBanner,
  SubmittedTextPanel,
  BehindTheVerdictPanel,
  EvidencePassageCard,
  EvidenceLegend,
  ClaimVerdictPill,
  Spinner,
  MODEL_ICON,
} from "./veracityShared";

const DOT: Record<ClaimVerdict, string> = {
  "likely-false": "bg-red-400",
  "likely-true": "bg-emerald-400",
  unresolved: "bg-slate-300",
  mixed: "bg-amber-400",
};

export function VeracityConsensusSpectrum({
  text,
  fresh,
}: {
  text: string;
  fresh: boolean;
}) {
  const { phase, doneModels, isModelDone, isLoading } = useEnsembleSim(fresh);
  const agg = aggregateEnsemble(doneModels.length ? doneModels : FACT_CHECK_MODELS);

  const byStance = (s: EvidenceStance) => ENSEMBLE_EVIDENCE.filter((e) => e.stance === s);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-[#041E42] dark:text-slate-100 p-5 md:p-8">
      <ClaimHeader />

      <ClaimVerdictBanner verdict={agg.verdict} isLoading={isLoading} />

      {/* Hero */}
      <div className="grid md:grid-cols-2 gap-5">
        <SubmittedTextPanel text={text} isLoading={isLoading} phase={phase} />
        <BehindTheVerdictPanel
          isLoading={isLoading}
          isModelDone={isModelDone}
          doneCount={doneModels.length}
          showDetectors={false}
          consensus={{ agree: agg.agree, total: agg.total }}
        />
      </div>

      {/* Consensus spectrum */}
      <section className="mt-10">
        <div className="flex items-center gap-2.5 text-2xl font-bold mb-1">
          <HiOutlineChartBarSquare className="w-[26px] h-[26px] text-slate-400" />
          Model Consensus
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 max-w-2xl">
          Four models, plotted by where each lands on the claim. Tight clustering
          means agreement; a spread is worth a closer look.
        </p>

        <div className="bg-[#041E42] dark:bg-slate-900 text-white rounded-lg p-6 md:p-7 ring-1 ring-transparent dark:ring-slate-800">
          {/* Zone labels */}
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-5">
            <span>Refutes</span>
            <span>Uncertain</span>
            <span>Supports</span>
          </div>

          {/* Plot */}
          <div className="relative pt-6">
            {/* Gridlines */}
            <div className="absolute inset-0 pointer-events-none">
              {[0, 25, 50, 75, 100].map((t) => (
                <div
                  key={t}
                  className={`absolute top-0 bottom-0 w-px ${t === 50 ? "bg-slate-600/40" : "bg-slate-700/25"}`}
                  style={{ left: `${t}%` }}
                />
              ))}
            </div>

            {/* Aggregate marker */}
            {!isLoading && (
              <div
                className="absolute inset-y-0 w-px bg-[#00B5E2]/70 pointer-events-none"
                style={{ left: `${agg.veracity}%` }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono tracking-wide text-[#00B5E2]">
                  Ensemble {agg.veracity}
                </div>
              </div>
            )}

            {/* Model rows */}
            <div className="relative">
              {FACT_CHECK_MODELS.map((m) => (
                <SpectrumRow key={m.id} model={m} done={isModelDone(m)} />
              ))}
            </div>
          </div>

          {/* Scale ticks */}
          <div className="flex justify-between text-[10px] font-mono text-slate-600 mt-1.5">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>

          {/* Legend list */}
          <div className="mt-6 grid sm:grid-cols-2 gap-x-8 gap-y-2.5 border-t border-slate-700/50 pt-5">
            {FACT_CHECK_MODELS.map((m, i) => {
              const Icon = MODEL_ICON[m.id] ?? HiOutlineCpuChip;
              const done = isModelDone(m);
              const verdict = veracityToVerdict(m.veracity);
              return (
                <div key={m.id} className="flex items-center gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-[11px] font-mono flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="font-medium text-slate-100">{m.name}</span>
                  <span className="text-slate-500 text-xs hidden md:inline">· {m.role}</span>
                  <span className="ml-auto shrink-0">
                    {done ? (
                      <ClaimVerdictPill verdict={verdict} size="sm" />
                    ) : (
                      <span className="text-[11px] uppercase tracking-wide text-slate-500">
                        Pending
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Evidence grouped by stance */}
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
          <div className="grid lg:grid-cols-3 gap-5">
            <StanceLane stance="refutes" items={byStance("refutes")} />
            <StanceLane stance="context" items={byStance("context")} />
            <StanceLane stance="supports" items={byStance("supports")} />
          </div>
        )}
      </section>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────
// One model's position on the spectrum
// ─────────────────────────────────────────────────────────────────────

function SpectrumRow({ model, done }: { model: FactCheckModel; done: boolean }) {
  const verdict = veracityToVerdict(model.veracity);
  const labelLeft = model.veracity > 55; // flip label to avoid right-edge overflow

  // Pending: a quiet, static placeholder pinned left — no motion.
  if (!done) {
    return (
      <div className="relative h-9">
        <div className="absolute inset-x-0 top-1/2 h-px bg-slate-700/20" />
        <div className="absolute top-1/2 -translate-y-1/2 left-0 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full border border-slate-600" />
          <span className="text-xs text-slate-500 whitespace-nowrap">
            {model.name} · pending
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-9">
      <div className="absolute inset-x-0 top-1/2 h-px bg-slate-700/20" />
      <div
        className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-2 ${
          labelLeft ? "-translate-x-full flex-row-reverse" : ""
        }`}
        style={{ left: `${model.veracity}%` }}
      >
        <span
          className={`w-2.5 h-2.5 rounded-full ${DOT[verdict]} ring-[3px] ring-[#041E42] dark:ring-slate-900 shrink-0`}
        />
        <span className={`text-xs whitespace-nowrap text-slate-200 ${labelLeft ? "pr-2" : ""}`}>
          {model.name}
          <span className="text-slate-400 font-mono ml-1.5">{model.confidence}%</span>
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Stance lane — a column of evidence sharing one stance
// ─────────────────────────────────────────────────────────────────────

function StanceLane({
  stance,
  items,
}: {
  stance: EvidenceStance;
  items: typeof ENSEMBLE_EVIDENCE;
}) {
  const meta = STANCE_META[stance];
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
        <h3 className="text-sm font-bold uppercase tracking-wide">{meta.lane}</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center text-xs text-slate-500 dark:text-slate-400">
          No sources {stance === "supports" ? "support" : "in this group for"} this claim.
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((e, i) => (
            <EvidencePassageCard key={e.id} index={i + 1} evidence={e} />
          ))}
        </div>
      )}
    </div>
  );
}
