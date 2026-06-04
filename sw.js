// sw.js
const CACHE_NAME = 'snowblock-nav-v2';
const urlsToCache = [
  '/',
  '/index.html',
  'https://snowblock.top/138936740_p0.webp',
  'https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
