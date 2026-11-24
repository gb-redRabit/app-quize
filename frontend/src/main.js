import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/tailwind.css';
import apiClient from './api';

// Inicjalizacja tematu przy starcie aplikacji
store.dispatch('ui/initTheme');
store.dispatch('user/initUser');

// Funkcja dekodująca token JWT
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Błąd parsowania tokenu:', error);
    return null;
  }
}

// Dodaj funkcję sprawdzającą i odświeżającą token
function setupTokenRefresh() {
  // Odświeżaj token co 10 minut
  const refreshInterval = 10 * 60 * 1000;

  // Flaga do śledzenia stanu
  let isRefreshingToken = false;

  // Główne interwały
  const intervalId = setInterval(refreshToken, refreshInterval);

  // Nasłuchuj zdarzeń aktywności użytkownika (szczególnie podczas quizu/egzaminu)
  window.addEventListener('focus', refreshToken);
  window.addEventListener('online', refreshToken);

  // Specjalny nasłuchiwacz dla quiz/exam widoku
  window.addEventListener('quiz-activity', debounce(checkTokenActivity, 5000));

  // Funkcja sprawdzająca aktywność podczas quizu/egzaminu
  async function checkTokenActivity() {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    const decoded = parseJwt(token);
    if (!decoded || !decoded.exp) return;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeRemaining = decoded.exp - currentTime;

    // Jeśli pozostało mniej niż 15 minut, automatycznie odśwież token
    if (timeRemaining < 15 * 60 && !isRefreshingToken) {
      await refreshToken();
    }
  }

  // Odświeżanie tokenu
  async function refreshToken() {
    const token = sessionStorage.getItem('token');
    if (!token || isRefreshingToken) return;

    const decoded = parseJwt(token);
    if (!decoded || !decoded.exp) return;
    const remaining = decoded.exp - Math.floor(Date.now() / 1000);
    if (remaining > 10 * 60) return;

    try {
      isRefreshingToken = true;
      const res = await apiClient.silentPost('/auth/refresh', {});
      if (res.data && res.data.token) {
        sessionStorage.setItem('token', res.data.token);
        console.debug('Token odświeżony:', new Date());
      }
    } catch (e) {
      console.error('Błąd odświeżania tokenu:', e);
    } finally {
      isRefreshingToken = false;
    }
  }

  // Helper do ograniczenia liczby wywołań funkcji
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Wyczyść interwały przy zamknięciu aplikacji
  window.addEventListener('beforeunload', () => {
    clearInterval(intervalId);
  });
}

// Uruchom mechanizm odświeżania tokenu przy starcie aplikacji
if (sessionStorage.getItem('token')) {
  setupTokenRefresh();
}

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
