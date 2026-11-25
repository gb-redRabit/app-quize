import apiClient from '@/api';
import { getToken, setToken } from '@/utils/authStorage';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const REFRESH_THRESHOLD_S = 10 * 60;

let started = false;
let inFlight = false;

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
  } catch {
    return null;
  }
}

function secondsLeft(token) {
  const decoded = parseJwt(token);
  if (!decoded?.exp) return null;
  return decoded.exp - Math.floor(Date.now() / 1000);
}

async function refreshIfNeeded() {
  const token = getToken();
  if (!token || inFlight) return;

  const remaining = secondsLeft(token);
  // Token bez `exp` (lub uszkodzony) nie jest odświeżany — interceptor obsłuży 401.
  if (remaining === null || remaining > REFRESH_THRESHOLD_S) return;

  inFlight = true;
  try {
    const res = await apiClient.silentPost('/auth/refresh', {});
    if (res.data?.token) {
      setToken(res.data.token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    }
  } catch {
    // Nie wylogowujemy tutaj — 401 obsługuje interceptor odpowiedzi.
  } finally {
    inFlight = false;
  }
}

function debounce(fn, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

/**
 * Jedyne miejsce odświeżania tokenu: interwał + powrót do karty,
 * odzyskanie sieci i aktywność w quizie/egzaminie.
 */
export function startTokenRefresh() {
  if (started) return;
  started = true;

  setInterval(refreshIfNeeded, REFRESH_INTERVAL_MS);
  window.addEventListener('focus', refreshIfNeeded);
  window.addEventListener('online', refreshIfNeeded);
  window.addEventListener('quiz-activity', debounce(refreshIfNeeded, 5000));
  refreshIfNeeded();
}
