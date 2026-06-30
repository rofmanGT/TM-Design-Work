import type { ClaimVerdict } from "@/components/commercial/sampleData";

export const CLAIM_PILL: Record<ClaimVerdict, { label: string; classes: string }> = {
  "likely-true": {
    label: "Likely True",
    classes: "bg-emerald-900/40 text-emerald-300 dark:bg-emerald-900/30",
  },
  "likely-false": {
    label: "Likely False",
    classes: "bg-red-900/40 text-red-300 dark:bg-red-900/30",
  },
  unresolved: {
    label: "Unresolved",
    classes: "bg-slate-700/60 text-slate-300",
  },
  mixed: {
    label: "Mixed Evidence",
    classes: "bg-amber-900/40 text-amber-300 dark:bg-amber-900/30",
  },
};
