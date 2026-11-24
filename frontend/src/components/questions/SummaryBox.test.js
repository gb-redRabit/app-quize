// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import SummaryBox from './SummaryBox.vue';

const questions = [
  {
    ID: 1,
    question: 'Pytanie poprawne?',
    answer_a: { answer: 'A1', isCorret: true },
    answer_b: { answer: 'B1', isCorret: false },
    answer_c: { answer: 'C1', isCorret: false },
  },
  {
    ID: 2,
    question: 'Pytanie błędne?',
    answer_a: { answer: 'A2', isCorret: false },
    answer_b: { answer: 'B2', isCorret: true },
    answer_c: { answer: 'C2', isCorret: false },
  },
];

const answersStatus = [
  { answered: true, selectedKey: 'answer_a' }, // poprawna
  { answered: true, selectedKey: 'answer_a' }, // błędna (poprawna to B)
];

function mountBox(props = {}) {
  return mount(SummaryBox, {
    props: {
      questions,
      answersStatus,
      score: 1,
      total: 2,
      category: 'TP: Test',
      userAnswerText: (q, key) => (key ? `${key}:${q.ID}` : 'brak'),
      correctAnswerText: (q) => `poprawna:${q.ID}`,
      ...props,
    },
  });
}

function reviewItems(wrapper) {
  return wrapper.findAll('div.border').filter((el) => el.text().includes('Pytanie'));
}

function blobToText(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

describe('SummaryBox', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('pokazuje wynik i procent', () => {
    const wrapper = mountBox();
    const text = wrapper.text();

    expect(text).toContain('1/2');
    expect(text).toContain('50%');
    expect(text).toContain('Podsumowanie testu');
  });

  it('filtr „Tylko błędne” pokazuje wyłącznie błędne pytania', async () => {
    const wrapper = mountBox();

    expect(reviewItems(wrapper)).toHaveLength(2);

    const filter = wrapper.findAll('button').find((b) => b.text().includes('Tylko błędne'));
    expect(filter.attributes('aria-pressed')).toBe('false');
    expect(filter.text()).toContain('(1)');

    await filter.trigger('click');

    expect(filter.attributes('aria-pressed')).toBe('true');
    expect(reviewItems(wrapper)).toHaveLength(1);
    expect(wrapper.text()).toContain('Pytanie błędne?');
    expect(wrapper.text()).not.toContain('Pytanie poprawne?');
  });

  it('eksport CSV zawiera nagłówki i oba pytania', async () => {
    const blobs = [];
    const OriginalBlob = globalThis.Blob;
    globalThis.Blob = class extends OriginalBlob {
      constructor(parts, options) {
        super(parts, options);
        blobs.push(this);
      }
    };
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    const createSpy = vi.fn(() => 'blob:test');
    const revokeSpy = vi.fn();
    URL.createObjectURL = createSpy;
    URL.revokeObjectURL = revokeSpy;
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const wrapper = mountBox();
    const exportBtn = wrapper.findAll('button').find((b) => b.text().includes('Eksport CSV'));
    await exportBtn.trigger('click');

    globalThis.Blob = OriginalBlob;
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(revokeSpy).toHaveBeenCalledWith('blob:test');
    expect(blobs).toHaveLength(1);
    const csv = await blobToText(blobs[0]);

    expect(csv).toContain('"Nr";"Pytanie";"Odpowiedź użytkownika";"Poprawna odpowiedź";"Wynik"');
    expect(csv).toContain('"Pytanie poprawne?"');
    expect(csv).toContain('"Pytanie błędne?"');
    expect(csv).toContain('"Poprawna"');
    expect(csv).toContain('"Błędna"');
  });

  it('emituje retry-wrong po kliknięciu „Popraw błędne odpowiedzi”', async () => {
    const wrapper = mountBox();

    const retry = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Popraw błędne odpowiedzi'));
    expect(retry.exists()).toBe(true);

    await retry.trigger('click');
    expect(wrapper.emitted('retry-wrong')).toHaveLength(1);
  });

  it('główny przycisk emituje restart, a przy zaliczonych pytaniach go-home', async () => {
    const wrapper = mountBox();
    const main = wrapper.findAll('button').find((b) => b.text().includes('Rozpocznij ponownie'));
    await main.trigger('click');
    expect(wrapper.emitted('restart')).toHaveLength(1);

    const done = mountBox({ allQuestionsCompleted: true });
    const home = done
      .findAll('button')
      .find((b) => b.text().includes('Wszystkie pytania zaliczone'));
    await home.trigger('click');
    expect(done.emitted('go-home')).toHaveLength(1);
  });
});
