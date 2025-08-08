<template>
  <div class="bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-800 dark:shadow-lg">
    <!-- Nagłówek z wynikiem -->
    <div
      class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b dark:from-gray-700 dark:to-gray-900 dark:border-gray-700"
    >
      <div
        class="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0"
      >
        <div class="flex flex-col space-y-2">
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Podsumowanie testu</h2>
          <div class="flex items-center">
            <div class="relative h-16 w-16 mr-4">
              <!-- Wykres kołowy wyników -->
              <svg class="h-16 w-16 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  class="text-gray-200 dark:text-gray-600"
                  stroke-width="10"
                  stroke="currentColor"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                />
                <circle
                  class="text-blue-600 transition-all duration-1000 ease-in-out dark:text-blue-400"
                  stroke-width="10"
                  stroke-linecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                  :stroke-dasharray="`${percentage * 264}, 264`"
                />
              </svg>
              <div
                class="absolute inset-0 flex items-center justify-center text-lg font-bold text-blue-700 dark:text-blue-300"
              >
                {{ score }}/{{ total }}
              </div>
            </div>
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-300">Twój wynik</p>
              <p class="text-lg font-semibold text-gray-800 dark:text-white">{{ percentage }}%</p>
            </div>
          </div>
        </div>

        <!-- Przyciski akcji -->
        <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <BaseButton
            :color="allQuestionsCompleted ? 'blue' : 'green'"
            @click="handleMainButton"
            class="w-full sm:w-auto"
          >
            <span class="flex items-center">
              <svg
                v-if="!allQuestionsCompleted"
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
                />
              </svg>
              {{ mainButtonText }}
            </span>
          </BaseButton>
          <BaseButton
            v-if="hasWrong"
            color="yellow"
            @click="emit('retry-wrong')"
            class="w-full sm:w-auto"
          >
            <span class="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              Popraw błędne odpowiedzi
            </span>
          </BaseButton>
        </div>
      </div>

      <!-- Pasek postępu -->
      <div class="mt-6">
        <div class="h-2 w-full bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
          <div
            class="h-2 bg-gradient-to-r from-green-400 to-green-500 transition-all duration-1000 dark:from-green-500 dark:to-green-600"
            :style="`width: ${percentage}%`"
          ></div>
        </div>
        <div class="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>

    <!-- Lista pytań -->
    <div class="p-6">
      <h3 class="text-lg font-semibold text-gray-700 mb-4 flex items-center dark:text-gray-200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path
            fill-rule="evenodd"
            d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
            clip-rule="evenodd"
          />
        </svg>
        Przegląd pytań
      </h3>

      <!-- Lista pytań -->
      <div class="space-y-5">
        <div
          v-for="(q, idx) in questions"
          :key="idx"
          class="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-700 dark:hover:shadow-lg"
        >
          <div
            class="flex items-center p-4 border-b border-gray-100 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
          >
            <div
              class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold"
              :class="
                isCorrect(idx)
                  ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-white'
                  : 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-white'
              "
            >
              {{ idx + 1 }}
            </div>
            <div class="flex-grow font-medium text-gray-800 dark:text-white">{{ q.question }}</div>

            <!-- Ikona statusu (poprawna/niepoprawna odpowiedź) -->
            <div class="flex-shrink-0 ml-3">
              <div
                class="rounded-full p-1"
                :class="
                  isCorrect(idx)
                    ? 'bg-green-100 text-green-600 dark:bg-green-700 dark:text-white'
                    : 'bg-red-100 text-red-600 dark:bg-red-700 dark:text-white'
                "
              >
                <svg
                  v-if="isCorrect(idx)"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
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
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
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
            </div>
          </div>

          <div class="p-4">
            <!-- Informacja o odpowiedzi użytkownika -->
            <div v-if="isCorrect(idx)" class="flex items-center text-green-700 dark:text-green-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="font-semibold">{{ correctAnswerText(q) }}</span>
            </div>
            <div v-else class="space-y-2">
              <div class="flex items-center text-red-700 dark:text-red-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="font-semibold mr-2">Twoja odpowiedź:</span>
                <span class="dark:text-gray-200">{{
                  userAnswerText(q, answersStatus[idx].selectedKey)
                }}</span>
              </div>

              <div class="flex items-center text-green-700 dark:text-green-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="font-semibold mr-2">Prawidłowa odpowiedź:</span>
                <span class="dark:text-gray-200">{{ correctAnswerText(q) }}</span>
              </div>
            </div>

            <!-- Opis/wyjaśnienie pytania -->
            <div
              v-if="q.description"
              class="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200 text-sm text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
            >
              <div class="flex items-center text-gray-600 font-medium mb-1 dark:text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
                Wyjaśnienie:
              </div>
              {{ q.description }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import BaseButton from '@/components/base/BaseButton.vue';

// Definicja propsów
const props = defineProps({
  questions: Array,
  answersStatus: Array,
  score: Number,
  total: Number,
  userAnswerText: Function,
  correctAnswerText: Function,
  category: String,
  allQuestionsCompleted: {
    type: Boolean,
    default: false,
  },
});

// Definicja emitów
const emit = defineEmits(['go-home', 'restart', 'retry-wrong']);

// Computed properties
const percentage = computed(() => {
  return props.total > 0 ? Math.round((props.score / props.total) * 100) : 0;
});

const hasWrong = computed(() => {
  return props.answersStatus.some((a, idx) => {
    if (!a || !props.questions[idx]) return false;
    const correctKey = getCorrectKeyFromQuestion(props.questions[idx]);
    return a.selectedKey && a.selectedKey !== correctKey;
  });
});

const mainButtonText = computed(() => {
  return props.allQuestionsCompleted
    ? 'Wszystkie pytania zaliczone! Wróć do strony głównej'
    : 'Rozpocznij ponownie';
});

// Metody
function isCorrect(idx) {
  const a = props.answersStatus[idx];
  const q = props.questions[idx];
  if (!a || !q) return false;
  return a.selectedKey === getCorrectKeyFromQuestion(q);
}

function getCorrectKeyFromQuestion(q) {
  const keys = ['answer_a', 'answer_b', 'answer_c', 'answer_d'];

  // Obsługa różnych formatów poprawnej odpowiedzi (isCorret/isCorrect)
  for (const key of keys) {
    if (q[key] && (q[key].isCorret === true || q[key].isCorrect === true)) {
      return key;
    }
  }

  // Fallback - pierwsza dostępna odpowiedź
  return keys.find((k) => q[k] && q[k].answer) || '';
}

function handleMainButton() {
  if (props.allQuestionsCompleted) {
    emit('go-home');
  } else {
    emit('restart', true);
  }
}
</script>
