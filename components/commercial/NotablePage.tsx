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
import { VerdictBadge } from "@/components/ensemble/VerdictBadge";
import {
  notableCases,
  type MediaType,
  type ManipulationType,
  type NotableCase,
} from "./sampleData";

// ─────────────────────────────────────────────────────────────────────
// Filter taxonomy
// ─────────────────────────────────────────────────────────────────────

const TYPE_OPTS: { v: MediaType | "all"; label: string }[] = [
  { v: "all", label: "All media" },
  { v: "image", label: "Image" },
  { v: "video", label: "Video" },
  { v: "audio", label: "Audio" },
];

const METHOD_OPTS: { v: ManipulationType | "all"; label: string }[] = [
  { v: "all", label: "All methods" },
  { v: "Diffusion image generation", label: "Diffusion image" },
  { v: "Face-swap (video)", label: "Face-swap" },
  { v: "Voice clone", label: "Voice clone" },
  { v: "Composite (image+audio)", label: "Composite" },
  { v: "Photo manipulation", label: "Photo edit" },
];

const YEAR_OPTS = ["all", "2026", "2025"] as const;

const MEDIA_ICON = {
  image: HiOutlinePhoto,
  video: HiOutlineFilm,
  audio: HiOutlineMusicalNote,
} as const;

// Reserved, muted cover treatments — index-card feel, no marketing gradients.
const CASE_TREATMENT: Record<string, string> = {
  "n-001": "bg-stone-800",
  "n-002": "bg-zinc-800",
  "n-003": "bg-neutral-800",
  "n-004": "bg-slate-800",
  "n-005": "bg-gray-800",
  "n-006": "bg-stone-900",
};

// ─────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────

export function NotablePage() {
  const [typeFilter, setTypeFilter] = useState<MediaType | "all">("all");
  const [methodFilter, setMethodFilter] = useState<ManipulationType | "all">("all");
  const [yearFilter, setYearFilter] = useState<(typeof YEAR_OPTS)[number]>("all");

  const filtered = useMemo(
    () =>
      notableCases.filter((c) => {
        if (typeFilter !== "all" && c.type !== typeFilter) return false;
        if (methodFilter !== "all" && c.manipulationType !== methodFilter) return false;
        if (yearFilter !== "all" && !c.documented.includes(yearFilter)) return false;
        return true;
      }),
    [typeFilter, methodFilter, yearFilter]
  );

  return (
    <div className="bg-white dark:bg-slate-950 min-h-[calc(100vh-5rem)] p-4 md:p-8 text-[#041E42] dark:text-slate-100">
      {/* Library masthead */}
      <header className="max-w-4xl mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-3 font-semibold">
          <HiOutlineBookOpen className="w-4 h-4" />
          The Notable Cases Archive
        </div>
        <h1 className="text-4xl font-bold mb-3 tracking-tight">Catalogued holdings</h1>
        <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-[11px] uppercase tracking-wide">
          <Stat label="Holdings" value={String(notableCases.length)} />
          <Stat label="Catalogued by" value="Georgetown MDI" />
          <Stat label="Last accession" value="Jun 23, 2026" />
          <Stat label="Citation format" value="TM-NC-### / Author, Year" />
        </dl>
      </header>

      {/* Browse by */}
      <section className="mb-8">
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 font-semibold mb-3">
          Browse by
        </div>
        <div className="flex flex-col gap-2.5">
          <FilterRow label="Media" opts={TYPE_OPTS} value={typeFilter} onChange={setTypeFilter} />
          <FilterRow
            label="Method"
            opts={METHOD_OPTS}
            value={methodFilter}
            onChange={setMethodFilter}
          />
          <FilterRow
            label="Year"
            opts={YEAR_OPTS.map((y) => ({ v: y, label: y === "all" ? "All years" : y }))}
            value={yearFilter}
            onChange={setYearFilter}
          />
        </div>
      </section>

      {/* Holdings count */}
      <div className="flex items-baseline justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 font-semibold">
          Holdings · {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          Sorted by accession date, descending
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-20 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
          No holdings match the current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <CaseCard key={c.id} c={c} />
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
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 font-semibold w-16 shrink-0">
        {label}
      </span>
      {opts.map((o) => {
        const active = value === o.v;
        return (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className={`text-xs px-3 py-1 rounded-sm transition border ${
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
  );
}

// ─────────────────────────────────────────────────────────────────────
// Library-card style case entry
// ─────────────────────────────────────────────────────────────────────

function CaseCard({ c }: { c: NotableCase }) {
  const TypeIcon = MEDIA_ICON[c.type];
  const treatment = CASE_TREATMENT[c.id] ?? "bg-slate-800";
  const topSignal = c.keySignals[0];

  return (
    <article className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition rounded-sm overflow-hidden">
      {/* Cover plate — reserved, no gradient */}
      <div className={`relative h-32 ${treatment}`}>
        <div className="absolute inset-0 flex items-center justify-center text-white/15">
          <TypeIcon className="w-14 h-14" />
        </div>
        <div className="absolute top-2 left-2 bg-white/95 dark:bg-slate-100 text-slate-900 text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm">
          {c.caseId}
        </div>
        {c.featured && (
          <div className="absolute top-2 right-2 bg-amber-400 text-amber-950 text-[9px] font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-sm">
            Featured holding
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Title */}
        <h3 className="text-lg font-semibold text-[#041E42] dark:text-slate-100 leading-tight">
          {c.name}
        </h3>

        {/* Library catalog metadata strip */}
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px]">
          <dt className="uppercase tracking-wider text-slate-500 dark:text-slate-500">
            Classification
          </dt>
          <dd className="text-[#041E42] dark:text-slate-200">{c.manipulationType}</dd>

          <dt className="uppercase tracking-wider text-slate-500 dark:text-slate-500">
            Accessioned
          </dt>
          <dd className="text-[#041E42] dark:text-slate-200 font-mono">{c.documented}</dd>

          <dt className="uppercase tracking-wider text-slate-500 dark:text-slate-500">
            Appeared on
          </dt>
          <dd className="text-[#041E42] dark:text-slate-200">{c.appearedIn}</dd>
        </dl>

        {/* Verdict + top signal */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500 dark:text-slate-500 font-semibold">
              Verdict
            </span>
            <VerdictBadge verdict={c.verdict} size="sm" />
          </div>
          {topSignal && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Lead signal · {topSignal.detector}
              </span>
              <span className="font-mono text-[#041E42] dark:text-slate-200">
                {topSignal.confidence}%
              </span>
            </div>
          )}
        </div>

        {/* Citation footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-3 mt-auto space-y-2.5">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Cited by{" "}
            <span className="font-mono text-[#041E42] dark:text-slate-200">
              {c.citationsCount}
            </span>{" "}
            outlets
          </div>
          <div className="flex items-center justify-between gap-2">
            <CiteButton c={c} />
            <a
              href="/media/analysis"
              className="text-xs text-[#00B5E2] hover:text-[#0883a3] dark:hover:text-[#33D6FF] inline-flex items-center gap-1 font-medium"
            >
              View record
              <HiOutlineArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────
// CiteButton — copies a formatted reference built from the case's real
// catalog fields. No fabricated prose; just a standard archive citation.
// ─────────────────────────────────────────────────────────────────────

function CiteButton({ c }: { c: NotableCase }) {
  const [copied, setCopied] = useState(false);

  function copyCitation() {
    const citation = `TrueMedia (Georgetown Media Integrity Initiative). "${c.name}." Notable Cases Archive, ${c.caseId}. Accessioned ${c.documented}. https://www.truemedia.org/media/notable`;
    navigator.clipboard?.writeText(citation).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={copyCitation}
      title="Copy a formatted citation for this case"
      className="text-xs inline-flex items-center gap-1 border border-slate-300 dark:border-slate-700 hover:border-[#00B5E2] dark:hover:border-[#00B5E2] rounded-sm px-2 py-1 transition text-slate-600 dark:text-slate-300"
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
