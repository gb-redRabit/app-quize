<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">Lista wszystkich pytań</h1>
    <div class="flex flex-col md:flex-row md:items-center gap-4 mb-6">
      <SearchBar
        :model-value="search"
        @update:search="handleSearch"
        placeholder="Szukaj po ID lub treści pytania..."
        class="flex-1"
      />
    </div>

    <!-- Brak duplikatów, tylko lista pytań -->
    <!-- Stan ładowania -->
    <div
      v-if="isLoading && page === 1"
      class="mt-8 text-center text-gray-600 dark:text-gray-300 font-medium text-lg"
    >
      Wczytywanie danych...
    </div>
    <div v-if="isLoading && page === 1">
      <BaseSkeleton
        variant="table"
        :card-count="7"
        :show-header="true"
        :show-cards="false"
        :show-lines="true"
        container-class="w-full"
        :line-widths="['100px', '60%', '20%', '15%']"
      />
    </div>

    <!-- Brak wyników -->
    <div v-else-if="filteredQuestions.length === 0" class="text-gray-500 mt-8 text-center">
      <p>Brak pytań spełniających kryteria.</p>
      <button v-if="search" @click="clearSearch" class="mt-2 text-blue-600 hover:text-blue-800">
        Wyczyść wyszukiwanie
      </button>
    </div>

    <!-- Lista pytań + panel szczegółów (desktop) -->
    <div v-else class="lg:grid lg:grid-cols-5 lg:gap-6">
      <div
        class="space-y-3 lg:col-span-2 lg:max-h-[calc(100vh-11rem)] lg:overflow-y-auto lg:pr-2"
      >
      <div
        v-for="(q, idx) in filteredQuestions"
        :key="q.ID"
        class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md"
        :class="{
          'shadow-md ring-2 ring-blue-100 dark:ring-blue-900': expandedQuestions.includes(q.ID),
          'ring-2 ring-blue-300 dark:ring-blue-700':
            isDesktop && selectedQuestion && selectedQuestion.ID === q.ID,
        }"
      >
        <!-- Nagłówek pytania -->
        <div
          class="flex items-start p-4 cursor-pointer transition-colors hover:bg-blue-50 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
          :class="{
            'border-b border-gray-200 dark:border-gray-700': expandedQuestions.includes(q.ID),
            'bg-blue-50 dark:bg-gray-700': expandedQuestions.includes(q.ID),
          }"
          role="button"
          tabindex="0"
          :aria-expanded="isDesktop ? undefined : expandedQuestions.includes(q.ID)"
          :aria-current="isDesktop && selectedQuestion?.ID === q.ID ? 'true' : undefined"
          @click="handleRowClick(q)"
          @keydown.enter.prevent="handleRowClick(q)"
          @keydown.space.prevent="handleRowClick(q)"
        >
          <div class="font-mono text-sm text-gray-500 dark:text-gray-400 mt-1" style="min-width: 36px">
            {{ q.ID }}
          </div>
          <div class="flex-grow min-w-0">
            <div class="font-medium text-gray-800 dark:text-gray-200 text-sm sm:text-base">
              {{ q.question }}
            </div>
            <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Kategoria: <span class="font-medium">{{ q.category || 'Bez kategorii' }}</span>
            </div>
            <div v-if="isAdmin" class="mt-3 sm:hidden">
              <QuestionActions
                :question="q"
                @deleted="handleQuestionDeleted"
                @edit="handleQuestionEdited"
              />
            </div>
          </div>
          <div class="ml-2 flex items-center justify-center shrink-0">
            <div
              class="flex items-center justify-center h-8 w-8 rounded-full transition-colors duration-300 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900"
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
            <div v-if="isAdmin" class="ml-3 hidden sm:block">
              <QuestionActions
                :question="q"
                @deleted="handleQuestionDeleted"
                @edit="handleQuestionEdited"
              />
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
          <div v-if="expandedQuestions.includes(q.ID)" class="overflow-hidden lg:hidden">
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

      <!-- Element obserwowany dla nieskończonego przewijania - poprawiony -->
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
        <!-- Dodajemy tymczasowy element, który zawsze będzie widoczny -->
        <div v-else class="h-10">&nbsp;</div>
      </div>
      </div>

      <aside class="hidden lg:block lg:col-span-3">
        <div
          class="sticky top-20 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-5 max-h-[calc(100vh-11rem)] overflow-y-auto"
        >
          <template v-if="selectedQuestion">
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="min-w-0">
                <p class="text-xs font-mono text-gray-500 dark:text-gray-400">
                  ID {{ selectedQuestion.ID }}
                </p>
                <p class="text-sm font-medium text-blue-700 dark:text-blue-300 truncate">
                  {{ selectedQuestion.category || 'Bez kategorii' }}
                </p>
              </div>
              <QuestionActions
                v-if="isAdmin"
                :question="selectedQuestion"
                @deleted="handleQuestionDeleted"
                @edit="handleQuestionEdited"
              />
            </div>

            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 break-words">
              {{ selectedQuestion.question }}
            </h2>

            <div class="mt-4 space-y-2">
              <div
                v-for="(answer, key) in getAnswers(selectedQuestion)"
                :key="key"
                class="p-3 rounded-lg border flex items-start gap-3"
                :class="
                  answer.isCorrect || answer.isCorret
                    ? 'bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-800'
                    : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                "
              >
                <span
                  class="inline-flex items-center justify-center h-7 w-7 rounded-full text-sm font-medium shrink-0"
                  :class="
                    answer.isCorrect || answer.isCorret
                      ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200'
                  "
                >
                  {{ key.split('_')[1]?.toUpperCase() || key }}
                </span>
                <span class="text-sm text-gray-800 dark:text-gray-200 break-words">
                  {{ typeof answer === 'object' ? answer.answer : answer }}
                </span>
                <span
                  v-if="answer.isCorrect || answer.isCorret"
                  class="ml-auto text-xs font-medium text-green-700 dark:text-green-300 shrink-0"
                >
                  Poprawna
                </span>
              </div>
            </div>

            <div v-if="selectedQuestion.description" class="mt-4">
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opis:</h3>
              <p
                class="text-sm text-gray-600 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg break-words"
              >
                {{ selectedQuestion.description }}
              </p>
            </div>

            <div class="mt-4 flex flex-wrap gap-2 text-xs">
              <span
                v-if="selectedQuestion.flagged"
                class="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                >flagged</span
              >
              <span
                v-if="selectedQuestion.bad"
                class="px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                >bad</span
              >
              <span
                v-if="selectedQuestion.unknown"
                class="px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                >unknown</span
              >
              <span
                v-if="selectedQuestion.note"
                class="px-2 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200 break-words"
              >
                Notatka: {{ selectedQuestion.note }}
              </span>
            </div>
          </template>
          <p v-else class="text-sm text-gray-500 dark:text-gray-400">
            Wybierz pytanie z listy, aby zobaczyć szczegóły.
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  watch,
  inject,
  nextTick,
  onUnmounted,
  defineAsyncComponent,
} from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
const SearchBar = defineAsyncComponent(() => import('@/components/base/SearchBar.vue'));
const QuestionActions = defineAsyncComponent(
  () => import('@/components/questions/QuestionActions.vue')
);
const BaseSkeleton = defineAsyncComponent(() => import('@/components/base/BaseSkeleton.vue'));
import apiClient from '@/api';
import { useStore } from 'vuex';

const store = useStore();
const showAlert = inject('showAlert');

// Stan komponentu
const search = ref('');
const questions = ref([]);
const page = ref(1);
const limit = ref(20);
const total = ref(0);
const pages = ref(1);
const searching = ref(false);
const isLoading = ref(true);
const expandedQuestions = ref([]);
const selectedQuestion = ref(null);
const isDesktop = ref(
  typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false
);
let desktopMediaQuery = null;
let desktopMediaChangeHandler = null;
let searchTimer = null;
let fetchToken = 0;
const loadingTrigger = ref(null);
let observer = null;

// Computed properties
const currentUser = computed(() => store.getters['user/getUser']);
const isAdmin = computed(() => currentUser.value?.rola === 'admin');
const filteredQuestions = computed(() => questions.value);

watch(filteredQuestions, (list) => {
  if (!isDesktop.value) return;
  const stillExists =
    selectedQuestion.value && list.some((q) => q.ID === selectedQuestion.value.ID);
  if (!stillExists) {
    selectedQuestion.value = list[0] || null;
  }
});

// Funkcja do czyszczenia znaków specjalnych na końcu pytania
function normalizeQuestionText(text) {
  return (text || '')
    .replace(/[\s\.\,\;\:\!\?\-–—_]+$/g, '') // usuń spacje i znaki specjalne na końcu
    .trim()
    .toLowerCase();
}

async function fetchQuestions(forceRefresh = false, append = false) {
  const token = ++fetchToken;
  isLoading.value = true;

  try {
    const endpoint =
      search.value.trim() === ''
        ? `/questions?page=${page.value}&limit=${limit.value}`
        : `/questions/search?query=${encodeURIComponent(search.value.trim())}`;

    const res = await apiClient.get(endpoint);
    if (token !== fetchToken) return;
    if (!res.data) {
      throw new Error('Brak danych w odpowiedzi');
    }

    // Obsługa różnych formatów odpowiedzi API
    let questionsData = [];
    let totalCount = 0;
    let pagesCount = 1;

    if (Array.isArray(res.data)) {
      questionsData = res.data;
      totalCount = res.data.length;
      pagesCount = 1;
    } else if (Array.isArray(res.data.questions)) {
      questionsData = res.data.questions;
      totalCount = res.data.total || res.data.questions.length;
      pagesCount = res.data.pages || Math.ceil(totalCount / limit.value);
    } else if (res.data.data && Array.isArray(res.data.data)) {
      questionsData = res.data.data;
      totalCount = res.data.total || res.data.data.length;
      pagesCount = res.data.pages || Math.ceil(totalCount / limit.value);
    } else {
      throw new Error('Nierozpoznany format danych API');
    }

    if (append) {
      questions.value = [...questions.value, ...questionsData];
    } else {
      questions.value = Array.isArray(questionsData) ? questionsData : [];
    }

    total.value = totalCount;
    pages.value = pagesCount;
    searching.value = search.value.trim() !== '';
  } catch (e) {
    if (token !== fetchToken) return;
    console.error('Błąd podczas pobierania pytań:', e);
    showAlert('error', `Błąd pobierania pytań: ${e.message}`);

    if (!append) {
      questions.value = [];
      total.value = 0;
      pages.value = 1;

      // Dodajemy testowe dane jeśli API zwróci błąd - to pozwoli sprawdzić czy widok działa
      if (process.env.NODE_ENV !== 'production') {
        questions.value = [
          {
            ID: 1,
            question: 'Testowe pytanie 1',
            category: 'Test',
            answer_a: 'Odpowiedź A',
            answer_b: 'Odpowiedź B',
            answer_c: 'Odpowiedź C',
            correct_answer: 'a',
            description: 'Opis testowego pytania',
          },
          {
            ID: 2,
            question: 'Testowe pytanie 2',
            category: 'Test',
            answer_a: 'Odpowiedź A',
            answer_b: 'Odpowiedź B',
            correct_answer: 'b',
          },
        ];
        total.value = 2;
      }
    }
  } finally {
    // Upewnijmy się, że zawsze zmieniamy stan isLoading na false
    if (token === fetchToken) isLoading.value = false;
  }
}

function handleSearch(value) {
  search.value = value;
  page.value = 1;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    fetchQuestions(true);
  }, 300);
}

function clearSearch() {
  clearTimeout(searchTimer);
  search.value = '';
  page.value = 1;
  fetchQuestions(true);
}

function loadMore() {
  if (page.value < pages.value) {
    page.value += 1;
    fetchQuestions(false, true);
  }
}

function toggleQuestionDetails(id) {
  const index = expandedQuestions.value.indexOf(id);
  if (index > -1) {
    expandedQuestions.value.splice(index, 1);
  } else {
    expandedQuestions.value.push(id);
  }
}

function handleRowClick(question) {
  if (isDesktop.value) {
    selectedQuestion.value = question;
  } else {
    toggleQuestionDetails(question.ID);
  }
}

function getAnswers(question) {
  const answers = {};
  for (const key in question) {
    if (key.startsWith('answer_')) {
      if (typeof question[key] === 'object') {
        answers[key] = question[key];
      } else if (typeof question[key] === 'string' && question[key].trim() !== '') {
        answers[key] = {
          answer: question[key],
          isCorrect: question.correct_answer === key.split('_')[1],
        };
      }
    }
  }
  return answers;
}

function hasAnswers(question) {
  return Object.keys(getAnswers(question)).length > 0;
}

function handleQuestionDeleted(question) {
  const idx = questions.value.findIndex((q) => q.ID === question.ID);
  if (idx > -1) {
    questions.value.splice(idx, 1);
  }
  if (selectedQuestion.value?.ID === question.ID) {
    selectedQuestion.value = questions.value[0] || null;
  }

  // Zamknij szczegóły, jeśli były otwarte
  const expandedIdx = expandedQuestions.value.indexOf(question.ID);
  if (expandedIdx > -1) {
    expandedQuestions.value.splice(expandedIdx, 1);
  }
  showAlert('success', 'Pytanie zostało usunięte');
}

// Inicjalizacja IntersectionObserver dla nieskończonego przewijania
function setupInfiniteScroll() {
  // Usuwamy stary observer jeśli istnieje
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];

      if (entry.isIntersecting) {
        loadMore();
      }
    },
    {
      // Zwiększamy margines, aby wcześniej zacząć ładowanie
      rootMargin: '0px 0px 300px 0px',
      threshold: 0,
    }
  );

  nextTick(() => {
    if (loadingTrigger.value) {
      observer.observe(loadingTrigger.value);
    }
  });
}

// Inicjalizacja
function handleQuestionEdited(question) {
  const idx = questions.value.findIndex((q) => q.ID === question.ID);
  if (idx > -1) {
    questions.value.splice(idx, 1, { ...questions.value[idx], ...question });
    if (selectedQuestion.value?.ID === question.ID) {
      selectedQuestion.value = questions.value[idx];
    }
  }
}

function handleQuestionsRealtime(event) {
  const detail = event.detail || {};
  if (detail.type === 'update' && detail.question) {
    handleQuestionEdited(detail.question);
    return;
  }
  if (detail.type === 'delete' && detail.ID) {
    questions.value = questions.value.filter((q) => q.ID !== detail.ID);
    return;
  }
  // create / bulk / import / clear — odśwież pierwszą stronę
  page.value = 1;
  fetchQuestions(true);
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    desktopMediaQuery = window.matchMedia('(min-width: 1024px)');
    desktopMediaChangeHandler = (event) => {
      isDesktop.value = event.matches;
      if (event.matches) {
        selectedQuestion.value = questions.value[0] || null;
      } else {
        selectedQuestion.value = null;
      }
    };
    if (desktopMediaQuery.addEventListener) {
      desktopMediaQuery.addEventListener('change', desktopMediaChangeHandler);
    } else {
      desktopMediaQuery.addListener(desktopMediaChangeHandler);
    }
  }

  setTimeout(() => {
    fetchQuestions(true);
    setupInfiniteScroll();
    window.addEventListener('scroll', handleScroll);
  }, 100);
  window.addEventListener('questions-changed', handleQuestionsRealtime);
});

onUnmounted(() => {
  clearTimeout(searchTimer);
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (desktopMediaQuery && desktopMediaChangeHandler) {
    if (desktopMediaQuery.removeEventListener) {
      desktopMediaQuery.removeEventListener('change', desktopMediaChangeHandler);
    } else {
      desktopMediaQuery.removeListener(desktopMediaChangeHandler);
    }
  }
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('questions-changed', handleQuestionsRealtime);
});

watch(
  () => search.value,
  () => {
    page.value = 1;
  }
);

watch(
  () => page.value,
  () => {
    setTimeout(() => {
      if (loadingTrigger.value && observer) {
        observer.unobserve(loadingTrigger.value);
        observer.observe(loadingTrigger.value);
      }
    }, 200);
  }
);

watch(
  () => filteredQuestions.value.length,
  (newLength) => {
    setTimeout(setupInfiniteScroll, 200);
  }
);

function handleScroll() {
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const clientHeight = document.documentElement.clientHeight;

  if (scrollHeight - scrollTop - clientHeight < 300) {
    if (!isLoading.value && page.value < pages.value) {
      loadMore();
    }
  }
}
</script>

<style scoped>
:deep(.dark .bg-gray-700) {
  background-color: rgba(55, 65, 81, 0.5);
}
</style>
