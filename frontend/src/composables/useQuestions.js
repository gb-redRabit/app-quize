// useQuestions.js
import { computed } from 'vue';
import { useStore } from 'vuex';
import {
  getCachedQuestionIdsByCategory,
} from '@/services/questionsSync';
import { filterWrongOrNotDone } from '@/utils/wrongOrNotDone';

export function useQuestions() {
  const store = useStore();

  // Stan i gettery
  const categoryCounts = computed(() => store.getters['questions/getCategoryCounts'] || {});
  const categories = computed(() =>
    (store.getters['questions/getCategories'] || []).sort((a, b) => a.localeCompare(b))
  );
  const hiddenCategory = computed(() => store.getters['user/getUser'].hiddenCategory || []);

  // Filtrowane kategorie
  const examCategories = computed(() =>
    categories.value.filter((cat) => cat && cat.toLowerCase().includes('egzamin'))
  );

  const otherCategories = computed(() =>
    categories.value.filter(
      (cat) => cat && !examCategories.value.includes(cat) && !cat.startsWith('TP')
    )
  );

  const lawTestCategories = computed(() =>
    categories.value.filter((cat) => cat && cat.startsWith('TP:'))
  );

  // Metody
  const refreshStats = async () => {
    return await store.dispatch('questions/fetchStats');
  };

  const fetchQuestionsByCategory = async (category) => {
    return await store.dispatch('questions/fetchQuestionsByCategory', category);
  };

  const getQuestionIdsForQuiz = async (cat) => {
    try {
      // Pobierz tylko ID pytań z kategorii (bez pełnych treści i odpowiedzi)
      let allIds = await store.dispatch('questions/fetchQuestionIdsByCategory', cat);

      // Offline lub błąd API: użyj lokalnej kopii z IndexedDB.
      if (!Array.isArray(allIds) || allIds.length === 0) {
        allIds = await getCachedQuestionIdsByCategory(cat);
      }

      // Jedno przejście po odpowiedziach (Set) zamiast filter + find.
      return filterWrongOrNotDone(
        allIds,
        store.getters['user/getHquestion'] || [],
        cat
      );
    } catch (e) {
      console.error('Błąd pobierania pytań dla quizu:', e);
      return [];
    }
  };

  // Zwracane API
  return {
    categories,
    categoryCounts,
    examCategories,
    otherCategories,
    lawTestCategories,
    hiddenCategory,
    refreshStats,
    fetchQuestionsByCategory,
    getQuestionIdsForQuiz,
  };
}
