import apiClient from '@/api'; // <-- ZMIANA

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
      if (!state.user) state.user = {};
      state.user.history = history;
    },
    SET_HQUESTION(state, hq) {
      state.hquestion = hq || [];
    },
    SET_AUTHENTICATED(state, status) {
      state.isAuthenticated = status;
    },
  },
  actions: {
    async login({ commit, dispatch }, credentials) {
      try {
        const response = await apiClient.post('/auth/login', credentials); // <-- ZMIANA
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
        const res = await apiClient.get('/users/history'); // <-- ZMIANA
        commit('SET_USER_HISTORY', res.data);
      } catch (e) {
        commit('SET_USER_HISTORY', []);
      }
    },
    async fetchUserHistoryAndHQ({ commit }) {
      try {
        const historyRes = await apiClient.get('/users/history'); // <-- ZMIANA
        commit('SET_USER_HISTORY', historyRes.data);

        const meRes = await apiClient.get('/users/me'); // <-- ZMIANA
        commit('SET_HQUESTION', meRes.data && meRes.data.hquestion ? meRes.data.hquestion : []);
        commit('SET_USER', meRes.data);
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
        // Możesz dodać lepszą obsługę błędów, np. rzucić wyjątek do komponentu
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
