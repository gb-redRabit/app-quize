<template>
  <div class="app-shell">
    <!-- Nagłówek strony -->
    <PageHeader
      eyebrow="Baza pytań"
      title="Duplikaty pytań"
      subtitle="Porównaj pytania o tej samej treści i usuń nadmiarowe."
    >
      <template #actions>
        <span class="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
          {{ total }} pytań
        </span>
        <button
          @click="toggleSortByCategory"
          class="h-10 px-3 rounded-xl border text-sm font-medium whitespace-nowrap transition-colors"
          :class="
            sortByCategory
              ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
              : 'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200'
          "
        >
          Sortuj: kategoria
          <span class="text-xs opacity-70">{{ sortByCategory ? 'A-Z' : 'domyślnie' }}</span>
        </button>
        <select
          v-model="selectedCategory"
          class="h-10 w-full sm:w-64 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-gray-100 text-sm"
          aria-label="Filtruj duplikaty po kategorii"
        >
          <option value="">Wszystkie kategorie</option>
          <option v-for="cat in uniqueCategories" :key="cat" :value="cat">
            {{ cat || 'Bez kategorii' }}
          </option>
        </select>
      </template>
    </PageHeader>

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
      v-else-if="filteredGroups.length === 0"
      class="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-12 bg-white dark:bg-gray-800 rounded-xl shadow-xs"
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

    <!-- Grupy duplikatów -->
    <div v-else class="space-y-6">
      <section
        v-for="(group, groupIndex) in visibleGroups"
        :key="`group-${group[0].ID}`"
        class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 p-3"
      >
        <header class="flex flex-wrap items-center justify-between gap-2 px-1 pb-2">
          <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Grupa {{ groupIndex + 1 }} · {{ group.length }} pytań
          </h2>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            ID: {{ group.map((q) => q.ID).join(', ') }}
          </span>
        </header>

        <div class="grid gap-3" :class="group.length > 1 ? 'lg:grid-cols-2' : ''">
          <article
            v-for="q in group"
            :key="q.ID"
            class="surface overflow-hidden transition-all duration-200"
            :class="{
              'shadow-md ring-2 ring-blue-100 dark:ring-blue-900': expandedQuestions.includes(q.ID),
            }"
          >
            <!-- Nagłówek pytania -->
            <div
              class="flex items-start p-4 cursor-pointer transition-colors hover:bg-blue-50 dark:hover:bg-gray-700"
              :class="{
                'border-b border-gray-200 dark:border-gray-700': expandedQuestions.includes(q.ID),
                'bg-blue-50 dark:bg-gray-700': expandedQuestions.includes(q.ID),
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
          </article>
        </div>
      </section>

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
          v-else-if="page === pages && filteredGroups.length > 0"
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
import {
  ref,
  computed,
  onMounted,
  inject,
  nextTick,
  onBeforeUnmount,
  defineAsyncComponent,
} from 'vue';
import QuestionActions from '@/components/questions/QuestionActions.vue';
const PageHeader = defineAsyncComponent(() => import('@/components/layout/PageHeader.vue'));
import apiClient from '@/api';

const showAlert = inject('showAlert');
const loading = ref(true);
const groups = ref([]);
const expandedQuestions = ref([]);
const isLoading = ref(false);
const page = ref(1);
const groupsPerPage = 8;
const loadingTrigger = ref(null);
const sortByCategory = ref(false);
const selectedCategory = ref('');

const isAdmin = true; // lub pobierz z auth

const flatQuestions = computed(() => groups.value.flat());

const filteredGroups = computed(() => {
  let arr = groups.value.map((group) => group.slice());

  if (selectedCategory.value) {
    arr = arr.filter((group) =>
      group.some((q) => (q.category || 'Bez kategorii') === selectedCategory.value)
    );
  }

  if (sortByCategory.value) {
    arr.sort((a, b) => {
      const catA = (a[0]?.category || '').toLowerCase();
      const catB = (b[0]?.category || '').toLowerCase();
      if (catA !== catB) return catA.localeCompare(catB);
      return (a[0]?.question || '').localeCompare(b[0]?.question || '');
    });
  }

  return arr;
});

const total = computed(() => filteredGroups.value.reduce((sum, group) => sum + group.length, 0));
const pages = computed(() => Math.ceil(filteredGroups.value.length / groupsPerPage));
const visibleGroups = computed(() => filteredGroups.value.slice(0, page.value * groupsPerPage));

const uniqueCategories = computed(() => {
  const set = new Set(flatQuestions.value.map((q) => q.category || 'Bez kategorii'));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
});

function handleQuestionsRealtime() {
  loadQuestions();
}

onMounted(async () => {
  await loadQuestions();
  observeTrigger();
  window.addEventListener('questions-changed', handleQuestionsRealtime);
});
onBeforeUnmount(() => {
  if (observer) observer.disconnect();
  window.removeEventListener('questions-changed', handleQuestionsRealtime);
});

async function loadQuestions() {
  loading.value = true;
  try {
    const res = await apiClient.get('/questions/all');
    const list = Array.isArray(res.data.duplicates) ? res.data.duplicates : [];
    groups.value = list
      .map((group) => (Array.isArray(group) ? group.filter(Boolean) : []))
      .filter((group) => group.length > 1);
  } catch (e) {
    showAlert && showAlert('error', 'Błąd pobierania duplikatów: ' + e.message);
    groups.value = [];
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
  const id = deletedQuestion?.ID;
  groups.value = groups.value
    .map((group) => group.filter((q) => q.ID !== id))
    .filter((group) => group.length > 1);
  expandedQuestions.value = expandedQuestions.value.filter((qid) => qid !== id);
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
