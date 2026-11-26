import { describe, it, expect, vi, beforeEach } from 'vitest';

const { apiGet, cacheMocks } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  cacheMocks: {
    getCachedVersion: vi.fn(),
    replaceAllQuestions: vi.fn(),
    putQuestion: vi.fn(),
    deleteQuestionById: vi.fn(),
    setCachedVersion: vi.fn(),
    getQuestionsByIds: vi.fn(),
    getQuestionsByCategory: vi.fn(),
    getAllQuestions: vi.fn(),
    countQuestions: vi.fn(),
  },
}));

vi.mock('@/api', () => ({ default: { get: apiGet } }));
vi.mock('@/utils/authStorage', () => ({ getToken: () => 'test-token' }));
vi.mock('@/utils/questionsCache', () => cacheMocks);

async function loadSync() {
  vi.resetModules();
  return import('./questionsSync');
}

function respondVersion(version = 3) {
  apiGet.mockImplementation(async (url) => {
    if (url === '/questions/version') {
      return { data: { version, count: 10, updatedAt: '2026-11-26T10:00:00.000Z' } };
    }
    if (url.startsWith('/questions/changes')) {
      return {
        data: {
          version,
          updatedAt: '2026-11-26T10:00:00.000Z',
          full: false,
          changes: [
            { action: 'upsert', ID: 2, question: { ID: 2, question: 'Zmienione?' } },
            { action: 'delete', ID: 5 },
          ],
          hasMore: false,
          lastVersion: version,
        },
      };
    }
    return { data: {} };
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  cacheMocks.getCachedVersion.mockResolvedValue({ version: 1 });
  cacheMocks.replaceAllQuestions.mockResolvedValue();
  cacheMocks.putQuestion.mockResolvedValue();
  cacheMocks.deleteQuestionById.mockResolvedValue();
  cacheMocks.setCachedVersion.mockResolvedValue();
});

describe('ensureQuestionsCache — synchronizacja przyrostowa', () => {
  it('stosuje deltę bez pobierania pełnego snapshotu', async () => {
    respondVersion(3);
    const { ensureQuestionsCache } = await loadSync();

    const result = await ensureQuestionsCache({ force: true });

    expect(result.delta).toBe(true);
    expect(cacheMocks.putQuestion).toHaveBeenCalledWith(
      expect.objectContaining({ ID: 2, question: 'Zmienione?' })
    );
    expect(cacheMocks.deleteQuestionById).toHaveBeenCalledWith(5);
    expect(cacheMocks.replaceAllQuestions).not.toHaveBeenCalled();
    expect(cacheMocks.setCachedVersion).toHaveBeenCalledWith(
      3,
      '2026-11-26T10:00:00.000Z'
    );
    expect(apiGet).not.toHaveBeenCalledWith(
      '/questions/snapshot',
      expect.anything()
    );
  });

  it('pobiera pełny snapshot, gdy serwer zgłosi lukę w logu zmian', async () => {
    apiGet.mockImplementation(async (url) => {
      if (url === '/questions/version') {
        return { data: { version: 5, count: 10, updatedAt: '2026-11-26T10:00:00.000Z' } };
      }
      if (url.startsWith('/questions/changes')) {
        return { data: { version: 5, full: true, changes: [] } };
      }
      if (url === '/questions/snapshot') {
        return {
          data: {
            version: 5,
            updatedAt: '2026-11-26T10:00:00.000Z',
            questions: [{ ID: 1 }, { ID: 2 }],
          },
        };
      }
      return { data: {} };
    });
    const { ensureQuestionsCache } = await loadSync();

    const result = await ensureQuestionsCache({ force: true });

    expect(result.delta).toBeUndefined();
    expect(cacheMocks.replaceAllQuestions).toHaveBeenCalledWith(
      [{ ID: 1 }, { ID: 2 }],
      5,
      '2026-11-26T10:00:00.000Z'
    );
  });

  it('nie pobiera niczego, gdy wersje są równe', async () => {
    cacheMocks.getCachedVersion.mockResolvedValue({ version: 5 });
    apiGet.mockResolvedValue({
      data: { version: 5, count: 10, updatedAt: '2026-11-26T10:00:00.000Z' },
    });
    const { ensureQuestionsCache } = await loadSync();

    const result = await ensureQuestionsCache({ force: true });

    expect(result.upToDate).toBe(true);
    expect(apiGet).toHaveBeenCalledTimes(1);
    expect(cacheMocks.replaceAllQuestions).not.toHaveBeenCalled();
    expect(cacheMocks.putQuestion).not.toHaveBeenCalled();
  });
});
