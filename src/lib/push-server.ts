// Server only. Sends Web Push notifications to every device a user registered.
import webpush from "web-push";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "./firebase-admin";

export type PushPayload = { title: string; body: string; url: string };

let configured = false;
function configure() {
  if (configured) return;
  webpush.setVapidDetails(
    "https://perisai-three.vercel.app", // contact for the push service, as VAPID requires
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
    process.env.VAPID_PRIVATE_KEY ?? "",
  );
  configured = true;
}

// pushSubs/{uid} = { subs: PushSubscriptionJSON[] } (one entry per phone).
export async function sendPushToUser(uid: string, payload: PushPayload): Promise<number> {
  configure();
  const ref = adminDb().collection("pushSubs").doc(uid);
  const subs = ((await ref.get()).data()?.subs ?? []) as webpush.PushSubscription[];

  let sent = 0;
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, JSON.stringify(payload), { TTL: 60 * 60, urgency: "high" });
        sent++;
      } catch (error) {
        // 404/410: the phone unsubscribed or the app was removed. Forget that device.
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) await ref.update({ subs: FieldValue.arrayRemove(sub) });
      }
    }),
  );
  return sent;
}
