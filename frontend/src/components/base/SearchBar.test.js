import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SearchBar from './SearchBar.vue';

function mountBar(props = {}) {
  return mount(SearchBar, { props: { modelValue: '', ...props } });
}

describe('SearchBar', () => {
  it('pokazuje placeholder przekazany z widoku', () => {
    const wrapper = mountBar({ placeholder: 'Szukaj po ID…' });
    const input = wrapper.find('input');

    expect(input.attributes('placeholder')).toBe('Szukaj po ID…');
    expect(input.attributes('aria-label')).toBe('Szukaj po ID…');
  });

  it('ma domyślny placeholder i aria-label', () => {
    const wrapper = mountBar();
    const input = wrapper.find('input');

    expect(input.attributes('placeholder')).toContain('Szukaj');
    expect(input.attributes('aria-label')).toBe(input.attributes('placeholder'));
  });

  it('emituje wpisaną frazę', async () => {
    const wrapper = mountBar();
    await wrapper.find('input').setValue('Kodeks');

    expect(wrapper.emitted('update:search')[0]).toEqual(['Kodeks']);
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['Kodeks']);
  });

  it('Esc czyści wpisaną frazę', async () => {
    const wrapper = mountBar({ modelValue: 'Kodeks' });
    const input = wrapper.find('input');

    expect(input.element.value).toBe('Kodeks');

    await input.trigger('keydown', { key: 'Escape' });

    expect(input.element.value).toBe('');
    expect(wrapper.emitted('update:search').at(-1)).toEqual(['']);
  });

  it('przycisk czyszczenia pojawia się tylko z frazą i czyści pole', async () => {
    const wrapper = mountBar();
    expect(wrapper.find('button[aria-label="Wyczyść wyszukiwanie"]').exists()).toBe(false);

    await wrapper.find('input').setValue('abc');
    const clear = wrapper.find('button[aria-label="Wyczyść wyszukiwanie"]');
    expect(clear.exists()).toBe(true);

    await clear.trigger('click');

    expect(wrapper.find('input').element.value).toBe('');
    expect(wrapper.emitted('update:search').at(-1)).toEqual(['']);
    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual(['']);
  });

  it('synchronizuje wartość z propsów', async () => {
    const wrapper = mountBar({ modelValue: 'start' });
    expect(wrapper.find('input').element.value).toBe('start');

    await wrapper.setProps({ modelValue: 'nowe' });
    expect(wrapper.find('input').element.value).toBe('nowe');
  });
});
