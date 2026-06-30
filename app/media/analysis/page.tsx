import { Suspense } from "react";
import { Chrome } from "@/components/Chrome";
import { CommercialAnalysisPage } from "@/components/commercial/CommercialAnalysisPage";

export default function Page() {
  return (
    <Chrome>
      <Suspense fallback={null}>
        <CommercialAnalysisPage />
      </Suspense>
    </Chrome>
  );
}
