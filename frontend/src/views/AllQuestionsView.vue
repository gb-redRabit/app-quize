<template>
  <div class="app-shell">
    <h1 class="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">Lista wszystkich pytań</h1>
    <div
      ref="searchBarWrap"
      class="sticky top-[88px] z-20 -mx-4 px-4 py-2 mb-3 bg-white dark:bg-gray-900 border-b border-transparent flex flex-col md:flex-row md:items-center gap-2"
    >
      <SearchBar
        :model-value="search"
        @update:search="handleSearch"
        placeholder="Szukaj po ID lub treści pytania..."
        class="flex-1"
      />
      <p
        class="text-xs text-gray-500 dark:text-gray-400 md:mb-4 md:mr-1 whitespace-nowrap"
        role="status"
        aria-live="polite"
      >
        Wczytano {{ filteredQuestions.length }} z {{ total }}
      </p>
      <p class="hidden lg:block text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
        / szukaj · ↑↓ wybór · Enter otwórz · E edycja · Esc anuluj
      </p>
    </div>

    <!-- Brak duplikatów, tylko lista pytań -->
    <!-- Stan ładowania -->
    <div v-if="isLoading && page === 1" class="mt-8">
      <p class="sr-only" aria-live="polite">Wczytywanie danych…</p>
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
        class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-xs border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md"
        :class="{
          'shadow-md ring-2 ring-blue-100 dark:ring-blue-900': expandedQuestions.includes(q.ID),
          'ring-2 ring-blue-300 dark:ring-blue-700':
            isDesktop && selectedQuestion && selectedQuestion.ID === q.ID,
        }"
      >
        <!-- Nagłówek pytania -->
        <div
          class="flex items-start gap-2 p-4 transition-colors hover:bg-blue-50 dark:hover:bg-gray-700"
          :class="{
            'border-b border-gray-200 dark:border-gray-700': expandedQuestions.includes(q.ID),
            'bg-blue-50 dark:bg-gray-700': expandedQuestions.includes(q.ID),
          }"
        >
          <button
            type="button"
            class="flex items-start flex-1 min-w-0 text-left rounded-lg cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
            :data-question-id="q.ID"
            :aria-expanded="isDesktop ? undefined : expandedQuestions.includes(q.ID)"
            :aria-current="isDesktop && selectedQuestion?.ID === q.ID ? 'true' : undefined"
            @click="handleRowClick(q)"
            @keydown.down.prevent="moveSelection(idx, 1)"
            @keydown.up.prevent="moveSelection(idx, -1)"
          >
            <span
              class="font-mono text-sm text-gray-500 dark:text-gray-400 mt-1 shrink-0"
              style="min-width: 36px"
            >
              {{ q.ID }}
            </span>
            <span class="flex-grow min-w-0">
              <span class="block font-medium text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                {{ q.question }}
              </span>
              <span class="block mt-1 text-sm text-gray-500 dark:text-gray-400">
                Kategoria: <span class="font-medium">{{ q.category || 'Bez kategorii' }}</span>
              </span>
            </span>
            <span class="ml-2 flex items-center justify-center shrink-0">
              <span
                class="flex items-center justify-center h-8 w-8 rounded-full transition-colors duration-300 bg-gray-100 dark:bg-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-gray-500 dark:text-gray-300 transition-transform duration-300"
                  :class="{ 'rotate-180': expandedQuestions.includes(q.ID) }"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </span>
          </button>

          <div v-if="isAdmin" class="hidden sm:block shrink-0 self-center">
            <QuestionActions
              :question="q"
              :inline-edit="isDesktop"
              @deleted="handleQuestionDeleted"
              @edit="handleQuestionEdited"
              @request-edit="startInlineEdit"
            />
          </div>
        </div>

        <!-- Akcje na mobile pod treścią, poza przyciskiem wiersza -->
        <div v-if="isAdmin" class="sm:hidden px-4 pb-3">
          <QuestionActions
            :question="q"
            @deleted="handleQuestionDeleted"
            @edit="handleQuestionEdited"
          />
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
                        class="ml-3 text-green-600 dark:text-green-400 font-medium text-sm bg-green-100 dark:bg-green-600 py-1 px-2 rounded-sm"
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
          class="sticky top-20 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xs p-5 max-h-[calc(100vh-11rem)] overflow-y-auto"
        >
          <QuestionEditor
            v-if="isAdmin && isEditing && selectedQuestion"
            :question="selectedQuestion"
            @saved="handleInlineSaved"
            @cancel="isEditing = false"
          />

          <template v-else-if="selectedQuestion">
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
                inline-edit
                @deleted="handleQuestionDeleted"
                @edit="handleQuestionEdited"
                @request-edit="startInlineEdit"
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
const SearchBar = defineAsyncComponent(() => import('@/components/base/SearchBar.vue'));
const QuestionActions = defineAsyncComponent(
  () => import('@/components/questions/QuestionActions.vue')
);
const QuestionEditor = defineAsyncComponent(
  () => import('@/components/questions/QuestionEditor.vue')
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
const isLoading = ref(true);
const expandedQuestions = ref([]);
const selectedQuestion = ref(null);
const isEditing = ref(false);
const isDesktop = ref(
  typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false
);
let desktopMediaQuery = null;
let desktopMediaChangeHandler = null;
let searchTimer = null;
let fetchToken = 0;
const loadingTrigger = ref(null);
const searchBarWrap = ref(null);
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
    isEditing.value = false;
    selectedQuestion.value = list[0] || null;
  }
});

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
  } catch (e) {
    if (token !== fetchToken) return;
    console.error('Błąd podczas pobierania pytań:', e);
    showAlert('error', `Błąd pobierania pytań: ${e.message}`);

    if (!append) {
      questions.value = [];
      total.value = 0;
      pages.value = 1;

      // Dodajemy testowe dane jeśli API zwróci błąd - to pozwoli sprawdzić czy widok działa
      if (import.meta.env.DEV) {
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

function startInlineEdit(question) {
  if (!isDesktop.value) return;
  if (question && question.ID && selectedQuestion.value?.ID !== question.ID) {
    selectedQuestion.value = question;
  }
  isEditing.value = true;
}

function handleInlineSaved(updated) {
  isEditing.value = false;
  if (updated && updated.ID) {
    handleQuestionEdited(updated);
    showAlert?.('success', 'Pytanie zostało zaktualizowane.');
  }
}

function moveSelection(index, delta) {
  const list = filteredQuestions.value;
  const next = list[index + delta];
  if (!next) return;

  isEditing.value = false;

  if (isDesktop.value) {
    selectedQuestion.value = next;
  } else {
    expandedQuestions.value = [next.ID];
  }

  nextTick(() => {
    const el = document.querySelector(`[data-question-id="${next.ID}"]`);
    if (el) {
      el.focus();
      el.scrollIntoView({ block: 'nearest' });
    }
  });
}

function handleRowClick(question) {
  if (isDesktop.value) {
    if (selectedQuestion.value?.ID !== question.ID) isEditing.value = false;
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
    isEditing.value = false;
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

function handlePageShortcut(event) {
  const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);

  // Esc zawsze anuluje edycję (także gdy kursor jest w polu formularza).
  if (event.key === 'Escape' && isEditing.value) {
    isEditing.value = false;
    return;
  }

  if (event.metaKey || event.ctrlKey || event.altKey) return;

  if (event.key === '/' && !typing) {
    const input = searchBarWrap.value?.querySelector('input');
    if (!input) return;
    event.preventDefault();
    input.focus();
    return;
  }

  if ((event.key === 'e' || event.key === 'E') && !typing && isDesktop.value && isAdmin.value) {
    if (!isEditing.value && selectedQuestion.value) {
      event.preventDefault();
      startInlineEdit(selectedQuestion.value);
    }
  }
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
  window.addEventListener('keydown', handlePageShortcut);
});

onUnmounted(() => {
  clearTimeout(searchTimer);
  window.removeEventListener('keydown', handlePageShortcut);
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
