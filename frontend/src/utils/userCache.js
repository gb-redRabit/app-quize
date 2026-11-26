/**
 * Pełne dane użytkownika w IndexedDB: historia i odpowiedzi (hquestion).
 * `localStorage` trzyma tylko podsumowania i znacznik obecności kopii, więc
 * limit ~5 MB nie jest blokowany przez duże tablice.
 *
 * Rekordy są kluczowane po `userId` — konto na tym samym urządzeniu nigdy
 * nie odczyta danych innego konta.
 */

const DB_NAME = 'quiz-user-cache';
const DB_VERSION = 2;
const STORE_HISTORY = 'history';
const STORE_HQUESTION = 'hquestion';
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
      // v1 miało tylko `history`; v2 dokłada `hquestion` bez utraty danych.
      for (const store of [STORE_HISTORY, STORE_HQUESTION]) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'key' });
        }
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

async function writeRecord(storeName, userId, value) {
  if (!userId) return;
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put({
      key: RECORD_KEY,
      userId: String(userId),
      value,
      updatedAt: Date.now(),
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function readRecord(storeName, userId) {
  if (!userId) return [];
  const db = await openDb();
  const record = await new Promise((resolve, reject) => {
    const request = db.transaction(storeName, 'readonly').objectStore(storeName).get(RECORD_KEY);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  if (!record || record.userId !== String(userId)) return [];
  return Array.isArray(record.value) ? record.value : [];
}

async function clearRecord(storeName) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(RECORD_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

// --- Historia quizów/egzaminów ---
export function replaceHistoryCache(userId, entries) {
  return writeRecord(STORE_HISTORY, userId, Array.isArray(entries) ? entries : []);
}

export function getHistoryCache(userId) {
  return readRecord(STORE_HISTORY, userId);
}

export function clearHistoryCache() {
  return clearRecord(STORE_HISTORY);
}

// --- Odpowiedzi na pytania (hquestion) ---
export function replaceHQuestionCache(userId, answers) {
  return writeRecord(STORE_HQUESTION, userId, Array.isArray(answers) ? answers : []);
}

export function getHQuestionCache(userId) {
  return readRecord(STORE_HQUESTION, userId);
}

export function clearHQuestionCache() {
  return clearRecord(STORE_HQUESTION);
}

/** Usuwa wszystkie lokalne dane użytkownika (wylogowanie, usunięcie konta). */
export async function clearUserCache() {
  await Promise.all([clearHistoryCache(), clearHQuestionCache()]);
}
