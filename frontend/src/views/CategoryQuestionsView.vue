<template>
  <div class="container mx-auto p-4 md:p-6">
    <!-- Usuwam bezpośrednie użycie BaseLoader -->

    <div class="header-section">
      <div class="category-title-wrapper">
        <h1 class="category-title">
          Pytania z kategorii:
          <span class="category-highlight">{{ categoryLabel }}</span>
        </h1>
        <div class="category-stats-badge" v-if="lastAttemptStats.total > 0">
          <div class="stats-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z"
                clip-rule="evenodd"
              />
              <path
                fill-rule="evenodd"
                d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="stats-text">
            Ostatnie podejście:
            <span class="font-bold">{{ lastAttemptStats.total }}</span>
            pytań (<span class="text-green-600 font-bold">{{ lastAttemptStats.correct }}</span
            >/<span class="text-red-600 font-bold">{{ lastAttemptStats.wrong }}</span
            >)
          </div>
        </div>
      </div>

      <SearchBar v-model:search="searchQuery" placeholder="Szukaj po treści pytania lub ID..." />
    </div>

    <div class="actions-section">
      <BaseButton color="green" size="md" class="action-button" @click="downloadQuestionsTxt">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="button-icon"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        <span>Pobierz pytania</span>
      </BaseButton>

      <BaseButton
        :color="showDuplicates ? 'blue' : 'yellow'"
        size="md"
        class="action-button"
        @click="showDuplicates = !showDuplicates"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="button-icon"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z"
          />
        </svg>
        <span>{{ showDuplicates ? 'Pokaż wszystkie' : 'Pokaż duplikaty' }}</span>
      </BaseButton>
    </div>

    <!-- Progress bar -->
    <div v-if="lastAttemptStats.total > 0" class="progress-container">
      <div class="progress-labels">
        <span class="progress-label">
          <span class="progress-dot correct-dot"></span>
          Poprawne: {{ lastAttemptStats.correct }}
        </span>
        <span class="progress-label">
          <span class="progress-dot incorrect-dot"></span>
          Niepoprawne: {{ lastAttemptStats.wrong }}
        </span>
      </div>
      <div class="progress-bar">
        <div
          v-if="lastAttemptStats.correct > 0"
          :style="{
            width: (lastAttemptStats.correct / lastAttemptStats.total) * 100 + '%',
          }"
          class="progress-segment correct"
        ></div>
        <div
          v-if="lastAttemptStats.wrong > 0"
          :style="{
            width: (lastAttemptStats.wrong / lastAttemptStats.total) * 100 + '%',
          }"
          class="progress-segment incorrect"
        ></div>
      </div>
    </div>

    <div v-if="loading" class="loading-message">
      <svg
        class="animate-spin h-6 w-6 mr-3"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span>Ładowanie pytań...</span>
    </div>

    <div v-else-if="filteredQuestions.length === 0" class="empty-state">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="empty-icon"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
        />
      </svg>
      <p>Brak pytań w tej kategorii</p>
      <p class="empty-subtext">Spróbuj zmienić kryteria wyszukiwania lub wybierz inną kategorię</p>
    </div>

    <div v-else class="questions-container">
      <div
        v-for="q in visibleQuestions"
        :key="q.ID"
        class="question-card"
        :class="{
          'correct-card': lastAttemptMap[q.ID] === true,
          'incorrect-card': lastAttemptMap[q.ID] === false,
        }"
      >
        <div class="question-header">
          <div class="question-id">ID: {{ q.ID }}</div>
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              :checked="q.flagged"
              @change="toggleFlagged(q)"
              :id="'flagged-' + q.ID"
            />
            <label
              :for="'flagged-' + q.ID"
              :class="{ 'text-green-500 font-bold': q.flagged }"
              class="text-sm text-gray-600 cursor-pointer"
            >
              Sprawdzone
            </label>
            <QuestionActions
              :question="q"
              @deleted="onQuestionDeleted"
              @edit="onQuestionEdited"
              class="question-actions"
            />
          </div>
        </div>

        <div class="question-content">{{ q.question }}</div>

        <div class="answers-container">
          <div class="answer-item" :class="{ 'correct-answer': q.answer_a && q.answer_a.isCorret }">
            <div class="answer-letter">A</div>
            <div class="answer-text">{{ q.answer_a && q.answer_a.answer }}</div>
          </div>

          <div class="answer-item" :class="{ 'correct-answer': q.answer_b && q.answer_b.isCorret }">
            <div class="answer-letter">B</div>
            <div class="answer-text">{{ q.answer_b && q.answer_b.answer }}</div>
          </div>

          <div class="answer-item" :class="{ 'correct-answer': q.answer_c && q.answer_c.isCorret }">
            <div class="answer-letter">C</div>
            <div class="answer-text">{{ q.answer_c && q.answer_c.answer }}</div>
          </div>

          <div
            v-if="q.answer_d"
            class="answer-item"
            :class="{ 'correct-answer': q.answer_d && q.answer_d.isCorret }"
          >
            <div class="answer-letter">D</div>
            <div class="answer-text">{{ q.answer_d && q.answer_d.answer }}</div>
          </div>
        </div>

        <div v-if="q.description" class="question-description">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="description-icon"
          >
            <path
              fill-rule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
              clip-rule="evenodd"
            />
          </svg>
          <div class="description-text">{{ q.description }}</div>
        </div>
        <span v-if="q.note" class="text-gray-500 ml-2">📝 {{ q.note }}</span>
      </div>

      <div v-if="hasMoreQuestions" class="load-more">
        <div class="load-more-spinner"></div>
        <span>Przewiń w dół, aby załadować więcej pytań...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import SearchBar from '@/components/SearchBar.vue';
import BaseButton from '@/components/BaseButton.vue';
import QuestionActions from '@/components/QuestionActions.vue';
import apiClient from '@/api';

export default {
  name: 'CategoryQuestionsView',
  components: {
    SearchBar,
    BaseButton,
    QuestionActions,
  },
  inject: ['showAlert', 'showLoader', 'hideLoader'],
  data() {
    return {
      loading: true,
      searchQuery: '',
      displayCount: 100,
      loadingMore: false,
      localQuestions: [],
      showDuplicates: false,
    };
  },
  computed: {
    ...mapGetters('questions', ['getQuestions']),
    ...mapGetters('user', ['getUser']),
    ...mapState(['user']),
    category() {
      return this.$route.params.category;
    },
    categoryLabel() {
      return this.category === 'all' ? 'Wszystkie' : this.category;
    },
    lastAttempt() {
      if (!this.user || !this.user.history) return null;
      return (
        [...this.user.history].reverse().find(
          (entry) =>
            (entry.type === 'quiz' || entry.type === 'egzamin') &&
            entry.list.some((item) => {
              const q = this.getQuestions.find(
                (qq) =>
                  qq.ID == item.id_questions ||
                  qq.id == item.id_questions ||
                  qq.Id == item.id_questions ||
                  qq.id_question == item.id_questions
              );
              return this.category === 'all' || (q && q.category === this.category);
            })
        ) || null
      );
    },
    lastAttemptMap() {
      if (!this.lastAttempt) return {};
      const map = {};
      for (const item of this.lastAttempt.list) {
        if (typeof item.correct === 'boolean') {
          map[item.id_questions] = item.correct;
        } else if (item.answer) {
          const q = this.getQuestions.find(
            (qq) =>
              qq.ID == item.id_questions ||
              qq.id == item.id_questions ||
              qq.Id == item.id_questions ||
              qq.id_question == item.id_questions
          );
          if (q) {
            const keys = ['answer_a', 'answer_b', 'answer_c', 'answer_d'];
            const correctIdx = keys.findIndex((k) => q[k] && q[k].isCorret);
            const correctLetter = ['A', 'B', 'C', 'D'][correctIdx];
            map[item.id_questions] = item.answer === correctLetter;
          }
        }
      }
      return map;
    },
    lastAttemptStats() {
      if (!this.lastAttempt) return { total: 0, correct: 0, wrong: 0 };
      let total = 0,
        correct = 0,
        wrong = 0;
      for (const item of this.lastAttempt.list) {
        const q = this.getQuestions.find(
          (qq) =>
            qq.ID == item.id_questions ||
            qq.id == item.id_questions ||
            qq.Id == item.id_questions ||
            qq.id_question == item.id_questions
        );
        if (this.category === 'all' || (q && q.category === this.category)) {
          total++;
          let isCorrect = null;
          if (typeof item.correct === 'boolean') {
            isCorrect = item.correct;
          } else if (item.answer && q) {
            const keys = ['answer_a', 'answer_b', 'answer_c', 'answer_d'];
            const correctIdx = keys.findIndex((k) => q[k] && q[k].isCorret);
            const correctLetter = ['A', 'B', 'C', 'D'][correctIdx];
            isCorrect = item.answer === correctLetter;
          }
          if (isCorrect === true) correct++;
          else if (isCorrect === false) wrong++;
        }
      }
      return { total, correct, wrong };
    },
    sortedQuestions() {
      const idsInAttempt = this.lastAttempt
        ? this.lastAttempt.list
            .filter((item) => {
              const q = this.getQuestions.find(
                (qq) =>
                  qq.ID == item.id_questions ||
                  qq.id == item.id_questions ||
                  qq.Id == item.id_questions ||
                  qq.id_question == item.id_questions
              );
              return this.category === 'all' || (q && q.category === this.category);
            })
            .map((item) => item.id_questions)
        : [];
      const wrong = [];
      const correct = [];
      const rest = [];
      for (const q of this.filteredQuestions) {
        if (idsInAttempt.includes(q.ID)) {
          if (this.lastAttemptMap[q.ID] === false) wrong.push(q);
          else if (this.lastAttemptMap[q.ID] === true) correct.push(q);
          else rest.push(q);
        } else {
          rest.push(q);
        }
      }
      return [...wrong, ...correct, ...rest];
    },
    filteredQuestions() {
      let questions =
        this.category === 'all'
          ? this.localQuestions
          : this.localQuestions.filter((q) => q.category === this.category);
      if (!this.searchQuery) return this.showDuplicates ? this.duplicateQuestions : questions;
      const q = this.searchQuery.toLowerCase();
      const base = this.showDuplicates ? this.duplicateQuestions : questions;
      return base.filter(
        (item) =>
          (item.ID && item.ID.toString().includes(q)) ||
          (item.question && item.question.toLowerCase().includes(q))
      );
    },
    duplicateQuestions() {
      const questions =
        this.category === 'all'
          ? this.localQuestions
          : this.localQuestions.filter((q) => q.category === this.category);

      const map = {};
      for (const q of questions) {
        const norm = this.normalizeQuestion(q.question);
        if (!map[norm]) map[norm] = [];
        map[norm].push(q);
      }
      return Object.values(map)
        .filter((arr) => arr.length > 1)
        .flat()
        .sort((a, b) => a.question.localeCompare(b.question));
    },
    visibleQuestions() {
      return this.sortedQuestions.slice(0, this.displayCount);
    },
    hasMoreQuestions() {
      return this.displayCount < this.sortedQuestions.length;
    },
  },
  async created() {
    this.showLoader('Ładowanie pytań kategorii...');
    try {
      const questions = await this.$store.dispatch(
        'questions/fetchQuestionsByCategory',
        this.category
      );
      this.localQuestions = Array.isArray(questions) ? questions : [];
      this.loading = false;
    } catch (error) {
      this.showAlert('error', 'Błąd podczas ładowania pytań');
      this.localQuestions = [];
      this.loading = false;
    }
    this.hideLoader();
    // Dodaj nasłuchiwanie scrolla po załadowaniu pytań
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    handleScroll() {
      if (this.loadingMore || !this.hasMoreQuestions) return;
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      if (scrollY + windowHeight + 200 >= docHeight) {
        this.loadingMore = true;
        setTimeout(() => {
          this.displayCount += 100;
          this.loadingMore = false;
        }, 200);
      }
    },
    downloadQuestionsTxt() {
      const questions = this.sortedQuestions;
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
            if (ans.obj.isCorret) txt += '   [poprawna]';
            txt += '\n';
          }
        });
        if (q.description) txt += `   Opis: ${q.description}\n`;
        txt += '\n';
      });

      const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pytania_${this.categoryLabel}.txt`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    },
    onQuestionDeleted(deletedQuestion) {
      this.localQuestions = this.localQuestions.filter((q) => q.ID !== deletedQuestion.ID);
    },
    onQuestionEdited(editedQuestion) {
      const idx = this.localQuestions.findIndex((q) => q.ID === editedQuestion.ID);
      if (idx !== -1) {
        this.localQuestions.splice(idx, 1, editedQuestion);
      }
    },
    async toggleFlagged(q) {
      const prev = q.flagged;
      q.flagged = !q.flagged; // Optymistycznie zmień od razu
      try {
        const updated = { ...q, flagged: q.flagged };
        if ('_id' in updated) delete updated._id;
        await apiClient.put(`/questions/${q.ID}`, updated);
        this.showAlert('success', updated.flagged ? 'Pytanie oznaczone jako ważne' : 'Oznaczenie usunięte');
      } catch (e) {
        q.flagged = prev; // Cofnij zmianę w razie błędu
        this.showAlert('error', 'Błąd podczas zmiany oznaczenia pytania');
      }
    },
    normalizeQuestion(text) {
      return text
        ? text
            .trim()
            .replace(/[\s:.\?!]+$/, '')
            .toLowerCase()
        : '';
    },
  },
};
</script>

<style scoped>
.header-section {
  @apply mb-6 bg-white rounded-xl p-4 md:p-5 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4;
}

.category-title-wrapper {
  @apply flex flex-col sm:flex-row items-start sm:items-center gap-3;
}

.category-title {
  @apply text-xl sm:text-2xl font-bold text-gray-800;
}

.category-highlight {
  @apply text-blue-600;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.category-stats-badge {
  @apply flex items-center py-1.5 px-3 rounded-full bg-blue-50 text-blue-800 text-sm gap-2;
}

.stats-icon {
  @apply w-4 h-4 text-blue-500;
}

.stats-text {
  @apply text-xs sm:text-sm whitespace-nowrap;
}

.search-wrapper {
}

.actions-section {
  @apply flex flex-wrap gap-3 mb-6;
}

.action-button {
  @apply flex items-center gap-2;
}

.button-icon {
  @apply w-5 h-5;
}

.progress-container {
  @apply mb-8 bg-white p-4 rounded-xl shadow-sm;
}

.progress-labels {
  @apply flex justify-between mb-2 text-sm;
}

.progress-label {
  @apply flex items-center gap-1.5;
}

.progress-dot {
  @apply w-2.5 h-2.5 rounded-full;
}

.correct-dot {
  @apply bg-green-400;
}

.incorrect-dot {
  @apply bg-red-400;
}

.progress-bar {
  @apply h-2.5 rounded-full bg-gray-100 flex overflow-hidden;
}

.progress-segment {
  @apply h-full transition-all duration-500 ease-out;
}

.correct {
  @apply bg-green-400;
}

.incorrect {
  @apply bg-red-400;
}

.loading-message {
  @apply flex items-center justify-center text-lg text-gray-600 p-12;
}

.empty-state {
  @apply flex flex-col items-center justify-center text-gray-500 p-12 bg-white rounded-xl shadow-sm;
}

.empty-icon {
  @apply w-14 h-14 mb-4 text-gray-400;
}

.empty-subtext {
  @apply text-sm text-gray-400 mt-2;
}

.questions-container {
  @apply space-y-6;
}

.question-card {
  @apply bg-white rounded-xl shadow-sm p-5 transition-all border border-gray-100 hover:shadow-md;
  animation: fadeIn 0.3s ease-out;
}

.correct-card {
  @apply border-l-4 border-green-400 bg-gradient-to-r from-green-50 to-white;
}

.incorrect-card {
  @apply border-l-4 border-red-400 bg-gradient-to-r from-red-50 to-white;
}

.question-header {
  @apply flex justify-between items-start mb-3;
}

.question-id {
  @apply text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded;
}

.question-actions {
  @apply ml-2;
}

.question-content {
  @apply text-lg font-medium text-gray-800 mb-5;
}

.answers-container {
  @apply space-y-2 mb-4;
}

.answer-item {
  @apply flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 transition-all;
}

.answer-item:hover {
  @apply bg-gray-100;
}

.correct-answer {
  @apply bg-green-50 border-green-200;
}

.correct-answer:hover {
  @apply bg-green-100;
}

.answer-letter {
  @apply flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-medium;
}

.correct-answer .answer-letter {
  @apply bg-green-500 text-white;
}

.answer-text {
  @apply text-gray-700;
}

.question-description {
  @apply flex items-start gap-3 mt-4 p-3 rounded-lg bg-blue-50 text-gray-700;
}

.description-icon {
  @apply w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5;
}

.description-text {
  @apply text-sm;
}

.load-more {
  @apply flex flex-col items-center justify-center py-8 text-gray-400 text-sm;
}

.load-more-spinner {
  @apply w-5 h-5 border-2 border-gray-300 rounded-full animate-spin mb-3;
  border-top-color: #3b82f6; /* blue-500 */
}

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

/* Animacja podczas hover dla przycisku pobierania */
.action-button:hover svg {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Styl dla ukrywania scrollbara ale zachowania funkcji scrollowania */
.hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
