// Minimal service worker: PWA installability only, zero caching.
// Chrome requires a registered worker with a fetch listener for the install
// prompt — the listener below intentionally does nothing so every request
// goes straight to the network and a normal refresh is always fresh.
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  // Purge caches left behind by previous worker versions (zdr-v1, zdr-v2)
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', () => {});
