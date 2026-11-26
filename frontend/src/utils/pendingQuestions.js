import { getQueue } from './offlineQueue';

/**
 * Pytania dodane offline, czekające w kolejce na wysłanie.
 * Dostają ujemne, tymczasowe ID i flagę `__pending`, żeby odróżnić je od
 * danych z serwera (nie da się ich edytować/usunąć przed synchronizacją).
 */
export function getPendingQuestionCreates() {
  return getQueue()
    .filter((op) => op && op.type === 'question-create' && op.payload)
    .map((op, index) => {
      const base = Number(op.queuedAt) || Date.now();
      const id = -(Math.abs(base) * 1000 + index);
      const payload = { ...op.payload };
      delete payload.ID;
      delete payload._id;
      return {
        ...payload,
        ID: id,
        __pending: true,
        __queuedAt: op.queuedAt || null,
      };
    });
}
