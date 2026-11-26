import apiClient from '@/api';
import { getToken } from '@/utils/authStorage';
import { saveOfflineFile, getOfflineFile, deleteOfflineFile } from './offlineFiles';
import {
  enqueue,
  getQueue,
  shiftQueue,
  newClientId,
  queueSize,
} from '@/utils/offlineQueue';

export const MAX_OFFLINE_IMPORT_BYTES = 15 * 1024 * 1024;

/** Klucz w IndexedDB jest liczbowy — normalizujemy ID z formularzy. */
function normalizeQuestionId(id) {
  const numeric = Number(id);
  return Number.isSafeInteger(numeric) ? numeric : id;
}

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

/** Usunięcie pytania wykonane offline (po ID). */
export function queueQuestionDelete(id) {
  enqueue({ type: 'question-delete', payload: { ID: id } });
}

/**
 * Import Excel wykonany offline: plik trafia do IndexedDB, do kolejki tylko
 * metadane. Po powrocie sieci plik jest wysyłany jako multipart.
 */
export async function queueExcelImport(file) {
  if (!file) throw new Error('Brak pliku do importu');
  if (file.size > MAX_OFFLINE_IMPORT_BYTES) {
    throw new Error('Plik jest za duży do importu offline (limit 15 MB).');
  }
  const fileId = `import-${newClientId()}`;
  await saveOfflineFile(fileId, file, { name: file.name });
  enqueue({
    type: 'import-excel',
    payload: { fileId, name: file.name, size: file.size },
  });
  return fileId;
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
    let conflicts = 0;
    const importsDone = [];
    const importsFailed = [];
    const questionEvents = [];
    while (true) {
      const [op] = getQueue();
      if (!op) break;

      try {
        if (op.type === 'hquestion') {
          await apiClient.silentPost('/users/hquestion', op.payload);
        } else if (op.type === 'history') {
          await apiClient.silentPut('/users/update-profile', { addHistory: op.payload });
        } else if (op.type === 'question-create') {
          const response = await apiClient.silentPost('/questions', op.payload);
          const createdId = response?.data?.ID ?? op.payload?.ID;
          if (createdId != null) {
            questionEvents.push({
              type: 'create',
              question: { ...op.payload, ID: normalizeQuestionId(createdId) },
            });
          }
          questionsChanged = true;
        } else if (op.type === 'question-update') {
          await apiClient.silentPut(`/questions/${op.payload.ID}`, op.payload);
          const question = { ...op.payload };
          delete question.expectedUpdatedAt;
          question.ID = normalizeQuestionId(question.ID);
          questionEvents.push({ type: 'update', question });
          questionsChanged = true;
        } else if (op.type === 'question-delete') {
          await apiClient.silentDelete(`/questions/${op.payload.ID}`);
          if (op.payload?.ID != null) {
            questionEvents.push({
              type: 'delete',
              ID: normalizeQuestionId(op.payload.ID),
            });
          }
          questionsChanged = true;
        } else if (op.type === 'import-excel') {
          const record = await getOfflineFile(op.payload.fileId);
          if (!record) {
            // Plik zniknął z IndexedDB — nie ma czego wysłać.
            shiftQueue();
            continue;
          }
          const formData = new FormData();
          formData.append('file', record.blob, record.name || 'import.xlsx');
          const response = await apiClient.silentPost(
            '/questions/import/excel',
            formData,
            {
              headers: { 'Content-Type': 'multipart/form-data' },
              skipErrorPage: true,
            }
          );
          importsDone.push({ name: record.name, ...(response.data || {}) });
          await deleteOfflineFile(op.payload.fileId);
          questionsChanged = true;
        }
        shiftQueue();
        sent += 1;
      } catch (error) {
        const status = error?.response?.status;
        if (status === 409) {
          // Ktoś zmienił pytanie w międzyczasie — nie nadpisujemy nowszej wersji.
          conflicts += 1;
          console.warn('Konflikt edycji — pominięto zmianę offline:', op.type);
          shiftQueue();
          continue;
        }
        if (status && status >= 400 && status < 500) {
          // Niepoprawne dane — nie ma sensu próbować w kółko.
          console.warn('Odrzucono niepoprawną operację z kolejki offline:', op.type, status);
          if (op.type === 'import-excel') {
            const message =
              error?.response?.data?.error ||
              error?.response?.data?.message ||
              'Import został odrzucony przez serwer.';
            importsFailed.push({ name: op.payload?.name, message });
            await deleteOfflineFile(op.payload?.fileId).catch(() => {});
          }
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
        // Najpierw punktowe aktualizacje cache — bez czekania na deltę.
        for (const detail of questionEvents) {
          window.dispatchEvent(new CustomEvent('questions-changed', { detail }));
        }
        // Import Excel zmienia wiele pytań naraz; pojedyncze operacje tylko
        // domykają numer wersji (delta), nie wymuszają pełnego snapshotu.
        window.dispatchEvent(
          new CustomEvent('questions-changed', {
            detail: {
              type: importsDone.length > 0 ? 'bulk' : 'sync',
              action: 'sync',
            },
          })
        );
      } catch (e) {
        // ignoruj
      }
    }

    if (conflicts > 0) {
      try {
        window.dispatchEvent(
          new CustomEvent('offline-conflicts', { detail: { count: conflicts } })
        );
      } catch (e) {
        // ignoruj
      }
    }

    if (importsDone.length > 0 || importsFailed.length > 0) {
      try {
        window.dispatchEvent(
          new CustomEvent('offline-import-finished', {
            detail: { done: importsDone, failed: importsFailed },
          })
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
