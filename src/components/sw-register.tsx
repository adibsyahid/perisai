"use client";

import { useEffect } from "react";
import { listenForInstallPrompt } from "@/lib/install-prompt";

// Registers public/sw.js once the page has loaded (without a service worker,
// Android Chrome will not offer "Install app"), and starts listening for
// Chrome's install prompt for the Pasang screen.
export function SwRegister() {
  useEffect(() => {
    listenForInstallPrompt();
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((error) => console.warn("Service worker registration failed", error));
  }, []);
  return null;
}
