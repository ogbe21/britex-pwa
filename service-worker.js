// Service Worker BRITEX - Optimizado para internet MUY lento (Cuba)

importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.1.0/workbox-sw.js');

// Si Workbox no carga (muy raro), fallback básico
if (!workbox) {
  console.error('Workbox falló en cargar...');
}

// Config global: más rápido y silencioso en prod
workbox.setConfig({ debug: false });

// Nombre del cache principal (cámbialo cuando actualices la app para invalidar viejo)
const CACHE = 'britex-pwa-v2';  // ← sube versión cuando cambies contenido crítico

const offlineFallbackPage = '/offline.html';

// Precachea la página offline en install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll([offlineFallbackPage]))
  );
  // Salta waiting rápido si es actualización
  self.skipWaiting();
});

// Activa rápido y limpia caches viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Navigation Preload ON (acelera navegación en conexiones lentas cuando disponible)
if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// Estrategia principal para NAVEGACIÓN (páginas HTML): StaleWhileRevalidate
// → Sirve cache rápido + actualiza en background
workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200], // 0 para respuestas opacas/offline
      }),
      // Timeout corto para no esperar eternamente la red
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50, // Limita páginas cacheadas
      }),
    ],
  })
);

// Para assets estáticos (js, css, imágenes, fuentes): CacheFirst + stale fallback
workbox.routing.registerRoute(
  /\.(?:js|css|png|jpg|jpeg|gif|svg|webp|woff2?|ttf|eot)$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'static-assets-v1',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
        maxEntries: 100,
      }),
    ],
  })
);

// Fallback general cuando TODO falla (incluye offline)
workbox.routing.setCatchHandler(({ event }) => {
  switch (event.request.destination) {
    case 'document':
      return caches.match(offlineFallbackPage);
    default:
      return Response.error();
  }
});

// Mensaje para skipWaiting (actualización rápida)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
