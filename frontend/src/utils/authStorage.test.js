// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearSession,
  getCachedHQuestionMarker,
  getCachedUserData,
  getLegacyCachedHQuestion,
  getStoredUser,
  getToken,
  hasCachedHQuestion,
  hasSession,
  setCachedHistory,
  setCachedHQuestionMarker,
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

  it('przechowuje podsumowania historii i znacznik odpowiedzi w IndexedDB', () => {
    setSession('token-1', { _id: 'u1', login: 'admin' });
    setCachedHistory([
      { type: 'quiz', list: [{ id_questions: 1 }], questionTimes: [3] },
    ]);
    setCachedHQuestionMarker('u1', 1);

    const cached = getCachedUserData();
    expect(cached.history).toEqual([{ type: 'quiz' }]);
    expect(cached.hquestion).toBeNull();
    expect(getCachedHQuestionMarker()).toEqual({ userId: 'u1', count: 1 });
    expect(hasCachedHQuestion()).toBe(true);

    sessionStorage.clear();
    expect(getCachedUserData().history).toEqual([{ type: 'quiz' }]);
  });

  it('czyta starą kopię odpowiedzi i usuwa ją po migracji/wylogowaniu', () => {
    setSession('token-1', { _id: 'u1', login: 'admin' });
    localStorage.setItem('cached-hquestion', JSON.stringify([{ id: 1, correct: true }]));

    expect(getLegacyCachedHQuestion()).toEqual([{ id: 1, correct: true }]);
    expect(hasCachedHQuestion()).toBe(true);

    // Migracja do IndexedDB: znacznik zastępuje pełną kopię w localStorage.
    setCachedHQuestionMarker('u1', 1);
    expect(getLegacyCachedHQuestion()).toBeNull();
    expect(hasCachedHQuestion()).toBe(true);

    clearSession();
    expect(getCachedHQuestionMarker()).toBeNull();
    expect(hasCachedHQuestion()).toBe(false);
  });
});
