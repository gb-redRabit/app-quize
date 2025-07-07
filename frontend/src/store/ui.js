const ui = {
  namespaced: true,
  state: {
    loading: false,
    theme: localStorage.getItem('theme') || 'light', // Domyślnie jasny lub zapisany
  },
  getters: {
    isLoading: (state) => state.loading,
    currentTheme: (state) => state.theme,
    isDarkTheme: (state) => state.theme === 'dark',
  },
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_THEME(state, theme) {
      state.theme = theme;
      // Zastosowanie tematu do elementu HTML
      document.documentElement.setAttribute('data-theme', theme);
      // Zapisanie preferencji w localStorage
      localStorage.setItem('theme', theme);
    },
  },
  actions: {
    setLoading({ commit }, loading) {
      commit('SET_LOADING', loading);
    },
    setTheme({ commit }, theme) {
      commit('SET_THEME', theme);
    },
    toggleTheme({ commit, state }) {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      commit('SET_THEME', newTheme);
    },
    initTheme({ commit, state }) {
      // Zastosowanie zapisanego motywu przy uruchomieniu aplikacji
      commit('SET_THEME', state.theme);
    },
  },
};

export default ui;
