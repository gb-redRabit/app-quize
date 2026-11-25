<template>
  <footer
    class="w-full px-4 pb-4 pt-6 text-center text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center justify-center gap-x-2 gap-y-1"
    aria-label="Informacje o wersji"
  >
    <span :title="buildTitle">Aplikacja {{ appVersionLabel }}</span>
    <span aria-hidden="true">·</span>
    <span :title="dbTitle">baza pytań: {{ dbVersionLabel }}</span>
    <template v-if="dbCountLabel">
      <span aria-hidden="true">·</span>
      <span>{{ dbCountLabel }}</span>
    </template>
    <template v-if="dbUpdatedLabel">
      <span aria-hidden="true">·</span>
      <span>aktualizacja {{ dbUpdatedLabel }}</span>
    </template>

    <span v-if="pendingCount > 0" aria-hidden="true">·</span>
    <span
      v-if="pendingCount > 0"
      class="inline-flex items-center gap-1.5 text-yellow-700 dark:text-yellow-400"
      role="status"
      aria-live="polite"
    >
      <span
        class="inline-block h-2 w-2 rounded-full bg-yellow-500"
        aria-hidden="true"
      ></span>
      {{ pendingCount }} {{ pendingCount === 1 ? 'zmiana czeka' : 'zmiany czekają' }} na wysłanie
      <button
        v-if="isOnline"
        type="button"
        class="ml-1 underline underline-offset-2 hover:no-underline disabled:opacity-50"
        :disabled="sending"
        @click="sendNow"
      >
        {{ sending ? 'wysyłanie…' : 'wyślij teraz' }}
      </button>
    </span>
  </footer>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { fetchDbVersion, getKnownDbVersion } from '@/services/questionsSync';
import { flushOfflineQueue } from '@/services/offlineSync';
import { queueSize } from '@/utils/offlineQueue';

const appVersion = __APP_VERSION__ || 'dev';
const commit = __APP_COMMIT__ || '';
const buildTime = __APP_BUILD_TIME__ || '';

const appVersionLabel = computed(() => (commit ? `v${appVersion} (${commit})` : `v${appVersion}`));

const buildTitle = computed(() =>
  buildTime ? `Kompilacja: ${new Date(buildTime).toLocaleString('pl-PL')}` : 'Wersja aplikacji'
);

const dbInfo = ref(getKnownDbVersion());
const pendingCount = ref(queueSize());
const sending = ref(false);
const isOnline = ref(typeof navigator === 'undefined' ? true : navigator.onLine);

const dbVersionLabel = computed(() =>
  dbInfo.value && dbInfo.value.version != null ? String(dbInfo.value.version) : '—'
);

const dbCountLabel = computed(() => {
  const count = dbInfo.value && dbInfo.value.count;
  return typeof count === 'number' ? `${count.toLocaleString('pl-PL')} pytań` : '';
});

const dbUpdatedLabel = computed(() => {
  const updatedAt = dbInfo.value && dbInfo.value.updatedAt;
  if (!updatedAt) return '';
  return new Date(updatedAt).toLocaleString('pl-PL', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
});

const dbTitle = computed(() => 'Numer wersji bazy pytań na serwerze');

function refreshPending() {
  pendingCount.value = queueSize();
}

function updateOnlineState() {
  isOnline.value = navigator.onLine;
}

async function sendNow() {
  if (sending.value) return;
  sending.value = true;
  try {
    await flushOfflineQueue();
  } finally {
    sending.value = false;
    refreshPending();
  }
}

onMounted(async () => {
  window.addEventListener('offline-queue-changed', refreshPending);
  window.addEventListener('online', updateOnlineState);
  window.addEventListener('offline', updateOnlineState);

  // Świeżość wersji bazy: odświeżaj co najwyżej raz na 5 minut.
  const fetchedAt = dbInfo.value && dbInfo.value.fetchedAt;
  if (!fetchedAt || Date.now() - fetchedAt > 5 * 60 * 1000) {
    try {
      dbInfo.value = { ...(await fetchDbVersion()), fetchedAt: Date.now() };
    } catch (e) {
      // Brak sieci — zostaje ostatnia znana wersja.
    }
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('offline-queue-changed', refreshPending);
  window.removeEventListener('online', updateOnlineState);
  window.removeEventListener('offline', updateOnlineState);
});
</script>
