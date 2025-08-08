import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/tailwind.css';
import apiClient from './api'; // Dodaj import apiClient, który był używany ale niezaimportowany

// Inicjalizacja tematu przy starcie aplikacji
store.dispatch('ui/initTheme');
store.dispatch('user/initUser');

// Dodaj funkcję sprawdzającą i odświeżającą token
function setupTokenRefresh() {
  // Odświeżaj token co 10 minut
  const refreshInterval = 10 * 60 * 1000;

  // Odświeżanie tokenu na interwał
  const intervalId = setInterval(refreshToken, refreshInterval);

  // Odśwież token przy powrocie z hibernacji/uśpienia
  window.addEventListener('focus', refreshToken);

  // Odśwież token przy przywróceniu połączenia
  window.addEventListener('online', refreshToken);

  async function refreshToken() {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      const res = await apiClient.silentPost('/auth/refresh', {});
      if (res.data && res.data.token) {
        sessionStorage.setItem('token', res.data.token);
      }
    } catch (e) {
      console.error('Błąd odświeżania tokenu:', e);
    }
  }

  // Wyczyść interwał przy zamknięciu aplikacji
  window.addEventListener('beforeunload', () => {
    clearInterval(intervalId);
  });
}

// Uruchom mechanizm odświeżania tokenu przy starcie aplikacji
if (sessionStorage.getItem('token')) {
  setupTokenRefresh();
}

const app = createApp(App);
app.config.performance = process.env.NODE_ENV !== 'production';
// Usuń wszelkie odniesienia do ikon, jeśli istnieją
app.use(router).use(store).mount('#app');
