"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineShare,
  HiOutlineArrowDownTray,
  HiOutlineEllipsisHorizontal,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineQuestionMarkCircle,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineChevronDown,
  HiOutlineMagnifyingGlass,
  HiOutlineDocumentDuplicate,
  HiOutlineScale,
  HiOutlineSparkles,
  HiOutlineCpuChip,
  HiOutlineCheckBadge,
} from "react-icons/hi2";
import { CLAIM_PILL } from "@/components/shared/claimStyles";
import type { ClaimVerdict } from "@/components/commercial/sampleData";
import {
  FACT_CHECK_MODELS,
  ENSEMBLE_TOTAL_MS,
  veracityToVerdict,
  RESULTS_SUMMARY,
  CLAIM_DISCLAIMER,
  type FactCheckModel,
  type EnsembleEvidence,
} from "./veracityEnsembleData";

// Icon per fact-check model.
export const MODEL_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  retrieval: HiOutlineMagnifyingGlass,
  matching: HiOutlineDocumentDuplicate,
  stance: HiOutlineScale,
  reasoner: HiOutlineSparkles,
};

export type Phase = "submitting" | "scanning" | "resolved";

const SUBMIT_MS = 600;

// ─────────────────────────────────────────────────────────────────────
// Loading simulation — models stream in one-by-one, like the media
// detector ensemble. Aggregate is computed over whichever have finished.
// ─────────────────────────────────────────────────────────────────────

export function useEnsembleSim(fresh: boolean) {
  const startedAt = useRef(Date.now());
  const [elapsed, setElapsed] = useState(fresh ? 0 : ENSEMBLE_TOTAL_MS + 1);

  useEffect(() => {
    if (!fresh) return;
    let raf = 0;
    function tick() {
      const e = Date.now() - startedAt.current;
      setElapsed(e);
      if (e < ENSEMBLE_TOTAL_MS + 1200) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fresh]);

  const phase: Phase = useMemo(() => {
    if (!fresh) return "resolved";
    if (elapsed < SUBMIT_MS) return "submitting";
    if (elapsed < ENSEMBLE_TOTAL_MS) return "scanning";
    return "resolved";
  }, [fresh, elapsed]);

  const doneModels = useMemo(
    () => FACT_CHECK_MODELS.filter((m) => !fresh || elapsed >= m.completeAt),
    [fresh, elapsed]
  );

  function isModelDone(m: FactCheckModel) {
    return !fresh || elapsed >= m.completeAt;
  }

  return { phase, elapsed, doneModels, isModelDone, isLoading: phase !== "resolved" };
}

// ─────────────────────────────────────────────────────────────────────
// Shared chrome: breadcrumb + title row
// ─────────────────────────────────────────────────────────────────────

export function ClaimHeader() {
  return (
    <header className="flex items-center justify-end -mt-3 mb-4">
      <div className="flex items-center gap-1">
        <IconBtn label="Share">
          <HiOutlineShare className="w-4 h-4" />
        </IconBtn>
        <IconBtn label="Export">
          <HiOutlineArrowDownTray className="w-4 h-4" />
        </IconBtn>
        <IconBtn label="More">
          <HiOutlineEllipsisHorizontal className="w-4 h-4" />
        </IconBtn>
      </div>
    </header>
  );
}

export function SubmittedTextPanel({
  text,
  isLoading,
  phase,
}: {
  text: string;
  isLoading: boolean;
  phase: Phase;
}) {
  return (
    <section className="bg-[#041E42] dark:bg-slate-900 text-white rounded-lg p-5 ring-1 ring-transparent dark:ring-slate-800">
      <div className="flex items-center gap-2 mb-3">
        <HiOutlineChatBubbleBottomCenterText className="w-5 h-5 text-slate-400" />
        <div className="text-[11px] uppercase tracking-wider text-slate-400">
          Submitted text
        </div>
      </div>
      <p className="text-base leading-relaxed text-slate-100">“{text}”</p>
      {isLoading && (
        <div className="mt-5 pt-4 border-t border-slate-700 flex items-center gap-2 text-sm text-slate-300">
          <Spinner />
          <span>
            {phase === "submitting"
              ? "Submitting claim to the ensemble"
              : "Models are scanning sources"}
            <AnimatedDots />
          </span>
        </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Evidence card — one extracted sentence, expand for context.
// Shared by both designs. citedBy ties the source back to the models.
// ─────────────────────────────────────────────────────────────────────

export function EvidencePassageCard({ evidence }: { evidence: EnsembleEvidence }) {
  const [expanded, setExpanded] = useState(false);
  const relevancePct = Math.round(evidence.relevance * 100);

  return (
    <article className="bg-[#041E42] dark:bg-slate-900 text-white rounded-lg ring-1 ring-black/5 dark:ring-slate-800 hover:ring-[#00B5E2]/30 transition overflow-hidden p-4">
      {/* Title + source (stance is conveyed by the lane header) */}
      <h3 className="text-[15px] font-semibold leading-snug">{evidence.title}</h3>
      <div className="text-[11px] text-slate-400 mt-1 truncate">
        {evidence.source}
        {evidence.author && <span className="text-slate-300"> · {evidence.author}</span>}
        <span className="mx-1.5 text-slate-600">·</span>
        <span className="font-mono">{evidence.url}</span>
      </div>

      {/* Meta row: relevance meter (drives the sort order of the column) */}
      <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center gap-x-3 gap-y-1.5 flex-wrap text-[11px]">
        <span className="inline-flex items-center gap-1.5 text-slate-400">
          Relevance
          <span className="inline-block w-10 h-1 bg-slate-800 rounded-full overflow-hidden align-middle">
            <span className="block h-full bg-[#00B5E2]" style={{ width: `${relevancePct}%` }} />
          </span>
          <span className="font-mono tabular-nums text-slate-200">{relevancePct}%</span>
        </span>
      </div>

      {/* Key passage — the single most relevant sentence, quoted verbatim */}
      <div className="mt-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
          Most relevant passage
        </div>
        <blockquote className="border-l-2 border-[#00B5E2]/60 pl-3 text-[13px] leading-relaxed text-slate-100">
          {evidence.passage}
        </blockquote>
        {expanded && (
          <div className="mt-3 pl-3 border-l-2 border-slate-700">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
              In context · quoted from {evidence.source}
            </div>
            <div className="space-y-2.5 text-[13px] leading-relaxed text-slate-300">
              {evidence.context.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
        >
          <HiOutlineChevronDown
            className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
          {expanded ? "Hide context" : "Show context"}
        </button>
        <a
          href={evidence.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-[#00B5E2] hover:text-[#33D6FF] transition"
        >
          Read on {evidence.source}
          <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5" />
        </a>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────
// EvidenceList — one column of sources, ranked by relevance. Stance
// grouping (Refutes / Context / Supports) was retired: "refutes" and
// "supports" are verbs while "context" is a noun, so the labels need
// rethinking before they can head their own columns. Until then, a single
// relevance-sorted column is the honest presentation.
// ─────────────────────────────────────────────────────────────────────

export function EvidenceList({ evidence }: { evidence: EnsembleEvidence[] }) {
  const ranked = [...evidence].sort((a, b) => b.relevance - a.relevance);
  return (
    <div className="grid gap-3 max-w-3xl">
      {ranked.map((e) => (
        <EvidencePassageCard key={e.id} evidence={e} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// A small legend that makes "what is shown" explicit in the evidence area.
// ─────────────────────────────────────────────────────────────────────

export function EvidenceLegend({ count }: { count: number }) {
  return (
    <div className="text-[11px] text-slate-500 dark:text-slate-400">
      {count} sources, ranked by relevance · one passage each, expand for context
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// ClaimVerdictBanner — the big, unmistakable verdict block, mirroring the
// real product: a solid colored bar ("Verdict: Likely false") over a gray
// restatement bar ("TrueMedia.org verdict: likely false.").
// ─────────────────────────────────────────────────────────────────────

// Labels match the production repo's verdict `longSummary` strings
// (data/claimVerdict.ts). Our four verdicts map to the real four:
// likely-true←low, likely-false←high, mixed←uncertain, unresolved←unknown.
const BANNER: Record<ClaimVerdict, { bar: string; label: string }> = {
  "likely-false": { bar: "bg-[#E5341F]", label: "Likely false" },
  "likely-true": { bar: "bg-emerald-600", label: "Likely true" },
  mixed: { bar: "bg-amber-500", label: "Mixed or unclear evidence" },
  unresolved: { bar: "bg-slate-500", label: "Not enough evidence to verify" },
};

export function ClaimVerdictBanner({
  verdict,
  isLoading,
  humanVerified = false,
}: {
  verdict: ClaimVerdict;
  isLoading: boolean;
  /** Set when a human analyst has confirmed the verdict (ground truth).
      Mirrors the production "Verified by human analyst" badge. */
  humanVerified?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="rounded-lg overflow-hidden ring-1 ring-slate-300 dark:ring-slate-700 mb-6">
        <div className="bg-slate-500 text-white text-center font-bold text-xl md:text-2xl py-4 px-4 flex items-center justify-center gap-3">
          <Spinner />
          Verdict: Analyzing…
        </div>
        <div className="bg-slate-200 dark:bg-slate-800 text-[#041E42] dark:text-slate-200 px-5 py-3 text-sm md:text-base border-t border-black/10 dark:border-slate-700">
          TrueMedia.org is reviewing the available evidence…
        </div>
      </div>
    );
  }
  const b = BANNER[verdict];
  return (
    <div className="rounded-lg overflow-hidden ring-1 ring-black/10 dark:ring-slate-700 mb-6">
      <div className={`${b.bar} text-white text-center font-bold text-xl md:text-2xl py-4 px-4`}>
        Verdict: {b.label}
      </div>
      <div className="bg-slate-200 dark:bg-slate-800 text-[#041E42] dark:text-slate-200 px-5 py-3 text-sm md:text-base border-t border-black/10 dark:border-slate-700 flex items-center justify-between gap-3">
        <span>
          TrueMedia.org verdict: <strong>{b.label.toLowerCase()}</strong>.
        </span>
        {humanVerified && (
          <span className="inline-flex items-center gap-1.5 text-sm text-[#0883a3] dark:text-[#33D6FF] shrink-0">
            <HiOutlineCheckBadge className="w-5 h-5" />
            Verified by human analyst
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// BehindTheVerdictPanel — the real product panel (navy header + gray body:
// Results Summary, optional Detectors, Disclaimer). Shared by both designs.
//   • Version A passes showDetectors → lists every model in the ensemble.
//   • Version B hides the list (the Model Consensus plot covers per-model)
//     and shows a one-line consensus instead.
// ─────────────────────────────────────────────────────────────────────

const CHIP: Record<ClaimVerdict, { bg: string; label: string }> = {
  "likely-false": { bg: "bg-[#E5341F]", label: "Likely false" },
  "likely-true": { bg: "bg-emerald-600", label: "Likely true" },
  unresolved: { bg: "bg-slate-500", label: "Unresolved" },
  mixed: { bg: "bg-amber-500", label: "Mixed" },
};

export function BehindTheVerdictPanel({
  isLoading,
  isModelDone,
  doneCount,
  showDetectors = true,
  consensus,
  summary = RESULTS_SUMMARY,
}: {
  isLoading: boolean;
  isModelDone: (m: FactCheckModel) => boolean;
  doneCount: number;
  showDetectors?: boolean;
  consensus?: { agree: number; total: number };
  /** The one-line Results Summary for the current verdict. */
  summary?: string;
}) {
  return (
    <section className="rounded-lg overflow-hidden ring-1 ring-black/10 dark:ring-slate-700 flex flex-col">
      {/* Navy header */}
      <div className="bg-[#041E42] text-white text-center font-bold text-lg py-4 px-4">
        Behind the Verdict
      </div>

      {/* Gray body */}
      <div className="bg-slate-200 dark:bg-slate-800 text-[#041E42] dark:text-slate-100 flex-1">
        {/* Results summary */}
        <div className="px-5 py-4 border-b border-black/10 dark:border-slate-700">
          <div className="text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
            Combined Result Summary
          </div>
          {isLoading ? (
            <div className="text-lg">
              Analysis in progress
              <AnimatedDots />
            </div>
          ) : (
            <>
              <div className="text-lg">{summary}</div>
              {consensus && (
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {consensus.agree} of {consensus.total} models agree
                </div>
              )}
            </>
          )}
        </div>

        {/* Detectors — the ensemble */}
        {showDetectors && (
          <div className="px-5 py-4 border-b border-black/10 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Detectors
              </div>
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {doneCount}/{FACT_CHECK_MODELS.length} complete
              </div>
            </div>
            <div className="divide-y divide-black/5 dark:divide-slate-700/60">
              {FACT_CHECK_MODELS.map((m) => (
                <DetectorRow key={m.id} model={m} done={isModelDone(m)} />
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {CLAIM_DISCLAIMER}
        </div>
      </div>
    </section>
  );
}

function DetectorRow({ model, done }: { model: FactCheckModel; done: boolean }) {
  const Icon = MODEL_ICON[model.id] ?? HiOutlineCpuChip;
  const chip = CHIP[veracityToVerdict(model.veracity)];

  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400" />
        <span className="font-medium truncate">{model.name}</span>
        {/* No per-model percentage: the current text models return a label,
            not a confidence score. */}
        {done && (
          <span
            className={`shrink-0 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded ${chip.bg}`}
          >
            {chip.label}
          </span>
        )}
      </div>
      {done ? (
        <span className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-[#041E42] dark:text-slate-200">
          <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Complete
        </span>
      ) : (
        <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-[#0883a3] dark:text-[#00B5E2]">
          <Spinner /> Running
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Verdict pill helper
// ─────────────────────────────────────────────────────────────────────

export function ClaimVerdictPill({
  verdict,
  size = "md",
}: {
  verdict: ClaimVerdict;
  size?: "md" | "sm";
}) {
  const p = CLAIM_PILL[verdict];
  const pad = size === "sm" ? "text-[11px] px-2 py-0.5" : "text-sm px-2.5 py-1";
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded ${pad} ${p.classes}`}>
      <VerdictIcon verdict={verdict} size={size} />
      {p.label}
    </span>
  );
}

export function VerdictIcon({
  verdict,
  size = "md",
}: {
  verdict: ClaimVerdict;
  size?: "md" | "sm";
}) {
  const cls = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  if (verdict === "likely-true") return <HiOutlineCheckCircle className={cls} />;
  if (verdict === "likely-false") return <HiOutlineXCircle className={cls} />;
  return <HiOutlineQuestionMarkCircle className={cls} />;
}

// ─────────────────────────────────────────────────────────────────────
// Small shared primitives
// ─────────────────────────────────────────────────────────────────────

export function IconBtn({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <button
      title={label}
      aria-label={label}
      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-[#041E42] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
    >
      {children}
    </button>
  );
}

export function Spinner() {
  return (
    <span
      className="inline-block w-3.5 h-3.5 rounded-full border-2 border-[#00B5E2] border-t-transparent align-middle"
      style={{ animation: "veracity-spin 0.9s linear infinite" }}
      aria-hidden
    >
      <style>{`@keyframes veracity-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}

export function AnimatedDots() {
  return (
    <span aria-hidden>
      {[0, 0.2, 0.4].map((d) => (
        <span
          key={d}
          className="inline-block w-1 h-1 mx-0.5 bg-current rounded-full"
          style={{ animation: "claim-bounce 1.4s ease-in-out infinite", animationDelay: `${d}s` }}
        />
      ))}
      <style>{`
        @keyframes claim-bounce {
          0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }
      `}</style>
    </span>
  );
}
