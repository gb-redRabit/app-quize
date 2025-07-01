import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/tailwind.css';
import apiClient from './api'; // <-- ZMIANA

// Funkcja do odświeżania tokena
function scheduleTokenRefresh() {
  const refreshInterval = 10 * 60 * 1000; // 10 minut
  setInterval(async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      // Używamy apiClient, który już ma token w nagłówku
      const res = await apiClient.post('/auth/refresh', {});
      if (res.data.token) {
        sessionStorage.setItem('token', res.data.token);
      }
    } catch (e) {
      // Interceptor w apiClient sam obsłuży wylogowanie przy błędzie 401
      console.error('Błąd odświeżania tokena:', e);
    }
  }, refreshInterval);
}

// Uruchom odświeżanie, jeśli token istnieje przy starcie aplikacji
if (sessionStorage.getItem('token')) {
  scheduleTokenRefresh();
}

// Ustawianie motywu na podstawie danych użytkownika
const user = sessionStorage.getItem('user');
if (user) {
  const option = JSON.parse(user).option || 'light';
  document.documentElement.setAttribute('data-theme', option);
}

createApp(App).use(router).use(store).mount('#app');
