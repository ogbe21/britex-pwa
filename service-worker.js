importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

const CACHE_NAME = "britex-cache-v2";
const OFFLINE_URL = "offline.html";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        OFFLINE_URL,
        'index.html',
        'icon-192.png'
      ]);
    })
  );
});

// Cache First para imágenes: Ahorro crítico de datos en Cuba
workbox.routing.registerRoute(
  ({request}) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'britex-images',
    plugins: [new workbox.expiration.ExpirationPlugin({ maxEntries: 50 })],
  })
);

// Network First con timeout de 3s para evitar esperas eternas
workbox.routing.registerRoute(
  ({request}) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: 'britex-navigation',
    networkTimeoutSeconds: 3,
  })
);

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  }
});
