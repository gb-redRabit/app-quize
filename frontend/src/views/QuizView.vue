<template>
  <div
    class="container flex flex-col-reverse sm:flex-col items-center justify-start bg-gray-100 px-2"
  >
    <div v-if="!loading" class="bg-white rounded-lg shadow-lg p-4 flex flex-col gap-8 w-full">
      <div class="flex-1 flex flex-col" v-if="!showSummary">
        <div v-if="loading" class="text-lg">Loading questions...</div>
        <div v-else>
          <div class="flex justify-between items-center mb-2">
            <button
              class="bg-blue-600 text-white md:px-6 md:py-3 rounded md:text-lg px-2 py-1"
              @click="prevQuestion"
              :disabled="currentQuestionIndex === 0"
            >
              ← Poprzednie
            </button>
            <h1 class="text-3xl font-bold text-center sm:block hidden">
              {{
                questions[currentQuestionIndex] && questions[currentQuestionIndex].category
                  ? questions[currentQuestionIndex].category.length > 60
                    ? questions[currentQuestionIndex].category.slice(0, 60) + '…'
                    : questions[currentQuestionIndex].category
                  : ''
              }}
            </h1>
            <button
              class="bg-blue-600 text-white md:px-6 md:py-3 rounded md:text-lg px-2 py-1"
              @click="nextOrFinish"
              :disabled="
                !(
                  answersStatus[currentQuestionIndex] &&
                  answersStatus[currentQuestionIndex].answered
                )
              "
            >
              {{ currentQuestionIndex === questions.length - 1 ? 'Zakończ test' : 'Następne →' }}
            </button>
          </div>
          <QuestionList
            ref="questionList"
            class="sm:h-auto h-63vh"
            v-if="questions.length && currentQuestionIndex < questions.length"
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
            @select="selectAnswer"
          />
          <QuestionDescription
            :answered="
              answersStatus.length > currentQuestionIndex &&
              answersStatus[currentQuestionIndex] &&
              answersStatus[currentQuestionIndex].answered
            "
            :description="
              questions[currentQuestionIndex] && questions[currentQuestionIndex].description
            "
          />
        </div>
      </div>
      <!-- Podsumowanie -->
      <SummaryBox
        v-else
        :questions="questions"
        :answersStatus="answersStatus"
        :score="score"
        :total="questions.length"
        :userAnswerText="userAnswerText"
        :correctAnswerText="correctAnswerText"
        @restart="restartQuiz"
        @retry-wrong="retryWrongAnswers"
      />
    </div>
    <div v-if="!loading" class="container">
      <QuestionNavigation
        :questions="questions"
        :currentIdx="currentQuestionIndex"
        :answersStatus="answersStatus"
        :showSummary="showSummary"
        @goTo="goToQuestion"
      />
    </div>
    <ProgressBar v-if="!loading" :current="answeredCount" :total="questions.length" />
    <!-- Usunięto TimeStats -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/api';
import QuestionList from '@/components/QuestionList.vue';
import QuestionNavigation from '@/components/QuestionNavigation.vue';
import QuestionDescription from '@/components/QuestionDescription.vue';
import SummaryBox from '@/components/SummaryBox.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import { getRandomUniqueQuestions } from '@/utils/randomQuestions';
import { shuffleArray } from '@/utils/shuffleArray'; // Zakładam, że istnieje taki plik
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
const questionList = ref(null); // dla ref="questionList"
const forceUpdateKey = ref(0); // Zastępstwo dla $forceUpdate

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

// Methods
const fetchUserHistory = () => store.dispatch('fetchUserHistory');

const fetchQuestions = async () => {
  const response = await apiClient.get('/questions');
  const allQuestions = Array.isArray(response.data) ? response.data : [];

  let filteredQuestions;
  if (route.query.ids) {
    const ids = route.query.ids.split(',').map((id) => id.trim());
    filteredQuestions = allQuestions.filter((q) =>
      ids.includes(String(q.ID || q.id || q.Id || q.id_question))
    );
  } else {
    filteredQuestions =
      selectedCategories.value[0] === 'all'
        ? allQuestions
        : allQuestions.filter((q) => selectedCategories.value.includes(q.category));
  }

  questions.value = getRandomUniqueQuestions(filteredQuestions, quizLength.value).map((q) => ({
    ...q,
    correctIndex: keys.findIndex((k) => q[k] && q[k].isCorret),
  }));
  answersStatus.value = questions.value.map(() => ({
    answered: false,
    selected: null,
  }));
  loading.value = false;
  showSummary.value = false;
  score.value = 0;
  currentQuestionIndex.value = 0;
  startTime.value = Date.now();
  questionTimes.value = [];
  startTimer();
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

const onSelect = (idx) => {
  emit('select', idx, answers()[idx].key);
};

const buttonClass = (idx) => {
  if (!answered.value) return 'bg-blue-500 text-white';
  if (showCorrect.value && answers()[idx].isCorret) return 'bg-green-500 text-white';
  if (idx === selectedIndex()) return 'bg-red-500 text-white';
  return 'bg-gray-200 text-gray-700';
};

const selectAnswer = async (index, selectedKey) => {
  if (answersStatus.value[currentQuestionIndex.value].answered) return;
  const q = questions.value[currentQuestionIndex.value];
  const id = q.ID || q.id || q.Id || q.id_question;
  if (!id) {
    console.warn('Brak ID pytania!', q);
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
    // obsługa błędu
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

const saveUserHistory = async () => {
  try {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    const list = questions.value.map((q, idx) => ({
      id_questions: q.ID || q.id || q.Id || q.id_question,
      correct: answersStatus.value[idx].selectedKey === getCorrectKey(q),
      answer: answersStatus.value[idx].selectedKey
        ? ['A', 'B', 'C', 'D'][answersStatus.value[idx].selected]
        : null,
    }));
    const correct = answersStatus.value.filter((a) => a.correct).length;
    const wrong = answersStatus.value.length - correct;

    await apiClient.put(
      '/api/users/update',
      {
        addHistory: {
          type: isCorrection.value ? 'Quiz - poprawa błędów' : 'quiz',
          correct,
          categories: selectedCategories.value,
          wrong,
          list,
          data: new Date().toISOString(),
        },
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    isCorrection.value = true;
  } catch (error) {
    // obsługa błędu
  }
};

const userAnswerLetter = (q, selectedIdx) => {
  if (selectedIdx == null) return '';
  if (selectedIdx === 0) return 'A';
  if (selectedIdx === 1) return 'B';
  if (selectedIdx === 2) return 'C';
  if (selectedIdx === 3) return 'D';
  return '';
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
    const token = sessionStorage.getItem('token');
    const allQuestions = (await apiClient.get('/questions')).data;
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

    router.replace({
      name: 'QuizView',
      query: {
        ...route.query,
        ids: wrongOrNotDoneIds.join(','),
        length,
        r: Math.random().toString(36).substring(2, 8),
      },
    });
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
      !answersStatus.value[currentQuestionIndex.value].answered &&
      currentAnswers &&
      currentAnswers[idx]
    ) {
      selectAnswer(idx, currentAnswers[idx].key);
    }
  }
  if (e.key === 'ArrowRight' || e.key === 'PageDown') {
    if (
      currentQuestionIndex.value < questions.value.length - 1 &&
      answersStatus.value[currentQuestionIndex.value] &&
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

const startTimer = () => {
  if (timerInterval.value) clearInterval(timerInterval.value);
  timerInterval.value = setInterval(() => {
    forceUpdateKey.value++; // Zmiana wartości klucza wymusi re-render
  }, 1000);
};

const saveAllQuestionsToHquestion = async () => {
  const token = sessionStorage.getItem('token');
  for (let i = 0; i < questions.value.length; i++) {
    const q = questions.value[i];
    const status = answersStatus.value[i];
    await apiClient.post('/users/hquestion', {
      id: q.ID || q.id || q.Id || q.id_question,
      correct: status && status.answered ? status.correct : false,
      category: q.category,
    });
  }
};
</script>
