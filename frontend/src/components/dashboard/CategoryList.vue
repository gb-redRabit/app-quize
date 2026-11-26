<template>
  <div class="surface divide-y divide-gray-100 dark:divide-gray-800">
    <div
      v-for="cat in categories"
      :key="cat"
      :data-category="cat"
      class="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
    >
      <button
        type="button"
        class="flex-1 min-w-0 text-left rounded-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
        @click="$emit('go-to-questions', cat)"
      >
        <div class="flex items-center gap-2 flex-wrap">
          <span
            v-if="getCategoryStatus(cat)"
            class="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            :class="getCategoryStatusClass(cat)"
          >
            {{ getCategoryStatus(cat) }}
          </span>
          <h3 class="font-semibold text-gray-900 dark:text-gray-100 break-words" :title="cat">
            {{ cat }}
          </h3>
        </div>

        <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
          <span class="font-semibold text-gray-700 dark:text-gray-200">
            {{ categoryPercentComplete(cat) }}%
            <span class="font-normal">przerobione</span>
          </span>
          <span
            class="inline-flex h-1.5 w-32 sm:w-44 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
            aria-hidden="true"
          >
            <span
              class="h-full bg-green-500"
              :style="{ width: `${categoryPercentage(cat).correct}%` }"
            ></span>
            <span
              class="h-full bg-red-500"
              :style="{ width: `${categoryPercentage(cat).wrong}%` }"
            ></span>
          </span>
          <span>{{ total(cat) }} pytań</span>
          <span class="hidden md:inline">
            <span class="text-green-700 dark:text-green-300">{{ categoryStats(cat).correct }}</span>
            poprawnie ·
            <span class="text-red-700 dark:text-red-300">{{ categoryStats(cat).wrong }}</span>
            błędnie ·
            <span>{{ categoryStats(cat).notDone }}</span> bez odpowiedzi
          </span>
        </div>
      </button>

      <div class="flex items-center justify-end gap-2 shrink-0 self-stretch sm:self-auto">
        <div class="relative">
          <BaseButton
            color="blue"
            size="xs"
            :disabled="isDisabled(cat)"
            aria-haspopup="menu"
            :aria-expanded="showQuizOptions[cat] ? 'true' : 'false'"
            @click="$emit('toggle-quiz-options', cat)"
          >
            Quiz
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3 w-3 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </BaseButton>

          <div
            v-if="showQuizOptions[cat]"
            class="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1"
            role="menu"
            :aria-label="`Opcje quizu: ${cat}`"
            @keydown.esc.stop.prevent="$emit('toggle-quiz-options', cat)"
          >
            <button
              v-for="option in quizOptions"
              :key="option.value"
              type="button"
              role="menuitem"
              class="block w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 focus:outline-hidden"
              @click="startQuiz(cat, option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="relative">
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
            :aria-label="`Więcej akcji: ${cat}`"
            :aria-expanded="openMenuFor === cat ? 'true' : 'false'"
            aria-haspopup="menu"
            @click.stop="toggleMenu(cat)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M12 6a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4z"
              />
            </svg>
          </button>

          <div
            v-if="openMenuFor === cat"
            class="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1"
            role="menu"
            :aria-label="`Akcje kategorii: ${cat}`"
            @keydown.esc.stop.prevent="closeMenu"
          >
            <button
              type="button"
              role="menuitem"
              class="block w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 focus:outline-hidden"
              @click="runAction('go-to-questions', cat)"
            >
              Pokaż pytania
            </button>
            <button
              type="button"
              role="menuitem"
              class="block w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 focus:outline-hidden disabled:opacity-50"
              :disabled="isDisabled(cat)"
              @click="runAction('start-exam', cat)"
            >
              Rozpocznij egzamin
            </button>
            <button
              type="button"
              role="menuitem"
              class="block w-full text-left px-3 py-2 text-xs text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 focus:bg-red-50 dark:focus:bg-red-900/30 focus:outline-hidden"
              @click="runAction('clear-history', cat)"
            >
              Wyczyść historię kategorii
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useUserStats } from '@/composables/useUserStats';
import BaseButton from '@/components/base/BaseButton.vue';

defineProps({
  categories: {
    type: Array,
    required: true,
  },
  showQuizOptions: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits([
  'toggle-quiz-options',
  'start-quiz',
  'start-exam',
  'go-to-questions',
  'clear-history',
  'refresh-data',
]);

const {
  categoryStats,
  categoryPercentage,
  categoryPercentComplete,
  getCategoryStatus,
  getCategoryStatusClass,
} = useUserStats();

const quizOptions = [
  { value: 50, label: 'Max 50 pytań' },
  { value: 150, label: 'Max 150 pytań' },
  { value: 0, label: 'Cała pula' },
];

const openMenuFor = ref(null);

const isDisabled = (cat) => {
  const stats = categoryStats(cat);
  return stats.notDone === 0 && stats.wrong === 0;
};

const total = (cat) => {
  const stats = categoryStats(cat);
  return stats.correct + stats.wrong + stats.notDone;
};

function toggleMenu(cat) {
  openMenuFor.value = openMenuFor.value === cat ? null : cat;
}

function closeMenu() {
  openMenuFor.value = null;
}

function runAction(action, cat) {
  closeMenu();
  emit(action, cat);
}

const startQuiz = (cat, limit) => {
  emit('toggle-quiz-options', cat);
  emit('start-quiz', cat, limit);
};

function handleDocumentClick() {
  if (openMenuFor.value !== null) openMenuFor.value = null;
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
  window.addEventListener('user-data-refreshed', handleDataRefresh);
  window.addEventListener('category-history-cleared', handleCategoryClearedEvent);
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick);
  window.removeEventListener('user-data-refreshed', handleDataRefresh);
  window.removeEventListener('category-history-cleared', handleCategoryClearedEvent);
});

const handleDataRefresh = () => emit('refresh-data');
const handleCategoryClearedEvent = (event) => {
  const { category } = event.detail || {};
  const row = document.querySelector(`[data-category="${CSS.escape(category)}"]`);
  if (row) {
    row.classList.add('refreshing');
    setTimeout(() => row.classList.remove('refreshing'), 800);
  }
  emit('refresh-data');
};
</script>

<style scoped>
@keyframes refresh {
  0% {
    opacity: 0.6;
    box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.5);
  }
  100% {
    opacity: 1;
    box-shadow: none;
  }
}
.refreshing {
  animation: refresh 0.8s ease-out forwards;
}
</style>
