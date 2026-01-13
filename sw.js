const CACHE_NAME = 'britex-offline-v4'; // Cambia el número si actualizas
const OFFLINE_URL = '/offline.html';

// Instala y cachea offline.html + la home
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll([OFFLINE_URL, '/']))
  );
  self.skipWaiting(); // Activa rápido
});

// Limpia caches viejos
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Intercepta todas las navegaciones
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_URL))
    );
  }
});
