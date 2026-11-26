// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearSession,
  getCachedUserData,
  getStoredUser,
  getToken,
  hasSession,
  setCachedHistory,
  setCachedHQuestion,
  setSession,
  setUser,
} from './authStorage';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('authStorage', () => {
  it('zapisuje sesję w obu magazynach i czyta z localStorage po wyczyszczeniu sesji', () => {
    setSession('token-1', { login: 'admin' });
    expect(getToken()).toBe('token-1');
    expect(getStoredUser()).toEqual({ login: 'admin' });
    expect(hasSession()).toBe(true);

    sessionStorage.clear();
    expect(getToken()).toBe('token-1');
    expect(getStoredUser()).toEqual({ login: 'admin' });
    expect(hasSession()).toBe(true);
  });

  it('aktualizuje użytkownika i czyści całą sesję', () => {
    setSession('token-1', { login: 'admin' });
    setUser({ login: 'admin', settings: { autoNext: false } });
    expect(getStoredUser().settings.autoNext).toBe(false);

    clearSession();
    expect(getToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
    expect(hasSession()).toBe(false);
  });

  it('przechowuje kopię historii (bez list odpowiedzi) i odpowiedzi dla trybu offline', () => {
    setCachedHistory([
      { type: 'quiz', list: [{ id_questions: 1 }], questionTimes: [3] },
    ]);
    setCachedHQuestion([{ id: 1, correct: true }]);

    const cached = getCachedUserData();
    expect(cached.history).toEqual([{ type: 'quiz' }]);
    expect(cached.hquestion).toEqual([{ id: 1, correct: true }]);

    sessionStorage.clear();
    const afterReload = getCachedUserData();
    expect(afterReload.history).toEqual([{ type: 'quiz' }]);
    expect(afterReload.hquestion).toEqual([{ id: 1, correct: true }]);
  });
});
