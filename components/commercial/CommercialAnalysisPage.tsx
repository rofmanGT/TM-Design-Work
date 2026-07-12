"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  HiOutlinePhoto,
  HiOutlineInformationCircle,
  HiOutlineArrowUpTray,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineTrash,
  HiOutlineShare,
  HiOutlineArrowDownTray,
  HiOutlineLink,
  HiOutlineCheck,
  HiOutlineChevronRight,
  HiOutlineFaceSmile,
  HiOutlineMicrophone,
  HiOutlineMusicalNote,
} from "react-icons/hi2";
import {
  EnsembleGauge,
  DetectorCard,
  VERDICT_STYLES,
  verdictFromConfidence,
  ensembleConfidence,
  type Verdict,
  type DetectorResult,
} from "@/components/ensemble";
import { REAL_DETECTORS, REAL_VERDICTS } from "@/components/real/realData";
import { TM_DISCLAIMER } from "@/components/shared/disclaimer";

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
  /** Model-backbone tag shown as a small chip on the card (disambiguates
      the two "Audio Analysis" models). */
  tag?: string;
};

const rd = (key: string) => {
  const d = REAL_DETECTORS.find((d) => d.key === key);
  if (!d) throw new Error(`Unknown real detector: ${key}`);
  return d;
};

type MediaKind = "image" | "video" | "audio";

type AnalysisView = {
  fileName: string;
  caseId: string;
  heroImage: string;
  /** Audio waveform is letterboxed on a light plate rather than cropped. */
  heroContain?: boolean;
  source: { platform: string; url: string };
  fileType: string;
  fileSize: string;
  /** The models that actually run for this media type. The team currently
      ships two in-house models per stream, so each view lists exactly two. */
  detectors: CategorizedDetector[];
};

// Terse builder that pulls real names + descriptions from realData.
const det = (
  key: string,
  confidence: number,
  icon: React.ReactNode,
  tag?: string
): CategorizedDetector => ({
  name: rd(key).name,
  description: rd(key).descrip,
  confidence,
  icon,
  tag,
});

const FaceI = <HiOutlineFaceSmile className="w-5 h-5" />;
const NoiseI = <HiOutlinePhoto className="w-5 h-5" />;
const MicI = <HiOutlineMicrophone className="w-5 h-5" />;

// This demo reuses one documented example per media type (no real uploads
// yet), so a top-right toggle previews each view. Each view lists the two
// in-house models that actually run for that media stream — DIRE + FIRE for
// images, Wav2vec2 + Wav2vec2-TRILLsson for audio, and (for video) the
// visual frame model plus the audio-track model.
const MEDIA_VIEWS: Record<MediaKind, AnalysisView> = {
  image: {
    // Xóchitl Gálvez flag image — documented manipulation (RestOfWorld).
    fileName: "galvez_flag_manipulated.jpg",
    caseId: "tm-2026-06-23-0091",
    heroImage: "/real/cases/pf8gnScszm1EmkrCb1EuIVX_tLg.jpg",
    source: { platform: "X (Twitter)", url: "restofworld.org/…" },
    fileType: "JPG",
    fileSize: "1.2 MB",
    detectors: [
      det("dire", 66, NoiseI, "DIRE"),
      det("fire", 71, NoiseI, "FIRE"),
    ],
  },
  video: {
    // Kim Jong Un PSA — documented deepfake (RepresentUs campaign).
    fileName: "kim_jong_un_deepfake.mp4",
    caseId: "tm-2026-06-23-0118",
    heroImage: "/real/cases/PWfMimqFyAVS3lMocRqWBQYpPC8.jpg",
    source: { platform: "Awareness campaign", url: "act.represent.us/…" },
    fileType: "MP4",
    fileSize: "8.2 MB",
    detectors: [
      det("genconvit", 72, FaceI, "GenConViT"),
      det("wav2vec2", 86, MicI, "wav2vec2"),
    ],
  },
  audio: {
    // Biden New Hampshire robocall — documented AI voice clone (AP).
    fileName: "biden_robocall_nh.wav",
    caseId: "tm-2026-06-23-0057",
    heroImage: "/waveform.jpeg",
    heroContain: true,
    source: { platform: "Robocall", url: "apnews.com/…" },
    fileType: "WAV",
    fileSize: "2.4 MB",
    detectors: [
      det("wav2vec2", 86, MicI, "wav2vec2"),
      det("wav2vec2trill", 82, MicI, "wav2vec2-TRILLsson"),
    ],
  },
};

const SHARED_DETAILS = {
  processingTime: "4m 8s",
  analyzedOn: "Tue, Jun 23, 2026",
  ensembleVersion: "v2.3.1",
  calibrated: "Mar 2026",
};

// Video is deliberately not offered yet — this version doesn't process
// video (see the home-page note); the view data stays defined for later.
const MEDIA_TABS: { kind: MediaKind; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { kind: "image", label: "Image", Icon: HiOutlinePhoto },
  { kind: "audio", label: "Audio", Icon: HiOutlineMusicalNote },
];

// Per-detector completion offsets (ms) for the analyses phase, staggered by
// position so the stream feels natural. Keyed by index (the two audio
// models share a display name, so a name-keyed map would collide).
function timingFor(detectors: CategorizedDetector[]): { map: number[]; total: number } {
  const map = detectors.map((_, i) => 700 + i * 550);
  const total = Math.max(...map, 700);
  return { map, total };
}

// ── Hero action handlers (client-only) ──────────────────────────────
// Share: native share sheet where available, else copy the permalink.
function shareAnalysis() {
  if (typeof window === "undefined") return;
  const url = window.location.href;
  const data = {
    title: "TrueMedia.org analysis",
    text: "TrueMedia.org media-authenticity analysis",
    url,
  };
  if (navigator.share) {
    navigator.share(data).catch(() => {});
  } else {
    navigator.clipboard?.writeText(url);
  }
}

// Download: the whole result page, via the browser's print-to-PDF dialog.
function downloadReport() {
  if (typeof window !== "undefined") window.print();
}

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────

export function CommercialAnalysisPage() {
  const search = useSearchParams();
  const fresh = search.get("fresh") === "1";

  // Media-type preview toggle (demo affordance; defaults to the ?type= param).
  // Video isn't offered in this version, so anything else lands on image.
  const urlType = search.get("type");
  const [mediaView, setMediaView] = useState<MediaKind>(
    urlType === "audio" ? "audio" : "image"
  );
  const view = MEDIA_VIEWS[mediaView];
  const { map: freshTiming, total: freshTotalMs } = useMemo(
    () => timingFor(view.detectors),
    [view]
  );

  const [elapsed, setElapsed] = useState(fresh ? 0 : freshTotalMs + 1);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    if (!fresh) return;
    let raf = 0;
    function tick() {
      const e = Date.now() - startedAt.current;
      setElapsed(e);
      if (e < freshTotalMs + 1500) {
        raf = requestAnimationFrame(tick);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fresh, freshTotalMs]);

  // Live detector cards — when fresh, override verdict to "pending" until each completes.
  const liveDetectorCards = useMemo(() => {
    if (!fresh || elapsed >= freshTotalMs) return view.detectors;
    return view.detectors.map((d, i) => {
      const done = elapsed >= (freshTiming[i] ?? freshTotalMs);
      return done ? d : { ...d, verdict: "pending" as Verdict };
    });
  }, [fresh, elapsed, view, freshTiming, freshTotalMs]);

  const liveDetectors: DetectorResult[] = liveDetectorCards.map((d) => ({
    name: d.name,
    confidence: d.confidence,
    verdict: d.verdict,
    weight: d.weight,
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
  const frameTextColor = loadingPhase ? "text-white" : VERDICT_STYLES[peakVerdict].frameText;
  const frameLabel = loadingPhase
    ? "Analysis in progress"
    : VERDICT_STYLES[peakVerdict].label + " of Manipulation";

  return (
    <main className="bg-white dark:bg-slate-950 text-[#041E42] dark:text-slate-100 min-h-screen p-5 md:p-8 print:!p-0 print:min-h-0">
      {/* Breadcrumbs + media-type preview toggle */}
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap print:hidden">
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <a href="/" className="hover:text-[#041E42] dark:hover:text-slate-100 py-2.5 -my-2.5">
            Verify Media
          </a>
          <HiOutlineChevronRight className="w-3 h-3" />
          <a
            href="/media/history"
            className="hover:text-[#041E42] dark:hover:text-slate-100 py-2.5 -my-2.5"
          >
            Analyses
          </a>
          <HiOutlineChevronRight className="w-3 h-3" />
          <span className="text-[#041E42] dark:text-slate-100 font-medium font-mono">
            {view.caseId}
          </span>
        </nav>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 hidden sm:inline">
            Demo · preview by media type
          </span>
          <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-900">
            {MEDIA_TABS.map((t) => (
              <button
                key={t.kind}
                onClick={() => setMediaView(t.kind)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 min-h-[44px] md:min-h-0 rounded transition ${
                  mediaView === t.kind
                    ? "bg-[#041E42] text-white dark:bg-[#00B5E2] dark:text-[#041E42]"
                    : "text-slate-600 dark:text-slate-300 hover:text-[#041E42] dark:hover:text-white"
                }`}
              >
                <t.Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="bg-[#041E42] dark:bg-slate-900 text-white p-5 rounded-lg ring-1 ring-transparent dark:ring-slate-800 print:hidden">
              <div className="mb-5">
                <h1 className="text-3xl font-bold tracking-tight leading-none">Is this Real?</h1>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {/* Image + below-image rich content */}
                <div className="flex flex-col gap-3">
                  <div className={`${frameBg} rounded-lg p-1`}>
                    <div className={`text-center ${frameTextColor} font-bold py-1 text-sm`}>
                      {frameLabel}
                    </div>
                    <div className={`relative rounded-md h-60 overflow-hidden ${view.heroContain ? "bg-white" : "bg-slate-900"}`}>
                      <img
                        src={view.heroImage}
                        alt="Analyzed media"
                        className={`absolute inset-0 w-full h-full object-center ${view.heroContain ? "object-contain p-4" : "object-cover"}`}
                      />
                      {loadingPhase && (
                        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-300 text-[11px] font-semibold px-2 py-1 rounded-full min-w-0">
                      <HiOutlineArrowUpTray className="w-3 h-3 shrink-0" />
                      <span className="truncate">{view.fileName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IconButton label="Share this analysis" onClick={shareAnalysis}>
                        <HiOutlineShare className="w-4 h-4" />
                      </IconButton>
                      <IconButton label="Download report (PDF)" onClick={downloadReport}>
                        <HiOutlineArrowDownTray className="w-4 h-4" />
                      </IconButton>
                      <CopyLinkButton />
                    </div>
                  </div>

                  {/* Analyzed date + case ID intentionally omitted here for
                      parity with the text page (they remain in Details and
                      the printed report). Solid lifted navy — the old
                      half-transparent slate read slightly off on this card. */}
                  <dl className="bg-[#0A2348] rounded-md px-3 py-2.5 text-xs grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
                    <dt className="text-slate-400">Source</dt>
                    <dd className="text-white">
                      {view.source.platform}
                      {view.source.url && (
                        <span className="text-slate-400 ml-1.5 font-mono">
                          {view.source.url}
                        </span>
                      )}
                    </dd>
                    <dt className="text-slate-400">File</dt>
                    <dd className="text-white font-mono">
                      {view.fileType} · {view.fileSize}
                    </dd>
                  </dl>
                </div>

                {/* Right: text-page order — verdict, detectors individually,
                    then the compact gauge with the percentage under it */}
                <div className="flex flex-col gap-3.5">
                  <EnsembleGauge
                    detectors={liveDetectors}
                    loadingPhase={loadingPhase}
                  />
                  <p className="text-slate-400 text-xs leading-relaxed">{TM_DISCLAIMER}</p>
                  <a
                    href="#"
                    className="text-xs text-[#00B5E2] hover:underline self-start"
                  >
                    Read full ensemble methodology →
                  </a>
                </div>
              </div>
            </section>

      {/* DETECTORS — the two in-house models that run for this media stream */}
      <section className="mt-10 print:hidden">
        <div className="pb-2.5 mb-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <h2 className="text-base font-semibold tracking-tight text-[#041E42] dark:text-slate-100">
            Detectors
          </h2>
          <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-full min-w-[20px] h-5 px-1 inline-flex items-center justify-center">
            {liveDetectorCards.length}
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 max-w-3xl">
          {liveDetectorCards.map((d, i) => (
            <DetectorCard
              key={`${i}-${d.name}`}
              name={d.name}
              description={d.description}
              confidence={d.confidence}
              verdict={d.verdict}
              icon={d.icon}
              tag={d.tag}
            />
          ))}
        </div>
      </section>

      {/* DETAILS — always its own row below the categories */}
      <section className="mt-10 print:hidden">
        <div className="flex items-center gap-2 text-lg font-bold text-[#041E42] dark:text-slate-100 mb-3">
          <HiOutlineInformationCircle className="w-5 h-5" />
          Details
        </div>
        <div className="bg-[#041E42] dark:bg-slate-900 text-white rounded-lg px-5 py-4 ring-1 ring-transparent dark:ring-slate-800 flex flex-wrap items-center gap-x-8 gap-y-4">
          <DetailRow
            icon={<HiOutlinePhoto />}
            label="File type"
            value={`${view.fileType} · ${view.fileSize}`}
          />
          <DetailRow
            icon={<HiOutlineClock />}
            label="Processing time"
            value={SHARED_DETAILS.processingTime}
          />
          <DetailRow
            icon={<HiOutlineCalendar />}
            label="Analyzed on"
            value={SHARED_DETAILS.analyzedOn}
          />
          <DetailRow
            icon={<HiOutlineInformationCircle />}
            label="Ensemble version"
            value={`${SHARED_DETAILS.ensembleVersion} · calibrated ${SHARED_DETAILS.calibrated}`}
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

      {/* The downloadable asset — hidden on screen, this is what the
          Download button's print-to-PDF actually renders. */}
      <PrintReport view={view} />
    </main>
  );
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="p-3.5 md:p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded transition"
    >
      {children}
    </button>
  );
}

// Copies the permalink to this analysis, with brief inline confirmation.
function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title={copied ? "Link copied" : "Copy link to this analysis"}
      aria-label="Copy link to this analysis"
      onClick={() => {
        if (typeof window === "undefined") return;
        navigator.clipboard?.writeText(window.location.href).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="p-3.5 md:p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded transition"
    >
      {copied ? (
        <HiOutlineCheck className="w-4 h-4 text-[#94C063]" />
      ) : (
        <HiOutlineLink className="w-4 h-4" />
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────
// PrintReport — the downloadable asset. Hidden on screen; when Download
// triggers window.print(), the interactive UI above is print:hidden and
// this compact, light, one-page Georgetown-branded report is the PDF.
// Always renders the RESOLVED result (view.detectors), never mid-load
// pending states. Colors are explicit light-theme hexes so dark mode on
// screen can't leak into the printed page.
// ─────────────────────────────────────────────────────────────────────

// Verdict hues for print: chip background + readable heading-text shade.
const PRINT_ACCENT: Record<Verdict, { chipBg: string; chipText: string; heading: string }> = {
  "substantial-evidence": { chipBg: "#862633", chipText: "#FFFFFF", heading: "#862633" },
  "some-evidence": { chipBg: "#F8E08E", chipText: "#041E42", heading: "#BE922B" },
  "little-evidence": { chipBg: "#64A70B", chipText: "#041E42", heading: "#548A09" },
  uncertain: { chipBg: "#63666A", chipText: "#FFFFFF", heading: "#63666A" },
  pending: { chipBg: "#8E9093", chipText: "#FFFFFF", heading: "#63666A" },
};

function PrintVerdictChip({ verdict }: { verdict: Verdict }) {
  const a = PRINT_ACCENT[verdict];
  return (
    <span
      className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded whitespace-nowrap"
      style={{ background: a.chipBg, color: a.chipText }}
    >
      {VERDICT_STYLES[verdict].label}
    </span>
  );
}

function PrintReport({ view }: { view: AnalysisView }) {
  const agg = ensembleConfidence(view.detectors);
  const accent = PRINT_ACCENT[agg.verdict];
  const scores = view.detectors.map((d) => d.confidence);
  const lo = Math.min(...scores);
  const hi = Math.max(...scores);

  return (
    <section
      className="hidden print:block text-[#041E42]"
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
    >
      {/* ── Page 1 · Result summary ─────────────────────────────────── */}
      <div className="break-after-page">
      {/* Masthead */}
      <div className="flex items-end justify-between border-b-2 border-[#041E42] pb-3">
        <div>
          <div className="text-2xl font-bold tracking-tight leading-none">TrueMedia</div>
          <div className="text-[11px] text-[#63666A] mt-1.5">
            Media Analysis Report · An open-source research project of Georgetown University
          </div>
        </div>
        <div className="text-right text-[11px] text-[#63666A]">
          <div className="font-mono text-[#041E42]">{view.caseId}</div>
          <div>{SHARED_DETAILS.analyzedOn}</div>
        </div>
      </div>

      {/* Verdict */}
      <div
        className="mt-5 rounded-md border-2 px-4 py-3 flex items-baseline justify-between gap-4"
        style={{ borderColor: accent.heading }}
      >
        <div className="text-lg font-bold" style={{ color: accent.heading }}>
          {VERDICT_STYLES[agg.verdict].label} of Manipulation
        </div>
        <div className="text-lg font-bold whitespace-nowrap">
          {agg.confidence}%
          <span className="text-[10px] font-normal text-[#63666A] ml-1.5 uppercase tracking-wide">
            manipulation probability
          </span>
        </div>
      </div>

      {/* Media thumbnail + metadata */}
      <div className="mt-5 flex gap-5 items-start">
        <img
          src={view.heroImage}
          alt=""
          className={`w-52 aspect-video rounded border border-[#BCBDC0] ${
            view.heroContain ? "object-contain p-1.5 bg-white" : "object-cover"
          }`}
        />
        <dl className="flex-1 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs content-start">
          <dt className="text-[#63666A] uppercase tracking-wide text-[10px] pt-0.5">File</dt>
          <dd className="font-mono">{view.fileName} · {view.fileType} · {view.fileSize}</dd>
          <dt className="text-[#63666A] uppercase tracking-wide text-[10px] pt-0.5">Source</dt>
          <dd>
            {view.source.platform}
            <span className="font-mono text-[#63666A] ml-1.5">{view.source.url}</span>
          </dd>
          <dt className="text-[#63666A] uppercase tracking-wide text-[10px] pt-0.5">Analyzed</dt>
          <dd>{SHARED_DETAILS.analyzedOn} · {SHARED_DETAILS.processingTime}</dd>
          <dt className="text-[#63666A] uppercase tracking-wide text-[10px] pt-0.5">Ensemble</dt>
          <dd className="font-mono">
            {SHARED_DETAILS.ensembleVersion} · calibrated {SHARED_DETAILS.calibrated}
          </dd>
          <dt className="text-[#63666A] uppercase tracking-wide text-[10px] pt-0.5">Consensus</dt>
          <dd>
            {agg.agreeingCount} of {agg.activeCount} detectors agree · detector range {lo}–{hi}
          </dd>
        </dl>
      </div>

      {/* Detector table */}
      <table className="w-full mt-5 text-xs border-t-2 border-[#041E42]">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-wide text-[#63666A] border-b border-[#BCBDC0]">
            <th className="py-1.5 pr-3 font-semibold">Detector</th>
            <th className="py-1.5 pr-3 font-semibold">Model</th>
            <th className="py-1.5 text-right font-semibold">Result</th>
          </tr>
        </thead>
        <tbody>
          {view.detectors.map((d, i) => {
            const dv = d.verdict ?? verdictFromConfidence(d.confidence);
            return (
              <tr key={`${i}-${d.name}`} className="border-b border-[#DDDDDF] align-top">
                <td className="py-2 pr-3">
                  <div className="font-semibold">{d.name}</div>
                  {d.description && (
                    <div className="text-[10px] text-[#63666A] leading-snug mt-0.5 max-w-md">
                      {d.description}
                    </div>
                  )}
                </td>
                <td className="py-2 pr-3 font-mono text-[10px] text-[#63666A] whitespace-nowrap">
                  {d.tag}
                </td>
                <td className="py-2 text-right">
                  <PrintVerdictChip verdict={dv} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Disclaimer + footer */}
      <p className="mt-4 text-[10px] leading-relaxed text-[#63666A]">{TM_DISCLAIMER}</p>
      <PrintPageFooter page={1} caseId={view.caseId} />
      </div>

      {/* ── Page 2 · Interpretation & methodology ────────────────────── */}
      <div>
        <div className="flex items-baseline justify-between border-b-2 border-[#041E42] pb-2">
          <div className="text-sm font-bold tracking-tight">
            TrueMedia{" "}
            <span className="font-normal text-[#63666A]">
              · Media Analysis Report — Interpretation
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#63666A]">{view.caseId}</div>
        </div>

        {/* Verdict tier legend */}
        <h3 className="mt-5 text-[11px] font-semibold uppercase tracking-wide text-[#63666A]">
          Verdict tiers
        </h3>
        <table className="w-full mt-2 text-xs break-inside-avoid">
          <tbody>
            {TIER_LEGEND.map((t) => (
              <tr key={t.verdict} className="border-b border-[#DDDDDF]">
                <td className="py-2 w-40">
                  <PrintVerdictChip verdict={t.verdict} />
                </td>
                <td className="py-2 w-24 font-mono text-[10px] text-[#63666A] whitespace-nowrap">
                  {t.range}
                </td>
                <td className="py-2">{t.meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Verbal confidence scale with this analysis marked */}
        <h3 className="mt-6 text-[11px] font-semibold uppercase tracking-wide text-[#63666A]">
          Verbal confidence scale
        </h3>
        <div className="mt-2 flex rounded overflow-hidden border border-[#BCBDC0] text-center break-inside-avoid">
          {PRINT_BANDS.map((b) => {
            const active =
              agg.confidence >= b.from && (b.to === 100 ? agg.confidence <= 100 : agg.confidence < b.to);
            return (
              <div
                key={b.label}
                className="py-2 border-r last:border-r-0 border-[#BCBDC0]"
                style={{
                  width: `${b.to - b.from}%`,
                  background: active ? accent.chipBg : "#F7F7F7",
                  color: active ? accent.chipText : "#63666A",
                }}
              >
                <div className="text-[9px] font-semibold leading-tight">{b.label}</div>
                <div className="text-[8px] opacity-80">
                  {b.from}–{b.to}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-1.5 text-[10px] text-[#63666A]">
          This analysis: manipulation probability{" "}
          <span className="font-mono text-[#041E42]">{agg.confidence}</span> →{" "}
          <span className="font-semibold text-[#041E42]">
            {(PRINT_BANDS.find(
              (b) => agg.confidence >= b.from && (b.to === 100 ? true : agg.confidence < b.to)
            ) ?? PRINT_BANDS[PRINT_BANDS.length - 1]).label}
          </span>
          . The scale runs 0 (no manipulation) to 100 (highly manipulated).
        </p>

        {/* Methodology */}
        <h3 className="mt-6 text-[11px] font-semibold uppercase tracking-wide text-[#63666A]">
          Methodology
        </h3>
        <p className="mt-2 text-xs leading-relaxed">
          Each detector listed on page 1 independently scores the media from 0–100. The ensemble
          combines these scores into the overall manipulation probability and verdict tier
          ({SHARED_DETAILS.ensembleVersion}, calibrated {SHARED_DETAILS.calibrated}). In this
          analysis, {agg.agreeingCount} of {agg.activeCount} detectors agreed with the final
          verdict; individual detector scores ranged {lo}–{hi}.
        </p>

        {/* Citation */}
        <h3 className="mt-6 text-[11px] font-semibold uppercase tracking-wide text-[#63666A]">
          Cite this analysis
        </h3>
        <pre className="mt-2 font-mono text-[9px] leading-relaxed border border-[#BCBDC0] rounded bg-[#F7F7F7] p-3 whitespace-pre-wrap break-inside-avoid">
{`@misc{truemedia2026,
  title        = {TrueMedia: Open-Source Deepfake Detection},
  author       = {{Georgetown University}},
  year         = {2026},
  howpublished = {\\url{https://truemedia.georgetown.edu}},
  note         = {Analysis ${view.caseId}, ensemble ${SHARED_DETAILS.ensembleVersion}}
}`}
        </pre>
        <p className="mt-1.5 text-[10px] text-[#63666A]">
          For use in academic and journalistic work.
        </p>

        <PrintPageFooter page={2} caseId={view.caseId} />
      </div>
    </section>
  );
}

// Legend rows for page 2 — tier copy from the production verdict taxonomy
// (realData REAL_VERDICTS); numeric ranges are the tier breakpoints in
// verdict.ts (verdictFromConfidence).
const TIER_LEGEND: { verdict: Verdict; range: string; meaning: string }[] = [
  { verdict: "little-evidence", range: "0 – 24", meaning: REAL_VERDICTS.low.longSummary },
  { verdict: "uncertain", range: "25 – 49", meaning: REAL_VERDICTS.uncertain.longSummary },
  { verdict: "some-evidence", range: "50 – 74", meaning: "Some Evidence of Manipulation" },
  { verdict: "substantial-evidence", range: "75 – 100", meaning: REAL_VERDICTS.high.longSummary },
];

// Same bands as the on-screen verbal-confidence ladder (EnsembleGauge).
const PRINT_BANDS = [
  { from: 0, to: 25, label: "Unlikely" },
  { from: 25, to: 50, label: "Possible" },
  { from: 50, to: 75, label: "Likely" },
  { from: 75, to: 90, label: "Very likely" },
  { from: 90, to: 100, label: "Virtually certain" },
];

function PrintPageFooter({ page, caseId }: { page: number; caseId: string }) {
  return (
    <div className="mt-3 pt-2 border-t border-[#BCBDC0] flex items-baseline justify-between text-[10px] text-[#63666A]">
      <span>
        Verify at <span className="font-mono text-[#041E42]">truemedia.georgetown.edu</span> ·
        © 2026 TrueMedia · Georgetown University
      </span>
      <span className="font-mono">
        {caseId} · Page {page} of 2
      </span>
    </div>
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
