/**
 * Wspólne progi statusu kategorii. Nie obniżać poniżej 90% — decyzja produktowa.
 */
export const MASTERED_MIN_ACCURACY = 90;

/**
 * @param {{correct?: number, wrong?: number}} stats
 * @param {number} total liczba pytań w kategorii
 * @returns {'new'|'progress'|'mastered'}
 */
export function getCategoryMasteryStatus(stats = {}, total = 0) {
  const correct = Number(stats.correct) || 0;
  const wrong = Number(stats.wrong) || 0;
  const done = correct + wrong;

  if (total <= 0 || done === 0) return 'new';
  const accuracy = (correct / done) * 100;
  if (done >= total && accuracy >= MASTERED_MIN_ACCURACY) return 'mastered';
  return 'progress';
}
