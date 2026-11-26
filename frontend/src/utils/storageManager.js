/**
 * Zarządzanie pamięcią urządzenia.
 *
 * `localStorage` ma sztywny limit (~5 MB na origin) i nie da się go zwiększyć.
 * Duże dane trzymamy w IndexedDB; tutaj prosimy przeglądarkę o trwałe
 * przechowywanie i raportujemy zużycie, żeby użytkownik wiedział, co się dzieje.
 */

export function formatBytes(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value < 0) return '—';
  if (value < 1024) return `${Math.round(value)} B`;

  const units = ['KB', 'MB', 'GB', 'TB'];
  let size = value / 1024;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }

  const rounded = size >= 100 ? Math.round(size) : Math.round(size * 10) / 10;
  return `${rounded} ${units[unit]}`;
}

/** Prosi o trwałe przechowywanie (chroni IndexedDB przed automatycznym czyszczeniem). */
export async function requestPersistentStorage() {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted?.()) return true;
    return await navigator.storage.persist();
  } catch (e) {
    return false;
  }
}

/** Zużycie pamięci originu (IndexedDB + cache) i status trwałości. */
export async function getStorageHealth() {
  try {
    if (!navigator.storage?.estimate) return null;
    const estimate = await navigator.storage.estimate();
    const usage = Number(estimate?.usage) || 0;
    const quota = Number(estimate?.quota) || 0;
    const persisted = Boolean(await navigator.storage.persisted?.());
    const percent = quota > 0 ? Math.min(100, Math.round((usage / quota) * 1000) / 10) : 0;

    return { usage, quota, percent, persisted };
  } catch (e) {
    return null;
  }
}
