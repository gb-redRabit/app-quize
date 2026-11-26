/**
 * Wyznacza pytania do powtórki: te, które nie zostały jeszcze rozwiązane
 * poprawnie (brak odpowiedzi albo odpowiedź błędna).
 *
 * @param {Array<number|string>} allIds — pełna pula pytań kategorii
 * @param {Array<{id: number|string, correct?: boolean, category?: string}>} answers
 * @param {string} category — nazwa kategorii lub 'all'
 * @returns {Array<number|string>} ID w kolejności z `allIds`
 */
export function filterWrongOrNotDone(allIds, answers, category) {
  const mastered = new Set();

  for (const entry of answers || []) {
    if (!entry || entry.correct !== true) continue;
    if (category !== 'all' && entry.category !== category) continue;
    mastered.add(String(entry.id));
  }

  return (allIds || []).filter((id) => !mastered.has(String(id)));
}
