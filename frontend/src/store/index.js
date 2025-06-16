import { createStore } from "vuex";
import axios from "axios";

const store = createStore({
  state: {
    questions: [],
    userHistory: [],
    isAuthenticated: false,
    user: null,
  },
  mutations: {
    SET_QUESTIONS(state, questions) {
      state.questions = questions;
    },
    SET_USER_HISTORY(state, history) {
      state.userHistory = history;
    },
    SET_AUTHENTICATED(state, status) {
      state.isAuthenticated = status;
    },
    SET_USER(state, user) {
      state.user = user;
    },
  },
  actions: {
    async fetchQuestions({ commit }) {
      const response = await axios.get("/api/questions");
      commit("SET_QUESTIONS", response.data);
    },
    async fetchUserHistory({ commit }) {
      const response = await axios.get("/api/users/history", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      const user = JSON.parse(sessionStorage.getItem("user")) || {};
      user.history = response.data;
      commit("SET_USER", user);
      commit("SET_USER_HISTORY", response.data);
    },
    async login({ commit }, credentials) {
      const response = await axios.post("/api/auth/login", credentials);
      commit("SET_AUTHENTICATED", true);
      commit("SET_USER", response.data.user);
      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem("user", JSON.stringify(response.data.user));
    },
    async logout({ commit }) {
      await axios.post("/api/auth/logout");
      commit("SET_AUTHENTICATED", false);
      commit("SET_USER", null);
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    },
  },
  getters: {
    getQuestions: (state) => state.questions,
    getUserHistory: (state) => state.userHistory,
    isAuthenticated: (state) => state.isAuthenticated,
    getUser: (state) => state.user,
  },
});

// Przywracanie stanu po odświeżeniu
const user = sessionStorage.getItem("user");
const token = sessionStorage.getItem("token");
if (user && token) {
  store.commit("SET_USER", JSON.parse(user));
  store.commit("SET_AUTHENTICATED", true);
}

export default store;
