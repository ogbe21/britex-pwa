importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.1.0/workbox-sw.js');

const CACHE = 'britex-v3'; // Cambia versión para actualizar
const OFFLINE_PAGE = '/offline.html';

workbox.setConfig({ debug: false });

// Precachea lo esencial
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => 
      cache.addAll([OFFLINE_PAGE, '/'])
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Navegación: sirve cache primero, fallback a offline.html
workbox.routing.registerRoute(
  ({request}) => request.mode === 'navigate',
  async ({event}) => {
    try {
      return await workbox.strategies.staleWhileRevalidate({cacheName: CACHE})(event);
    } catch (err) {
      return caches.match(OFFLINE_PAGE);
    }
  }
);

// Assets estáticos: cache first
workbox.routing.registerRoute(
  /\.(?:png|jpg|jpeg|svg|webp)$/,
  new workbox.strategies.CacheFirst({ cacheName: 'images' })
);
