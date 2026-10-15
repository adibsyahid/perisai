// Server only. Pairing, alerts and the push messages that go with them (BLUEPRINT F3).
import { adminDb } from "./firebase-admin";
import type { AlertInput, Locale, UserProfile } from "./family-types";
import { bm } from "./i18n/bm";
import { en } from "./i18n/en";
import { sendPushToUser } from "./push-server";

const CODE_TTL_MS = 10 * 60 * 1000;

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await adminDb().collection("users").doc(uid).get();
  const data = snap.data();
  return data?.name ? ({ name: data.name, state: data.state ?? "", locale: data.locale === "en" ? "en" : "ms" }) : null;
}

// pairCodes/{6 digits} = {uid, name, expiresAt}. create() fails if the code is taken, so we retry.
export async function createPairCode(uid: string, name: string): Promise<{ code: string; expiresAt: number }> {
  const codes = adminDb().collection("pairCodes");
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + CODE_TTL_MS;
    try {
      await codes.doc(code).create({ uid, name, expiresAt });
      return { code, expiresAt };
    } catch (error) {
      // Code 6 = ALREADY_EXISTS: someone holds this code, try another. Anything else is a real failure.
      if ((error as { code?: number | string }).code !== 6 && (error as { code?: string }).code !== "already-exists") {
        throw error;
      }
    }
  }
  throw new Error("Could not find a free pairing code");
}

export type JoinResult =
  | { ok: true; guardianshipId: string; protectedName: string; protectedUid: string }
  | { ok: false; reason: "not_found" | "expired" | "self" };

// The guardian types the code. One transaction: check it, create the link, delete the code.
export async function joinWithCode(code: string, guardianUid: string, guardianName: string): Promise<JoinResult> {
  const db = adminDb();
  const codeRef = db.collection("pairCodes").doc(code);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(codeRef);
    if (!snap.exists) return { ok: false, reason: "not_found" } as const;
    const { uid: protectedUid, name: protectedName, expiresAt } = snap.data() as {
      uid: string;
      name: string;
      expiresAt: number;
    };
    if (expiresAt < Date.now()) {
      tx.delete(codeRef);
      return { ok: false, reason: "expired" } as const;
    }
    if (protectedUid === guardianUid) return { ok: false, reason: "self" } as const;

    // One link per pair: the id is predictable, so pairing twice just updates it.
    const linkRef = db.collection("guardianships").doc(`${protectedUid}_${guardianUid}`);
    tx.set(linkRef, { protectedUid, protectedName, guardianUid, guardianName, createdAt: Date.now() });
    tx.delete(codeRef);
    return { ok: true, guardianshipId: linkRef.id, protectedName, protectedUid } as const;
  });
}

// Creates alerts/{id} for all guardians of `protectedUid` and pushes it to their phones.
// Returns how many guardians were told. Holds no message content (BLUEPRINT section 7).
export async function notifyGuardians(protectedUid: string, input: AlertInput): Promise<number> {
  const db = adminDb();
  const links = await db.collection("guardianships").where("protectedUid", "==", protectedUid).get();
  if (links.empty) return 0;

  const guardianUids = links.docs.map((d) => d.data().guardianUid as string);
  const protectedName = (links.docs[0].data().protectedName as string) || "";

  const alertRef = await db.collection("alerts").add({
    protectedUid,
    protectedName,
    guardianUids,
    verdict: input.verdict,
    scamType: input.scamType,
    headline: input.headline.slice(0, 120),
    riskScore: input.riskScore,
    createdAt: Date.now(),
    handled: false,
  });

  // Each guardian gets the notification in their own app language.
  await Promise.all(
    guardianUids.map(async (guardianUid) => {
      const locale: Locale = (await getProfile(guardianUid))?.locale ?? "ms";
      const t = locale === "en" ? en : bm;
      await sendPushToUser(guardianUid, {
        title: t.family.push.title,
        body: t.family.push.body
          .replace("{name}", protectedName)
          .replace("{verdict}", t.scan.verdicts[input.verdict])
          .replace("{type}", t.scan.types[input.scamType]),
        url: `/amaran/${alertRef.id}`,
      });
    }),
  );
  return guardianUids.length;
}

// Only a guardian named on the alert may mark it as handled.
export async function markAlertHandled(alertId: string, guardianUid: string): Promise<boolean> {
  const ref = adminDb().collection("alerts").doc(alertId);
  const snap = await ref.get();
  const guardians = (snap.data()?.guardianUids ?? []) as string[];
  if (!guardians.includes(guardianUid)) return false;
  await ref.update({ handled: true });
  return true;
}
