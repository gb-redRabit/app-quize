<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6 text-sky-700 dark:text-sky-300">Lista wszystkich pytań</h1>
    <div class="flex flex-col md:flex-row md:items-center gap-4 mb-6">
      <SearchBar
        :model-value="search"
        @update:search="handleSearch"
        placeholder="Szukaj po ID lub treści pytania..."
        class="flex-1"
      />
    </div>

    <!-- Stan ładowania -->
    <div v-if="isLoading && page === 1" class="mt-8">
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
      <button v-if="search" @click="clearSearch" class="mt-2 text-sky-600 hover:text-sky-800">
        Wyczyść wyszukiwanie
      </button>
    </div>

    <!-- Nowoczesna lista pytań -->
    <div v-else class="space-y-3">
      <div
        v-for="(q, idx) in filteredQuestions"
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
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800'
                        : 'bg-gray-100 dark:bg-gray-700/70 dark:border-gray-700'
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
                        class="ml-3 text-green-600 dark:text-green-400 font-medium text-sm bg-green-100 dark:bg-green-900/60 py-1 px-2 rounded"
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
                  class="text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/70 p-3 rounded-lg"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject, nextTick, onUnmounted } from 'vue';
import SearchBar from '@/components/base/SearchBar.vue';
import QuestionActions from '@/components/questions/QuestionActions.vue';
import BaseSkeleton from '@/components/base/BaseSkeleton.vue';
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
const loadingTrigger = ref(null);
let observer = null;

// Computed properties
const currentUser = computed(() => store.getters['user/getUser']);
const isAdmin = computed(() => currentUser.value?.rola === 'admin');
const filteredQuestions = computed(() => questions.value);

// Funkcje
async function fetchQuestions(forceRefresh = false, append = false) {
  isLoading.value = true;

  try {
    // Dodajmy timeout dla debugowania
    // await new Promise(resolve => setTimeout(resolve, 1000));

    const endpoint =
      search.value.trim() === ''
        ? `/questions?page=${page.value}&limit=${limit.value}`
        : `/questions/search?query=${encodeURIComponent(search.value.trim())}`;

    const res = await apiClient.get(endpoint);
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
      questions.value = questionsData;
    }

    total.value = totalCount;
    pages.value = pagesCount;
    searching.value = search.value.trim() !== '';
  } catch (e) {
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
    isLoading.value = false;
  }
}

function handleSearch(value) {
  search.value = value;
  page.value = 1;
  fetchQuestions(true);
}

function clearSearch() {
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
  fetchQuestions(true);
  const index = expandedQuestions.value.indexOf(question.ID);
  if (index > -1) {
    expandedQuestions.value.splice(index, 1);
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

      if (entry.isIntersecting && page.value < pages.value) {
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
onMounted(() => {
  // Dodanie timeout aby dać komponentowi czas na pełne zainicjowanie
  setTimeout(() => {
    fetchQuestions(true);
    setupInfiniteScroll();

    // Dodatkowe zabezpieczenie - sprawdzanie przewijania
    window.addEventListener('scroll', handleScroll);
  }, 100);
});

// Czyszczenie przy odmontowaniu komponentu
onUnmounted(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  // Usuwamy event listener
  window.removeEventListener('scroll', handleScroll);
});

// Watchers
watch(
  () => search.value,
  () => {
    page.value = 1;
  }
);

watch(
  () => page.value,
  () => {
    // Dajemy komponentowi czas na wyrenderowanie nowych elementów
    setTimeout(() => {
      if (loadingTrigger.value && observer) {
        // Re-obserwujemy element po zmianie strony
        observer.unobserve(loadingTrigger.value);
        observer.observe(loadingTrigger.value);
      }
    }, 200);
  }
);

// Dodajemy dodatkowy watcher na zmiany rozmiaru listy pytań
watch(
  () => filteredQuestions.value.length,
  (newLength) => {
    // Przy zmianie liczby pytań ponownie ustawiamy observer
    setTimeout(setupInfiniteScroll, 200);
  }
);

// Dodajemy nasłuchiwanie na zdarzenie przewijania jako zabezpieczenie
onMounted(() => {
  setTimeout(() => {
    fetchQuestions(true);
    setupInfiniteScroll();

    // Dodatkowe zabezpieczenie - sprawdzanie przewijania
    window.addEventListener('scroll', handleScroll);
  }, 100);
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  // Usuwamy event listener
  window.removeEventListener('scroll', handleScroll);
});

// Funkcja pomocnicza do wykrywania, czy strona została przewinięta do końca
function handleScroll() {
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const clientHeight = document.documentElement.clientHeight;

  // Jeśli przewinęliśmy do prawie końca strony
  if (scrollHeight - scrollTop - clientHeight < 300) {
    if (!isLoading.value && page.value < pages.value) {
      loadMore();
    }
  }
}
</script>

<style scoped>
/* Style dla dark mode */
:deep(.dark .bg-gray-750) {
  background-color: rgba(55, 65, 81, 0.5);
}
</style>
