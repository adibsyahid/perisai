import { FieldValue } from "firebase-admin/firestore";
import { adminDb, verifyRequest } from "@/lib/firebase-admin";

type Subscription = { endpoint: string; keys: { p256dh: string; auth: string } };

function isSubscription(value: unknown): value is Subscription {
  const sub = value as Subscription;
  return (
    typeof sub?.endpoint === "string" &&
    sub.endpoint.startsWith("https://") &&
    typeof sub.keys?.p256dh === "string" &&
    typeof sub.keys?.auth === "string"
  );
}

// Saves this phone's push subscription so guardians can be alerted on it.
export async function POST(request: Request) {
  const uid = await verifyRequest(request);
  if (!uid) return Response.json({ error: "auth" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!isSubscription(body)) return Response.json({ error: "bad_input" }, { status: 400 });

  // Keep only the fields web-push needs; one entry per phone.
  const sub = { endpoint: body.endpoint, keys: { p256dh: body.keys.p256dh, auth: body.keys.auth } };
  await adminDb().collection("pushSubs").doc(uid).set({ subs: FieldValue.arrayUnion(sub) }, { merge: true });
  return Response.json({ ok: true });
}
