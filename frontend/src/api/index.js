import axios from 'axios';
import store from '@/store';

/**
 * Konfigurowalna instancja klienta API z zaawansowanym cachowaniem i obsługą błędów
 */
const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'https://app-quize.onrender.com/api',
  // baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Timeout 15 sekund dla wszystkich zapytań
});

// System cachowania z różnymi czasami TTL
const cache = new Map();

// Konfiguracja czasów TTL (w ms) dla różnych endpointów
const cacheTTLConfig = {
  '/stats': 5 * 60 * 1000, // 5 minut dla statystyk
  '/questions': 10 * 60 * 1000, // 10 minut dla pytań
  '/users/hquestion': 2 * 60 * 1000, // 2 minuty dla historii
  default: 1 * 60 * 1000, // domyślnie 1 minuta
};

/**
 * Znajduje odpowiedni TTL dla danego URL
 * @param {string} url - URL zapytania
 * @return {number} Czas TTL w ms
 */
const findTTLForUrl = (url) => {
  // Szybsze i bardziej optymalne wyszukiwanie
  for (const key in cacheTTLConfig) {
    if (key !== 'default' && url.includes(key)) {
      return cacheTTLConfig[key];
    }
  }
  return cacheTTLConfig.default;
};

// Przechowaj oryginalne metody API
const originalMethods = {
  get: apiClient.get,
  post: apiClient.post,
  put: apiClient.put,
  delete: apiClient.delete,
  patch: apiClient.patch,
};

/**
 * Usprawniony mechanizm GET z cachowaniem
 */
apiClient.get = function (url, config = {}) {
  // Nie używaj cache dla oznaczonych zapytań lub w trybie dev
  if (config.noCache || process.env.NODE_ENV !== 'production') {
    return originalMethods.get(url, config);
  }

  // Tworzenie klucza cache z uwzględnieniem parametrów zapytania
  const cacheKey = url + (config.params ? JSON.stringify(config.params) : '');
  const cachedResponse = cache.get(cacheKey);
  const ttl = findTTLForUrl(url);

  // Sprawdź czy cache jest ważny
  if (cachedResponse && Date.now() - cachedResponse.timestamp < ttl) {
    return Promise.resolve(cachedResponse.data);
  }

  return originalMethods.get(url, config).then((response) => {
    cache.set(cacheKey, {
      data: response,
      timestamp: Date.now(),
    });
    return response;
  });
};

/**
 * Uzyskuje dostęp do komponentu loadera
 */
const getLoader = () => {
  try {
    const app = document.getElementById('app')?.__vue_app__;
    if (!app) return null;

    const root = app._instance?.proxy;
    if (!root) return null;

    return root.$refs?.globalLoader;
  } catch (e) {
    console.debug('Błąd dostępu do loadera:', e);
    return null;
  }
};

/**
 * Uzyskuje dostęp do systemu alertów
 */
const getAlerter = () => {
  try {
    const app = document.getElementById('app')?.__vue_app__;
    if (!app) return null;

    const root = app._instance?.proxy;
    if (!root) return null;

    return root.$alert || root.$root?.$alert;
  } catch (e) {
    console.debug('Błąd dostępu do alertera:', e);
    return null;
  }
};

/**
 * Pokazuje alert z automatycznym zamknięciem
 * @param {string} type - Typ alertu (success, error, warning, info)
 * @param {string} message - Treść alertu
 * @param {number} duration - Czas wyświetlania w ms (opcjonalny)
 */
const showAlert = (type, message, duration = 3000) => {
  const alert = getAlerter();
  if (alert) {
    alert(type, message, duration);
  } else {
    console[type === 'error' ? 'error' : 'log'](type, message);
  }
};

/**
 * Obsługa tokenów uwierzytelniania
 */
const tokenManager = {
  getToken: () => sessionStorage.getItem('token'),

  setToken: (token) => {
    sessionStorage.setItem('token', token);
  },

  removeToken: () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  },

  handleSessionExpired: () => {
    tokenManager.removeToken();
    showAlert('warning', 'Twoja sesja wygasła. Zaloguj się ponownie.', 5000);

    // Przekieruj do strony logowania tylko jeśli nie jesteśmy już na niej
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  },
};

// Interceptor dla zapytań - dodaje token i obsługuje loader
apiClient.interceptors.request.use(
  (config) => {
    // Pokaż loader jeśli zapytanie nie jest ciche
    if (!config.silent) {
      const loader = getLoader();
      if (loader) {
        // Używanie niestandardowej wiadomości loadera jeśli jest dostępna
        if (config.loaderMessage && typeof loader.showWithMessage === 'function') {
          loader.showWithMessage(config.loaderMessage);
        } else {
          loader.show();
        }
      }
    }

    // Dodaj token uwierzytelniania jeśli istnieje
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    const loader = getLoader();
    if (loader) loader.hide();

    return Promise.reject(error);
  }
);

// Interceptor dla odpowiedzi - ukrywa loader i obsługuje błędy
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        // Odśwież token
        const res = await apiClient.silentPost('/auth/refresh', {});
        const newToken = res.data.token;
        sessionStorage.setItem('token', newToken);
        apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
        processQueue(null, newToken);
        originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // Wyloguj użytkownika tylko jeśli refresh się nie udał
        tokenManager.handleSessionExpired();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Ukryj loader w przypadku błędu
    if (!error.config?.silent) {
      const loader = getLoader();
      if (loader) loader.hide();
    }

    // Obsługa konkretnych kodów błędów HTTP
    if (error.response) {
      switch (error.response.status) {
        case 401:
        case 403:
          if (!isRefreshing) tokenManager.handleSessionExpired();
          break;

        case 404:
          console.warn('Zasób nie został znaleziony:', error.config.url);
          break;

        case 429:
          showAlert('warning', 'Zbyt wiele zapytań. Spróbuj ponownie za chwilę.', 5000);
          break;

        case 500:
        case 502:
        case 503:
          showAlert('error', 'Wystąpił błąd serwera. Spróbuj ponownie później.', 5000);
          break;
      }
    } else if (error.request) {
      // Brak odpowiedzi od serwera
      showAlert('error', 'Brak odpowiedzi z serwera. Sprawdź połączenie internetowe.', 5000);
    }

    return Promise.reject(error);
  }
);

// Metody API dla cichych zapytań (bez loadera)
apiClient.silentGet = (url, config = {}) => originalMethods.get(url, { ...config, silent: true });

apiClient.silentPost = (url, data, config = {}) =>
  originalMethods.post(url, data, { ...config, silent: true });

apiClient.silentPut = (url, data, config = {}) =>
  originalMethods.put(url, data, { ...config, silent: true });

apiClient.silentDelete = (url, config = {}) =>
  originalMethods.delete(url, { ...config, silent: true });

apiClient.silentPatch = (url, data, config = {}) =>
  originalMethods.patch(url, data, { ...config, silent: true });

// Metody zarządzania cache
apiClient.clearCache = () => cache.clear();

apiClient.invalidateCache = (url, params = {}) => {
  const cacheKey = url + (params ? JSON.stringify(params) : '');
  cache.delete(cacheKey);
};

// Metoda do zapytań z niestandardową wiadomością loadera
apiClient.withLoaderMessage = (message) => ({
  get: (url, config = {}) => originalMethods.get(url, { ...config, loaderMessage: message }),
  post: (url, data, config = {}) =>
    originalMethods.post(url, data, { ...config, loaderMessage: message }),
  put: (url, data, config = {}) =>
    originalMethods.put(url, data, { ...config, loaderMessage: message }),
  delete: (url, config = {}) => originalMethods.delete(url, { ...config, loaderMessage: message }),
  patch: (url, data, config = {}) =>
    originalMethods.patch(url, data, { ...config, loaderMessage: message }),
});

export default apiClient;
