<template>
  <div class="app-shell">
    <div>
      <!-- Nagłówek -->
      <HistoryHeader
        :hasHistory="history.length > 0"
        :detailsMode="!!selectedHistoryEntry"
        @clear-history="showConfirmModal = true"
      />

      <!-- Filtry historii -->
      <div
        v-if="!selectedHistoryEntry && history.length > 0"
        class="mb-4 flex flex-col sm:flex-row sm:items-end gap-3"
      >
        <div class="flex-1 min-w-0">
          <label
            for="history-category"
            class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
            >Kategoria</label
          >
          <select
            id="history-category"
            v-model="selectedCategory"
            class="h-10 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-hidden"
          >
            <option value="all">Wszystkie kategorie</option>
            <option v-for="category in categoryOptions" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        <div class="sm:w-56">
          <label
            for="history-sort"
            class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
            >Sortowanie</label
          >
          <select
            id="history-sort"
            v-model="sortOrder"
            class="h-10 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-hidden"
          >
            <option value="newest">Najnowsze najpierw</option>
            <option value="oldest">Najstarsze najpierw</option>
          </select>
        </div>
      </div>

      <!-- Zawartość -->
      <HistoryDetails
        v-if="selectedHistoryEntry"
        :historyEntry="selectedHistoryEntry"
        :allQuestions="allQuestions"
        :answerRefs="answerRefs"
        @close="closeDetails"
        @scroll-to-answer="scrollToAnswer"
      />

      <HistoryOverview
        v-else
        :history="history"
        :filteredHistory="filteredHistory"
        :activeFilter="activeFilter"
        :quizCount="quizCount"
        :examCount="examCount"
        @show-details="showDetails"
        @filter-change="activeFilter = $event"
      />
    </div>

    <!-- Modal potwierdzenia usunięcia historii -->
    <ConfirmationModal
      :show="showConfirmModal"
      @close="showConfirmModal = false"
      @confirm="confirmClearHistory"
    />
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  inject,
  nextTick,
  onMounted,
  watch,
  provide,
  onUnmounted,
  defineAsyncComponent,
} from 'vue';
import { useStore } from 'vuex';
import { filterHistory, listHistoryCategories } from '@/utils/historyFilters';
const HistoryHeader = defineAsyncComponent(() => import('@/components/history/HistoryHeader.vue'));
const HistoryDetails = defineAsyncComponent(
  () => import('@/components/history/HistoryDetails.vue')
);
const HistoryOverview = defineAsyncComponent(
  () => import('@/components/history/HistoryOverview.vue')
);
const ConfirmationModal = defineAsyncComponent(
  () => import('@/components/history/ConfirmationModal.vue')
);

// Store i globalne funkcje
const store = useStore();
const showAlert = inject('showAlert');

// Reaktywne dane
const showConfirmModal = ref(false);
const activeFilter = ref('all');
const selectedCategory = ref('all');
const sortOrder = ref('newest');
const selectedHistoryEntry = ref(null);
const selectedHistoryIndex = ref(null);
const allQuestions = ref([]);
const answerRefs = ref({});
const loading = ref(false);

// Pobieranie danych z Vuex
const history = computed(() => store.getters['user/getUserHistory'] || []);

// Lista kategorii do filtra
const categoryOptions = computed(() => listHistoryCategories(history.value));

// Filtrowane i sortowane dane
const filteredHistory = computed(() =>
  filterHistory(history.value, {
    type: activeFilter.value,
    category: selectedCategory.value,
    sort: sortOrder.value,
  })
);

// Liczniki typów historii
const quizCount = computed(() => filterHistory(history.value, { type: 'quiz' }).length);
const examCount = computed(() => filterHistory(history.value, { type: 'exam' }).length);

// Funkcja do wyświetlania szczegółów
async function showDetails(entry, index) {
  selectedHistoryIndex.value = index;
  selectedHistoryEntry.value = entry;
  await fetchQuestions();
  scrollToTop();
}

// Funkcja do zamykania widoku szczegółów
function closeDetails() {
  selectedHistoryEntry.value = null;
  selectedHistoryIndex.value = null;
  allQuestions.value = [];
  answerRefs.value = {};
}

// Przewijanie na górę strony po pokazaniu szczegółów
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

async function fetchQuestions() {
  if (!selectedHistoryEntry.value) return;

  try {
    const category =
      selectedHistoryEntry.value?.category ||
      (selectedHistoryEntry.value?.categories && selectedHistoryEntry.value.categories[0]) ||
      'all';

    const questions = await store.dispatch('questions/fetchQuestionsByCategory', category);
    allQuestions.value = Array.isArray(questions) ? questions : [];
  } catch (e) {
    showAlert('error', 'Błąd podczas pobierania pytań');
    allQuestions.value = [];
  }
}

function ensureHistoryIds() {
  if (!history.value || !Array.isArray(history.value)) {
    showAlert('error', 'Błąd: historia użytkownika jest nieprawidłowa.');
    return;
  }

  const updatedHistory = [...history.value];
  updatedHistory.forEach((entry, index) => {
    if (!entry.id) entry.id = index;
  });

  store.commit('user/SET_USER_HISTORY', updatedHistory);
}

// Dodaj funkcję czyszczącą historię
async function confirmClearHistory() {
  try {
    loading.value = true;

    await store.dispatch('user/clearHistory');

    // 1. Bezpośrednio aktualizuj dane w Vuex store
    store.commit('user/SET_USER_HISTORY', []);
    store.commit('user/SET_HQUESTION', []);

    // 2. Reset lokalnych zmiennych stanu
    selectedHistoryEntry.value = null;
    selectedHistoryIndex.value = null;
    allQuestions.value = [];
    answerRefs.value = {};

    // 3. Zastosuj trick z wymuszeniem przerenderowania
    const currentFilter = activeFilter.value;
    activeFilter.value = 'temp_value';

    setTimeout(() => {
      activeFilter.value = currentFilter;
      loading.value = false;
      showAlert('success', 'Historia została pomyślnie wyczyszczona');
    }, 100);

    showConfirmModal.value = false;
    closeDetails();
  } catch (e) {
    loading.value = false;
    console.error('Błąd podczas czyszczenia historii:', e);
    showAlert('error', 'Błąd podczas czyszczenia historii.');
    showConfirmModal.value = false;
  }
}

function scrollToAnswer(idx) {
  nextTick(() => {
    const target = answerRefs.value[idx];

    if (target && typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Dodanie animacji podświetlenia
      target.classList.add('ring-2', 'ring-blue-400');
      setTimeout(() => target.classList.remove('ring-2', 'ring-blue-400'), 1200);
    } else {
      console.warn(`Nie można znaleźć elementu DOM dla indeksu ${idx}`);
    }
  });
}

// Inicjalizacja komponentu
onMounted(async () => {
  try {
    await store.dispatch('user/fetchUserHistory');
    ensureHistoryIds();
  } catch (error) {
    showAlert('error', 'Błąd podczas pobierania historii');
  }
});

// Zamknij szczegóły po zmianie filtra
watch(activeFilter, () => {
  closeDetails();
});

// Po załadowaniu pytań
provide('historyQuestions', allQuestions);

// Dodaj nasłuchiwanie na zmiany danych
onMounted(() => {
  window.addEventListener('user-data-refreshed', handleDataRefresh);
});

onUnmounted(() => {
  window.removeEventListener('user-data-refreshed', handleDataRefresh);
});

const handleDataRefresh = async (event) => {
  if (event.detail.all) {
    // Usunięto: history.value = [];

    // Wywołanie akcji z Vuex zaktualizuje dane w store
    await store.dispatch('user/fetchUserHistory');

    nextTick(() => {
      // Dodatkowy trick do wymuszenia renderowania
      const temp = activeFilter.value;
      activeFilter.value = 'all';
      setTimeout(() => {
        activeFilter.value = temp;
      }, 50);
    });
  }
};
</script>
