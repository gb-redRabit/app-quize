const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const HISTORY_KEY = 'cached-history';
const HQUESTION_KEY = 'cached-hquestion';

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
  for (const key of [TOKEN_KEY, USER_KEY, HISTORY_KEY, HQUESTION_KEY]) {
    remove(sessionStorage, key);
    remove(localStorage, key);
  }
}

export function hasSession() {
  return Boolean(getToken() && getStoredUser());
}

// Lokalna kopia historii i odpowiedzi — statystyki i quiz działają offline.
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
    hquestion: parse(HQUESTION_KEY),
  };
}

export function setCachedHistory(history) {
  const raw = JSON.stringify(Array.isArray(history) ? history : []);
  write(localStorage, HISTORY_KEY, raw);
  write(sessionStorage, HISTORY_KEY, raw);
}

export function setCachedHQuestion(hquestion) {
  const raw = JSON.stringify(Array.isArray(hquestion) ? hquestion : []);
  write(localStorage, HQUESTION_KEY, raw);
  write(sessionStorage, HQUESTION_KEY, raw);
}
