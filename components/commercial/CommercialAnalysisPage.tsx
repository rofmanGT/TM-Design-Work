"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  HiOutlineSparkles,
  HiOutlinePhoto,
  HiOutlineInformationCircle,
  HiOutlineArrowUpTray,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineTrash,
  HiOutlineShare,
  HiOutlineArrowDownTray,
  HiOutlineLink,
  HiOutlineEllipsisHorizontal,
  HiOutlineChevronRight,
  HiOutlineFingerPrint,
  HiOutlineFaceSmile,
  HiOutlineBeaker,
  HiOutlineCodeBracket,
  HiOutlineChartBarSquare,
  HiOutlineFilm,
  HiOutlineMicrophone,
  HiOutlineMusicalNote,
  HiOutlineChatBubbleBottomCenterText,
} from "react-icons/hi2";
import {
  EnsembleGauge,
  DetectorCard,
  VERDICT_STYLES,
  verdictFromConfidence,
  ensembleConfidence,
  type Verdict,
  type DetectorResult,
  type CategoryRow,
} from "@/components/ensemble";
import { REAL_DETECTORS, REAL_CATEGORIES } from "@/components/real/realData";

// ─────────────────────────────────────────────────────────────────────
// REAL detector roster for a video-with-audio case. Names, descriptions,
// and category taxonomy come verbatim from the production repo via
// realData.ts (model-processors/*.ts). Confidence scores remain
// illustrative — real scores are per-analysis and live in their DB.
// Weights are intentionally omitted: the real ensemble aggregates by
// votes (include=1, trust=2), not fractional weights.
// ─────────────────────────────────────────────────────────────────────

type CategorizedDetector = DetectorResult & {
  icon: React.ReactNode;
  description?: string;
};

type Category = {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  detectors: CategorizedDetector[];
};

const rd = (key: string) => {
  const d = REAL_DETECTORS.find((d) => d.key === key);
  if (!d) throw new Error(`Unknown real detector: ${key}`);
  return d;
};

const commercialAnalysis = {
  fileName: "Senator_K_press_clip.mp4",
  caseId: "tm-2026-06-23-0118",
  source: { platform: "X (Twitter)", url: "x.com/example/status/…" },
  categories: [
    {
      id: "face",
      name: REAL_CATEGORIES.face.label,
      subtitle: REAL_CATEGORIES.face.descrip,
      icon: <HiOutlineFaceSmile className="w-7 h-7" />,
      detectors: [
        {
          name: rd("genconvit").name,
          description: rd("genconvit").descrip,
          icon: <HiOutlineFaceSmile className="w-5 h-5" />,
          confidence: 72,
        },
        {
          name: rd("sensity-face").name,
          description: rd("sensity-face").descrip,
          icon: <HiOutlineFingerPrint className="w-5 h-5" />,
          confidence: 64,
        },
      ],
    },
    {
      id: "imagen",
      name: REAL_CATEGORIES.imagen.label,
      subtitle: REAL_CATEGORIES.imagen.descrip,
      icon: <HiOutlineSparkles className="w-7 h-7" />,
      detectors: [
        {
          name: rd("hive-video").name,
          description: rd("hive-video").descrip,
          icon: <HiOutlineFilm className="w-5 h-5" />,
          confidence: 81,
        },
      ],
    },
    {
      id: "audio",
      name: REAL_CATEGORIES.audio.label,
      subtitle: REAL_CATEGORIES.audio.descrip,
      icon: <HiOutlineMicrophone className="w-7 h-7" />,
      detectors: [
        {
          name: rd("wav2vec2").name,
          description: rd("wav2vec2").descrip,
          icon: <HiOutlineMicrophone className="w-5 h-5" />,
          confidence: 86,
        },
        {
          name: rd("dftotal").name,
          description: rd("dftotal").descrip,
          icon: <HiOutlineMusicalNote className="w-5 h-5" />,
          confidence: 79,
        },
        {
          name: rd("loccus").name,
          description: rd("loccus").descrip,
          icon: <HiOutlineMusicalNote className="w-5 h-5" />,
          confidence: 74,
        },
      ],
    },
    {
      id: "semantic",
      name: REAL_CATEGORIES.semantic.label,
      subtitle: REAL_CATEGORIES.semantic.descrip,
      icon: <HiOutlineChatBubbleBottomCenterText className="w-7 h-7" />,
      detectors: [
        {
          name: rd("openai-transcript").name,
          description: rd("openai-transcript").descrip,
          icon: <HiOutlineChatBubbleBottomCenterText className="w-5 h-5" />,
          confidence: 41,
        },
      ],
    },
  ] as Category[],
  details: {
    fileType: "MP4",
    fileSize: "8.2 MB",
    processingTime: "4m 8s",
    analyzedOn: "Tue, Jun 23, 2026",
    ensembleVersion: "v2.3.1",
    // Performance-context label (Georgetown label-design exploration, Idea 4):
    // published benchmark + calibration metrics for this ensemble version.
    benchmark: "Deepfake-Eval-2024",
    benchmarkAuc: "0.81",
    benchmarkFpr: "0.12",
  },
};

const allDetectors: DetectorResult[] = commercialAnalysis.categories.flatMap((c) =>
  c.detectors.map((d) => ({
    name: d.name,
    confidence: d.confidence,
    verdict: d.verdict,
    weight: d.weight,
  }))
);

// ─────────────────────────────────────────────────────────────────────
// Simulation timing — the upload/fetch already finished on
// /media/uploading before we arrive here, so this page only runs the
// detector phase: each entry is the elapsed ms at which that detector's
// result lands. Keys must match the roster names above.
// ─────────────────────────────────────────────────────────────────────

const FRESH_TIMING: Record<string, number> = {
  [rd("openai-transcript").name]: 700,
  [rd("wav2vec2").name]: 1600,
  [rd("dftotal").name]: 2400,
  [rd("loccus").name]: 3100,
  [rd("hive-video").name]: 3900,
  [rd("sensity-face").name]: 4500,
  [rd("genconvit").name]: 5000,
};

const FRESH_TOTAL_MS = Math.max(...Object.values(FRESH_TIMING));

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────

export function CommercialAnalysisPage() {
  const search = useSearchParams();
  const fresh = search.get("fresh") === "1";

  // Pick download duration by media type. URL submissions default to "url".
  // Uploads pass type=image|video|audio from the Query page.
  const [elapsed, setElapsed] = useState(fresh ? 0 : FRESH_TOTAL_MS + 1);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    if (!fresh) return;
    let raf = 0;
    function tick() {
      const e = Date.now() - startedAt.current;
      setElapsed(e);
      if (e < FRESH_TOTAL_MS + 1500) {
        raf = requestAnimationFrame(tick);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fresh]);

  // Live detector list — when fresh, override verdict to "pending" until each completes.
  const liveCategories = useMemo(() => {
    if (!fresh || elapsed >= FRESH_TOTAL_MS) return commercialAnalysis.categories;
    return commercialAnalysis.categories.map((cat) => ({
      ...cat,
      detectors: cat.detectors.map((d) => {
        const completeAt = FRESH_TIMING[d.name] ?? FRESH_TOTAL_MS;
        const done = elapsed >= completeAt;
        return done ? d : { ...d, verdict: "pending" as Verdict };
      }),
    }));
  }, [fresh, elapsed]);

  const liveDetectors: DetectorResult[] = liveCategories.flatMap((c) =>
    c.detectors.map((d) => ({
      name: d.name,
      confidence: d.confidence,
      verdict: d.verdict,
      weight: d.weight,
    }))
  );

  // Category-level rollup for the gauge's summary table.
  const liveCategoryRows: CategoryRow[] = liveCategories.map((c) => ({
    id: c.id,
    name: c.name,
    detectorCount: c.detectors.length,
    verdict: ensembleConfidence(c.detectors).verdict,
  }));

  const { confidence, verdict, agreeingCount, activeCount } = ensembleConfidence(liveDetectors);

  // Upload/fetch already happened on /media/uploading — only the analyses
  // phase remains here.
  const loadingPhase: "download" | "analyses" | null =
    !fresh ? null : activeCount < liveDetectors.length ? "analyses" : null;

  const peakConfidence = liveDetectors
    .filter((d) => d.verdict !== "pending")
    .reduce((m, d) => Math.max(m, d.confidence), 0);
  const peakVerdict = verdictFromConfidence(peakConfidence);
  const frameBg = loadingPhase ? "bg-slate-600" : VERDICT_STYLES[peakVerdict].frame;
  const frameLabel = loadingPhase
    ? "Analysis in progress"
    : VERDICT_STYLES[peakVerdict].label + " of Manipulation";

  return (
    <main className="bg-white dark:bg-slate-950 text-[#041E42] dark:text-slate-100 min-h-screen p-5 md:p-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
        <a href="/" className="hover:text-[#041E42] dark:hover:text-slate-100">
          Verify Media
        </a>
        <HiOutlineChevronRight className="w-3 h-3" />
        <a
          href="/media/history"
          className="hover:text-[#041E42] dark:hover:text-slate-100"
        >
          Analyses
        </a>
        <HiOutlineChevronRight className="w-3 h-3" />
        <span className="text-[#041E42] dark:text-slate-100 font-medium font-mono">
          {commercialAnalysis.caseId}
        </span>
      </nav>

      <section className="bg-[#041E42] dark:bg-slate-900 text-white p-5 rounded-lg ring-1 ring-transparent dark:ring-slate-800">
              <div className="flex items-end justify-between mb-5 gap-3 flex-wrap">
                <h1 className="text-3xl font-bold tracking-tight leading-none">Is this Real?</h1>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                  {commercialAnalysis.details.ensembleVersion} · calibrated Mar 2026
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {/* Image + below-image rich content */}
                <div className="flex flex-col gap-3">
                  <div className={`${frameBg} rounded-lg p-1`}>
                    <div className="text-center text-white font-bold py-1 text-sm">
                      {frameLabel}
                    </div>
                    <div className="bg-slate-700 rounded-md h-60 flex items-center justify-center text-slate-400 text-xs">
                      [ uploaded media ]
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-300 text-[11px] font-semibold px-2 py-1 rounded-full min-w-0">
                      <HiOutlineArrowUpTray className="w-3 h-3 shrink-0" />
                      <span className="truncate">{commercialAnalysis.fileName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IconButton label="Share">
                        <HiOutlineShare className="w-4 h-4" />
                      </IconButton>
                      <IconButton label="Download report">
                        <HiOutlineArrowDownTray className="w-4 h-4" />
                      </IconButton>
                      <IconButton label="Copy link">
                        <HiOutlineLink className="w-4 h-4" />
                      </IconButton>
                      <IconButton label="More">
                        <HiOutlineEllipsisHorizontal className="w-4 h-4" />
                      </IconButton>
                    </div>
                  </div>

                  <dl className="bg-slate-800/50 rounded-md px-3 py-2.5 text-xs grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
                    <dt className="text-slate-400">Source</dt>
                    <dd className="text-white">
                      {commercialAnalysis.source.platform}
                      {commercialAnalysis.source.url && (
                        <span className="text-slate-400 ml-1.5 font-mono">
                          {commercialAnalysis.source.url}
                        </span>
                      )}
                    </dd>
                    <dt className="text-slate-400">File</dt>
                    <dd className="text-white font-mono">
                      {commercialAnalysis.details.fileType} ·{" "}
                      {commercialAnalysis.details.fileSize}
                    </dd>
                    <dt className="text-slate-400">Analyzed</dt>
                    <dd className="text-white">
                      {commercialAnalysis.details.analyzedOn}{" "}
                      <span className="text-slate-400 font-mono">
                        · {commercialAnalysis.details.processingTime}
                      </span>
                    </dd>
                    <dt className="text-slate-400">Case ID</dt>
                    <dd className="text-white font-mono">{commercialAnalysis.caseId}</dd>
                  </dl>
                </div>

                {/* Right: EnsembleGauge — accepts loading phase + live data */}
                <div className="flex flex-col gap-3.5">
                  <EnsembleGauge
                    detectors={liveDetectors}
                    showBreakdown={false}
                    categoryRows={liveCategoryRows}
                    loadingPhase={loadingPhase}
                  />
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Disclaimer: TrueMedia.org uses state-of-the-art academic AI methods. However,
                    errors can occur. Results are not legal proof of manipulation.
                  </p>
                  <a
                    href="#"
                    className="text-xs text-[#00B5E2] hover:underline self-start"
                  >
                    Read full ensemble methodology →
                  </a>
                </div>
              </div>
            </section>

      {/* CATEGORIES — horizontal flex-wrap (stacks left→right at wide screens, wraps below) */}
      <div className="mt-10 flex flex-wrap gap-6">
        {liveCategories.map((cat) => (
          <section
            key={cat.id}
            className="flex-1 min-w-[280px] flex flex-col"
          >
            <div className="flex items-center gap-2 text-lg font-bold text-[#041E42] dark:text-slate-100 mb-1">
              <span className="[&>svg]:w-5 [&>svg]:h-5">{cat.icon}</span>
              {cat.name}
              <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold px-1.5 py-0.5 rounded">
                {cat.detectors.length}
              </span>
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-xs mb-3 ml-7">
              {cat.subtitle}
            </div>
            <div className="flex flex-col gap-3">
              {cat.detectors.map((d) => (
                <DetectorCard
                  key={d.name}
                  name={d.name}
                  description={d.description}
                  confidence={d.confidence}
                  verdict={d.verdict}
                  icon={d.icon}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* DETAILS — always its own row below the categories */}
      <section className="mt-10">
        <div className="flex items-center gap-2 text-lg font-bold text-[#041E42] dark:text-slate-100 mb-3">
          <HiOutlineInformationCircle className="w-5 h-5" />
          Details
        </div>
        <div className="bg-[#041E42] dark:bg-slate-900 text-white rounded-lg px-5 py-4 ring-1 ring-transparent dark:ring-slate-800 flex flex-wrap items-center gap-x-8 gap-y-4">
          <DetailRow
            icon={<HiOutlinePhoto />}
            label="File type"
            value={`${commercialAnalysis.details.fileType} · ${commercialAnalysis.details.fileSize}`}
          />
          <DetailRow
            icon={<HiOutlineClock />}
            label="Processing time"
            value={commercialAnalysis.details.processingTime}
          />
          <DetailRow
            icon={<HiOutlineCalendar />}
            label="Analyzed on"
            value={commercialAnalysis.details.analyzedOn}
          />
          <DetailRow
            icon={<HiOutlineInformationCircle />}
            label="Ensemble version"
            value={commercialAnalysis.details.ensembleVersion}
            mono
          />
          <DetailRow
            icon={<HiOutlineChartBarSquare />}
            label={`Benchmark · ${commercialAnalysis.details.benchmark}`}
            value={`AUC ${commercialAnalysis.details.benchmarkAuc} · FPR ${commercialAnalysis.details.benchmarkFpr}`}
            mono
          />
          <button
            className="ml-auto bg-transparent text-red-400 border border-red-400 hover:text-white hover:bg-red-500 transition text-sm px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 shrink-0"
            onClick={() => alert("Delete confirmation would open here.")}
            title="Delete this analysis from your history"
          >
            <HiOutlineTrash className="w-4 h-4" /> Delete
          </button>
        </div>
      </section>

      {/* TRANSPARENCY & REPRODUCIBILITY — open-science provenance for the verdict */}
      <section className="mt-6">
        <div className="flex items-center gap-2 text-lg font-bold text-[#041E42] dark:text-slate-100 mb-3">
          <HiOutlineBeaker className="w-5 h-5" />
          Transparency &amp; reproducibility
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 px-5 py-4">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <ReproStat
              label="Models in ensemble"
              value={`${allDetectors.length} detectors`}
            />
            <ReproStat label="Aggregation" value="Weighted mean of scores" />
            <ReproStat
              label="Ensemble version"
              value={commercialAnalysis.details.ensembleVersion}
              mono
            />
            <ReproStat label="Calibrated" value="Mar 2026" />
            <div className="ml-auto flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#00B5E2]/15 text-[#0883a3] dark:text-[#33D6FF] ring-1 ring-[#00B5E2]/30">
                <HiOutlineCodeBracket className="w-3.5 h-3.5" />
                Open methodology
              </span>
              <a
                href="#"
                className="text-xs text-[#00B5E2] hover:underline whitespace-nowrap"
              >
                Model cards &amp; weights →
              </a>
            </div>
          </div>
          <p className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            Each detector&rsquo;s score and ensemble weight are listed above. The
            headline probability is their weighted mean — every input to the
            verdict is shown, so the result can be independently reproduced.
          </p>
        </div>
      </section>
    </main>
  );
}

function ReproStat({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-0.5">
        {label}
      </div>
      <div
        className={`text-sm text-[#041E42] dark:text-slate-100 font-medium ${mono ? "font-mono" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

function IconButton({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      title={label}
      aria-label={label}
      className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded transition"
    >
      {children}
    </button>
  );
}

function DetailRow({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-slate-400 [&>svg]:w-5 [&>svg]:h-5 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-400 uppercase tracking-wide">{label}</div>
        <div className={`text-sm text-white truncate ${mono ? "font-mono" : ""}`}>{value}</div>
      </div>
    </div>
  );
}
