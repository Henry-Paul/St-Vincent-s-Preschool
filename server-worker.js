const CACHE_NAME = 'stvincent-v1';
const OFFLINE_URL = '/index.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        OFFLINE_URL,
        '/css/styles.css',
        '/js/main.js',
        '/index.html'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // network-first for HTML, cache-first for other assets
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(()=> caches.match(OFFLINE_URL)));
    return;
  }
  event.respondWith(
    caches.match(event.request).then((r)=> r || fetch(event.request))
  );
});
