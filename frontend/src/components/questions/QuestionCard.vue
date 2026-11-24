<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 transition-all border border-gray-100 dark:border-gray-700 hover:shadow-md transform duration-300"
    :class="{
      'border-l-4 border-green-400 dark:border-green-500 bg-gradient-to-r from-green-50 to-white dark:from-green-900/20 dark:to-gray-800':
        lastAttemptMap[question.ID] === true,
      'border-l-4 border-red-400 dark:border-red-500 bg-gradient-to-r from-red-50 to-white dark:from-red-900/20 dark:to-gray-800':
        lastAttemptMap[question.ID] === false,
      'ring-2 ring-blue-400 dark:ring-blue-600': compact && selected,
      'cursor-pointer p-3': compact,
    }"
    :role="compact ? 'button' : undefined"
    :tabindex="compact ? 0 : undefined"
    :aria-current="compact && selected ? 'true' : undefined"
    @click="compact ? $emit('select', question) : null"
    @keydown.enter="compact ? $emit('select', question) : null"
    @keydown.space.prevent="compact ? $emit('select', question) : null"
  >
    <!-- Widok kompaktowy (lista w master-detail) -->
    <template v-if="compact">
      <div class="flex items-start gap-3">
        <span class="font-mono text-xs text-gray-500 dark:text-gray-400 mt-0.5 shrink-0">
          {{ question.ID }}
        </span>
        <p class="flex-1 min-w-0 text-sm font-medium text-gray-800 dark:text-gray-200">
          {{ question.question }}
        </p>
        <span class="flex items-center gap-1 shrink-0">
          <span
            v-if="question.flagged"
            class="h-2.5 w-2.5 rounded-full bg-green-500"
            title="Sprawdzone"
          ></span>
          <span
            v-if="question.bad"
            class="h-2.5 w-2.5 rounded-full bg-red-500"
            title="Złe"
          ></span>
          <span
            v-if="question.unknown"
            class="h-2.5 w-2.5 rounded-full bg-yellow-500"
            title="Nie wiem"
          ></span>
        </span>
      </div>
      <p class="mt-1 ml-8 text-xs text-gray-500 dark:text-gray-400 truncate">
        {{ question.category || 'Bez kategorii' }}
      </p>
    </template>

    <!-- Question header -->
    <div v-else class="flex justify-between items-start mb-3">
      <div
        class="text-sm font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
      >
        ID: {{ question.ID }}
      </div>

      <!-- Panel administracyjny - widoczny tylko dla adminów -->
      <div v-if="isAdmin" class="flex flex-wrap items-center justify-end gap-2 mt-2">
        <!-- Flagged/Checked checkbox -->
        <div class="relative mb-2 sm:mb-0">
          <input
            type="checkbox"
            :checked="question.flagged"
            @change="$emit('toggle-flagged', question)"
            :id="'flagged-' + question.ID"
            class="sr-only"
          />
          <label
            :for="'flagged-' + question.ID"
            :class="[
              question.flagged
                ? 'bg-green-100 dark:bg-green-900 border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 font-semibold shadow'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer',
              'px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-2 border transition justify-center text-sm',
            ]"
            style="min-width: 110px"
          >
            <span v-if="question.flagged">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="inline w-4 h-4 sm:w-5 sm:h-5 text-green-500 dark:text-green-400 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Sprawdzone
            </span>
            <span v-else>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="inline w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 3v18M19 3v18"
                />
              </svg>
              Sprawdzone
            </span>
          </label>
        </div>

        <!-- Bad checkbox -->
        <div class="relative mb-2 sm:mb-0">
          <input
            type="checkbox"
            :checked="question.bad"
            @change="$emit('toggle-bad', question)"
            :id="'bad-' + question.ID"
            class="sr-only"
          />
          <label
            :for="'bad-' + question.ID"
            :class="[
              question.bad
                ? 'bg-red-100 dark:bg-red-900 border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 font-semibold shadow'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-red-400 dark:hover:border-red-600 hover:text-red-600 dark:hover:text-red-400 cursor-pointer',
              'px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-2 border transition justify-center text-sm',
            ]"
            style="min-width: 80px"
          >
            <span v-if="question.bad">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="inline w-4 h-4 sm:w-5 sm:h-5 text-red-500 dark:text-red-400 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Złe
            </span>
            <span v-else>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="inline w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Złe
            </span>
          </label>
        </div>

        <!-- Unknown checkbox -->
        <div class="relative mb-2 sm:mb-0">
          <input
            type="checkbox"
            :checked="question.unknown"
            @change="$emit('toggle-unknown', question)"
            :id="'unknown-' + question.ID"
            class="sr-only"
          />
          <label
            :for="'unknown-' + question.ID"
            :class="[
              question.unknown
                ? 'bg-yellow-100 dark:bg-yellow-900 border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300 font-semibold shadow'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-yellow-400 dark:hover:border-yellow-600 hover:text-yellow-600 dark:hover:text-yellow-400 cursor-pointer',
              'px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-2 border transition justify-center text-sm',
            ]"
            style="min-width: 90px"
          >
            <span v-if="question.unknown">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="inline w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 dark:text-yellow-400 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Nie wiem
            </span>
            <span v-else>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="inline w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Nie wiem
            </span>
          </label>
        </div>

        <QuestionActions
          :question="question"
          :inline-edit="inlineEdit"
          @deleted="$emit('deleted', $event)"
          @edit="$emit('edited', $event)"
          @request-edit="$emit('request-edit', $event)"
          class="ml-0 sm:ml-2 mt-2 sm:mt-0"
        />
      </div>
    </div>

    <!-- Treść, odpowiedzi i opis tylko w pełnym widoku -->
    <template v-if="!compact">
      <!-- Question content -->
      <div class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-5">
        {{ question.question }}
      </div>

    <!-- Answers -->
    <div class="space-y-2 mb-4">
      <AnswerItem letter="A" :answer="question.answer_a" />
      <AnswerItem letter="B" :answer="question.answer_b" />
      <AnswerItem letter="C" :answer="question.answer_c" />
      <AnswerItem v-if="question.answer_d" letter="D" :answer="question.answer_d" />
    </div>

    <!-- Question description -->
    <div
      v-if="question.description"
      class="flex items-start gap-3 mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-500"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div class="text-sm">{{ question.description }}</div>
    </div>
    <span v-if="question.note" class="text-gray-500 dark:text-gray-400 ml-2"
      >📝 {{ question.note }}</span
    >
    </template>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import { useStore } from 'vuex';
import QuestionActions from '@/components/questions/QuestionActions.vue';
import AnswerItem from '@/components/questions/AnswerItem.vue';

// Dostęp do globalnego systemu alertów
const showAlert = inject('showAlert', (type, msg) => console.warn(`Alert: ${type} - ${msg}`));

// Dostęp do store
const store = useStore();

// Sprawdź, czy użytkownik jest adminem
const user = computed(() => store.getters['user/getUser']);
const isAdmin = computed(() => user.value?.rola === 'admin');

// Props
const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  lastAttemptMap: {
    type: Object,
    required: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  inlineEdit: {
    type: Boolean,
    default: false,
  },
});

// Emits
defineEmits([
  'toggle-flagged',
  'toggle-bad',
  'toggle-unknown',
  'deleted',
  'edited',
  'select',
  'request-edit',
]);
</script>
