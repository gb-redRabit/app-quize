import { describe, expect, it } from 'vitest';
import { formatBytes } from './storageManager';

describe('formatBytes', () => {
  it.each([
    [0, '0 B'],
    [512, '512 B'],
    [1024, '1 KB'],
    [1536, '1.5 KB'],
    [1024 * 1024, '1 MB'],
    [5 * 1024 * 1024, '5 MB'],
    [20.5 * 1024 * 1024, '20.5 MB'],
    [1024 * 1024 * 1024, '1 GB'],
  ])('%i → %s', (bytes, expected) => {
    expect(formatBytes(bytes)).toBe(expected);
  });

  it('dla błędnych wartości zwraca myślnik', () => {
    expect(formatBytes(undefined)).toBe('—');
    expect(formatBytes(-5)).toBe('—');
    expect(formatBytes('x')).toBe('—');
  });
});
