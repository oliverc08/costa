/* Costa offline shell — cache static navigation + home for flaky mobile data. */
// Bump the cache name so any older version that cached arbitrary HTML (including
// partner pages) is removed when this worker activates.
const CACHE = "costa-shell-v2";
const PRECACHE = ["/", "/ask", "/help", "/check", "/letter", "/plan", "/how", "/manifest.webmanifest", "/icon.svg"];
const OFFLINE_ROUTES = new Set(PRECACHE.filter((path) => path.startsWith("/")));

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() =>
      self.clients.claim(),
    ),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Only the explicit public shell can be cached. In particular, never cache
  // partner handoff pages or any other dynamic/personalized HTML.
  if (url.search || !OFFLINE_ROUTES.has(url.pathname)) return;

  event.respondWith(
    caches.open(CACHE).then((cache) => cache.match(req)).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            void caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
