import { describe, expect, it, beforeEach } from 'vitest';
import { getPendingQuestionCreates } from './pendingQuestions';

beforeEach(() => {
  localStorage.clear();
});

function addQueue(entries) {
  localStorage.setItem('offline-queue-v1', JSON.stringify(entries));
}

describe('getPendingQuestionCreates', () => {
  it('zwraca tylko operacje tworzenia pytania', () => {
    addQueue([
      { type: 'hquestion', payload: { id: 1, correct: true } },
      { type: 'question-create', payload: { question: 'Nowe?', category: 'X' }, queuedAt: 1000 },
      { type: 'question-update', payload: { ID: 5 } },
      { type: 'question-create', payload: { question: 'Drugie?', category: 'Y' }, queuedAt: 2000 },
    ]);

    const pending = getPendingQuestionCreates();

    expect(pending).toHaveLength(2);
    expect(pending[0].question).toBe('Nowe?');
    expect(pending[1].question).toBe('Drugie?');
    expect(pending.every((item) => item.__pending)).toBe(true);
    expect(pending.every((item) => item.ID < 0)).toBe(true);
  });

  it('nie powtarza ID z payloadu i nadaje unikalne tymczasowe ID', () => {
    addQueue([
      { type: 'question-create', payload: { ID: 123, question: 'A' }, queuedAt: 1000 },
      { type: 'question-create', payload: { question: 'B' }, queuedAt: 1000 },
    ]);

    const [first, second] = getPendingQuestionCreates();

    expect(first.ID).not.toBe(123);
    expect(first.ID).not.toBe(second.ID);
    expect(first._id).toBeUndefined();
  });

  it('zwraca pustą listę bez kolejki lub z uszkodzonym JSON', () => {
    expect(getPendingQuestionCreates()).toEqual([]);

    localStorage.setItem('offline-queue-v1', 'to-nie-json');
    expect(getPendingQuestionCreates()).toEqual([]);
  });
});
