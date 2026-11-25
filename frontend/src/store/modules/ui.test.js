import { beforeEach, describe, expect, it, vi } from 'vitest';

function stubPrefersDark(matches) {
  vi.stubGlobal('matchMedia', () => ({
    matches,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

async function loadStore() {
  vi.resetModules();
  const module = await import('./ui.js');
  return module.default;
}

describe('ui store — motyw', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    vi.unstubAllGlobals();
  });

  it('jasny i ciemny motyw są rozwiązywane bezpośrednio', async () => {
    stubPrefersDark(true);
    const ui = await loadStore();

    expect(ui.getters.isDarkTheme({ theme: 'light' })).toBe(false);
    expect(ui.getters.isDarkTheme({ theme: 'dark' })).toBe(true);
  });

  it('motyw systemowy podąża za preferencją systemu', async () => {
    stubPrefersDark(true);
    let ui = await loadStore();
    expect(ui.getters.isDarkTheme({ theme: 'system' })).toBe(true);

    stubPrefersDark(false);
    ui = await loadStore();
    expect(ui.getters.isDarkTheme({ theme: 'system' })).toBe(false);
  });

  it('SET_THEME zapisuje wybór i ustawia rozwiązany motyw w DOM', async () => {
    stubPrefersDark(true);
    const ui = await loadStore();
    const state = { theme: 'light' };

    ui.mutations.SET_THEME(state, 'system');

    expect(state.theme).toBe('system');
    expect(localStorage.getItem('theme')).toBe('system');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    ui.mutations.SET_THEME(state, 'light');

    expect(localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
