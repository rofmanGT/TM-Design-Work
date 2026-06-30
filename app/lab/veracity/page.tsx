import { Suspense } from "react";
import { Chrome } from "@/components/Chrome";
import { VeracityAB } from "@/components/lab/VeracityAB";

export default function Page() {
  return (
    <Chrome>
      <Suspense fallback={null}>
        <VeracityAB />
      </Suspense>
    </Chrome>
  );
}
