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
// Jednorazowa migracja: wymusza aktualizację klientów z starym SW, którzy
// mogą utknąć na chunkach usuniętych po wdrożeniu.
const FORCE_UPDATE_MARKER = 'quiz-sw-force-2026-11';

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
      // Bez skipWaiting: nowa wersja czeka, aż użytkownik kliknie „Odśwież”.
      // Dzięki temu otwarta stara karta nie traci swoich chunków w trakcie.
      // Wyjątki: migracja ze starego SW (cache v2) oraz jednorazowa akcja
      // ratunkowa dla klientów z brakującymi chunkami po wdrożeniu.
      const keys = await caches.keys();
      const hasLegacyCaches = keys.some(
        (key) => key === 'quiz-static-v2' || key === 'quiz-shell-v2'
      );
      const needsForceUpdate = hasLegacyCaches || !keys.includes(FORCE_UPDATE_MARKER);
      if (needsForceUpdate) await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([PRECACHE, STATIC_CACHE, SHELL_CACHE, FORCE_UPDATE_MARKER]);
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key)));
      // Znacznik: kolejne wersje nie wymuszają już skipWaiting.
      await caches.open(FORCE_UPDATE_MARKER);
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

// Nie pozwól zapisać odpowiedzi HTML pod adresem modułu/skryptu — po deployu
// Vercel potrafi zwrócić index.html dla nieistniejącego chunku.
function isExpectedContent(destination, response) {
  const type = (response.headers.get('content-type') || '').toLowerCase();
  if (!type) return true;

  switch (destination) {
    case 'script':
      return type.includes('javascript') || type.includes('ecmascript');
    case 'style':
      return type.includes('text/css');
    case 'font':
      return type.includes('font') || type.includes('woff');
    case 'image':
      return type.startsWith('image/');
    default:
      return true;
  }
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
  // 1. Precache z bieżącego builda.
  const precache = await caches.open(PRECACHE);
  const precached = await precache.match(request);
  if (precached) return precached;

  // 2. Cache runtime — tylko wpisy o poprawnym typie.
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached && isExpectedContent(request.destination, cached)) return cached;
  if (cached) await cache.delete(request);

  const response = await fetch(request);

  if (response.ok && !isExpectedContent(request.destination, response)) {
    // Serwer zwrócił HTML zamiast modułu — traktujemy jak błąd sieci,
    // żeby router przeładował stronę po nowym wdrożeniu.
    return Response.error();
  }

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
