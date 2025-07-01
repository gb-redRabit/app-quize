import { createStore } from 'vuex';
import questions from './questions';
import user from './user';
import ui from './ui';

const store = createStore({
  modules: {
    questions,
    user,
    ui,
  },
});

// Przywracanie stanu po odświeżeniu
const userData = sessionStorage.getItem('user');
const token = sessionStorage.getItem('token');
if (userData && token) {
  store.commit('user/SET_USER', JSON.parse(userData));
  store.commit('user/SET_AUTHENTICATED', true);
}

export default store;
