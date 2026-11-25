const prefersDarkScheme = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

/** Zamienia zapisany motyw (light/dark/system) na faktyczny motyw. */
const resolveTheme = (theme) => (theme === 'system' ? (prefersDarkScheme() ? 'dark' : 'light') : theme);

const ui = {
  namespaced: true,
  state: {
    loading: false,
    theme: localStorage.getItem('theme') || 'light', // Domyślnie jasny lub zapisany
  },
  getters: {
    isLoading: (state) => state.loading,
    currentTheme: (state) => state.theme,
    resolvedTheme: (state) => resolveTheme(state.theme),
    isDarkTheme: (state) => resolveTheme(state.theme) === 'dark',
  },
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_THEME(state, theme) {
      state.theme = theme;
      // Zastosowanie rozwiązanego motywu do elementu HTML
      document.documentElement.setAttribute('data-theme', resolveTheme(theme));
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
