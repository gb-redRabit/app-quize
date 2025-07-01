export default {
  namespaced: true,
  state: {
    loading: false,
    error: '',
  },
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
  },
  getters: {
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
  },
};
