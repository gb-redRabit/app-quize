import apiClient from '@/api';

export default {
  namespaced: true,
  state: {
    questions: [],
    categories: [],
    categoryCounts: {},
    lastFetch: null, // Dodajemy śledzenie czasu ostatniego pobrania
  },

  mutations: {
    SET_QUESTIONS(state, questions) {
      state.questions = questions;
    },
    SET_CATEGORIES(state, categories) {
      state.categories = categories;
    },
    SET_CATEGORY_COUNTS(state, counts) {
      state.categoryCounts = counts;
    },
    SET_LAST_FETCH(state, timestamp) {
      state.lastFetch = timestamp;
    },
  },

  actions: {
    async fetchQuestionsAndCategories({ commit, state }) {
      // Sprawdź czy dane są już aktualne (30 sekund)
      const now = Date.now();
      if (state.lastFetch && now - state.lastFetch < 30000 && state.questions.length > 0) {
        return;
      }

      try {
        const res = await apiClient.get('/questions');
        const questions = res.data;
        commit('SET_QUESTIONS', questions);

        const categories = [...new Set(questions.map((q) => q.category).filter(Boolean))];
        commit('SET_CATEGORIES', categories);

        const categoryCounts = {};
        categories.forEach((cat) => {
          categoryCounts[cat] = questions.filter((q) => q.category === cat).length;
        });
        categoryCounts['all'] = questions.length;
        commit('SET_CATEGORY_COUNTS', categoryCounts);
        commit('SET_LAST_FETCH', now);
      } catch (e) {
        console.error('Błąd ładowania pytań i kategorii:', e);
      }
    },
  },

  getters: {
    getQuestions: (state) => state.questions,
    getCategories: (state) => state.categories,
    getCategoryCounts: (state) => state.categoryCounts,

    // Dodajemy gettery dla zoptymalizowanego dostępu do danych
    getQuestionById: (state) => (id) => {
      return state.questions.find((q) => q.ID === id || q.id === id);
    },

    getQuestionsByCategory: (state) => (category) => {
      if (category === 'all') return state.questions;
      return state.questions.filter((q) => q.category === category);
    },
  },
};
