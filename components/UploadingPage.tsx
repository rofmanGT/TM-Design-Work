"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineLink,
  HiOutlinePhoto,
  HiOutlineFilm,
  HiOutlineMusicalNote,
} from "react-icons/hi2";

// ─────────────────────────────────────────────────────────────────────
// Transfer timing — feels like a real upload/fetch, not instant.
// Total duration includes a "completing" pause before redirect.
// ─────────────────────────────────────────────────────────────────────

const TRANSFER_BY_TYPE: Record<string, { ms: number; sizeMb: number; speedMbs: number }> = {
  image: { ms: 1800, sizeMb: 1.2, speedMbs: 0.7 },
  audio: { ms: 4200, sizeMb: 4.6, speedMbs: 1.1 },
  video: { ms: 9500, sizeMb: 32.8, speedMbs: 3.5 },
  url: { ms: 3200, sizeMb: 0, speedMbs: 0 }, // URL fetch — no local file size shown
};

const COMPLETION_HOLD_MS = 700;

type Mode = "upload" | "fetch";

export function UploadingPage() {
  const router = useRouter();
  const search = useSearchParams();

  const url = search.get("url") || "";
  const file = search.get("file") || "";
  const type = search.get("type") || (url ? "url" : "image");

  const mode: Mode = url ? "fetch" : "upload";
  const subject = url || file || "Uploaded media";

  const transfer =
    TRANSFER_BY_TYPE[type] ??
    (mode === "fetch" ? TRANSFER_BY_TYPE.url : TRANSFER_BY_TYPE.image);

  const startedAt = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let raf = 0;
    function tick() {
      const e = Date.now() - startedAt.current;
      setElapsed(e);

      if (e >= transfer.ms && !complete) {
        setComplete(true);
        setTimeout(() => {
          const params = new URLSearchParams({ fresh: "1", type });
          if (file) params.set("file", file);
          if (url) params.set("url", url);
          router.push(`/media/analysis?${params.toString()}`);
        }, COMPLETION_HOLD_MS);
        return;
      }
      if (e < transfer.ms + COMPLETION_HOLD_MS) {
        raf = requestAnimationFrame(tick);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [transfer.ms, router, file, url, type, complete]);

  const progress = Math.min(100, (elapsed / transfer.ms) * 100);
  const pct = complete ? 100 : Math.floor(progress);

  // Status messages tick along the timeline.
  const statusMsg = useMemo(() => {
    if (complete) return mode === "fetch" ? "Fetch complete" : "Upload complete";
    if (mode === "fetch") {
      if (elapsed < 800) return "Connecting to source";
      if (elapsed < 1800) return "Authenticating";
      if (elapsed < transfer.ms - 400) return "Downloading media";
      return "Finalising";
    }
    if (elapsed < 400) return "Preparing upload";
    if (elapsed < transfer.ms - 400) return "Uploading file";
    return "Verifying transfer";
  }, [elapsed, complete, mode, transfer.ms]);

  const TypeIcon =
    type === "video"
      ? HiOutlineFilm
      : type === "audio"
        ? HiOutlineMusicalNote
        : type === "url"
          ? HiOutlineLink
          : HiOutlinePhoto;

  const transferred = (transfer.sizeMb * (pct / 100)).toFixed(1);
  const remainingMs = Math.max(0, transfer.ms - elapsed);
  const remainingS = Math.ceil(remainingMs / 1000);

  return (
    <main className="bg-white dark:bg-slate-950 text-[#041E42] dark:text-slate-100 min-h-[calc(100vh-5rem)] flex items-center justify-center p-5">
      <div className="w-full max-w-xl">
        <div className="bg-[#041E42] dark:bg-slate-900 text-white rounded-xl ring-1 ring-transparent dark:ring-slate-800 p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-6">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-medium mb-1.5">
                {mode === "fetch" ? "Fetching from URL" : `Uploading ${type}`}
              </div>
              <div className="inline-flex items-center gap-2 max-w-full min-w-0">
                <TypeIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-sm font-mono truncate">{subject}</span>
              </div>
            </div>
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition shrink-0"
              aria-label="Cancel upload"
            >
              <HiOutlineXMark className="w-4 h-4" />
              Cancel
            </button>
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00B5E2] to-[#3366FF] rounded-full"
                style={{ width: `${pct}%`, transition: "width 80ms linear" }}
              />
              {!complete && (
                <div
                  className="absolute inset-y-0 w-1/4 opacity-40"
                  style={{
                    left: `${Math.max(0, pct - 25)}%`,
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                    animation: "shimmer 1.5s linear infinite",
                  }}
                />
              )}
            </div>
            <style>{`
              @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(400%); }
              }
            `}</style>
          </div>

          {/* Stats row */}
          <div className="flex items-baseline justify-between mb-6">
            <span className="text-3xl font-semibold font-mono text-white">
              {pct}%
            </span>
            <span className="text-[11px] uppercase tracking-wider text-slate-400">
              {statusMsg}
              {!complete && <AnimatedDots />}
            </span>
          </div>

          {/* Metadata grid */}
          {mode === "upload" && (
            <dl className="grid grid-cols-3 gap-3 text-xs">
              <Stat
                label="Transferred"
                value={`${transferred} / ${transfer.sizeMb.toFixed(1)} MB`}
              />
              <Stat
                label="Speed"
                value={complete ? "—" : `${transfer.speedMbs.toFixed(1)} MB/s`}
              />
              <Stat
                label="Remaining"
                value={complete ? "0s" : `~${remainingS}s`}
              />
            </dl>
          )}

          {mode === "fetch" && (
            <dl className="grid grid-cols-2 gap-3 text-xs">
              <Stat label="Source" value={mode === "fetch" ? hostnameOf(url) : "Local"} />
              <Stat label="Remaining" value={complete ? "0s" : `~${remainingS}s`} />
            </dl>
          )}

          {/* Complete state */}
          {complete && (
            <div className="mt-6 flex items-center gap-2 text-emerald-400 text-sm">
              <HiOutlineCheckCircle className="w-5 h-5" />
              Opening analysis…
            </div>
          )}
        </div>

        {/* Subtle hint */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-5 leading-relaxed">
          {mode === "fetch"
            ? "We're fetching the original media from the source URL before analysis begins."
            : "Your file is being uploaded to TrueMedia. Analysis starts as soon as the transfer completes."}
        </p>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800/60 rounded-md p-3">
      <dt className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">{label}</dt>
      <dd className="text-sm font-mono text-white">{value}</dd>
    </div>
  );
}

function AnimatedDots() {
  return (
    <span aria-hidden>
      <span
        className="inline-block w-1 h-1 mx-0.5 bg-current rounded-full"
        style={{ animation: "ud-bounce 1.4s ease-in-out infinite", animationDelay: "0s" }}
      />
      <span
        className="inline-block w-1 h-1 mx-0.5 bg-current rounded-full"
        style={{ animation: "ud-bounce 1.4s ease-in-out infinite", animationDelay: "0.2s" }}
      />
      <span
        className="inline-block w-1 h-1 mx-0.5 bg-current rounded-full"
        style={{ animation: "ud-bounce 1.4s ease-in-out infinite", animationDelay: "0.4s" }}
      />
      <style>{`
        @keyframes ud-bounce {
          0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }
      `}</style>
    </span>
  );
}

function hostnameOf(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url.slice(0, 30);
  }
}
