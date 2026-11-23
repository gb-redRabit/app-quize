const API_BASE =
  process.env.VUE_APP_API_URL || 'https://app-quize.onrender.com/api';

let controller = null;
let retryTimer = null;
let retryCount = 0;
let stopped = true;

function scheduleReconnect() {
  if (stopped) return;
  const delay = Math.min(30000, 1000 * 2 ** Math.min(retryCount, 5));
  retryCount += 1;
  clearTimeout(retryTimer);
  retryTimer = setTimeout(connect, delay);
}

async function connect() {
  if (stopped) return;
  const token = sessionStorage.getItem('token');
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
  connect();
}

export function stopRealtime() {
  stopped = true;
  clearTimeout(retryTimer);
  retryTimer = null;
  if (controller) {
    controller.abort();
    controller = null;
  }
}
