// Minimalny Service Worker: cache'uje wyłącznie statyczne, hashowane zasoby
// (JS/CSS/fonty/obrazy). HTML, manifest i API zawsze idą do sieci, żeby nigdy
// nie podać starej wersji aplikacji.
const CACHE_NAME = 'quiz-static-v1';
const STATIC_DESTINATIONS = new Set(['script', 'style', 'font', 'image']);

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;
  if (!STATIC_DESTINATIONS.has(request.destination)) return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;

      const response = await fetch(request);
      // Hashowane pliki są niezmienne — można je trzymać bez obaw.
      if (response.ok) {
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    })()
  );
});
