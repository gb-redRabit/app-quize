import { describe, expect, it } from 'vitest';
import { pluralizePl } from './pluralize';

const FORMS = ['zmiana czeka', 'zmiany czekają', 'zmian czeka'];

describe('pluralizePl', () => {
  it.each([
    [0, 'zmian czeka'],
    [1, 'zmiana czeka'],
    [2, 'zmiany czekają'],
    [4, 'zmiany czekają'],
    [5, 'zmian czeka'],
    [11, 'zmian czeka'],
    [12, 'zmian czeka'],
    [14, 'zmian czeka'],
    [21, 'zmian czeka'],
    [22, 'zmiany czekają'],
    [25, 'zmian czeka'],
    [102, 'zmiany czekają'],
    [112, 'zmian czeka'],
  ])('%i → %s', (count, expected) => {
    expect(pluralizePl(count, ...FORMS)).toBe(expected);
  });

  it('traktuje wartości nieliczbowe jak zero', () => {
    expect(pluralizePl(undefined, ...FORMS)).toBe('zmian czeka');
    expect(pluralizePl('abc', ...FORMS)).toBe('zmian czeka');
  });
});
