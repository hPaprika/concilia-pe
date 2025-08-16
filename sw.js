const CACHE_NAME = 'concilia-pe-cache-v3'; // Versión incrementada
const OFFLINE_PAGE = '/offline.html';

// Recursos agrupados por prioridad
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  OFFLINE_PAGE,
  '/src/app.js',
  '/src/css/main.css',
  '/manifest.json'
];

const SECONDARY_RESOURCES = [
  '/favicon.ico',
  '/favicon.svg',
  '/favicon-96x96.png',
  '/apple-touch-icon.png',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png',
  '/assets/op-preview.png',
  '/assets/icons/avianca.webp',
  '/assets/icons/JetSmart.webp',
  '/assets/icons/latam.webp',
  '/assets/icons/sky.webp'
];

const APP_SHELL = [...CRITICAL_RESOURCES, ...SECONDARY_RESOURCES];

// Instalación: precaché de recursos críticos
self.addEventListener('install', event => {
  console.log('[SW] Iniciando instalación');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Precacheando recursos críticos');
        // Primero cachear recursos críticos
        return cache.addAll(CRITICAL_RESOURCES)
          .then(() => {
            console.log('[SW] Recursos críticos precacheados');
            // Luego cachear recursos secundarios
            return cache.addAll(SECONDARY_RESOURCES);
          });
      })
      .then(() => console.log('[SW] Todos los recursos precacheados'))
      .catch(err => console.error('[SW] Error en instalación:', err))
  );
  self.skipWaiting(); // Activación inmediata
});

// Activación: limpieza de cachés antiguos
self.addEventListener('activate', event => {
  console.log('[SW] Activando service worker');
  event.waitUntil(
    Promise.all([
      // Limpieza de cachés obsoletos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Eliminando caché antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),

      // Tomar control inmediato de todas las pestañas
      self.clients.claim()
    ])
      .then(() => console.log('[SW] Service worker activado y listo'))
  );
});

// Función para fetch con timeout
function fetchWithTimeout(request, timeout = 4000) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout')), timeout)
    )
  ]);
}

// Estrategia avanzada de caché
self.addEventListener('fetch', event => {
  const { request } = event;

  // 1. Solo interceptamos solicitudes GET
  if (request.method !== 'GET') return;

  // 2. Normalización para evitar problemas con / vs /index.html
  const normalizedUrl = request.url.replace(/\/?$/, '/');
  const normalizedRequest = new Request(normalizedUrl, request);

  // 3. Estrategia para documentos HTML (stale-while-revalidate)
  if (request.destination === 'document') {
    event.respondWith(
      handleDocumentRequest(normalizedRequest, event)
    );
    return;
  }

  // 4. Estrategia para recursos estáticos (cache-first)
  event.respondWith(
    handleStaticResource(request)
  );
});

// Manejo especial para documentos HTML
function handleDocumentRequest(request, event) {
  return caches.open(CACHE_NAME)
    .then(cache => {
      // Intentar obtener de caché
      return cache.match(request)
        .then(cachedResponse => {
          // Si existe en caché, servir inmediatamente
          if (cachedResponse) {
            console.log(`[SW] Serving document from cache: ${request.url}`);
            // Actualizar en segundo plano
            event.waitUntil(
              fetchAndCache(request, cache)
            );
            return cachedResponse;
          }

          // Si no está en caché, intentar red
          console.log(`[SW] Fetching document from network: ${request.url}`);
          return fetchAndCache(request, cache)
            .catch(() => {
              console.log(`[SW] Serving offline page for: ${request.url}`);
              return caches.match(OFFLINE_PAGE);
            });
        });
    });
}

// Manejo para recursos estáticos (CSS, JS, imágenes)
function handleStaticResource(request) {
  return caches.match(request)
    .then(cachedResponse => {
      // Si está en caché, servir inmediatamente
      if (cachedResponse) {
        console.log(`[SW] Serving static resource from cache: ${request.url}`);
        return cachedResponse;
      }

      // Si no está en caché, intentar red
      console.log(`[SW] Fetching static resource from network: ${request.url}`);
      return fetchWithTimeout(request)
        .then(response => {
          // Si es una respuesta válida, guardar en caché
          if (response.status === 200 && response.headers.get('cache-control') !== 'no-cache') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(request, responseClone);
                console.log(`[SW] Cached new resource: ${request.url}`);
              });
          }
          return response;
        })
        .catch(() => {
          console.log(`[SW] Network failed for: ${request.url}`);
          // Fallback específico para imágenes
          if (request.destination === 'image') {
            return new Response('<svg role="img" aria-label="Recurso no disponible" xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">Imagen no disponible</text></svg>', {
              headers: { 'Content-Type': 'image/svg+xml' }
            });
          }
          // Para otros recursos, fallar silenciosamente
          return new Response('', { status: 404 });
        });
    });
}

// Función reutilizable para actualizar caché
function fetchAndCache(request, cache) {
  return fetchWithTimeout(request)
    .then(response => {
      // Si la respuesta es válida y cacheable, guardar en caché
      if (response.status === 200 && response.headers.get('cache-control') !== 'no-cache') {
        cache.put(request, response.clone());
        console.log(`[SW] Updated cache for: ${request.url}`);
      }
      return response;
    })
    .catch(error => {
      console.log(`[SW] Failed to fetch and cache: ${request.url}`, error);
      return caches.match(OFFLINE_PAGE);
    });
}