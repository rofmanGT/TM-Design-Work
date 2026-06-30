# TrueMedia — Text Claim Page Mockups (Fact-Check Ensemble)

Two design proposals for the **text detection / claim page**, both extending today's
single "Claim Checker" into a **multi-model fact-check ensemble** (more than one model
output, aggregated into the verdict). Near-duplicate of the current product, not a rehaul.

**Live preview:** `/lab/veracity` — an A/B toggle at the top switches between the two.

- **Version A — Model Panel:** a faithful near-replica of today's page. Same
  "Behind the Verdict" panel (navy header + gray body: Results Summary, Detectors,
  Disclaimer); the **Detectors** list now shows every model in the ensemble instead of a
  single Claim Checker.
- **Version B — Consensus Spectrum:** same "Behind the Verdict" panel up top, then a
  **Model Consensus** dot-plot below showing where each model lands on a Refutes↔Supports
  axis, plus evidence grouped into stance lanes.

## Stack / dependencies
- Next.js 14 App Router, TypeScript, Tailwind CSS (dark mode via `class`), `react-icons/hi2`.
- Two in-repo imports the components rely on (included below): the `ClaimVerdict` union
  type and the `CLAIM_PILL` style map.

## How it fits together
```
app/lab/veracity/page.tsx              Route (wraps in Chrome + Suspense)
components/lab/VeracityAB.tsx           A/B toggle wrapper (review-only; not part of the page)
components/lab/veracityEnsembleData.ts  ALL sample data + helpers  ← swap this for the real API
components/lab/veracityShared.tsx       Shared UI (loading sim, hero, Behind-the-Verdict panel,
                                        evidence card w/ expand, verdict banner, primitives)
components/lab/VeracityModelPanel.tsx        Version A
components/lab/VeracityConsensusSpectrum.tsx Version B
```

## To implement for real
Everything in `veracityEnsembleData.ts` is mock data + a fake loading timeline. To wire to
the backend, replace that module's exports with real values:
- `FACT_CHECK_MODELS` → the ensemble's per-model outputs (name, role, veracity 0–100,
  confidence, weight).
- `ENSEMBLE_EVIDENCE` → retrieved sources. **`passage`/`context` must be text extracted
  verbatim from the source — never model-generated.** Collapsed shows one sentence; expand
  shows the fuller excerpt.
- `RESULTS_SUMMARY`, `aggregateEnsemble()` → the headline verdict + consensus.

The components, layout, and styling stay as-is.

---

# External dependency snippets

## `components/commercial/sampleData.ts` (only the type used here)

```ts
export type ClaimVerdict = "likely-true" | "likely-false" | "unresolved" | "mixed";
```

## `components/shared/claimStyles.ts`
_Verdict pill label + color map._

```ts
import type { ClaimVerdict } from "@/components/commercial/sampleData";

export const CLAIM_PILL: Record<ClaimVerdict, { label: string; classes: string }> = {
  "likely-true": {
    label: "Likely True",
    classes: "bg-emerald-900/40 text-emerald-300 dark:bg-emerald-900/30",
  },
  "likely-false": {
    label: "Likely False",
    classes: "bg-red-900/40 text-red-300 dark:bg-red-900/30",
  },
  unresolved: {
    label: "Unresolved",
    classes: "bg-slate-700/60 text-slate-300",
  },
  mixed: {
    label: "Mixed Evidence",
    classes: "bg-amber-900/40 text-amber-300 dark:bg-amber-900/30",
  },
};

```

# Core files

## `app/lab/veracity/page.tsx`
_Route._

```tsx
import { Suspense } from "react";
import { Chrome } from "@/components/Chrome";
import { VeracityAB } from "@/components/lab/VeracityAB";

export default function Page() {
  return (
    <Chrome>
      <Suspense fallback={null}>
        <VeracityAB />
      </Suspense>
    </Chrome>
  );
}

```

## `components/lab/VeracityAB.tsx`
_A/B toggle wrapper — review-only; drop it when implementing and render the chosen version directly._

```tsx
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

```

## `components/lab/veracityEnsembleData.ts`
_All sample data + helpers. **This is the file to replace with the real API.**_

```ts
import type { ClaimVerdict } from "@/components/commercial/sampleData";

// ─────────────────────────────────────────────────────────────────────
// Shared sample data for the two text-claim "fact-check ensemble" designs.
//
// The point of the feature: instead of a single claim checker, the verdict
// is the aggregate of several independent fact-check models — the text-side
// analog of the media page's detector ensemble.
//
// `veracity` is a 0–100 axis where 0 = fully refutes the claim and 100 =
// fully supports it. `confidence` is the model's self-reported certainty.
// `weight` is its share of the ensemble. Per-model verdict is DERIVED from
// veracity via veracityToVerdict — single source of truth.
// ─────────────────────────────────────────────────────────────────────

export type FactCheckModel = {
  id: string;
  name: string;
  /** Short functional role — a label, not prose. */
  role: string;
  /** 0 = refutes, 100 = supports. */
  veracity: number;
  /** Model self-confidence, 0–100. */
  confidence: number;
  /** Ensemble weight, 0–1. */
  weight: number;
  /** Elapsed ms at which this model finishes, for the loading stream. */
  completeAt: number;
};

export const FACT_CHECK_MODELS: FactCheckModel[] = [
  {
    id: "retrieval",
    name: "Evidence Retrieval",
    role: "Retrieves & ranks sources",
    veracity: 9,
    confidence: 91,
    weight: 0.3,
    completeAt: 2600,
  },
  {
    id: "matching",
    name: "Claim Matching",
    role: "Matches prior fact-checks",
    veracity: 14,
    confidence: 88,
    weight: 0.25,
    completeAt: 3400,
  },
  {
    id: "stance",
    name: "Stance Aggregator",
    role: "Aggregates source stance",
    veracity: 18,
    confidence: 83,
    weight: 0.25,
    completeAt: 4300,
  },
  {
    id: "reasoner",
    name: "Language-Model Reasoner",
    role: "Reasons over evidence",
    veracity: 38,
    confidence: 64,
    weight: 0.2,
    completeAt: 5200,
  },
];

export const ENSEMBLE_TOTAL_MS = Math.max(
  ...FACT_CHECK_MODELS.map((m) => m.completeAt)
);

/** Map a 0–100 veracity score to a claim verdict tier. */
export function veracityToVerdict(v: number): ClaimVerdict {
  if (v <= 35) return "likely-false";
  if (v >= 65) return "likely-true";
  return "unresolved";
}

/** Weighted-mean aggregate of the active models, plus consensus stats. */
export function aggregateEnsemble(models: FactCheckModel[]) {
  if (models.length === 0) {
    return { veracity: 0, verdict: "unresolved" as ClaimVerdict, agree: 0, total: 0 };
  }
  const totalWeight = models.reduce((s, m) => s + m.weight, 0);
  const veracity = Math.round(
    models.reduce((s, m) => s + m.weight * m.veracity, 0) / totalWeight
  );
  const verdict = veracityToVerdict(veracity);
  const agree = models.filter((m) => veracityToVerdict(m.veracity) === verdict).length;
  return { veracity, verdict, agree, total: models.length };
}

// ─────────────────────────────────────────────────────────────────────
// Evidence — the ACTUAL sources the system returns for this claim. Every
// `passage` and `context` is quoted verbatim from the source (not
// generated). The collapsed view shows the single most relevant sentence;
// expand reveals the surrounding context. `href` is the real URL.
//
// Note: the system returned the NOAA fact-check page as two retrieval
// chunks; they are merged here into one source for a cleaner display.
// ─────────────────────────────────────────────────────────────────────

export type EvidenceStance = "refutes" | "supports" | "context";

export type EnsembleEvidence = {
  id: string;
  title: string;
  source: string;
  /** Optional byline, when the source has one. */
  author?: string;
  /** Display URL (no scheme). */
  url: string;
  /** Full clickable URL. */
  href: string;
  relevance: number;
  stance: EvidenceStance;
  /** Which models cited this source — ties evidence back to the ensemble. */
  citedBy: string[];
  /** The single most relevant sentence, quoted verbatim. */
  passage: string;
  /** Surrounding context, quoted verbatim, shown on expand. */
  context: string;
};

export const ENSEMBLE_EVIDENCE: EnsembleEvidence[] = [
  {
    id: "rand",
    title: "Recent Hurricanes and Geoengineering",
    source: "RAND",
    author: "Emmi Yonekura",
    url: "rand.org/pubs/commentary/2024/10/recent-hurricanes-and-geoengineering.html",
    href: "https://www.rand.org/pubs/commentary/2024/10/recent-hurricanes-and-geoengineering.html",
    relevance: 0.94,
    stance: "refutes",
    citedBy: ["retrieval", "matching", "reasoner"],
    passage:
      "While both hurricanes wrought enormous damage in North Carolina, Georgia, and Florida, there is no evidence that points toward any government, or other entity, being involved in their creation.",
    context:
      "The recent back-to-back hurricanes that made landfall in the United States—Hurricane Helene on September 26 and Hurricane Milton on October 9—have sparked conspiracy theories about the government creating these disasters through geoengineering.\n\nWhile such theories are false, they have drawn attention to the risky idea of geoengineering, which typically refers to the large-scale, intentional manipulation of the earth's processes to modify weather.\n\nWhile both hurricanes wrought enormous damage in North Carolina, Georgia, and Florida, there is no evidence that points toward any government, or other entity, being involved in their creation.\n\nThe spread of misinformation about government involvement in disasters has become something of a trend lately.",
  },
  {
    id: "noaa",
    title: "Fact check: Debunking weather modification claims",
    source: "NOAA",
    url: "noaa.gov/news/fact-check-debunking-weather-modification-claims",
    href: "https://www.noaa.gov/news/fact-check-debunking-weather-modification-claims",
    relevance: 0.93,
    stance: "refutes",
    citedBy: ["retrieval", "stance", "matching"],
    passage:
      "No technology exists that can create, destroy, modify, strengthen or steer hurricanes in any way, shape or form.",
    context:
      "CLAIM: The government is creating, strengthening and/or steering hurricanes into specific communities.\n\nFACT: No technology exists that can create, destroy, modify, strengthen or steer hurricanes in any way, shape or form. All hurricanes, including Helene and Milton, are natural phenomena that form on their own due to aligning conditions of the ocean and atmosphere.\n\nCLAIM: Solar geoengineering made hurricanes Helene and Milton worse.\n\nFACT: Solar geoengineering, a theoretical practice which would modify the atmosphere to shade Earth's surface by reflecting sunlight back into space, is not taking place at scale anywhere in the world. Geoengineering did not impact hurricanes Helene and Milton, let alone make them worse. Record to near-record warm ocean temperatures across the Gulf of Mexico allowed hurricanes Helene and Milton to rapidly intensify. Natural steering currents in the upper atmosphere determine a storm's path.",
  },
  {
    id: "pbs",
    title:
      "Disinformation and conspiracy theories cloud Helene recovery efforts in hard-hit areas",
    source: "PBS News",
    url: "pbs.org/newshour/nation/disinformation-and-conspiracy-theories-cloud-helene-recovery-efforts",
    href: "https://www.pbs.org/newshour/nation/disinformation-and-conspiracy-theories-cloud-helene-recovery-efforts-in-hard-hit-areas",
    relevance: 0.88,
    stance: "refutes",
    citedBy: ["matching", "stance"],
    passage:
      "Bizarre stories proposing that the government used weather control technology to aim the hurricane at Republican voters quickly racked up millions of views on X and other platforms.",
    context:
      "A tale straight from science fiction asserts that Washington used weather control technology to steer Helene toward Republican voters in order to tilt the presidential election toward Democratic nominee Kamala Harris.\n\nRep. Marjorie Taylor Greene, R-Ga., endorsed the idea, posting Wednesday on X: “Yes they can control the weather. It's ridiculous for anyone to lie and say it can't be done.”\n\nFar-out tales of space lasers, fake snow and weather control technology — sometimes tinged with antisemitism — have spread after recent natural disasters, including a snowstorm in Texas and last year's wildfire in Maui.",
  },
  {
    id: "wiki-weather-mod",
    title: "Weather modification",
    source: "Wikipedia",
    url: "en.wikipedia.org/wiki/Weather_modification",
    href: "https://en.wikipedia.org/wiki/Weather_modification",
    relevance: 0.71,
    stance: "context",
    citedBy: ["reasoner"],
    passage:
      "Weather modification is the act of intentionally manipulating or altering the weather.",
    context:
      "The most common form of weather modification is cloud seeding, which increases rainfall or snowfall, usually for the purpose of increasing the local water supply. Weather modification can also have the goal of preventing damaging weather, such as hail or hurricanes, from occurring; or of provoking damaging weather against an enemy, as a tactic of military or economic warfare like Operation Popeye, where clouds were seeded to prolong the monsoon in Vietnam. Weather modification in warfare has been banned by the United Nations under the Environmental Modification Convention.\n\nWeather modification, along with climate engineering, is a recurring theme in conspiracy theories. The chemtrail conspiracy theory supposes that jet contrails are chemically altered to modify the weather and other phenomena. Other theories attempt to implicate scientific infrastructure such as the High-frequency Active Auroral Research Program (HAARP).",
  },
  {
    id: "wiki-helene",
    title: "Hurricane Helene",
    source: "Wikipedia",
    url: "en.wikipedia.org/wiki/Hurricane_Helene",
    href: "https://en.wikipedia.org/wiki/Hurricane_Helene",
    relevance: 0.66,
    stance: "context",
    citedBy: ["retrieval", "reasoner"],
    passage:
      "On October 9, researchers with World Weather Attribution concluded with “high confidence” that Helene was made worse by climate change.",
    context:
      "On October 9, researchers with World Weather Attribution concluded with “high confidence” that Helene was made worse by climate change.\n\nIn a scientific assessment, researchers found the 2.3 °F (1.3 °C) increase in temperatures due to climate change increased Helene's rainfall by 10% and maximum wind speeds by 11%, or 13.6 mph (22 km/h), as compared to a similar storm in prior cooler conditions.",
  },
];

/** Real product text — the system's one-line conclusion for this claim. */
export const RESULTS_SUMMARY = "Available evidence contradicts this claim.";

export const CLAIM_DISCLAIMER =
  "Disclaimer: This tool uses AI-powered analysis and external sources. However, errors can occur.";

export const STANCE_META: Record<
  EvidenceStance,
  { label: string; pill: string; dot: string; lane: string }
> = {
  refutes: {
    label: "Refutes the claim",
    pill: "bg-red-900/40 text-red-300 dark:bg-red-900/30 ring-1 ring-red-500/30",
    dot: "bg-red-400",
    lane: "Refutes",
  },
  supports: {
    label: "Supports the claim",
    pill: "bg-emerald-900/40 text-emerald-300 dark:bg-emerald-900/30 ring-1 ring-emerald-500/30",
    dot: "bg-emerald-400",
    lane: "Supports",
  },
  context: {
    label: "Adds context",
    pill: "bg-amber-900/40 text-amber-300 dark:bg-amber-900/30 ring-1 ring-amber-500/30",
    dot: "bg-amber-400",
    lane: "Context",
  },
};

```

## `components/lab/veracityShared.tsx`
_Shared UI used by both versions._

```tsx
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
  STANCE_META,
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
    <header className="flex items-center justify-end mb-5">
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

export function EvidencePassageCard({
  index,
  evidence,
}: {
  index: number;
  evidence: EnsembleEvidence;
}) {
  const [expanded, setExpanded] = useState(false);
  const stance = STANCE_META[evidence.stance];
  const relevancePct = Math.round(evidence.relevance * 100);

  return (
    <article className="bg-[#041E42] dark:bg-slate-900 text-white rounded-lg ring-1 ring-transparent dark:ring-slate-800 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 font-mono text-sm">
            {index}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold leading-snug">{evidence.title}</h3>
            <div className="text-xs text-slate-400 mt-1 truncate">
              {evidence.source}
              {evidence.author && (
                <span className="text-slate-300"> · {evidence.author}</span>
              )}
              <span className="mx-1.5 text-slate-600">·</span>
              <span className="font-mono">{evidence.url}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] uppercase tracking-wide text-slate-400">
              Relevance
            </div>
            <div className="font-mono text-sm text-white">{relevancePct}%</div>
            <div className="mt-1 w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#00B5E2]" style={{ width: `${relevancePct}%` }} />
            </div>
          </div>
        </div>

        {/* Stance + which models used it */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${stance.pill}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${stance.dot}`} />
            {stance.label}
          </span>
          <span className="text-[11px] text-slate-400">
            Cited by {evidence.citedBy.length} of 4 models
          </span>
        </div>

        {/* Key passage — the single most relevant sentence, quoted verbatim */}
        <div className="mt-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">
            Most relevant passage
          </div>
          <blockquote className="border-l-2 border-[#00B5E2]/60 pl-3 text-sm leading-relaxed text-slate-100">
            {evidence.passage}
          </blockquote>
          {expanded && (
            <div className="mt-3 pl-3 border-l-2 border-slate-700">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
                In context · quoted from {evidence.source}
              </div>
              <div className="space-y-2.5 text-sm leading-relaxed text-slate-300">
                {evidence.context.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
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
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────
// A small legend that makes "what is shown" explicit in the evidence area.
// ─────────────────────────────────────────────────────────────────────

export function EvidenceLegend({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-[11px] text-slate-500 dark:text-slate-400">
      <span className="inline-flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Refutes
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Context
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Supports
      </span>
      <span className="text-slate-400 dark:text-slate-500">
        · {count} sources, ranked by relevance · one passage each, expand for context
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// ClaimVerdictBanner — the big, unmistakable verdict block, mirroring the
// real product: a solid colored bar ("Verdict: Likely false") over a gray
// restatement bar ("TrueMedia.org verdict: likely false.").
// ─────────────────────────────────────────────────────────────────────

const BANNER: Record<ClaimVerdict, { bar: string; label: string; word: string }> = {
  "likely-false": { bar: "bg-[#E5341F]", label: "Likely false", word: "likely false" },
  "likely-true": { bar: "bg-emerald-600", label: "Likely true", word: "likely true" },
  unresolved: { bar: "bg-slate-500", label: "Unresolved", word: "unresolved" },
  mixed: { bar: "bg-amber-500", label: "Mixed evidence", word: "mixed evidence" },
};

export function ClaimVerdictBanner({
  verdict,
  isLoading,
}: {
  verdict: ClaimVerdict;
  isLoading: boolean;
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
      <div className="bg-slate-200 dark:bg-slate-800 text-[#041E42] dark:text-slate-200 px-5 py-3 text-sm md:text-base border-t border-black/10 dark:border-slate-700">
        TrueMedia.org verdict: <strong>{b.word}</strong>.
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
}: {
  isLoading: boolean;
  isModelDone: (m: FactCheckModel) => boolean;
  doneCount: number;
  showDetectors?: boolean;
  consensus?: { agree: number; total: number };
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
            Results Summary
          </div>
          {isLoading ? (
            <div className="text-lg">
              Analysis in progress
              <AnimatedDots />
            </div>
          ) : (
            <>
              <div className="text-lg">{RESULTS_SUMMARY}</div>
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
        {done && (
          <>
            <span
              className={`shrink-0 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded ${chip.bg}`}
            >
              {chip.label}
            </span>
            <span className="shrink-0 font-mono text-xs text-slate-500 dark:text-slate-400">
              {model.confidence}%
            </span>
          </>
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

```

## `components/lab/VeracityModelPanel.tsx`
_**Version A** — faithful near-replica._

```tsx
"use client";

import { HiOutlineLink } from "react-icons/hi2";
import {
  FACT_CHECK_MODELS,
  ENSEMBLE_EVIDENCE,
  aggregateEnsemble,
} from "./veracityEnsembleData";
import {
  useEnsembleSim,
  ClaimHeader,
  ClaimVerdictBanner,
  SubmittedTextPanel,
  BehindTheVerdictPanel,
  EvidencePassageCard,
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
      <ClaimHeader />

      <ClaimVerdictBanner verdict={agg.verdict} isLoading={isLoading} />

      {/* Hero */}
      <div className="grid md:grid-cols-2 gap-5">
        <SubmittedTextPanel text={text} isLoading={isLoading} phase={phase} />
        <BehindTheVerdictPanel
          isLoading={isLoading}
          isModelDone={isModelDone}
          doneCount={doneModels.length}
          showDetectors
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
          <div className="grid gap-3">
            {ENSEMBLE_EVIDENCE.map((e, i) => (
              <EvidencePassageCard key={e.id} index={i + 1} evidence={e} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

```

## `components/lab/VeracityConsensusSpectrum.tsx`
_**Version B** — consensus spectrum._

```tsx
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

```
