import apiClient from '@/api';
import { getToken } from '@/utils/authStorage';
import {
  getCachedVersion,
  replaceAllQuestions,
  putQuestion,
  deleteQuestionById,
  setCachedVersion,
  getQuestionsByIds as cacheGetByIds,
  getQuestionsByCategory as cacheGetByCategory,
  getQuestionIdsByCategory as cacheGetIdsByCategory,
  getAllQuestions as cacheGetAll,
  countQuestions,
} from '@/utils/questionsCache';

const VERSION_STORAGE_KEY = 'quiz-db-version';
const MIN_CHECK_INTERVAL_MS = 5 * 60 * 1000;

let inFlightSync = null;
let lastCheckAt = 0;
let bulkSyncTimer = null;

function readStoredVersion() {
  try {
    const raw = localStorage.getItem(VERSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function storeVersion(info) {
  try {
    localStorage.setItem(
      VERSION_STORAGE_KEY,
      JSON.stringify({ ...info, fetchedAt: Date.now() })
    );
  } catch (e) {
    // Brak dostępu do localStorage — pomijamy.
  }
}

/** Ostatnio znana wersja bazy — do natychmiastowego pokazania w stopce. */
export function getKnownDbVersion() {
  return readStoredVersion();
}

/** Pobiera wersję z serwera (publiczny endpoint) i zapamiętuje ją lokalnie. */
export async function fetchDbVersion() {
  const res = await apiClient.get('/questions/version', { silent: true, noCache: true });
  const info = {
    version: res.data?.version ?? null,
    count: res.data?.count ?? null,
    updatedAt: res.data?.updatedAt || null,
  };
  storeVersion(info);
  return info;
}

/**
 * Dociąga pełny snapshot pytań, jeśli wersja na serwerze różni się od lokalnej.
 * Bezpieczne do wywoływania często — sprawdzenie wersji jest tanie i
 * ograniczone do raz na 5 minut (chyba że `force`).
 */
export async function ensureQuestionsCache({ force = false } = {}) {
  if (inFlightSync) return inFlightSync;

  // Snapshot wymaga tokenu — bez logowania nie ma czego synchronizować.
  if (!getToken()) {
    return { skipped: true, reason: 'unauthenticated' };
  }

  inFlightSync = (async () => {
    try {
      if (!force && Date.now() - lastCheckAt < MIN_CHECK_INTERVAL_MS) {
        return { skipped: true };
      }

      const local = await getCachedVersion().catch(() => null);
      const server = await fetchDbVersion();
      lastCheckAt = Date.now();

      if (
        local &&
        local.version != null &&
        server.version != null &&
        Number(local.version) === Number(server.version)
      ) {
        return { upToDate: true, version: server.version };
      }

      // Delta sync: pobierz tylko zmiany od lokalnej wersji (zamiast ~5 MB snapshotu).
      const localVersion = local?.version != null ? Number(local.version) : null;
      if (
        localVersion != null &&
        localVersion > 0 &&
        server.version != null &&
        localVersion < Number(server.version)
      ) {
        try {
          let since = localVersion;
          let guard = 0;
          let appliedAny = false;

          while (guard < 20) {
            guard += 1;
            const res = await apiClient.get(
              `/questions/changes?since=${since}&limit=500`,
              { silent: true, noCache: true }
            );
            const data = res.data || {};

            if (data.full) break; // log zmian nie pokrywa zakresu → pełny snapshot

            const changes = Array.isArray(data.changes) ? data.changes : [];
            for (const change of changes) {
              if (change.action === 'delete' && change.ID != null) {
                await deleteQuestionById(change.ID);
                appliedAny = true;
              } else if (change.action === 'upsert' && change.question) {
                await putQuestion(change.question);
                appliedAny = true;
              }
            }

            if (data.hasMore) {
              since = Number(data.lastVersion) || since;
              continue;
            }

            const finalVersion = data.version ?? server.version;
            const finalUpdatedAt = data.updatedAt || server.updatedAt;
            await setCachedVersion(finalVersion, finalUpdatedAt);
            storeVersion({
              version: finalVersion,
              count: server.count,
              updatedAt: finalUpdatedAt,
            });

            return {
              updated: appliedAny,
              delta: true,
              version: finalVersion,
            };
          }
        } catch (deltaError) {
          console.warn(
            'Synchronizacja przyrostowa nie powiodła się — pełny snapshot:',
            deltaError?.message || deltaError
          );
        }
      }

      const res = await apiClient.get('/questions/snapshot', { silent: true, noCache: true });
      const data = res.data || {};
      if (!Array.isArray(data.questions)) {
        throw new Error('Niepoprawny format snapshotu');
      }

      await replaceAllQuestions(data.questions, data.version, data.updatedAt);
      storeVersion({
        version: data.version,
        count: data.questions.length,
        updatedAt: data.updatedAt,
      });

      return { updated: true, version: data.version, count: data.questions.length };
    } catch (error) {
      console.warn('Synchronizacja cache pytań nie powiodła się:', error?.message || error);
      return { error };
    } finally {
      inFlightSync = null;
    }
  })();

  return inFlightSync;
}

/** Reakcja na zdarzenie SSE — aktualizuje pojedyncze rekordy bez pełnego pobierania. */
export async function handleQuestionsEvent(detail = {}) {
  const type = detail.type;

  try {
    if ((type === 'update' || type === 'create') && detail.question) {
      await putQuestion(detail.question);
      if (detail.version != null) await setCachedVersion(detail.version, new Date().toISOString());
      return;
    }

    if (type === 'delete' && detail.ID != null) {
      await deleteQuestionById(detail.ID);
      if (detail.version != null) await setCachedVersion(detail.version, new Date().toISOString());
      return;
    }

    if (type === 'bulk') {
      // Import/czyszczenie/usunięcie kategorii — pełne odświeżenie w tle.
      clearTimeout(bulkSyncTimer);
      bulkSyncTimer = setTimeout(() => {
        ensureQuestionsCache({ force: true });
      }, 1500);
    }
  } catch (error) {
    console.warn('Aktualizacja cache pytań nie powiodła się:', error?.message || error);
  }
}

// --- Odczyty dla widoków (z fallbackiem do API po stronie wywołującego) ---

export async function getCachedQuestionsByIds(ids) {
  try {
    const questions = await cacheGetByIds(ids);
    return questions;
  } catch (e) {
    return [];
  }
}

export async function getCachedQuestionsByCategory(category) {
  try {
    return await cacheGetByCategory(category);
  } catch (e) {
    return [];
  }
}

/** ID pytań z kategorii prosto z IndexedDB (offline, bez sieci). */
export async function getCachedQuestionIdsByCategory(category) {
  try {
    return await cacheGetIdsByCategory(category);
  } catch (e) {
    return [];
  }
}

export async function getAllCachedQuestions() {
  try {
    return await cacheGetAll();
  } catch (e) {
    return [];
  }
}

export async function getCachedQuestionCount() {
  try {
    return await countQuestions();
  } catch (e) {
    return 0;
  }
}
