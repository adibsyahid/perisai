// PERISAI service worker.
// Makes the app installable and shows family alerts (Web Push, BLUEPRINT F3).
// No offline caching on purpose: scam verdicts must always come fresh from the server.

self.addEventListener("install", () => {
  // Activate a new version straight away instead of waiting for all tabs to close.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// A family alert arrives: { title, body, url }.
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "PERISAI", {
      body: data.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url || "/keluarga" },
      // Stay on screen until the guardian acts: this may be urgent.
      requireInteraction: true,
      vibrate: [300, 150, 300],
    }),
  );
});

// Tapping the alert opens it, reusing an open PERISAI window when there is one.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const open = windows.find((w) => new URL(w.url).origin === self.location.origin);
      if (open) return open.focus().then(() => open.navigate(url));
      return self.clients.openWindow(url);
    }),
  );
});
