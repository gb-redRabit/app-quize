<template>
  <div class="question-card">
    <!-- Nagłówek z pytaniem -->
    <div class="question-header">
      <div class="question-number" v-if="questionNumber">
        <span>{{ questionNumber }}</span>
      </div>
      <h2 class="question-text">
        {{ question.question }}
      </h2>
      <QuestionActions
        :question="question"
        @deleted="onDeleted"
        @edit="onEdit"
        class="question-actions"
      />
    </div>

    <!-- Lista odpowiedzi -->
    <div class="answers-container">
      <button
        v-for="(answer, idx) in answers"
        :key="idx"
        class="answer-button"
        :class="buttonClass(answer, idx)"
        @click="onSelect(idx)"
        :disabled="answered"
      >
        <div class="answer-letter">
          {{ answerLetter(idx) }}
        </div>
        <div class="answer-content">
          {{ answer.answer }}
        </div>
        <div class="answer-indicator" v-if="answered">
          <svg
            v-if="isCorrectAnswer(answer)"
            xmlns="http://www.w3.org/2000/svg"
            class="answer-icon correct"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else-if="isSelectedAnswer(idx)"
            xmlns="http://www.w3.org/2000/svg"
            class="answer-icon wrong"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </button>
    </div>
    <QuestionDescription
      v-if="this.$route.name !== 'ExamView'"
      :answered="answered"
      :description="question.description"
      class="mt-2"
    />
  </div>
</template>

<script>
import { shuffleArray } from '@/utils/shuffleArray';
import QuestionActions from './QuestionActions.vue';
import QuestionDescription from '@/components/QuestionDescription.vue';
export default {
  props: {
    question: { type: Object, required: true },
    answered: Boolean,
    selected: Number,
    showCorrect: Boolean,
    selectedKey: String,
    showActions: { type: Boolean, default: false },
    questionNumber: { type: [String, Number], default: null },
  },
  emits: ['select', 'edit', 'delete'],
  components: { QuestionActions, QuestionDescription },
  data() {
    return {
      shuffledAnswers: [],
    };
  },
  watch: {
    question: {
      immediate: true,
      handler() {
        this.shuffledAnswers = shuffleArray(
          ['answer_a', 'answer_b', 'answer_c', 'answer_d']
            .map((k) => this.question[k] && { ...this.question[k], key: k })
            .filter(Boolean)
        );
      },
    },
  },
  computed: {
    answers() {
      return this.shuffledAnswers;
    },
    correctIndex() {
      return this.answers.findIndex((a) => a.isCorret || a.isCorrect);
    },
    selectedIndex() {
      if (!this.selectedKey) return null;
      return this.answers.findIndex((a) => a.key === this.selectedKey);
    },
  },
  methods: {
    async refreshQuestions() {
      const res = await apiClient.get('/questions');
      this.questions = res.data;
    },
    onSelect(index) {
      this.$emit('select', index, this.answers[index].key);
    },
    onDeleted(q) {
      this.$emit('deleted', q);
      if (Array.isArray(this.questions)) {
        this.questions = this.questions.filter((qq) => qq.ID !== q.ID);
      }
    },
    onEdit(q) {
      this.$emit('edit', q);
    },
    buttonClass(answer, index) {
      let classes = '';

      if (!this.answered) {
        classes = 'active';
      } else {
        // Dodanie klasy 'selected' do wybranej odpowiedzi
        if (this.selectedIndex === index) {
          classes += ' selected';
        }

        // Obsługa poprawnych/niepoprawnych odpowiedzi
        if (this.showCorrect) {
          const isCorrect = answer.isCorrect || answer.isCorret;
          if (isCorrect) {
            classes += ' correct';
          } else if (this.selectedIndex === index) {
            classes += ' incorrect';
          } else {
            classes += ' inactive';
          }
        } else {
          // Tryb egzaminu
          classes += this.selectedIndex === index ? ' selected-exam' : ' inactive';
        }
      }

      return classes;
    },
    answerLetter(idx) {
      return String.fromCharCode(65 + idx);
    },
    isCorrectAnswer(answer) {
      return (answer.isCorrect || answer.isCorret) && this.showCorrect;
    },
    isSelectedAnswer(index) {
      return this.selectedIndex === index && !this.isCorrectAnswer(this.answers[index]);
    },
  },
};
</script>

<style scoped>
.question-card {
  @apply bg-white rounded-xl shadow-md p-4 sm:p-6 relative mb-8 transition-all duration-300;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.question-card:hover {
  @apply shadow-lg;
}

.question-header {
  @apply flex flex-wrap items-start mb-6 relative;
}

.question-number {
  @apply flex items-center justify-center bg-blue-600 text-white rounded-full w-8 h-8 mr-3 flex-shrink-0 font-bold text-sm;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.question-text {
  @apply text-gray-800 font-medium text-lg sm:text-xl flex-1 leading-relaxed;
  font-weight: 500;
}

.question-actions {
  @apply absolute -top-1 right-0;
}

.answers-container {
  @apply space-y-3 mb-4;
}

.answer-button {
  @apply flex items-center w-full text-left p-3 sm:p-4 rounded-lg border transition-all duration-200 relative overflow-hidden;
  min-height: 3.5rem;
}

/* Stany przycisków odpowiedzi */
.answer-button.active {
  @apply bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-gray-800 hover:bg-blue-100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.answer-button.active:hover {
  @apply border-blue-400;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(59, 130, 246, 0.2);
}

.answer-button.correct {
  @apply bg-gradient-to-r from-green-50 to-green-100 border-green-300 text-green-800;
  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.2);
}

.answer-button.incorrect {
  @apply bg-gradient-to-r from-red-50 to-red-100 border-red-300 text-red-800;
}

.answer-button.selected {
  @apply border-blue-500;
}

.answer-button.selected-exam {
  @apply bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300 text-yellow-800;
}

.answer-button.inactive {
  @apply bg-gray-50 border-gray-200 text-gray-500 cursor-default;
}

.answer-letter {
  @apply flex items-center justify-center rounded-full w-8 h-8 bg-white border border-current mr-3 font-bold text-sm flex-shrink-0;
}

.answer-button.active .answer-letter {
  @apply text-blue-600 border-blue-300;
}

.answer-button.correct .answer-letter {
  @apply text-green-600 border-green-400 bg-green-50;
}

.answer-button.incorrect .answer-letter {
  @apply text-red-600 border-red-400 bg-red-50;
}

.answer-button.selected-exam .answer-letter {
  @apply text-yellow-600 border-yellow-400 bg-yellow-50;
}

.answer-content {
  @apply flex-1 text-sm sm:text-base;
}

.answer-indicator {
  @apply ml-2 flex-shrink-0;
}

.answer-icon {
  @apply w-5 h-5;
}

.answer-icon.correct {
  @apply text-green-600;
}

.answer-icon.wrong {
  @apply text-red-600;
}

.explanation {
  @apply bg-blue-50 p-4 rounded-lg mt-6 text-sm text-blue-800;
}

.explanation-header {
  @apply flex items-center mb-2 font-medium;
}

.explanation-icon {
  @apply w-5 h-5 mr-2 text-blue-600;
}

.question-category {
  @apply text-xs font-medium text-gray-500 mt-4 inline-block;
  background-color: #f9f9f9;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid #eee;
}

/* Animacje */
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

.question-card {
  animation: fadeIn 0.3s ease-out;
}

/* Media queries dla lepszej responsywności */
@media (max-width: 640px) {
  .answer-button {
    padding: 0.75rem;
  }

  .answer-letter {
    width: 2rem;
    height: 2rem;
    margin-right: 0.5rem;
  }
}
</style>
