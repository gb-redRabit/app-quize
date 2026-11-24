/**
 * Lokalny cache pytań (IndexedDB). To replika tylko do odczytu — źródłem
 * prawdy pozostaje baza na serwerze, a świeżość pilnuje numer wersji.
 */

const DB_NAME = 'quiz-cache';
const DB_VERSION = 1;
const STORE_QUESTIONS = 'questions';
const STORE_META = 'meta';

let dbPromise = null;

function requestAsPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

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
      if (!db.objectStoreNames.contains(STORE_QUESTIONS)) {
        const store = db.createObjectStore(STORE_QUESTIONS, { keyPath: 'ID' });
        store.createIndex('byCategory', 'category', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

async function withStore(storeName, mode, callback) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    let result;
    try {
      result = callback(store);
    } catch (error) {
      reject(error);
      return;
    }
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export async function getMeta(key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_META, 'readonly').objectStore(STORE_META).get(key);
    request.onsuccess = () => resolve(request.result ? request.result.value : null);
    request.onerror = () => reject(request.error);
  });
}

export async function setMeta(key, value) {
  return withStore(STORE_META, 'readwrite', (store) => {
    store.put({ key, value });
  });
}

export async function getCachedVersion() {
  const version = await getMeta('version');
  const updatedAt = await getMeta('updatedAt');
  if (version === null) return null;
  return { version, updatedAt };
}

export async function setCachedVersion(version, updatedAt) {
  await setMeta('version', version);
  if (updatedAt) await setMeta('updatedAt', updatedAt);
}

export async function clearQuestions() {
  return withStore(STORE_QUESTIONS, 'readwrite', (store) => {
    store.clear();
  });
}

/**
 * Zapisuje pytania porcjami, żeby nie blokować długo transakcji.
 */
export async function bulkPutQuestions(questions, chunkSize = 500) {
  const db = await openDb();
  for (let i = 0; i < questions.length; i += chunkSize) {
    const chunk = questions.slice(i, i + chunkSize);
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_QUESTIONS, 'readwrite');
      const store = transaction.objectStore(STORE_QUESTIONS);
      for (const question of chunk) store.put(question);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  }
}

/**
 * Zastępuje cały cache nowym snapshotem i zapisuje wersję.
 */
export async function replaceAllQuestions(questions, version, updatedAt) {
  await clearQuestions();
  await bulkPutQuestions(questions);
  await setCachedVersion(version, updatedAt);
}

export async function putQuestion(question) {
  if (!question || question.ID == null) return;
  return withStore(STORE_QUESTIONS, 'readwrite', (store) => {
    store.put(question);
  });
}

export async function deleteQuestionById(id) {
  return withStore(STORE_QUESTIONS, 'readwrite', (store) => {
    store.delete(Number(id));
  });
}

export async function getQuestionById(id) {
  const db = await openDb();
  const request = db
    .transaction(STORE_QUESTIONS, 'readonly')
    .objectStore(STORE_QUESTIONS)
    .get(Number(id));
  return requestAsPromise(request);
}

export async function getQuestionsByIds(ids) {
  const db = await openDb();
  const store = db.transaction(STORE_QUESTIONS, 'readonly').objectStore(STORE_QUESTIONS);
  const results = await Promise.all(ids.map((id) => requestAsPromise(store.get(Number(id)))));
  return results.filter(Boolean);
}

export async function getQuestionsByCategory(category) {
  const db = await openDb();
  const store = db.transaction(STORE_QUESTIONS, 'readonly').objectStore(STORE_QUESTIONS);
  return requestAsPromise(store.index('byCategory').getAll(category));
}

export async function getAllQuestions() {
  const db = await openDb();
  const store = db.transaction(STORE_QUESTIONS, 'readonly').objectStore(STORE_QUESTIONS);
  return requestAsPromise(store.getAll());
}

export async function countQuestions() {
  const db = await openDb();
  const store = db.transaction(STORE_QUESTIONS, 'readonly').objectStore(STORE_QUESTIONS);
  return requestAsPromise(store.count());
}
