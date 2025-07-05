import axios from 'axios';
import store from '../store';
// process.env.VUE_APP_API_URL ||'https://app-quize.onrender.com/api
const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'https://app-quize.onrender.com/api',
  // baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor do automatycznego dodawania tokena do każdego zapytania
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor do globalnej obsługi błędów (np. 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Jeśli token wygasł lub jest nieprawidłowy, wyloguj użytkownika
      store.dispatch('user/logout').then(() => {
        // Użyj `window.location` aby zapewnić pełne odświeżenie stanu
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      });
    }
    return Promise.reject(error);
  }
);

export default apiClient;
