import { describe, it, expect } from 'vitest';
import {
  buildProgressSignature,
  computeRemainingSeconds,
  shouldSaveProgress,
} from './quizProgress';

function queryFromUrl(url) {
  const search = new URL(url, 'https://example.com').searchParams;
  const query = {};
  for (const [key, value] of search.entries()) query[key] = value;
  return query;
}

describe('buildProgressSignature', () => {
  it('używa tokenu sesji, gdy jest dostępny', () => {
    expect(buildProgressSignature('QuizView', { r: 'abc123', categories: 'X' })).toBe(
      'QuizView|abc123'
    );
  });

  it('daje ten sam podpis dla + i %20 w adresie', () => {
    const plus = queryFromUrl('/quiz?categories=TP:+Kodeks+cywilny&ids=1,2,3&length=10');
    const encoded = queryFromUrl('/quiz?categories=TP:%20Kodeks%20cywilny&ids=1,2,3&length=10');

    const a = buildProgressSignature('QuizView', plus);
    const b = buildProgressSignature('QuizView', encoded);

    expect(a).toBe(b);
    expect(a).toContain('TP: Kodeks cywilny');
  });

  it('rozróżnia sesje po innym zestawie pytań', () => {
    const first = buildProgressSignature('ExamView', { categories: 'X', ids: '1,2,3' });
    const second = buildProgressSignature('ExamView', { categories: 'X', ids: '4,5,6' });
    expect(first).not.toBe(second);
  });

  it('nie wywraca się bez parametrów', () => {
    expect(buildProgressSignature('QuizView')).toBe('QuizView|||||');
  });
});

describe('computeRemainingSeconds', () => {
  const now = 1_700_000_000_000;

  it('liczy od absolutnego startu egzaminu, ignorując savedAt', () => {
    const remaining = computeRemainingSeconds({
      examStartedAt: now - 5 * 60 * 1000,
      examTimeLimit: 3600,
      timeLeft: 3600,
      savedAt: now - 1000,
      now,
    });
    expect(remaining).toBe(3300);
  });

  it('odejmuje czas od ostatniego zapisu, gdy brak czasu startu', () => {
    const remaining = computeRemainingSeconds({
      timeLeft: 3000,
      savedAt: now - 2 * 60 * 1000,
      now,
    });
    expect(remaining).toBe(2880);
  });

  it('zwraca wartość ujemną po przekroczeniu limitu (sygnał wygaśnięcia)', () => {
    const remaining = computeRemainingSeconds({
      examStartedAt: now - 70 * 60 * 1000,
      examTimeLimit: 3600,
      now,
    });
    expect(remaining).toBe(-600);
  });

  it('zwraca null dla zwykłego quizu bez czasu', () => {
    expect(computeRemainingSeconds({ timeLeft: null, now })).toBeNull();
    expect(computeRemainingSeconds({})).toBeNull();
  });
});

describe('shouldSaveProgress', () => {
  it('zapisuje quiz po udzieleniu odpowiedzi', () => {
    expect(shouldSaveProgress({ answeredCount: 1, currentIndex: 0, mode: 'quiz' })).toBe(true);
  });

  it('nie zapisuje pustego quizu', () => {
    expect(shouldSaveProgress({ answeredCount: 0, currentIndex: 0, mode: 'quiz' })).toBe(false);
  });

  it('zapisuje egzamin, w którym upłynął czas', () => {
    expect(
      shouldSaveProgress({ answeredCount: 0, currentIndex: 0, mode: 'exam', timeLeft: 3590, timeLimit: 3600 })
    ).toBe(true);
  });

  it('nie zapisuje egzaminu tuż po starcie (czas jeszcze pełny)', () => {
    expect(
      shouldSaveProgress({ answeredCount: 0, currentIndex: 0, mode: 'exam', timeLeft: 3600, timeLimit: 3600 })
    ).toBe(false);
  });
});
