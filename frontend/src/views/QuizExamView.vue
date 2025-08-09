<template>
  <div class="container mx-auto px-4 py-6">
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
              class="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600 shadow-2xl flex-shrink-0 dark:bg-blue-800 dark:text-blue-200"
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
                'flex justify-center h-10  w-24 items-center gap-2 px-3 py-1.5 rounded-full font-medium  ',
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

        <!-- Przyciski nawigacji - tylko dla trybu quiz -->
        <div v-if="mode === 'quiz'" class="grid grid-cols-2 gap-4 mb-6">
          <button
            class="flex items-center justify-center px-4 py-3 rounded-xl bg-gray-500 text-white font-medium text-base transition-all duration-200 shadow-sm hover:bg-gray-600"
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
            class="flex items-center justify-center px-4 py-3 rounded-xl text-white font-medium text-base transition-all duration-200 shadow-sm"
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
              currentQuestionIndex === questions.length - 1 ? 'Zakończ quiz' : 'Następne'
            }}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
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
          <!-- Lista pytań -->
          <!-- Pytania -->
          <div class="space-y-6">
            <div
              v-for="(q, index) in questions"
              :key="q.ID || index"
              v-show="currentQuestionIndex === index"
              class="transition-opacity duration-300"
            >
              <QuestionList
                ref="questionList"
                :question="q"
                :answered="answersStatus[index].answered"
                :selected="answersStatus[index].selected"
                :selectedKey="answersStatus[index].selectedKey"
                :showCorrect="answersStatus[index].answered && mode === 'quiz'"
                :questionNumber="`${index + 1} `"
                @select="selectAnswer"
              />
            </div>
          </div>

          <!-- Nawigacja między pytaniami -->
          <div class="mt-16" v-if="questions.length > 0 && mode !== 'exam'">
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
          :allQuestionsCompleted="noMoreQuestions"
          @restart="restartQuiz"
          @retry-wrong="retryWrongQuestions"
          @go-home="goToHome"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 dark:text-white"
        ></SummaryBox>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, inject } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import apiClient from '@/api';
import QuestionList from '@/components/questions/QuestionList.vue';
import QuestionNavigation from '@/components/questions/QuestionNavigation.vue';
import SummaryBox from '@/components/questions/SummaryBox.vue';
import ProgressBar from '@/components/questions/ProgressBar.vue';
import { getRandomUniqueQuestions } from '@/utils/randomQuestions';
import { shuffleArray } from '@/utils/shuffleArray';

// Zależności
const router = useRouter();
const route = useRoute();
const store = useStore();
const showAlert = inject('showAlert');

// Parametry przekazywane z URL
const mode = computed(() => (route.name === 'ExamView' ? 'exam' : 'quiz'));
const categories = ref(route.query.categories || 'all');
const initialQuizLength = parseInt(route.query.length, 10) || 10;

// Stan komponentu
const questions = ref([]);
const currentQuestionIndex = ref(0);
const score = ref(0);
const loading = ref(true);
const answersStatus = ref([]);
const showSummary = ref(false);
const questionTimes = ref([]);
const isCorrection = ref(false);
const shuffledAnswers = ref([]);
const quizLength = ref(initialQuizLength);
const startTime = ref(null);
const wrongOrNotDoneIdsCache = ref([]);
const questionList = ref(null);
const quizActivityInterval = ref(null); // <-- DODAJ TĘ LINIĘ

// Stan timera (tylko dla trybu egzaminu)
const examTimeMinutes = ref(parseInt(route.query.time, 10) || 60);
const timeLeft = ref(examTimeMinutes.value * 60);
const timer = ref(null);

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

const noMoreQuestions = computed(() => {
  if (!route.query.categories) return false;
  return (wrongOrNotDoneIdsCache.value || []).length === 0;
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
    const fetchedQuestions = await store.dispatch('questions/fetchQuestionsByCategory', category);

    if (!fetchedQuestions || fetchedQuestions.length === 0) {
      showAlert?.('warning', 'Brak pytań w wybranej kategorii.');
      questions.value = [];
      answersStatus.value = []; // Inicjalizacja pustą tablicą
      loading.value = false;
      return;
    }

    // Sprawdź czy mamy konkretne IDs do pobrania
    if (route.query.ids) {
      const ids = route.query.ids.split(',').map((id) => id.trim());

      const filteredQuestions = fetchedQuestions.filter((q) => {
        const qId = String(q.ID || q.id || q.Id || q.id_question);
        return ids.includes(qId);
      });

      if (filteredQuestions.length > 0) {
        questions.value = getRandomUniqueQuestions(
          filteredQuestions,
          Math.min(quizLength.value, filteredQuestions.length)
        );
        answersStatus.value = Array(questions.value.length)
          .fill()
          .map(() => ({
            answered: false,
            selected: null,
            selectedKey: null,
          }));
        loading.value = false;
        return;
      } else {
        // Nie znaleziono pytań z podanymi ID - używamy wszystkich dostępnych
        showAlert?.('warning', 'Nie znaleziono pytań z podanymi ID. Używamy pytań z kategorii.');
      }
    }

    // Jeśli nie mamy konkretnych IDs lub filtracja nie zwróciła wyników
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

  answersStatus.value[currentQuestionIndex.value] = {
    answered: true,
    correct: isCorrect,
    selected: index,
    selectedKey,
  };

  // Zapisz czas odpowiedzi
  const now = Date.now();
  questionTimes.value[currentQuestionIndex.value] = (now - startTime.value) / 1000;

  try {
    // Natychmiastowa aktualizacja lokalnego stanu
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

    // Aktualizuj store bezpośrednio
    store.commit('user/SET_HQUESTION', updatedHQ);

    // Wyślij do API
    await apiClient.post('/users/hquestion', {
      id,
      correct: isCorrect,
      category: q.category,
    });

    // Aktualizuj cache
    await updateWrongOrNotDoneCache();
  } catch (e) {
    showAlert?.('error', 'Błąd podczas zapisywania odpowiedzi.');
  }

  // Automatyczne przejście do następnego pytania w trybie egzaminu
  if (mode.value === 'exam') {
    setTimeout(async () => {
      if (currentQuestionIndex.value < questions.value.length - 1) {
        currentQuestionIndex.value++;
      } else {
        showSummary.value = true;
        clearInterval(timer.value);
        await saveUserHistory();
      }
    }, 300);
  }
};

// Aktualizacja cache pytań do powtórzenia
const updateWrongOrNotDoneCache = async () => {
  if (!route.query.categories) return;

  try {
    const cat = route.query.categories;
    const allQuestions = await store.dispatch('questions/fetchQuestionsByCategory', cat);
    const allIds = allQuestions.map((q) => q.ID || q.id || q.Id || q.id_question);

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

const goToQuestion = (idx) => {
  if (!showSummary.value) currentQuestionIndex.value = idx;
};

// Zapis historii
const saveUserHistory = async () => {
  try {
    const keyToLetter = {
      answer_a: 'A',
      answer_b: 'B',
      answer_c: 'C',
      answer_d: 'D',
    };

    // Tworzenie obiektu historii
    const historyItem = {
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

        // Zamień klucze na litery
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

    await apiClient.put('/users/update-profile', { addHistory: historyItem });

    // Odśwież dane
    await forceDataRefresh();

    showAlert?.('success', 'Wyniki zostały zapisane.');
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
    await store.dispatch('user/fetchUserHistoryAndHQ');
    await updateWrongOrNotDoneCache();
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
    startTime.value = Date.now();

    if (route.query.categories) {
      const cat = route.query.categories;
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
      const cat = route.query.categories;
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

// Obserwuj zmiany w answersStatus i aktualizuj cache
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

// Inicjalizacja
onMounted(async () => {
  window.addEventListener('keydown', handleKeydown);

  // Przypisz do zewnętrznej zmiennej ref
  quizActivityInterval.value = setInterval(
    () => {
      window.dispatchEvent(new CustomEvent('quiz-activity'));
    },
    2 * 60 * 1000
  );

  try {
    await fetchQuestions();
    await updateWrongOrNotDoneCache();

    if (mode.value === 'exam') {
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
});

// Dodaj tę funkcję POZA onMounted, na tym samym poziomie co onMounted
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);

  // Użyj wartości z ref
  if (quizActivityInterval.value) {
    clearInterval(quizActivityInterval.value);
  }

  if (timer.value) {
    clearInterval(timer.value);
  }
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
