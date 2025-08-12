<template>
  <div class="container mx-auto">
    <div class="relative mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <!-- Sekcja powitalna -->
      <section class="mb-4">
        <div class="flex flex-col md:flex-row gap-6 items-center">
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Witaj w systemie nauki!
            </h1>
            <p class="mt-2 text-gray-600 dark:text-gray-300">
              Monitoruj swoje postępy i kontynuuj naukę
            </p>
          </div>
          <div class="w-full flex-1 relative sm:w-auto">
            <RandomQuote />
            <!-- Przycisk pomocy -->
          </div>
        </div>
      </section>
      <IconButton
        @click="showUserGuide = true"
        class="info-icon fixed bottom-3 left-3 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
        aria-label="Pokaż instrukcję"
        title="Instrukcja obsługi"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
            clip-rule="evenodd"
          />
        </svg>
      </IconButton>
      <!-- Statystyki -->
      <StatisticsSummary class="statistics-summary" />

      <!-- Przyciski akcji -->
      <QuizButtons
        class="quiz-buttons"
        @show-exam-popup="openExamPopup"
        @show-other-quiz-popup="openOtherQuizPopup"
      />

      <!-- Lista kategorii -->
      <section>
        <CategoryFilter
          v-model:active-filter="activeFilter"
          v-model:view-type="viewType"
          v-model:grid-columns="gridColumns"
          v-model:search-query="searchQuery"
        />

        <template v-if="viewType === 'grid'">
          <div :class="gridLayoutClass">
            <CategoryCard
              v-for="cat in searchedCategories"
              :key="cat"
              :category="cat"
              :stats="categoryStats[cat] || { correct: 0, wrong: 0, notDone: 0 }"
              :show-quiz-options="showQuizOptions[cat]"
              class="categories-list"
              @toggle-quiz-options="showQuizOptions[cat] = !showQuizOptions[cat]"
              @start-quiz="startQuizNotDone"
              @start-exam="startExamNotDone"
              @go-to-questions="goToCategoryQuestions"
              @clear-history="clearCategoryHistory"
            />
          </div>
        </template>

        <template v-else>
          <CategoryList
            :categories="searchedCategories"
            :show-quiz-options="showQuizOptions"
            @toggle-quiz-options="(cat) => (showQuizOptions[cat] = !showQuizOptions[cat])"
            @start-quiz="startQuizNotDone"
            @start-exam="startExamNotDone"
            @go-to-questions="goToCategoryQuestions"
            @clear-history="clearCategoryHistory"
          />
        </template>
      </section>
    </div>

    <!-- Modalne okna -->
    <ExamCategoriesModal
      :show="showExamPopup"
      :categories="questionsHelper.examCategories.value"
      :categoryStats="categoryStats"
      @close="showExamPopup = false"
      @select-category="startExamFromCategory"
    />

    <OtherQuizCategoriesModal
      :show="showOtherQuizPopup"
      :categories="questionsHelper.otherCategories.value"
      :categoryStats="categoryStats"
      @close="showOtherQuizPopup = false"
      @start-quiz="startQuizNotDone"
    />

    <UserGuide :show="showUserGuide" @close="showUserGuide = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject, watch, defineAsyncComponent } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import apiClient from '@/api';

// Komponenty
const StatisticsSummary = defineAsyncComponent(
  () => import('@/components/dashboard/StatisticsSummary.vue')
);
const RandomQuote = defineAsyncComponent(() => import('@/components/dashboard/RandomQuote.vue'));
const QuizButtons = defineAsyncComponent(() => import('@/components/dashboard/QuizButtons.vue'));
const CategoryFilter = defineAsyncComponent(
  () => import('@/components/dashboard/CategoryFilter.vue')
);
const CategoryCard = defineAsyncComponent(() => import('@/components/dashboard/CategoryCard.vue'));

const CategoryList = defineAsyncComponent(() => import('@/components/dashboard/CategoryList.vue'));
const ExamCategoriesModal = defineAsyncComponent(
  () => import('@/components/quiz/ExamCategoriesModal.vue')
);
const OtherQuizCategoriesModal = defineAsyncComponent(
  () => import('@/components/quiz/OtherQuizCategoriesModal.vue')
);
const UserGuide = defineAsyncComponent(() => import('@/components/UserGuide.vue'));
const IconButton = defineAsyncComponent(() => import('@/components/base/IconButton.vue'));

// Hooki
const showAlert = inject('showAlert');
const router = useRouter();
const store = useStore(); // Inicjalizuj store na najwyższym poziomie
const route = useRoute();

// Utworzenie lokalnych obiektów pomocniczych (zamiast composables)
const questionsHelper = (() => {
  const categories = computed(() => store.getters['questions/getCategories'] || []);
  const categoryCounts = computed(() => store.getters['questions/getCategoryCounts'] || {});
  const hiddenCategory = computed(() => store.getters['user/getUser'].hiddenCategory || []);

  const examCategories = computed(() =>
    categories.value.filter((cat) => cat && cat.toLowerCase().includes('egzamin'))
  );

  const otherCategories = computed(() =>
    categories.value.filter(
      (cat) => cat && !examCategories.value.includes(cat) && !cat.startsWith('TP')
    )
  );

  const lawTestCategories = computed(() =>
    categories.value.filter((cat) => cat && cat.startsWith('TP'))
  );

  const getQuestionIdsForQuiz = async (cat) => {
    try {
      // Pobierz wszystkie pytania z kategorii
      const res = await store.dispatch('questions/fetchQuestionsByCategory', cat);
      const questions = res;
      const allIds = questions.map((q) => q.ID || q.id || q.Id || q.id_question);

      // Pobierz historię użytkownika dla danej kategorii
      const hquestion = store.getters['user/getHquestion'] || [];
      const hq = hquestion.filter((q) => q.category === cat);

      // Filtruj tylko pytania, które nie zostały odpowiedziane lub odpowiedziane błędnie
      return allIds.filter((id) => {
        const entry = hq.find(
          (q) =>
            String(q.id) === String(id) ||
            String(q.ID) === String(id) ||
            String(q.question_id) === String(id)
        );
        return !entry || entry.correct === false;
      });
    } catch (e) {
      console.error('Błąd pobierania pytań dla quizu:', e);
      return [];
    }
  };

  return {
    categories,
    categoryCounts,
    examCategories,
    otherCategories,
    lawTestCategories,
    hiddenCategory,
    getQuestionIdsForQuiz,
  };
})();

// Stan lokalny
const showExamPopup = ref(false);
const showOtherQuizPopup = ref(false);
const showQuizOptions = ref({});
const activeFilter = ref('all');
const viewType = ref('grid');
const gridColumns = ref(3);
const searchQuery = ref('');
const showUserGuide = ref(false);

// Sprawdź, czy użytkownik widział już instrukcję
onMounted(() => {
  if (!localStorage.getItem('userGuideSeen')) {
    showUserGuide.value = true;
    localStorage.setItem('userGuideSeen', '1');
  }
});

const categoryStats = computed(() => {
  const stats = {};
  const categories = questionsHelper.categories.value;
  const hquestion = store.getters['user/getHquestion'] || [];
  const categoryCounts = questionsHelper.categoryCounts.value;

  if (!categories || !categories.length) return {};

  for (const category of categories) {
    const totalQuestions = categoryCounts[category] || 0;
    const categoryHistory = hquestion.filter((q) => q.category === category);
    const correctAnswers = categoryHistory.filter((q) => q.correct === true).length;
    const wrongAnswers = categoryHistory.length - correctAnswers;
    const notDone = totalQuestions - categoryHistory.length;

    stats[category] = {
      correct: correctAnswers,
      wrong: wrongAnswers,
      notDone: Math.max(0, notDone),
    };
  }
  return stats;
});

// Obliczone właściwości
const filteredCategories = computed(() => {
  if (activeFilter.value === 'exam')
    return questionsHelper.examCategories.value.slice().sort((a, b) => a.localeCompare(b));
  if (activeFilter.value === 'other')
    return questionsHelper.otherCategories.value.slice().sort((a, b) => a.localeCompare(b));
  if (activeFilter.value === 'lawtest')
    return questionsHelper.lawTestCategories.value.slice().sort((a, b) => a.localeCompare(b));
  return questionsHelper.categories.value;
});

const searchedCategories = computed(() => {
  const hidden = questionsHelper.hiddenCategory.value || [];
  return filteredCategories.value
    .filter((cat) => !hidden.includes(cat))
    .filter(
      (cat) => !searchQuery.value || cat.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

const gridLayoutClass = computed(() => {
  switch (gridColumns.value) {
    case 2:
      return 'grid grid-cols-1 md:grid-cols-2 gap-4';
    case 4:
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4';
    default:
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
  }
});

// Metody
const openExamPopup = () => {
  showExamPopup.value = true;
};

const openOtherQuizPopup = () => {
  showOtherQuizPopup.value = true;
};

const startExamFromCategory = (cat) => {
  showExamPopup.value = false;
  const max = questionsHelper.categoryCounts.value[cat] || 10;
  router.push({ name: 'QuizView', query: { length: max, categories: cat } });
};

const goToCategoryQuestions = async (cat) => {
  try {
    await router.push({ name: 'CategoryQuestions', params: { category: cat } });
  } catch (e) {
    showAlert('error', 'Błąd ładowania pytań z kategorii');
  }
};

const startQuizNotDone = async (cat, limit = 150) => {
  if (typeof showAlert === 'function') showAlert('info', 'Przygotowywanie quizu...');
  try {
    const idsToUse = await questionsHelper.getQuestionIdsForQuiz(cat);

    if (!idsToUse.length) {
      showAlert('warning', 'Brak pytań do quizu w tej kategorii.');
      return;
    }

    const length = limit === 0 ? idsToUse.length : Math.min(limit, idsToUse.length);

    router.push({
      name: 'QuizView',
      query: {
        length,
        categories: cat,
        onlyNotDone: 'true', // Upewnij się, że ten parametr ma wartość string 'true'
        ids: idsToUse.join(','),
        r: Math.random().toString(36).substring(2, 8), // Zapobiega buforowaniu
      },
    });
  } catch (e) {
    console.error('Error fetching questions for quiz:', e);
    showAlert('error', 'Błąd pobierania pytań z serwera.');
  }
};

const startExamNotDone = async (cat) => {
  try {
    const idsToUse = await questionsHelper.getQuestionIdsForQuiz(cat);
    const length = Math.min(150, idsToUse.length);
    router.push({
      name: 'ExamView',
      query: { length, categories: cat, time: 60, onlyNotDone: true, ids: idsToUse.join(',') },
    });
  } catch (e) {
    showAlert('error', 'Błąd pobierania pytań z serwera.');
  }
};

// ZASTĄP ISTNIEJĄCĄ FUNKCJĘ clearCategoryHistory
async function clearCategoryHistory(category) {
  showAlert('info', `Czyszczenie historii dla kategorii: "${category}"...`);

  // 1. Optymistyczna aktualizacja UI poprzez zmianę w store.
  // `categoryStats` (computed) automatycznie przeliczy się i odświeży widok.
  store.commit('user/CLEAR_CATEGORY_HISTORY_OPTIMISTIC', category);

  // 2. Aktualizacja sessionStorage, aby stan przetrwał odświeżenie strony.
  const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
  if (userData.hquestion) {
    // Upewniamy się, że modyfikujemy TYLKO hquestion, a nie główną historię
    userData.hquestion = userData.hquestion.filter((q) => q.category !== category);
    sessionStorage.setItem('user', JSON.stringify(userData));
  }

  try {
    // 3. Wywołaj API w tle. Nie czekamy na wynik, aby UI było responsywne.
    const success = await store.dispatch('user/clearCategoryHistory', { category });
    if (success) {
      showAlert('success', `Historia kategorii "${category}" została wyczyszczona.`);
    } else {
      throw new Error('Serwer nie potwierdził usunięcia danych.');
    }
  } catch (e) {
    // 4. W razie błędu API, przywróć prawdziwy stan z serwera.
    console.error('Błąd podczas czyszczenia historii kategorii:', e);
    showAlert('error', 'Nie udało się wyczyścić historii. Przywracanie stanu...');
    await refreshAllData();
  }
}

// ZASTĄP ISTNIEJĄCĄ FUNKCJĘ refreshAllData
const refreshAllData = async () => {
  try {
    // Przed odświeżeniem danych
    await apiClient.clearCache();
    await Promise.all([
      store.dispatch('user/fetchUserHistoryAndHQ'),
      store.dispatch('questions/fetchStats'),
    ]);
  } catch (e) {
    console.error('Błąd podczas odświeżania danych:', e);
    showAlert('error', 'Nie udało się zaktualizować danych.');
  }
};

// ZASTĄP ISTNIEJĄCE onMounted i onUnmounted
onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange);
  // Nasłuchuj na zdarzenie zakończenia quizu, aby odświeżyć dane
  window.addEventListener('quiz-completed', refreshAllData);
});

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('quiz-completed', refreshAllData);
});

// ZASTĄP istniejący watcher
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/') {
      refreshAllData();
    }
  },
  { immediate: true } // `immediate: true` uruchomi watcher od razu po załadowaniu komponentu
);

// USUŃ hook onBeforeMount

// Zmodyfikuj handleVisibilityChange
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible' && route.path === '/') {
    console.log('Karta aktywowana - odświeżanie danych.');
    refreshAllData();
  }
};

// ... reszta kodu ...
</script>

<style scoped></style>
