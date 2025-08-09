import apiClient from '@/api';

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
      const userStr = sessionStorage.getItem('user');
      const token = sessionStorage.getItem('token');

      if (userStr && token) {
        try {
          const user = JSON.parse(userStr);
          commit('SET_USER', user);
          commit('SET_AUTHENTICATED', true);
        } catch (e) {
          console.error('Błąd parsowania danych użytkownika z sessionStorage', e);
        }
      }
    },

    async login({ commit, dispatch }, credentials) {
      try {
        const response = await apiClient.post('/auth/login', credentials);
        const { user, token } = response.data;

        commit('SET_AUTHENTICATED', true);
        commit('SET_USER', user);
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(user));

        // Ustaw motyw z preferencji użytkownika
        if (user.option) {
          dispatch('ui/setTheme', user.option, { root: true });
        }

        await dispatch('fetchUserHistoryAndHQ');
        return true;
      } catch (error) {
        commit('SET_AUTHENTICATED', false);
        commit('SET_USER', {});
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        throw (
          (error.response && error.response.data && error.response.data.message) || 'Błąd logowania'
        );
      }
    },
    async fetchUserHistory({ commit }) {
      const res = await apiClient.get('/users/history');
      commit('SET_USER_HISTORY', res.data);
    },
    async fetchUserHistoryAndHQ({ commit, state }) {
      try {
        const historyRes = await apiClient.get('/users/history');
        commit('SET_USER_HISTORY', historyRes.data);

        const meRes = await apiClient.get('/users/me');

        // Zachowujemy wszystkie dane użytkownika, w tym avatar i avatarColors
        commit('SET_HQUESTION', meRes.data && meRes.data.hquestion ? meRes.data.hquestion : []);

        // Aktualizujemy dane użytkownika, zachowując poprzednie dane
        const updatedUser = { ...meRes.data };
        commit('SET_USER', updatedUser);

        // Aktualizujemy sessionStorage
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (e) {
        commit('SET_USER_HISTORY', []);
        commit('SET_HQUESTION', []);
      }
    },
    async logout({ commit, dispatch }) {
      commit('SET_AUTHENTICATED', false);
      commit('SET_USER', {});
      commit('SET_HQUESTION', []);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
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

        // Wyczyść dane w sessionStorage
        try {
          const userStr = sessionStorage.getItem('user');
          if (userStr) {
            const userData = JSON.parse(userStr);
            userData.history = [];
            userData.hquestion = [];
            sessionStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (e) {
          console.error('Błąd podczas aktualizacji sessionStorage', e);
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
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
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
