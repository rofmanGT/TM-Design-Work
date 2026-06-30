import { Chrome } from "@/components/Chrome";
import {
  ConfidenceBar,
  DetectorCard,
  EnsembleVerdict,
  VerdictBadge,
  type DetectorResult,
} from "@/components/ensemble";
import { HiOutlinePhoto, HiOutlineSparkles } from "react-icons/hi2";

// Sample data — mixed verdicts so the lab shows all states at once.
const sampleEnsemble: DetectorResult[] = [
  { name: "General-Purpose Image Detector", confidence: 86, weight: 0.4 },
  { name: "Frequency-Domain Image Detector", confidence: 80, weight: 0.3 },
  { name: "Face Consistency", confidence: 72, weight: 0.2 },
  { name: "Diffusion Fingerprint", confidence: 51, weight: 0.1 },
];

const lowEvidenceEnsemble: DetectorResult[] = [
  { name: "General-Purpose Image Detector", confidence: 12, weight: 0.4 },
  { name: "Frequency-Domain Image Detector", confidence: 18, weight: 0.3 },
  { name: "Face Consistency", confidence: 22, weight: 0.2 },
  { name: "Diffusion Fingerprint", confidence: 8, weight: 0.1 },
];

const mixedEnsemble: DetectorResult[] = [
  { name: "General-Purpose Image Detector", confidence: 81, weight: 0.4 },
  { name: "Frequency-Domain Image Detector", confidence: 22, weight: 0.3 },
  { name: "Face Consistency", confidence: 64, weight: 0.2 },
  { name: "Diffusion Fingerprint", verdict: "pending", confidence: 0, weight: 0.1 },
];

function LabSection({
  number,
  title,
  blurb,
  children,
}: {
  number: string;
  title: string;
  blurb?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="text-[11px] uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 mb-1">{number}</div>
      <h2 className="text-xl font-bold mb-1">{title}</h2>
      {blurb && <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 max-w-2xl">{blurb}</p>}
      {children}
    </section>
  );
}

export default function LabPage() {
  return (
    <Chrome>
      <main className="bg-white dark:bg-slate-950 text-[#041E42] dark:text-slate-100 min-h-screen p-6 md:p-8 space-y-14">
          <header className="border-b border-slate-200 dark:border-slate-800 pb-6 flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold">Ensemble &amp; detector lab</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
                Drop-in React components for the TrueMedia analysis page. Files live in{" "}
                <code className="text-[13px] bg-slate-100 dark:bg-slate-800 dark:text-slate-200 rounded px-1.5 py-0.5">
                  components/ensemble/
                </code>
                . Verdict tiers, colors, and ensemble math are centralized in{" "}
                <code className="text-[13px] bg-slate-100 dark:bg-slate-800 dark:text-slate-200 rounded px-1.5 py-0.5">verdict.ts</code> —
                swap thresholds or the aggregation function there and everything downstream picks
                it up.
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <a
                href="/"
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-[#041E42] dark:hover:text-slate-100 underline underline-offset-4"
              >
                ← Back to Verify Media
              </a>
              <a
                href="/media/analysis"
                className="bg-[#041E42] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#082854] transition"
              >
                See components in context →
              </a>
            </div>
          </header>

          {/* 00 — Text-claim fact-check ensemble (two design proposals) */}
          <section className="rounded-lg border border-[#00B5E2]/30 bg-[#00B5E2]/5 dark:bg-[#00B5E2]/10 p-5 md:p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="max-w-2xl">
                <div className="text-[11px] uppercase tracking-[0.08em] text-[#0883a3] dark:text-[#33D6FF] font-semibold mb-1">
                  New · Proposal
                </div>
                <h2 className="text-xl font-bold mb-1">
                  Text-claim fact-check ensemble
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Two designs for showing more than one model output on the text
                  detection page — a near-duplicate of today&rsquo;s claim result,
                  extended so the verdict is the aggregate of several fact-check
                  models. Toggle between both versions at the top of the page.
                </p>
              </div>
              <a
                href="/lab/veracity?fresh=1"
                className="bg-[#041E42] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#082854] transition shrink-0"
              >
                Open A / B designs →
              </a>
            </div>
          </section>

          {/* 01 — Ensemble verdict card */}
          <LabSection
            number="01"
            title="Ensemble verdict card"
            blurb="Replaces the current Analysis / Detectors / Results table on the hero. Shows aggregate verdict + manipulation probability + agreement count, then drops into a per-detector breakdown so users can see *why* the verdict landed where it did."
          >
            <div className="grid md:grid-cols-2 gap-5">
              <EnsembleVerdict detectors={sampleEnsemble} />
              <EnsembleVerdict detectors={lowEvidenceEnsemble} />
            </div>
            <div className="mt-5 max-w-2xl">
              <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                Mixed detector results (with one pending)
              </div>
              <EnsembleVerdict detectors={mixedEnsemble} />
            </div>
          </LabSection>

          {/* 02 — Refreshed detector card */}
          <LabSection
            number="02"
            title="Refreshed detector card"
            blurb="Replaces the current per-detector card. The thin colored strip across the top encodes the verdict tier at a glance; the percentage is paired with the pill in one block instead of floating right. The optional description slot is left empty by default — populate it only from a detector's own published model card, never with generated copy."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <DetectorCard
                name="General-Purpose Image Detector"
                confidence={86}
                weight={0.4}
                icon={<HiOutlinePhoto className="w-5 h-5" />}
              />
              <DetectorCard
                name="Face Consistency"
                confidence={58}
                weight={0.2}
                icon={<HiOutlineSparkles className="w-5 h-5" />}
              />
              <DetectorCard
                name="Diffusion Fingerprint"
                confidence={18}
                weight={0.1}
                icon={<HiOutlinePhoto className="w-5 h-5" />}
              />
            </div>
          </LabSection>

          {/* 03 — Verdict badges (all tiers) */}
          <LabSection
            number="03"
            title="Verdict badges"
            blurb="The full tier ladder. Pending uses the existing blink animation. Sizes: md (default) and sm (used inside the per-detector breakdown)."
          >
            <div className="bg-[#041E42] p-5 rounded-lg flex flex-wrap gap-3 items-center">
              <VerdictBadge verdict="substantial-evidence" />
              <VerdictBadge verdict="some-evidence" />
              <VerdictBadge verdict="little-evidence" />
              <VerdictBadge verdict="uncertain" />
              <VerdictBadge verdict="pending" />
              <span className="text-slate-300 dark:text-slate-500 text-xs mx-2">— small —</span>
              <VerdictBadge verdict="substantial-evidence" size="sm" />
              <VerdictBadge verdict="some-evidence" size="sm" />
              <VerdictBadge verdict="little-evidence" size="sm" />
              <VerdictBadge verdict="uncertain" size="sm" />
            </div>
          </LabSection>

          {/* 04 — Confidence bar primitive */}
          <LabSection
            number="04"
            title="Confidence bar primitive"
            blurb="Shared by the ensemble card and the detector card. Fill color is derived from the value via verdictFromConfidence — change the thresholds there and every bar in the app re-tiers."
          >
            <div className="bg-[#041E42] text-white p-5 rounded-lg max-w-md space-y-5">
              {[
                { v: 15, label: "15% — little evidence" },
                { v: 35, label: "35% — uncertain" },
                { v: 62, label: "62% — some evidence" },
                { v: 86, label: "86% — substantial evidence" },
              ].map((row) => (
                <div key={row.v}>
                  <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                    {row.label}
                  </div>
                  <ConfidenceBar value={row.v} showScale />
                </div>
              ))}
            </div>
          </LabSection>
      </main>
    </Chrome>
  );
}
