import { describe, expect, it } from 'vitest';
import { getRandomUniqueQuestions } from './randomQuestions';
import { shuffleArray } from './shuffleArray';

const questions = Array.from({ length: 10 }, (_, index) => ({
  ID: index + 1,
  question: `Pytanie ${index + 1}`,
}));

describe('getRandomUniqueQuestions', () => {
  it('zwraca żądaną liczbę unikalnych pytań', () => {
    const result = getRandomUniqueQuestions(questions, 5);
    expect(result).toHaveLength(5);
    expect(new Set(result.map((q) => q.ID)).size).toBe(5);
  });

  it('zwraca wszystkie pytania, gdy count przekracza pulę', () => {
    const result = getRandomUniqueQuestions(questions, 999);
    expect(result).toHaveLength(questions.length);
    expect(result.map((q) => q.ID).sort((a, b) => a - b)).toEqual(
      questions.map((q) => q.ID)
    );
  });

  it('nie zmienia oryginalnej tablicy i pomija pytania bez treści', () => {
    const withEmpty = [...questions, { ID: 99, question: '' }];
    const before = withEmpty.map((q) => q.ID);
    const result = getRandomUniqueQuestions(withEmpty, 10);

    expect(result).toHaveLength(10);
    expect(withEmpty.map((q) => q.ID)).toEqual(before);
  });
});

describe('shuffleArray', () => {
  it('zwraca permutację bez zmiany oryginału', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(original);

    expect(shuffled).toHaveLength(original.length);
    expect([...shuffled].sort()).toEqual([...original].sort());
    expect(original).toEqual([1, 2, 3, 4, 5]);
  });
});
