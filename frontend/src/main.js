import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/tailwind.css';
import { startTokenRefresh } from './services/tokenRefresh';
import { setupPWA } from './services/pwa';

// Inicjalizacja tematu przy starcie aplikacji
store.dispatch('ui/initTheme');
store.dispatch('user/initUser');

// Jedno źródło odświeżania tokenu (interwał + focus/online/aktywność quizu).
startTokenRefresh();

const app = createApp(App);
app.config.performance = import.meta.env.DEV;
app.use(router).use(store).mount('#app');

// PWA: rejestracja Service Workera + wykrywanie nowej wersji aplikacji.
setupPWA();
