<template>
  <li
    ref="answerElement"
    :data-question-index="index"
    class="p-4 bg-white rounded-lg shadow-md border-l-4 dark:bg-gray-800 dark:shadow-lg"
    :class="
      isAnswerCorrect(item)
        ? 'border-green-500 dark:border-green-600'
        : 'border-red-500 dark:border-red-600'
    "
  >
    <div class="flex justify-between mb-2">
      <span class="font-semibold text-gray-700 dark:text-gray-300"> Pytanie {{ index + 1 }} </span>
      <span class="text-sm text-gray-500 dark:text-gray-400"> ID: {{ item.id_questions }} </span>
    </div>

    <div class="font-medium mb-3 text-gray-800 dark:text-gray-200">
      {{ getQuestionText(item.id_questions) }}
    </div>

    <div
      v-if="getQuestionDescription(item.id_questions)"
      class="text-gray-600 text-sm mb-3 p-2 bg-gray-50 rounded dark:bg-gray-700 dark:text-gray-300"
    >
      {{ getQuestionDescription(item.id_questions) }}
    </div>

    <div v-if="!isAnswerCorrect(item)" class="mb-3">
      <span class="font-semibold text-gray-700 dark:text-gray-300">Twoja odpowiedź: </span>
      <span class="text-red-700 font-medium dark:text-red-400">
        {{ getUserAnswerFullText(item) }}
      </span>
    </div>

    <div class="mt-2">
      <span class="font-semibold text-green-700 dark:text-green-400">
        {{ isAnswerCorrect(item) ? 'Twoja poprawna odpowiedź:' : 'Poprawna odpowiedź:' }}
      </span>
      <span class="text-green-700 dark:text-green-400">
        {{ getCorrectAnswerFullText(item.id_questions) }}
      </span>
    </div>
  </li>
</template>

<script setup>
import { inject, ref, onMounted } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});

// Dodaj referencję do elementu li
const answerElement = ref(null);

// Wyeksponuj tę referencję na zewnątrz komponentu
defineExpose({ answerElement });

const allQuestions = inject('historyQuestions', []);

function getQuestion(id) {
  if (Array.isArray(allQuestions)) return null;
  return (
    allQuestions.value.find((q) => q.ID == id || q.id == id || q.Id == id || q.id_question == id) ||
    null
  );
}

function getQuestionText(id) {
  const question = getQuestion(id);
  return question?.question || 'Treść pytania niedostępna';
}

function getQuestionDescription(id) {
  const question = getQuestion(id);
  return question?.description || '';
}

function getUserAnswerFullText(item) {
  if (!item || !item.answer) return 'Nie udzielono odpowiedzi';
  const question = getQuestion(item.id_questions);
  if (!question) return `Odpowiedź ${item.answer}`;

  const answerObj = question[item.answer];
  if (answerObj && answerObj.answer) {
    return `${item.answer.slice(-1).toUpperCase()}: ${answerObj.answer}`;
  } else {
    return `Odpowiedź ${item.answer.toUpperCase()}`;
  }
}

function getCorrectAnswerFullText(id) {
  const question = getQuestion(id);
  if (!question) return 'Brak informacji o poprawnej odpowiedzi';

  for (const key of ['a', 'b', 'c', 'd']) {
    const answerObj = question[`answer_${key}`];
    if (answerObj && (answerObj.isCorrect === true || answerObj.isCorret === true)) {
      return `${key.toUpperCase()}: ${answerObj.answer}`;
    }
  }

  return 'Brak zdefiniowanej poprawnej odpowiedzi';
}

function isAnswerCorrect(item) {
  if (item && (item.correct === true || item.isCorrect === true)) {
    return true;
  }
  if (item && (item.correct === false || item.isCorrect === false)) {
    return false;
  }
  if (!item || !item.answer) return false;

  const question = getQuestion(item.id_questions);
  if (!question) {
    return false;
  }

  try {
    let correctKey = null;
    for (const key of ['a', 'b', 'c', 'd']) {
      const answerObj = question[`answer_${key}`];
      if (answerObj && (answerObj.isCorrect === true || answerObj.isCorret === true)) {
        correctKey = key;
        break;
      }
    }
    if (!correctKey) {
      return false;
    }
    return item.answer.toLowerCase() === correctKey.toLowerCase();
  } catch (e) {
    return false;
  }
}

// Dodaj hook onMounted, który zgłasza gotowość referencji
onMounted(() => {
  // Zgłoś do rodzica, że element jest zamontowany
  if (answerElement.value) {
    const event = new CustomEvent('answer-mounted', {
      detail: { index: props.index, element: answerElement.value },
    });
    document.dispatchEvent(event);
  }
});
</script>
