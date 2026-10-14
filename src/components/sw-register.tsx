"use client";

import { useEffect } from "react";

// Registers public/sw.js once the page has loaded. Without a service worker,
// Android Chrome will not offer "Install app".
export function SwRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((error) => console.warn("Service worker registration failed", error));
  }, []);
  return null;
}
