/**
 * Kolejka operacji wykonanych offline (odpowiedzi i wpisy historii).
 * Trzymana w localStorage, bo jest mała i musi przetrwać reload.
 */

const STORAGE_KEY = 'offline-queue-v1';
const MAX_ENTRIES = 500;

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function write(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch (e) {
    // Brak miejsca / tryb prywatny — pomijamy.
  }
}

export function getQueue() {
  return read();
}

export function queueSize() {
  return read().length;
}

export function enqueue(op) {
  const entries = read();
  entries.push({ ...op, queuedAt: Date.now() });
  write(entries);
}

export function shiftQueue() {
  const entries = read();
  entries.shift();
  write(entries);
}

export function clearQueue() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignoruj
  }
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
