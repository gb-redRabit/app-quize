import { describe, expect, it } from 'vitest';
import { toHistorySummary } from './historySummary';

describe('toHistorySummary', () => {
  it('usuwa listę odpowiedzi i czasy, zachowując resztę pól', () => {
    const entry = {
      clientId: 'c1',
      type: 'quiz',
      category: 'Prawo',
      correct: 8,
      wrong: 2,
      data: '2026-11-26T10:00:00.000Z',
      list: [{ id_questions: 1, answer: 'answer_a' }],
      questionTimes: [1, 2, 3],
    };

    expect(toHistorySummary(entry)).toEqual({
      clientId: 'c1',
      type: 'quiz',
      category: 'Prawo',
      correct: 8,
      wrong: 2,
      data: '2026-11-26T10:00:00.000Z',
    });
  });

  it('nie tworzy kopii listy/czasów (nie mutuje wejścia)', () => {
    const entry = { type: 'egzamin', list: [{ id_questions: 1 }], questionTimes: [1] };
    toHistorySummary(entry);

    expect(entry.list).toHaveLength(1);
    expect(entry.questionTimes).toHaveLength(1);
  });

  it('przepuszcza wartości puste i niepoprawne', () => {
    expect(toHistorySummary(null)).toBeNull();
    expect(toHistorySummary(undefined)).toBeUndefined();
    expect(toHistorySummary('x')).toBe('x');
  });
});
