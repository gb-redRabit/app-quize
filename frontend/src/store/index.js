import { createStore } from 'vuex';
import questions from './modules/questions';
import user from './modules/user';
import ui from './modules/ui';
import { getStoredUser, hasSession } from '@/utils/authStorage';

const store = createStore({
  modules: {
    questions,
    user,
    ui,
  },
});

// Przywracanie stanu po odświeżeniu (sessionStorage lub localStorage dla PWA).
const userData = getStoredUser();
if (userData && hasSession()) {
  store.commit('user/SET_USER', userData);
  store.commit('user/SET_AUTHENTICATED', true);
}

export default store;
