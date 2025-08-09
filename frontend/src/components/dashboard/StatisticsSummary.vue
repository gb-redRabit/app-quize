<!-- filepath: d:\git nowe\app-quize\frontend\src\components\dashboard\StatisticsSummary.vue -->
<template>
  <section class="mb-3">
    <h2 class="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4 px-1">
      Twoje statystyki
      <span v-if="isLoading" class="text-sm text-gray-500 ml-2">(ładowanie...)</span>
    </h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatisticCard :value="totalQuestions" label="Wszystkich" color="blue" />
      <StatisticCard :value="correctAnswers" label="Poprawnie" color="green" />
      <StatisticCard :value="wrongAnswers" label="Błędnie" color="red" />
      <StatisticCard :value="quizCount" label="Quizy" color="indigo" />
      <StatisticCard :value="examCount" label="Egzaminy" color="purple" />
      <StatisticCard :value="avgScore" label="Średnia" color="yellow" />
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import StatisticCard from '@/components/dashboard/StatisticCard.vue';

// Inicjalizacja store
const store = useStore();
const isLoading = ref(true);
const forceRefresh = ref(0);

// Funkcja odświeżająca dane statystyk
const refreshStats = async () => {
  isLoading.value = true;
  try {
    // Pobierz najnowsze dane z serwera
    await store.dispatch('user/fetchUserHistoryAndHQ');
    await store.dispatch('questions/fetchStats');
    // Wymuś przerenderowanie
    forceRefresh.value++;
  } finally {
    isLoading.value = false;
  }
};

// Ładowanie danych na starcie
onMounted(async () => {
  window.addEventListener('user-data-refreshed', refreshStats);
  window.addEventListener('quiz-completed', refreshStats);

  // Pobierz dane na początku
  await refreshStats();
});

onUnmounted(() => {
  window.removeEventListener('user-data-refreshed', refreshStats);
  window.removeEventListener('quiz-completed', refreshStats);
});

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

  let totalScore = 0;
  let totalQuestions = 0;

  history.forEach((h) => {
    totalScore += h.score || 0;
    totalQuestions += h.total || 0;
  });

  const avg = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
  return `${avg}%`;
});
</script>
