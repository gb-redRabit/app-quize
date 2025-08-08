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
    categories: (() => {
      const stats = JSON.parse(localStorage.getItem('stats') || sessionStorage.getItem('stats') || '{}');
      return stats.categories ? stats.categories.map(cat => cat.name) : [];
    })(),
    categoryCounts: (() => {
      const stats = JSON.parse(localStorage.getItem('stats') || sessionStorage.getItem('stats') || '{}');
      return stats.categories
        ? Object.fromEntries(stats.categories.map(cat => [cat.name, cat.count]))
        : {};
    })(),
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
    async fetchStats({ commit }) {
      try {
        const res = await apiClient.get('/stats');
        // WYCIĄGNIJ tylko potrzebne pola i posortuj kategorie alfabetycznie
        const stats = res.data
          ? {
              categories: (res.data.categories || []).slice().sort((a, b) => a.name.localeCompare(b.name)),
              totalQuestions: res.data.totalQuestions || 0,
              updatedAt: res.data.updatedAt || null,
            }
          : { categories: [], totalQuestions: 0, updatedAt: null };

        // Ustaw liczbę pytań i kategorie w stanie
        commit(
          'SET_CATEGORY_COUNTS',
          Object.fromEntries(stats.categories.map((cat) => [cat.name, cat.count]))
        );
        commit(
          'SET_CATEGORIES',
          stats.categories.map((cat) => cat.name)
        );
        // --- ZAPISZ DO localStorage I sessionStorage TYLKO POTRZEBNE POLA ---
        localStorage.setItem('stats', JSON.stringify(stats));
        sessionStorage.setItem('stats', JSON.stringify(stats));
      } catch (e) {
        console.error('Błąd pobierania statystyk:', e);
      }
    },

    async clearQuestionsCache({ commit, dispatch }) {
      commit('CLEAR_CACHE');
      await clearQuestionsFromIndexedDB();
      await dispatch('fetchStats'); // Aktualizuj statystyki po usunięciu
    },
    async fetchQuestionsByCategory({ commit }, categoryName) {
      try {
        const res = await apiClient.get(`/questions/category/${categoryName}`);
        const questions = Array.isArray(res.data) ? res.data : [];
        commit('SET_QUESTIONS', questions);
        // Możesz tu dodać SET_CATEGORIES i SET_CATEGORY_COUNTS jeśli chcesz
        return questions;
      } catch (e) {
        console.error('Błąd pobierania pytań z kategorii:', e);
        return [];
      }
    },
    async addQuestion({ dispatch }, questionData) {
      try {
        await apiClient.post('/questions', questionData);
        // Po dodaniu pytania odśwież cache lub pobierz najnowsze pytania
        await dispatch('fetchStats'); // Aktualizuj statystyki po dodaniu
        return true;
      } catch (e) {
        console.error('Błąd dodawania pytania:', e);
        return false;
      }
    },
    async editQuestion({ dispatch }, { id, questionData }) {
      try {
        await apiClient.put(`/questions/${id}`, questionData);
        await dispatch('fetchStats'); // Aktualizuj statystyki po edycji
        return true;
      } catch (e) {
        console.error('Błąd edycji pytania:', e);
        return false;
      }
    },
    async deleteQuestion({ dispatch }, id) {
      try {
        await apiClient.delete(`/questions/${id}`);
        await dispatch('fetchStats'); // Aktualizuj statystyki po usunięciu
        return true;
      } catch (e) {
        console.error('Błąd usuwania pytania:', e);
        return false;
      }
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
    getStats: (state) => ({
      totalQuestions: Object.values(state.categoryCounts).reduce((a, b) => a + b, 0),
      categories: state.categories,
      categoryCounts: state.categoryCounts,
    }),
  },
};

// Użycie: import { setIndexedDBUsage } from '@/store/questions';
// setIndexedDBUsage(false); // wyłącza IndexedDB, zawsze pobiera z serwera
