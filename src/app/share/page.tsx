import { Suspense } from "react";
import { ScanningView } from "@/components/scan/scanning-view";
import { ShareReceiver } from "./share-receiver";

// /share: Android opens this when the user shares a message to PERISAI.
// The shared text is read from the URL on the phone, so the page waits in a
// Suspense boundary and shows the scanning screen straight away.
export default function SharePage() {
  return (
    <Suspense fallback={<ScanningView preview="" />}>
      <ShareReceiver />
    </Suspense>
  );
}
