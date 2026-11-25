const TYPE_MATCHERS = {
  quiz: (type) => type.startsWith('quiz'),
  exam: (type) => type.startsWith('egzamin') || type.startsWith('exam'),
};

function entryCategories(entry) {
  const list = [];
  if (typeof entry?.category === 'string' && entry.category) list.push(entry.category);
  if (Array.isArray(entry?.categories)) {
    for (const category of entry.categories) {
      if (typeof category === 'string' && category) list.push(category);
    }
  }
  return list;
}

function entryTime(entry) {
  const time = Date.parse(entry?.data);
  return Number.isNaN(time) ? 0 : time;
}

/** Unikalne kategorie występujące w historii (posortowane alfabetycznie). */
export function listHistoryCategories(history) {
  const set = new Set();
  for (const entry of Array.isArray(history) ? history : []) {
    for (const category of entryCategories(entry)) set.add(category);
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'pl'));
}

/**
 * Filtruje i sortuje wpisy historii.
 * @param {Array} history
 * @param {{ type?: 'all'|'quiz'|'exam', category?: string, sort?: 'newest'|'oldest' }} options
 */
export function filterHistory(history, { type = 'all', category = 'all', sort = 'newest' } = {}) {
  let list = Array.isArray(history) ? history : [];

  const matcher = TYPE_MATCHERS[type];
  if (matcher) {
    list = list.filter((entry) => {
      const entryType = String(entry?.type || '').toLowerCase();
      return matcher(entryType);
    });
  }

  if (category && category !== 'all') {
    list = list.filter((entry) => entryCategories(entry).includes(category));
  }

  return [...list].sort((a, b) => {
    const diff = entryTime(a) - entryTime(b);
    return sort === 'oldest' ? diff : -diff;
  });
}
