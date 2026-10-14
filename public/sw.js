// PERISAI service worker.
// P0: only takes control of the page so the app counts as installable.
// Push notifications (P3) are added here later.
// No offline caching on purpose: scam verdicts must always come fresh from the server.

self.addEventListener("install", () => {
  // Activate a new version straight away instead of waiting for all tabs to close.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
