"use client";

import { useState } from "react";
import {
  HiOutlineCodeBracket,
  HiOutlineBookOpen,
  HiOutlineCpuChip,
  HiOutlineDocumentText,
  HiOutlineClipboard,
  HiOutlineCheck,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";

// ─────────────────────────────────────────────────────────────────────
// Footer — reinforces the open-source / academic identity on every page.
//
// NOTE FOR THE TEAM: links below are placeholders ("#") for the mockup.
// Wire them to the real repository, docs, and API endpoints before launch.
// The build/version strings are illustrative.
// ─────────────────────────────────────────────────────────────────────

const BUILD_VERSION = "v2.3.1";
const BUILD_HASH = "a1b9f3c";

// Standard tool citation. References the project itself, not any analyzed
// media — safe to ship as a fixed string.
const BIBTEX = `@misc{truemedia2026,
  title        = {TrueMedia: Open-Source Deepfake Detection},
  author       = {{Georgetown University Media Integrity Initiative}},
  year         = {2026},
  howpublished = {\\url{https://www.truemedia.org}},
  note         = {Ensemble detection platform, ${BUILD_VERSION}}
}`;

type FooterLink = { label: string; href: string; external?: boolean };

const PROJECT_LINKS: FooterLink[] = [
  { label: "Methodology", href: "#" },
  { label: "Models & weights", href: "#" },
  { label: "Documentation", href: "#" },
  { label: "Changelog", href: "#" },
];

const SOURCE_LINKS: FooterLink[] = [
  { label: "Source on GitHub", href: "#", external: true },
  { label: "REST API", href: "#" },
  { label: "Contributing guide", href: "#" },
  { label: "Report an issue", href: "#", external: true },
];

export function Footer() {
  const [copied, setCopied] = useState(false);

  function copyCitation() {
    navigator.clipboard?.writeText(BIBTEX).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[#041E42] dark:text-slate-300">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Brand + attribution */}
          <div className="col-span-2 lg:col-span-4">
            <span className="inline-flex items-center bg-[#041E42] rounded-md px-3 py-2 mb-3">
              {/* Official brand mark (white + lime on transparent) on its native navy */}
              <img
                src="/logos/trueMediaLogoTextDefault.svg"
                alt="TrueMedia"
                className="h-6 w-auto"
              />
            </span>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 max-w-xs">
              An open-source research project of{" "}
              <span className="font-medium text-[#041E42] dark:text-slate-200">
                Georgetown University&rsquo;s Media Integrity Initiative
              </span>
              .
            </p>
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <Badge icon={<HiOutlineCodeBracket className="w-3.5 h-3.5" />}>
                Open Source
              </Badge>
              <a
                href="#"
                className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-[#00B5E2] underline underline-offset-2"
              >
                View license
              </a>
            </div>
          </div>

          {/* Project links */}
          <FooterColumn
            title="Project"
            icon={<HiOutlineBookOpen className="w-4 h-4" />}
            links={PROJECT_LINKS}
          />

          {/* Source links */}
          <FooterColumn
            title="Source & API"
            icon={<HiOutlineCpuChip className="w-4 h-4" />}
            links={SOURCE_LINKS}
          />

          {/* Cite */}
          <div className="col-span-2 lg:col-span-2">
            <h3 className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] font-semibold text-slate-500 dark:text-slate-400 mb-3">
              <HiOutlineDocumentText className="w-4 h-4" />
              Cite this tool
            </h3>
            <button
              onClick={copyCitation}
              className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-medium border border-slate-300 dark:border-slate-700 hover:border-[#00B5E2] dark:hover:border-[#00B5E2] rounded-md px-3 py-2 transition text-[#041E42] dark:text-slate-200"
            >
              {copied ? (
                <>
                  <HiOutlineCheck className="w-4 h-4 text-emerald-500" />
                  Copied BibTeX
                </>
              ) : (
                <>
                  <HiOutlineClipboard className="w-4 h-4" />
                  Copy BibTeX
                </>
              )}
            </button>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-500 leading-snug">
              For use in academic and journalistic work.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-500">
          <div>
            © 2026 TrueMedia · Georgetown University. Released for research and
            public-interest use.
          </div>
          <div className="font-mono tabular-nums">
            {BUILD_VERSION} · build {BUILD_HASH}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  icon,
  links,
}: {
  title: string;
  icon: React.ReactNode;
  links: FooterLink[];
}) {
  return (
    <div className="col-span-1 lg:col-span-2">
      <h3 className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] font-semibold text-slate-500 dark:text-slate-400 mb-3">
        {icon}
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              target={l.external ? "_blank" : undefined}
              rel={l.external ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-[#00B5E2] dark:hover:text-[#00B5E2] transition"
            >
              {l.label}
              {l.external && (
                <HiOutlineArrowTopRightOnSquare className="w-3 h-3 opacity-60" />
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Badge({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#00B5E2]/15 text-[#0883a3] dark:text-[#33D6FF] ring-1 ring-[#00B5E2]/30">
      {icon}
      {children}
    </span>
  );
}
