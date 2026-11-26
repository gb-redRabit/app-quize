import { describe, expect, it } from 'vitest';
import csp from '../../scripts/csp-check.js';

const { extractConnectSrc, assertCspAllows, resolveOrigin } = csp;

const CSP =
  "default-src 'self'; connect-src 'self' https://app-quize.onrender.com; worker-src 'self' blob;";

describe('csp-check', () => {
  it('wyciąga listę connect-src', () => {
    expect(extractConnectSrc(CSP)).toEqual([
      "'self'",
      'https://app-quize.onrender.com',
    ]);
  });

  it('przepuszcza dozwolony origin API', () => {
    expect(assertCspAllows(CSP, 'https://app-quize.onrender.com').ok).toBe(true);
  });

  it('blokuje nowy origin API bez wpisu w CSP', () => {
    const result = assertCspAllows(CSP, 'https://api.example.com');
    expect(result.ok).toBe(false);
    expect(result.allowed).toContain('https://app-quize.onrender.com');
  });

  it('obsługuje wildcard i względny URL', () => {
    expect(assertCspAllows("connect-src 'self' *", 'https://x.test').ok).toBe(true);
    expect(resolveOrigin('/api')).toBeNull();
    expect(resolveOrigin('https://api.example.com/api')).toBe('https://api.example.com');
  });
});
