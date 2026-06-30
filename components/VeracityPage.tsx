"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineInformationCircle,
  HiOutlineLink,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineQuestionMarkCircle,
  HiOutlineShare,
  HiOutlineArrowDownTray,
  HiOutlineEllipsisHorizontal,
  HiOutlineChevronRight,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";
import { CLAIM_PILL } from "./shared/claimStyles";

type Phase = "submitting" | "scanning" | "resolved";
type Verdict = "likely-true" | "likely-false" | "unresolved" | "mixed";

// Evidence sources surfaced for a claim. We intentionally store ONLY metadata
// (title, source domain, URL, relevance, stance) — no fabricated excerpts. The
// real source content is reached via the external link.
type Evidence = {
  id: string;
  title: string;
  source: string;
  url: string;
  relevance: number;
  /** Whether this source supports, refutes, or is mixed on the claim. */
  stance: "refutes" | "supports" | "mixed";
};

const SAMPLE_EVIDENCE: Evidence[] = [
  {
    id: "e1",
    title: "Hurricane Helene: Why conspiracy theories about weather modification are wrong",
    source: "Reuters Fact Check",
    url: "reuters.com/fact-check/hurricane-helene-weather-modification",
    relevance: 0.92,
    stance: "refutes",
  },
  {
    id: "e2",
    title: "NOAA statement on Hurricane Helene meteorological origins",
    source: "NOAA",
    url: "noaa.gov/news/hurricane-helene-meteorological-summary",
    relevance: 0.88,
    stance: "refutes",
  },
  {
    id: "e3",
    title: "AP: Officials debunk weather control claims after Helene",
    source: "Associated Press",
    url: "apnews.com/article/hurricane-helene-fact-check",
    relevance: 0.81,
    stance: "refutes",
  },
];

const FRESH_TIMING = {
  scanStartMs: 600,
  resolvedMs: 5600,
};

export function VeracityPage() {
  const search = useSearchParams();
  const fresh = search.get("fresh") === "1";
  const submittedText =
    search.get("text") ||
    "Hurricane Helene was caused by government weather manipulation.";

  const startedAt = useRef(Date.now());
  const [elapsed, setElapsed] = useState(fresh ? 0 : FRESH_TIMING.resolvedMs + 1);

  useEffect(() => {
    if (!fresh) return;
    let raf = 0;
    function tick() {
      const e = Date.now() - startedAt.current;
      setElapsed(e);
      if (e < FRESH_TIMING.resolvedMs + 1000) {
        raf = requestAnimationFrame(tick);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fresh]);

  const phase: Phase = useMemo(() => {
    if (!fresh) return "resolved";
    if (elapsed < FRESH_TIMING.scanStartMs) return "submitting";
    if (elapsed < FRESH_TIMING.resolvedMs) return "scanning";
    return "resolved";
  }, [fresh, elapsed]);

  const verdict: Verdict = "likely-false";
  const verdictPill = CLAIM_PILL[verdict];

  const isLoading = phase !== "resolved";

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-[#041E42] dark:text-slate-100 p-5 md:p-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
        <a href="/" className="hover:text-[#041E42] dark:hover:text-slate-100">
          Verify Media
        </a>
        <HiOutlineChevronRight className="w-3 h-3" />
        <a
          href="/media/history?tab=claims"
          className="hover:text-[#041E42] dark:hover:text-slate-100"
        >
          Claim history
        </a>
        <HiOutlineChevronRight className="w-3 h-3" />
        <span className="text-[#041E42] dark:text-slate-100 font-medium font-mono">
          {fresh ? "new analysis" : "claim-result"}
        </span>
      </nav>

      <header className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-bold">Is this Claim True?</h1>
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

      {/* Two-col hero */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* LEFT: submitted text */}
        <section className="bg-[#041E42] dark:bg-slate-900 text-white rounded-lg p-5 ring-1 ring-transparent dark:ring-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <HiOutlineChatBubbleBottomCenterText className="w-5 h-5 text-slate-400" />
            <div className="text-[11px] uppercase tracking-wider text-slate-400">
              Submitted text
            </div>
          </div>
          <p className="text-base leading-relaxed text-slate-100">
            “{submittedText}”
          </p>
          {isLoading && (
            <div className="mt-5 pt-4 border-t border-slate-700 flex items-center gap-2 text-sm text-slate-300">
              <Spinner />
              <span>
                {phase === "submitting"
                  ? "Submitting claim to ensemble"
                  : "Scanning sources and generating verdict"}
                <AnimatedDots />
              </span>
            </div>
          )}
        </section>

        {/* RIGHT: behind the verdict */}
        <section className="bg-[#041E42] dark:bg-slate-900 text-white rounded-lg p-5 ring-1 ring-transparent dark:ring-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HiOutlineInformationCircle className="w-5 h-5 text-slate-400" />
              <div className="text-[11px] uppercase tracking-wider text-slate-400">
                Behind the verdict
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {isLoading ? "0/1 complete" : "1/1 complete"}
            </div>
          </div>

          {/* Results summary */}
          <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">
            Results summary
          </div>
          {isLoading ? (
            <div className="text-base leading-tight text-slate-300 mb-5">
              Analysis in progress
              <AnimatedDots />
              <div className="text-xs text-slate-500 mt-1">
                Scanning sources and generating verdict
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap mb-5">
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1 rounded ${verdictPill.classes}`}
              >
                <VerdictIcon verdict={verdict} />
                {verdictPill.label}
              </span>
              <span className="text-sm text-slate-300">
                3 of 3 sources agree this claim is unsupported
              </span>
            </div>
          )}

          {/* Detectors */}
          <div className="border-t border-slate-700 pt-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">
              Detectors
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <HiOutlineChatBubbleBottomCenterText className="w-4 h-4 text-slate-400" />
                <span>Claim Checker</span>
              </div>
              {isLoading ? (
                <span className="text-[11px] uppercase tracking-wide text-[#00B5E2] inline-flex items-center gap-1.5">
                  <Spinner /> Running
                </span>
              ) : (
                <span className="text-[11px] uppercase tracking-wide text-emerald-400 inline-flex items-center gap-1.5">
                  <HiOutlineCheckCircle className="w-4 h-4" /> Complete
                </span>
              )}
            </div>
          </div>

          <p className="mt-5 text-[11px] text-slate-400 leading-relaxed">
            Disclaimer: this tool uses AI-powered analysis and external sources. However,
            errors can occur.
          </p>
        </section>
      </div>

      {/* Evidence and Sources */}
      <section className="mt-10">
        <div className="flex items-end justify-between mb-4 gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 text-2xl font-bold text-[#041E42] dark:text-slate-100">
            <HiOutlineLink className="w-[26px] h-[26px]" />
            Evidence &amp; Sources
          </div>
          {!isLoading && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {SAMPLE_EVIDENCE.length} sources · ranked by relevance
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="bg-[#041E42] dark:bg-slate-900 text-slate-400 rounded-lg p-8 text-center ring-1 ring-transparent dark:ring-slate-800">
            <Spinner />
            <span className="ml-2">Evidence and sources are still loading…</span>
          </div>
        ) : (
          <div className="grid gap-3">
            {SAMPLE_EVIDENCE.map((e, i) => (
              <EvidenceCard key={e.id} index={i + 1} evidence={e} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────
// EvidenceCard — metadata only. No fabricated source excerpts inline.
// Users read the actual content at the source via the link.
// ─────────────────────────────────────────────────────────────────────

const STANCE_PILL: Record<
  Evidence["stance"],
  { label: string; classes: string }
> = {
  refutes: {
    label: "Refutes the claim",
    classes:
      "bg-red-900/40 text-red-300 dark:bg-red-900/30 ring-1 ring-red-500/30",
  },
  supports: {
    label: "Supports the claim",
    classes:
      "bg-emerald-900/40 text-emerald-300 dark:bg-emerald-900/30 ring-1 ring-emerald-500/30",
  },
  mixed: {
    label: "Mixed",
    classes:
      "bg-amber-900/40 text-amber-300 dark:bg-amber-900/30 ring-1 ring-amber-500/30",
  },
};

function EvidenceCard({ index, evidence }: { index: number; evidence: Evidence }) {
  const stance = STANCE_PILL[evidence.stance];
  const relevancePct = Math.round(evidence.relevance * 100);

  return (
    <article className="bg-[#041E42] dark:bg-slate-900 text-white rounded-lg ring-1 ring-transparent dark:ring-slate-800 overflow-hidden">
      <div className="p-5 flex items-start gap-4">
        <div className="w-8 h-8 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 font-mono text-sm">
          {index}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold leading-snug">{evidence.title}</h3>
          <div className="text-xs text-slate-400 mt-1 truncate">
            {evidence.source} · <span className="font-mono">{evidence.url}</span>
          </div>
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <span
              className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded ${stance.classes}`}
            >
              {stance.label}
            </span>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#00B5E2] hover:text-[#33D6FF] transition"
            >
              Read on {evidence.source}
              <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] uppercase tracking-wide text-slate-400">
            Relevance
          </div>
          <div className="font-mono text-sm text-white">{relevancePct}%</div>
          <div className="mt-1 w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00B5E2]"
              style={{ width: `${relevancePct}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function VerdictIcon({ verdict }: { verdict: Verdict }) {
  if (verdict === "likely-true") return <HiOutlineCheckCircle className="w-4 h-4" />;
  if (verdict === "likely-false") return <HiOutlineXCircle className="w-4 h-4" />;
  return <HiOutlineQuestionMarkCircle className="w-4 h-4" />;
}

function IconBtn({ children, label }: { children: React.ReactNode; label: string }) {
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

function Spinner() {
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

function AnimatedDots() {
  return (
    <span aria-hidden>
      <span
        className="inline-block w-1 h-1 mx-0.5 bg-current rounded-full"
        style={{ animation: "claim-bounce 1.4s ease-in-out infinite", animationDelay: "0s" }}
      />
      <span
        className="inline-block w-1 h-1 mx-0.5 bg-current rounded-full"
        style={{ animation: "claim-bounce 1.4s ease-in-out infinite", animationDelay: "0.2s" }}
      />
      <span
        className="inline-block w-1 h-1 mx-0.5 bg-current rounded-full"
        style={{ animation: "claim-bounce 1.4s ease-in-out infinite", animationDelay: "0.4s" }}
      />
      <style>{`
        @keyframes claim-bounce {
          0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }
      `}</style>
    </span>
  );
}
