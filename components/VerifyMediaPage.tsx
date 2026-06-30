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
} from "react-icons/hi2";
import {
  FaRedditAlien,
  FaGoogleDrive,
  FaInstagram,
  FaFacebookF,
  FaXTwitter,
} from "react-icons/fa6";
import { VerdictBadge } from "@/components/ensemble";
import {
  historyItems,
  notableCases,
  claimHistory,
} from "@/components/commercial/sampleData";
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
  const [url, setUrl] = useState("");
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
          <h1 className="text-3xl font-bold">Verify Media</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Analyze social media for synthetic and manipulated content
          </p>
        </header>

        {/* Main tabs */}
        <div role="tablist" className="grid grid-cols-2 gap-px bg-slate-200 dark:bg-slate-800 rounded-t-lg overflow-hidden">
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
        <section className="bg-[#041E42] dark:bg-slate-900 rounded-b-lg p-5 md:p-6 ring-1 ring-transparent dark:ring-slate-800">
          {mainTab === "ai" && (
            <>
              {/* Sub-tab pills */}
              <div className="inline-flex rounded-md bg-slate-900/60 dark:bg-slate-800 p-1 mb-4">
                {(["url", "upload"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setAiSubTab(t)}
                    className={`px-3.5 py-1.5 rounded text-xs font-medium transition ${
                      aiSubTab === t
                        ? "bg-[#00B5E2] text-[#041E42]"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {t === "url" ? "Social Media URL" : "Upload File"}
                  </button>
                ))}
              </div>

              {aiSubTab === "url" ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    goAnalyzeUrl();
                  }}
                >
                  <label className="block text-[11px] uppercase tracking-wide text-slate-400 mb-2">
                    Add social media post
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      type="text"
                      placeholder="Paste a URL from X, Reddit, Truth Social, Facebook, Instagram, Google Drive…"
                      className="flex-1 bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-[#00B5E2] focus:ring-1 focus:ring-[#00B5E2]"
                    />
                    <button
                      type="submit"
                      className="bg-[#00B5E2] hover:bg-[#0099C2] text-[#041E42] font-semibold text-sm px-5 rounded-md flex items-center gap-2 transition shrink-0"
                    >
                      Analyze
                      <HiOutlinePaperAirplane className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <label className="block text-[11px] uppercase tracking-wide text-slate-400 mb-2">
                    Upload file — image, video, or audio
                  </label>
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
                    className="w-full border-2 border-dashed border-slate-600 hover:border-[#00B5E2] hover:bg-slate-800/40 rounded-lg py-10 px-6 text-center transition"
                  >
                    <HiOutlineArrowUpTray className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                    <div className="text-sm text-white font-medium">
                      Drop a file or click to browse
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Images · video · audio · up to 200 MB
                    </div>
                    <div className="mt-4 inline-flex gap-3 text-slate-400">
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

              {/* Supported sources */}
              <div className="mt-6">
                <div className="text-[11px] uppercase tracking-wide text-slate-300 mb-3">
                  Supported sources
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-4">
                  {SOURCES.map((s) => (
                    <div key={s.name} className="flex flex-col items-center text-center">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#00B5E2] text-[#041E42]">
                        <s.Icon className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] text-slate-300 mt-1.5">{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {mainTab === "false" && (
            <>
              <div className="inline-flex rounded-md bg-slate-900/60 dark:bg-slate-800 p-1 mb-4">
                <span className="px-3.5 py-1.5 rounded text-xs font-medium bg-[#00B5E2] text-[#041E42]">
                  Enter Text
                </span>
              </div>
              <label className="block text-[11px] uppercase tracking-wide text-slate-400 mb-2">
                Enter text to check
              </label>
              <textarea
                value={claimText}
                onChange={(e) => setClaimText(e.target.value)}
                rows={5}
                placeholder="Paste or type a claim, headline, or quote to fact-check…"
                className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-[#00B5E2] focus:ring-1 focus:ring-[#00B5E2]"
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={goAnalyzeText}
                  className="bg-[#00B5E2] hover:bg-[#0099C2] text-[#041E42] font-semibold text-sm px-5 py-2 rounded-md flex items-center gap-2 transition"
                >
                  Analyze
                  <HiOutlinePaperAirplane className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </section>

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
                {notableCases.slice(0, 5).map((c) => (
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
          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-[#041E42] dark:hover:text-white"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

// Frame border color for the history preview thumbnail — matches the verdict tier.
const VERDICT_BORDER: Record<string, string> = {
  "substantial-evidence": "border-[#DC2626]",
  "some-evidence": "border-[#F59E0B]",
  uncertain: "border-slate-500",
  "little-evidence": "border-[#84CC16]",
  pending: "border-slate-600",
};

function HistoryMediaPreview() {
  const recent = historyItems.slice(0, 2);
  return (
    <div className="bg-[#041E42] dark:bg-slate-900 text-white rounded-lg overflow-hidden ring-1 ring-transparent dark:ring-slate-800">
      <div className="hidden lg:grid grid-cols-12 px-4 py-2.5 bg-slate-700/70 text-[11px] uppercase tracking-wide text-slate-200 font-semibold">
        <div className="col-span-3">Preview</div>
        <div className="col-span-6" />
        <div className="col-span-2 text-center">Media Type</div>
        <div className="col-span-1 text-right">First Queried</div>
      </div>

      {recent.map((r) => {
        const Icon = MEDIA_ICON[r.type];
        const border = VERDICT_BORDER[r.verdict] ?? "border-slate-600";
        return (
          <a
            key={r.id}
            href="/media/analysis"
            className="grid grid-cols-12 px-4 py-4 border-t border-slate-700 items-center hover:bg-slate-800/40 transition gap-4"
          >
            {/* Thumbnail with verdict-colored border */}
            <div className="col-span-3">
              <div className={`relative aspect-video rounded-md border-2 ${border} bg-slate-800 overflow-hidden flex items-center justify-center`}>
                <Icon className="w-8 h-8 text-slate-600" />
              </div>
            </div>

            {/* Pill + URL/name */}
            <div className="col-span-6 min-w-0">
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
            <div className="hidden lg:block col-span-1 text-right text-sm text-slate-400 whitespace-nowrap">
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
      <div className="grid grid-cols-12 px-4 py-2.5 bg-slate-700/70 text-[11px] uppercase tracking-wide text-slate-200 font-semibold">
        <div className="col-span-8 lg:col-span-9">Preview</div>
        <div className="col-span-2 text-center">Type</div>
        <div className="hidden lg:block col-span-1 text-right">First Queried</div>
      </div>
      {claimHistory.slice(0, 2).map((c) => {
        const p = CLAIM_PILL[c.verdict];
        return (
          <a
            key={c.id}
            href={`/claim/veracity?id=${c.id}`}
            className="grid grid-cols-12 px-4 py-4 border-t border-slate-700 items-start hover:bg-slate-800/40 transition gap-4"
          >
            <div className="col-span-8 lg:col-span-9 min-w-0">
              <div className="mb-2">
                <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded ${p.classes}`}>
                  {p.label}
                </span>
              </div>
              <div className="text-sm line-clamp-2 break-words text-slate-200">
                {c.text}
              </div>
            </div>
            <div className="col-span-2 flex items-center justify-center gap-1.5 text-sm text-slate-300 pt-1">
              <HiOutlineDocumentText className="w-4 h-4 text-slate-400" />
              <span className="text-xs">Text</span>
            </div>
            <div className="hidden lg:block col-span-1 text-right text-sm text-slate-400 whitespace-nowrap pt-1">
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
// Notable case card — matches TrueMedia's layout: title + picture icon row,
// image with "AI manipulated" pill overlay, blurb, "Appeared in" + More.
// ─────────────────────────────────────────────────────────────────────

const APPEARED_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  X: FaXTwitter,
  Reddit: FaRedditAlien,
  Instagram: FaInstagram,
  Facebook: FaFacebookF,
  "Truth Social": TruthIcon,
  TikTok: FaInstagram, // close enough fallback in our icon set
};

// Distinct-ish gradient per case so the placeholder images look varied.
const CASE_GRADIENT: Record<string, string> = {
  "n-001": "from-amber-700 via-amber-600 to-rose-700",
  "n-002": "from-slate-700 via-slate-600 to-orange-800",
  "n-003": "from-zinc-700 via-stone-600 to-zinc-800",
  "n-004": "from-indigo-700 via-violet-700 to-purple-800",
  "n-005": "from-orange-700 via-red-700 to-rose-900",
  "n-006": "from-cyan-800 via-blue-800 to-indigo-900",
};

function NotableCard({ c }: { c: (typeof notableCases)[number] }) {
  const TypeIcon = MEDIA_ICON[c.type];
  const AppearedIcon = APPEARED_ICON[c.appearedIn] ?? FaXTwitter;
  const gradient = CASE_GRADIENT[c.id] ?? "from-slate-700 to-slate-800";

  return (
    <article className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-[#E2E2E2] dark:bg-slate-800 p-4 shadow-sm hover:shadow-md transition">
      {/* Title + picture icon */}
      <div className="flex items-start gap-2 min-h-[56px]">
        <h3 className="flex-1 text-base font-semibold leading-tight text-[#041E42] dark:text-slate-100">
          {c.name}
        </h3>
        <TypeIcon className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
      </div>

      {/* Image with AI manipulated pill */}
      <div className="relative mt-3 h-32 rounded-xl overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        <div className="absolute inset-0 flex items-center justify-center text-white/30">
          <TypeIcon className="w-12 h-12" />
        </div>
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-red-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow">
          <span className="flex h-3 w-3 items-center justify-center rounded-full border border-white text-[9px] leading-none">
            ×
          </span>
          AI manipulated {c.type}
        </div>
      </div>

      {/* Footer: appeared-in + More */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-[#041E42] dark:text-slate-300 inline-flex items-center gap-1.5">
          Appeared in <AppearedIcon className="w-3.5 h-3.5" />
        </div>
        <a
          href="/media/analysis"
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-transparent text-sm text-[#041E42] dark:text-slate-200 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        >
          More <HiOutlineArrowRight className="w-4 h-4" />
        </a>
      </div>
    </article>
  );
}

function NotableCasesGrid() {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-bold">Notable Cases</h2>
        <a
          href="/media/notable"
          className="text-sm hover:text-[#00B5E2] inline-flex items-center gap-1"
        >
          See all <HiOutlineArrowRight className="w-4 h-4" />
        </a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {notableCases.slice(0, 6).map((c) => (
          <NotableCard key={c.id} c={c} />
        ))}
      </div>
    </>
  );
}
