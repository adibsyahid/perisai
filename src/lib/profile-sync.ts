"use client";

// Saves the profile to Firestore users/{uid}, so the server can put the name on
// family alerts and the state on Radar reports.
import { doc, setDoc } from "firebase/firestore";
import type { Locale } from "./family-types";
import { clientDb, ensureUser } from "./firebase-client";
import { readProfile, storeProfileLocally, type LocalProfile } from "./profile";

export async function saveProfile(profile: LocalProfile, locale: Locale) {
  const user = await ensureUser();
  await setDoc(doc(clientDb(), "users", user.uid), { ...profile, locale }, { merge: true });
  storeProfileLocally(profile);
}

// Keep the server's copy of the language in step, so alerts arrive in the right language.
export async function syncLocale(locale: Locale) {
  if (!readProfile()) return;
  const user = await ensureUser();
  await setDoc(doc(clientDb(), "users", user.uid), { locale }, { merge: true });
}
