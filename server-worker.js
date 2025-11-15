const CACHE_NAME = 'stvincent-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/main.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // network-first for HTML, cache-first for others
  if(e.request.mode === 'navigate'){
    e.respondWith(fetch(e.request).catch(()=> caches.match('/index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
