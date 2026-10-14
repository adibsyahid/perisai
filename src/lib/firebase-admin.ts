// Server only: never import this from a "use client" file.
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function adminApp() {
  const existing = getApps()[0];
  if (existing) return existing;

  // The key is stored on one line with "\n" escapes (see scripts/setup-env.mjs).
  // Some dashboards keep the surrounding quotes, so strip them too.
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY ?? "")
    .replace(/^"|"$/g, "")
    .replace(/\\n/g, "\n");

  return initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

// Returns the caller's uid, or null when the token is missing or invalid.
export async function verifyRequest(request: Request): Promise<string | null> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  try {
    const decoded = await getAuth(adminApp()).verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}
