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
