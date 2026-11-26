/**
 * Pełne wpisy historii w IndexedDB. localStorage trzyma tylko podsumowania,
 * więc limit ~5 MB nie jest blokowany przez listy odpowiedzi.
 *
 * Rekord jest kluczowany po użytkowniku — konto na tym samym urządzeniu
 * nigdy nie odczyta historii innego konta.
 */

const DB_NAME = 'quiz-user-cache';
const DB_VERSION = 1;
const STORE = 'history';
const RECORD_KEY = 'all';

let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB niedostępne'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

export async function replaceHistoryCache(userId, entries) {
  if (!userId) return;
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put({
      key: RECORD_KEY,
      userId: String(userId),
      entries: Array.isArray(entries) ? entries : [],
      updatedAt: Date.now(),
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function getHistoryCache(userId) {
  if (!userId) return [];
  const db = await openDb();
  const record = await new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(RECORD_KEY);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  if (!record || record.userId !== String(userId)) return [];
  return Array.isArray(record.entries) ? record.entries : [];
}

export async function clearHistoryCache() {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(RECORD_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
