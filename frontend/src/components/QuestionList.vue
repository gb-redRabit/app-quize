<template>
  <div
    class="bg-white rounded-xl shadow-md p-4 sm:p-6 relative mb-8 transition-all duration-300 border border-gray-50 hover:shadow-lg dark:bg-gray-800 dark:border-gray-700"
  >
    <QuestionActions
      :question="question"
      @deleted="onDeleted"
      @edit="onEdit"
      class="absolute -top-1 right-0"
    />

    <div class="flex flex-wrap items-start mb-6 relative">
      <div
        v-if="questionNumber"
        class="flex items-center justify-center bg-blue-600 text-white rounded-full w-8 h-8 mr-3 flex-shrink-0 font-bold text-sm shadow-blue-500/30"
      >
        <span>{{ questionNumber }}</span>
      </div>
      <h2
        class="text-gray-800 font-medium text-lg sm:text-xl flex-1 leading-relaxed dark:text-white"
      >
        {{ question.question }}
      </h2>
    </div>

    <div class="space-y-3 mb-4">
      <button
        v-for="(answer, idx) in answers"
        :key="idx"
        class="flex items-center w-full text-left p-3 sm:p-4 rounded-lg border transition-all duration-200 relative overflow-hidden min-h-[3.5rem]"
        :class="buttonClass(answer, idx)"
        @click="onSelect(idx)"
        :disabled="answered"
      >
        <div
          class="flex items-center justify-center rounded-full w-8 h-8 bg-white border mr-3 font-bold text-sm flex-shrink-0 dark:bg-gray-700 dark:text-white"
        >
          {{ answerLetter(idx) }}
        </div>
        <div class="flex-1 text-sm sm:text-base dark:text-gray-200">
          {{ answer.answer }}
        </div>
        <div v-if="answered" class="ml-2 flex-shrink-0">
          <svg
            v-if="isCorrectAnswer(answer)"
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 text-green-600"
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
            class="w-5 h-5 text-red-600"
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
// Import kompatybilnej biblioteki
import VirtualList from 'vue3-virtual-scroll-list';

export default {
  name: 'QuestionList',
  props: {
    question: { type: Object, required: true },
    answered: Boolean,
    selected: Number,
    showCorrect: Boolean,
    selectedKey: String,
    showActions: { type: Boolean, default: false },
    questionNumber: { type: [String, Number], default: null },
  },
  inject: ['showAlert'],
  emits: ['select', 'edit', 'delete'],
  components: {
    QuestionActions,
    QuestionDescription,
    VirtualList,
  },
  data() {
    return {
      shuffledAnswers: [],
      questionComponent: this.$options.components.QuestionItem,
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
      try {
        const res = await apiClient.get('/questions');
        this.questions = res.data;
        this.showAlert('success', 'Lista pytań została odświeżona');
      } catch (error) {
        this.showAlert('error', 'Nie udało się odświeżyć listy pytań');
      } finally {
      }
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
        classes =
          'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-gray-800 hover:bg-blue-100 dark:from-gray-700 dark:to-gray-600 dark:border-gray-500 dark:text-white hover:dark:bg-gray-600 shadow-sm hover:translate-y-[-1px] hover:shadow-md'; // Combined active and hover
      } else {
        // Dodanie klasy 'selected' do wybranej odpowiedzi
        if (this.selectedIndex === index) {
          classes += ' border-blue-500 dark:border-blue-400';
        }

        // Obsługa poprawnych/niepoprawnych odpowiedzi
        if (this.showCorrect) {
          const isCorrect = answer.isCorret || answer.isCorrect;
          if (isCorrect) {
            classes +=
              ' bg-gradient-to-r from-green-50 to-green-100 border-green-300 text-green-800 shadow-sm dark:from-green-700 dark:to-green-600 dark:border-green-500 dark:text-green-200';
          } else if (this.selectedIndex === index) {
            classes +=
              ' bg-gradient-to-r from-red-50 to-red-100 border-red-300 text-red-800 dark:from-red-700 dark:to-red-600 dark:border-red-500 dark:text-red-200';
          } else {
            classes +=
              ' bg-gray-50 border-gray-200 text-gray-500 cursor-default dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400';
          }
        } else {
          // Tryb egzaminu
          classes +=
            this.selectedIndex === index
              ? ' bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300 text-yellow-800 dark:from-yellow-700 dark:to-yellow-600 dark:border-yellow-500 dark:text-yellow-200'
              : ' bg-gray-50 border-gray-200 text-gray-500 cursor-default dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400';
        }
      }

      // Add common classes for answer-letter based on button state
      if (!this.answered) {
        classes +=
          ' [&_.answer-letter]:text-blue-600 [&_.answer-letter]:border-blue-300 dark:[&_.answer-letter]:text-blue-400 dark:[&_.answer-letter]:border-blue-600';
      } else {
        const isCorrect = answer.isCorret || answer.isCorrect;
        if (this.showCorrect && isCorrect) {
          classes +=
            ' [&_.answer-letter]:text-green-600 [&_.answer-letter]:border-green-400 [&_.answer-letter]:bg-green-50 dark:[&_.answer-letter]:text-green-300 dark:[&_.answer-letter]:border-green-500 dark:[&_.answer-letter]:bg-green-800';
        } else if (this.showCorrect && this.selectedIndex === index) {
          classes +=
            ' [&_.answer-letter]:text-red-600 [&_.answer-letter]:border-red-400 [&_.answer-letter]:bg-red-50 dark:[&_.answer-letter]:text-red-300 dark:[&_.answer-letter]:border-red-500 dark:[&_.answer-letter]:bg-red-800';
        } else if (!this.showCorrect && this.selectedIndex === index) {
          classes +=
            ' [&_.answer-letter]:text-yellow-600 [&_.answer-letter]:border-yellow-400 [&_.answer-letter]:bg-yellow-50 dark:[&_.answer-letter]:text-yellow-300 dark:[&_.answer-letter]:border-yellow-500 dark:[&_.answer-letter]:bg-yellow-800';
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
/*
  The following styles were originally in <style scoped>
  and have been converted to Tailwind CSS classes applied directly in the template.
  Some complex interactions or pseudo-elements might not have a direct inline Tailwind equivalent
  and would ideally be handled via custom utility classes in a global Tailwind CSS file
  using `@apply` or by extending Tailwind's configuration.

  For example:
  - The `box-shadow` with rgba colors have been converted to the closest Tailwind shadow utility.
  - The `transform: translateY(-1px)` has been converted to `translate-y-[-1px]` which uses arbitrary values.
  - The `:hover` states are handled by Tailwind's `hover:` variant.
  - The animation `fadeIn` is complex for inline application and is commented out below,
    as it's better handled by a CSS animation class that can be applied.
  - The `answer-button.active .answer-letter` and similar nested rules
    are handled by adding the `[&_.answer-letter]:` arbitrary variant to the `buttonClass` computed property.
    This allows applying styles to a child element based on the parent's state directly in the parent's class binding.
*/

/* Original .question-card styles (converted to template) */
/* .question-card {
  @apply bg-white rounded-xl shadow-md p-4 sm:p-6 relative mb-8 transition-all duration-300;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.question-card:hover {
  @apply shadow-lg;
} */

/* Original .question-header styles (converted to template) */
/* .question-header {
  @apply flex flex-wrap items-start mb-6 relative;
} */

/* Original .question-number styles (converted to template) */
/* .question-number {
  @apply flex items-center justify-center bg-blue-600 text-white rounded-full w-8 h-8 mr-3 flex-shrink-0 font-bold text-sm;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
} */

/* Original .question-text styles (converted to template) */
/* .question-text {
  @apply text-gray-800 font-medium text-lg sm:text-xl flex-1 leading-relaxed;
  font-weight: 500;
} */

/* Original .question-actions styles (converted to template) */
/* .question-actions {
  @apply absolute -top-1 right-0;
} */

/* Original .answers-container styles (converted to template) */
/* .answers-container {
  @apply space-y-3 mb-4;
} */

/* Original .answer-button styles (converted to template) */
/* .answer-button {
  @apply flex items-center w-full text-left p-3 sm:p-4 rounded-lg border transition-all duration-200 relative overflow-hidden;
  min-height: 3.5rem;
} */

/* Original Stany przycisków odpowiedzi styles (converted to buttonClass and template) */
/* .answer-button.active {
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
} */

/* Original .answer-letter styles (converted to template and buttonClass for conditional styling) */
/* .answer-letter {
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
} */

/* Original .answer-content styles (converted to template) */
/* .answer-content {
  @apply flex-1 text-sm sm:text-base;
} */

/* Original .answer-indicator styles (converted to template) */
/* .answer-indicator {
  @apply ml-2 flex-shrink-0;
} */

/* Original .answer-icon styles (converted to template) */
/* .answer-icon {
  @apply w-5 h-5;
}

.answer-icon.correct {
  @apply text-green-600;
}

.answer-icon.wrong {
  @apply text-red-600;
} */

/* Original .explanation styles (not directly in this component's scope, but generally converted) */
/* .explanation {
  @apply bg-blue-50 p-4 rounded-lg mt-6 text-sm text-blue-800;
}

.explanation-header {
  @apply flex items-center mb-2 font-medium;
}

.explanation-icon {
  @apply w-5 h-5 mr-2 text-blue-600;
} */

/* Original .question-category styles (not directly in this component's scope) */
/* .question-category {
  @apply text-xs font-medium text-gray-500 mt-4 inline-block;
  background-color: #f9f9f9;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid #eee;
} */

/* Animacje (difficult to convert directly inline, often better as a utility class or handled by a library) */
/* @keyframes fadeIn {
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
} */

/* Media queries (handled by Tailwind's responsive prefixes like sm:, md:, lg:) */
/* @media (max-width: 640px) {
  .answer-button {
    padding: 0.75rem;
  }

  .answer-letter {
    width: 2rem;
    height: 2rem;
    margin-right: 0.5rem;
  }
} */
</style>
