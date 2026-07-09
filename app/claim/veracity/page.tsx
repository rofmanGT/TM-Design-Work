import { Suspense } from "react";
import { Chrome } from "@/components/Chrome";
import { VeracityAB } from "@/components/lab/VeracityAB";

// The text-claim result page — the fact-check ensemble "Model Panel" design.
export default function Page() {
  return (
    <Chrome>
      <Suspense fallback={null}>
        <VeracityAB />
      </Suspense>
    </Chrome>
  );
}
