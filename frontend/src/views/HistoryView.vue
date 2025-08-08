<template>
  <div class="container py-8">
    <div class="mx-auto px-4">
      <!-- Nagłówek -->
      <HistoryHeader
        :hasHistory="history.length > 0"
        :detailsMode="!!selectedHistoryEntry"
        @clear-history="showConfirmModal = true"
      />

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
import { ref, computed, inject, nextTick, onMounted, watch, provide } from 'vue';
import { useStore } from 'vuex';
import apiClient from '@/api';

import HistoryHeader from '@/components/history/HistoryHeader.vue';
import HistoryDetails from '@/components/history/HistoryDetails.vue';
import HistoryOverview from '@/components/history/HistoryOverview.vue';
import ConfirmationModal from '@/components/history/ConfirmationModal.vue';

// Store i globalne funkcje
const store = useStore();
const showAlert = inject('showAlert');

// Reaktywne dane
const showConfirmModal = ref(false);
const activeFilter = ref('all');
const selectedHistoryEntry = ref(null);
const selectedHistoryIndex = ref(null);
const allQuestions = ref([]);
const answerRefs = ref({});

// Pobieranie danych z Vuex
const history = computed(() => store.getters['user/getUserHistory'] || []);

// Filtrowane dane
const filteredHistory = computed(() => {
  if (activeFilter.value === 'all') {
    return history.value;
  } else if (activeFilter.value === 'quiz') {
    return history.value.filter(
      (item) => item.type === 'quiz' || item.type === 'Quiz - poprawa błędów'
    );
  } else if (activeFilter.value === 'exam') {
    return history.value.filter(
      (item) => item.type === 'egzamin' || item.type === 'Egzamin - poprawa błędów'
    );
  }
  return history.value;
});

// Liczniki typów historii
const quizCount = computed(
  () =>
    history.value.filter((item) => item.type === 'quiz' || item.type === 'Quiz - poprawa błędów')
      .length
);

const examCount = computed(
  () =>
    history.value.filter(
      (item) => item.type === 'egzamin' || item.type === 'Egzamin - poprawa błędów'
    ).length
);

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

async function confirmClearHistory() {
  try {
    await apiClient.put('/users/update-profile', { clearHistory: true });

    // Odśwież dane historii
    await store.dispatch('user/fetchUserHistoryAndHQ');

    showAlert('success', 'Historia została pomyślnie wyczyszczona');
    showConfirmModal.value = false;
    closeDetails(); // Zamknij widok szczegółów jeśli był otwarty
  } catch (e) {
    console.error('Błąd podczas czyszczenia historii:', e);
    showAlert('error', 'Błąd podczas czyszczenia historii.');
    showConfirmModal.value = false;
  }
}

function scrollToAnswer(idx) {
  nextTick(() => {
    const target = answerRefs.value[idx];

    // Dodaj debugowanie
    console.log(`Próba przewinięcia do odpowiedzi ${idx}`, target);

    if (target && typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Dodanie animacji podświetlenia
      target.classList.add('ring', 'ring-blue-400');
      setTimeout(() => target.classList.remove('ring', 'ring-blue-400'), 1200);
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
</script>
