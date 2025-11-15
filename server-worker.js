const CACHE = 'stvincent-v1';
const OFFLINE_URL = '/index.html';
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll([OFFLINE_URL, '/css/styles.css', '/js/main.js'])));
  self.skipWaiting();
});
self.addEventListener('fetch', event => {
  if(event.request.mode === 'navigate'){
    event.respondWith(fetch(event.request).catch(()=> caches.match(OFFLINE_URL)));
    return;
  }
  event.respondWith(caches.match(event.request).then(res => res || fetch(event.request)));
});
