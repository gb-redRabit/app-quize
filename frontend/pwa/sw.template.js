/* eslint-disable no-undef */
// Service Worker aplikacji Quiz App.
// Plik jest generowany przy buildzie: lista zasobów i wersja cache są wstrzykiwane
// przez plugin w `vite.config.js`. Dzięki temu wszystkie chunki (także leniwe)
// działają offline już po pierwszej wizycie.
//
// Strategie:
// - precache: wszystkie pliki builda (JS/CSS/HTML/ikony) — cache-first,
// - nawigacje: network-first z fallbackiem do zapisanej powłoki,
// - pozostałe statyczne: cache-first (runtime), z limitem rozmiaru.
const CACHE_VERSION = '__CACHE_VERSION__';
const PRECACHE_URLS = __PRECACHE_URLS__;

const PRECACHE = `quiz-precache-${CACHE_VERSION}`;
const STATIC_CACHE = `quiz-static-${CACHE_VERSION}`;
const SHELL_CACHE = `quiz-shell-${CACHE_VERSION}`;
const SHELL_URL = '/index.html';
const STATIC_DESTINATIONS = new Set(['script', 'style', 'font', 'image']);
const MAX_STATIC_ENTRIES = 300;

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE);
      // Pojedyncze błędy nie blokują instalacji — reszta zasobów wystarczy.
      await Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => {})
        )
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([PRECACHE, STATIC_CACHE, SHELL_CACHE]);
      const keys = await caches.keys();
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
  const excess = keys.length - MAX_STATIC_ENTRIES;
  await Promise.all(keys.slice(0, excess).map((request) => cache.delete(request)));
}

async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(SHELL_URL, response.clone()).catch(() => {});
    }
    return response;
  } catch (error) {
    const cache = await caches.open(SHELL_CACHE);
    const cached = (await cache.match(SHELL_URL)) || (await cache.match(request));
    if (cached) return cached;
    const precached = await caches.match(SHELL_URL);
    if (precached) return precached;
    throw error;
  }
}

async function handleStatic(request) {
  const precached = await caches.match(request);
  if (precached) return precached;

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
