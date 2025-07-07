import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/tailwind.css';
import apiClient from './api'; // Dodaj import apiClient, który był używany ale niezaimportowany

// Zaimportuj tylko niezbędne style przy starcie aplikacji
import './assets/main.css';

// Lazy-load dla głównego pliku CSS
setTimeout(() => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './assets/main.css';
  document.head.appendChild(link);
}, 100);

// Inicjalizacja tematu przy starcie aplikacji
store.dispatch('ui/initTheme');
store.dispatch('user/initUser');
// Funkcja do odświeżania tokena
function scheduleTokenRefresh() {
  const refreshInterval = 10 * 60 * 1000; // 10 minut
  setInterval(async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      const res = await apiClient.silentPost('/auth/refresh', {});
      if (res.data.token) {
        sessionStorage.setItem('token', res.data.token);
      }
    } catch (e) {
      console.error('Błąd odświeżania tokena:', e);
    }
  }, refreshInterval);
}

// Uruchom odświeżanie, jeśli token istnieje przy starcie aplikacji
if (sessionStorage.getItem('token')) {
  scheduleTokenRefresh();
}

const app = createApp(App);
app.config.performance = process.env.NODE_ENV !== 'production';
// Usuń wszelkie odniesienia do ikon, jeśli istnieją
app.use(router).use(store).mount('#app');
