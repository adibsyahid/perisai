import { getApps, initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// The web config is public by design (it is sent to every browser);
// Firestore Security Rules and server-side token checks protect the data.
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Created lazily, only in the browser, so server rendering never touches Firebase.
function clientApp() {
  return getApps()[0] ?? initializeApp(config);
}

export function clientDb() {
  return getFirestore(clientApp());
}

// No passwords: every phone gets an anonymous account the first time it needs one.
// The same account is restored on later visits (Firebase keeps it in IndexedDB).
export async function ensureUser() {
  const auth = getAuth(clientApp());
  await auth.authStateReady();
  return auth.currentUser ?? (await signInAnonymously(auth)).user;
}

export async function getIdToken(): Promise<string> {
  return (await ensureUser()).getIdToken();
}

// POST to one of our API routes as the signed-in user.
export async function postApi<T>(path: string, body: unknown): Promise<{ ok: boolean; data: T }> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${await getIdToken()}` },
    body: JSON.stringify(body),
  });
  return { ok: response.ok, data: (await response.json().catch(() => ({}))) as T };
}
