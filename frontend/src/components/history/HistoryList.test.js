import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import HistoryList from './HistoryList.vue';

function makeEntries(count) {
  return Array.from({ length: count }, (_, index) => ({
    type: 'quiz',
    category: `Kategoria ${index + 1}`,
    correct: index + 1,
    wrong: 1,
    data: '2026-11-20T10:00:00.000Z',
    list: [],
  }));
}

function mountList(count) {
  return mount(HistoryList, {
    props: { filteredHistory: makeEntries(count) },
    global: {
      stubs: {
        HistoryCard: { name: 'HistoryCard', template: '<div class="card-stub" />' },
      },
    },
  });
}

describe('HistoryList', () => {
  it('pokazuje pierwsze 12 wpisów i informację o reszcie', () => {
    const wrapper = mountList(30);

    expect(wrapper.findAll('.card-stub')).toHaveLength(12);
    expect(wrapper.text()).toContain('Pokazano 12 z 30');
    expect(wrapper.text()).toContain('Pokaż więcej (18)');
  });

  it('„Pokaż więcej” dokłada kolejne wpisy', async () => {
    const wrapper = mountList(30);

    const button = wrapper.findAll('button').find((b) => b.text().includes('Pokaż więcej'));
    await button.trigger('click');

    expect(wrapper.findAll('.card-stub')).toHaveLength(24);
    expect(wrapper.text()).toContain('Pokazano 24 z 30');

    // BaseButton blokuje podwójne kliknięcie przez 300 ms (efekt ripple).
    await new Promise((resolve) => setTimeout(resolve, 350));
    await wrapper.findAll('button').find((b) => b.text().includes('Pokaż więcej')).trigger('click');

    expect(wrapper.findAll('.card-stub')).toHaveLength(30);
    expect(wrapper.text()).not.toContain('Pokaż więcej');
  });

  it('krótka historia nie pokazuje paginacji', () => {
    const wrapper = mountList(5);

    expect(wrapper.findAll('.card-stub')).toHaveLength(5);
    expect(wrapper.text()).not.toContain('Pokazano');
  });

  it('zmiana filtra wraca do pierwszej strony', async () => {
    const wrapper = mountList(30);
    await wrapper.findAll('button').find((b) => b.text().includes('Pokaż więcej')).trigger('click');
    expect(wrapper.findAll('.card-stub')).toHaveLength(24);

    await wrapper.setProps({ filteredHistory: makeEntries(20) });

    expect(wrapper.findAll('.card-stub')).toHaveLength(12);
    expect(wrapper.text()).toContain('Pokazano 12 z 20');
  });
});
