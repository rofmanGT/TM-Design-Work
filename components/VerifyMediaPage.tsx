"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineArrowUpTray,
  HiOutlinePaperAirplane,
  HiOutlinePhoto,
  HiOutlineFilm,
  HiOutlineMusicalNote,
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineDocumentText,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineInformationCircle,
} from "react-icons/hi2";
import {
  FaRedditAlien,
  FaGoogleDrive,
  FaInstagram,
  FaFacebookF,
  FaXTwitter,
} from "react-icons/fa6";
import { VerdictBadge } from "@/components/ensemble";
import { historyItems, claimHistory } from "@/components/commercial/sampleData";
import {
  REAL_CASES,
  caseThumbnail,
  sampleThumbnail,
  isWaveform,
  type RealCase,
} from "@/components/real/realData";
import { CLAIM_PILL } from "@/components/shared/claimStyles";

type MainTab = "ai" | "false";
type AiSubTab = "url" | "upload";

const SOURCES = [
  { name: "X", Icon: FaXTwitter },
  { name: "Reddit", Icon: FaRedditAlien },
  { name: "Google Drive", Icon: FaGoogleDrive },
  { name: "Instagram", Icon: FaInstagram },
  { name: "Facebook", Icon: FaFacebookF },
  { name: "Truth Social", Icon: TruthIcon },
];

function TruthIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 13" className={className} fill="currentColor" aria-hidden>
      <path d="M16 9.336H11.81v3.41H16V9.336zM14.36 3.444V0H5.824v12.713h4.358V3.444h4.18z" />
      <path d="M0 0h4.184v3.443H0V0z" />
    </svg>
  );
}

const MEDIA_ICON = {
  image: HiOutlinePhoto,
  video: HiOutlineFilm,
  audio: HiOutlineMusicalNote,
} as const;

export function VerifyMediaPage() {
  const router = useRouter();
  const [mainTab, setMainTab] = useState<MainTab>("ai");
  const [aiSubTab, setAiSubTab] = useState<AiSubTab>("url");
  const [falseSubTab, setFalseSubTab] = useState<"url" | "text">("url");
  const [url, setUrl] = useState("");
  const [claimUrl, setClaimUrl] = useState("");
  const [claimText, setClaimText] = useState("");
  const [notableOpen, setNotableOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function goAnalyzeUrl() {
    const value =
      url.trim() || "https://twitter.com/example/status/1234567890";
    router.push(`/media/uploading?url=${encodeURIComponent(value)}&type=url`);
  }

  function goAnalyzeFile(file: File | null) {
    const name = file?.name || "Screenshot_2026-05-17_at_4.00.15_PM.png";
    const type = file
      ? file.type.startsWith("video")
        ? "video"
        : file.type.startsWith("audio")
          ? "audio"
          : "image"
      : "image";
    router.push(
      `/media/uploading?file=${encodeURIComponent(name)}&type=${type}`
    );
  }

  function goAnalyzeText() {
    const value =
      claimText.trim() ||
      "Hurricane Helene was caused by government weather manipulation.";
    router.push(`/claim/veracity?fresh=1&text=${encodeURIComponent(value)}`);
  }

  return (
    <div className="flex bg-white dark:bg-slate-950 text-[#041E42] dark:text-slate-100 min-h-screen">
      {/* Main column */}
      <main className="flex-1 min-w-0 p-5 md:p-8">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Verify Media</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Analyze social media for synthetic and manipulated content
          </p>
        </header>

        {/* Tabbed analysis panel — a single bordered box so the inactive tab
            reads clearly against the page */}
        <div className="rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden shadow-sm">
        {/* Main tabs */}
        <div role="tablist" className="grid grid-cols-2 gap-px bg-slate-300 dark:bg-slate-700">
          <TabButton
            active={mainTab === "ai"}
            onClick={() => setMainTab("ai")}
            icon={<HiOutlineSparkles className="w-4 h-4" />}
          >
            Check for AI-Generated Content
          </TabButton>
          <TabButton
            active={mainTab === "false"}
            onClick={() => setMainTab("false")}
            icon={<HiOutlineChatBubbleBottomCenterText className="w-4 h-4" />}
          >
            Check for False Content
          </TabButton>
        </div>

        {/* Tab content card */}
        <section className="bg-[#041E42] dark:bg-slate-900 p-5 md:p-6">
          {mainTab === "ai" && (
            <>
              {/* Light inner panel — high-contrast entry area, per the live site */}
              <div className="bg-slate-200 dark:bg-slate-300 rounded-lg p-5 md:p-6">
                <div className="text-lg font-bold text-[#041E42] mb-3">
                  Add social media post
                </div>

                {aiSubTab === "url" ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      goAnalyzeUrl();
                    }}
                    className="flex gap-3"
                  >
                    <input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      type="text"
                      placeholder="Add a URL…"
                      className="flex-1 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 text-base rounded-lg px-4 py-3 focus:outline-none focus:border-[#00B5E2] focus:ring-1 focus:ring-[#00B5E2]"
                    />
                    <button
                      type="submit"
                      className="bg-[#00B5E2] hover:bg-[#0099C2] text-[#041E42] font-semibold text-base px-6 rounded-lg flex items-center gap-2 transition shrink-0"
                    >
                      Analyze
                      <HiOutlinePaperAirplane className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*,audio/*"
                      className="hidden"
                      onChange={(e) => goAnalyzeFile(e.target.files?.[0] ?? null)}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-slate-400 hover:border-[#00B5E2] hover:bg-white/40 rounded-lg py-9 px-6 text-center transition"
                    >
                      <HiOutlineArrowUpTray className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                      <div className="text-sm text-[#041E42] font-semibold">
                        Drop a file or click to browse
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        Images · video · audio · up to 200 MB
                      </div>
                      <div className="mt-4 inline-flex gap-3 text-slate-600">
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <HiOutlinePhoto className="w-3.5 h-3.5" /> Image
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <HiOutlineFilm className="w-3.5 h-3.5" /> Video
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <HiOutlineMusicalNote className="w-3.5 h-3.5" /> Audio
                        </span>
                      </div>
                    </button>
                  </>
                )}

                {/* Sub-tab pills — below the entry field, per the live site */}
                <div className="inline-flex rounded-lg bg-[#041E42] p-1 mt-4">
                  {(["url", "upload"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setAiSubTab(t)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                        aiSubTab === t
                          ? "bg-slate-600 text-white"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      {t === "url" ? "Social Media URL" : "Upload"}
                    </button>
                  ))}
                </div>

                {/* Version limitation note — video links aren't processed yet */}
                <p className="mt-4 text-xs leading-snug text-[#041E42] flex items-start gap-1.5">
                  <HiOutlineInformationCircle className="w-4 h-4 mt-[1px] shrink-0" />
                  <span>
                    In this version, links to <strong className="font-semibold">video</strong> are
                    not processed. To check the audio of a video, download the MP3 file and upload it
                    directly to analyze.
                  </span>
                </p>
              </div>

              <SupportedSources />
            </>
          )}

          {mainTab === "false" && (
            <>
            <div className="bg-slate-200 dark:bg-slate-300 rounded-lg p-5 md:p-6">
              <div className="text-lg font-bold text-[#041E42] mb-3">
                {falseSubTab === "url" ? "Add social media post" : "Enter text to check"}
              </div>

              {falseSubTab === "url" ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    goAnalyzeText();
                  }}
                  className="flex gap-3"
                >
                  <input
                    value={claimUrl}
                    onChange={(e) => setClaimUrl(e.target.value)}
                    type="text"
                    placeholder="Add a URL…"
                    className="flex-1 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 text-base rounded-lg px-4 py-3 focus:outline-none focus:border-[#00B5E2] focus:ring-1 focus:ring-[#00B5E2]"
                  />
                  <button
                    type="submit"
                    className="bg-[#00B5E2] hover:bg-[#0099C2] text-[#041E42] font-semibold text-base px-6 rounded-lg flex items-center gap-2 transition shrink-0"
                  >
                    Analyze
                    <HiOutlinePaperAirplane className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <>
                  <textarea
                    value={claimText}
                    onChange={(e) => setClaimText(e.target.value)}
                    rows={5}
                    placeholder="Paste or type a claim, headline, or quote to fact-check…"
                    className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 text-base rounded-lg px-4 py-3 focus:outline-none focus:border-[#00B5E2] focus:ring-1 focus:ring-[#00B5E2]"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={goAnalyzeText}
                      className="bg-[#00B5E2] hover:bg-[#0099C2] text-[#041E42] font-semibold text-base px-6 py-2.5 rounded-lg flex items-center gap-2 transition"
                    >
                      Analyze
                      <HiOutlinePaperAirplane className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}

              {/* Sub-tab pills — mirror the AIGC box */}
              <div className="inline-flex rounded-lg bg-[#041E42] p-1 mt-4">
                {(["url", "text"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFalseSubTab(t)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                      falseSubTab === t
                        ? "bg-slate-600 text-white"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {t === "url" ? "Social Media URL" : "Enter Text"}
                  </button>
                ))}
              </div>
            </div>

            {/* The False Content tab accepts a social post URL — social
                platforms only (no Google Drive file upload here). */}
            <SupportedSources sources={SOCIAL_SOURCES} />
            </>
          )}
        </section>
        </div>

        {/* History preview */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold">History</h2>
            <a
              href={mainTab === "false" ? "/media/history?tab=claims" : "/media/history"}
              className="text-sm text-[#041E42] dark:text-slate-300 hover:text-[#00B5E2] inline-flex items-center gap-1"
            >
              See all <HiOutlineArrowRight className="w-4 h-4" />
            </a>
          </div>

          {mainTab === "ai" ? (
            <HistoryMediaPreview />
          ) : (
            <HistoryClaimsPreview />
          )}
        </section>

        {/* Mobile notable cases (xl:hidden) */}
        <section className="xl:hidden mt-10">
          <NotableCasesGrid />
        </section>
      </main>

      {/* Right rail: Notable Cases (xl+) — collapsible via caret */}
      <aside
        className={`hidden xl:flex flex-col shrink-0 border-l border-slate-200 dark:border-slate-800 bg-[#E2E2E2] dark:bg-slate-900 transition-[width] duration-200 ${
          notableOpen ? "w-[340px]" : "w-12"
        }`}
      >
        <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto">
          {notableOpen ? (
            <div className="p-4">
              <div className="flex items-center justify-between pb-4 mb-3">
                <span className="text-sm uppercase tracking-wide font-semibold text-[#041E42] dark:text-slate-100">
                  Notable Cases
                </span>
                <button
                  onClick={() => setNotableOpen(false)}
                  className="text-[#041E42] dark:text-slate-300 hover:text-slate-600 dark:hover:text-white p-1 -m-1 rounded hover:bg-white/40 dark:hover:bg-slate-800 transition"
                  aria-label="Collapse Notable Cases"
                  title="Collapse"
                >
                  <HiOutlineChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col gap-5">
                {REAL_CASES.slice(0, 5).map((c) => (
                  <NotableCard key={c.id} c={c} />
                ))}
              </div>
              <a
                href="/media/notable"
                className="block w-full text-center text-sm text-[#041E42] dark:text-slate-200 mt-5 py-2.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                See more examples
              </a>
            </div>
          ) : (
            <button
              onClick={() => setNotableOpen(true)}
              className="w-full h-full min-h-[calc(100vh-5rem)] flex flex-col items-center pt-3 gap-3 text-[#041E42] dark:text-slate-300 hover:bg-white/40 dark:hover:bg-slate-800 transition"
              aria-label="Expand Notable Cases"
              title="Expand Notable Cases"
            >
              <HiOutlineChevronLeft className="w-5 h-5" />
              <span
                className="text-[11px] uppercase tracking-wide font-semibold whitespace-nowrap"
                style={{ writingMode: "vertical-rl" }}
              >
                Notable Cases
              </span>
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition ${
        active
          ? "bg-[#041E42] text-white dark:bg-slate-900"
          : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-[#041E42] dark:hover:text-white"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

// Social platforms only (no Google Drive) — used by the text/claim tab,
// which takes a social post URL, not an uploaded file.
const SOCIAL_SOURCES = SOURCES.filter((s) => s.name !== "Google Drive");

// Supported platforms row. Defaults to the full list (AIGC box, which also
// supports file upload from Drive); pass a narrower list where appropriate.
function SupportedSources({ sources = SOURCES }: { sources?: typeof SOURCES }) {
  return (
    <div className="mt-6">
      <div className="text-[11px] uppercase tracking-wide text-slate-300 mb-3">
        Supported sources
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-4">
        {sources.map((s) => (
          <div key={s.name} className="flex flex-col items-center text-center">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#00B5E2] text-[#041E42]">
              <s.Icon className="w-4 h-4" />
            </span>
            <span className="text-[10px] text-slate-300 mt-1.5">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Frame border color for the history preview thumbnail — matches the verdict tier.
const VERDICT_BORDER: Record<string, string> = {
  "substantial-evidence": "border-[#D50032]",
  "some-evidence": "border-[#EFCB5F]",
  uncertain: "border-slate-500",
  "little-evidence": "border-[#94C063]",
  pending: "border-slate-600",
};

function HistoryMediaPreview() {
  const recent = historyItems.slice(0, 2);
  return (
    <div className="bg-[#041E42] dark:bg-slate-900 text-white rounded-lg overflow-hidden ring-1 ring-transparent dark:ring-slate-800">
      <div className="hidden lg:grid grid-cols-12 px-4 py-2.5 bg-slate-700/70 text-[11px] uppercase tracking-wide text-slate-200 font-semibold">
        <div className="col-span-3">Preview</div>
        <div className="col-span-5" />
        <div className="col-span-2 text-center">Media Type</div>
        <div className="col-span-2 text-right whitespace-nowrap">First Queried</div>
      </div>

      {recent.map((r, idx) => {
        const Icon = MEDIA_ICON[r.type];
        const border = VERDICT_BORDER[r.verdict] ?? "border-slate-600";
        const isAudio = r.type === "audio";
        return (
          <a
            key={r.id}
            href="/media/analysis"
            className="grid grid-cols-12 px-4 py-4 border-t border-slate-700 items-center hover:bg-slate-800/40 transition gap-4"
          >
            {/* Thumbnail with verdict-colored border */}
            <div className="col-span-3">
              <div className={`relative aspect-video rounded-md border-2 ${border} overflow-hidden ${isAudio ? "bg-white" : "bg-slate-800"}`}>
                <img
                  src={sampleThumbnail(r.type, idx)}
                  alt=""
                  className={`w-full h-full object-center ${isAudio ? "object-contain p-2" : "object-cover"}`}
                  loading="lazy"
                />
              </div>
            </div>

            {/* Pill + URL/name */}
            <div className="col-span-5 min-w-0">
              <div className="mb-2">
                <VerdictBadge verdict={r.verdict} size="sm" />
              </div>
              <div className="text-sm text-slate-300 truncate font-mono">
                http://truemedia-fileuploads.org/{r.id}/{r.name}
              </div>
            </div>

            {/* Media type */}
            <div className="hidden lg:flex col-span-2 items-center justify-center gap-1.5 text-sm text-slate-300">
              <Icon className="w-4 h-4 text-slate-400" />
              <span className="capitalize">{r.type}</span>
            </div>

            {/* Date */}
            <div className="hidden lg:block col-span-2 text-right text-sm text-slate-400 whitespace-nowrap">
              {r.analyzedAt}
            </div>
          </a>
        );
      })}

      <a
        href="/media/history"
        className="block text-center text-sm text-white hover:text-[#00B5E2] py-5 border-t border-slate-700 transition"
      >
        See all <HiOutlineArrowRight className="inline w-4 h-4 ml-1" />
      </a>
    </div>
  );
}

function HistoryClaimsPreview() {
  return (
    <div className="bg-[#041E42] dark:bg-slate-900 text-white rounded-lg overflow-hidden ring-1 ring-transparent dark:ring-slate-800">
      {/* Fixed-width Type + Date lanes so the date can never be squeezed/clipped */}
      <div className="grid grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_6.5rem] gap-4 px-4 py-2.5 bg-slate-700/70 text-[11px] uppercase tracking-wide text-slate-200 font-semibold">
        <div>Preview</div>
        <div className="text-center">Type</div>
        <div className="hidden lg:block text-right whitespace-nowrap">First Queried</div>
      </div>
      {claimHistory.slice(0, 2).map((c) => {
        const p = CLAIM_PILL[c.verdict];
        return (
          <a
            key={c.id}
            href={`/claim/veracity?id=${c.id}`}
            className="grid grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_6.5rem] px-4 py-4 border-t border-slate-700 items-start hover:bg-slate-800/40 transition gap-4"
          >
            <div className="min-w-0">
              <div className="mb-2">
                <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded ${p.classes}`}>
                  {p.label}
                </span>
              </div>
              <div className="text-sm line-clamp-2 break-words text-slate-200">
                {c.text}
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-sm text-slate-300 pt-1">
              <HiOutlineDocumentText className="w-4 h-4 text-slate-400" />
              <span className="text-xs">Text</span>
            </div>
            <div className="hidden lg:block text-right text-xs text-slate-400 whitespace-nowrap pt-1">
              {c.analyzedAt}
            </div>
          </a>
        );
      })}

      <a
        href="/media/history?tab=claims"
        className="block text-center text-sm text-white hover:text-[#00B5E2] py-5 border-t border-slate-700 transition"
      >
        See all <HiOutlineArrowRight className="inline w-4 h-4 ml-1" />
      </a>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Notable case card — real cases from the production repo's quiz
// (realData.ts). Pill reflects the case's documented ground truth using
// the real rank badge colors; never claims manipulation we can't back.
// ─────────────────────────────────────────────────────────────────────

const TRUTH_PILL: Record<RealCase["groundTruth"], { label: (t: string) => string; classes: string }> = {
  fake: { label: (t) => `AI manipulated ${t}`, classes: "bg-[#862633] text-[#F6C6D0]" },
  authentic: { label: (t) => `Authentic ${t}`, classes: "bg-[#3F6B07] text-[#C2DBA4]" },
  unlabeled: { label: () => "Unlabeled", classes: "bg-[#63666A] text-white" },
};

function hostnameOf(url?: string) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function NotableCard({ c }: { c: RealCase }) {
  const TypeIcon = MEDIA_ICON[c.mediaType];
  const truth = TRUTH_PILL[c.groundTruth];
  const sourceHost = hostnameOf(c.citationUrl);
  const thumb = caseThumbnail(c);
  const waveform = isWaveform(c);

  return (
    <article className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[#E2E2E2] dark:bg-slate-800 p-4 shadow-sm hover:shadow-md transition">
      {/* Title + picture icon */}
      <div className="flex items-start gap-2 min-h-[56px]">
        <h3 className="flex-1 text-base font-semibold leading-tight text-[#041E42] dark:text-slate-100">
          {c.title}
        </h3>
        <TypeIcon className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
      </div>

      {/* Real thumbnail frame (image/video) or audio waveform */}
      <div className={`relative mt-3 aspect-video rounded-xl overflow-hidden ${waveform ? "bg-white" : "bg-slate-800"}`}>
        <img
          src={thumb}
          alt=""
          className={`absolute inset-0 w-full h-full object-center ${waveform ? "object-contain p-3" : "object-cover"}`}
          loading="lazy"
        />
        <div
          className={`absolute bottom-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow ${truth.classes}`}
        >
          {truth.label(c.mediaType)}
        </div>
      </div>

      {/* Footer: documentation source + More */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="text-xs text-[#041E42] dark:text-slate-300 truncate min-w-0">
          {sourceHost ? (
            <>
              Source: <span className="font-mono">{sourceHost}</span>
            </>
          ) : (
            "TrueMedia curated case"
          )}
        </div>
        {/* "More" opens the TrueMedia verdict page, not the external source */}
        <a
          href="/media/analysis"
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-transparent text-sm text-[#041E42] dark:text-slate-200 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition shrink-0"
        >
          More <HiOutlineArrowRight className="w-4 h-4" />
        </a>
      </div>
    </article>
  );
}

// Mobile fallback grid (right rail is hidden below xl).
function NotableCasesGrid() {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-bold tracking-tight">Notable Cases</h2>
        <a
          href="/media/notable"
          className="text-sm hover:text-[#00B5E2] inline-flex items-center gap-1"
        >
          See all <HiOutlineArrowRight className="w-4 h-4" />
        </a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {REAL_CASES.slice(0, 6).map((c) => (
          <NotableCard key={c.id} c={c} />
        ))}
      </div>
    </>
  );
}
