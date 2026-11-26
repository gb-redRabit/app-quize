<template>
  <div class="app-shell">
    <div class="relative space-y-5">
      <PageHeader
        eyebrow="Twój pulpit"
        :title="`Cześć, ${userName}!`"
        subtitle="Kontynuuj naukę i sprawdzaj swoje postępy w jednym miejscu."
      >
        <template #actions>
          <button
            type="button"
            class="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            @click="showUserGuide = true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                clip-rule="evenodd"
              />
            </svg>
            Instrukcja
          </button>
        </template>
      </PageHeader>

      <section v-if="savedQuiz">
        <div
          class="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3"
        >
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Niezakończona sesja
            </p>
            <p class="mt-1 text-lg font-semibold truncate">
              {{ savedQuiz.label }} · pytanie {{ savedQuiz.index + 1 }} z {{ savedQuiz.total }}
            </p>
            <p class="text-sm text-amber-700 dark:text-amber-300">
              Odpowiedzi: {{ savedQuiz.answered }} ·
              <template v-if="savedQuiz.remainingMinutes">
                pozostało {{ savedQuiz.remainingMinutes }} min ·
              </template>
              postęp zapisany lokalnie
            </p>
          </div>
          <button
            class="h-11 px-5 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors shrink-0"
            @click="resumeSavedQuiz"
          >
            Wznów
          </button>
        </div>
      </section>

      <div class="grid gap-4 lg:grid-cols-12">
        <section class="surface flex flex-col p-5 lg:col-span-6">
          <div class="flex flex-wrap items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="section-title">
                {{ lastActivity ? 'Kontynuuj naukę' : 'Zacznij naukę' }}
              </p>
              <p class="mt-1 text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 truncate">
                {{ lastActivity ? lastActivity.category : 'Wybierz kategorię i rozpocznij quiz' }}
              </p>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                <template v-if="lastActivity">
                  {{ lastActivityLabel }} · {{ lastActivityPercent }}% poprawnych
                </template>
                <template v-else>Twoje postępy zapisują się automatycznie.</template>
              </p>
            </div>
            <span
              class="shrink-0 rounded-full bg-blue-50 dark:bg-blue-900/40 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300"
            >
              {{ lastActivity ? 'Ostatnia sesja' : 'Start' }}
            </span>
          </div>

          <div class="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              class="h-full rounded-full bg-blue-600 transition-all"
              :style="{ width: `${lastActivity ? lastActivityPercent : 0}%` }"
            ></div>
          </div>

          <div class="mt-auto flex flex-wrap gap-2 pt-5">
            <button
              v-if="lastActivity"
              class="h-10 px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              @click="continueLastActivity"
              :aria-label="`Rozpocznij nową sesję: ${lastActivity.category}`"
            >
              Kontynuuj
            </button>
            <button
              class="h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              @click="scrollToCategories"
            >
              Wybierz kategorię
            </button>
          </div>
        </section>

        <div class="grid gap-4 sm:grid-cols-2 lg:col-span-6">
          <div class="bento-tile flex flex-col justify-between p-4">
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Opanowane</p>
            <p class="mt-1 font-data text-2xl font-semibold tracking-tight">
              {{ masteredPercent }}%
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ correctCount }} / {{ totalQuestionsCount }} pytań
            </p>
          </div>

          <div class="bento-tile flex flex-col justify-between p-4">
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Skuteczność</p>
            <p class="mt-1 font-data text-2xl font-semibold tracking-tight">
              {{ accuracyPercent }}%
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ sessionCount }} sesji
            </p>
          </div>

          <button
            type="button"
            class="bento-tile flex items-center gap-3 p-4 text-left transition-colors hover:border-indigo-300 dark:hover:border-indigo-700"
            @click="openExamPopup"
          >
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300" aria-hidden="true">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-semibold">Egzamin z ubiegłych lat</span>
              <span class="block text-xs text-gray-500 dark:text-gray-400">Wybierz rocznik</span>
            </span>
          </button>

          <button
            type="button"
            class="bento-tile flex items-center gap-3 p-4 text-left transition-colors hover:border-indigo-300 dark:hover:border-indigo-700"
            @click="openOtherQuizPopup"
          >
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300" aria-hidden="true">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-semibold">Własny quiz</span>
              <span class="block text-xs text-gray-500 dark:text-gray-400">Pozostałe kategorie</span>
            </span>
          </button>
        </div>
      </div>

      <RandomQuote />

      <!-- Lista kategorii -->
      <section id="categories">
        <CategoryFilter
          v-model:active-filter="activeFilter"
          v-model:view-type="viewType"
          v-model:grid-columns="gridColumns"
          v-model:search-query="searchQuery"
          v-model:sort-by="sortBy"
          v-model:status-filter="statusFilter"
          :count-label="categoriesCountLabel"
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
            :last-activity-map="lastActivityByCategory"
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
      :examLength="configuredExamLength"
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
import { ref, computed, inject, defineAsyncComponent, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import apiClient from '@/api';
import { getStoredUser, setUser } from '@/utils/authStorage';
import { computeRemainingSeconds } from '@/utils/quizProgress';
import { getExamLength, normalizeExamLength } from '@/utils/examSettings';
import { getCategoryMasteryStatus } from '@/utils/categoryStatus';
import { useQuestions } from '@/composables/useQuestions';

// Komponenty
const RandomQuote = defineAsyncComponent(() => import('@/components/dashboard/RandomQuote.vue'));
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
const PageHeader = defineAsyncComponent(() => import('@/components/layout/PageHeader.vue'));

// Hooki
const showAlert = inject('showAlert');
const router = useRouter();
const route = useRoute();
const store = useStore(); // Inicjalizuj store na najwyższym poziomie
const userName = computed(() => store.getters['user/getUser']?.login || 'uczniu');
const configuredExamLength = computed(() =>
  normalizeExamLength(store.state.user.user?.settings?.examLength)
);

// Wspólne helpery kategorii (jedno źródło prawdy — także offline fallback).
const questionsHelper = useQuestions();

// Stan lokalny
const showExamPopup = ref(false);
const showOtherQuizPopup = ref(false);
const showQuizOptions = ref({});
const activeFilter = ref('all');
const savedView = (() => {
  try {
    return localStorage.getItem('categoriesView');
  } catch (e) {
    return null;
  }
})();
const savedSort = (() => {
  try {
    return localStorage.getItem('categoriesSort');
  } catch (e) {
    return null;
  }
})();
const savedStatus = (() => {
  try {
    return localStorage.getItem('categoriesStatus');
  } catch (e) {
    return null;
  }
})();
const viewType = ref(savedView === 'grid' ? 'grid' : 'list');
const gridColumns = ref(3);
const searchQuery = ref('');
const sortBy = ref(savedSort || 'name');
const statusFilter = ref(savedStatus || 'all');
const showUserGuide = ref(false);

const categoryStats = computed(() => {
  const stats = {};
  const categories = questionsHelper.categories.value;
  const hquestion = store.getters['user/getHquestion'] || [];
  const categoryCounts = questionsHelper.categoryCounts.value;

  if (!categories || !categories.length) return {};

  for (const category of categories) {
    stats[category] = { correct: 0, wrong: 0, notDone: 0, done: 0 };
  }

  // Jedno przejście po odpowiedziach zamiast filtrowania całej tablicy dla każdej kategorii.
  for (const entry of hquestion) {
    if (!entry || !entry.category) continue;
    if (!stats[entry.category]) {
      stats[entry.category] = { correct: 0, wrong: 0, notDone: 0, done: 0 };
    }
    stats[entry.category].done += 1;
    if (entry.correct === true) stats[entry.category].correct += 1;
  }

  for (const category of Object.keys(stats)) {
    const totalQuestions = categoryCounts[category] || 0;
    stats[category].wrong = stats[category].done - stats[category].correct;
    stats[category].notDone = Math.max(0, totalQuestions - stats[category].done);
  }

  return stats;
});

const hquestionEntries = computed(() => store.getters['user/getHquestion'] || []);
const userHistoryEntries = computed(() => store.getters['user/getUserHistory'] || []);

const totalQuestionsCount = computed(() =>
  Object.values(questionsHelper.categoryCounts.value || {}).reduce(
    (sum, count) => sum + (Number(count) || 0),
    0
  )
);
const correctCount = computed(
  () => hquestionEntries.value.filter((entry) => entry?.correct === true).length
);
const wrongCount = computed(
  () => hquestionEntries.value.filter((entry) => entry?.correct === false).length
);
const masteredPercent = computed(() => {
  const total = totalQuestionsCount.value;
  return total > 0 ? Math.round((correctCount.value / total) * 100) : 0;
});
const accuracyPercent = computed(() => {
  const answered = correctCount.value + wrongCount.value;
  return answered > 0 ? Math.round((correctCount.value / answered) * 100) : 0;
});
const sessionCount = computed(() => userHistoryEntries.value.length);

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

function categoryTotals(cat) {
  const stats = categoryStats.value[cat] || { correct: 0, wrong: 0, notDone: 0 };
  const total = stats.correct + stats.wrong + stats.notDone;
  return { stats, total, done: stats.correct + stats.wrong };
}

function categoryPercentDone(cat) {
  const { total, done } = categoryTotals(cat);
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

/** Status zgodny z listą/kartami: Nowa / W trakcie / Opanowana (≥90% przy 100% odpowiedzi). */
function categoryStatusOf(cat) {
  const { stats, total } = categoryTotals(cat);
  return getCategoryMasteryStatus(stats, total);
}

/** Najnowsza aktywność (quiz/egzamin) w danej kategorii, jako timestamp. */
const lastActivityByCategory = computed(() => {
  const map = {};
  for (const entry of store.getters['user/getUserHistory'] || []) {
    if (!entry?.category || !entry?.data) continue;
    const time = new Date(entry.data).getTime();
    if (!Number.isFinite(time)) continue;
    if (!map[entry.category] || time > map[entry.category]) {
      map[entry.category] = time;
    }
  }
  return map;
});

watch(viewType, (value) => {
  try {
    localStorage.setItem('categoriesView', value);
  } catch (e) {
    // ignoruj
  }
});

watch(sortBy, (value) => {
  try {
    localStorage.setItem('categoriesSort', value);
  } catch (e) {
    // ignoruj
  }
});

watch(statusFilter, (value) => {
  try {
    localStorage.setItem('categoriesStatus', value);
  } catch (e) {
    // ignoruj
  }
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
  const query = searchQuery.value.trim().toLowerCase();

  let list = filteredCategories.value
    .filter((cat) => !hidden.includes(cat))
    .filter((cat) => !query || cat.toLowerCase().includes(query))
    .filter((cat) => {
      if (statusFilter.value === 'all') return true;
      return categoryStatusOf(cat) === statusFilter.value;
    });

  const sorted = [...list];
  switch (sortBy.value) {
    case 'progress-asc':
      sorted.sort((a, b) => categoryPercentDone(a) - categoryPercentDone(b));
      break;
    case 'progress-desc':
      sorted.sort((a, b) => categoryPercentDone(b) - categoryPercentDone(a));
      break;
    case 'size-desc':
      sorted.sort((a, b) => categoryTotals(b).total - categoryTotals(a).total);
      break;
    case 'size-asc':
      sorted.sort((a, b) => categoryTotals(a).total - categoryTotals(b).total);
      break;
    case 'activity-desc':
      sorted.sort(
        (a, b) =>
          (lastActivityByCategory.value[b] || 0) - (lastActivityByCategory.value[a] || 0)
      );
      break;
    default:
      sorted.sort((a, b) => a.localeCompare(b));
  }
  return sorted;
});

const categoriesCountLabel = computed(() => {
  const count = searchedCategories.value.length;
  if (count === 1) return '1 kategoria';
  if (count >= 2 && count <= 4) return `${count} kategorie`;
  return `${count} kategorii`;
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

    if (!idsToUse.length) {
      showAlert('warning', 'Brak pytań do egzaminu w tej kategorii — wszystko już zaliczone.');
      return;
    }

    const configured = store.state.user.user?.settings?.examLength;
    const length = getExamLength(configured, idsToUse.length);
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
      const left = computeRemainingSeconds({
        savedAt: data.savedAt,
        timeLeft: data.timeLeft,
        examStartedAt: data.examStartedAt,
        examTimeLimit: data.examTimeLimit,
      });
      if (left !== null) {
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
  const userData = getStoredUser() || {};
  if (userData.hquestion) {
    // Upewniamy się, że modyfikujemy TYLKO hquestion, a nie główną historię
    userData.hquestion = userData.hquestion.filter((q) => q.category !== category);
    setUser(userData);
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
onMounted(() => {
  if (route.query.exam === '1') showExamPopup.value = true;
  if (route.query.otherQuiz === '1') showOtherQuizPopup.value = true;
});
</script>

<style scoped></style>
