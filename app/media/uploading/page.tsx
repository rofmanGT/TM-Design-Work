import { Suspense } from "react";
import { Chrome } from "@/components/Chrome";
import { UploadingPage } from "@/components/UploadingPage";

export default function Page() {
  return (
    <Chrome>
      <Suspense fallback={null}>
        <UploadingPage />
      </Suspense>
    </Chrome>
  );
}
