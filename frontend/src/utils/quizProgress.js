/**
 * Czyste funkcje pomocnicze do zapisu/wznowienia sesji quizu i egzaminu.
 * Trzymane poza komponentem, aby dały się testować bez montowania Vue.
 */

/**
 * Stabilny podpis sesji. Preferuje losowy token `r` (tworzony przy starcie),
 * a bez niego buduje podpis z rozkodowanych parametrów zapytania — dzięki temu
 * `+` i `%20` w adresie dają ten sam wynik.
 */
export function buildProgressSignature(routeName, query = {}) {
  if (query && query.r) {
    return `${routeName}|${query.r}`;
  }

  const ids = typeof query.ids === 'string' ? query.ids : '';
  let hash = 0;
  for (let i = 0; i < ids.length; i += 1) {
    hash = (hash * 31 + ids.charCodeAt(i)) | 0;
  }

  return [
    routeName,
    query.categories || '',
    query.length || '',
    query.time || '',
    query.onlyNotDone || '',
    ids ? `${ids.split(',').length}:${hash}` : '',
  ].join('|');
}

/**
 * Ile sekund zostało z egzaminu. Priorytet ma absolutny moment startu, więc
 * wynik nie zależy od tego, kiedy ostatnio zapisano stan. `null` oznacza, że
 * nie da się tego policzyć (np. sesja quizu).
 */
export function computeRemainingSeconds({
  savedAt,
  timeLeft,
  examStartedAt,
  examTimeLimit,
  now = Date.now(),
} = {}) {
  const startedAt = Number(examStartedAt);
  const limit = Number(examTimeLimit);

  if (Number.isFinite(startedAt) && startedAt > 0 && Number.isFinite(limit) && limit > 0) {
    return limit - Math.floor((now - startedAt) / 1000);
  }

  if (typeof timeLeft === 'number') {
    const saved = Number(savedAt) || now;
    return timeLeft - Math.floor((now - saved) / 1000);
  }

  return null;
}

/**
 * Czy warto zapisywać stan. Pusty quiz nie ma czego wznawiać, ale egzamin
 * z upływającym czasem — tak.
 */
export function shouldSaveProgress({
  answeredCount = 0,
  currentIndex = 0,
  mode = 'quiz',
  timeLeft = 0,
  timeLimit = 0,
} = {}) {
  if (answeredCount > 0 || currentIndex > 0) return true;
  return mode === 'exam' && timeLeft < timeLimit;
}
