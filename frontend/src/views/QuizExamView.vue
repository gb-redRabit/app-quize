<template>
  <div
    class="container mx-auto px-4 py-6"
    :class="!showSummary ? 'pb-28 lg:pb-6' : ''"
  >
    <div class="mx-auto">
      <!-- Widok pytania (gdy nie pokazujemy podsumowania) -->
      <div v-if="!showSummary" class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6">
        <!-- Nagłówek z informacjami -->
        <div
          class="bg-white p-4 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 dark:bg-gray-800 dark:text-white mb-6"
        >
          <div class="flex justify-center items-center space-x-3">
            <div
              v-if="mode !== 'exam'"
              class="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600 shadow-2xl shrink-0 dark:bg-blue-800 dark:text-blue-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <!-- Timer - tylko dla trybu egzaminu -->
            <div
              v-if="mode === 'exam'"
              :class="[
                'hidden lg:flex justify-center h-10 w-24 items-center gap-2 px-3 py-1.5 rounded-full font-medium',
                timeLeft < 300
                  ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 animate-pulse'
                  : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
              ]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{{ formattedTime }}</span>
            </div>
            <h1 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
              {{
                questions[currentQuestionIndex] && questions[currentQuestionIndex].category
                  ? questions[currentQuestionIndex].category.length > 60
                    ? questions[currentQuestionIndex].category.slice(0, 60) + '…'
                    : questions[currentQuestionIndex].category
                  : mode === 'exam'
                    ? 'Egzamin'
                    : 'Quiz'
              }}
            </h1>
          </div>
          <div class="w-full max-w-sm">
            <ProgressBar
              :current="answeredCount"
              :total="questions.length"
              class="flex-grow sm:w-48"
            />
          </div>
        </div>
        <!-- Dodaj do nagłówka quizu (np. pod ProgressBar) -->
        <div v-if="mode === 'quiz'" class="flex items-center gap-4 mb-2">
          <button
            @click="toggleAutoNext"
            class="px-4 py-2 rounded-lg font-semibold shadow-sm transition-colors duration-200"
            :class="autoNextEnabled ? 'bg-green-700 text-white hover:bg-green-800' : 'bg-gray-300 text-gray-700'"
            style="min-width: 120px"
          >
            Auto-Next: <span>{{ autoNextEnabled ? 'ON' : 'OFF' }}</span>
          </button>
          <div
            v-if="showAutoNextTimer"
            class="ml-2 text-sm text-gray-500 dark:text-gray-300 flex items-center"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Następne za {{ autoNextTimer }}s
          </div>
        </div>
        <!-- Przyciski nawigacji - desktop (na mobile stały dolny pasek) -->
        <div v-if="!showSummary" class="hidden lg:grid grid-cols-2 gap-4 mb-6">
          <button
            class="flex items-center justify-center px-4 py-3 rounded-xl bg-gray-500 text-white font-medium text-base transition-all duration-200 shadow-xs hover:bg-gray-600"
            :class="{ 'opacity-50 cursor-not-allowed': currentQuestionIndex === 0 }"
            @click="prevQuestion"
            :disabled="currentQuestionIndex === 0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <span>Poprzednie</span>
          </button>

          <button
            class="flex items-center justify-center px-4 py-3 rounded-xl text-white font-medium text-base transition-all duration-200 shadow-xs"
            :class="{
              'opacity-50 cursor-not-allowed': !(
                answersStatus[currentQuestionIndex] && answersStatus[currentQuestionIndex].answered
              ),
              'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600':
                currentQuestionIndex === questions.length - 1,
              'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600':
                currentQuestionIndex !== questions.length - 1,
            }"
            @click="nextOrFinish"
            :disabled="
              !(answersStatus[currentQuestionIndex] && answersStatus[currentQuestionIndex].answered)
            "
          >
            <span>{{
              currentQuestionIndex === questions.length - 1
                ? mode === 'exam'
                  ? 'Zakończ egzamin'
                  : 'Zakończ quiz'
                : 'Następne'
            }}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4-4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <!-- Loader podczas ładowania - usunięto BaseLoader -->
        <div v-if="loading" class="flex justify-center items-center py-16">
          <div
            class="spinner w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"
          ></div>
        </div>

        <div v-else-if="!questions || questions.length === 0" class="py-16 text-center">
          <p class="text-lg text-gray-600 dark:text-gray-400">
            Nie znaleziono żadnych pytań dla wybranych kryteriów.
          </p>
          <button
            @click="goToHome"
            class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Powrót do strony głównej
          </button>
        </div>
        <div v-else>
          <!-- Renderujemy tylko aktualne pytanie (zamiast całej puli w DOM) -->
          <div
            class="space-y-6"
            @touchstart.passive="onTouchStart"
            @touchend.passive="onTouchEnd"
          >
            <QuestionList
              v-if="currentQuestion"
              ref="questionList"
              :question="currentQuestion"
              :answered="answersStatus[currentQuestionIndex].answered"
              :selected="answersStatus[currentQuestionIndex].selected"
              :selectedKey="answersStatus[currentQuestionIndex].selectedKey"
              :showCorrect="answersStatus[currentQuestionIndex].answered && mode === 'quiz'"
              :questionNumber="`${currentQuestionIndex + 1} `"
              @select="selectAnswer"
            />
          </div>

          <!-- Nawigacja między pytaniami (desktop) -->
          <div class="mt-16" v-if="isDesktop && questions.length > 0 && mode !== 'exam'">
            <QuestionNavigation
              :questions="questions"
              :answersStatus="answersStatus"
              :currentIdx="currentQuestionIndex"
              :showSummary="showSummary"
              @goTo="goToQuestion"
            />
          </div>
        </div>
      </div>

      <!-- Podsumowanie -->
      <transition name="slide-up" mode="out-in">
        <SummaryBox
          v-if="showSummary"
          :questions="questions"
          :answersStatus="answersStatus"
          :score="score"
          :total="quizLength"
          :userAnswerText="userAnswerText"
          :correctAnswerText="correctAnswerText"
          :allQuestionsCompleted="allQuestionsCompleted"
          @restart="restartQuiz"
          @retry-wrong="retryWrongQuestions"
          @go-home="goToHome"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 dark:text-white"
        ></SummaryBox>
      </transition>
    </div>

    <!-- Stały pasek akcji quizu na mobile -->
    <div
      v-if="!showSummary"
      class="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-nav"
      style="padding-bottom: env(safe-area-inset-bottom)"
    >
      <div class="flex items-center gap-3 p-3">
        <button
          class="flex-1 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold disabled:opacity-40"
          :disabled="currentQuestionIndex === 0"
          aria-label="Poprzednie pytanie"
          @click="prevQuestion"
        >
          Poprzednie
        </button>
        <button
          v-if="mode === 'quiz'"
          class="h-12 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-medium"
          aria-label="Pokaż listę pytań"
          @click="showQuestionSheet = true"
        >
          Pytania
          <span class="block text-[10px] text-gray-500 dark:text-gray-400">
            {{ currentQuestionIndex + 1 }}/{{ questions.length }}
          </span>
        </button>
        <div
          v-else
          class="h-12 px-3 rounded-xl bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 flex items-center justify-center font-semibold tabular-nums min-w-[4.5rem]"
          aria-live="polite"
          :aria-label="`Pozostało ${formattedTime}`"
        >
          {{ formattedTime }}
        </div>
        <button
          class="flex-1 h-12 rounded-xl text-white font-semibold disabled:opacity-100"
          :class="
            currentAnswered
              ? currentQuestionIndex === questions.length - 1
                ? 'bg-green-700 hover:bg-green-800'
                : 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
          "
          :disabled="!currentAnswered"
          :aria-label="
            currentQuestionIndex === questions.length - 1
              ? mode === 'exam'
                ? 'Zakończ egzamin'
                : 'Zakończ quiz'
              : 'Następne pytanie'
          "
          @click="nextOrFinish"
        >
          {{
            currentQuestionIndex === questions.length - 1
              ? mode === 'exam'
                ? 'Zakończ egzamin'
                : 'Zakończ'
              : 'Następne'
          }}
        </button>
      </div>
    </div>

    <!-- Arkusz nawigacji pytaniami (mobile) -->
    <div v-if="showQuestionSheet" class="fixed inset-0 z-40 lg:hidden">
      <div
        class="absolute inset-0 bg-gray-900/50"
        @click="showQuestionSheet = false"
      ></div>
      <div
        class="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto"
        style="padding-bottom: calc(1rem + env(safe-area-inset-bottom))"
      >
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-base font-semibold text-gray-800 dark:text-gray-100">Pytania</h3>
          <button
            class="h-10 px-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium"
            @click="showQuestionSheet = false"
          >
            Zamknij
          </button>
        </div>
        <div class="grid grid-cols-6 gap-2">
          <button
            v-for="(question, idx) in questions"
            :key="question.ID || idx"
            class="h-10 rounded-full text-sm font-semibold transition-colors"
            :class="sheetButtonClass(idx)"
            :aria-current="idx === currentQuestionIndex ? 'true' : undefined"
            :aria-label="sheetButtonLabel(idx)"
            @click="jumpToQuestion(idx)"
          >
            {{ idx + 1 }}
          </button>
        </div>

        <!-- Legenda kolorów -->
        <div
          class="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600 dark:text-gray-400"
        >
          <span class="flex items-center gap-1.5">
            <span class="h-2.5 w-2.5 rounded-full ring-2 ring-blue-500"></span>
            Aktualne
          </span>
          <span class="flex items-center gap-1.5">
            <span class="h-2.5 w-2.5 rounded-full bg-green-500"></span>
            Poprawne
          </span>
          <span class="flex items-center gap-1.5">
            <span class="h-2.5 w-2.5 rounded-full bg-red-500"></span>
            Błędne
          </span>
          <span class="flex items-center gap-1.5">
            <span class="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
            Bez odpowiedzi
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  inject,
  defineAsyncComponent,
} from 'vue';
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router';
import { useStore } from 'vuex';
import apiClient from '@/api';
const QuestionList = defineAsyncComponent(() => import('@/components/questions/QuestionList.vue'));
const QuestionNavigation = defineAsyncComponent(
  () => import('@/components/questions/QuestionNavigation.vue')
);
const SummaryBox = defineAsyncComponent(() => import('@/components/questions/SummaryBox.vue'));
const ProgressBar = defineAsyncComponent(() => import('@/components/questions/ProgressBar.vue'));
import { getRandomUniqueQuestions } from '@/utils/randomQuestions';
import { shuffleArray } from '@/utils/shuffleArray';
import {
  buildProgressSignature,
  computeRemainingSeconds,
  shouldSaveProgress,
} from '@/utils/quizProgress';
import { getCachedQuestionsByIds } from '@/services/questionsSync';
import { queueHquestion, queueHistory } from '@/services/offlineSync';
import { newClientId } from '@/utils/offlineQueue';

// Zależności
const router = useRouter();
const route = useRoute();
const store = useStore();
const showAlert = inject('showAlert');

// Parametry przekazywane z URL
const mode = computed(() => (route.name === 'ExamView' ? 'exam' : 'quiz'));
const hquestion = computed(() => store.getters['user/getHquestion'] || []);
const initialQuizLength = parseInt(route.query.length, 10) || 10;

// Stan komponentu
const questions = ref([]);
const currentQuestionIndex = ref(0);
const currentQuestion = computed(
  () => questions.value[currentQuestionIndex.value] || null
);
const currentAnswered = computed(
  () => !!answersStatus.value[currentQuestionIndex.value]?.answered
);
const score = ref(0);
const loading = ref(true);
const answersStatus = ref([]);
const showSummary = ref(false);
watch(showSummary, (visible) => {
  if (visible && typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});
const showQuestionSheet = ref(false);
const isDesktop = ref(
  typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false
);
let desktopMediaQuery = null;
let desktopMediaChangeHandler = null;
const questionTimes = ref([]);
const isCorrection = ref(false);
const shuffledAnswers = ref([]);
const quizLength = ref(initialQuizLength);
const startTime = ref(null);
const wrongOrNotDoneIdsCache = ref([]);
const questionList = ref(null);
const quizActivityInterval = ref(null); // <-- DODAJ TĘ LINIĘ
const allQuestionIdsInCategory = ref([]);
// Stan timera (tylko dla trybu egzaminu)
const examTimeMinutes = ref(parseInt(route.query.time, 10) || 60);
const timeLeft = ref(examTimeMinutes.value * 60);
const timer = ref(null);
// Moment startu egzaminu — pozwala wyliczyć pozostały czas niezależnie od tego,
// kiedy ostatnio zapisano stan.
const examStartedAt = ref(null);

// Auto-Next
const autoNextEnabled = ref(true); // domyślnie włączone
const showAutoNextTimer = ref(false);
const autoNextTimer = ref(5);
let autoNextTimeout = null;
let autoNextInterval = null;

function toggleAutoNext() {
  autoNextEnabled.value = !autoNextEnabled.value;
  showAutoNextTimer.value = false;
  clearAutoNextTimers();
}

function clearAutoNextTimers() {
  if (autoNextTimeout) {
    clearTimeout(autoNextTimeout);
    autoNextTimeout = null;
  }
  if (autoNextInterval) {
    clearInterval(autoNextInterval);
    autoNextInterval = null;
  }
  showAutoNextTimer.value = false;
}

// Helper do znajdowania poprawnego klucza odpowiedzi
const getCorrectKey = (q) => {
  const keys = ['answer_a', 'answer_b', 'answer_c', 'answer_d'];
  return keys.find((k) => q[k] && (q[k].isCorret || q[k].isCorrect));
};

// Computed properties
const formattedTime = computed(() => {
  const min = Math.floor(timeLeft.value / 60)
    .toString()
    .padStart(2, '0');
  const sec = (timeLeft.value % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
});

const answeredCount = computed(() => {
  return (answersStatus.value || []).filter((a) => a.answered).length;
});

// Ostrzeżenie przed utratą niezakończonego quizu/egzaminu.
const quizInProgress = computed(
  () =>
    questions.value.length > 0 &&
    !showSummary.value &&
    (answeredCount.value > 0 || currentQuestionIndex.value > 0)
);

function handleBeforeUnload(event) {
  saveProgress();
  if (!quizInProgress.value) return;
  event.preventDefault();
  event.returnValue = '';
}

onBeforeRouteLeave(() => {
  if (!quizInProgress.value) return true;
  return window.confirm(
    'Masz niezakończony quiz. Postęp zostanie zapisany i wznawiany po powrocie na ten sam adres. Czy na pewno chcesz wyjść?'
  );
});

const allQuestionsCompleted = computed(() => {
  if (!route.query.categories || !allQuestionIdsInCategory.value.length) return false;
  // Każde pytanie musi mieć wpis w historii i być poprawnie rozwiązane
  return allQuestionIdsInCategory.value.every((id) =>
    hquestion.value.some(
      (hq) =>
        String(hq.id) === String(id) &&
        hq.category === route.query.categories &&
        hq.correct === true
    )
  );
});

// Funkcja inicjalizująca timer (tylko dla egzaminu)
const startTimer = () => {
  if (mode.value !== 'exam') return;

  clearInterval(timer.value);
  timer.value = setInterval(async () => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      clearInterval(timer.value);
      showSummary.value = true;
      answersStatus.value = answersStatus.value.map((a) =>
        a.answered ? a : { answered: true, selected: null, selectedKey: null }
      );
      await saveUserHistory();
    }
  }, 1000);
};

// Funkcje obsługujące pobieranie pytań
const fetchQuestions = async () => {
  try {
    const category = route.query.categories || 'all';
    let fetchedQuestions;

    // Jeśli znamy konkretne ID (quiz/egzamin), pobierz tylko je (bez całej kategorii)
    if (route.query.ids) {
      const ids = route.query.ids
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);

      // Najpierw lokalny cache PWA — start quizu bez czekania na sieć.
      const cached = await getCachedQuestionsByIds(ids);
      if (cached.length === ids.length) {
        fetchedQuestions = cached;
      } else {
        const response = await apiClient.get('/questions', {
          params: { ids: ids.join(',') },
          noCache: true,
        });
        fetchedQuestions = response.data?.questions || [];
      }
    } else {
      fetchedQuestions = await store.dispatch(
        'questions/fetchQuestionsByCategory',
        category
      );
    }

    if (!fetchedQuestions || fetchedQuestions.length === 0) {
      showAlert?.('warning', 'Brak pytań w wybranej kategorii.');
      questions.value = [];
      answersStatus.value = []; // Inicjalizacja pustą tablicą
      loading.value = false;
      return;
    }

    questions.value = getRandomUniqueQuestions(fetchedQuestions, quizLength.value);
    answersStatus.value = Array(questions.value.length)
      .fill()
      .map(() => ({
        answered: false,
        selected: null,
        selectedKey: null,
      }));

    loading.value = false;
  } catch (error) {
    console.error('Error fetching questions:', error);
    showAlert?.('error', `Błąd podczas pobierania pytań: ${error.message}`);
    questions.value = [];
    answersStatus.value = []; // Inicjalizacja pustą tablicą
    loading.value = false;
  }
};

// Obsługa wyboru odpowiedzi
const selectAnswer = async (index, selectedKey) => {
  // Dodaj sprawdzenie czy istnieją pytania i odpowiedzi
  if (
    !questions.value ||
    questions.value.length === 0 ||
    !answersStatus.value ||
    currentQuestionIndex.value >= answersStatus.value.length
  ) {
    return;
  }

  if (answersStatus.value[currentQuestionIndex.value].answered) return;

  const q = questions.value[currentQuestionIndex.value];
  const id = q.ID || q.id || q.Id || q.id_question;

  if (!id) {
    showAlert?.('error', 'Brak ID pytania!');
    return;
  }

  const isCorrect = selectedKey === getCorrectKey(q);

  if (isCorrect) score.value++;

  // Aktualizacja lokalnego stanu natychmiast (optimizm)
  answersStatus.value[currentQuestionIndex.value] = {
    answered: true,
    correct: isCorrect,
    selected: index,
    selectedKey,
  };

  // Zapisz czas odpowiedzi
  const now = Date.now();
  questionTimes.value[currentQuestionIndex.value] = (now - startTime.value) / 1000;

  // LOKALNA aktualizacja historii (szybko, synchronicznie)
  try {
    const updatedHQ = [...(store.state.user.hquestion || [])];

    const existingIndex = updatedHQ.findIndex(
      (item) => String(item.id) === String(id) && item.category === q.category
    );

    if (existingIndex !== -1) {
      updatedHQ[existingIndex].correct = isCorrect;
    } else {
      updatedHQ.push({
        id,
        correct: isCorrect,
        category: q.category || '',
      });
    }

    // commit lokalny (od razu widoczny w UI)
    store.commit('user/SET_HQUESTION', updatedHQ);

    // WYWOŁANIA SIECIOWE BEZ AWAIT (fire-and-forget) - nie blokują UI
    apiClient
      .post('/users/hquestion', {
        id,
        correct: isCorrect,
        category: q.category,
      })
      .catch((err) => {
        console.error('Błąd zapisu hquestion:', err);
        // Offline: zapisz w kolejce i doślij, gdy wróci sieć.
        if (!err?.response) {
          queueHquestion({ id, correct: isCorrect, category: q.category });
        }
      });

    // aktualizacja cache asynchronicznie, bez await
    updateWrongOrNotDoneCache().catch((err) => {
      console.error('Błąd updateWrongOrNotDoneCache:', err);
    });
  } catch (e) {
    // nie powinno blokować Auto-Next
    console.error('Błąd podczas lokalnej aktualizacji historii:', e);
  }

  // --- AUTO-NEXT dla quizu (wykonaj natychmiast, NIE czekaj na sieć) ---
  if (mode.value === 'quiz' && autoNextEnabled.value) {
    clearAutoNextTimers();

    if (isCorrect) {
      // Poprawna: natychmiast przejdź do kolejnego pytania lub zakończ quiz
      if (currentQuestionIndex.value < questions.value.length - 1) {
        currentQuestionIndex.value++;
      } else {
        // ostatnie pytanie -> pokaż podsumowanie i zapisz historię
        showSummary.value = true;
        // fire-and-forget zapis historii
        saveUserHistory().catch((err) => console.error('Błąd zapisu historii:', err));
      }
    } else {
      // Błędna: pokaż licznik natychmiast i po 5s przejdź dalej
      showAutoNextTimer.value = true;
      autoNextTimer.value = 5;

      autoNextInterval = setInterval(() => {
        autoNextTimer.value--;
        if (autoNextTimer.value <= 0) {
          clearInterval(autoNextInterval);
          autoNextInterval = null;
        }
      }, 1000);

      autoNextTimeout = setTimeout(() => {
        showAutoNextTimer.value = false;
        if (currentQuestionIndex.value < questions.value.length - 1) {
          currentQuestionIndex.value++;
        } else {
          showSummary.value = true;
          saveUserHistory().catch((err) => console.error('Błąd zapisu historii:', err));
        }
        clearAutoNextTimers();
      }, 5000);
    }
  }
  // --- KONIEC AUTO-NEXT ---
};

// Aktualizacja cache pytań do powtórzenia
const updateWrongOrNotDoneCache = async () => {
  if (!route.query.categories) return;

  try {
    const cat = route.query.categories;
    const allIds = await store.dispatch('questions/fetchQuestionIdsByCategory', cat);

    const historyRes = await apiClient.get('/users/hquestion');
    const hq = historyRes.data.filter((q) => q.category === cat);

    const filteredIds = allIds.filter((id) => {
      const entry = hq.find(
        (q) =>
          String(q.id) === String(id) ||
          String(q.ID) === String(id) ||
          String(q.question_id) === String(id)
      );
      return !entry || entry.correct === false;
    });

    wrongOrNotDoneIdsCache.value = filteredIds;
  } catch (error) {
    console.error('Błąd podczas aktualizowania cache:', error);
    wrongOrNotDoneIdsCache.value = [];
  }
};

// Nawigacja między pytaniami
const nextOrFinish = async () => {
  // Dodaj sprawdzenie
  if (!questions.value || questions.value.length === 0) return;

  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++;
  } else {
    showSummary.value = true;

    if (mode.value === 'exam') {
      clearInterval(timer.value);
    }

    await saveUserHistory();
  }
};

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) currentQuestionIndex.value--;
};

// Swipe: lewo = następne, prawo = poprzednie (tylko quiz)
let touchStartX = null;
const onTouchStart = (event) => {
  if (showSummary.value) return;
  touchStartX = event.changedTouches[0]?.clientX ?? null;
};
const onTouchEnd = (event) => {
  if (touchStartX === null || showSummary.value) return;
  const deltaX = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
  touchStartX = null;
  if (Math.abs(deltaX) < 60) return;
  if (deltaX < 0) {
    if (answersStatus.value[currentQuestionIndex.value]?.answered) {
      nextOrFinish();
    }
  } else {
    prevQuestion();
  }
};

const goToQuestion = (idx) => {
  if (!showSummary.value) currentQuestionIndex.value = idx;
};

const jumpToQuestion = (idx) => {
  goToQuestion(idx);
  showQuestionSheet.value = false;
};

// Kolory przycisków w arkuszu pytań (mobile): poprawność + zaznaczenie.
function sheetButtonClass(idx) {
  const status = answersStatus.value[idx];
  let base = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  if (status?.answered) {
    base = status.correct
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }
  return idx === currentQuestionIndex.value ? `${base} ring-2 ring-blue-500` : base;
}

function sheetButtonLabel(idx) {
  const status = answersStatus.value[idx];
  const state = status?.answered
    ? status.correct
      ? 'poprawne'
      : 'błędne'
    : 'bez odpowiedzi';
  const current = idx === currentQuestionIndex.value ? ', aktualne' : '';
  return `Pytanie ${idx + 1}, ${state}${current}`;
}

// Zapis historii
const saveUserHistory = async () => {
  try {
    const keyToLetter = {
      answer_a: 'A',
      answer_b: 'B',
      answer_c: 'C',
      answer_d: 'D',
    };

    const historyItem = {
      clientId: newClientId(),
      type: isCorrection.value
        ? mode.value === 'exam'
          ? 'Egzamin - poprawa błędów'
          : 'Quiz - poprawa błędów'
        : mode.value,
      category: route.query.categories || 'all',
      correct: score.value,
      wrong: questions.value.length - score.value,
      data: new Date().toISOString(),
      time: mode.value === 'exam' ? examTimeMinutes.value * 60 - timeLeft.value : null,
      questionTimes: questionTimes.value,
      list: questions.value.map((q, idx) => {
        const selectedKey = answersStatus.value[idx].selectedKey || '';
        const correctKey = getCorrectKey(q);
        const selectedLetter = selectedKey ? keyToLetter[selectedKey] || '?' : '';
        const correctLetter = correctKey ? keyToLetter[correctKey] || '?' : '';
        return {
          id_questions: q.ID || q.id || q.Id || q.id_question,
          answer: selectedKey,
          answerLetter: selectedLetter,
          correctLetter: correctLetter,
          correct: selectedKey === correctKey,
        };
      }),
    };

    // 1. Optymistyczna aktualizacja lokalnie
    const updatedHistory = [...store.state.user.history, historyItem];
    store.commit('user/SET_USER_HISTORY', updatedHistory);

    window.dispatchEvent(
      new CustomEvent('quiz-completed', {
        detail: { score: score.value, total: questions.value.length },
      })
    );

    // 2. POKAŻ ALERT OD RAZU
    showAlert?.('success', 'Wyniki zostały zapisane.');

    // 3. Synchronizuj z API i odśwież dane w tle (nie await!)
    apiClient
      .put('/users/update-profile', { addHistory: historyItem })
      .then(() => forceDataRefresh())
      .catch((error) => {
        if (!error?.response) {
          // Offline: wynik zostaje w kolejce i dotrze po powrocie sieci.
          queueHistory(historyItem);
          showAlert?.('info', 'Brak sieci — wynik zapisany lokalnie i wysłany później.');
        } else {
          showAlert?.('error', 'Błąd podczas zapisywania wyników.');
        }
        console.error('Błąd zapisu historii:', error);
      });
  } catch (error) {
    showAlert?.('error', 'Błąd podczas zapisywania wyników.');
    console.error('Błąd zapisu historii:', error);
  }
};

// Helper functions
const userAnswerText = (q, selectedKey) => {
  if (!selectedKey) return '';
  return q[selectedKey]?.answer || '';
};

const correctAnswerText = (q) => {
  const correctKey = getCorrectKey(q);
  return correctKey && q[correctKey]?.answer ? q[correctKey].answer : '';
};

const forceDataRefresh = async () => {
  try {
    // 1. Pobierz najnowsze dane z serwera
    await apiClient.clearCache();
    await store.dispatch('user/fetchUserHistoryAndHQ');
    await store.dispatch('questions/fetchStats');

    // 2. Ręcznie aktualizuj cache
    await updateWrongOrNotDoneCache();

    // 3. Wymuś odświeżenie komponentów przez zdarzenie
    window.dispatchEvent(
      new CustomEvent('user-data-refreshed', {
        detail: {
          timestamp: Date.now(),
          forceUIUpdate: true,
        },
      })
    );
  } catch (error) {
    console.error('Błąd podczas odświeżania danych:', error);
  }
};

// Restart quizu/egzaminu
const restartQuiz = async (onlyFailedOrNotAnswered = false) => {
  currentQuestionIndex.value = 0;
  score.value = 0;
  loading.value = true;
  isCorrection.value = false;

  // Przed pobraniem nowych pytań, zaktualizuj cache
  await updateWrongOrNotDoneCache();

  if (mode.value === 'exam') {
    // Logika restartu dla egzaminu
    timeLeft.value = examTimeMinutes.value * 60;
    examStartedAt.value = Date.now();
    startTime.value = Date.now();

    if (route.query.categories) {
      try {
        const wrongOrNotDoneIds = wrongOrNotDoneIdsCache.value;

        if (wrongOrNotDoneIds.length === 0) {
          showAlert?.('success', 'Wszystkie pytania z tej kategorii zostały zaliczone!');
          return;
        }

        const length = Math.min(quizLength.value, wrongOrNotDoneIds.length);

        router.replace({
          name: route.name,
          query: {
            ...route.query,
            ids: wrongOrNotDoneIds.join(','),
            length,
            r: Math.random().toString(36).substring(2, 8),
          },
        });
      } catch (error) {
        showAlert?.('error', 'Błąd podczas pobierania pytań');
        console.error('Błąd:', error);
      }
    } else {
      // Standardowo: losuj z kategorii
      fetchQuestions();
      startTimer();
    }
  } else {
    // Logika restartu dla quizu
    if (onlyFailedOrNotAnswered && route.query.categories) {
      try {
        const wrongOrNotDoneIds = wrongOrNotDoneIdsCache.value;

        if (wrongOrNotDoneIds.length === 0) {
          router.push('/');
          showAlert?.('success', 'Wszystkie pytania z tej kategorii zostały zaliczone!');
          return;
        }

        const length = Math.min(parseInt(route.query.length, 10) || 10, wrongOrNotDoneIds.length);

        router.replace({
          name: route.name,
          query: {
            ...route.query,
            ids: wrongOrNotDoneIds.join(','),
            length,
            onlyNotDone: 'true',
            r: Math.random().toString(36).substring(2, 8),
          },
        });
      } catch (e) {
        console.error('Błąd podczas przygotowywania powtórki:', e);
        showAlert?.('error', 'Błąd podczas przygotowywania powtórki.');
        loading.value = false;
      }
    } else {
      // Standardowe pobieranie pytań
      fetchQuestions();
      startTime.value = Date.now();
    }
  }
};

const retryWrongQuestions = () => {
  if (
    !questions.value ||
    !answersStatus.value ||
    questions.value.length === 0 ||
    answersStatus.value.length === 0
  ) {
    showAlert?.('warning', 'Brak pytań do poprawy.');
    return;
  }

  const wrongIndexes = answersStatus.value
    .map((a, idx) => {
      if (idx >= questions.value.length) return null;
      return a.selectedKey !== getCorrectKey(questions.value[idx]) ? idx : null;
    })
    .filter((idx) => idx !== null);

  if (!wrongIndexes.length) {
    showAlert?.('info', 'Brak błędnych odpowiedzi do poprawienia.');
    return;
  }

  // Bezpieczne mapowanie tylko dla istniejących indeksów
  questions.value = wrongIndexes
    .filter((idx) => questions.value[idx])
    .map((idx) => questions.value[idx]);

  answersStatus.value = Array(questions.value.length)
    .fill()
    .map(() => ({
      answered: false,
      selected: null,
      selectedKey: null,
    }));

  currentQuestionIndex.value = 0;
  showSummary.value = false;
  score.value = 0;
  isCorrection.value = true;
  startTime.value = Date.now();

  if (mode.value === 'exam') {
    startTimer();
  }
};

const goToHome = () => {
  router.push('/');
};

const handleKeydown = (e) => {
  // Esc zamyka arkusz pytań (mobile) — bez ruszania reszty skrótów.
  if (e.key === 'Escape' && showQuestionSheet.value) {
    showQuestionSheet.value = false;
    return;
  }

  if (['1', '2', '3', '4'].includes(e.key) && currentQuestionIndex.value < questions.value.length) {
    const idx = parseInt(e.key, 10) - 1;

    // Pobierz referencję do aktywnego komponentu QuestionList
    const activeQuestionListRef = Array.isArray(questionList.value)
      ? questionList.value.find((_, i) => currentQuestionIndex.value === i)
      : questionList.value;

    // Pobierz odpowiedzi z komponentu
    const currentAnswers = activeQuestionListRef?.answers;

    if (
      answersStatus.value[currentQuestionIndex.value] &&
      !answersStatus.value[currentQuestionIndex.value].answered &&
      currentAnswers &&
      idx < currentAnswers.length &&
      currentAnswers[idx]
    ) {
      selectAnswer(idx, currentAnswers[idx].key);
    }
  }

  // Pozostała część funkcji bez zmian
  if (e.key === 'ArrowRight' || e.key === 'PageDown') {
    if (
      answersStatus.value[currentQuestionIndex.value] &&
      currentQuestionIndex.value < questions.value.length - 1 &&
      answersStatus.value[currentQuestionIndex.value].answered
    ) {
      nextOrFinish();
    } else if (answeredCount.value === questions.value.length && !showSummary.value) {
      nextOrFinish();
    }
  }

  if (
    (e.key === 'ArrowLeft' || e.key === 'PageUp') &&
    currentQuestionIndex.value > 0 &&
    mode.value === 'quiz'
  ) {
    prevQuestion();
  }

  if (e.key === 'Enter' && showSummary.value) {
    restartQuiz();
  }
};

// Obserwuj zmiany currentQuestion, aby aktualizować dostępne odpowiedzi
watch(
  () => questions.value[currentQuestionIndex.value],
  (newQuestion) => {
    if (newQuestion) {
      shuffledAnswers.value = shuffleArray(
        ['answer_a', 'answer_b', 'answer_c', 'answer_d']
          .map((k) => newQuestion[k] && { ...newQuestion[k], key: k })
          .filter(Boolean)
      );
    } else {
      // Jeśli nie ma pytania, ustaw pustą tablicę odpowiedzi
      shuffledAnswers.value = [];
    }
  }
);

// Obserwuj zmiany in answersStatus i aktualizuj cache
watch(
  () => answersStatus.value.filter((a) => a.answered).length,
  async (newCount) => {
    // Dodaj sprawdzenie czy questions i showSummary istnieją
    if (
      questions.value?.length > 0 &&
      newCount === questions.value.length &&
      showSummary &&
      !showSummary.value
    ) {
      await updateWrongOrNotDoneCache();
    }
  }
);

// Obserwuj zmiany w showSummary, aby aktualizować cache
watch(
  () => showSummary?.value, // Dodaj operator opcjonalnego łańcuchowania
  async (newValue) => {
    if (newValue) {
      await updateWrongOrNotDoneCache();
    }
  }
);

// --- Wznawianie niezakończonego quizu/egzaminu po reloadzie ---
const PROGRESS_KEY = 'quiz-progress';
let saveProgressTimer = null;

// Podpis sesji zapamiętany przy wejściu w widok. `route` zmienia się przed
// odmontowaniem komponentu, więc nie można go czytać w onBeforeUnmount.
// Losowy parametr `r` (generowany przy starcie) jest stabilnym ID sesji,
// niezależnym od kodowania zapytania (`+` vs `%20`).
const progressSignature = buildProgressSignature(route.name, route.query);
const progressUrl = route.fullPath;
// Tryb sesji też trzeba zapamiętać przy wejściu: przy odmontowaniu `route`
// wskazuje już nowy widok i `mode` stałoby się `quiz`, psując zapis egzaminu.
const progressMode = route.name === 'ExamView' ? 'exam' : 'quiz';

function sessionSignature() {
  return progressSignature;
}

function clearSavedProgress() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch (e) {
    // Brak dostępu do localStorage — ignorujemy.
  }
}

function saveProgress() {
  if (typeof window === 'undefined') return;
  if (!questions.value.length || showSummary.value) return;

  // Nie zapisuj stanu, w którym użytkownik nic jeszcze nie zrobił —
  // wyjątkiem jest egzamin, w którym liczy się także upływający czas.
  const hasProgress = shouldSaveProgress({
    answeredCount: answeredCount.value,
    currentIndex: currentQuestionIndex.value,
    mode: progressMode,
    timeLeft: timeLeft.value,
    timeLimit: examTimeMinutes.value * 60,
  });
  if (!hasProgress) return;

  const payload = {
    signature: sessionSignature(),
    url: progressUrl,
    savedAt: Date.now(),
    ids: questions.value.map((q) => q.ID ?? q.id),
    answersStatus: answersStatus.value,
    questionTimes: questionTimes.value,
    currentIndex: currentQuestionIndex.value,
    score: score.value,
    autoNextEnabled: autoNextEnabled.value,
    timeLeft: progressMode === 'exam' ? timeLeft.value : null,
    examStartedAt: progressMode === 'exam' ? examStartedAt.value : null,
    examTimeLimit: progressMode === 'exam' ? examTimeMinutes.value * 60 : null,
  };

  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(payload));
  } catch (e) {
    // Przekroczone quota lub tryb prywatny — pomijamy zapis.
  }
}

function scheduleProgressSave() {
  clearTimeout(saveProgressTimer);
  saveProgressTimer = setTimeout(saveProgress, 400);
}

function readSavedProgress() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.signature !== sessionSignature()) return null;
    if (!Array.isArray(data.ids) || !Array.isArray(data.answersStatus)) return null;
    if (data.ids.length !== data.answersStatus.length) return null;
    return data;
  } catch (e) {
    return null;
  }
}

async function restoreProgress(data) {
  const byId = new Map(questions.value.map((q) => [String(q.ID ?? q.id), q]));
  const missingIds = data.ids.filter((id) => !byId.has(String(id)));

  // Pytania mogły nie trafić do bieżącej losowej puli — dociągamy je po ID.
  if (missingIds.length > 0) {
    try {
      const res = await apiClient.get('/questions', {
        params: { ids: missingIds.join(',') },
        noCache: true,
      });
      const fetched = res.data?.questions || [];
      for (const q of fetched) {
        byId.set(String(q.ID ?? q.id), q);
      }
    } catch (e) {
      console.error('Nie udało się pobrać pytań do wznowienia:', e);
    }
  }

  const restoredQuestions = data.ids.map((id) => byId.get(String(id)));
  if (restoredQuestions.some((q) => !q)) return 'failed';

  // Pozostały czas egzaminu liczony od momentu startu (nie od ostatniego zapisu).
  let remaining = null;
  if (progressMode === 'exam') {
    remaining = computeRemainingSeconds({
      savedAt: data.savedAt,
      timeLeft: data.timeLeft,
      examStartedAt: data.examStartedAt,
      examTimeLimit: data.examTimeLimit,
    });
    if (remaining !== null && remaining <= 0) return 'expired';
  }

  questions.value = restoredQuestions;
  answersStatus.value = data.answersStatus.map((a) => ({ ...a }));
  questionTimes.value = Array.isArray(data.questionTimes) ? [...data.questionTimes] : [];
  score.value = Number(data.score) || 0;
  autoNextEnabled.value = data.autoNextEnabled !== false;
  currentQuestionIndex.value = Math.min(
    Math.max(0, Number(data.currentIndex) || 0),
    restoredQuestions.length - 1
  );

  if (remaining !== null) {
    timeLeft.value = remaining;
    const startedAt = Number(data.examStartedAt);
    examStartedAt.value =
      Number.isFinite(startedAt) && startedAt > 0
        ? startedAt
        : Date.now() - (examTimeMinutes.value * 60 - remaining) * 1000;
  }

  startTime.value = Date.now();
  return 'ok';
}

watch(
  [answersStatus, currentQuestionIndex, score, autoNextEnabled],
  scheduleProgressSave,
  { deep: true }
);

// Zakończony quiz nie powinien być wznawiany.
watch(showSummary, (visible) => {
  if (visible) clearSavedProgress();
});

// Inicjalizacja
onMounted(async () => {
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('beforeunload', handleBeforeUnload);

  if (typeof window !== 'undefined') {
    desktopMediaQuery = window.matchMedia('(min-width: 1024px)');
    desktopMediaChangeHandler = (event) => {
      isDesktop.value = event.matches;
    };
    if (desktopMediaQuery.addEventListener) {
      desktopMediaQuery.addEventListener('change', desktopMediaChangeHandler);
    } else {
      desktopMediaQuery.addListener(desktopMediaChangeHandler);
    }
  }

  // Przypisz do zewnętrznej zmiennej ref
  quizActivityInterval.value = setInterval(
    () => {
      window.dispatchEvent(new CustomEvent('quiz-activity'));
    },
    2 * 60 * 1000
  );

  try {
    await fetchQuestions();

    // Wznawianie zaraz po pobraniu pytań — niezależne od odświeżania cache.
    const saved = readSavedProgress();
    let restoreResult = 'none';
    if (saved) {
      restoreResult = await restoreProgress(saved);
    }
    if (restoreResult === 'ok') {
      showAlert?.(
        'info',
        progressMode === 'exam'
          ? `Wznowiono egzamin — pozostało ${Math.floor(timeLeft.value / 60)} min.`
          : 'Wznowiono niezakończony quiz.'
      );
    } else if (restoreResult === 'expired') {
      clearSavedProgress();
      showAlert?.('warning', 'Poprzedni egzamin wygasł — zaczynamy od nowa.');
    } else if (restoreResult === 'failed') {
      // Zapis zostawiamy — może uda się wznowić następnym razem.
      showAlert?.('warning', 'Nie udało się wznowić poprzedniej sesji.');
    } else {
      clearSavedProgress();
    }

    await updateWrongOrNotDoneCache();

    if (progressMode === 'exam') {
      if (!examStartedAt.value) examStartedAt.value = Date.now();
      startTimer();
    }

    startTime.value = Date.now();
  } catch (error) {
    console.error('Błąd podczas inicjalizacji komponentu:', error);
    showAlert?.('error', 'Wystąpił błąd podczas ładowania pytań.');
    loading.value = false;
  }

  // Wyemituj zdarzenie aktywności quizu na początku
  window.dispatchEvent(new CustomEvent('quiz-activity'));

  if (route.query.categories) {
    allQuestionIdsInCategory.value = await store.dispatch(
      'questions/fetchQuestionIdsByCategory',
      route.query.categories
    );
  }
});

// Dodaj tę funkcję POZA onMounted, na tym samym poziomie co onMounted
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('beforeunload', handleBeforeUnload);
  if (desktopMediaQuery && desktopMediaChangeHandler) {
    if (desktopMediaQuery.removeEventListener) {
      desktopMediaQuery.removeEventListener('change', desktopMediaChangeHandler);
    } else {
      desktopMediaQuery.removeListener(desktopMediaChangeHandler);
    }
  }

  // Użyj wartości z ref
  if (quizActivityInterval.value) {
    clearInterval(quizActivityInterval.value);
  }

  if (timer.value) {
    clearInterval(timer.value);
  }

  clearAutoNextTimers();
  clearTimeout(saveProgressTimer);
  saveProgress();
});
</script>

<style scoped>
@media (min-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* Animacje */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-out;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
