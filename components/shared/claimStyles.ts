import type { ClaimVerdict } from "@/components/commercial/sampleData";

// Georgetown tertiary palette: Green 369 / Red 202 / Yellow 1205 /
// Georgetown Gray, with navy or white text (whichever clears AA).
export const CLAIM_PILL: Record<ClaimVerdict, { label: string; classes: string }> = {
  "likely-true": {
    label: "Likely True",
    classes: "bg-[#64A70B] text-[#041E42]",
  },
  "likely-false": {
    label: "Likely False",
    classes: "bg-[#862633] text-white",
  },
  unresolved: {
    label: "Unresolved",
    classes: "bg-[#63666A] text-white",
  },
  mixed: {
    label: "Mixed Evidence",
    classes: "bg-[#F8E08E] text-[#041E42]",
  },
};
