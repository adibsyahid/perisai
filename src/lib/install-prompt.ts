"use client";

// Android Chrome fires "beforeinstallprompt" once when PERISAI can be installed.
// We keep that event so a big "Pasang sekarang" button can open Chrome's own
// install dialog later (BLUEPRINT section 5.2). iPhone never fires it.
import { useSyncExternalStore } from "react";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

let saved: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

// Called once from the root layout, as early as possible, so the event is not missed.
export function listenForInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault(); // we show our own button instead of the mini-infobar
    saved = event as InstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    saved = null;
    notify();
  });
}

export function useCanPromptInstall() {
  return useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    () => saved !== null,
    () => false,
  );
}

export async function promptInstall() {
  if (!saved) return;
  await saved.prompt();
  await saved.userChoice;
  saved = null; // the event can only be used once
  notify();
}
