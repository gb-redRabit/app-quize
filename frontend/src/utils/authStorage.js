import { toHistorySummary } from './historySummary';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const HISTORY_KEY = 'cached-history';
const HQUESTION_KEY = 'cached-hquestion';
const HQUESTION_MARKER_KEY = 'cached-hquestion-user';

function read(storage, key) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function write(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch {
    // Prywatny tryb lub pełny storage — aplikacja działa dalej w pamięci.
  }
}

function remove(storage, key) {
  try {
    storage.removeItem(key);
  } catch {
    // ignore
  }
}

/**
 * Token i użytkownik są trzymani w localStorage (PWA/offline po zamknięciu
 * przeglądarki) oraz w sessionStorage dla kompatybilności w obrębie karty.
 */
export function getToken() {
  return read(sessionStorage, TOKEN_KEY) || read(localStorage, TOKEN_KEY) || null;
}

export function getStoredUserRaw() {
  return read(sessionStorage, USER_KEY) || read(localStorage, USER_KEY) || null;
}

export function getStoredUser() {
  const raw = getStoredUserRaw();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setToken(token) {
  if (!token) return;
  write(sessionStorage, TOKEN_KEY, token);
  write(localStorage, TOKEN_KEY, token);
}

export function setUser(user) {
  const raw = JSON.stringify(user);
  write(sessionStorage, USER_KEY, raw);
  write(localStorage, USER_KEY, raw);
}

export function setSession(token, user) {
  if (token) setToken(token);
  if (user !== undefined) setUser(user);
}

export function clearSession() {
  for (const key of [TOKEN_KEY, USER_KEY, HISTORY_KEY, HQUESTION_KEY, HQUESTION_MARKER_KEY]) {
    remove(sessionStorage, key);
    remove(localStorage, key);
  }
}

export function hasSession() {
  return Boolean(getToken() && getStoredUser());
}

// Lokalna kopia historii (podsumowania) i stara kopia odpowiedzi (migracja).
export function getCachedUserData() {
  const parse = (key) => {
    const raw = read(localStorage, key) || read(sessionStorage, key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };
  return {
    history: parse(HISTORY_KEY),
    // Pełne odpowiedzi są teraz w IndexedDB; klucz zostaje dla migracji.
    hquestion: parse(HQUESTION_KEY),
  };
}

export function setCachedHistory(history) {
  // Tylko podsumowania — pełne wpisy (listy odpowiedzi) są w IndexedDB.
  const summaries = (Array.isArray(history) ? history : []).map(toHistorySummary);
  const raw = JSON.stringify(summaries);
  write(localStorage, HISTORY_KEY, raw);
  remove(sessionStorage, HISTORY_KEY);
}

/** Znacznik: odpowiedzi tego użytkownika są w IndexedDB (mały wpis). */
export function setCachedHQuestionMarker(userId, count) {
  if (!userId) return;
  const raw = JSON.stringify({ userId: String(userId), count: Number(count) || 0 });
  write(localStorage, HQUESTION_MARKER_KEY, raw);
  remove(sessionStorage, HQUESTION_MARKER_KEY);
  clearLegacyCachedHQuestion();
}

export function getCachedHQuestionMarker() {
  const raw = read(localStorage, HQUESTION_MARKER_KEY) || read(sessionStorage, HQUESTION_MARKER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearCachedHQuestionMarker() {
  remove(localStorage, HQUESTION_MARKER_KEY);
  remove(sessionStorage, HQUESTION_MARKER_KEY);
}

/** Czy istnieje lokalna kopia odpowiedzi (IndexedDB albo stara w localStorage). */
export function hasCachedHQuestion() {
  const marker = getCachedHQuestionMarker();
  const user = getStoredUser();
  if (marker && user?._id && marker.userId === String(user._id)) return true;
  return Boolean(read(localStorage, HQUESTION_KEY));
}

/** Stara, pełna kopia odpowiedzi — tylko do jednorazowej migracji do IndexedDB. */
export function getLegacyCachedHQuestion() {
  const raw = read(localStorage, HQUESTION_KEY) || read(sessionStorage, HQUESTION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearLegacyCachedHQuestion() {
  remove(localStorage, HQUESTION_KEY);
  remove(sessionStorage, HQUESTION_KEY);
}
