/**
 * Kolejka operacji wykonanych offline (odpowiedzi i wpisy historii).
 * Trzymana w localStorage, bo jest mała i musi przetrwać reload.
 */

const STORAGE_KEY = 'offline-queue-v1';
export const MAX_ENTRIES = 1000;
export const MAX_BYTES = 3 * 1024 * 1024;

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

/**
 * Ogranicza kolejkę do limitu pozycji i rozmiaru, zachowując NAJNOWSZE wpisy.
 * Zwraca liczbę odrzuconych (najstarszych) operacji.
 */
export function trimQueue(
  entries,
  { maxEntries = MAX_ENTRIES, maxBytes = MAX_BYTES } = {}
) {
  const list = Array.isArray(entries) ? entries : [];
  if (list.length === 0) return { entries: [], dropped: 0 };

  const kept = [];
  let total = 2; // "[]"
  let dropped = 0;

  for (let i = list.length - 1; i >= 0; i -= 1) {
    const size = JSON.stringify(list[i]).length + 1;
    if (kept.length >= maxEntries || total + size > maxBytes) {
      dropped = i + 1;
      break;
    }
    kept.push(list[i]);
    total += size;
  }

  kept.reverse();
  return { entries: kept, dropped };
}

function notify(name, detail) {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    }
  } catch (e) {
    // ignoruj
  }
}

function write(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch (e) {
    // Brak miejsca / tryb prywatny — zgłoś, żeby użytkownik wiedział.
    notify('offline-queue-write-failed', { size: entries.length });
    return false;
  }
}

export function getQueue() {
  return read();
}

export function queueSize() {
  return read().length;
}

function notifyQueueChanged() {
  notify('offline-queue-changed', { size: queueSize() });
}

export function enqueue(op) {
  const entries = read();
  entries.push({ ...op, queuedAt: Date.now() });

  const { entries: trimmed, dropped } = trimQueue(entries);
  const stored = write(trimmed);

  if (dropped > 0) {
    notify('offline-queue-overflow', { dropped, size: trimmed.length });
  }
  notifyQueueChanged();
  return { ok: stored && dropped === 0, dropped };
}

export function shiftQueue() {
  const entries = read();
  entries.shift();
  write(entries);
  notifyQueueChanged();
}

export function clearQueue() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignoruj
  }
  notifyQueueChanged();
}

export function newClientId() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch (e) {
    // fallback poniżej
  }
  return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
