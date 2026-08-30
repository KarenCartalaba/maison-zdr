const CACHE_NAME = 'zdr-v1';
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE_NAME).then(c => c.add('/'))) });
self.addEventListener('fetch', (e) => { e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))) });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))) });
