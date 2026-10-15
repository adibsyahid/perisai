"use client";

// The user's own profile (name + state), as kept on this phone (localStorage).
// Saving to Firestore lives in profile-sync.ts, so screens that only SHOW the
// profile don't have to download Firebase.
import { useSyncExternalStore } from "react";

export type LocalProfile = { name: string; state: string };

const KEY = "perisai.profile";
const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedProfile: LocalProfile | null = null;

// Returns the same object while the stored text is unchanged (useSyncExternalStore needs that).
export function readProfile(): LocalProfile | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedProfile = raw ? (JSON.parse(raw) as LocalProfile) : null;
    } catch {
      cachedProfile = null;
    }
  }
  return cachedProfile;
}

export function storeProfileLocally(profile: LocalProfile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    // Still saved in Firestore.
  }
  listeners.forEach((notify) => notify());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function useProfile(): LocalProfile | null {
  return useSyncExternalStore(subscribe, readProfile, () => null);
}
