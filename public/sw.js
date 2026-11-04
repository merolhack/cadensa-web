// Cadensa Progressive Web App (PWA) Service Worker v2.5.0
const CACHE_NAME = 'cadensa-v2.5.0';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  // Portadas WebP de las 7 técnicas fonoaudiológicas
  '/media/techniques/syllable-timed-speech_portada.webp',
  '/media/techniques/easy-onset_portada.webp',
  '/media/techniques/light-contact_portada.webp',
  '/media/techniques/prolonged-speech_portada.webp',
  '/media/techniques/box-breathing_portada.webp',
  '/media/techniques/pull-out_portada.webp',
  '/media/techniques/cancellation_portada.webp',
];

// Videos clínicos institucionales precacheados o en demanda offline
const CLINICAL_MEDIA = [
  '/media/techniques/syllable-timed-speech_avatar_final.mp4',
  '/media/techniques/easy-onset_avatar_final.mp4',
  '/media/techniques/light-contact_avatar_final.mp4',
  '/media/techniques/prolonged-speech_avatar_final.mp4',
  '/media/techniques/box-breathing_avatar_final.mp4',
  '/media/techniques/pull-out_avatar_final.mp4',
  '/media/techniques/cancellation_avatar_final.mp4',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Precarga de assets estáticos, portadas y videos de técnicas
      return cache.addAll([...STATIC_ASSETS, ...CLINICAL_MEDIA]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Estrategia Cache-First para Videos y Multimedia de Técnicas
  if (url.pathname.startsWith('/media/techniques/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 206)) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Si está offline y no está en caché, intentar sin query params
            return cache.match(url.pathname);
          });
        });
      })
    );
    return;
  }

  // 2. Estrategia Network-First con Fallback a Cache para Páginas y Navegación
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/');
          }
        });
      })
  );
});
