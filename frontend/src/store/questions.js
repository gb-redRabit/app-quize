import apiClient from '@/api';
import { openDB } from 'idb';

const DB_NAME = 'quizAppDB';
const STORE_NAME = 'questions';

// Flaga do sterowania użyciem IndexedDB
let useIndexedDB = false; // ustaw na false, aby pobierać tylko z serwera

export function setIndexedDBUsage(flag) {
  useIndexedDB = flag;
}

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

async function saveQuestionsToIndexedDB(questions) {
  if (!useIndexedDB) return;
  const db = await getDb();
  await db.put(STORE_NAME, questions, 'all');
}

async function loadQuestionsFromIndexedDB() {
  if (!useIndexedDB) return [];
  const db = await getDb();
  return (await db.get(STORE_NAME, 'all')) || [];
}

async function clearQuestionsFromIndexedDB() {
  if (!useIndexedDB) return;
  const db = await getDb();
  await db.delete(STORE_NAME, 'all');
}

export default {
  namespaced: true,
  state: {
    questions: [],
    categories: [],
    categoryCounts: {},
    lastFetch: null,
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
    CLEAR_CACHE(state) {
      state.questions = [];
      state.categories = [];
      state.categoryCounts = {};
      state.lastFetch = null;
    },
  },

  actions: {
    async initQuestionsCache({ commit }) {
      const cachedQuestions = await loadQuestionsFromIndexedDB();
      if (useIndexedDB && cachedQuestions.length > 0) {
        commit('SET_QUESTIONS', cachedQuestions);
        const categories = [...new Set(cachedQuestions.map((q) => q.category).filter(Boolean))];
        commit('SET_CATEGORIES', categories);
        const categoryCounts = {};
        categories.forEach((cat) => {
          categoryCounts[cat] = cachedQuestions.filter((q) => q.category === cat).length;
        });
        categoryCounts['all'] = cachedQuestions.length;
        commit('SET_CATEGORY_COUNTS', categoryCounts);
      } else {
        // Pobierz z serwera jeśli IndexedDB wyłączone lub pusta
        await this.dispatch('questions/fetchQuestionsAndCategories');
      }
    },

    async fetchQuestionsAndCategories({ commit }) {
      try {
        const res = await apiClient.get('/questions');
        const questions = res.data;
        commit('SET_QUESTIONS', questions);
        await saveQuestionsToIndexedDB(questions);

        const categories = [...new Set(questions.map((q) => q.category).filter(Boolean))];
        commit('SET_CATEGORIES', categories);

        const categoryCounts = {};
        categories.forEach((cat) => {
          categoryCounts[cat] = questions.filter((q) => q.category === cat).length;
        });
        categoryCounts['all'] = questions.length;
        commit('SET_CATEGORY_COUNTS', categoryCounts);
        commit('SET_LAST_FETCH', Date.now());
      } catch (e) {
        console.error('Błąd ładowania pytań i kategorii:', e);
      }
    },

    async refreshQuestionsCache({ dispatch }) {
      await dispatch('fetchQuestionsAndCategories');
    },

    async clearQuestionsCache({ commit }) {
      commit('CLEAR_CACHE');
      await clearQuestionsFromIndexedDB();
    },
  },

  getters: {
    getQuestions: (state) => state.questions,
    getQuestionsIds: (state) => state.questions.map((q) => q.ID || q.id),
    getCategories: (state) => state.categories,
    getCategoryCounts: (state) => state.categoryCounts,
    getQuestionById: (state) => (id) => {
      return state.questions.find((q) => q.ID === id || q.id === id);
    },
    getQuestionsByCategory: (state) => (category) => {
      if (category === 'all') return state.questions;
      return state.questions.filter((q) => q.category === category);
    },
  },
};

// Użycie: import { setIndexedDBUsage } from '@/store/questions';
// setIndexedDBUsage(false); // wyłącza IndexedDB, zawsze pobiera z serwera
