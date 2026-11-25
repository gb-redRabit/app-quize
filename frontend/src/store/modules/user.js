import apiClient from '@/api';
import {
  getToken,
  getStoredUser,
  setSession,
  setUser,
  setCachedHistory,
  setCachedHQuestion,
  getCachedUserData,
  clearSession,
} from '@/utils/authStorage';

export default {
  namespaced: true,
  state: {
    user: {},
    hquestion: [],
    isAuthenticated: false,
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    SET_USER_HISTORY(state, history) {
      state.history = history;
    },
    SET_HQUESTION(state, hq) {
      state.hquestion = hq || [];
    },
    SET_AUTHENTICATED(state, status) {
      state.isAuthenticated = status;
    },
    CLEAR_CATEGORY_HISTORY_OPTIMISTIC(state, category) {
      // Ta część jest POPRAWNA - usuwa historię odpowiedzi na poszczególne pytania
      if (state.hquestion) {
        state.hquestion = state.hquestion.filter((q) => q.category !== category);
      }

      // Usuwamy tę część, aby nie kasować historii ukończonych quizów/egzaminów
      /*
      if (state.history) {
        state.history = state.history.filter(h => {
          if (h.category) return h.category !== category;
          if (h.categories) return !h.categories.includes(category);
          return true;
        });
      }
      */
    },
  },
  actions: {
    // Dodajemy akcję inicjalizacji danych użytkownika
    initUser({ commit }) {
      const user = getStoredUser();
      const token = getToken();

      if (user && token) {
        commit('SET_USER', user);
        commit('SET_AUTHENTICATED', true);
      }

      // Ostatnia znana historia/odpowiedzi — używane offline i przy starcie.
      const cached = getCachedUserData();
      if (Array.isArray(cached.history)) commit('SET_USER_HISTORY', cached.history);
      if (Array.isArray(cached.hquestion)) commit('SET_HQUESTION', cached.hquestion);
    },

    async login({ commit, dispatch }, credentials) {
      try {
        const response = await apiClient.post('/auth/login', credentials);
        const { user, token } = response.data;

        commit('SET_AUTHENTICATED', true);
        commit('SET_USER', user);
        setSession(token, user);

        // Ustaw motyw z preferencji użytkownika
        if (user.option) {
          dispatch('ui/setTheme', user.option, { root: true });
        }

        await dispatch('fetchUserHistoryAndHQ');
        await dispatch('questions/fetchStats', null, { root: true });
        return true;
      } catch (error) {
        commit('SET_AUTHENTICATED', false);
        commit('SET_USER', {});
        clearSession();
        throw (
          (error.response && error.response.data && error.response.data.message) || 'Błąd logowania'
        );
      }
    },
    async fetchUserHistory({ commit }) {
      const res = await apiClient.get('/users/history');
      commit('SET_USER_HISTORY', res.data);
    },
    async fetchUserHistoryAndHQ({ commit }) {
      try {
        // Trzy lekkie zapytania równolegle: historia, odpowiedzi i profil.
        const [historyRes, hqRes, meRes] = await Promise.all([
          apiClient.get('/users/history'),
          apiClient.get('/users/hquestion'),
          apiClient.get('/users/me'),
        ]);

        const history = Array.isArray(historyRes.data) ? historyRes.data : [];
        const hquestion = Array.isArray(hqRes.data) ? hqRes.data : [];
        commit('SET_USER_HISTORY', history);
        commit('SET_HQUESTION', hquestion);
        setCachedHistory(history);
        setCachedHQuestion(hquestion);

        // Profil (bez historii/hquestion) — aktualizujemy avatar, motyw itp.
        const updatedUser = { ...meRes.data };
        commit('SET_USER', updatedUser);
        setUser(updatedUser);
      } catch (e) {
        // Offline lub błąd sieci: zostaje ostatnia zapisana kopia.
        const cached = getCachedUserData();
        if (Array.isArray(cached.history)) commit('SET_USER_HISTORY', cached.history);
        if (Array.isArray(cached.hquestion)) commit('SET_HQUESTION', cached.hquestion);
      }
    },
    async logout({ commit }) {
      commit('SET_AUTHENTICATED', false);
      commit('SET_USER', {});
      commit('SET_HQUESTION', []);
      clearSession();
      // Po wylogowaniu
    },
    async clearCategoryHistory({ dispatch }, { category }) {
      try {
        const response = await apiClient.put('/users/clear-category', { category });
        // Po pomyślnym wyczyszczeniu na serwerze, odświeżamy tylko ogólne statystyki pytań
        dispatch('questions/fetchStats', null, { root: true });
        return response.data?.success ?? true;
      } catch (e) {
        console.error('Błąd API podczas czyszczenia pytań z kategorii:', e);
        return false;
      }
    },
    async clearHistory({ dispatch, commit }) {
      try {
        await apiClient.put('/users/update-profile', { clearHistory: true });

        // Natychmiast czyść wszystkie powiązane dane
        commit('SET_USER_HISTORY', []);
        commit('SET_HQUESTION', []);
        setCachedHistory([]);
        setCachedHQuestion([]);

        // Wyczyść dane w pamięci sesji trwałej
        try {
          const userData = getStoredUser();
          if (userData) {
            userData.history = [];
            userData.hquestion = [];
            setUser(userData);
          }
        } catch (e) {
          console.error('Błąd podczas aktualizacji danych użytkownika', e);
        }

        // Pobierz świeże dane
        await dispatch('fetchUserHistoryAndHQ');

        // Powiadom komponenty o zmianie
        window.dispatchEvent(new CustomEvent('user-data-refreshed', { detail: { all: true } }));

        return true;
      } catch (error) {
        console.error('Error clearing history:', error);
        throw error;
      }
    },
    async verifySession({ commit }) {
      try {
        // Sprawdź ważność tokenu przez zapytanie do chronionego endpointu
        await apiClient.silentGet('/users/me');
        return true;
      } catch (error) {
        // Jeśli błąd 403, wyloguj użytkownika
        if (error.response && error.response.status === 403) {
          commit('SET_AUTHENTICATED', false);
          commit('SET_USER', {});
          commit('SET_USER_HISTORY', []);
          commit('SET_HQUESTION', []);
          clearSession();
          throw new Error('Sesja wygasła');
        }
        return false;
      }
    },
  },
  getters: {
    getUser: (state) => state.user,
    getUserHistory: (state) => state.history || [],
    getHquestion: (state) => state.hquestion,
    isAuthenticated: (state) => state.isAuthenticated,
  },
};
