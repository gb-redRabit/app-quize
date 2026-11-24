// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import HistoryOverview from './HistoryOverview.vue';

const history = [
  {
    data: '2026-11-20T10:00:00.000Z',
    type: 'quiz',
    category: 'TP: Kodeks cywilny',
    correct: 8,
    wrong: 2,
    time: null,
  },
  {
    data: '2026-11-21T12:30:00.000Z',
    type: 'egzamin',
    category: 'Egzamin 2007',
    correct: 1,
    wrong: 1,
    time: 42,
  },
];

const HistoryStatsStub = {
  name: 'HistoryStatsPanel',
  emits: ['filter-change'],
  template: '<div class="stats-stub" />',
};

function mountOverview(props = {}) {
  return mount(HistoryOverview, {
    props: {
      history,
      filteredHistory: history,
      activeFilter: 'all',
      quizCount: 1,
      examCount: 1,
      ...props,
    },
    global: {
      stubs: {
        HistoryStatsPanel: HistoryStatsStub,
        HistoryList: { template: '<div class="list-stub" />' },
        HistoryEmptyState: { template: '<div class="empty-stub" />' },
      },
    },
  });
}

function blobToText(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

describe('HistoryOverview', () => {
  let blobs;
  const OriginalBlob = globalThis.Blob;

  beforeEach(() => {
    blobs = [];
    globalThis.Blob = class extends OriginalBlob {
      constructor(parts, options) {
        super(parts, options);
        blobs.push(this);
      }
    };
    URL.createObjectURL = () => 'blob:test';
    URL.revokeObjectURL = () => {};
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.Blob = OriginalBlob;
    vi.restoreAllMocks();
  });

  it('pokazuje liczbę wpisów w przycisku eksportu i listę', () => {
    const wrapper = mountOverview();

    expect(wrapper.find('.list-stub').exists()).toBe(true);
    expect(wrapper.find('.stats-stub').exists()).toBe(true);
    expect(wrapper.text()).toContain('Eksport CSV (2)');
  });

  it('pokazuje pusty stan bez historii', () => {
    const wrapper = mountOverview({ history: [], filteredHistory: [] });

    expect(wrapper.find('.empty-stub').exists()).toBe(true);
    expect(wrapper.find('.list-stub').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Eksport CSV');
  });

  it('eksportuje filtrowaną historię do CSV', async () => {
    const filtered = [history[1]];
    const wrapper = mountOverview({ filteredHistory: filtered });

    const button = wrapper.findAll('button').find((b) => b.text().includes('Eksport CSV'));
    expect(button.text()).toContain('(1)');

    await button.trigger('click');

    expect(blobs).toHaveLength(1);
    const csv = await blobToText(blobs[0]);

    expect(csv).toContain('"Data";"Typ";"Kategoria";"Poprawne";"Błędne";"Procent";"Czas (s)"');
    expect(csv).toContain('"egzamin";"Egzamin 2007";"1";"1";"50%";"42"');
    expect(csv).not.toContain('TP: Kodeks cywilny');
  });

  it('procent liczy się z poprawnych i błędnych, a brak czasu daje pustą komórkę', async () => {
    const wrapper = mountOverview({ filteredHistory: [history[0]] });

    const button = wrapper.findAll('button').find((b) => b.text().includes('Eksport CSV'));
    await button.trigger('click');

    const csv = await blobToText(blobs[0]);
    expect(csv).toContain('"quiz";"TP: Kodeks cywilny";"8";"2";"80%";""');
  });

  it('przekazuje zdarzenia z panelu statystyk', async () => {
    const wrapper = mountOverview();
    const panel = wrapper.findComponent({ name: 'HistoryStatsPanel' });

    await panel.vm.$emit('filter-change', 'quiz');

    expect(wrapper.emitted('filter-change')).toHaveLength(1);
    expect(wrapper.emitted('filter-change')[0]).toEqual(['quiz']);
  });
});
