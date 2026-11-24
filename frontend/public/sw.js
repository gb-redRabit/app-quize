// Service Worker aplikacji Quiz App.
// - Zasoby statyczne (JS/CSS/fonty/obrazy): cache-first — hashowane pliki są niezmienne.
// - Nawigacje (HTML): network-first z fallbackiem do ostatnio zapisanej powłoki,
//   dzięki czemu aplikacja uruchamia się także bez sieci.
// - API i manifest zawsze z sieci (żadnych starych danych).
const STATIC_CACHE = 'quiz-static-v1';
const SHELL_CACHE = 'quiz-shell-v1';
const SHELL_URL = '/index.html';
const STATIC_DESTINATIONS = new Set(['script', 'style', 'font', 'image']);

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const keep = new Set([STATIC_CACHE, SHELL_CACHE]);
      await Promise.all(keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key)));
      await self.clients.claim();
    })()
  );
});

async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      // Zapisujemy pod stałym adresem — każda trasa SPA dostaje ten sam shell.
      cache.put(SHELL_URL, response.clone()).catch(() => {});
    }
    return response;
  } catch (error) {
    const cache = await caches.open(SHELL_CACHE);
    const cached = (await cache.match(SHELL_URL)) || (await cache.match(request));
    if (cached) return cached;
    throw error;
  }
}

async function handleStatic(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (!STATIC_DESTINATIONS.has(request.destination)) return;

  event.respondWith(handleStatic(request));
});
