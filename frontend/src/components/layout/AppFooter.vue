<template>
  <footer
    class="w-full px-4 pb-4 pt-6 text-center text-xs text-gray-400 dark:text-gray-500"
    aria-label="Informacje o wersji"
  >
    <span :title="buildTitle">Aplikacja {{ appVersionLabel }}</span>
    <span class="mx-1.5">·</span>
    <span :title="dbTitle">baza pytań: {{ dbVersionLabel }}</span>
    <template v-if="dbCountLabel">
      <span class="mx-1.5">·</span>
      <span>{{ dbCountLabel }}</span>
    </template>
    <template v-if="dbUpdatedLabel">
      <span class="mx-1.5">·</span>
      <span>aktualizacja {{ dbUpdatedLabel }}</span>
    </template>
  </footer>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { fetchDbVersion, getKnownDbVersion } from '@/services/questionsSync';

const appVersion = process.env.VUE_APP_VERSION || 'dev';
const commit = process.env.VUE_APP_COMMIT || '';
const buildTime = process.env.VUE_APP_BUILD_TIME || '';

const appVersionLabel = computed(() => (commit ? `v${appVersion} (${commit})` : `v${appVersion}`));

const buildTitle = computed(() =>
  buildTime ? `Kompilacja: ${new Date(buildTime).toLocaleString('pl-PL')}` : 'Wersja aplikacji'
);

const dbInfo = ref(getKnownDbVersion());

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

onMounted(async () => {
  // Świeżość: odświeżaj co najwyżej raz na 5 minut.
  const fetchedAt = dbInfo.value && dbInfo.value.fetchedAt;
  if (!fetchedAt || Date.now() - fetchedAt > 5 * 60 * 1000) {
    try {
      dbInfo.value = { ...(await fetchDbVersion()), fetchedAt: Date.now() };
    } catch (e) {
      // Brak sieci — zostaje ostatnia znana wersja.
    }
  }
});
</script>
