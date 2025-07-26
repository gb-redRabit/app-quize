<template>
  <div class="exam-container">
    <div class="exam-wrapper">
      <div v-if="!showSummary" class="exam-content">
        <div class="exam-header">
          <h1 class="exam-title">Egzamin – {{ examLength }} pytań</h1>
          <div class="exam-timer-badge" :class="{ warning: timeLeft < 300 }">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{{ formattedTime }}</span>
          </div>
        </div>

        <div class="question-indicator">
          <div class="indicator-text">
            Pytanie {{ currentQuestionIndex + 1 }} z {{ examLength }}
          </div>
          <div class="progress-mini">
            <div
              class="progress-mini-bar"
              :style="{ width: `${((currentQuestionIndex + 1) / examLength) * 100}%` }"
            ></div>
          </div>
        </div>

        <BaseLoader v-if="loading" class="exam-loader" />

        <div v-else>
          <!-- Zamiast używać vue-virtual-scroll-list używamy v-show do optymalizacji -->
          <div
            v-for="(q, index) in questions"
            :key="q.ID || index"
            v-show="currentQuestionIndex === index"
            class="question-container"
          >
            <QuestionList
              ref="questionList"
              :question="q"
              :answered="answersStatus[index].answered"
              :selected="answersStatus[index].selected"
              :selectedKey="answersStatus[index].selectedKey"
              :showCorrect="showResults"
              :questionNumber="`${index + 1} `"
              @select="selectAnswer"
            />
          </div>
        </div>
      </div>

      <!-- Podsumowanie -->
      <SummaryBox
        v-else
        :questions="questions"
        :answersStatus="answersStatus"
        :score="score"
        :total="examLength"
        :userAnswerText="userAnswerText"
        :correctAnswerText="correctAnswerText"
        @restart="restartExam"
        @retry-wrong="retryWrongQuestions"
        class="summary-box"
      />
    </div>
  </div>
</template>

<script>
import apiClient from '@/api';
import { mapActions } from 'vuex';
import QuestionList from '@/components/QuestionList.vue';
import SummaryBox from '@/components/SummaryBox.vue';
import BaseLoader from '@/components/BaseLoader.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import { getRandomUniqueQuestions } from '@/utils/randomQuestions';
import { shuffleArray } from '@/utils/shuffleArray';
import store from '@/store';
function getCorrectKey(q) {
  const keys = ['answer_a', 'answer_b', 'answer_c', 'answer_d'];
  return keys.find((k) => q[k] && q[k].isCorret);
}

export default {
  components: {
    QuestionList,
    SummaryBox,
    BaseLoader,
    ProgressBar,
  },
  inject: ['showAlert'],
  data() {
    return {
      questions: [],
      currentQuestionIndex: 0,
      score: 0,
      loading: true,
      answersStatus: [],
      showSummary: false,
      timeLeft: 60 * 60,
      timer: null,
      examLength: 150,
      examTimeMinutes: 60,
      isCorrection: false,
      initialExamLength: 150,
      shuffledAnswers: [],
      questionTimes: [],
      startTime: null,
    };
  },
  computed: {
    formattedTime() {
      const min = Math.floor(this.timeLeft / 60)
        .toString()
        .padStart(2, '0');
      const sec = (this.timeLeft % 60).toString().padStart(2, '0');
      return `${min}:${sec}`;
    },
    answeredCount() {
      return this.answersStatus.filter((a) => a.answered).length;
    },
    answers() {
      return this.shuffledAnswers;
    },
    selectedIndex() {
      if (!this.answersStatus[this.currentQuestionIndex]) return null;
      return this.answers.findIndex(
        (a) => a.key === this.answersStatus[this.currentQuestionIndex].selectedKey
      );
    },
    // Dodaj tę właściwość
    showResults() {
      // W trybie egzaminu nie pokazujemy poprawnych odpowiedzi podczas rozwiązywania
      return false;
    },
  },
  watch: {
    currentQuestionIndex: {
      immediate: true,
      handler() {
        const q = this.questions[this.currentQuestionIndex];
        if (!q) {
          this.shuffledAnswers = [];
          return;
        }
        this.shuffledAnswers = shuffleArray(
          ['answer_a', 'answer_b', 'answer_c', 'answer_d']
            .map((k) => q[k] && { ...q[k], key: k })
            .filter(Boolean)
        );
      },
    },
  },
  created() {
    const length = parseInt(this.$route.query.length, 10);
    const time = parseInt(this.$route.query.time, 10);
    this.examLength = length && !isNaN(length) ? length : 150;
    this.initialExamLength = this.examLength;
    this.examTimeMinutes = time && !isNaN(time) ? time : 60;
    this.timeLeft = this.examTimeMinutes * 60;
    this.fetchQuestions();
    this.startTimer();
    this.startTime = Date.now();
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeydown);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown);
    clearInterval(this.timer);
  },
  methods: {
    ...mapActions(['fetchUserHistory']),
    async fetchQuestions() {
      try {
        const category = this.$route.query.categories || 'all';
        const questions = await this.$store.dispatch(
          'questions/fetchQuestionsByCategory',
          category
        );
        // Losuj pytania jeśli trzeba
        this.questions = getRandomUniqueQuestions(questions, this.examLength);
        this.answersStatus = this.questions.map(() => ({
          answered: false,
          selected: null,
          selectedKey: null,
        }));
        this.loading = false;
      } catch (error) {
        this.showAlert('error', 'Błąd podczas pobierania pytań egzaminu');
        this.questions = [];
        this.answersStatus = [];
        this.loading = false;
      }
    },

    async selectAnswer(index, selectedKey) {
      if (this.answersStatus[this.currentQuestionIndex].answered) return;
      const q = this.questions[this.currentQuestionIndex];
      const id = q.ID || q.id || q.Id || q.id_question;
      if (!id) {
        this.showAlert('error', 'Brak ID pytania!');
        return;
      }
      const isCorrect = selectedKey === getCorrectKey(q);

      if (isCorrect) this.score++;
      this.answersStatus[this.currentQuestionIndex] = {
        answered: true,
        correct: isCorrect,
        selected: index,
        selectedKey,
      };
      // ZAPISZ czas odpowiedzi na to pytanie
      const now = Date.now();
      this.questionTimes[this.currentQuestionIndex] = (now - this.startTime) / 1000;

      // Dodaj do hquestion
      try {
        await apiClient.post('/users/hquestion', {
          id,
          correct: isCorrect,
          category: q.category,
        });
      } catch (e) {
        this.showAlert('error', 'Błąd podczas zapisywania odpowiedzi.');
      }
      setTimeout(async () => {
        if (this.currentQuestionIndex < this.questions.length - 1) {
          this.currentQuestionIndex++;
        } else {
          this.showSummary = true;
          clearInterval(this.timer);
          this.countScore();
          await this.saveExamHistory();
        }
      }, 300);
      try {
        const token = sessionStorage.getItem('token');
        await apiClient.post(
          '/users/hquestion',
          {
            id: q.ID || q.id || q.Id || q.id_question,
            correct: isCorrect,
            category: q.category || '',
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (e) {
        this.showAlert('error', 'Błąd podczas zapisywania odpowiedzi.');
      }
    },
    countScore() {
      this.score = this.answersStatus.reduce((acc, a, idx) => {
        const q = this.questions[idx];
        return acc + (a.selectedKey === getCorrectKey(q) ? 1 : 0);
      }, 0);
    },
    userAnswerText(q, selectedKey) {
      if (!selectedKey) return '';
      return q[selectedKey] && q[selectedKey].answer ? q[selectedKey].answer : '';
    },
    correctAnswerText(q) {
      const correctKey = getCorrectKey(q);
      return correctKey && q[correctKey] && q[correctKey].answer ? q[correctKey].answer : '';
    },
    async restartExam() {
      this.isCorrection = false;
      this.examLength = this.initialExamLength;
      this.timeLeft = this.examTimeMinutes * 60;
      this.startTime = Date.now();

      // Jeśli jest kategoria w query, pobierz nowe błędne/nieprzerobione pytania
      if (this.$route.query.categories) {
        const cat = this.$route.query.categories;
        const token = sessionStorage.getItem('token');
        // Pobierz wszystkie pytania
        const allQuestions = (await apiClient.get('/questions')).data;
        const historyRes = await apiClient.get('/users/hquestion');
        const hq = historyRes.data.filter((q) => q.category === cat);

        // Wyznacz ID pytań z tej kategorii
        const allIds = allQuestions
          .filter((q) => q.category === cat)
          .map((q) => q.ID || q.id || q.Id || q.id_question);

        // Filtruj tylko błędne lub nieprzerobione
        const wrongOrNotDoneIds = allIds.filter((id) => {
          const entry = hq.find((q) => q.id == id);
          return !entry || entry.correct === false;
        });

        const length = Math.min(this.examLength, wrongOrNotDoneIds.length);

        this.$router.replace({
          name: 'ExamView',
          query: {
            ...this.$route.query,
            ids: wrongOrNotDoneIds.join(','),
            length,
            r: Math.random().toString(36).substring(2, 8),
          },
        });
      } else {
        // Standardowo: losuj z kategorii
        this.fetchQuestions();
        this.startTimer();
      }
    },
    async startTimer() {
      clearInterval(this.timer);
      this.timer = setInterval(async () => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          clearInterval(this.timer);
          this.showSummary = true;
          this.answersStatus = this.answersStatus.map((a) =>
            a.answered ? a : { answered: true, selected: null, selectedKey: null }
          );
          this.countScore();
          await this.saveExamHistory();
        }
      }, 1000);
    },
    async saveExamHistory() {
      try {
        // Tworzenie obiektu historii
        const historyItem = {
          type: this.isCorrection ? 'Egzamin - poprawa błędów' : 'egzamin',
          category: this.$route.query.categories || 'all',
          correct: this.score,
          wrong: this.questions.length - this.score,
          data: new Date().toISOString(),
          time: this.examTimeMinutes * 60 - this.timeLeft,
          questionTimes: this.questionTimes,
          list: this.questions.map((q, idx) => ({
            id_questions: q.ID || q.id || q.Id,
            answer: this.answersStatus[idx].selectedKey,
            correct: this.answersStatus[idx].selectedKey === getCorrectKey(q),
          })),
        };

        await apiClient.put('/users/update-profile', { addHistory: historyItem });
      } catch (error) {
        this.showAlert('error', 'Błąd podczas zapisywania wyników');
        console.error('Błąd zapisu historii:', error);
      }
    },

    goToQuestion(idx) {
      if (!this.showSummary) this.currentQuestionIndex = idx;
    },
    retryWrongQuestions() {
      const wrongIndexes = this.answersStatus
        .map((a, idx) => (a.selectedKey !== getCorrectKey(this.questions[idx]) ? idx : null))
        .filter((idx) => idx !== null);

      if (!wrongIndexes.length) return;

      this.questions = wrongIndexes.map((idx) => this.questions[idx]);
      this.answersStatus = this.questions.map(() => ({
        answered: false,
        selected: null,
        selectedKey: null,
      }));
      this.currentQuestionIndex = 0;
      this.showSummary = false;
      this.score = 0;
      this.timeLeft = this.examTimeMinutes * 60;
      this.examLength = this.questions.length;
      this.isCorrection = true;
      this.startTimer();
      this.startTime = Date.now();
    },
    handleKeydown(e) {
      if (this.showSummary) return;
      if (this.loading) return;

      if (
        ['1', '2', '3', '4'].includes(e.key) &&
        this.currentQuestionIndex < this.questions.length
      ) {
        const idx = parseInt(e.key, 10) - 1; // 0, 1, 2, 3 dla klawiszy 1, 2, 3, 4

        // Sprawdź, czy mamy dostęp do bieżącego komponentu pytania
        const currentQuestionEl = Array.isArray(this.$refs.questionList)
          ? this.$refs.questionList[this.currentQuestionIndex]
          : null;

        // Pobierz przetasowane odpowiedzi z komponentu lub z this.shuffledAnswers
        const currentAnswers = currentQuestionEl ? currentQuestionEl.answers : this.shuffledAnswers;

        // Sprawdź, czy odpowiedź o takim indeksie istnieje i czy pytanie nie zostało już odpowiedziane
        if (
          !this.answersStatus[this.currentQuestionIndex].answered &&
          currentAnswers &&
          currentAnswers[idx]
        ) {
          this.selectAnswer(idx, currentAnswers[idx].key);
        }
      }

      // Możesz też dodać obsługę strzałek dla nawigacji między pytaniami
      if (e.key === 'ArrowRight' && this.currentQuestionIndex < this.questions.length - 1) {
        if (this.answersStatus[this.currentQuestionIndex].answered) {
          this.currentQuestionIndex++;
        }
      }

      if (e.key === 'ArrowLeft' && this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
      }
    },
  },
};
</script>

<style scoped>
.exam-container {
  @apply flex flex-col items-center justify-start w-full  py-6 px-4 sm:px-6 container;
}

.exam-wrapper {
  @apply w-full  bg-white dark:bg-gray-800 rounded-2xl  overflow-hidden mb-6;
}

.exam-content {
  @apply p-6 sm:p-8;
}

.exam-header {
  @apply flex flex-col sm:flex-row justify-between items-center mb-6 gap-4;
}

.exam-title {
  @apply text-2xl sm:text-3xl font-bold text-gray-800;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.exam-timer-badge {
  @apply flex items-center gap-2 py-2 px-4 rounded-full bg-blue-50 text-blue-600 font-medium;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.exam-timer-badge svg {
  @apply w-5 h-5;
}

.exam-timer-badge.warning {
  @apply bg-red-50 text-red-600;
  border-color: rgba(239, 68, 68, 0.2);
  animation: pulse 2s infinite;
}

.question-indicator {
  @apply mb-6;
}

.indicator-text {
  @apply text-sm text-gray-500 mb-2 font-medium;
}

.progress-mini {
  @apply w-full h-1.5 bg-gray-100 rounded-full overflow-hidden;
}

.progress-mini-bar {
  @apply h-full bg-blue-500;
  transition: width 0.3s ease-in-out;
}

.exam-loader {
  @apply my-12;
}

.question-container {
  @apply mb-8;
}

.keyboard-shortcuts {
  @apply mt-6 flex justify-center;
}

.keyboard-hint {
  @apply flex items-center gap-2 text-sm text-gray-500;
}

.key-badge {
  @apply px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono;
}

.exam-progress {
  @apply w-full max-w-4xl;
}

.summary-box {
  @apply p-6 sm:p-8;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Responsywność */
@media (max-width: 640px) {
  .exam-header {
    @apply flex-col items-center mb-4 gap-3;
  }

  .exam-title {
    @apply text-xl text-center;
  }

  .exam-content {
    @apply p-4;
  }

  .exam-timer-badge {
    @apply text-sm py-1.5 px-3;
  }
}
</style>
