/* Offline-first service worker: network-first with a safe offline fallback. */
const CACHE = 'encarta-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // Never cache the big ZIM files or the API endpoints — pass them straight through
  if (url.pathname.startsWith('/zim/') || url.pathname.startsWith('/api/')) return;
  e.respondWith(
    (async () => {
      let cache;
      try {
        cache = await caches.open(CACHE);
        const fresh = await fetch(e.request);
        // A cache quota failure or an unsupported partial response must never
        // turn a successful network response into an offline error.
        if (fresh.ok && fresh.status === 200 && !e.request.headers.has('range')) {
          void cache.put(e.request, fresh.clone()).catch(() => {});
        }
        return fresh;
      } catch {
        const hit = cache ? await cache.match(e.request) : undefined;
        if (hit) return hit;
        if (e.request.mode === 'navigate') {
          const shell = cache ? await cache.match('./index.html') : undefined;
          if (shell) return shell;
        }
        return new Response('Offline', { status: 504, statusText: 'Offline' });
      }
    })()
  );
});
