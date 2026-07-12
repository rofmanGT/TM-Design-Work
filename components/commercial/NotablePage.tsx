"use client";

import { useMemo, useState } from "react";
import {
  HiOutlinePhoto,
  HiOutlineFilm,
  HiOutlineMusicalNote,
  HiOutlineArrowRight,
  HiOutlineBookOpen,
  HiOutlineDocumentText,
  HiOutlineCheck,
} from "react-icons/hi2";
import {
  REAL_CASES,
  caseThumbnail,
  isWaveform,
  type RealCase,
  type CaseTopic,
} from "@/components/real/realData";

// ─────────────────────────────────────────────────────────────────────
// The Notable Cases Archive — now backed by the REAL curated cases from
// the production repo's political deepfake quiz (realData.ts). Titles,
// descriptions, media types, citations, and ground-truth labels are the
// team's own editorial data; nothing here is generated.
// ─────────────────────────────────────────────────────────────────────

type MediaFilter = "all" | "image" | "video" | "audio";
type LabelFilter = "all" | "fake" | "authentic" | "unlabeled";
type TopicFilter = "all" | CaseTopic;

const MEDIA_OPTS: { v: MediaFilter; label: string }[] = [
  { v: "all", label: "All media" },
  { v: "image", label: "Image" },
  { v: "video", label: "Video" },
  { v: "audio", label: "Audio" },
];

const LABEL_OPTS: { v: LabelFilter; label: string }[] = [
  { v: "all", label: "All labels" },
  { v: "fake", label: "Documented fake" },
  { v: "authentic", label: "Authentic" },
  { v: "unlabeled", label: "Unlabeled" },
];

const TOPIC_OPTS: { v: TopicFilter; label: string }[] = [
  { v: "all", label: "All topics" },
  { v: "Politics", label: "Politics" },
  { v: "Celebrity", label: "Celebrity" },
  { v: "Cybersecurity", label: "Cybersecurity" },
  { v: "Technology", label: "Technology" },
];

const MEDIA_ICON = {
  image: HiOutlinePhoto,
  video: HiOutlineFilm,
  audio: HiOutlineMusicalNote,
} as const;

// Ground-truth chip styles use the EXACT rank badge colors from the
// production repo (data/model.ts): high, low, unknown.
const TRUTH_CHIP: Record<
  RealCase["groundTruth"],
  { label: string; classes: string }
> = {
  fake: { label: "Documented fake", classes: "bg-[#862633] text-[#F6C6D0]" },
  authentic: { label: "Authentic", classes: "bg-[#3F6B07] text-[#C2DBA4]" },
  unlabeled: { label: "Unlabeled", classes: "bg-[#63666A] text-white" },
};

// Reserved, muted cover treatments — cycled by index; index-card feel.
// On-palette: Georgetown Blue (navy) shades + Georgetown Gray tones.
const CASE_TREATMENTS = [
  "bg-[#041E42]", // Georgetown Blue
  "bg-[#0A2348]", // Georgetown Blue, lifted
  "bg-[#63666A]", // Georgetown Gray (base)
  "bg-[#031630]", // Georgetown Blue, deep
  "bg-[#7F8185]", // Georgetown Gray 80%
  "bg-[#717277]", // Georgetown Gray 90%
];

// Curatorial pick for the featured holding: the New Hampshire robocall —
// the most widely documented case in the collection (AP citation).
const FEATURED_ID = "6jESKtyja_DQQHSHIM9ir-FPrxg.wav";

const caseIdFor = (index: number) => `TM-NC-${String(index + 1).padStart(3, "0")}`;

function hostnameOf(url?: string) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────

export function NotablePage() {
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");
  const [labelFilter, setLabelFilter] = useState<LabelFilter>("all");
  const [topicFilter, setTopicFilter] = useState<TopicFilter>("all");

  const filtered = useMemo(
    () =>
      REAL_CASES.map((c, i) => ({ c, index: i })).filter(({ c }) => {
        if (mediaFilter !== "all" && c.mediaType !== mediaFilter) return false;
        if (labelFilter !== "all" && c.groundTruth !== labelFilter) return false;
        if (topicFilter !== "all" && c.topic !== topicFilter) return false;
        return true;
      }),
    [mediaFilter, labelFilter, topicFilter]
  );

  return (
    <div className="bg-white dark:bg-slate-950 min-h-[calc(100vh-5rem)] p-4 md:p-8 text-[#041E42] dark:text-slate-100">
      {/* Library masthead */}
      <header className="max-w-4xl mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-3 font-semibold">
          <HiOutlineBookOpen className="w-4 h-4" />
          The Notable Cases Archive
        </div>
        <h1 className="font-serif text-4xl font-bold mb-3 tracking-tight text-balance">
          Notable Cases
        </h1>
        <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-[11px] uppercase tracking-wide">
          <Stat label="Cases" value={String(REAL_CASES.length)} />
          <Stat label="Curated by" value="TrueMedia team" />
          <Stat label="Citation format" value="TM-NC-### / Title, Source" />
        </dl>
      </header>

      {/* Browse by */}
      <section className="mb-8">
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 font-semibold mb-3">
          Browse by
        </div>
        <div className="flex flex-col gap-2.5">
          <FilterRow label="Media" opts={MEDIA_OPTS} value={mediaFilter} onChange={setMediaFilter} />
          <FilterRow label="Topic" opts={TOPIC_OPTS} value={topicFilter} onChange={setTopicFilter} />
          <FilterRow label="Label" opts={LABEL_OPTS} value={labelFilter} onChange={setLabelFilter} />
        </div>
      </section>

      {/* Holdings count */}
      <div className="flex items-baseline justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 font-semibold">
          Cases · {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          Ground truth shown only where the cited source states it
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-20 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
          No cases match the current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(({ c, index }) => (
            <CaseCard key={c.id} c={c} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500 dark:text-slate-500">{label}</dt>
      <dd className="text-sm text-[#041E42] dark:text-slate-100 normal-case tracking-normal mt-0.5 font-medium">
        {value}
      </dd>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Filter chip row
// ─────────────────────────────────────────────────────────────────────

function FilterRow<T extends string>({
  label,
  opts,
  value,
  onChange,
}: {
  label: string;
  opts: { v: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 font-semibold w-16 shrink-0 pt-1.5">
        {label}
      </span>
      <div className="flex flex-wrap gap-2 flex-1 min-w-0">
        {opts.map((o) => {
          const active = value === o.v;
          return (
            <button
              key={o.v}
              onClick={() => onChange(o.v)}
              className={`inline-flex items-center text-xs px-3 py-1 min-h-[44px] md:min-h-0 rounded-sm transition border ${
                active
                  ? "bg-[#041E42] text-white border-[#041E42] dark:bg-[#00B5E2]/15 dark:border-[#00B5E2]/40 dark:text-white"
                  : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-500 dark:hover:border-slate-500"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Library-card style case entry — real case data
// ─────────────────────────────────────────────────────────────────────

function CaseCard({ c, index }: { c: RealCase; index: number }) {
  const TypeIcon = MEDIA_ICON[c.mediaType];
  const treatment = CASE_TREATMENTS[index % CASE_TREATMENTS.length];
  const truth = TRUTH_CHIP[c.groundTruth];
  const sourceHost = hostnameOf(c.citationUrl);
  const caseId = caseIdFor(index);
  const thumb = caseThumbnail(c);
  const waveform = isWaveform(c);

  return (
    <article className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition rounded-sm overflow-hidden">
      {/* Cover plate — real thumbnail frame (image/video) or generated mel
          spectrogram (audio), framed at video ratio and centered. */}
      <div className={`relative aspect-video ${waveform ? "bg-white" : treatment}`}>
        <img
          src={thumb}
          alt=""
          className={`absolute inset-0 w-full h-full object-center ${waveform ? "object-contain p-3" : "object-cover"}`}
          loading="lazy"
        />
        {/* Media-type glyph, bottom-right, always visible */}
        <div className="absolute bottom-2 right-2 bg-[#041E42]/60 text-white rounded-sm p-1">
          <TypeIcon className="w-3.5 h-3.5" />
        </div>
        {waveform && (
          <div className="absolute bottom-2 left-2 bg-[#041E42]/60 text-white text-[9px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded-sm">
            Audio waveform
          </div>
        )}
        <div className="absolute top-2 left-2 bg-white/95 dark:bg-slate-100 text-slate-900 text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm">
          {caseId}
        </div>
        {c.id === FEATURED_ID && (
          <div className="absolute top-2 right-2 bg-amber-400 text-amber-950 text-[9px] font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-sm">
            Featured holding
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Title */}
        <h3 className="font-serif text-lg font-semibold text-[#041E42] dark:text-slate-100 leading-tight text-balance">
          {c.title}
        </h3>

        {/* Real editorial description from the team's quiz */}
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
          {c.description}
        </p>

        {/* Library catalog metadata strip */}
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px] border-t border-slate-200 dark:border-slate-800 pt-3">
          <dt className="uppercase tracking-wider text-slate-500 dark:text-slate-500">
            Ground truth
          </dt>
          <dd>
            <span
              className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded ${truth.classes}`}
            >
              {truth.label}
            </span>
          </dd>

          <dt className="uppercase tracking-wider text-slate-500 dark:text-slate-500">
            Media
          </dt>
          <dd className="text-[#041E42] dark:text-slate-200 capitalize">{c.mediaType}</dd>

          <dt className="uppercase tracking-wider text-slate-500 dark:text-slate-500">
            Topic
          </dt>
          <dd className="text-[#041E42] dark:text-slate-200">{c.topic}</dd>

          <dt className="uppercase tracking-wider text-slate-500 dark:text-slate-500">
            Source
          </dt>
          <dd className="text-[#041E42] dark:text-slate-200 font-mono">
            {sourceHost ?? "—"}
          </dd>
        </dl>

        {/* Footer: cite + link to the TrueMedia verdict page */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-3 mt-auto flex items-center justify-between gap-2">
          <CiteButton c={c} caseId={caseId} />
          <a
            href="/media/analysis"
            className="text-xs text-[#00B5E2] hover:text-[#003DA5] dark:hover:text-[#5FC9EB] inline-flex items-center gap-1 font-medium min-h-[44px] md:min-h-0"
          >
            TrueMedia verdict
            <HiOutlineArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────
// CiteButton — copies a formatted reference built from the case's real
// catalog fields (title, id, citation URL).
// ─────────────────────────────────────────────────────────────────────

function CiteButton({ c, caseId }: { c: RealCase; caseId: string }) {
  const [copied, setCopied] = useState(false);

  function copyCitation() {
    const citation = `TrueMedia (Georgetown University). "${c.title}." Notable Cases Archive, ${caseId}.${
      c.citationUrl ? ` Documented at ${c.citationUrl}.` : ""
    } https://truemedia.georgetown.edu/media/notable`;
    navigator.clipboard?.writeText(citation).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={copyCitation}
      title="Copy a formatted citation for this case"
      className="text-xs inline-flex items-center gap-1 min-h-[44px] md:min-h-0 border border-slate-300 dark:border-slate-700 hover:border-[#00B5E2] dark:hover:border-[#00B5E2] rounded-sm px-2 py-1 transition text-slate-600 dark:text-slate-300"
    >
      {copied ? (
        <>
          <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-500" />
          Copied
        </>
      ) : (
        <>
          <HiOutlineDocumentText className="w-3.5 h-3.5" />
          Cite
        </>
      )}
    </button>
  );
}
