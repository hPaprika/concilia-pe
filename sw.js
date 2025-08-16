const CACHE_NAME = 'concilia-pe-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html', // NUEVO archivo offline
  '/src//js/app.js',
  '/src/css/styles.css',
  '/favicon.ico',
  '/favicon.svg',
  '/favicon-96x96.png',
  '/apple-touch-icon.png',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png',
  '/manifest.json',
  '/assets/op-preview.png',
  '/assets/icons/avianca.webp',
  '/assets/icons/JetSmart.webp',
  '/assets/icons/latam.webp',
  '/assets/icons/sky.webp'
];

// Instalación
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Archivos cacheados');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Activación inmediata
});

// Activación
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Control inmediato de las páginas abiertas
});

// Interceptar peticiones
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse; // Cache first
      }

      return fetch(event.request).catch(() => {
        // Fallback para HTML
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }
        // Fallback para imágenes
        if (event.request.destination === 'image') {
          return new Response('', { status: 404 });
        }
      });
    })
  );
});
