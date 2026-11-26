<template>
  <div class="app-shell">
    <PageHeader
      eyebrow="Baza pytań"
      title="Wszystkie pytania"
      subtitle="Przeglądaj, wyszukuj i edytuj pytania. Skróty: / szukaj · ↑↓ wybór · Enter otwórz · E edycja."
    />
    <div
      ref="searchBarWrap"
      class="sticky top-[72px] xl:top-3 z-20 mb-3 flex flex-col md:flex-row md:items-center gap-2 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur px-3 py-2"
    >
      <SearchBar
        :model-value="search"
        @update:search="handleSearch"
        placeholder="Szukaj po ID lub treści pytania..."
        class="flex-1"
      />
      <p
        class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap"
        role="status"
        aria-live="polite"
      >
        Wczytano {{ filteredQuestions.length }} z {{ total }}
        <span v-if="pendingQuestions.length" class="text-amber-700 dark:text-amber-300">
          · +{{ pendingQuestions.length }} oczekuje
        </span>
      </p>
    </div>

    <div
      v-if="!isLoading && displayQuestions.length > 0"
      class="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400"
      aria-label="Legenda oznaczeń pytań"
    >
      <span class="inline-flex items-center gap-1.5">
        <span class="h-2 w-2 rounded-full bg-green-500" aria-hidden="true"></span> Sprawdzone
      </span>
      <span class="inline-flex items-center gap-1.5">
        <span class="h-2 w-2 rounded-full bg-red-500" aria-hidden="true"></span> Złe
      </span>
      <span class="inline-flex items-center gap-1.5">
        <span class="h-2 w-2 rounded-full bg-yellow-500" aria-hidden="true"></span> Nie wiem
      </span>
    </div>

    <!-- Brak duplikatów, tylko lista pytań -->
    <!-- Stan ładowania -->
    <div v-if="isLoading && page === 1 && displayQuestions.length === 0" class="mt-8">
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
    <div v-else-if="displayQuestions.length === 0" class="text-gray-500 mt-8 text-center">
      <p>Brak pytań spełniających kryteria.</p>
      <button v-if="search" @click="clearSearch" class="mt-2 text-blue-600 hover:text-blue-800">
        Wyczyść wyszukiwanie
      </button>
    </div>

    <!-- Lista pytań + panel szczegółów (desktop) -->
    <div v-else class="lg:grid lg:grid-cols-5 lg:gap-6">
      <div
        class="space-y-3 lg:col-span-2 xl:max-h-[calc(100vh-20rem)] lg:overflow-y-auto overscroll-contain lg:py-1 lg:pl-1 lg:pr-2"
      >
      <div
        v-for="(q, idx) in displayQuestions"
        :key="q.ID"
        class="surface overflow-hidden transition-all duration-200"
        :class="{
          'ring-2 ring-blue-300 dark:ring-blue-700':
            isDesktop && selectedQuestion && selectedQuestion.ID === q.ID,
        }"
      >
        <!-- Nagłówek pytania -->
        <div class="flex items-start gap-2 p-4 transition-colors hover:bg-blue-50 dark:hover:bg-gray-700">
          <button
            type="button"
            class="flex items-start flex-1 min-w-0 text-left rounded-lg cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
            :data-question-id="q.ID"
            :aria-current="isDesktop && selectedQuestion?.ID === q.ID ? 'true' : undefined"
            @click="handleRowClick(q)"
            @keydown.down.prevent="moveSelection(idx, 1)"
            @keydown.up.prevent="moveSelection(idx, -1)"
          >
            <span
              v-if="q.__pending"
              class="mt-0.5 shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
            >
              Nowe
            </span>
            <span
              v-else
              class="font-mono text-sm text-gray-500 dark:text-gray-400 mt-1 shrink-0"
              style="min-width: 36px"
            >
              {{ q.ID }}
            </span>
            <span class="flex-grow min-w-0">
              <span class="block font-medium text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                {{ q.question }}
              </span>
              <span class="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>
                  Kategoria: <span class="font-medium">{{ q.category || 'Bez kategorii' }}</span>
                </span>
                <span
                  v-if="q.flagged || q.bad || q.unknown"
                  class="flex items-center gap-1"
                  aria-hidden="true"
                >
                  <span
                    v-if="q.flagged"
                    class="h-2 w-2 rounded-full bg-green-500"
                    title="Sprawdzone"
                  ></span>
                  <span v-if="q.bad" class="h-2 w-2 rounded-full bg-red-500" title="Złe"></span>
                  <span
                    v-if="q.unknown"
                    class="h-2 w-2 rounded-full bg-yellow-500"
                    title="Nie wiem"
                  ></span>
                </span>
              </span>
            </span>
            <span class="ml-2 flex items-center justify-center shrink-0">
              <span
                class="flex items-center justify-center h-8 w-8 rounded-full transition-colors duration-300 bg-gray-100 dark:bg-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-gray-500 dark:text-gray-300 transition-transform duration-300"
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
        </div>

        <!-- Akcje na mobile pod treścią, poza przyciskiem wiersza -->
        <div v-if="isAdmin && !q.__pending" class="sm:hidden px-4 pb-3">
          <QuestionActions
            :question="q"
            @deleted="handleQuestionDeleted"
            @edit="handleQuestionEdited"
          />
        </div>
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
          v-else-if="page === pages && displayQuestions.length > 0"
          class="text-gray-500 dark:text-gray-400 italic"
        >
          Koniec wyników ({{ total }} pytań)
        </p>
        <!-- Dodajemy tymczasowy element, który zawsze będzie widoczny -->
        <div v-else class="h-10">&nbsp;</div>
      </div>
      </div>

      <aside class="hidden lg:block lg:col-span-3" data-testid="question-details">
        <div
          class="sticky top-20 xl:top-6 surface p-5 max-h-[calc(100vh-11rem)] xl:max-h-[calc(100vh-20rem)] overflow-y-auto overscroll-contain"
        >
          <QuestionEditor
            v-if="isAdmin && isEditing && selectedQuestion && !selectedQuestion.__pending"
            :question="selectedQuestion"
            @saved="handleInlineSaved"
            @cancel="isEditing = false"
            @conflict="handleConflict"
          />

          <template v-else-if="selectedQuestion">
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="min-w-0">
                <p class="text-xs font-mono text-gray-500 dark:text-gray-400">
                  <template v-if="selectedQuestion.__pending">Nowe pytanie</template>
                  <template v-else>ID {{ selectedQuestion.ID }}</template>
                </p>
                <p class="text-sm font-medium text-blue-700 dark:text-blue-300 truncate">
                  {{ selectedQuestion.category || 'Bez kategorii' }}
                </p>
              </div>
              <QuestionActions
                v-if="isAdmin && !selectedQuestion.__pending"
                :question="selectedQuestion"
                inline-edit
                @deleted="handleQuestionDeleted"
                @edit="handleQuestionEdited"
                @request-edit="startInlineEdit"
              />
            </div>

            <div
              v-if="selectedQuestion.__pending"
              class="mb-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 px-3 py-2 text-xs text-amber-800 dark:text-amber-200"
            >
              Pytanie czeka na wysłanie — pojawi się na serwerze po powrocie sieci.
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

    <!-- Mobile: szczegóły pytania w modalu (dostępny focus trap z BaseModal) -->
    <BaseModal :show="!!mobileQuestion" @close="mobileQuestion = null">
      <template #header>
        <span class="text-base sm:text-xl">
          {{ mobileQuestion?.__pending ? 'Nowe pytanie' : `Pytanie ID ${mobileQuestion?.ID}` }}
        </span>
      </template>

      <div v-if="mobileQuestion" class="text-left">
        <p class="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
          {{ mobileQuestion.category || 'Bez kategorii' }}
        </p>
        <h2 class="text-base font-semibold text-gray-800 dark:text-gray-100 break-words mb-4">
          {{ mobileQuestion.question }}
        </h2>

        <div v-if="hasAnswers(mobileQuestion)" class="space-y-2">
          <div
            v-for="(answer, key) in getAnswers(mobileQuestion)"
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
        <p v-else class="text-sm text-gray-500 dark:text-gray-400">Brak odpowiedzi.</p>

        <div v-if="mobileQuestion.description" class="mt-4">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opis:</h3>
          <p
            class="text-sm text-gray-600 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg break-words"
          >
            {{ mobileQuestion.description }}
          </p>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
          @click="mobileQuestion = null"
        >
          Zamknij
        </button>
      </template>
    </BaseModal>
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
const BaseModal = defineAsyncComponent(() => import('@/components/base/BaseModal.vue'));
const PageHeader = defineAsyncComponent(() => import('@/components/layout/PageHeader.vue'));
import apiClient from '@/api';
import { getAllCachedQuestions } from '@/services/questionsSync';
import { getPendingQuestionCreates } from '@/utils/pendingQuestions';
import { useStore } from 'vuex';

const store = useStore();
const showAlert = inject('showAlert');

// Stan komponentu
const search = ref('');
const questions = ref([]);
const pendingQuestions = ref([]);
const page = ref(1);
const limit = ref(20);
const total = ref(0);
const pages = ref(1);
const isLoading = ref(true);
const mobileQuestion = ref(null);
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

const pendingQuestionsForList = computed(() => {
  const query = search.value.trim().toLowerCase();
  if (!query) return pendingQuestions.value;
  return pendingQuestions.value.filter(
    (q) =>
      String(q.ID) === query || (q.question || '').toLowerCase().includes(query)
  );
});

// Pytania dodane offline pokazujemy na górze listy do czasu synchronizacji.
const displayQuestions = computed(() => [
  ...pendingQuestionsForList.value,
  ...filteredQuestions.value,
]);

function refreshPendingQuestions() {
  pendingQuestions.value = getPendingQuestionCreates();
}

watch(displayQuestions, (list) => {
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

    // Offline: pokaż pytania z lokalnego cache (IndexedDB).
    const cached = await getAllCachedQuestions();
    if (cached.length) {
      const query = search.value.trim().toLowerCase();
      let list = cached;
      if (query) {
        list = cached.filter(
          (q) =>
            String(q.ID) === query || (q.question || '').toLowerCase().includes(query)
        );
      }

      if (query) {
        questions.value = list.slice(0, 100);
        total.value = list.length;
        pages.value = 1;
      } else {
        const pageSize = limit.value;
        const start = (page.value - 1) * pageSize;
        const slice = list.slice(start, start + pageSize);
        questions.value = append ? [...questions.value, ...slice] : slice;
        total.value = list.length;
        pages.value = Math.max(1, Math.ceil(list.length / pageSize));
      }

      showAlert(
        'warning',
        'Brak połączenia — pokazuję pytania zapisane na urządzeniu.',
        5000
      );
      return;
    }

    console.error('Błąd podczas pobierania pytań:', e);
    showAlert('error', `Błąd pobierania pytań: ${e.message}`);

    if (!append) {
      questions.value = [];
      total.value = 0;
      pages.value = 1;
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

function startInlineEdit(question) {
  if (!isDesktop.value) return;
  if (question?.__pending) return; // najpierw musi trafić na serwer
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

function handleConflict(serverQuestion) {
  isEditing.value = false;
  if (serverQuestion && serverQuestion.ID) {
    handleQuestionEdited(serverQuestion);
  }
}

function moveSelection(index, delta) {
  const list = displayQuestions.value;
  const next = list[index + delta];
  if (!next) return;

  isEditing.value = false;

  if (isDesktop.value) {
    selectedQuestion.value = next;
  } else {
    // Na mobile szczegóły otwierają się w modalu — fokus zostaje na wierszu.
    mobileQuestion.value = next;
    return;
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
    mobileQuestion.value = question;
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

  // Zamknij szczegóły, jeśli dotyczyły usuwanego pytania
  if (mobileQuestion.value?.ID === question.ID) {
    mobileQuestion.value = null;
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

  if (event.key === '/' && !event.shiftKey && !typing) {
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
  refreshPendingQuestions();
  window.addEventListener('offline-queue-changed', refreshPendingQuestions);

  if (typeof window !== 'undefined') {
    desktopMediaQuery = window.matchMedia('(min-width: 1024px)');
    desktopMediaChangeHandler = (event) => {
      isDesktop.value = event.matches;
      if (event.matches) {
        selectedQuestion.value = displayQuestions.value[0] || null;
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
  window.removeEventListener('offline-queue-changed', refreshPendingQuestions);
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
