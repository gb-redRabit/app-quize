import axios from 'axios';
import store from '../store';

// Tworzenie klienta API
const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'https://app-quize.onrender.com/api',
  // baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Implementacja prostego cachowania zapytań
const cache = new Map();
const CACHE_TTL = 1 * 60 * 1000; // 1 minuta

// Dodaj mechanizm cachowania dla metod GET
const originalGet = apiClient.get;
apiClient.get = function (url, config = {}) {
  // Jeśli zapytanie jest oznaczone jako niebuforowane lub to nie jest produkcja, nie używaj cache
  if (config.noCache || process.env.NODE_ENV !== 'production') {
    return originalGet(url, config);
  }

  const cacheKey = url + JSON.stringify(config.params || {});
  const cachedResponse = cache.get(cacheKey);

  if (cachedResponse && cachedResponse.timestamp > Date.now() - CACHE_TTL) {
    // Zwróć dane z cache
    return Promise.resolve(cachedResponse.data);
  }

  // Jeśli brak w cache lub wygasł, wykonaj zapytanie i zapisz
  return originalGet(url, config).then((response) => {
    cache.set(cacheKey, {
      data: response,
      timestamp: Date.now(),
    });
    return response;
  });
};

// Metoda do czyszczenia cache
apiClient.clearCache = function () {
  cache.clear();
};

// Metoda do usuwania konkretnego wpisu z cache
apiClient.invalidateCache = function (url, params = {}) {
  const cacheKey = url + JSON.stringify(params);
  cache.delete(cacheKey);
};

// Ulepszony mechanizm loadera - zawsze sprawdzaj dostępność i nie wywołuj wielokrotnie
let loaderActive = false;
const getLoader = () => {
  try {
    const app = document.getElementById('app')?.__vue_app__;
    if (app && app._instance && app._instance.proxy) {
      const root = app._instance.proxy;
      if (root.$refs && root.$refs.globalLoader) {
        return root.$refs.globalLoader;
      }
      if (root.$root && root.$root.$refs && root.$root.$refs.globalLoader) {
        return root.$root.$refs.globalLoader;
      }
      if (root.$showLoader) {
        return {
          show: root.$showLoader,
          hide: root.$hideLoader,
        };
      }
    }
  } catch (e) {
    console.warn('Nie można uzyskać dostępu do loadera:', e);
  }
  return null;
};

// Podobnie dla alertera
const getAlerter = () => {
  try {
    const app = document.getElementById('app')?.__vue_app__;
    if (app && app._instance && app._instance.proxy) {
      const root = app._instance.proxy;
      if (root.$alert) {
        return root.$alert;
      }
      if (root.$root && root.$root.$alert) {
        return root.$root.$alert;
      }
    }
  } catch (e) {
    console.warn('Nie można uzyskać dostępu do alertera:', e);
  }
  return null;
};

// Funkcja do automatycznego zamykania alertu po 3 sekundy
const showAutoCloseAlert = (type, message) => {
  const alert = getAlerter();
  if (alert) {
    alert(type, message, 3000); // przekazujemy duration
  }
};

// Interceptor dla zapytań
apiClient.interceptors.request.use(
  (config) => {
    // Pokaż loader dla zapytań z wyjątkiem zapytań oznaczonych jako silent
    if (!config.silent) {
      const loader = getLoader();
      if (loader && !loaderActive) {
        loader.show(config.loaderMessage || '');
        loaderActive = true;
      }
    }

    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Ukryj loader w przypadku błędu podczas tworzenia zapytania
    const loader = getLoader();
    if (loader && loaderActive) {
      loader.hide();
      loaderActive = false;
    }
    return Promise.reject(error);
  }
);

// Interceptor dla odpowiedzi
apiClient.interceptors.response.use(
  (response) => {
    // Ukryj loader po otrzymaniu odpowiedzi
    const loader = getLoader();
    if (loader && !response.config.silent && loaderActive) {
      loader.hide();
      loaderActive = false;
    }
    return response;
  },
  (error) => {
    // Ukryj loader w przypadku błędu odpowiedzi
    const loader = getLoader();
    if (loader && error.config && !error.config.silent && loaderActive) {
      loader.hide();
      loaderActive = false;
    }

    // Pokaż alert z błędem, jeśli nie jest to cicha obsługa błędu
    if (!error.config || !error.config.silentError) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            store.dispatch('user/logout').then(() => {
              showAutoCloseAlert('error', 'Twoja sesja wygasła. Zaloguj się ponownie.');
              if (window.location.pathname !== '/login') {
                window.location.href = '/login';
              }
            });
            break;
          case 403:
            showAutoCloseAlert('error', 'Brak uprawnień do wykonania tej operacji.');
            break;
          case 404:
            showAutoCloseAlert('warning', 'Nie znaleziono żądanego zasobu.');
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            showAutoCloseAlert('error', 'Wystąpił błąd serwera. Spróbuj ponownie później.');
            break;
          default:
            if (error.response.data && error.response.data.message) {
              showAutoCloseAlert('error', error.response.data.message);
            } else {
              showAutoCloseAlert('error', `Wystąpił błąd: ${error.response.status}`);
            }
        }
      } else if (error.request) {
        showAutoCloseAlert(
          'error',
          'Problem z połączeniem z serwerem. Sprawdź swoje połączenie internetowe.'
        );
      } else {
        showAutoCloseAlert('error', 'Wystąpił błąd podczas przygotowywania żądania.');
      }
    }

    return Promise.reject(error);
  }
);

// Dodaj pomocnicze metody do klienta API, aby umożliwić ciche zapytania
const originalMethods = {
  get: apiClient.get,
  post: apiClient.post,
  put: apiClient.put,
  delete: apiClient.delete,
  patch: apiClient.patch,
};

// Metoda do wykonywania cichych zapytań (bez loadera)
apiClient.silentGet = (url, config = {}) => {
  return originalMethods.get(url, { ...config, silent: true });
};

apiClient.silentPost = (url, data, config = {}) => {
  return originalMethods.post(url, data, { ...config, silent: true });
};

apiClient.silentPut = (url, data, config = {}) => {
  return originalMethods.put(url, data, { ...config, silent: true });
};

apiClient.silentDelete = (url, config = {}) => {
  return originalMethods.delete(url, { ...config, silent: true });
};

apiClient.silentPatch = (url, data, config = {}) => {
  return originalMethods.patch(url, data, { ...config, silent: true });
};

// Metoda do ustawiania niestandardowej wiadomości loadera
apiClient.withLoaderMessage = (message) => {
  return {
    get: (url, config = {}) => originalMethods.get(url, { ...config, loaderMessage: message }),
    post: (url, data, config = {}) =>
      originalMethods.post(url, data, { ...config, loaderMessage: message }),
    put: (url, data, config = {}) =>
      originalMethods.put(url, data, { ...config, loaderMessage: message }),
    delete: (url, config = {}) =>
      originalMethods.delete(url, { ...config, loaderMessage: message }),
    patch: (url, data, config = {}) =>
      originalMethods.patch(url, data, { ...config, loaderMessage: message }),
  };
};

export default apiClient;
