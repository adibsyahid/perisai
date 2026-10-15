"use client";

// Simple on/off preferences, kept on this phone (localStorage).
import { useSyncExternalStore } from "react";

export type PrefKey = "radar" | "voice" | "largeText";

// What a new user gets: sharing anonymous Radar dots and voice are on, large text is off.
const DEFAULTS: Record<PrefKey, boolean> = { radar: true, voice: true, largeText: false };

const listeners = new Set<() => void>();
const storageKey = (key: PrefKey) => `perisai.pref.${key}`;

export function getPref(key: PrefKey): boolean {
  try {
    const value = localStorage.getItem(storageKey(key));
    return value === null ? DEFAULTS[key] : value === "1";
  } catch {
    return DEFAULTS[key];
  }
}

export function setPref(key: PrefKey, value: boolean) {
  try {
    localStorage.setItem(storageKey(key), value ? "1" : "0");
  } catch {
    // Not saved, but this visit still uses the new value.
  }
  listeners.forEach((notify) => notify());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function usePref(key: PrefKey): boolean {
  return useSyncExternalStore(subscribe, () => getPref(key), () => DEFAULTS[key]);
}
