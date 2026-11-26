// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock('@/utils/userCache', () => ({
  getHistoryCache: vi.fn(async () => []),
  replaceHistoryCache: vi.fn(async () => {}),
  getHQuestionCache: vi.fn(async () => []),
  replaceHQuestionCache: vi.fn(async () => {}),
  clearUserCache: vi.fn(async () => {}),
}));

import apiClient from '@/api';
import * as userCache from '@/utils/userCache';
import { getCachedEtag, setCachedEtag } from '@/utils/authStorage';
import userStore from './user';

function createContext(overrides = {}) {
  const state = {
    user: {},
    hquestion: [],
    history: [],
    historyCachedLocally: false,
    hquestionCachedLocally: false,
    isAuthenticated: false,
  };
  const commits = [];
  return {
    state,
    commits,
    commit: (type, payload) => {
      commits.push([type, payload]);
      const mutation = userStore.mutations[type];
      if (mutation) mutation(state, payload);
    },
    dispatch: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.clearAllMocks();
});

describe('user store — dane użytkownika', () => {
  it('pobiera historię, odpowiedzi i profil równolegle i zapisuje cache', async () => {
    apiClient.get.mockImplementation((url) => {
      if (url === '/users/history')
        return Promise.resolve({ data: [{ clientId: 'a' }], headers: { etag: 'W/"h1"' } });
      if (url === '/users/hquestion')
        return Promise.resolve({ data: [{ id: 1 }], headers: { etag: 'W/"q1"' } });
      if (url === '/users/me') return Promise.resolve({ data: { _id: 'u1', login: 'admin' } });
      return Promise.reject(new Error('unexpected ' + url));
    });
    const ctx = createContext();

    await userStore.actions.fetchUserHistoryAndHQ(ctx);

    const urls = apiClient.get.mock.calls.map(([url]) => url).sort();
    expect(urls).toEqual(['/users/history', '/users/hquestion', '/users/me']);
    expect(ctx.state.history).toEqual([{ clientId: 'a' }]);
    expect(ctx.state.hquestion).toEqual([{ id: 1 }]);
    expect(ctx.state.user).toEqual({ _id: 'u1', login: 'admin' });
    // Pełne odpowiedzi nie lądują już w localStorage — tylko znacznik.
    expect(localStorage.getItem('cached-hquestion')).toBeNull();
    expect(JSON.parse(localStorage.getItem('cached-hquestion-user'))).toEqual({
      userId: 'u1',
      count: 1,
    });
    expect(userCache.replaceHQuestionCache).toHaveBeenCalledWith('u1', [{ id: 1 }]);
    expect(userCache.replaceHistoryCache).toHaveBeenCalledWith('u1', [
      { clientId: 'a' },
    ]);
    expect(getCachedEtag('u1', 'history')).toBe('W/"h1"');
    expect(getCachedEtag('u1', 'hquestion')).toBe('W/"q1"');
    expect(ctx.state.historyCachedLocally).toBe(true);
    expect(ctx.state.hquestionCachedLocally).toBe(true);
  });

  it('przy 304 nie nadpisuje stanu, cache ani IDB', async () => {
    setCachedEtag('u1', 'history', 'W/"h1"');
    setCachedEtag('u1', 'hquestion', 'W/"q1"');
    apiClient.get.mockImplementation((url) => {
      if (url === '/users/history' || url === '/users/hquestion') {
        return Promise.resolve({ status: 304, data: '', headers: {} });
      }
      if (url === '/users/me') return Promise.resolve({ data: { _id: 'u1', login: 'admin' } });
      return Promise.reject(new Error('unexpected ' + url));
    });
    const ctx = createContext();
    ctx.state.user = { _id: 'u1', login: 'admin' };
    ctx.state.history = [{ clientId: 'keep' }];
    ctx.state.hquestion = [{ id: 1, correct: true }];
    ctx.state.historyCachedLocally = true;
    ctx.state.hquestionCachedLocally = true;

    await userStore.actions.fetchUserHistoryAndHQ(ctx);

    expect(ctx.state.history).toEqual([{ clientId: 'keep' }]);
    expect(ctx.state.hquestion).toEqual([{ id: 1, correct: true }]);
    expect(userCache.replaceHistoryCache).not.toHaveBeenCalled();
    expect(userCache.replaceHQuestionCache).not.toHaveBeenCalled();

    const historyCall = apiClient.get.mock.calls.find(([url]) => url === '/users/history');
    expect(historyCall[1].headers['If-None-Match']).toBe('W/"h1"');
    expect(historyCall[1].validateStatus(304)).toBe(true);
  });

  it('persistHQuestionLocally zapisuje pełne odpowiedzi i znacznik', async () => {
    const ctx = createContext();
    ctx.state.user = { _id: 'u1' };
    ctx.state.hquestion = [{ id: 5, correct: false, category: 'X' }];

    const ok = await userStore.actions.persistHQuestionLocally(ctx);

    expect(ok).toBe(true);
    expect(userCache.replaceHQuestionCache).toHaveBeenCalledWith('u1', [
      { id: 5, correct: false, category: 'X' },
    ]);
    expect(JSON.parse(localStorage.getItem('cached-hquestion-user'))).toEqual({
      userId: 'u1',
      count: 1,
    });
  });

  it('persistHistoryLocally zapisuje pełną historię i podsumowania', async () => {
    const ctx = createContext();
    ctx.state.user = { _id: 'u1' };
    ctx.state.history = [
      { clientId: 'c1', type: 'quiz', list: [{ id_questions: 1 }], questionTimes: [2] },
    ];

    const ok = await userStore.actions.persistHistoryLocally(ctx);

    expect(ok).toBe(true);
    expect(userCache.replaceHistoryCache).toHaveBeenCalledWith('u1', [
      { clientId: 'c1', type: 'quiz', list: [{ id_questions: 1 }], questionTimes: [2] },
    ]);
    // localStorage dostaje tylko podsumowanie.
    expect(JSON.parse(localStorage.getItem('cached-history'))).toEqual([
      { clientId: 'c1', type: 'quiz' },
    ]);
  });

  it('persist actions nie zapisują bez zalogowanego użytkownika', async () => {
    const ctx = createContext();
    ctx.state.hquestion = [{ id: 1 }];
    ctx.state.history = [{ clientId: 'c1' }];

    expect(await userStore.actions.persistHQuestionLocally(ctx)).toBe(false);
    expect(await userStore.actions.persistHistoryLocally(ctx)).toBe(false);
    expect(userCache.replaceHQuestionCache).not.toHaveBeenCalled();
    expect(userCache.replaceHistoryCache).not.toHaveBeenCalled();
  });

  it('withProfile:false pomija /users/me (profil pochodzi z logowania)', async () => {
    apiClient.get.mockImplementation((url) => {
      if (url === '/users/history') return Promise.resolve({ data: [] });
      if (url === '/users/hquestion') return Promise.resolve({ data: [] });
      return Promise.reject(new Error('unexpected ' + url));
    });
    const ctx = createContext();

    await userStore.actions.fetchUserHistoryAndHQ(ctx, { withProfile: false });

    const urls = apiClient.get.mock.calls.map(([url]) => url).sort();
    expect(urls).toEqual(['/users/history', '/users/hquestion']);
    expect(ctx.state.user).toEqual({});
  });

  it('błąd sieci zostawia ostatnią lokalną kopię', async () => {
    localStorage.setItem('cached-history', JSON.stringify([{ clientId: 'cached' }]));
    localStorage.setItem('cached-hquestion', JSON.stringify([{ id: 7 }]));
    apiClient.get.mockRejectedValue(new Error('offline'));
    const ctx = createContext();

    await userStore.actions.fetchUserHistoryAndHQ(ctx);

    expect(ctx.state.history).toEqual([{ clientId: 'cached' }]);
    expect(ctx.state.hquestion).toEqual([{ id: 7 }]);
  });

  it('fetchUserProfile zapisuje profil w store i w storage', async () => {
    apiClient.get.mockResolvedValue({ data: { login: 'admin', option: 'dark' } });
    const ctx = createContext();

    await userStore.actions.fetchUserProfile(ctx);

    expect(apiClient.get).toHaveBeenCalledWith('/users/me');
    expect(ctx.state.user).toEqual({ login: 'admin', option: 'dark' });
    expect(JSON.parse(localStorage.getItem('user'))).toEqual({
      login: 'admin',
      option: 'dark',
    });
  });

  it('login pobiera historię i statystyki równolegle bez drugiego /users/me', async () => {
    apiClient.post.mockResolvedValue({
      data: { token: 't', user: { login: 'admin' } },
    });
    const ctx = createContext();

    await userStore.actions.login(ctx, { login: 'admin', password: 'admin' });

    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      login: 'admin',
      password: 'admin',
    });
    expect(ctx.dispatch).toHaveBeenCalledWith('fetchUserHistoryAndHQ', {
      withProfile: false,
    });
    expect(ctx.dispatch).toHaveBeenCalledWith('questions/fetchStats', null, {
      root: true,
    });
    // Obie akcje startują w tym samym ticku (Promise.all), nie sekwencyjnie.
    expect(ctx.dispatch.mock.invocationCallOrder[0]).toBeLessThan(
      ctx.dispatch.mock.invocationCallOrder[1]
    );
  });
});
