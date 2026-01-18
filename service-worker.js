importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

const CACHE_NAME = "britex-cache-v1";
const OFFLINE_URL = "offline.html";

// Forzar actualización del SW
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Precarga de la página offline y recursos críticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        OFFLINE_URL,
        'index.html',
        'https://ogbe21.github.io/britex-pwa/icon-192.webp'
      ]);
    })
  );
});

// Estrategia para Imágenes: Cache First (Ahorra datos móviles)
workbox.routing.registerRoute(
  ({request}) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'britex-images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({ maxEntries: 50 }),
    ],
  })
);

// Estrategia para Navegación: Network First con caída a Offline
const navigationRoute = new workbox.routing.NavigationRoute(
  new workbox.strategies.NetworkFirst({
    cacheName: 'britex-navigation',
    networkTimeoutSeconds: 3, // Si en 3s no responde, usa el cache
  }), {
    denylist: [/^\/_/, /\/[^\/]+\.[^\/]+$/], // Evitar archivos específicos
  }
);

workbox.routing.registerRoute(navigationRoute);

// Captura de errores de red para mostrar offline.html
workbox.routing.setCatchHandler(async ({event}) => {
  if (event.request.destination === 'document') {
    return caches.match(OFFLINE_URL);
  }
  return Response.error();
});
