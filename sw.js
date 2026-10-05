// Offline support only. Network-first so an updated app is never stuck behind
// a stale cache; the cache exists purely so the app opens without a connection.
const CACHE = 'throne-v2';
const SHELL = ['.', 'index.html', 'css/styles.css', 'js/app.js', 'js/store.js',
  'js/bristol.js', 'js/insights.js', 'js/charts.js', 'js/demo.js', 'js/guidance.js',
  'manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Caching a 404 or 500 would serve it back as code on the next offline load.
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) =>
        hit || (e.request.mode === 'navigate' ? caches.match('index.html') : undefined)))
  );
});
