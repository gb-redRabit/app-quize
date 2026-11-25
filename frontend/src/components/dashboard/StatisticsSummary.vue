<!-- filepath: d:\git nowe\app-quize\frontend\src\components\dashboard\StatisticsSummary.vue -->
<template>
  <section class="mb-5">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
        Twoje statystyki
        <span v-if="isLoading" class="text-sm font-normal text-gray-500">(ładowanie…)</span>
      </h2>
      <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
        <span class="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1">
          Quizy: <strong class="text-gray-800 dark:text-gray-100">{{ quizCount }}</strong>
        </span>
        <span class="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1">
          Egzaminy: <strong class="text-gray-800 dark:text-gray-100">{{ examCount }}</strong>
        </span>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatisticCard :value="totalQuestions" label="Wszystkich" color="blue" />
      <StatisticCard :value="correctAnswers" label="Poprawnie" color="green" />
      <StatisticCard :value="wrongAnswers" label="Błędnie" color="red" />
      <StatisticCard :value="avgScore" label="Średnia" color="yellow" />
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import StatisticCard from '@/components/dashboard/StatisticCard.vue';

// Inicjalizacja store
const store = useStore();
const isLoading = ref(false);
const forceRefresh = ref(0);

// Bezpośrednio obliczane statystyki na podstawie danych ze store
const totalQuestions = computed(() => {
  forceRefresh.value; // Wymuś przeliczenie
  const categories = store.getters['questions/getCategories'] || [];
  const categoryCounts = store.getters['questions/getCategoryCounts'] || {};

  let total = 0;
  categories.forEach((cat) => {
    total += categoryCounts[cat] || 0;
  });

  return total;
});

const correctAnswers = computed(() => {
  forceRefresh.value;
  const hquestion = store.getters['user/getHquestion'] || [];
  return hquestion.filter((q) => q.correct === true).length;
});

const wrongAnswers = computed(() => {
  forceRefresh.value;
  const hquestion = store.getters['user/getHquestion'] || [];
  return hquestion.filter((q) => q.correct === false).length;
});

const quizCount = computed(() => {
  forceRefresh.value;
  const history = store.getters['user/getUserHistory'] || [];
  // Zlicz wszystkie, których typ zaczyna się od "Quiz"
  return history.filter(
    (h) => typeof h.type === 'string' && h.type.toLowerCase().startsWith('quiz')
  ).length;
});

const examCount = computed(() => {
  forceRefresh.value;
  const history = store.getters['user/getUserHistory'] || [];
  // Zlicz wszystkie, których typ zaczyna się od "Egzamin"
  return history.filter(
    (h) => typeof h.type === 'string' && h.type.toLowerCase().startsWith('egzamin')
  ).length;
});

const avgScore = computed(() => {
  forceRefresh.value;
  const history = store.getters['user/getUserHistory'] || [];

  // Filtruj tylko te, które mają co najmniej jedno pytanie
  const valid = history.filter(
    (h) => typeof h.correct === 'number' && typeof h.wrong === 'number' && h.correct + h.wrong > 0
  );
  if (!valid.length) return '0%';

  // Średnia procentowa z każdego quizu/egzaminu
  const avg = Math.round(
    valid.reduce((sum, h) => sum + (h.correct / (h.correct + h.wrong)) * 100, 0) / valid.length
  );
  return `${avg}%`;
});
</script>
