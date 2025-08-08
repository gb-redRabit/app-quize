<template>
  <div
    class="bg-white rounded-xl shadow-md p-4 sm:p-6 relative mb-8 transition-all duration-300 border border-gray-50 hover:shadow-lg dark:bg-gray-800 dark:border-gray-700"
  >
    <QuestionActions
      v-if="isAdmin"
      :question="question"
      @deleted="emit('delete', $event)"
      @edit="emit('edit', $event)"
      class="absolute -top-1 right-0"
    />

    <div class="flex flex-wrap items-start mb-6 relative">
      <div
        v-if="questionNumber"
        class="flex items-center justify-center bg-blue-600 text-white rounded-full w-8 h-8 mr-3 flex-shrink-0 font-bold text-sm"
        style="box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3)"
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
        class="flex items-center w-full text-left p-3 sm:p-4 rounded-lg border transition-all duration-200 relative overflow-hidden"
        :class="buttonClass(answer, idx)"
        @click="onSelect(idx)"
        :disabled="answered"
        style="min-height: 3.5rem"
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
      v-if="routeName !== 'ExamView'"
      :answered="answered"
      :description="question.description"
      class="mt-2"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue';
import { useRoute } from 'vue-router';
import { shuffleArray } from '@/utils/shuffleArray';
import QuestionActions from '@/components/questions/QuestionActions.vue';
import QuestionDescription from '@/components/questions/QuestionDescription.vue';
import { useStore } from 'vuex';

const store = useStore();
const currentUser = computed(() => store.getters['user/getUser']);
const isAdmin = computed(() => currentUser.value?.rola === 'admin');
// Props
const props = defineProps({
  question: { type: Object, required: true },
  answered: Boolean,
  selected: Number,
  showCorrect: Boolean,
  selectedKey: String,
  questionNumber: { type: [String, Number], default: null },
});

// Emits
const emit = defineEmits(['select', 'edit', 'delete']);

// Inject
const showAlert = inject('showAlert', (type, msg) =>
  console.warn(`Alert not available: ${type} - ${msg}`)
);

// Route
const route = useRoute();
const routeName = computed(() => route.name);

// Stan komponentu
const shuffledAnswers = ref([]);

// Obliczenia
const answers = computed(() => shuffledAnswers.value);

const correctIndex = computed(() => {
  return answers.value.findIndex((a) => a.isCorret || a.isCorrect);
});

const selectedIndex = computed(() => {
  if (!props.selectedKey) return null;
  return answers.value.findIndex((a) => a.key === props.selectedKey);
});

// Obserwowanie zmian
watch(
  () => props.question,
  (newQuestion) => {
    shuffledAnswers.value = shuffleArray(
      ['answer_a', 'answer_b', 'answer_c', 'answer_d']
        .map((k) => newQuestion[k] && { ...newQuestion[k], key: k })
        .filter(Boolean)
    );
  },
  { immediate: true }
);

// Metody
function onSelect(index) {
  emit('select', index, answers.value[index].key);
}

function buttonClass(answer, index) {
  let classes = '';

  if (!props.answered) {
    classes =
      'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-gray-800 hover:bg-blue-100 dark:from-gray-700 dark:to-gray-600 dark:border-gray-500 dark:text-white hover:dark:bg-gray-600 shadow-sm hover:shadow-md';
    // Usunięto translate-y-[-1px] i zastąpiono normalnym stylem
  } else {
    // Dodanie klasy 'selected' do wybranej odpowiedzi
    if (selectedIndex.value === index) {
      classes += ' border-blue-500 dark:border-blue-400';
    }

    // Obsługa poprawnych/niepoprawnych odpowiedzi
    if (props.showCorrect) {
      const isCorrect = answer.isCorret || answer.isCorrect;
      if (isCorrect) {
        classes +=
          ' bg-gradient-to-r from-green-50 to-green-100 border-green-300 text-green-800 shadow-sm dark:from-green-700 dark:to-green-600 dark:border-green-500 dark:text-green-200';
      } else if (selectedIndex.value === index) {
        classes +=
          ' bg-gradient-to-r from-red-50 to-red-100 border-red-300 text-red-800 dark:from-red-700 dark:to-red-600 dark:border-red-500 dark:text-red-200';
      } else {
        classes +=
          ' bg-gray-50 border-gray-200 text-gray-500 cursor-default dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400';
      }
    } else {
      // Tryb egzaminu
      classes +=
        selectedIndex.value === index
          ? ' bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300 text-yellow-800 dark:from-yellow-700 dark:to-yellow-600 dark:border-yellow-500 dark:text-yellow-200'
          : ' bg-gray-50 border-gray-200 text-gray-500 cursor-default dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400';
    }
  }

  return classes;
}

function answerLetter(idx) {
  return String.fromCharCode(65 + idx);
}

function isCorrectAnswer(answer) {
  return (answer.isCorrect || answer.isCorret) && props.showCorrect;
}

function isSelectedAnswer(index) {
  return selectedIndex.value === index && !isCorrectAnswer(answers.value[index]);
}

// Eksponuj odpowiedzi jako właściwość komponentu
defineExpose({
  answers: computed(() => shuffledAnswers.value),
});
</script>

<style scoped>
/* Minimal styles that couldn't be replaced with Tailwind */
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

/* Apply animation to the root element */
div {
  animation: fadeIn 0.3s ease-out;
}
</style>
