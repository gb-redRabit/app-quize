/**
 * Ustawienia egzaminu. Wartość trzymana w profilu użytkownika
 * (`settings.examLength`), domyślnie 150 pytań.
 */
export const DEFAULT_EXAM_LENGTH = 150;
export const MIN_EXAM_LENGTH = 10;
export const MAX_EXAM_LENGTH = 500;

/** Zamienia dowolną wartość na poprawną liczbę pytań egzaminu. */
export function normalizeExamLength(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return DEFAULT_EXAM_LENGTH;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return DEFAULT_EXAM_LENGTH;
  return Math.min(MAX_EXAM_LENGTH, Math.max(MIN_EXAM_LENGTH, parsed));
}

/** Liczba pytań do egzaminu, nie większa niż dostępna pula. */
export function getExamLength(value, available = Infinity) {
  return Math.max(0, Math.min(normalizeExamLength(value), available));
}
