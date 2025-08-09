<template>
  <div class="container mx-auto p-4 md:p-6">
    <!-- Header section -->
    <div
      class="mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 md:p-5 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div class="flex items-center gap-3">
          <!-- Kółko postępu -->
          <div class="relative h-14 w-14 flex-shrink-0">
            <svg class="h-full w-full" viewBox="0 0 36 36">
              <!-- Tło kółka -->
              <circle
                class="fill-transparent"
                cx="18"
                cy="18"
                r="15.5"
                :stroke="isDarkTheme ? '#2d3748' : '#f9fafb'"
                stroke-width="3"
              ></circle>

              <!-- Wypełnienie kółka postępu -->
              <circle
                class="fill-transparent"
                cx="18"
                cy="18"
                r="15.5"
                :stroke="isDarkTheme ? '#10b981' : '#10b981'"
                stroke-width="3"
                stroke-dasharray="97.5"
                :stroke-dashoffset="
                  categoryQuestionsCount ? 97.5 * (1 - flaggedCount / categoryQuestionsCount) : 97.5
                "
                transform="rotate(-90 18 18)"
              ></circle>

              <!-- Tekst wewnątrz kółka -->
              <text
                x="18"
                y="18"
                dy=".3em"
                text-anchor="middle"
                :fill="isDarkTheme ? '#e2e8f0' : '#4a5568'"
                class="text-xs font-medium"
              >
                {{ Math.round((flaggedCount / categoryQuestionsCount) * 100) || 0 }}%
              </text>
            </svg>

            <!-- Tooltip z dokładniejszymi danymi -->
            <div
              class="absolute -bottom-4 -left-4 h-9 w-9 bg-green-100 dark:bg-green-900 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center"
            >
              <span class="text-sm text-green-800 dark:text-green-200 font-bold">{{
                flaggedCount
              }}</span>
            </div>
            <div
              class="absolute -bottom-4 -right-4 h-9 w-9 bg-gray-400 dark:bg-gray-900 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center"
            >
              <span class="text-sm text-gray-800 dark:text-gray-200 font-bold">{{
                categoryQuestionsCount
              }}</span>
            </div>
          </div>

          <h1 class="ml-5 text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
            Pytania z kategorii:
            <span
              class="text-blue-600 dark:text-blue-400 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent"
            >
              {{ categoryLabel }}
            </span>
          </h1>
        </div>
      </div>
      <SearchBar v-model:search="searchQuery" placeholder="Szukaj po treści pytania lub ID..." />
    </div>
    <!-- Progress bar -->
    <div
      v-if="lastAttemptStats.total > 0"
      class="mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg"
    >
      <h2 class="text-lg font-semibold mb-2">Ostatnie podejście:</h2>
      <div class="flex justify-between mb-2 text-sm dark:text-gray-200">
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-green-400"></span>
          Poprawne: {{ lastAttemptStats.correct }}
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-red-400"></span>
          Niepoprawne: {{ lastAttemptStats.wrong }}
        </span>
      </div>
      <div class="h-2.5 rounded-full bg-gray-100 dark:bg-gray-700 flex overflow-hidden">
        <div
          v-if="lastAttemptStats.correct > 0"
          :style="{ width: (lastAttemptStats.correct / lastAttemptStats.total) * 100 + '%' }"
          class="h-full transition-all duration-500 ease-out bg-green-400"
        ></div>
        <div
          v-if="lastAttemptStats.wrong > 0"
          :style="{ width: (lastAttemptStats.wrong / lastAttemptStats.total) * 100 + '%' }"
          class="h-full transition-all duration-500 ease-out bg-red-400"
        ></div>
      </div>
    </div>

    <!-- Actions section -->
    <div class="flex flex-wrap gap-3 mb-6">
      <!-- Przycisk Pobierz pytania - widoczny dla wszystkich -->
      <BaseButton color="green" size="md" @click="downloadQuestionsTxt">
        <div class="flex items-center">
          <img src="@/assets/icons/download.svg" alt="Pobierz" class="h-5 w-5 mr-2 icon-filter" />
          <span>Pobierz pytania</span>
        </div>
      </BaseButton>

      <!-- Przyciski widoczne tylko dla administratorów -->
      <template v-if="isAdmin">
        <!-- Przycisk Pokaż duplikaty -->
        <BaseButton
          :color="showDuplicates ? 'blue' : 'yellow'"
          size="md"
          @click="showDuplicates = !showDuplicates"
        >
          <div class="flex items-center">
            <img
              src="@/assets/icons/document-duplicate.svg"
              alt="Duplikaty"
              class="h-5 w-5 mr-2 icon-filter"
            />
            <span>{{ showDuplicates ? 'Pokaż wszystkie' : 'Pokaż duplikaty' }}</span>
          </div>
        </BaseButton>

        <!-- Przycisk Sortuj według opisu -->
        <BaseButton color="blue" size="md" @click="toggleSortByDescription">
          <div class="flex items-center">
            <img src="@/assets/icons/bars-3.svg" alt="Sortuj" class="h-5 w-5 mr-2 icon-filter" />
            <span>
              Sortuj według opisu
              <span v-if="sortByDescription">(A-Z)</span>
              <span v-else>(domyślnie)</span>
            </span>
          </div>
        </BaseButton>

        <!-- Przycisk Zaznacz/Odznacz wszystkie -->
        <BaseButton color="green" size="md" :loading="massFlagLoading" @click="toggleAllFlagged">
          <div class="flex items-center">
            <img src="@/assets/icons/check.svg" alt="Zaznacz" class="h-5 w-5 mr-2 icon-filter" />
            <span>
              {{
                areAllFlagged
                  ? 'Odznacz wszystkie jako niesprawdzone'
                  : 'Oznacz wszystkie jako sprawdzone'
              }}
            </span>
          </div>
        </BaseButton>
      </template>
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
      <p>Brak pytań w tej kategorii</p>
      <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">
        Spróbuj zmienić kryteria wyszukiwania lub wybierz inną kategorię
      </p>
    </div>

    <!-- Questions list -->
    <div v-else class="space-y-6">
      <QuestionCard
        v-for="q in visibleQuestions"
        :key="q.ID"
        :question="q"
        :last-attempt-map="lastAttemptMap"
        @toggle-flagged="toggleFlagged"
        @toggle-bad="toggleBad"
        @toggle-unknown="toggleUnknown"
        @deleted="onQuestionDeleted"
        @edited="onQuestionEdited"
      />

      <!-- Load more indicator -->
      <div
        v-if="hasMoreQuestions"
        class="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500 text-sm"
      >
        <div
          class="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin mb-3"
        ></div>
        <span>Przewiń w dół, aby załadować więcej pytań...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, inject } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import SearchBar from '@/components/base/SearchBar.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import QuestionCard from '@/components/questions/QuestionCard.vue';
import apiClient from '@/api';

// Wstrzykiwane zależności
const showAlert = inject('showAlert');

// Stan komponentu
const loading = ref(true);
const searchQuery = ref('');
const displayCount = ref(100);
const loadingMore = ref(false);
const localQuestions = ref([]);
const showDuplicates = ref(false);
const sortByDescription = ref(false);
const massFlagLoading = ref(false);
// Dodaj forceUpdate tutaj, przed jego użyciem
const forceUpdate = ref(0);

// Store i router
const store = useStore();
const route = useRoute();

// Obliczane właściwości
const category = computed(() => route.params.category);
const categoryLabel = computed(() => (category.value === 'all' ? 'Wszystkie' : category.value));

const getQuestions = computed(() => store.getters['questions/getQuestions']);
const user = computed(() => store.getters['user/getUser']);

const isDarkTheme = computed(() => {
  return (
    document.documentElement.classList.contains('dark') ||
    localStorage.getItem('theme') === 'dark' ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
});

const lastAttempt = computed(() => {
  if (!user.value || !user.value.history) return null;

  // Szukaj wpisu z pytaniami z tej kategorii
  const entry = [...user.value.history].reverse().find(
    (entry) =>
      (entry.type === 'quiz' || entry.type === 'egzamin') &&
      entry.list.some((item) => {
        const q = getQuestions.value.find(
          (qq) =>
            qq.ID == item.id_questions ||
            qq.id == item.id_questions ||
            qq.Id == item.id_questions ||
            qq.id_question == item.id_questions
        );
        return category.value === 'all' || (q && q.category === category.value);
      })
  );

  if (!entry) return null;

  // Zwróć entry z listą ograniczoną do pytań z kategorii
  return {
    ...entry,
    list: entry.list.filter((item) => {
      const q = getQuestions.value.find(
        (qq) =>
          qq.ID == item.id_questions ||
          qq.id == item.id_questions ||
          qq.Id == item.id_questions ||
          qq.id_question == item.id_questions
      );
      return category.value === 'all' || (q && q.category === category.value);
    }),
  };
});

const lastAttemptMap = computed(() => {
  if (!lastAttempt.value) return {};

  const map = {};
  for (const item of lastAttempt.value.list) {
    if (typeof item.correct === 'boolean') {
      map[item.id_questions] = item.correct;
    } else if (item.answer) {
      const q = getQuestions.value.find(
        (qq) =>
          qq.ID == item.id_questions ||
          qq.id == item.id_questions ||
          qq.Id == item.id_questions ||
          qq.id_question == item.id_questions
      );

      if (q) {
        const keys = ['answer_a', 'answer_b', 'answer_c', 'answer_d'];
        const correctIdx = keys.findIndex((k) => q[k] && (q[k].isCorrect || q[k].isCorret));
        const correctLetter = ['A', 'B', 'C', 'D'][correctIdx];
        map[item.id_questions] = item.answer === correctLetter;
      }
    }
  }

  return map;
});

const lastAttemptStats = computed(() => {
  if (!lastAttempt.value) return { total: 0, correct: 0, wrong: 0 };

  let total = 0,
    correct = 0,
    wrong = 0;

  for (const item of lastAttempt.value.list) {
    const q = getQuestions.value.find(
      (qq) =>
        qq.ID == item.id_questions ||
        qq.id == item.id_questions ||
        qq.Id == item.id_questions ||
        qq.id_question == item.id_questions
    );

    if (category.value === 'all' || (q && q.category === category.value)) {
      total++;
      let isCorrect = null;

      if (typeof item.correct === 'boolean') {
        isCorrect = item.correct;
      } else if (item.answer && q) {
        const keys = ['answer_a', 'answer_b', 'answer_c', 'answer_d'];
        const correctIdx = keys.findIndex((k) => q[k] && (q[k].isCorrect || q[k].isCorret));
        const correctLetter = ['A', 'B', 'C', 'D'][correctIdx];
        isCorrect = item.answer === correctLetter;
      }

      if (isCorrect === true) correct++;
      else if (isCorrect === false) wrong++;
    }
  }

  return { total, correct, wrong };
});

const filteredQuestions = computed(() => {
  let questions =
    category.value === 'all'
      ? localQuestions.value
      : localQuestions.value.filter((q) => q.category === category.value);

  if (!searchQuery.value) return showDuplicates.value ? duplicateQuestions.value : questions;

  const q = searchQuery.value.toLowerCase();
  const base = showDuplicates.value ? duplicateQuestions.value : questions;

  return base.filter(
    (item) =>
      (item.ID && item.ID.toString().includes(q)) ||
      (item.question && item.question.toLowerCase().includes(q))
  );
});

const duplicateQuestions = computed(() => {
  const questions =
    category.value === 'all'
      ? localQuestions.value
      : localQuestions.value.filter((q) => q.category === category.value);

  const map = {};
  for (const q of questions) {
    const norm = normalizeQuestion(q.question);
    if (!map[norm]) map[norm] = [];
    map[norm].push(q);
  }

  return Object.values(map)
    .filter((arr) => arr.length > 1)
    .flat()
    .sort((a, b) => a.question.localeCompare(b.question));
});

const sortedQuestions = computed(() => {
  let questions = [...filteredQuestions.value];

  if (sortByDescription.value) {
    questions.sort((a, b) => {
      // Najpierw porównuj opisy
      const descA = (a.id || '').toLowerCase();
      const descB = (b.id || '').toLowerCase();

      // Jeśli opisy są różne, sortuj według nich
      if (descA !== descB) {
        return descA < descB ? -1 : 1;
      }

      // Jeśli opisy są takie same, sortuj według treści pytań jako zapasowe kryterium
      const qA = (a.question || '').toLowerCase();
      const qB = (b.question || '').toLowerCase();

      return qA.localeCompare(qB);
    });
  } else {
    const idsInAttempt = lastAttempt.value
      ? lastAttempt.value.list
          .filter((item) => {
            const q = getQuestions.value.find(
              (qq) =>
                qq.ID == item.id_questions ||
                qq.id == item.id_questions ||
                qq.Id == item.id_questions ||
                qq.id_question == item.id_questions
            );
            return category.value === 'all' || (q && q.category === category.value);
          })
          .map((item) => item.id_questions)
      : [];

    const wrong = [];
    const correct = [];
    const rest = [];

    for (const q of questions) {
      if (idsInAttempt.includes(q.ID)) {
        if (lastAttemptMap.value[q.ID] === false) wrong.push(q);
        else if (lastAttemptMap.value[q.ID] === true) correct.push(q);
        else rest.push(q);
      } else {
        rest.push(q);
      }
    }

    questions = [...wrong, ...correct, ...rest];
  }

  return questions;
});

const visibleQuestions = computed(() => {
  return sortedQuestions.value.slice(0, displayCount.value);
});

const hasMoreQuestions = computed(() => {
  return displayCount.value < sortedQuestions.value.length;
});

const areAllFlagged = computed(() => {
  // Używamy forceUpdate jako zależności reaktywnej, ale nie wpływa ona na wynik
  forceUpdate.value;

  const questions =
    category.value === 'all'
      ? localQuestions.value
      : localQuestions.value.filter((q) => q.category === category.value);

  return questions.length > 0 && questions.every((q) => q.flagged);
});

const categoryQuestionsCount = computed(() => {
  return category.value === 'all'
    ? localQuestions.value.length
    : localQuestions.value.filter((q) => q.category === category.value).length;
});

const flaggedCount = computed(() => {
  const questions =
    category.value === 'all'
      ? localQuestions.value
      : localQuestions.value.filter((q) => q.category === category.value);

  return questions.filter((q) => q.flagged).length;
});

// Funkcje
function normalizeQuestion(text) {
  if (!text) return '';

  return text
    .trim()
    .replace(/[\s:.\?!]+$/, '')
    .toLowerCase();
}

function handleScroll() {
  if (loadingMore.value || !hasMoreQuestions.value) return;

  const scrollY = window.scrollY || window.pageYOffset;
  const windowHeight = window.innerHeight;
  const docHeight = document.documentElement.scrollHeight;

  if (scrollY + windowHeight + 200 >= docHeight) {
    loadingMore.value = true;

    setTimeout(() => {
      if (displayCount.value >= sortedQuestions.value.length) {
        showAlert('info', 'Wszystkie pytania zostały załadowane.');
      }
      displayCount.value += 100;
      loadingMore.value = false;
    }, 200);
  }
}

function downloadQuestionsTxt() {
  const questions = sortedQuestions.value;

  if (!questions.length) {
    showAlert('warning', 'Brak pytań do pobrania.');
    return;
  }

  let txt = '';
  questions.forEach((q, idx) => {
    txt += `${idx + 1}. ${q.ID}. ${q.question}\n`;

    const answers = [
      { key: 'A', obj: q.answer_a },
      { key: 'B', obj: q.answer_b },
      { key: 'C', obj: q.answer_c },
      { key: 'D', obj: q.answer_d },
    ];

    answers.forEach((ans) => {
      if (ans.obj && ans.obj.answer) {
        txt += `   ${ans.key}. ${ans.obj.answer}`;
        if (ans.obj.isCorret || ans.obj.isCorrect) txt += '   [poprawna]';
        txt += '\n';
      }
    });

    if (q.description) txt += `   Opis: ${q.description}\n`;
    txt += '\n';
  });

  try {
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pytania_${categoryLabel.value}.txt`;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    showAlert('success', 'Pytania zostały pobrane.');
  } catch (e) {
    showAlert('error', 'Błąd podczas pobierania pytań.');
  }
}

function onQuestionDeleted(deletedQuestion) {
  localQuestions.value = localQuestions.value.filter((q) => q.ID !== deletedQuestion.ID);
  showAlert('success', 'Pytanie zostało usunięte.');
}

function onQuestionEdited(editedQuestion) {
  const idx = localQuestions.value.findIndex((q) => q.ID === editedQuestion.ID);

  if (idx !== -1) {
    localQuestions.value.splice(idx, 1, editedQuestion);
    showAlert('success', 'Pytanie zostało zaktualizowane.');
  } else {
    showAlert('warning', 'Nie znaleziono pytania do edycji.');
  }
}

async function toggleFlagged(q) {
  const prev = q.flagged;
  q.flagged = !q.flagged; // Optymistycznie zmień od razu

  try {
    const updated = { ...q, flagged: q.flagged };
    if ('_id' in updated) delete updated._id;

    await apiClient.put(`/questions/${q.ID}`, updated);

    // Dodajemy wymuszenie ponownego renderowania
    forceUpdate.value++;

    showAlert(
      'success',
      updated.flagged ? 'Pytanie oznaczone jako sprawdzone' : 'Oznaczenie usunięte'
    );
  } catch (e) {
    q.flagged = prev; // Cofnij zmianę w razie błędu
    showAlert('error', 'Błąd podczas zmiany oznaczenia pytania');
  }
}

async function toggleBad(q) {
  const prev = q.bad;
  q.bad = !q.bad;

  try {
    const updated = { ...q, bad: q.bad };
    if ('_id' in updated) delete updated._id;

    await apiClient.put(`/questions/${q.ID}`, updated);
    showAlert('success', updated.bad ? 'Pytanie oznaczone jako złe' : 'Oznaczenie usunięte');
  } catch (e) {
    q.bad = prev;
    showAlert('error', 'Błąd podczas zmiany oznaczenia "złe"');
  }
}

async function toggleUnknown(q) {
  const prev = q.unknown;
  q.unknown = !q.unknown;

  try {
    const updated = { ...q, unknown: q.unknown };
    if ('_id' in updated) delete updated._id;

    await apiClient.put(`/questions/${q.ID}`, updated);
    showAlert(
      'success',
      updated.unknown ? 'Pytanie oznaczone jako "nie wiem"' : 'Oznaczenie usunięte'
    );
  } catch (e) {
    q.unknown = prev;
    showAlert('error', 'Błąd podczas zmiany oznaczenia "nie wiem"');
  }
}

function toggleSortByDescription() {
  sortByDescription.value = !sortByDescription.value;

  // Opcjonalnie dodaj powiadomienie, aby użytkownik wiedział, że sortowanie zostało zmienione
  showAlert(
    'info',
    sortByDescription.value ? 'Sortowanie według opisu (A-Z)' : 'Przywrócono domyślne sortowanie'
  );
}

async function toggleAllFlagged() {
  const newValue = !areAllFlagged.value;
  massFlagLoading.value = true;

  // Pobierz wszystkie pytania z danej kategorii
  const questionsToUpdate =
    category.value === 'all'
      ? localQuestions.value
      : localQuestions.value.filter((q) => q.category === category.value);

  // Optymistycznie zaktualizuj lokalny stan
  questionsToUpdate.forEach((q) => {
    q.flagged = newValue;
  });

  // Podziel na mniejsze paczki
  const batchSize = 20;
  const batches = [];

  for (let i = 0; i < questionsToUpdate.length; i += batchSize) {
    batches.push(questionsToUpdate.slice(i, i + batchSize));
  }

  // Sekwencyjnie aktualizuj paczki pytań
  let processed = 0;

  const processBatch = (batchIndex) => {
    if (batchIndex >= batches.length) {
      showAlert(
        'success',
        newValue
          ? `Oznaczono wszystkie pytania (${questionsToUpdate.length}) jako sprawdzone`
          : `Usunięto oznaczenie "sprawdzone" ze wszystkich pytań (${questionsToUpdate.length})`
      );
      massFlagLoading.value = false;
      return;
    }

    const batch = batches[batchIndex];
    const batchPromises = batch.map((q) => {
      const updated = { ...q };
      if ('_id' in updated) delete updated._id;

      return apiClient.put(`/questions/${q.ID}`, updated).then(() => {
        processed++;
        if (processed % 10 === 0) {
          showAlert('info', `Aktualizowanie... ${processed}/${questionsToUpdate.length} pytań`);
        }
      });
    });

    Promise.all(batchPromises)
      .then(() => processBatch(batchIndex + 1))
      .catch((e) => {
        massFlagLoading.value = false;
        showAlert('error', `Błąd podczas aktualizacji pytań: ${e.message}`);
      });
  };

  processBatch(0);
}

// Inicjalizacja
onMounted(async () => {
  try {
    const questions = await store.dispatch('questions/fetchQuestionsByCategory', category.value);
    localQuestions.value = Array.isArray(questions) ? questions : [];
    loading.value = false;
  } catch (error) {
    showAlert('error', 'Błąd podczas ładowania pytań');
    localQuestions.value = [];
    loading.value = false;
  }

  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

// Obserwuj zmiany w lastAttempt i aktualizuj localQuestions
watch(lastAttempt, (newAttempt) => {
  if (!newAttempt) return;

  for (const item of newAttempt.list) {
    const q = localQuestions.value.find((qq) => qq.ID === item.id_questions);

    if (q) {
      if (typeof item.correct === 'boolean') {
        q.userAnswerCorrect = item.correct;
      } else if (item.answer) {
        const keys = ['answer_a', 'answer_b', 'answer_c', 'answer_d'];
        const correctIdx = keys.findIndex((k) => q[k] && (q[k].isCorrect || q[k].isCorret));
        const correctLetter = ['A', 'B', 'C', 'D'][correctIdx];
        q.userAnswerCorrect = item.answer === correctLetter;
      }
    }
  }
});

// Dodaj computed property do sprawdzania, czy użytkownik jest adminem
const isAdmin = computed(() => user.value?.rola === 'admin');
</script>

<style>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dodanie filtra dla ikon w trybie jasnym i ciemnym */
.icon-filter {
  filter: brightness(0) saturate(100%);
}

/* W trybie ciemnym zmieniamy kolor ikon na biały */
:root.dark .icon-filter,
.dark .icon-filter {
  filter: brightness(0) saturate(100%) invert(1);
}

/* Dla ikon już w przycisku o ciemnym tle */
.bg-green-500 .icon-filter,
.bg-blue-500 .icon-filter,
.bg-yellow-500 .icon-filter,
.bg-red-500 .icon-filter {
  filter: brightness(0) saturate(100%) invert(1);
}
</style>
