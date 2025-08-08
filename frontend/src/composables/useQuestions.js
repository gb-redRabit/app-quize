// useQuestions.js
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import apiClient from '@/api';

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
      // Pobierz wszystkie pytania z kategorii
      const questions = await fetchQuestionsByCategory(cat);
      const allIds = questions.map((q) => q.ID || q.id || q.Id || q.id_question);

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
