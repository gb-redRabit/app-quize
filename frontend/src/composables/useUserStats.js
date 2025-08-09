// useUserStats.js
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useStore } from 'vuex';

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

  // Statystyki dla kategorii
  const categoryStats = (cat) => {
    const all = hquestion.value.filter((q) => q.category === cat);
    const correct = all.filter((q) => q.correct === true).length;
    const wrong = all.filter((q) => q.correct === false).length;
    const categoryCounts = store.getters['questions/getCategoryCounts'] || {};
    const total = categoryCounts[cat] || 0;
    const notDone = total - all.length;
    return { correct, wrong, notDone: Math.max(0, notDone) };
  };

  const categoryPercentage = (cat) => {
    const stats = categoryStats(cat);
    const categoryCounts = store.getters['questions/getCategoryCounts'] || {};
    const total = categoryCounts[cat] || 0;
    if (total === 0) return { correct: 0, wrong: 0 };
    return {
      correct: (stats.correct / total) * 100,
      wrong: (stats.wrong / total) * 100,
    };
  };

  const categoryPercentComplete = (cat) => {
    const stats = categoryStats(cat);
    const categoryCounts = store.getters['questions/getCategoryCounts'] || {};
    const total = categoryCounts[cat] || 0;
    if (total === 0) return 0;
    return Math.round(((stats.correct + stats.wrong) / total) * 100);
  };

  const getCategoryStatus = (cat) => {
    const stats = categoryStats(cat);
    const categoryCounts = store.getters['questions/getCategoryCounts'] || {};
    const total = categoryCounts[cat] || 0;
    if (total === 0) return '';
    const percentDone = ((stats.correct + stats.wrong) / total) * 100;
    if (percentDone === 0) return 'Nowa';
    if (percentDone === 100) {
      const percentCorrect = (stats.correct / total) * 100;
      if (percentCorrect === 100) return 'Opanowana';
      if (percentCorrect >= 80) return 'Bardzo dobra';
      if (percentCorrect >= 60) return 'Dobra';
      if (percentCorrect >= 40) return 'Średnia';
      return 'Do poprawy';
    }
    if (percentDone >= 75) return 'W trakcie';
    if (percentDone >= 50) return 'Połowa';
    if (percentDone >= 25) return 'Rozpoczęta';
    return 'Nowa';
  };

  const getCategoryStatusClass = (cat) => {
    const status = getCategoryStatus(cat);
    const classes = {
      Opanowana: 'bg-green-200 text-green-900 dark:bg-green-700 dark:text-green-100',
      'Bardzo dobra': 'bg-blue-300 text-blue-900 dark:bg-blue-700 dark:text-blue-100',
      Dobra: 'bg-blue-100 text-blue-500 dark:bg-blue-500 dark:text-blue-100',
      Średnia: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100',
      'Do poprawy': 'bg-red-200 text-red-900 dark:bg-red-700 dark:text-red-100',
      'W trakcie': 'bg-blue-100 text-blue-300 dark:bg-blue-300 dark:text-blue-100',
      Połowa: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-700 dark:text-indigo-100',
      Rozpoczęta: 'bg-purple-200 text-purple-900 dark:bg-purple-700 dark:text-purple-100',
      Nowa: 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
    };
    return classes[status] || 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-100';
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
      return 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900 dark:border-emerald-500 dark:text-emerald-200';
    if (percentCorrect >= 40)
      return 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900 dark:border-amber-500 dark:text-amber-200';

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
