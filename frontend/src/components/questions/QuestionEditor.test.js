// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import QuestionEditor from './QuestionEditor.vue';

const putMock = vi.fn();

vi.mock('@/api', () => ({
  default: {
    put: (...args) => putMock(...args),
  },
}));

function makeStore() {
  return createStore({
    modules: {
      questions: {
        namespaced: true,
        getters: {
          getCategories: () => ['TP: Kodeks cywilny', 'Egzamin 2007'],
        },
      },
    },
  });
}

const baseQuestion = {
  ID: 42,
  question: 'Pytanie testowe?',
  answer_a: { answer: 'Odpowiedź A', isCorret: false },
  answer_b: { answer: 'Odpowiedź B', isCorret: true },
  answer_c: { answer: 'Odpowiedź C', isCorret: false },
  category: 'TP: Kodeks cywilny',
  description: 'Opis',
  flagged: false,
  bad: false,
  unknown: false,
  note: '',
};

function mountEditor(question = baseQuestion) {
  return mount(QuestionEditor, {
    props: { question },
    global: { plugins: [makeStore()] },
  });
}

describe('QuestionEditor', () => {
  beforeEach(() => {
    putMock.mockReset();
    putMock.mockResolvedValue({ data: { ...baseQuestion, description: 'Nowy opis' } });
  });

  it('wypełnia formularz danymi pytania', () => {
    const wrapper = mountEditor();

    expect(wrapper.find('textarea').element.value).toBe('Pytanie testowe?');
    expect(wrapper.text()).toContain('Edycja pytania');
    expect(wrapper.text()).toContain('ID 42');
    expect(wrapper.findAll('input[type="radio"]')).toHaveLength(3);
  });

  it('zaznacza poprawną odpowiedź z danych', () => {
    const wrapper = mountEditor();
    const radios = wrapper.findAll('input[type="radio"]');

    expect(radios[0].element.checked).toBe(false);
    expect(radios[1].element.checked).toBe(true);
    expect(radios[2].element.checked).toBe(false);
  });

  it('przełącza poprawną odpowiedź po kliknięciu radio', async () => {
    const wrapper = mountEditor();
    const radios = wrapper.findAll('input[type="radio"]');

    await radios[2].setValue(true);

    expect(radios[0].element.checked).toBe(false);
    expect(radios[1].element.checked).toBe(false);
    expect(radios[2].element.checked).toBe(true);
  });

  it('zapisuje zmiany przez API i emituje `saved`', async () => {
    const wrapper = mountEditor();

    await wrapper.find('textarea').setValue('Zmieniona treść?');
    await wrapper.find('form').trigger('submit');

    expect(putMock).toHaveBeenCalledTimes(1);

    const [url, payload] = putMock.mock.calls[0];
    expect(url).toBe('/questions/42');
    expect(payload.question).toBe('Zmieniona treść?');
    expect(payload.answer_b.isCorret).toBe(true);
    expect(payload._id).toBeUndefined();
    expect(payload.__v).toBeUndefined();

    expect(wrapper.emitted('saved')).toHaveLength(1);
    expect(wrapper.emitted('saved')[0][0].description).toBe('Nowy opis');
  });

  it('emituje `cancel` bez wysyłania żądania', async () => {
    const wrapper = mountEditor();

    const cancel = wrapper.findAll('button').find((b) => b.text() === 'Anuluj');
    await cancel.trigger('click');

    expect(wrapper.emitted('cancel')).toHaveLength(1);
    expect(putMock).not.toHaveBeenCalled();
  });

  it('zapisuje skrótem Ctrl+Enter', async () => {
    const wrapper = mountEditor();

    await wrapper.find('textarea').trigger('keydown', { key: 'Enter', ctrlKey: true });

    expect(putMock).toHaveBeenCalledTimes(1);
  });

  it('pomija puste odpowiedzi D', async () => {
    const wrapper = mountEditor({
      ...baseQuestion,
      answer_d: { answer: '', isCorret: false },
    });

    await wrapper.find('form').trigger('submit');

    const [, payload] = putMock.mock.calls[0];
    expect(payload.answer_d).toBeUndefined();
    expect(wrapper.findAll('input[type="radio"]')).toHaveLength(3);
  });

  it('dodaje nową kategorię do payloadu', async () => {
    const wrapper = mountEditor();

    const select = wrapper.find('select');
    await select.setValue('__new__');

    const newCategoryInput = wrapper.find('input[aria-label="Nazwa nowej kategorii"]');
    await newCategoryInput.setValue('Nowa kategoria');

    await wrapper.find('form').trigger('submit');

    const [, payload] = putMock.mock.calls[0];
    expect(payload.category).toBe('Nowa kategoria');
  });
});
