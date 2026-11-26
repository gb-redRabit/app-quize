import { describe, expect, it } from 'vitest';
import { MASTERED_MIN_ACCURACY, getCategoryMasteryStatus } from './categoryStatus';

describe('getCategoryMasteryStatus', () => {
  it('próg opanowania to 90% i nie może być niższy', () => {
    expect(MASTERED_MIN_ACCURACY).toBe(90);
  });

  it('kategoria bez odpowiedzi jest nowa', () => {
    expect(getCategoryMasteryStatus({ correct: 0, wrong: 0 }, 10)).toBe('new');
    expect(getCategoryMasteryStatus({ correct: 0, wrong: 0 }, 0)).toBe('new');
  });

  it('wymaga przerobienia całej puli i 90% poprawnych', () => {
    expect(getCategoryMasteryStatus({ correct: 9, wrong: 1 }, 10)).toBe('mastered');
    expect(getCategoryMasteryStatus({ correct: 8, wrong: 2 }, 10)).toBe('progress');
    expect(getCategoryMasteryStatus({ correct: 9, wrong: 0 }, 10)).toBe('progress');
  });

  it('89% poprawnych przy pełnej puli to jeszcze nie opanowana', () => {
    expect(getCategoryMasteryStatus({ correct: 89, wrong: 11 }, 100)).toBe('progress');
    expect(getCategoryMasteryStatus({ correct: 90, wrong: 10 }, 100)).toBe('mastered');
  });
});
