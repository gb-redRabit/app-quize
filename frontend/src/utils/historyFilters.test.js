// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { filterHistory, listHistoryCategories } from './historyFilters';

const history = [
  {
    data: '2026-11-20T10:00:00.000Z',
    type: 'quiz',
    category: 'TP: Kodeks cywilny',
    correct: 1,
    wrong: 0,
  },
  {
    data: '2026-11-22T10:00:00.000Z',
    type: 'Egzamin - poprawa błędów',
    category: 'Egzamin 2007',
    correct: 2,
    wrong: 1,
  },
  {
    data: '2026-11-21T10:00:00.000Z',
    type: 'quiz',
    categories: ['TP: Kodeks pracy', 'TP: Kodeks cywilny'],
    correct: 3,
    wrong: 0,
  },
  {
    data: '2026-11-19T10:00:00.000Z',
    type: 'Egzamin 2007',
    category: 'Egzamin 2007',
    correct: 0,
    wrong: 5,
  },
];

describe('filterHistory', () => {
  it('domyślnie zwraca wszystko od najnowszych', () => {
    const result = filterHistory(history);
    expect(result.map((entry) => entry.data)).toEqual([
      '2026-11-22T10:00:00.000Z',
      '2026-11-21T10:00:00.000Z',
      '2026-11-20T10:00:00.000Z',
      '2026-11-19T10:00:00.000Z',
    ]);
  });

  it('sortuje od najstarszych', () => {
    const result = filterHistory(history, { sort: 'oldest' });
    expect(result[0].data).toBe('2026-11-19T10:00:00.000Z');
    expect(result[3].data).toBe('2026-11-22T10:00:00.000Z');
  });

  it('filtruje quizy uwzględniając poprawę błędów', () => {
    const result = filterHistory(history, { type: 'quiz' });
    expect(result).toHaveLength(2);
    expect(result.every((entry) => entry.type.toLowerCase().startsWith('quiz'))).toBe(true);
  });

  it('filtruje egzaminy uwzględniając poprawę błędów', () => {
    const result = filterHistory(history, { type: 'exam' });
    expect(result).toHaveLength(2);
    expect(result.every((entry) => entry.type.toLowerCase().startsWith('egzamin'))).toBe(true);
  });

  it('filtruje po kategorii, także gdy wpis ma wiele kategorii', () => {
    const result = filterHistory(history, { category: 'TP: Kodeks cywilny' });
    expect(result).toHaveLength(2);
    expect(result.map((entry) => entry.data)).toEqual([
      '2026-11-21T10:00:00.000Z',
      '2026-11-20T10:00:00.000Z',
    ]);
  });

  it('łączy filtr typu i kategorii', () => {
    const result = filterHistory(history, { type: 'exam', category: 'Egzamin 2007' });
    expect(result).toHaveLength(2);
  });

  it('nie zmienia oryginalnej tablicy', () => {
    const copy = [...history];
    filterHistory(history, { sort: 'oldest' });
    expect(history).toEqual(copy);
  });

  it('radzi sobie z pustymi danymi i zepsutymi datami', () => {
    expect(filterHistory(null)).toEqual([]);
    const broken = [{ type: 'quiz', data: 'invalid' }, { type: 'quiz' }];
    expect(filterHistory(broken)).toHaveLength(2);
  });
});

describe('listHistoryCategories', () => {
  it('zwraca unikalne kategorie z wpisów jedno- i wielokategoriowych', () => {
    expect(listHistoryCategories(history)).toEqual([
      'Egzamin 2007',
      'TP: Kodeks cywilny',
      'TP: Kodeks pracy',
    ]);
  });

  it('pomija puste i niepoprawne wpisy', () => {
    expect(listHistoryCategories([null, {}, { category: '' }, { categories: ['A', null] }])).toEqual([
      'A',
    ]);
  });
});
