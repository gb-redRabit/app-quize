/**
 * Polska odmiana rzeczownika po liczbie: 1 → one, 2–4 (bez 12–14) → few,
 * pozostałe → many.
 *
 * @param {number} count
 * @param {string} one
 * @param {string} few
 * @param {string} many
 * @returns {string}
 */
export function pluralizePl(count, one, few, many) {
  const n = Math.abs(Math.trunc(Number(count) || 0));
  if (n === 1) return one;

  const mod10 = n % 10;
  const mod100 = n % 100;
  const isFew = mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14);

  return isFew ? few : many;
}
