<template>
  <div class="container mx-auto p-4 md:p-6">
    <!-- Nagłówek strony -->
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Duplikaty pytań</h1>
      <div class="flex items-center gap-4">
        <div class="text-gray-600 dark:text-gray-300 text-lg w-4/12">
          Ilość duplikatów: <span class="font-semibold">{{ total }}</span>
        </div>
        <button
          @click="toggleSortByCategory"
          class="px-4 py-2 rounded-lg font-semibold shadow transition-colors duration-200"
          :class="sortByCategory ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
        >
          Sortuj według kategorii
          <span v-if="sortByCategory">(A-Z)</span>
          <span v-else>(domyślnie)</span>
        </button>
        <div class="">
          <select
            v-model="selectedCategory"
            class="px-3 py-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="">Wszystkie kategorie</option>
            <option v-for="cat in uniqueCategories" :key="cat" :value="cat">
              {{ cat || 'Bez kategorii' }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div
      v-if="loading"
      class="flex items-center justify-center text-lg text-gray-600 dark:text-gray-300 p-12"
    >
      <div
        class="animate-spin h-6 w-6 mr-3 rounded-full border-2 border-gray-300 border-t-blue-500"
      ></div>
      <span>Ładowanie pytań...</span>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="filteredQuestions.length === 0"
      class="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
    >
      <img
        src="@/assets/icons/question-mark-circle.svg"
        alt="Brak pytań"
        class="w-14 h-14 mb-4 text-gray-400 dark:text-gray-500"
      />
      <p>Brak duplikatów pytań</p>
      <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">
        Spróbuj wprowadzić inne dane lub sprawdź całą bazę pytań.
      </p>
    </div>

    <!-- Questions list z infinite scroll -->
    <div v-else class="space-y-3">
      <div
        v-for="(q, idx) in visibleQuestions"
        :key="q.ID"
        class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md"
        :class="{
          'shadow-md ring-2 ring-sky-100 dark:ring-sky-900': expandedQuestions.includes(q.ID),
        }"
      >
        <!-- Nagłówek pytania -->
        <div
          class="flex items-start p-4 cursor-pointer transition-colors hover:bg-sky-50 dark:hover:bg-gray-750"
          :class="{
            'border-b border-gray-200 dark:border-gray-700': expandedQuestions.includes(q.ID),
            'bg-sky-50 dark:bg-gray-750': expandedQuestions.includes(q.ID),
          }"
          @click="toggleQuestionDetails(q.ID)"
        >
          <div class="font-mono text-gray-500 dark:text-gray-400 mt-1" style="min-width: 50px">
            {{ q.ID }}
          </div>
          <div class="flex-grow">
            <div class="font-medium text-gray-800 dark:text-gray-200">{{ q.question }}</div>
            <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Kategoria: <span class="font-medium">{{ q.category || 'Bez kategorii' }}</span>
            </div>
          </div>
          <div class="ml-4 flex items-center justify-center">
            <div
              class="flex items-center justify-center h-8 w-8 rounded-full transition-colors duration-300 bg-gray-100 dark:bg-gray-700 hover:bg-sky-100 dark:hover:bg-sky-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-gray-500 dark:text-gray-300 transition-transform duration-300"
                :class="{ 'rotate-180': expandedQuestions.includes(q.ID) }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            <div v-if="isAdmin" class="ml-3">
              <QuestionActions :question="q" @deleted="handleQuestionDeleted" />
            </div>
          </div>
        </div>

        <!-- Szczegóły pytania - animowane rozwijanie -->
        <transition
          enter-active-class="transition-all ease-out duration-300"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-[1000px]"
          leave-active-class="transition-all ease-in duration-300"
          leave-from-class="opacity-100 max-h-[1000px]"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-if="expandedQuestions.includes(q.ID)" class="overflow-hidden">
            <div class="p-4 bg-gray-50 dark:bg-gray-800 space-y-4">
              <div v-if="hasAnswers(q)">
                <h3 class="font-medium mb-3 text-gray-700 dark:text-gray-300">Odpowiedzi:</h3>
                <div class="space-y-2">
                  <div
                    v-for="(answer, key) in getAnswers(q)"
                    :key="key"
                    class="p-3 rounded-lg border border-transparent transition-all"
                    :class="
                      answer.isCorrect || answer.isCorret
                        ? 'bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-800'
                        : 'bg-gray-100 dark:bg-gray-700 dark:border-gray-700'
                    "
                  >
                    <div class="flex items-center">
                      <span
                        class="inline-flex items-center justify-center h-7 w-7 rounded-full mr-3 font-medium text-sm"
                        :class="
                          answer.isCorrect || answer.isCorret
                            ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                        "
                      >
                        {{ key.split('_')[1]?.toUpperCase() || key }}
                      </span>
                      <span class="text-gray-800 dark:text-gray-200">
                        {{ typeof answer === 'object' ? answer.answer : answer }}
                      </span>
                      <span
                        v-if="answer.isCorrect || answer.isCorret"
                        class="ml-3 text-green-600 dark:text-green-400 font-medium text-sm bg-green-100 dark:bg-green-600 py-1 px-2 rounded"
                      >
                        Poprawna
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="q.description" class="mt-4">
                <h3 class="font-medium mb-2 text-gray-700 dark:text-gray-300">Opis:</h3>
                <p
                  class="text-gray-600 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"
                >
                  {{ q.description }}
                </p>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Element obserwowany dla infinite scroll -->
      <div ref="loadingTrigger" class="py-4 flex justify-center mt-4">
        <div v-if="isLoading && page > 1" class="flex items-center justify-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-blue-500 animate-bounce"></div>
          <div
            class="w-3 h-3 rounded-full bg-blue-500 animate-bounce"
            style="animation-delay: 0.2s"
          ></div>
          <div
            class="w-3 h-3 rounded-full bg-blue-500 animate-bounce"
            style="animation-delay: 0.4s"
          ></div>
        </div>
        <p
          v-else-if="page === pages && filteredQuestions.length > 0"
          class="text-gray-500 dark:text-gray-400 italic"
        >
          Koniec wyników ({{ total }} pytań)
        </p>
        <div v-else class="h-10">&nbsp;</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, watch, nextTick, onBeforeUnmount } from 'vue';
import QuestionActions from '@/components/questions/QuestionActions.vue';
import apiClient from '@/api';

const showAlert = inject('showAlert');
const loading = ref(true);
const questions = ref([]);
const expandedQuestions = ref([]);
const isLoading = ref(false);
const page = ref(1);
const pageSize = 20;
const loadingTrigger = ref(null);
const sortByCategory = ref(false);
const selectedCategory = ref('');

const isAdmin = true; // lub pobierz z auth

const total = computed(() => filteredQuestions.value.length);
const pages = computed(() => Math.ceil(total.value / pageSize));
const visibleQuestions = computed(() => filteredQuestions.value.slice(0, page.value * pageSize));

const filteredQuestions = computed(() => {
  let arr = questions.value.slice();
  if (selectedCategory.value) {
    arr = arr.filter((q) => (q.category || 'Bez kategorii') === selectedCategory.value);
  }
  if (sortByCategory.value) {
    arr.sort((a, b) => {
      const catA = (a.category || '').toLowerCase();
      const catB = (b.category || '').toLowerCase();
      if (catA !== catB) return catA.localeCompare(catB);
      return (a.question || '').localeCompare(b.question || '');
    });
  }
  return arr;
});

const uniqueCategories = computed(() => {
  const set = new Set(questions.value.map((q) => q.category || 'Bez kategorii'));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
});

onMounted(async () => {
  await loadQuestions();
  observeTrigger();
});
onBeforeUnmount(() => {
  if (observer) observer.disconnect();
});

async function loadQuestions() {
  loading.value = true;
  try {
    const res = await apiClient.get('/questions/all');
    if (Array.isArray(res.data.duplicates)) {
      questions.value = res.data.duplicates.flat();
    } else {
      questions.value = [];
    }
  } catch (e) {
    showAlert && showAlert('error', 'Błąd pobierania duplikatów: ' + e.message);
    questions.value = [];
  } finally {
    loading.value = false;
  }
}

// Infinite scroll z Intersection Observer
let observer;
function observeTrigger() {
  nextTick(() => {
    if (observer) observer.disconnect();
    if (!loadingTrigger.value) return;
    observer = new window.IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoading.value && page.value < pages.value) {
        loadMore();
      }
    });
    observer.observe(loadingTrigger.value);
  });
}

function loadMore() {
  if (isLoading.value || page.value >= pages.value) return;
  isLoading.value = true;
  setTimeout(() => {
    page.value++;
    isLoading.value = false;
    observeTrigger();
  }, 400); // symulacja ładowania
}

// Rozwijanie szczegółów pytania
function toggleQuestionDetails(id) {
  if (expandedQuestions.value.includes(id)) {
    expandedQuestions.value = expandedQuestions.value.filter((qid) => qid !== id);
  } else {
    expandedQuestions.value.push(id);
  }
}

// Akcje na pytaniach
function handleQuestionDeleted(deletedQuestion) {
  questions.value = questions.value.filter((q) => q.ID !== deletedQuestion.ID);
  showAlert && showAlert('success', 'Pytanie zostało usunięte.');
}

// Helpers do odpowiedzi
function hasAnswers(q) {
  return q && typeof q === 'object' && Object.keys(getAnswers(q)).length > 0;
}
function getAnswers(q) {
  // Przykład: odpowiedzi są w polach answer_a, answer_b, ...
  return Object.fromEntries(
    Object.entries(q)
      .filter(([k]) => k.startsWith('answer_') && q[k])
      .map(([k, v]) => [k, typeof v === 'object' ? v : { answer: v }])
  );
}

function toggleSortByCategory() {
  sortByCategory.value = !sortByCategory.value;
}
</script>
