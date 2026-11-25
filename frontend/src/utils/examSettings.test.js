import { describe, expect, it } from 'vitest';
import {
  DEFAULT_EXAM_LENGTH,
  MAX_EXAM_LENGTH,
  MIN_EXAM_LENGTH,
  getExamLength,
  normalizeExamLength,
} from './examSettings';

describe('examSettings', () => {
  it('domyślnie zwraca 150 pytań', () => {
    expect(DEFAULT_EXAM_LENGTH).toBe(150);
    expect(normalizeExamLength(undefined)).toBe(150);
    expect(normalizeExamLength('')).toBe(150);
    expect(normalizeExamLength('abc')).toBe(150);
    expect(normalizeExamLength(150.5)).toBe(150);
  });

  it('pilnuje zakresu ustawień', () => {
    expect(normalizeExamLength(0)).toBe(MIN_EXAM_LENGTH);
    expect(normalizeExamLength(9999)).toBe(MAX_EXAM_LENGTH);
    expect(normalizeExamLength('200')).toBe(200);
  });

  it('nie proponuje więcej pytań niż jest dostępnych', () => {
    expect(getExamLength(150, 40)).toBe(40);
    expect(getExamLength(150, 500)).toBe(150);
    expect(getExamLength(undefined, 500)).toBe(150);
    expect(getExamLength(150, 0)).toBe(0);
  });
});
