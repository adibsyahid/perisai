import { getApps, initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";

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
function clientAuth() {
  const app = getApps()[0] ?? initializeApp(config);
  return getAuth(app);
}

// No passwords: every phone gets an anonymous account the first time it scans.
// The same account is restored on later visits (Firebase keeps it in IndexedDB).
export async function getIdToken(): Promise<string> {
  const auth = clientAuth();
  await auth.authStateReady();
  const user = auth.currentUser ?? (await signInAnonymously(auth)).user;
  return user.getIdToken();
}
