import apiClient from '@/api';
import {
  getToken,
  getStoredUser,
  setSession,
  setUser,
  setCachedHistory,
  setCachedHQuestionMarker,
  getCachedUserData,
  getLegacyCachedHQuestion,
  clearLegacyCachedHQuestion,
  clearCachedHQuestionMarker,
  clearSession,
} from '@/utils/authStorage';
import {
  getHistoryCache,
  replaceHistoryCache,
  getHQuestionCache,
  replaceHQuestionCache,
  clearUserCache,
} from '@/utils/userCache';

function persistHistory(userId, history) {
  if (!userId) return;
  replaceHistoryCache(userId, history).catch((e) => {
    console.warn('Nie udało się zapisać pełnej historii lokalnie:', e?.message || e);
  });
}

function persistHQuestion(userId, answers) {
  if (!userId) return;
  replaceHQuestionCache(userId, answers).catch((e) => {
    console.warn('Nie udało się zapisać odpowiedzi lokalnie:', e?.message || e);
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

      // Stara, pełna kopia odpowiedzi (jeśli jest) — do migracji do IndexedDB.
      const legacyHQ = Array.isArray(cached.hquestion) ? cached.hquestion : null;
      if (legacyHQ) commit('SET_HQUESTION', legacyHQ);

      if (!user?._id) return;
      try {
        // Pełne wpisy z IndexedDB. Serwer ma pierwszeństwo: jeśli zdążył już
        // odpowiedzieć, nie nadpisujemy świeższych danych.
        const [fullHistory, fullHQuestion] = await Promise.all([
          getHistoryCache(user._id),
          getHQuestionCache(user._id),
        ]);

        if (Array.isArray(fullHistory) && fullHistory.length > 0 && !state.historyLoadedFromServer) {
          commit('SET_USER_HISTORY', fullHistory);
        }
        if (Array.isArray(fullHQuestion) && fullHQuestion.length > 0 && !state.hquestion?.length) {
          commit('SET_HQUESTION', fullHQuestion);
        }

        if (fullHQuestion.length > 0) {
          setCachedHQuestionMarker(user._id, fullHQuestion.length);
          clearLegacyCachedHQuestion();
        } else if (legacyHQ) {
          // Jednorazowa migracja starej kopii z localStorage.
          await replaceHQuestionCache(user._id, legacyHQ);
          setCachedHQuestionMarker(user._id, legacyHQ.length);
        }
      } catch (e) {
        // Brak IndexedDB — zostają podsumowania i ewentualna stara kopia.
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

        const ownerId = meRes?.data?._id || state.user?._id;
        setCachedHQuestionMarker(ownerId, hquestion.length);
        persistHistory(ownerId, history);
        persistHQuestion(ownerId, hquestion);

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
        if (!state.hquestion?.length) {
          const legacyHQ = getLegacyCachedHQuestion();
          if (Array.isArray(legacyHQ)) commit('SET_HQUESTION', legacyHQ);
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
      // Pełne dane użytkownika nie mogą zostać na współdzielonym urządzeniu.
      clearUserCache().catch(() => {});
    },
    async clearCategoryHistory({ dispatch, state }, { category }) {
      try {
        const response = await apiClient.put('/users/clear-category', { category });
        // Odśwież statystyki pytań i utrwal lokalny stan odpowiedzi (IDB).
        dispatch('questions/fetchStats', null, { root: true });
        const userId = state.user?._id;
        if (userId) {
          setCachedHQuestionMarker(userId, state.hquestion.length);
          persistHQuestion(userId, state.hquestion);
        }
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
        clearCachedHQuestionMarker();
        await clearUserCache().catch(() => {});

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
          clearUserCache().catch(() => {});
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
