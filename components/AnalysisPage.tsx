"use client";

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
} from "react-icons/hi2";
import {
  EnsembleGauge,
  DetectorCard,
  VERDICT_STYLES,
  ensembleConfidence,
  verdictFromConfidence,
  type Verdict,
  type DetectorResult,
  type CategoryRow,
} from "@/components/ensemble";

// ─────────────────────────────────────────────────────────────────────
// Sample data
// ─────────────────────────────────────────────────────────────────────

type AnalysisDetector = DetectorResult & {
  icon: React.ReactNode;
};

type Category = {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  detectors: AnalysisDetector[];
};

const analysisData = {
  fileName: "Screenshot 2026-05-17 at 4.00.15 PM.png",
  source: { platform: "Upload", url: null as string | null },
  caseId: "tm-2026-06-23-0042",
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
          confidence: 56,
          weight: 0.3,
        },
        {
          name: "Diffusion Fingerprint",
          icon: <HiOutlineFingerPrint className="w-5 h-5" />,
          confidence: 64,
          weight: 0.25,
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
          confidence: 51,
          weight: 0.25,
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
          confidence: 78,
          weight: 0.2,
        },
      ],
    },
  ] as Category[],
  details: {
    fileType: "PNG",
    fileSize: "714 KB",
    processingTime: "4m 8s",
    analyzedOn: "Tue, Jun 23, 2026",
    ensembleVersion: "v2.3.1",
  },
};

const allDetectors = analysisData.categories.flatMap((c) => c.detectors);

// Category-level rollup for the summary table in the gauge card.
const categoryRows: CategoryRow[] = analysisData.categories.map((c) => ({
  id: c.id,
  name: c.name,
  detectorCount: c.detectors.length,
  verdict: ensembleConfidence(c.detectors).verdict,
}));

// ─────────────────────────────────────────────────────────────────────
// Hero — image + EnsembleGauge
// ─────────────────────────────────────────────────────────────────────

function Breadcrumbs() {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
      <a href="/" className="hover:text-[#041E42] dark:hover:text-slate-100">
        Analyses
      </a>
      <HiOutlineChevronRight className="w-3 h-3" />
      <span className="text-[#041E42] dark:text-slate-100 font-medium font-mono">
        {analysisData.caseId}
      </span>
    </nav>
  );
}

function VerdictHero() {
  const peakConfidence = allDetectors.reduce((m, d) => Math.max(m, d.confidence), 0);
  const peakVerdict: Verdict = verdictFromConfidence(peakConfidence);
  const frameBg = VERDICT_STYLES[peakVerdict].frame;
  const verdictLabel = VERDICT_STYLES[peakVerdict].label + " of Manipulation";

  return (
    <section className="relative bg-[#041E42] dark:bg-slate-900 text-white p-5 rounded-lg overflow-hidden ring-1 ring-transparent dark:ring-slate-800">
      <div className="flex items-end justify-between mb-5 gap-3 flex-wrap">
        <h1 className="text-3xl font-bold tracking-tight leading-none">Is this Real?</h1>
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">
          {analysisData.details.ensembleVersion} · calibrated Mar 2026
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Left: image + rich below-image content */}
        <div className="flex flex-col gap-3">
          <div className={`${frameBg} rounded-lg p-1`}>
            <div className="text-center text-white font-bold py-1 text-sm">{verdictLabel}</div>
            <div className="bg-slate-700 rounded-md h-60 flex items-center justify-center text-slate-400 text-xs">
              [ uploaded media ]
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 bg-slate-900/60 text-slate-300 text-[11px] font-semibold px-2 py-1 rounded-full min-w-0">
              <HiOutlineArrowUpTray className="w-3 h-3 shrink-0" />
              <span className="truncate">{analysisData.fileName}</span>
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

          <dl className="bg-slate-900/40 rounded-md px-3 py-2.5 text-xs grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
            <dt className="text-slate-400">Source</dt>
            <dd className="text-white">{analysisData.source.platform}</dd>
            <dt className="text-slate-400">File</dt>
            <dd className="text-white font-mono">
              {analysisData.details.fileType} · {analysisData.details.fileSize}
            </dd>
            <dt className="text-slate-400">Analyzed</dt>
            <dd className="text-white">
              {analysisData.details.analyzedOn}{" "}
              <span className="text-slate-400 font-mono">
                · {analysisData.details.processingTime}
              </span>
            </dd>
            <dt className="text-slate-400">Case ID</dt>
            <dd className="text-white font-mono">{analysisData.caseId}</dd>
          </dl>
        </div>

        {/* Right: gauge-based ensemble (breakdown lives below in the category sections) */}
        <div className="flex flex-col gap-3.5">
          <EnsembleGauge
            detectors={allDetectors}
            showBreakdown={false}
            categoryRows={categoryRows}
          />
          <p className="text-slate-400 text-xs leading-relaxed">
            Disclaimer: TrueMedia.org uses state-of-the-art academic AI methods. However, errors
            can occur. Results are not legal proof of manipulation.
          </p>
          <a
            href="#"
            className="text-xs text-[#00B5E2] hover:text-[#33D6FF] hover:underline self-start"
          >
            Read full ensemble methodology →
          </a>
        </div>
      </div>
    </section>
  );
}

function IconButton({ children, label }: { children: React.ReactNode; label: string }) {
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

// ─────────────────────────────────────────────────────────────────────
// Category section — wraps detector cards. Designed to live inside the
// horizontal flex-wrap layout below the hero.
// ─────────────────────────────────────────────────────────────────────

function CategorySection({ category }: { category: Category }) {
  return (
    <section className="flex-1 min-w-[280px] flex flex-col">
      <div className="flex items-center gap-2 text-lg font-bold text-[#041E42] dark:text-slate-100 mb-1">
        <span className="[&>svg]:w-5 [&>svg]:h-5">{category.icon}</span>
        {category.name}
        <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold px-1.5 py-0.5 rounded">
          {category.detectors.length}
        </span>
      </div>
      <div className="text-slate-600 dark:text-slate-400 text-xs mb-3 ml-7">
        {category.subtitle}
      </div>
      <div className="flex flex-col gap-3 ml-0">
        {category.detectors.map((d) => (
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
  );
}

// ─────────────────────────────────────────────────────────────────────
// Details — compact card for the horizontal row.
// ─────────────────────────────────────────────────────────────────────

function DetailsCard() {
  const d = analysisData.details;
  return (
    <section>
      <div className="flex items-center gap-2 text-lg font-bold text-[#041E42] dark:text-slate-100 mb-3">
        <HiOutlineInformationCircle className="w-5 h-5" />
        Details
      </div>

      <div className="bg-[#041E42] dark:bg-slate-900 text-white rounded-lg px-5 py-4 ring-1 ring-transparent dark:ring-slate-800 flex flex-wrap items-center gap-x-8 gap-y-4">
        <DetailRow
          icon={<HiOutlinePhoto />}
          label="File type"
          value={`${d.fileType} · ${d.fileSize}`}
        />
        <DetailRow icon={<HiOutlineClock />} label="Processing time" value={d.processingTime} />
        <DetailRow icon={<HiOutlineCalendar />} label="Analyzed on" value={d.analyzedOn} />
        <DetailRow
          icon={<HiOutlineInformationCircle />}
          label="Ensemble version"
          value={d.ensembleVersion}
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
    <div className="flex items-center gap-3 min-w-0">
      <span className="text-slate-400 [&>svg]:w-5 [&>svg]:h-5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] text-slate-400 uppercase tracking-wide whitespace-nowrap">
          {label}
        </div>
        <div className={`text-sm text-white truncate ${mono ? "font-mono" : ""}`}>{value}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Page composition
// ─────────────────────────────────────────────────────────────────────

export default function AnalysisPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-[#041E42] dark:text-slate-100 p-5 md:p-8 transition-colors">
      <Breadcrumbs />
      <VerdictHero />

      {/* Category row — flex-wraps horizontally at wide screens, stacks at narrow. */}
      <div className="mt-10 flex flex-wrap gap-6">
        {analysisData.categories.map((cat) => (
          <CategorySection key={cat.id} category={cat} />
        ))}
      </div>

      {/* Details — always its own row, stretches full width */}
      <div className="mt-10">
        <DetailsCard />
      </div>
    </main>
  );
}
