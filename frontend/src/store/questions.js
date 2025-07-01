import apiClient from '@/api'; // <-- ZMIANA

export default {
  namespaced: true,
  state: {
    questions: [],
    categories: [],
    categoryCounts: {},
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
  },
  actions: {
    async fetchQuestionsAndCategories({ commit }) {
      try {
        const res = await apiClient.get('/questions'); // <-- ZMIANA
        const questions = res.data;
        commit('SET_QUESTIONS', questions);

        const categories = [...new Set(questions.map((q) => q.category).filter(Boolean))];
        commit('SET_CATEGORIES', categories);

        const categoryCounts = {};
        for (const cat of categories) {
          categoryCounts[cat] = questions.filter((q) => q.category === cat).length;
        }
        categoryCounts['all'] = questions.length;
        commit('SET_CATEGORY_COUNTS', categoryCounts);
      } catch (e) {
        console.error('Błąd ładowania pytań i kategorii:', e);
      }
    },
  },
  getters: {
    getQuestions: (state) => state.questions,
    getCategories: (state) => state.categories,
    getCategoryCounts: (state) => state.categoryCounts,
  },
};
