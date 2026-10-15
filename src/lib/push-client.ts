"use client";

// Turns on family alerts for this phone (BLUEPRINT F3, push setup).
import { postApi } from "./firebase-client";
import { isInstalled, isIos } from "./install";

export type PushStatus = "unsupported" | "ios-install" | "blocked" | "off" | "on";

export async function pushStatus(): Promise<PushStatus> {
  // iPhone only allows web push for apps added to the Home Screen (iOS 16.4+).
  if (isIos() && !isInstalled()) return "ios-install";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return "unsupported";
  }
  if (Notification.permission === "denied") return "blocked";
  if (Notification.permission !== "granted") return "off";
  const registration = await navigator.serviceWorker.ready;
  return (await registration.pushManager.getSubscription()) ? "on" : "off";
}

function base64UrlToBytes(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

// Must run from a tap: browsers only show the permission prompt after a user gesture.
export async function enablePush(): Promise<PushStatus> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "blocked" : "off";

  const registration = await navigator.serviceWorker.ready;
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToBytes(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""),
    }));

  const { ok } = await postApi("/api/push/subscribe", subscription.toJSON());
  return ok ? "on" : "off";
}
