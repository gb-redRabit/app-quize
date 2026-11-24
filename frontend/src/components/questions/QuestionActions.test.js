// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import QuestionActions from './QuestionActions.vue';

const putMock = vi.fn(() => Promise.resolve({ data: {} }));
const deleteMock = vi.fn(() => Promise.resolve({ data: { success: true } }));

vi.mock('@/api', () => ({
  default: {
    put: (...args) => putMock(...args),
    delete: (...args) => deleteMock(...args),
  },
}));

const question = {
  ID: 99,
  question: 'Pytanie do akcji?',
  answer_a: { answer: 'A', isCorret: true },
  answer_b: { answer: 'B', isCorret: false },
  answer_c: { answer: 'C', isCorret: false },
  category: 'TP: Test',
  description: 'Opis',
  flagged: false,
  bad: false,
  unknown: false,
  note: '',
};

function makeStore() {
  return createStore({
    modules: {
      questions: {
        namespaced: true,
        getters: { getCategories: () => ['TP: Test'] },
        actions: { fetchStats: () => Promise.resolve() },
      },
    },
  });
}

function mountActions(props = {}, isAdmin = true) {
  return mount(QuestionActions, {
    props: { question, ...props },
    attachTo: document.body,
    global: {
      plugins: [makeStore()],
      stubs: { teleport: true },
      provide: {
        showAlert: vi.fn(),
      },
      mocks: {
        $store: isAdmin ? {} : {},
      },
    },
  });
}

function buttonByTitle(wrapper, title) {
  return wrapper.findAll('button').find((b) => b.attributes('title') === title);
}

describe('QuestionActions', () => {
  beforeEach(() => {
    putMock.mockClear();
    deleteMock.mockClear();
    document.body.innerHTML = '';
  });

  it('renderuje przyciski edycji i usuwania z nazwami dostępnymi', () => {
    const wrapper = mountActions();

    const edit = buttonByTitle(wrapper, 'Edytuj');
    const remove = buttonByTitle(wrapper, 'Usuń');

    expect(edit.exists()).toBe(true);
    expect(remove.exists()).toBe(true);
    expect(edit.attributes('aria-label')).toBe('Edytuj');
    expect(remove.attributes('aria-label')).toBe('Usuń');
  });

  it('przy `inlineEdit` emituje request-edit i nie otwiera modala', async () => {
    const wrapper = mountActions({ inlineEdit: true });

    await buttonByTitle(wrapper, 'Edytuj').trigger('click');

    expect(wrapper.emitted('request-edit')).toHaveLength(1);
    expect(wrapper.emitted('request-edit')[0][0].ID).toBe(99);
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it('bez `inlineEdit` otwiera modal edycji z danymi pytania', async () => {
    const wrapper = mountActions();

    await buttonByTitle(wrapper, 'Edytuj').trigger('click');
    await wrapper.vm.$nextTick();

    const dialog = wrapper.find('[role="dialog"]');
    expect(dialog.exists()).toBe(true);
    expect(dialog.text()).toContain('Edycja pytania');

    const textarea = dialog.find('textarea');
    expect(textarea.element.value).toBe('Pytanie do akcji?');
  });

  it('zapis w modalu wysyła PUT i emituje `edit`', async () => {
    const wrapper = mountActions();

    await buttonByTitle(wrapper, 'Edytuj').trigger('click');
    await wrapper.vm.$nextTick();

    const dialog = wrapper.find('[role="dialog"]');
    await dialog.find('textarea').setValue('Nowa treść?');
    await dialog.find('form').trigger('submit');
    await wrapper.vm.$nextTick();

    expect(putMock).toHaveBeenCalledTimes(1);
    const [url, payload] = putMock.mock.calls[0];
    expect(url).toBe('/questions/99');
    expect(payload.question).toBe('Nowa treść?');
    expect(wrapper.emitted('edit')).toHaveLength(1);
  });

  it('usuwanie pyta potwierdza i wysyła DELETE oraz emituje `deleted`', async () => {
    const wrapper = mountActions();

    await buttonByTitle(wrapper, 'Usuń').trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Czy na pewno chcesz usunąć to pytanie?');

    const confirm = wrapper.findAll('button').find((b) => b.text().includes('Tak, usuń'));
    await confirm.trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    expect(deleteMock).toHaveBeenCalledWith('/questions/99');
    expect(wrapper.emitted('deleted')).toHaveLength(1);
    expect(wrapper.emitted('deleted')[0][0].ID).toBe(99);
  });
});
