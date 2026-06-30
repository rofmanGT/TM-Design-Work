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
  HiOutlineShieldCheck,
  HiOutlineBeaker,
  HiOutlineCodeBracket,
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

// ─────────────────────────────────────────────────────────────────────
// Commercial sample — 6 detectors across 4 categories, mixed verdicts so
// the ensemble lands at "some evidence" (the state the user asked for).
// ─────────────────────────────────────────────────────────────────────

type CategorizedDetector = DetectorResult & {
  icon: React.ReactNode;
};

type Category = {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  detectors: CategorizedDetector[];
};

const commercialAnalysis = {
  fileName: "Senator_K_press_clip.mp4",
  caseId: "tm-2026-06-23-0118",
  source: { platform: "X (Twitter)", url: "x.com/example/status/…" },
  categories: [
    {
      id: "genai",
      name: "Generative AI",
      subtitle: "Signatures of GenAI tools",
      icon: <HiOutlineSparkles className="w-7 h-7" />,
      detectors: [
        {
          name: "General-Purpose Image Detector",
          icon: <HiOutlinePhoto className="w-5 h-5" />,
          confidence: 86,
          weight: 0.25,
        },
        {
          name: "Diffusion Fingerprint",
          icon: <HiOutlineFingerPrint className="w-5 h-5" />,
          confidence: 79,
          weight: 0.2,
        },
      ],
    },
    {
      id: "visual-noise",
      name: "Visual Noise",
      subtitle: "Variations in pixels and color",
      icon: <HiOutlinePhoto className="w-7 h-7" />,
      detectors: [
        {
          name: "Frequency-Domain Image Detector",
          icon: <HiOutlinePhoto className="w-5 h-5" />,
          confidence: 80,
          weight: 0.15,
        },
        {
          name: "Compression Artifact",
          icon: <HiOutlinePhoto className="w-5 h-5" />,
          confidence: 41,
          weight: 0.1,
        },
      ],
    },
    {
      id: "face",
      name: "Face Consistency",
      subtitle: "Face-swap and inpainting traces",
      icon: <HiOutlineFaceSmile className="w-7 h-7" />,
      detectors: [
        {
          name: "Boundary Inconsistency",
          icon: <HiOutlineFaceSmile className="w-5 h-5" />,
          confidence: 64,
          weight: 0.15,
        },
      ],
    },
    {
      id: "provenance",
      name: "Provenance",
      subtitle: "Chain-of-custody checks",
      icon: <HiOutlineShieldCheck className="w-7 h-7" />,
      detectors: [
        {
          name: "Content Credentials (C2PA)",
          icon: <HiOutlineShieldCheck className="w-5 h-5" />,
          confidence: 35,
          weight: 0.15,
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
// Simulation timing — split into two phases:
//   1. Download phase ("Waiting for media download…") — scales with media
//      type. Video uploads take meaningfully longer than images.
//   2. Analysis phase — relative detector offsets, same regardless of type.
// Total time = downloadMs + max(analysis offsets).
// ─────────────────────────────────────────────────────────────────────

const DOWNLOAD_MS_BY_TYPE: Record<string, number> = {
  image: 1500,
  audio: 3500,
  video: 9000,
  url: 3000, // URL submissions — backend has to fetch from the platform first
};

// Each detector's completion offset measured from the END of the download phase.
const DETECTOR_OFFSETS_MS: Record<string, number> = {
  "Content Credentials (C2PA)": 700,
  "Compression Artifact": 2000,
  "Frequency-Domain Image Detector": 2900,
  "General-Purpose Image Detector": 3700,
  "Diffusion Fingerprint": 4400,
  "Boundary Inconsistency": 5000,
};

const ANALYSIS_TOTAL_MS = Math.max(...Object.values(DETECTOR_OFFSETS_MS));

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────

export function CommercialAnalysisPage() {
  const search = useSearchParams();
  const fresh = search.get("fresh") === "1";

  // Pick download duration by media type. URL submissions default to "url".
  // Uploads pass type=image|video|audio from the Query page.
  const mediaType = search.get("type") ?? (search.get("url") ? "url" : "image");
  const downloadMs = DOWNLOAD_MS_BY_TYPE[mediaType] ?? DOWNLOAD_MS_BY_TYPE.url;
  const detectorCompleteTimes: Record<string, number> = Object.fromEntries(
    Object.entries(DETECTOR_OFFSETS_MS).map(([name, off]) => [name, downloadMs + off])
  );
  const totalMs = downloadMs + ANALYSIS_TOTAL_MS;

  const [elapsed, setElapsed] = useState(fresh ? 0 : totalMs + 1);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    if (!fresh) return;
    let raf = 0;
    function tick() {
      const e = Date.now() - startedAt.current;
      setElapsed(e);
      if (e < totalMs + 1500) {
        raf = requestAnimationFrame(tick);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fresh, totalMs]);

  // Live detector list — when fresh, override verdict to "pending" until each completes.
  const liveCategories = useMemo(() => {
    if (!fresh || elapsed >= totalMs) return commercialAnalysis.categories;
    return commercialAnalysis.categories.map((cat) => ({
      ...cat,
      detectors: cat.detectors.map((d) => {
        const completeAt = detectorCompleteTimes[d.name] ?? totalMs;
        const done = elapsed >= completeAt;
        return done ? d : { ...d, verdict: "pending" as Verdict };
      }),
    }));
  }, [fresh, elapsed, totalMs, detectorCompleteTimes]);

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

  // Loading phase mirrors TrueMedia's two-stage banner copy.
  const loadingPhase: "download" | "analyses" | null = !fresh
    ? null
    : elapsed < downloadMs
      ? "download"
      : activeCount < liveDetectors.length
        ? "analyses"
        : null;

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
                <h1 className="text-3xl font-bold leading-none">Is this Real?</h1>
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
                  confidence={d.confidence}
                  verdict={d.verdict}
                  weight={d.weight}
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
