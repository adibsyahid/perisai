"use client";

// The user's own profile (name + state). Kept in localStorage for instant display,
// and in Firestore users/{uid} so the server can put the name on family alerts.
import { useSyncExternalStore } from "react";
import { doc, setDoc } from "firebase/firestore";
import { clientDb, ensureUser } from "./firebase-client";
import type { Locale } from "./family-types";

export type LocalProfile = { name: string; state: string };

const KEY = "perisai.profile";
const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedProfile: LocalProfile | null = null;

// Returns the same object while the stored text is unchanged (useSyncExternalStore needs that).
function read(): LocalProfile | null {
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

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function useProfile(): LocalProfile | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export async function saveProfile(profile: LocalProfile, locale: Locale) {
  const user = await ensureUser();
  await setDoc(doc(clientDb(), "users", user.uid), { ...profile, locale }, { merge: true });
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    // Still saved in Firestore.
  }
  listeners.forEach((notify) => notify());
}

// Keep the server's copy of the language in step, so alerts arrive in the right language.
export async function syncLocale(locale: Locale) {
  if (!read()) return;
  const user = await ensureUser();
  await setDoc(doc(clientDb(), "users", user.uid), { locale }, { merge: true });
}
