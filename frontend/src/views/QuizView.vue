<template>
  <div class="py-2 px-4 container dark:bg-gray-900">
    <div v-if="loading" class="flex flex-col items-center justify-center -mt-20"></div>
    <div v-else class="mx-auto">
      <div v-if="!showSummary" class="flex flex-col space-y-6">
        <div
          class="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 dark:bg-gray-800 dark:text-white"
        >
          <div class="flex items-center space-x-3">
            <div
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
            <h1 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
              {{
                questions[currentQuestionIndex] && questions[currentQuestionIndex].category
                  ? questions[currentQuestionIndex].category.length > 60
                    ? questions[currentQuestionIndex].category.slice(0, 60) + '…'
                    : questions[currentQuestionIndex].category
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
        <div class="flex flex-col space-y-5">
          <div class="grid grid-cols-2 gap-4">
            <button
              class="flex items-center justify-center px-4 py-3 rounded-xl text-white font-medium text-base transition-all duration-200 shadow-sm bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
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
                  answersStatus[currentQuestionIndex] &&
                  answersStatus[currentQuestionIndex].answered
                ),
                'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600':
                  currentQuestionIndex === questions.length - 1,
                'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600':
                  currentQuestionIndex !== questions.length - 1,
              }"
              @click="nextOrFinish"
              :disabled="
                !(
                  answersStatus[currentQuestionIndex] &&
                  answersStatus[currentQuestionIndex].answered
                )
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
        </div>

        <div
          class="bg-white rounded-xl shadow-sm p-5 sm:p-6 relative dark:bg-gray-800 dark:text-white"
        >
          <transition name="fade" mode="out-in">
            <QuestionList
              ref="questionList"
              :key="currentQuestionIndex"
              :question="questions[currentQuestionIndex]"
              :answered="
                answersStatus.length > currentQuestionIndex && answersStatus[currentQuestionIndex]
                  ? answersStatus[currentQuestionIndex].answered
                  : false
              "
              :selected="
                answersStatus.length > currentQuestionIndex && answersStatus[currentQuestionIndex]
                  ? answersStatus[currentQuestionIndex].selected
                  : null
              "
              :selectedKey="
                answersStatus.length > currentQuestionIndex && answersStatus[currentQuestionIndex]
                  ? answersStatus[currentQuestionIndex].selectedKey
                  : null
              "
              :showCorrect="true"
              :questionNumber="currentQuestionIndex + 1"
              @select="selectAnswer"
            />
          </transition>
        </div>

        <div class="flex flex-col space-y-5">
          <QuestionNavigation
            :questions="questions"
            :currentIdx="currentQuestionIndex"
            :answersStatus="answersStatus"
            :showSummary="showSummary"
            @goTo="goToQuestion"
            class="mt-4"
          />
        </div>
      </div>

      <transition name="slide-up" mode="out-in">
        <SummaryBox
          v-if="showSummary"
          :questions="questions"
          :answersStatus="answersStatus"
          :score="score"
          :total="questions.length"
          :userAnswerText="userAnswerText"
          :correctAnswerText="correctAnswerText"
          @restart="restartQuiz"
          @retry-wrong="retryWrongAnswers"
          class="bg-white rounded-xl shadow-sm p-6 dark:bg-gray-800 dark:text-white"
        />
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, inject } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/api';
import QuestionList from '@/components/QuestionList.vue';
import QuestionNavigation from '@/components/QuestionNavigation.vue';
import SummaryBox from '@/components/SummaryBox.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import { getRandomUniqueQuestions } from '@/utils/randomQuestions';
import { shuffleArray } from '@/utils/shuffleArray';

// Inject globalnych funkcji
const showAlert = inject('showAlert');

const keys = ['answer_a', 'answer_b', 'answer_c', 'answer_d'];
const store = useStore();
const route = useRoute();
const router = useRouter();

// Data properties
const questions = ref([]);
const currentQuestionIndex = ref(0);
const score = ref(0);
const loading = ref(true);
const answersStatus = ref([]);
const quizLength = ref(10);
const showSummary = ref(false);
const selectedCategories = ref([]);
const startTime = ref(null);
const questionTimes = ref([]);
const timerInterval = ref(null);
const isCorrection = ref(false);
const isExamMode = ref(false);
const shuffledAnswers = ref([]);
const questionList = ref(null);
const forceUpdateKey = ref(0);

// Helper function
function getCorrectKey(q) {
  const keys = ['answer_a', 'answer_b', 'answer_c', 'answer_d'];
  return keys.find((k) => q[k] && q[k].isCorret);
}

// Computed properties
const answeredCount = computed(() => {
  return answersStatus.value.filter((a) => a.answered).length;
});

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || null);

// Watcher
watch(currentQuestion, (newQuestion) => {
  if (newQuestion) {
    shuffledAnswers.value = shuffleArray(
      ['answer_a', 'answer_b', 'answer_c', 'answer_d']
        .map((k) => newQuestion[k] && { ...newQuestion[k], key: k })
        .filter(Boolean)
    );
  }
});
const startTimer = () => {
  if (timerInterval.value) clearInterval(timerInterval.value);
  timerInterval.value = setInterval(() => {
    forceUpdateKey.value++;
  }, 1000);
};
const fetchQuestions = async () => {
  try {
    const category = route.query.categories || 'all';
    const fetchedQuestions = await store.dispatch('questions/fetchQuestionsByCategory', category);
    if (!fetchedQuestions || fetchedQuestions.length === 0) {
      showAlert && showAlert('warning', 'Brak pytań w wybranej kategorii.');
      questions.value = [];
      loading.value = false;
      return;
    }
    questions.value = getRandomUniqueQuestions(fetchedQuestions, quizLength.value);
    answersStatus.value = questions.value.map(() => ({
      answered: false,
      selected: null,
      selectedKey: null,
    }));
    loading.value = false;
  } catch (error) {
    showAlert && showAlert('error', 'Błąd podczas pobierania pytań quizu');
    questions.value = [];
    loading.value = false;
  }
};

// Logika z `created`
const length = parseInt(route.query.length, 10);
let categories = route.query.categories || 'all';
if (categories === 'all') {
  categories = ['all'];
} else if (typeof categories === 'string') {
  categories = categories.split(',');
}
selectedCategories.value = categories;
quizLength.value = length && !isNaN(length) ? length : 10;
fetchQuestions();

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
  clearInterval(timerInterval.value);
});

// Pozostałe metody
const answers = () => {
  return shuffledAnswers.value;
};

const selectedIndex = () => {
  if (!selectedKey.value) return null;
  return answers().findIndex((a) => a.key === selectedKey.value);
};

const selectAnswer = async (index, selectedKey) => {
  if (answersStatus.value[currentQuestionIndex.value].answered) return;
  const q = questions.value[currentQuestionIndex.value];
  const id = q.ID || q.id || q.Id || q.id_question;
  if (!id) {
    showAlert && showAlert('error', 'Brak ID pytania!');
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
  const now = Date.now();
  questionTimes.value[currentQuestionIndex.value] = (now - startTime.value) / 1000;

  try {
    await apiClient.post('/users/hquestion', {
      id,
      correct: isCorrect,
      category: q.category,
    });
  } catch (e) {
    showAlert && showAlert('error', 'Błąd podczas zapisywania odpowiedzi.');
  }
};

const nextOrFinish = async () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++;
  } else {
    showSummary.value = true;
    clearInterval(timerInterval.value);
    await saveUserHistory();
  }
};

// W metodzie zapisującej historię quizu
const saveUserHistory = async () => {
  try {
    const historyItem = {
      type: isCorrection.value ? 'Quiz - poprawa błędów' : 'quiz',
      category: route.query.categories || 'all',
      correct: score.value,
      wrong: questions.value.length - score.value,
      data: new Date().toISOString(),
      time: null,
      questionTimes: questionTimes.value,
      list: questions.value.map((q, idx) => {
        const originalKeys = ['answer_a', 'answer_b', 'answer_c', 'answer_d'];
        const selected = answersStatus.value[idx].selected;
        const originalKey = originalKeys[selected];
        return {
          id_questions: q.ID || q.id || q.Id,
          answer: originalKey,
          correct: originalKey === getCorrectKey(q),
        };
      }),
    };

    await apiClient.put('/users/update-profile', { addHistory: historyItem });
    isCorrection.value = true;
    showAlert && showAlert('success', 'Wyniki quizu zostały zapisane.');
  } catch (error) {
    showAlert && showAlert('error', 'Błąd podczas zapisywania wyników.');
  }
};

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) currentQuestionIndex.value--;
};

const goToQuestion = (idx) => {
  if (!showSummary.value) currentQuestionIndex.value = idx;
};

const restartQuiz = async () => {
  currentQuestionIndex.value = 0;
  score.value = 0;
  loading.value = true;

  if (route.query.categories) {
    const cat = route.query.categories;
    try {
      const allQuestions = await store.dispatch('questions/fetchQuestionsByCategory', cat);
      const historyRes = await apiClient.get('/users/hquestion');
      const hq = historyRes.data.filter((q) => q.category === cat);

      const allIds = allQuestions
        .filter((q) => q.category === cat)
        .map((q) => q.ID || q.id || q.Id || q.id_question);

      const wrongOrNotDoneIds = allIds.filter((id) => {
        const entry = hq.find((q) => q.id == id);
        return !entry || entry.correct === false;
      });

      const length = Math.min(parseInt(route.query.length, 10) || 10, wrongOrNotDoneIds.length);

      if (!wrongOrNotDoneIds.length) {
        showAlert && showAlert('warning', 'Brak pytań do powtórki w tej kategorii.');
        loading.value = false;
        return;
      }

      router.replace({
        name: 'QuizView',
        query: {
          ...route.query,
          ids: wrongOrNotDoneIds.join(','),
          length,
          r: Math.random().toString(36).substring(2, 8),
        },
      });
    } catch (e) {
      showAlert && showAlert('error', 'Błąd podczas przygotowywania powtórki.');
      loading.value = false;
    }
  } else {
    fetchQuestions();
    startTime.value = Date.now();
    questionTimes.value = [];
  }
};

const userAnswerText = (q, selectedKey) => {
  if (!selectedKey) return '';
  return q[selectedKey] && q[selectedKey].answer ? q[selectedKey].answer : '';
};

const correctAnswerText = (q) => {
  const keys = ['answer_a', 'answer_b', 'answer_c', 'answer_d'];
  const correctKey = keys.find((k) => q[k] && q[k].isCorret);
  return correctKey && q[correctKey] && q[correctKey].answer ? q[correctKey].answer : '';
};

const retryWrongAnswers = () => {
  const wrongIndexes = answersStatus.value
    .map((a, idx) => (!a.correct ? idx : null))
    .filter((v) => v !== null);

  if (wrongIndexes.length === 0) return;

  questions.value = wrongIndexes.map((idx) => questions.value[idx]);

  answersStatus.value = questions.value.map(() => ({
    answered: false,
    correct: false,
    selected: null,
  }));

  currentQuestionIndex.value = 0;
  showSummary.value = false;
  score.value = 0;
  startTime.value = Date.now();
  questionTimes.value = [];
  isCorrection.value = true;
};

const handleKeydown = (e) => {
  if (loading.value) return;
  if (['1', '2', '3', '4'].includes(e.key) && currentQuestionIndex.value < questions.value.length) {
    const idx = parseInt(e.key, 10) - 1;
    const currentAnswers = questionList.value ? questionList.value.answers : answers();
    if (
      answersStatus.value[currentQuestionIndex.value] &&
      !answersStatus.value[currentQuestionIndex.value].answered &&
      currentAnswers &&
      currentAnswers[idx]
    ) {
      selectAnswer(idx, currentAnswers[idx].key);
    }
  }
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
  if ((e.key === 'ArrowLeft' || e.key === 'PageUp') && currentQuestionIndex.value > 0) {
    prevQuestion();
  }
};
</script>

<style scoped>
/* Zostawiamy tylko niezbędne animacje, których nie można zastąpić klasami Tailwind */

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
</style>
