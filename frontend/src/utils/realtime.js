import { getToken } from '@/utils/authStorage';

const API_BASE =
  import.meta.env.VITE_API_URL || 'https://app-quize.onrender.com/api';

let controller = null;
let retryTimer = null;
let retryCount = 0;
let stopped = true;
let onlineHandler = null;

function scheduleReconnect() {
  if (stopped) return;
  const delay = Math.min(30000, 1000 * 2 ** Math.min(retryCount, 5));
  retryCount += 1;
  clearTimeout(retryTimer);
  retryTimer = setTimeout(connect, delay);
}

async function connect() {
  if (stopped) return;

  // Offline: nie próbuj łączyć się z SSE (mniej błędów w konsoli).
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    scheduleReconnect();
    return;
  }

  const token = getToken();
  if (!token) {
    scheduleReconnect();
    return;
  }

  controller = new AbortController();

  try {
    const response = await fetch(`${API_BASE}/events`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`SSE HTTP ${response.status}`);
    }

    retryCount = 0;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const chunks = buffer.split('\n\n');
      buffer = chunks.pop() || '';

      for (const chunk of chunks) {
        const dataLine = chunk
          .split('\n')
          .find((line) => line.startsWith('data:'));
        if (!dataLine) continue;
        try {
          const payload = JSON.parse(dataLine.slice(5).trim());
          const eventName = payload.userId ? 'user-updated' : 'questions-changed';
          window.dispatchEvent(new CustomEvent(eventName, { detail: payload }));
        } catch (e) {
          // Ignoruj niepoprawne ramki SSE.
        }
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') return;
  }

  scheduleReconnect();
}

export function startRealtime() {
  if (!stopped) return;
  stopped = false;
  retryCount = 0;

  if (typeof window !== 'undefined' && !onlineHandler) {
    onlineHandler = () => {
      if (stopped) return;
      clearTimeout(retryTimer);
      retryTimer = null;
      retryCount = 0;
      connect();
    };
    window.addEventListener('online', onlineHandler);
  }

  connect();
}

export function stopRealtime() {
  stopped = true;
  clearTimeout(retryTimer);
  retryTimer = null;
  if (onlineHandler && typeof window !== 'undefined') {
    window.removeEventListener('online', onlineHandler);
    onlineHandler = null;
  }
  if (controller) {
    controller.abort();
    controller = null;
  }
}
