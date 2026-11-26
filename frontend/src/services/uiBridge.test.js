import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getUiAlert, getUiLoader, registerUiBridge } from './uiBridge';

describe('uiBridge', () => {
  beforeEach(() => {
    registerUiBridge();
  });

  it('udostępnia zarejestrowany loader i alert', () => {
    const loader = { show: vi.fn(), hide: vi.fn() };
    const alert = vi.fn();
    registerUiBridge({ loader, alert });

    expect(getUiLoader()).toBe(loader);
    expect(getUiAlert()).toBe(alert);
  });

  it('bez rejestracji zwraca null (API działa dalej)', () => {
    expect(getUiLoader()).toBeNull();
    expect(getUiAlert()).toBeNull();
  });
});
