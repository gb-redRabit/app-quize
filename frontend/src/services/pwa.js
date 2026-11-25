import { ref } from 'vue';

/**
 * Stan aktualizacji PWA. `updateAvailable` ustawiane, gdy nowy Service Worker
 * jest zainstalowany i czeka na aktywację (nowa wersja aplikacji).
 */
export const updateAvailable = ref(false);

let waitingWorker = null;
let started = false;
let refreshing = false;

function markWaiting(worker) {
  if (!worker) return;
  waitingWorker = worker;
  updateAvailable.value = true;
}

/** Wymusza aktywację nowego Service Workera; przeładowanie robi `controllerchange`. */
export function applyUpdate() {
  if (waitingWorker) {
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    return;
  }
  window.location.reload();
}

export function dismissUpdate() {
  updateAvailable.value = false;
}

/**
 * Rejestruje Service Workera i wykrywa nową wersję. Wywoływane raz z `main.js`.
 * Nie robi nic poza produkcją lub bez wsparcia przeglądarki.
 */
export function setupPWA({ checkIntervalMs = 60 * 60 * 1000 } = {}) {
  if (started) return;
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  started = true;

  let hasController = Boolean(navigator.serviceWorker.controller);

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Pierwsza instalacja: SW przejmuje kontrolę, ale nie ma czego przeładowywać.
    if (!hasController) {
      hasController = true;
      return;
    }
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        `${import.meta.env.BASE_URL}sw.js`
      );

      // Aktualizacja mogła zostać pobrana przed otwarciem tej karty.
      if (registration.waiting && navigator.serviceWorker.controller) {
        markWaiting(registration.waiting);
      }

      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          // `controller` istnieje tylko przy aktualizacji (nie przy pierwszej instalacji).
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            markWaiting(worker);
          }
        });
      });

      // Cykliczne sprawdzanie nowej wersji (przy długo otwartej karcie).
      if (checkIntervalMs > 0) {
        setInterval(() => {
          registration.update().catch(() => {});
        }, checkIntervalMs);
      }
    } catch (error) {
      console.warn('Nie udało się zarejestrować service workera:', error);
    }
  });
}
