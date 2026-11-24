import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import QuestionCard from './QuestionCard.vue';

const question = {
  ID: 7,
  question: 'Treść pytania testowego?',
  answer_a: { answer: 'A', isCorret: false },
  answer_b: { answer: 'B', isCorret: true },
  answer_c: { answer: 'C', isCorret: false },
  category: 'TP: Kodeks cywilny',
  description: 'Opis',
  flagged: true,
  bad: false,
  unknown: false,
  note: '',
};

function makeStore(isAdmin = true) {
  return createStore({
    getters: {
      'user/getUser': () => ({ rola: isAdmin ? 'admin' : 'user' }),
    },
  });
}

function mountCard(props = {}, isAdmin = true) {
  return mount(QuestionCard, {
    props: { question, lastAttemptMap: {}, ...props },
    global: {
      plugins: [makeStore(isAdmin)],
      stubs: {
        QuestionActions: { template: '<div class="actions-stub" />' },
        AnswerItem: { props: ['letter', 'answer'], template: '<div class="answer-stub" />' },
      },
    },
  });
}

describe('QuestionCard', () => {
  it('w trybie pełnym pokazuje odpowiedzi i opis', () => {
    const wrapper = mountCard();

    expect(wrapper.text()).toContain('Treść pytania testowego?');
    expect(wrapper.findAll('.answer-stub')).toHaveLength(3);
    expect(wrapper.text()).toContain('Opis');
    expect(wrapper.find('.actions-stub').exists()).toBe(true);
  });

  it('w trybie kompaktowym pokazuje tylko ID, treść i kategorię', () => {
    const wrapper = mountCard({ compact: true });

    expect(wrapper.text()).toContain('7');
    expect(wrapper.text()).toContain('Treść pytania testowego?');
    expect(wrapper.text()).toContain('TP: Kodeks cywilny');
    expect(wrapper.findAll('.answer-stub')).toHaveLength(0);
    expect(wrapper.text()).not.toContain('Opis');
    expect(wrapper.find('.actions-stub').exists()).toBe(false);
  });

  it('kompaktowy wiersz jest przyciskiem i emituje `select` po kliknięciu', async () => {
    const wrapper = mountCard({ compact: true });

    const root = wrapper.find('[role="button"]');
    expect(root.exists()).toBe(true);
    expect(root.attributes('tabindex')).toBe('0');

    await root.trigger('click');
    expect(wrapper.emitted('select')).toHaveLength(1);
    expect(wrapper.emitted('select')[0][0].ID).toBe(7);
  });

  it('kompaktowy wiersz reaguje na Enter i zaznaczenie ma aria-current', async () => {
    const wrapper = mountCard({ compact: true, selected: true });

    const root = wrapper.find('[role="button"]');
    expect(root.attributes('aria-current')).toBe('true');

    await root.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('select')).toHaveLength(1);
  });

  it('zwykła karta nie jest przyciskiem', () => {
    const wrapper = mountCard();
    expect(wrapper.find('[role="button"]').exists()).toBe(false);
  });

  it('pokazuje kropki flag w trybie kompaktowym', () => {
    const wrapper = mountCard({ compact: true });
    const title = wrapper.find('[title="Sprawdzone"]');
    expect(title.exists()).toBe(true);
  });
});
