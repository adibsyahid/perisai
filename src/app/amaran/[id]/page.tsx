import { Suspense } from "react";
import { AlertFromUrl } from "./alert-screen";

// /amaran/[id]: opened from a family alert notification.
// The id is read on the phone, so the screen waits inside a Suspense boundary.
export default function AlertPage() {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-background" aria-busy="true" />}>
      <AlertFromUrl />
    </Suspense>
  );
}
