"use client";

import { useMemo, useState } from "react";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineArrowDownTray,
  HiOutlinePhoto,
  HiOutlineFilm,
  HiOutlineMusicalNote,
  HiOutlineDocumentText,
  HiOutlineChevronDown,
} from "react-icons/hi2";
import { VerdictBadge } from "@/components/ensemble/VerdictBadge";
import type { Verdict } from "@/components/ensemble";
import {
  historyItems,
  claimHistory,
  type HistoryItem,
  type MediaType,
  type Source,
  type ClaimHistoryItem,
  type ClaimVerdict,
} from "./sampleData";
import { CLAIM_PILL } from "@/components/shared/claimStyles";
import { sampleThumbnail } from "@/components/real/realData";

// ─────────────────────────────────────────────────────────────────────
// Filter / sort options
// ─────────────────────────────────────────────────────────────────────

type DateRange = "all" | "today" | "week" | "month" | "year";
type SortOpt = "latest" | "oldest" | "highest" | "lowest";

const DATE_OPTS: { v: DateRange; label: string; ms: number }[] = [
  { v: "all", label: "All Time", ms: Infinity },
  { v: "today", label: "Today", ms: 86_400_000 },
  { v: "week", label: "This week", ms: 7 * 86_400_000 },
  { v: "month", label: "This month", ms: 30 * 86_400_000 },
  { v: "year", label: "This year", ms: 365 * 86_400_000 },
];

const SORT_OPTS: { v: SortOpt; label: string }[] = [
  { v: "latest", label: "Latest" },
  { v: "oldest", label: "Oldest" },
  { v: "highest", label: "Highest confidence" },
  { v: "lowest", label: "Lowest confidence" },
];

const VERDICT_OPTS: { v: Verdict | "all"; label: string }[] = [
  { v: "all", label: "All verdicts" },
  { v: "substantial-evidence", label: "Substantial" },
  { v: "some-evidence", label: "Some Evidence" },
  { v: "uncertain", label: "Uncertain" },
  { v: "little-evidence", label: "Little Evidence" },
];

const TYPE_OPTS: { v: MediaType | "all"; label: string }[] = [
  { v: "all", label: "All types" },
  { v: "image", label: "Image" },
  { v: "video", label: "Video" },
  { v: "audio", label: "Audio" },
];

const SOURCE_OPTS: (Source | "all")[] = [
  "all",
  "X",
  "Reddit",
  "Truth Social",
  "Facebook",
  "Instagram",
  "Upload",
  "Google Drive",
];

const VERDICT_BORDER: Record<string, string> = {
  "substantial-evidence": "border-[#D50032]",
  "some-evidence": "border-[#EFCB5F]",
  uncertain: "border-slate-500",
  "little-evidence": "border-[#94C063]",
  pending: "border-slate-600",
};

const MEDIA_ICON = {
  image: HiOutlinePhoto,
  video: HiOutlineFilm,
  audio: HiOutlineMusicalNote,
} as const;

// ─────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────

export function HistoryPage() {
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [search, setSearch] = useState("");
  const [verdictFilter, setVerdictFilter] = useState<Verdict | "all">("all");
  const [typeFilter, setTypeFilter] = useState<MediaType | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<Source | "all">("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [sort, setSort] = useState<SortOpt>("latest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const dateCutoff =
    dateRange === "all"
      ? 0
      : Date.now() - (DATE_OPTS.find((o) => o.v === dateRange)?.ms ?? 0);

  const mediaFiltered = useMemo(() => {
    const arr = historyItems.filter((item) => {
      if (verdictFilter !== "all" && item.verdict !== verdictFilter) return false;
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (sourceFilter !== "all" && item.source !== sourceFilter) return false;
      if (item.analyzedAtRaw < dateCutoff) return false;
      if (search && !item.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
    arr.sort((a, b) => {
      if (sort === "latest") return b.analyzedAtRaw - a.analyzedAtRaw;
      if (sort === "oldest") return a.analyzedAtRaw - b.analyzedAtRaw;
      if (sort === "highest") return b.confidence - a.confidence;
      return a.confidence - b.confidence;
    });
    return arr;
  }, [verdictFilter, typeFilter, sourceFilter, dateCutoff, search, sort]);

  const totalQueries = historyItems.length + claimHistory.length;
  const filteredCount = mediaFiltered.length + claimHistory.length;

  function exportCsv() {
    const header = "Type,Verdict,Confidence,Source,Date,Name/Text\n";
    const mediaRows = mediaFiltered.map(
      (i) => `Media,${i.verdict},${i.confidence},${i.source},${i.analyzedAt},"${i.name}"`
    );
    const claimRows = claimHistory.map(
      (c) => `Text,${c.verdict},,,${c.analyzedAt},"${c.text.replace(/"/g, '""')}"`
    );
    const blob = new Blob([header + [...mediaRows, ...claimRows].join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `truemedia-history-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] p-4 md:p-6 bg-white dark:bg-slate-950 text-[#041E42] dark:text-slate-100">
      {/* Top title row */}
      <div className="flex items-center justify-between mb-5 gap-3">
        <h1 className="text-4xl font-bold tracking-tight">History</h1>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-1.5 bg-[#00B5E2] hover:bg-[#0099C2] text-[#041E42] font-semibold text-sm px-4 py-2 rounded-md transition shadow-sm"
        >
          <HiOutlineArrowDownTray className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Media section card */}
      <section className="bg-[#041E42] dark:bg-slate-900 text-white rounded-lg overflow-hidden ring-1 ring-transparent dark:ring-slate-800 mb-10">
        <div className="p-5 md:p-6">
          {/* Card header: scope pill + counts */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="inline-flex rounded-full bg-slate-800 p-0.5">
              <button
                onClick={() => setScope("mine")}
                className={`text-sm font-semibold px-5 py-2 rounded-full transition ${scope === "mine" ? "bg-[#00B5E2] text-[#041E42]" : "text-slate-300 hover:text-white"}`}
              >
                My History
              </button>
              <button
                onClick={() => setScope("all")}
                className={`text-sm font-semibold px-5 py-2 rounded-full transition ${scope === "all" ? "bg-[#00B5E2] text-[#041E42]" : "text-slate-300 hover:text-white"}`}
              >
                Team
              </button>
            </div>
            <div className="text-sm text-slate-400">
              Filtered queries:{" "}
              <span className="font-mono text-white font-semibold">{filteredCount}</span>
              <span className="mx-2 text-slate-600">·</span>
              Total queries:{" "}
              <span className="font-mono text-white font-semibold">{totalQueries}</span>
            </div>
          </div>

          {/* Search + filter buttons row */}
          <div className="flex flex-col lg:flex-row gap-2 mb-2">
            <div className="flex grow gap-2">
              <div className="relative flex-1">
                <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  type="text"
                  placeholder="Search"
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm rounded-md pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#00B5E2] focus:ring-1 focus:ring-[#00B5E2]"
                />
              </div>
              <button
                type="button"
                className="bg-[#00B5E2] hover:bg-[#0099C2] text-[#041E42] font-semibold text-sm px-5 rounded-md transition"
              >
                Search
              </button>
            </div>

            <div className="flex gap-2 lg:ml-2">
              <DropdownButton
                label={VERDICT_OPTS.find((v) => v.v === verdictFilter)?.label ?? "Filter"}
                opts={VERDICT_OPTS}
                value={verdictFilter}
                onChange={setVerdictFilter}
                isOpen={filtersOpen}
                onToggle={setFiltersOpen}
              />
              <DropdownButton
                label={DATE_OPTS.find((d) => d.v === dateRange)?.label ?? "All Time"}
                opts={DATE_OPTS.map((d) => ({ v: d.v, label: d.label }))}
                value={dateRange}
                onChange={setDateRange}
              />
              <DropdownButton
                label={SORT_OPTS.find((s) => s.v === sort)?.label ?? "Latest"}
                opts={SORT_OPTS}
                value={sort}
                onChange={setSort}
              />
            </div>
          </div>
        </div>

        {/* Media table */}
        <div className="hidden lg:grid grid-cols-12 px-5 py-2.5 bg-slate-700/40 text-[11px] uppercase tracking-wide text-slate-300">
          <div className="col-span-3">Preview</div>
          <div className="col-span-5" />
          <div className="col-span-2 text-center">Media Type</div>
          <div className="col-span-2 text-right whitespace-nowrap">First Queried</div>
        </div>

        {mediaFiltered.map((item, idx) => {
          const Icon = MEDIA_ICON[item.type];
          const border = VERDICT_BORDER[item.verdict] ?? "border-slate-600";
          const isAudio = item.type === "audio";
          return (
            <a
              key={item.id}
              href="/media/analysis"
              className="grid grid-cols-12 px-5 py-4 border-t border-slate-700/60 items-center hover:bg-slate-800/40 transition gap-4"
            >
              <div className="col-span-12 lg:col-span-3">
                <div
                  className={`relative aspect-video rounded-md border-2 ${border} overflow-hidden ${isAudio ? "bg-white" : "bg-slate-800"}`}
                >
                  <img
                    src={sampleThumbnail(item.type, idx)}
                    alt=""
                    className={`w-full h-full object-center ${isAudio ? "object-contain p-2" : "object-cover"}`}
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="col-span-12 lg:col-span-5 min-w-0">
                <div className="mb-2">
                  <VerdictBadge verdict={item.verdict} size="sm" />
                </div>
                <div className="text-sm text-slate-300 truncate font-mono">
                  http://truemedia-fileuploads.org/{item.id}/{item.name}
                </div>
              </div>
              <div className="hidden lg:flex col-span-2 items-center justify-center gap-1.5 text-sm text-slate-300">
                <Icon className="w-4 h-4 text-slate-400" />
                <span className="capitalize">{item.type}</span>
              </div>
              <div className="hidden lg:block col-span-2 text-right text-xs text-slate-400 whitespace-nowrap">
                {item.analyzedAt}
              </div>
            </a>
          );
        })}

        {mediaFiltered.length === 0 && (
          <div className="text-center text-sm text-slate-400 py-12 border-t border-slate-700/60">
            No media matches the current filters.
          </div>
        )}
      </section>

      {/* Claims History title outside the card */}
      <div className="flex items-center justify-between mb-5 gap-3">
        <h1 className="text-4xl font-bold tracking-tight">Claims History</h1>
      </div>

      {/* Claims section card */}
      <section className="bg-[#041E42] dark:bg-slate-900 text-white rounded-lg overflow-hidden ring-1 ring-transparent dark:ring-slate-800">
        <div className="hidden lg:grid grid-cols-12 px-5 py-2.5 bg-slate-700/40 text-[11px] uppercase tracking-wide text-slate-300">
          <div className="col-span-8">Preview</div>
          <div className="col-span-2 text-center">Type</div>
          <div className="col-span-2 text-right whitespace-nowrap">First Queried</div>
        </div>

        {claimHistory.map((c) => {
          const p = CLAIM_PILL[c.verdict as ClaimVerdict];
          return (
            <a
              key={c.id}
              href={`/claim/veracity?id=${c.id}`}
              className="grid grid-cols-12 px-5 py-4 border-t border-slate-700/60 items-start hover:bg-slate-800/40 transition gap-4"
            >
              <div className="col-span-12 lg:col-span-8 min-w-0">
                <div className="mb-2">
                  <span
                    className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded ${p.classes}`}
                  >
                    {p.label}
                  </span>
                </div>
                <div className="text-sm line-clamp-2 break-words text-slate-200">
                  {c.text}
                </div>
              </div>
              <div className="hidden lg:flex col-span-2 items-center justify-center gap-1.5 text-sm text-slate-300 pt-1">
                <HiOutlineDocumentText className="w-4 h-4 text-slate-400" />
                <span className="text-xs">Text</span>
              </div>
              <div className="hidden lg:block col-span-2 text-right text-xs text-slate-400 whitespace-nowrap pt-1">
                {c.analyzedAt}
              </div>
            </a>
          );
        })}

        {claimHistory.length === 0 && (
          <div className="text-center text-sm text-slate-400 py-12">
            No text claims yet.
          </div>
        )}
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// DropdownButton — TrueMedia-style filter button with native select fallback
// ─────────────────────────────────────────────────────────────────────

function DropdownButton<T extends string>({
  label,
  opts,
  value,
  onChange,
}: {
  label: string;
  opts: { v: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm rounded-md px-4 py-2.5 transition"
      >
        {label}
        <HiOutlineChevronDown className="w-3.5 h-3.5" />
      </button>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="absolute inset-0 opacity-0 cursor-pointer"
        aria-label={label}
      >
        {opts.map((o) => (
          <option key={o.v} value={o.v}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
