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

        await dispatch('fetchUserHistoryAndHQ');
        await dispatch('questions/fetchQuestionsAndCategories', null, { root: true });

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
      try {
        const res = await apiClient.get('/users/history');
        commit('SET_USER_HISTORY', res.data);
      } catch (e) {
        commit('SET_USER_HISTORY', []);
      }
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
    async logout({ commit }) {
      commit('SET_AUTHENTICATED', false);
      commit('SET_USER', {});
      commit('SET_HQUESTION', []);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    },
    async clearCategoryHistory({ dispatch }, category) {
      try {
        await apiClient.put('/users/clear-category', { category });
        await dispatch('fetchUserHistoryAndHQ');
      } catch (e) {
        throw new Error('Błąd podczas czyszczenia pytań z kategorii.');
      }
    },
  },
  getters: {
    getUser: (state) => state.user,
    getUserHistory: (state) => (state.user && state.user.history ? state.user.history : []),
    getHquestion: (state) => state.hquestion,
    isAuthenticated: (state) => state.isAuthenticated,
  },
};
