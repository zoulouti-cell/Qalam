// Qalam service worker: makes the app installable (Android / Windows) and lets it open offline.
// Network-first for pages and assets (always fresh when online), cache fallback when offline.
// API responses are never cached here — offline data comes from the app's own IndexedDB copy.
const CACHE = "qalam-shell-v2";
const SHELL = ["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/brand/qalam-mark.png", "/brand/qalam-badge.png", "/brand/qalam-ar.png", "/brand/qalam-latin.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/@") || url.searchParams.has("token")) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(async () => (await caches.match(req)) || (req.mode === "navigate" ? caches.match("/") : Response.error())),
  );
});
