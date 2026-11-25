// @vitest-environment jsdom
import { it, expect } from 'vitest';
import { useSidebar } from './useSidebar';

it('przełącza sidebar i zapamiętuje stan w localStorage', () => {
  const { collapsed, toggle } = useSidebar();
  const initial = collapsed.value;

  toggle();
  expect(collapsed.value).toBe(!initial);
  expect(localStorage.getItem('sidebar-collapsed')).toBe(!initial ? '1' : '0');

  toggle();
  expect(collapsed.value).toBe(initial);
  expect(localStorage.getItem('sidebar-collapsed')).toBe(initial ? '1' : '0');
});
