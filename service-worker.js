importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.1.0/workbox-sw.js');

workbox.setConfig({ debug: false });

const CACHE = 'britex-pwa-v3'; // Cambia versión para actualizar
const OFFLINE_PAGE = '/offline.html';

// Precachea offline.html y la página principal si puedes
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll([OFFLINE_PAGE, '/']); // Agrega '/' o tu index.html
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Navigation: StaleWhileRevalidate con fallback
workbox.routing.registerRoute(
  ({request}) => request.mode === 'navigate',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] })
    ]
  })
);

// Fallback cuando todo falla (offline y no cached)
workbox.routing.setCatchHandler(({event}) => {
  if (event.request.mode === 'navigate') {
    return caches.match(OFFLINE_PAGE);
  }
  return Response.error();
});
