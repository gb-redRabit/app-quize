<template>
  <div class="relative">
    <h2 class="text-sm sm:text-2xl mb-6 font-semibold break-words flex">
      <QuestionActions :question="question" @deleted="onDeleted" @edit="onEdit" />{{
        question.question
      }}
    </h2>
    <div class="flex flex-col w-full">
      <button
        v-for="(answer, idx) in answers"
        :key="idx"
        class="p-2 sm:p-4 rounded mb-1 sm:mb-4 border text-sm sm:text-lg transition-colors flex items-center hover:scale-125 focus:ring-2 focus:ring-blue-400"
        :class="buttonClass(answer, idx)"
        @click="onSelect(idx)"
        :disabled="answered"
      >
        <span class="mr-2 sm:mr-4 font-bold text-lg sm:text-xl">
          {{ answerLetter(idx) }}
        </span>
        <span class="text-left break-words">{{ answer.answer }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { shuffleArray } from '@/utils/shuffleArray';
import QuestionActions from './QuestionActions.vue';

export default {
  props: {
    question: { type: Object, required: true },
    answered: Boolean,
    selected: Number,
    showCorrect: Boolean,
    selectedKey: String,
    showActions: { type: Boolean, default: false }, // <-- dodaj ten prop
  },
  emits: ['select', 'edit', 'delete'],
  components: { QuestionActions },
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
      return this.answers.findIndex((a) => a.isCorret);
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
      // Usuń pytanie z lokalnej listy
      this.$emit('deleted', q); // przekaż wyżej jeśli trzeba
      if (Array.isArray(this.questions)) {
        this.questions = this.questions.filter((qq) => qq.ID !== q.ID);
      }
    },
    onEdit(q) {
      // Otwórz modal edycji pytania (tak jak w AdminView)
      this.$emit('edit', q); // przekaż wyżej jeśli trzeba
      // lub otwórz lokalny modal edycji
      this.editQuestion = { ...q };
      this.showEditPopup = true;
    },
    buttonClass(answer, index) {
      if (!this.answered) {
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      }

      // Tryb egzaminu: tylko zaznaczona odpowiedź na czerwono, reszta szara
      if (!this.showCorrect) {
        return this.selectedIndex === index
          ? 'bg-red-500 text-white'
          : 'bg-gray-200 text-gray-700 cursor-not-allowed';
      }

      // Tryb quizu: klasyczne zachowanie
      const isSelected = this.selectedIndex === index;
      const isCorrect = answer.isCorrect || answer.isCorret;

      if (isSelected) {
        return isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
      }
      if (this.showCorrect && isCorrect) {
        return 'bg-green-500 text-white';
      }
      return 'bg-gray-200 text-gray-700 cursor-not-allowed';
    },
    answerLetter(idx) {
      return String.fromCharCode(65 + idx);
    },
    onQuestionDeleted(q) {
      // Usuń pytanie z lokalnej listy bez przeładowania strony
      this.questions = this.questions.filter((qq) => qq.ID !== q.ID);
    },
    onQuestionEdited(editedQ) {
      // Zaktualizuj pytanie w lokalnej liście
      const idx = this.questions.findIndex((q) => q.ID === editedQ.ID);
      if (idx !== -1) {
        this.questions.splice(idx, 1, editedQ);
      }
    },
  },
};
</script>
