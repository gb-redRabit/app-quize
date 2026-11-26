/**
 * Podsumowanie wpisu historii — bez dużych list odpowiedzi.
 * Pełne wpisy trzymamy w IndexedDB, a localStorage tylko dla szybkiego startu.
 *
 * @param {object} entry
 * @returns {object|null}
 */
export function toHistorySummary(entry) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return entry;
  const summary = { ...entry };
  delete summary.list;
  delete summary.questionTimes;
  return summary;
}
