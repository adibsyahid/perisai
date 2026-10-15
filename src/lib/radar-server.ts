// Server only. Anonymous Radar reports (BLUEPRINT F4):
// reports/{id} = { scamType, verdict, state, createdAt, isDemo }. Nothing else, no uid.
import { adminDb } from "./firebase-admin";
import { getProfile } from "./family-server";
import type { ScamType, Verdict } from "./scan-types";
import { STATES } from "./states";

export async function addReport(uid: string, verdict: Verdict, scamType: ScamType) {
  // The state comes from the user's own profile; the uid itself is NOT stored.
  const state = (await getProfile(uid))?.state ?? "";
  await adminDb().collection("reports").add({ scamType, verdict, state, createdAt: Date.now(), isDemo: false });
}

// --- Demo data for the video and judging (always marked isDemo: true) ---

const DAY = 24 * 60 * 60 * 1000;

// Rough weights so busy states get more dots, like real life.
const STATE_WEIGHT: Record<string, number> = {
  selangor: 18, johor: 12, kuala_lumpur: 10, perak: 8, sabah: 8, sarawak: 8, pulau_pinang: 7, kedah: 6,
  kelantan: 5, pahang: 5, negeri_sembilan: 4, terengganu: 4, melaka: 3, putrajaya: 1, perlis: 1, labuan: 1,
};
// Mix of scam types, loosely following what PDRM reports most often.
const TYPE_WEIGHT: Partial<Record<ScamType, number>> = {
  parcel: 18, phishing: 16, job: 14, investment: 12, authority_impersonation: 11, impersonation: 9,
  online_purchase: 8, loan: 5, malicious_apk: 4, prize: 3, govt_aid: 3, romance: 2,
};

function pick<T extends string>(weights: Partial<Record<T, number>>): T {
  const entries = Object.entries(weights) as [T, number][];
  let roll = Math.random() * entries.reduce((sum, [, w]) => sum + w, 0);
  for (const [key, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return key;
  }
  return entries[0][0];
}

export async function fillDemoReports(count = 150) {
  const db = adminDb();
  const now = Date.now();
  const batch = db.batch();
  for (let i = 0; i < count; i++) {
    batch.set(db.collection("reports").doc(), {
      scamType: pick(TYPE_WEIGHT),
      verdict: Math.random() < 0.75 ? "SCAM" : "MENCURIGAKAN",
      state: pick(STATE_WEIGHT),
      createdAt: now - Math.floor(Math.random() * 7 * DAY),
      isDemo: true,
    });
  }
  await batch.commit();
  return count;
}

export async function clearDemoReports() {
  const db = adminDb();
  const snap = await db.collection("reports").where("isDemo", "==", true).get();
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  return snap.size;
}

// Keep the state list and the weights in step (a typo would silently drop a state).
for (const id of Object.keys(STATE_WEIGHT)) {
  if (!STATES.some((s) => s.id === id)) throw new Error(`Unknown state in STATE_WEIGHT: ${id}`);
}
