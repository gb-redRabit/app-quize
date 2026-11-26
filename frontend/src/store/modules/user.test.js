// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

import apiClient from '@/api';
import userStore from './user';

function createContext(overrides = {}) {
  const state = {
    user: {},
    hquestion: [],
    history: [],
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
      if (url === '/users/history') return Promise.resolve({ data: [{ clientId: 'a' }] });
      if (url === '/users/hquestion') return Promise.resolve({ data: [{ id: 1 }] });
      if (url === '/users/me') return Promise.resolve({ data: { login: 'admin' } });
      return Promise.reject(new Error('unexpected ' + url));
    });
    const ctx = createContext();

    await userStore.actions.fetchUserHistoryAndHQ(ctx);

    const urls = apiClient.get.mock.calls.map(([url]) => url).sort();
    expect(urls).toEqual(['/users/history', '/users/hquestion', '/users/me']);
    expect(ctx.state.history).toEqual([{ clientId: 'a' }]);
    expect(ctx.state.hquestion).toEqual([{ id: 1 }]);
    expect(ctx.state.user).toEqual({ login: 'admin' });
    expect(JSON.parse(localStorage.getItem('cached-hquestion'))).toEqual([{ id: 1 }]);
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
