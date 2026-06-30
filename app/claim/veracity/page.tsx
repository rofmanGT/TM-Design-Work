import { Suspense } from "react";
import { Chrome } from "@/components/Chrome";
import { VeracityPage } from "@/components/VeracityPage";

export default function Page() {
  return (
    <Chrome>
      <Suspense fallback={null}>
        <VeracityPage />
      </Suspense>
    </Chrome>
  );
}
