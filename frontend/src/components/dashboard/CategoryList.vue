<!-- filepath: d:\git nowe\app-quize\frontend\src\components\dashboard\CategoryList.vue -->
<template>
  <div class="divide-y divide-gray-200 dark:divide-gray-700">
    <div
      v-for="cat in categories"
      :key="cat"
      class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-3 transition-colors"
    >
      <div class="flex-1">
        <div class="flex items-start justify-between mb-2">
          <h3 class="font-semibold text-gray-800 dark:text-gray-100" :title="cat">
            {{ cat }}
          </h3>
          <div class="flex items-center gap-2 ml-3">
            <span
              class="text-xs font-medium px-2 py-1 rounded-full"
              :class="getCategoryPercentCompleteClass(cat)"
            >
              {{ categoryPercentComplete(cat) }}%
            </span>
            <span
              v-if="getCategoryStatus(cat)"
              class="text-xs font-medium px-2 py-1 rounded-full"
              :class="getCategoryStatusClass(cat)"
            >
              {{ getCategoryStatus(cat) }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-4 mb-2">
          <div class="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 flex overflow-hidden">
            <div
              class="bg-green-400 h-full"
              :style="{ width: categoryPercentage(cat).correct + '%' }"
            ></div>
            <div
              class="bg-red-400 h-full"
              :style="{ width: categoryPercentage(cat).wrong + '%' }"
            ></div>
          </div>
          <span class="text-xs font-medium whitespace-nowrap dark:text-gray-300">
            Łącznie: {{ total(cat) }}
          </span>
        </div>

        <div class="flex gap-3 text-xs text-gray-600 dark:text-gray-400">
          <span class="flex items-center">
            <span class="w-2 h-2 inline-block bg-green-400 rounded-full mr-1"></span>
            {{ categoryStats(cat).correct }}
          </span>
          <span class="flex items-center">
            <span class="w-2 h-2 inline-block bg-red-400 rounded-full mr-1"></span>
            {{ categoryStats(cat).wrong }}
          </span>
          <span class="flex items-center">
            <span class="w-2 h-2 inline-block bg-gray-400 rounded-full mr-1"></span>
            {{ categoryStats(cat).notDone }}
          </span>
        </div>
      </div>

      <div class="flex flex-wrap gap-2 justify-end">
        <BaseButton color="blue" size="md" class="text-md" @click="$emit('go-to-questions', cat)">
          Pytania
        </BaseButton>
        <div class="relative">
          <BaseButton
            color="green"
            size="md"
            class="text-md"
            :disabled="isDisabled(cat)"
            @click="$emit('toggle-quiz-options', cat)"
          >
            Quiz
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3 w-3 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </BaseButton>
          <div v-if="showQuizOptions[cat]" class="absolute z-10 w-full mt-1">
            <div
              class="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg py-1"
            >
              <a
                class="block px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                @click="startQuiz(cat, 50)"
              >
                Max 50 pytań
              </a>
              <a
                class="block px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                @click="startQuiz(cat, 150)"
              >
                Max 150 pytań
              </a>
              <a
                class="block px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                @click="startQuiz(cat, 0)"
              >
                Cała pula
              </a>
            </div>
          </div>
        </div>
        <BaseButton
          color="purple"
          size="md"
          class="text-xs"
          :disabled="isDisabled(cat)"
          @click="$emit('start-exam', cat)"
        >
          Egzamin
        </BaseButton>
        <BaseButton color="red" size="md" class="px-2" @click="$emit('clear-history', cat)">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStats } from '@/composables/useUserStats';
import BaseButton from '@/components/base/BaseButton.vue';
import { onMounted, onUnmounted, nextTick } from 'vue';

const props = defineProps({
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
]);

const {
  categoryStats,
  categoryPercentage,
  categoryPercentComplete,
  getCategoryStatus,
  getCategoryStatusClass,
} = useUserStats();

const isDisabled = (cat) => {
  const stats = categoryStats(cat);
  return stats.notDone === 0 && stats.wrong === 0;
};

const total = (cat) => {
  const stats = categoryStats(cat);
  return stats.correct + stats.wrong + stats.notDone;
};

const startQuiz = (cat, limit) => {
  emit('toggle-quiz-options', cat);
  emit('start-quiz', cat, limit);
};

const getCategoryPercentCompleteClass = (cat) => {
  const percent = categoryPercentComplete(cat);
  if (percent > 75) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (percent > 25) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
};

onMounted(() => {
  // Nasłuchuj na zmiany danych użytkownika
  window.addEventListener('user-data-refreshed', handleDataRefresh);
  window.addEventListener('category-history-cleared', handleCategoryClearedEvent);
});

onUnmounted(() => {
  window.removeEventListener('user-data-refreshed', handleDataRefresh);
  window.removeEventListener('category-history-cleared', handleCategoryClearedEvent);
});

// Dodaj funkcję obsługującą odświeżenie danych
const handleDataRefresh = (event) => {
  // Wymuś ponowne obliczenie statystyk
  if (props.categoryStats) {
    Object.keys(props.categoryStats).forEach((cat) => {
      if (!event.detail.category || event.detail.category === cat) {
        // Resetuj statystyki dla kategorii
        if (props.categoryStats[cat]) {
          props.categoryStats[cat].correct = 0;
          props.categoryStats[cat].wrong = 0;
          props.categoryStats[cat].notDone = 0;
        }
      }
    });
  }

  // Wymuś przerenderowanie komponentu
  nextTick(() => {
    // Opcjonalnie wywołaj funkcję przekazaną z rodzica do odświeżenia danych
    emit('refresh-data');
  });
};

// Dodaj nową funkcję obsługi zdarzenia
const handleCategoryClearedEvent = (event) => {
  const { category } = event.detail;

  // Natychmiast zresetuj statystyki dla czyszczonej kategorii
  if (props.categoryStats && props.categoryStats[category]) {
    props.categoryStats[category] = {
      correct: 0,
      wrong: 0,
      notDone: questionsHelper.categoryCounts.value[category] || 0,
    };
  }

  // Wymuś przerenderowanie komponentu
  nextTick(() => {
    // Znajdź element kategorii i dodaj klasę animacji
    const categoryRow = document.querySelector(`[data-category="${category}"]`);
    if (categoryRow) {
      categoryRow.classList.add('refreshing');
      setTimeout(() => categoryRow.classList.remove('refreshing'), 800);
    }

    // Opcjonalnie wywołaj funkcję przekazaną z rodzica do odświeżenia danych
    emit('refresh-data');
  });
};
</script>
