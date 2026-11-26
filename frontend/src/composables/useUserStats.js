// useUserStats.js
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useStore } from 'vuex';
import { getCategoryMasteryStatus } from '@/utils/categoryStatus';

export function useUserStats() {
  const store = useStore();
  const forceRefresh = ref(0);

  // Dane użytkownika
  const hquestion = computed(() => store.getters['user/getHquestion'] || []);
  const userHistory = computed(() => store.getters['user/getUserHistory'] || []);
  const questionsCount = computed(() => {
    const categoryCounts = store.getters['questions/getCategoryCounts'] || {};
    return Object.values(categoryCounts).reduce((a, b) => a + b, 0);
  });

  // Statystyki odpowiedzi
  const hqStats = computed(() => {
    forceRefresh.value; // Wymuś przeliczenie
    const hq = hquestion.value;
    const done = hq.length;
    const correct = hq.filter((q) => q.correct === true).length;
    const wrong = hq.filter((q) => q.correct !== true).length;
    const notDone = questionsCount.value - done;
    return { done, correct, wrong, notDone: Math.max(0, notDone) };
  });

  // Statystyki historii
  const historyStats = computed(() => {
    forceRefresh.value; // Wymuś przeliczenie
    const onlyMain = userHistory.value.filter((h) => h.type === 'quiz' || h.type === 'egzamin');
    const quizCount = userHistory.value.filter((h) => h.type === 'quiz').length;
    const examCount = userHistory.value.filter((h) => h.type === 'egzamin').length;
    let avg = 0;
    if (onlyMain.length) {
      const sum = onlyMain.reduce((acc, h) => {
        const total = (h.correct || 0) + (h.wrong || 0);
        return total > 0 ? acc + Math.round(((h.correct || 0) / total) * 100) : acc;
      }, 0);
      avg = Math.round(sum / onlyMain.length);
    }
    return { quizCount, examCount, avg };
  });

  // Statystyki dla kategorii — jedna mapa liczona w jednym przebiegu.
  // Wcześniej każde wywołanie filtrowało całe hquestion (O(C×H) na render).
  const categoryStatsMap = computed(() => {
    forceRefresh.value; // Wymuś przeliczenie
    const counts = store.getters['questions/getCategoryCounts'] || {};
    const map = {};

    for (const q of hquestion.value) {
      if (!q || !q.category) continue;
      if (!map[q.category]) map[q.category] = { correct: 0, wrong: 0, done: 0 };
      map[q.category].done += 1;
      if (q.correct === true) map[q.category].correct += 1;
      else if (q.correct === false) map[q.category].wrong += 1;
    }

    for (const category of Object.keys(counts)) {
      if (!map[category]) map[category] = { correct: 0, wrong: 0, done: 0 };
    }

    for (const category of Object.keys(map)) {
      const total = counts[category] || 0;
      map[category].total = total;
      map[category].notDone = Math.max(0, total - map[category].done);
    }

    return map;
  });

  const categoryStats = (cat) => {
    return categoryStatsMap.value[cat] || { correct: 0, wrong: 0, notDone: 0, total: 0 };
  };

  const categoryPercentage = (cat) => {
    const stats = categoryStats(cat);
    const total = stats.total || 0;
    if (total === 0) return { correct: 0, wrong: 0 };
    return {
      correct: (stats.correct / total) * 100,
      wrong: (stats.wrong / total) * 100,
    };
  };

  const categoryPercentComplete = (cat) => {
    const stats = categoryStats(cat);
    const total = stats.total || 0;
    if (total === 0) return 0;
    return Math.round(((stats.correct + stats.wrong) / total) * 100);
  };

  const getCategoryStatus = (cat) => {
    const stats = categoryStats(cat);
    const categoryCounts = store.getters['questions/getCategoryCounts'] || {};
    const total = categoryCounts[cat] || 0;
    if (total === 0) return '';

    const mastery = getCategoryMasteryStatus(stats, total);
    if (mastery === 'new') return 'Nowa';
    if (mastery === 'mastered') return 'Opanowana';
    return 'W trakcie';
  };

  const getCategoryStatusClass = (cat) => {
    const status = getCategoryStatus(cat);
    const classes = {
      Opanowana: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'W trakcie': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      Nowa: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    };
    return classes[status] || classes['Nowa'];
  };

  const getCategoryCardClass = (cat) => {
    const stats = categoryStats(cat);
    const categoryCounts = store.getters['questions/getCategoryCounts'] || {};
    const total = categoryCounts[cat] || 0;
    if (total === 0) return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    const percentDone = ((stats.correct + stats.wrong) / total) * 100;
    const percentCorrect =
      stats.correct > 0 ? (stats.correct / (stats.correct + stats.wrong)) * 100 : 0;

    if (percentDone === 0)
      return 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600';
    if (stats.correct === total)
      return 'bg-green-200 border-green-500 shadow-lg text-green-900 dark:bg-green-800 dark:border-green-600 dark:text-green-100';
    if (stats.wrong === total)
      return 'bg-red-200 border-red-500 shadow-lg text-red-900 dark:bg-red-800 dark:border-red-600 dark:text-red-100';
    if (percentDone > 50 && percentCorrect > 70)
      return 'bg-green-100 border-green-400 shadow-md text-green-800 dark:bg-green-900 dark:border-green-500 dark:text-green-200';
    if (percentDone > 50 && percentCorrect >= 40)
      return 'bg-yellow-100 border-yellow-400 shadow-md text-yellow-800 dark:bg-yellow-900 dark:border-yellow-500 dark:text-yellow-200';
    if (percentDone > 50)
      return 'bg-red-100 border-red-400 shadow-md text-red-800 dark:bg-red-900 dark:border-red-500 dark:text-red-200';
    if (percentCorrect > 70)
      return 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-500 dark:text-green-200';
    if (percentCorrect >= 40)
      return 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-500 dark:text-yellow-200';

    return 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900 dark:border-orange-500 dark:text-orange-200';
  };

  // Metody
  const refreshData = async () => {
    return await store.dispatch('user/fetchUserHistoryAndHQ');
  };

  const refreshStats = async () => {
    await store.dispatch('user/fetchUserHistoryAndHQ');
    forceRefresh.value++;
  };

  // Obsługa zdarzeń
  onMounted(() => {
    window.addEventListener('quiz-completed', () => forceRefresh.value++);
    window.addEventListener('user-data-refreshed', () => forceRefresh.value++);
  });

  onUnmounted(() => {
    window.removeEventListener('quiz-completed', () => forceRefresh.value++);
    window.removeEventListener('user-data-refreshed', () => forceRefresh.value++);
  });

  // Zwracane API
  return {
    hquestion,
    userHistory,
    questionsCount,
    hqStats,
    historyStats,
    categoryStats,
    categoryPercentage,
    categoryPercentComplete,
    getCategoryStatus,
    getCategoryStatusClass,
    getCategoryCardClass,
    refreshData,
    refreshStats,
  };
}
