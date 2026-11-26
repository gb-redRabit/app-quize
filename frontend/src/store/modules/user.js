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
import {
  getHistoryCache,
  replaceHistoryCache,
  clearHistoryCache,
} from '@/utils/historyCache';

function persistHistory(userId, history) {
  if (!userId) return;
  replaceHistoryCache(userId, history).catch((e) => {
    console.warn('Nie udało się zapisać pełnej historii lokalnie:', e?.message || e);
  });
}

export default {
  namespaced: true,
  state: {
    user: {},
    history: [],
    hquestion: [],
    historyLoadedFromServer: false,
    isAuthenticated: false,
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    SET_USER_HISTORY(state, history) {
      state.history = history;
    },
    SET_HISTORY_SOURCE(state, source) {
      state.historyLoadedFromServer = source === 'server';
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
    // Inicjalizacja danych użytkownika (wywoływana przed mountem aplikacji).
    async initUser({ commit, state }) {
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

      // Pełne wpisy (z listami odpowiedzi) doładuj z IndexedDB. Serwer ma
      // pierwszeństwo: jeśli zdążył już odpowiedzieć, nie nadpisujemy.
      if (!user?._id) return;
      try {
        const full = await getHistoryCache(user._id);
        if (Array.isArray(full) && full.length > 0 && !state.historyLoadedFromServer) {
          commit('SET_USER_HISTORY', full);
        }
      } catch (e) {
        // Brak IndexedDB — zostają podsumowania z localStorage.
      }
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

        // Profil pochodzi z odpowiedzi logowania — nie pobieramy go drugi raz.
        // Historia, odpowiedzi i statystyki równolegle: jedno oczekiwanie na sieć.
        await Promise.all([
          dispatch('fetchUserHistoryAndHQ', { withProfile: false }),
          dispatch('questions/fetchStats', null, { root: true }),
        ]);
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
      const history = Array.isArray(res.data) ? res.data : [];
      commit('SET_USER_HISTORY', history);
      commit('SET_HISTORY_SOURCE', 'server');
      setCachedHistory(history);
      persistHistory(getStoredUser()?._id, history);
    },
    /** Sam profil — używany przy starcie, gdy nie ma lokalnej kopii danych. */
    async fetchUserProfile({ commit }) {
      const res = await apiClient.get('/users/me');
      const updatedUser = { ...res.data };
      commit('SET_USER', updatedUser);
      setUser(updatedUser);
      return updatedUser;
    },
    /**
     * Historia + odpowiedzi (+ opcjonalnie profil). Żądania lecą równolegle,
     * a błąd sieci zostawia ostatnią lokalną kopię (offline-first).
     */
    async fetchUserHistoryAndHQ({ commit, state }, { withProfile = true } = {}) {
      try {
        const requests = [
          apiClient.get('/users/history'),
          apiClient.get('/users/hquestion'),
        ];
        if (withProfile) requests.push(apiClient.get('/users/me'));

        const [historyRes, hqRes, meRes] = await Promise.all(requests);

        const history = Array.isArray(historyRes.data) ? historyRes.data : [];
        const hquestion = Array.isArray(hqRes.data) ? hqRes.data : [];
        commit('SET_USER_HISTORY', history);
        commit('SET_HISTORY_SOURCE', 'server');
        commit('SET_HQUESTION', hquestion);
        setCachedHistory(history);
        setCachedHQuestion(hquestion);
        persistHistory(meRes?.data?._id || state.user?._id, history);

        // Profil (bez historii/hquestion) — aktualizujemy avatar, motyw itp.
        if (meRes) {
          const updatedUser = { ...meRes.data };
          commit('SET_USER', updatedUser);
          setUser(updatedUser);
        }
      } catch (e) {
        // Offline lub błąd sieci: zostaje ostatnia zapisana kopia. Nie nadpisujemy
        // pełnych danych z IndexedDB uboższymi podsumowaniami.
        const cached = getCachedUserData();
        if (!state.history?.length && Array.isArray(cached.history)) {
          commit('SET_USER_HISTORY', cached.history);
        }
        if (!state.hquestion?.length && Array.isArray(cached.hquestion)) {
          commit('SET_HQUESTION', cached.hquestion);
        }
      }
    },
    async logout({ commit }) {
      commit('SET_AUTHENTICATED', false);
      commit('SET_USER', {});
      commit('SET_USER_HISTORY', []);
      commit('SET_HISTORY_SOURCE', 'server');
      commit('SET_HQUESTION', []);
      clearSession();
      // Pełna kopia historii nie może zostać na współdzielonym urządzeniu.
      clearHistoryCache().catch(() => {});
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
        commit('SET_HISTORY_SOURCE', 'server');
        commit('SET_HQUESTION', []);
        setCachedHistory([]);
        setCachedHQuestion([]);
        await clearHistoryCache().catch(() => {});

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
          commit('SET_HISTORY_SOURCE', 'server');
          commit('SET_HQUESTION', []);
          clearSession();
          clearHistoryCache().catch(() => {});
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
