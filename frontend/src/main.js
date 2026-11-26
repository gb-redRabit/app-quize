import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/tailwind.css';
import { startTokenRefresh } from './services/tokenRefresh';
import { setupPWA } from './services/pwa';

// Inicjalizacja tematu przy starcie aplikacji
store.dispatch('ui/initTheme');

// Jedno źródło odświeżania tokenu (interwał + focus/online/aktywność quizu).
startTokenRefresh();

// Najpierw sesja + pełna historia z IndexedDB (szybkie, lokalne), potem mount.
// Limit czasu chroni przed zawieszeniem, gdy IndexedDB jest zablokowane.
const initTimeout = new Promise((resolve) => setTimeout(resolve, 800));
Promise.race([store.dispatch('user/initUser'), initTimeout]).finally(() => {
  const app = createApp(App);
  app.config.performance = import.meta.env.DEV;
  app.use(router).use(store).mount('#app');

  // PWA: rejestracja Service Workera + wykrywanie nowej wersji aplikacji.
  setupPWA();
});
