// useQuestions.js
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import apiClient from '@/api';
import { getCachedQuestionsByCategory } from '@/services/questionsSync';

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
    categories.value.filter((cat) => cat && !examCategories.value.includes(cat))
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

      // Offline: API zwróciło pustkę, ale mamy lokalną kopię pytań.
      if (
        (!Array.isArray(allIds) || allIds.length === 0) &&
        typeof navigator !== 'undefined' &&
        navigator.onLine === false
      ) {
        const cached = await getCachedQuestionsByCategory(cat);
        allIds = cached.map((q) => q.ID);
        if (typeof window !== 'undefined') {
          window.__idsDebug = { cat, onLine: navigator.onLine, cachedLen: cached.length };
        }
      } else if (typeof window !== 'undefined') {
        window.__idsDebug = { cat, onLine: navigator.onLine, apiLen: allIds?.length };
      }

      // Pobierz historię użytkownika dla danej kategorii
      const hquestion = store.getters['user/getHquestion'] || [];
      const hq = hquestion.filter((q) => q.category === cat);

      // Filtruj tylko pytania, które nie zostały odpowiedziane lub odpowiedziane błędnie
      const wrongOrNotDoneIds = allIds.filter((id) => {
        const entry = hq.find(
          (q) =>
            String(q.id) === String(id) ||
            String(q.ID) === String(id) ||
            String(q.question_id) === String(id)
        );
        return !entry || entry.correct === false;
      });

      return wrongOrNotDoneIds;
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
