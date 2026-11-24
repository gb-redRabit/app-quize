import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/tailwind.css';
import { startTokenRefresh } from './services/tokenRefresh';

// Inicjalizacja tematu przy starcie aplikacji
store.dispatch('ui/initTheme');
store.dispatch('user/initUser');

// Jedno źródło odświeżania tokenu (interwał + focus/online/aktywność quizu).
startTokenRefresh();

const app = createApp(App);
app.config.performance = import.meta.env.DEV;
app.use(router).use(store).mount('#app');

// Service worker: cache tylko statycznych zasobów (bez HTML/API).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch((error) => console.warn('Nie udało się zarejestrować service workera:', error));
  });
}
