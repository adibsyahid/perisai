"use client";

// Is PERISAI running as an installed app (from the home screen) or in a browser tab?
import { useSyncExternalStore } from "react";

export const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent);

export function isInstalled() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function subscribe(onChange: () => void) {
  const query = window.matchMedia("(display-mode: standalone)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

// Server render assumes "installed" so the install hints don't flash on real installs.
export function useInstalled() {
  return useSyncExternalStore(subscribe, isInstalled, () => true);
}

export const APP_VERSION = "1.0";
