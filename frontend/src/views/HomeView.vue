<template>
  <div class="container mx-auto">
    <div class="relative mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <!-- Sekcja powitalna -->
      <section class="mb-4">
        <div class="flex flex-col md:flex-row gap-6 items-center">
          <div class="flex-1 w-full">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100">
                  Witaj w systemie nauki!
                </h1>
                <p class="mt-2 text-gray-600 dark:text-gray-300">
                  Monitoruj swoje postępy i kontynuuj naukę
                </p>
              </div>
              <IconButton
                @click="showUserGuide = true"
                class="shrink-0 w-11 h-11 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
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
            </div>
          </div>
          <div class="w-full flex-1 relative sm:w-auto">
            <RandomQuote />
          </div>
        </div>
      </section>

      <section v-if="savedQuiz" class="mb-4">
        <div
          class="rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 shadow-sm"
        >
          <div class="flex-1 min-w-0">
            <p class="text-xs uppercase tracking-wide text-yellow-800">Niezakończona sesja</p>
            <p class="text-lg font-semibold truncate">
              {{ savedQuiz.label }} · pytanie {{ savedQuiz.index + 1 }} z {{ savedQuiz.total }}
            </p>
            <p class="text-sm text-yellow-800">
              Odpowiedzi: {{ savedQuiz.answered }} ·
              <template v-if="savedQuiz.remainingMinutes">
                pozostało {{ savedQuiz.remainingMinutes }} min ·
              </template>
              postęp zapisany lokalnie
            </p>
          </div>
          <button
            class="h-12 px-5 rounded-lg bg-white text-yellow-800 font-semibold hover:bg-yellow-50 transition-colors shrink-0"
            @click="resumeSavedQuiz"
          >
            Wznów
          </button>
        </div>
      </section>

      <section v-if="lastActivity" class="mb-4">
        <div
          class="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 shadow-sm"
        >
          <div class="flex-1 min-w-0">
            <p class="text-xs uppercase tracking-wide text-blue-100">Kontynuuj naukę</p>
            <p class="text-lg font-semibold truncate">{{ lastActivity.category }}</p>
            <p class="text-sm text-blue-100">
              {{ lastActivityLabel }} · {{ lastActivityPercent }}%
            </p>
          </div>
          <button
            class="h-12 px-5 rounded-lg bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-colors shrink-0"
            @click="continueLastActivity"
            :aria-label="`Rozpocznij nową sesję: ${lastActivity.category}`"
          >
            Rozpocznij
          </button>
        </div>
      </section>

      <section v-else class="mb-4">
        <div
          class="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 shadow-sm"
        >
          <div class="flex-1 min-w-0">
            <p class="text-xs uppercase tracking-wide text-blue-100">Zacznij naukę</p>
            <p class="text-lg font-semibold">Wybierz kategorię i rozpocznij quiz</p>
            <p class="text-sm text-blue-100">Twoje postępy będą zapisywane automatycznie.</p>
          </div>
          <button
            class="h-12 px-5 rounded-lg bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-colors shrink-0"
            @click="scrollToCategories"
          >
            Wybierz kategorię
          </button>
        </div>
      </section>

      <!-- Statystyki -->
      <StatisticsSummary class="statistics-summary" />

      <!-- Przyciski akcji -->
      <QuizButtons
        class="quiz-buttons"
        @show-exam-popup="openExamPopup"
        @show-other-quiz-popup="openOtherQuizPopup"
      />

      <!-- Lista kategorii -->
      <section id="categories">
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
import { ref, computed, inject, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
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
      // Pobierz tylko ID pytań z kategorii (bez pełnych treści)
      const allIds = await store.dispatch('questions/fetchQuestionIdsByCategory', cat);

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

const lastActivity = computed(() => {
  const history = [...(store.getters['user/getUserHistory'] || [])];
  return (
    history
      .filter((h) => h && h.category && h.category !== 'all' && h.data)
      .sort((a, b) => new Date(b.data) - new Date(a.data))[0] || null
  );
});

const lastActivityLabel = computed(() => {
  const type = String(lastActivity.value?.type || '').toLowerCase();
  return type.startsWith('egzamin') ? 'Egzamin' : 'Quiz';
});

const lastActivityPercent = computed(() => {
  const item = lastActivity.value;
  if (!item) return 0;
  const total = (item.correct || 0) + (item.wrong || 0);
  return total > 0 ? Math.round(((item.correct || 0) / total) * 100) : 0;
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
  // Modal „Wybierz egzamin” ma startować egzamin (timer, tylko niezrobione),
  // a nie quiz — wcześniej trafiał do QuizView bez trybu egzaminu.
  startExamNotDone(cat);
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
      query: {
        length,
        categories: cat,
        time: 60,
        onlyNotDone: true,
        ids: idsToUse.join(','),
        r: Math.random().toString(36).substring(2, 8),
      },
    });
  } catch (e) {
    showAlert('error', 'Błąd pobierania pytań z serwera.');
  }
};

const continueLastActivity = () => {
  if (!lastActivity.value) return;
  const cat = lastActivity.value.category;
  if (String(lastActivity.value.type).toLowerCase().startsWith('egzamin')) {
    startExamNotDone(cat);
  } else {
    startQuizNotDone(cat);
  }
};

// Niezakończona sesja quizu/egzaminu zapisana przez QuizExamView.
function readSavedQuiz() {
  try {
    const raw = localStorage.getItem('quiz-progress');
    if (!raw) return null;
    const data = JSON.parse(raw);
    const [routeName] = String(data.signature || '').split('|');
    const url = data.url || String(data.signature || '').split('|')[1] || '';
    if (!url || (routeName !== 'QuizView' && routeName !== 'ExamView')) return null;
    const answered = (data.answersStatus || []).filter((a) => a.answered).length;
    const index = Number(data.currentIndex) || 0;
    // Pusty quiz nie ma czego wznawiać; egzamin ma też upływający czas.
    if (answered === 0 && index === 0 && routeName !== 'ExamView') return null;

    // Ile czasu zostało w egzaminie — liczone tak samo jak w widoku egzaminu.
    let remainingMinutes = null;
    if (routeName === 'ExamView') {
      const startedAt = Number(data.examStartedAt);
      const timeLimit = Number(data.examTimeLimit);
      if (Number.isFinite(startedAt) && startedAt > 0 && Number.isFinite(timeLimit) && timeLimit > 0) {
        const left = timeLimit - Math.floor((Date.now() - startedAt) / 1000);
        if (left <= 0) return null;
        remainingMinutes = Math.floor(left / 60);
      } else if (typeof data.timeLeft === 'number') {
        const left = data.timeLeft - Math.floor((Date.now() - Number(data.savedAt || Date.now())) / 1000);
        if (left <= 0) return null;
        remainingMinutes = Math.floor(left / 60);
      }
    }

    return {
      url,
      answered,
      index,
      total: (data.ids || []).length || (data.answersStatus || []).length,
      label: routeName === 'ExamView' ? 'Egzamin' : 'Quiz',
      remainingMinutes,
    };
  } catch (e) {
    return null;
  }
}

const savedQuiz = ref(readSavedQuiz());

function resumeSavedQuiz() {
  if (!savedQuiz.value) return;
  // Pełne przeładowanie (a nie SPA push) gwarantuje, że stan zostanie
  // odtworzony w świeżo zamontowanym widoku quizu.
  window.location.assign(savedQuiz.value.url);
}

function scrollToCategories() {
  const el = document.getElementById('categories');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

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

// Odświeżanie po zakończeniu quizu obsługuje QuizExamView (jeden raz),
// a widoki korzystają ze store. Nie dublujemy requestów na Home.
</script>

<style scoped></style>
