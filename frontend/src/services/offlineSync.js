import apiClient from '@/api';
import { getToken } from '@/utils/authStorage';
import {
  enqueue,
  getQueue,
  shiftQueue,
  newClientId,
  queueSize,
} from '@/utils/offlineQueue';

let flushing = null;
let listenersReady = false;

/** Odpowiedź na pytanie (idempotentne po ID) — bezpieczne do ponowienia. */
export function queueHquestion({ id, correct, category }) {
  enqueue({ type: 'hquestion', payload: { id, correct, category } });
}

/** Nowe pytanie dodane offline — backend nada ID po synchronizacji. */
export function queueQuestionCreate(payload) {
  enqueue({ type: 'question-create', payload });
}

/** Edycja istniejącego pytania (po ID) wykonana offline. */
export function queueQuestionUpdate(payload) {
  enqueue({ type: 'question-update', payload });
}

/** Wpis historii z quizu/egzaminu. `clientId` chroni przed duplikatem. */
export function queueHistory(historyItem) {
  const payload = { ...historyItem, clientId: historyItem.clientId || newClientId() };
  enqueue({ type: 'history', payload });
  return payload.clientId;
}

export function isOfflineQueueEmpty() {
  return queueSize() === 0;
}

/**
 * Wysyła kolejkę po kolei. Zatrzymuje się przy błędzie sieci (spróbujemy
 * później), a błędne operacje 4xx odrzuca, żeby nie blokowały kolejki.
 */
export async function flushOfflineQueue() {
  if (flushing) return flushing;

  flushing = (async () => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return { skipped: true };
    }

    // Bez tokenu nie ma sensu wysyłać — poczekamy na logowanie.
    if (!getToken()) {
      return { skipped: true, reason: 'unauthenticated' };
    }

    let sent = 0;
    let questionsChanged = false;
    while (true) {
      const [op] = getQueue();
      if (!op) break;

      try {
        if (op.type === 'hquestion') {
          await apiClient.silentPost('/users/hquestion', op.payload);
        } else if (op.type === 'history') {
          await apiClient.silentPut('/users/update-profile', { addHistory: op.payload });
        } else if (op.type === 'question-create') {
          await apiClient.silentPost('/questions', op.payload);
          questionsChanged = true;
        } else if (op.type === 'question-update') {
          await apiClient.silentPut(`/questions/${op.payload.ID}`, op.payload);
          questionsChanged = true;
        }
        shiftQueue();
        sent += 1;
      } catch (error) {
        const status = error?.response?.status;
        if (status && status >= 400 && status < 500) {
          // Niepoprawne dane — nie ma sensu próbować w kółko.
          console.warn('Odrzucono niepoprawną operację z kolejki offline:', op.type, status);
          shiftQueue();
          continue;
        }
        // Błąd sieci/serwera — zostawiamy resztę na później.
        break;
      }
    }

    if (questionsChanged) {
      // Odśwież widoki i statystyki po zsynchronizowaniu pytań.
      try {
        apiClient.clearCache();
        window.dispatchEvent(
          new CustomEvent('questions-changed', { detail: { type: 'bulk', action: 'sync' } })
        );
      } catch (e) {
        // ignoruj
      }
    }

    return { sent };
  })();

  try {
    return await flushing;
  } finally {
    flushing = null;
  }
}

/** Uruchamia automatyczne dosyłanie po powrocie sieci. */
export function initOfflineSync() {
  if (listenersReady || typeof window === 'undefined') return;
  listenersReady = true;

  window.addEventListener('online', () => {
    flushOfflineQueue();
  });

  // Na starcie aplikacji również spróbuj dosłać zaległości.
  flushOfflineQueue();
}
