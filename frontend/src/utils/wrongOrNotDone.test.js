import { describe, expect, it } from 'vitest';
import { filterWrongOrNotDone } from './wrongOrNotDone';

const answers = [
  { id: 1, correct: true, category: 'A' },
  { id: 2, correct: false, category: 'A' },
  { id: 3, correct: true, category: 'B' },
];

describe('filterWrongOrNotDone', () => {
  it('zostawia pytania bez poprawnej odpowiedzi w kategorii', () => {
    expect(filterWrongOrNotDone([1, 2, 4], answers, 'A')).toEqual([2, 4]);
  });

  it('dla kategorii "all" uwzględnia poprawne odpowiedzi ze wszystkich kategorii', () => {
    expect(filterWrongOrNotDone([1, 2, 3, 4], answers, 'all')).toEqual([2, 4]);
  });

  it('porównuje ID niezależnie od typu (number/string)', () => {
    expect(filterWrongOrNotDone(['1', '2'], answers, 'A')).toEqual(['2']);
  });

  it('brak odpowiedzi oznacza całą pulę do powtórki', () => {
    expect(filterWrongOrNotDone([1, 2, 3], [], 'A')).toEqual([1, 2, 3]);
    expect(filterWrongOrNotDone([1, 2, 3], null, 'A')).toEqual([1, 2, 3]);
  });

  it('zachowuje kolejność i duplikaty z wejściowej puli', () => {
    expect(filterWrongOrNotDone([4, 2, 4], answers, 'all')).toEqual([4, 2, 4]);
  });
});
