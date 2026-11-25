// Service Worker aplikacji Quiz App.
// - Zasoby statyczne (JS/CSS/fonty/obrazy): cache-first — hashowane pliki są niezmienne.
// - Nawigacje (HTML): network-first z fallbackiem do ostatnio zapisanej powłoki,
//   dzięki czemu aplikacja uruchamia się także bez sieci.
// - API i manifest zawsze z sieci (żadnych starych danych).
const STATIC_CACHE = 'quiz-static-v2';
const SHELL_CACHE = 'quiz-shell-v2';
const SHELL_URL = '/index.html';
const STATIC_DESTINATIONS = new Set(['script', 'style', 'font', 'image']);
const MAX_STATIC_ENTRIES = 300;

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

// Pozwala stronie wymusić aktywację nowej wersji (przycisk „Odśwież”).
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

async function trimCache(cache) {
  const keys = await cache.keys();
  if (keys.length <= MAX_STATIC_ENTRIES) return;
  // Najstarsze wpisy usuwamy partiami — cache nie rośnie w nieskończoność.
  const excess = keys.length - MAX_STATIC_ENTRIES;
  await Promise.all(keys.slice(0, excess).map((request) => cache.delete(request)));
}

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
    await cache.put(request, response.clone()).catch(() => {});
    trimCache(cache).catch(() => {});
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
