<!-- filepath: d:\git nowe\app-quize\frontend\src\components\dashboard\CategoryCard.vue -->
<template>
  <div
    class="categories-container rounded-lg border-2 shadow-sm p-4 transition-all duration-300 hover:shadow-lg"
    :class="cardClass"
  >
    <div class="flex justify-between items-start mb-3">
      <h3
        class="font-semibold text-gray-800 dark:text-gray-100 truncate max-w-[70%]"
        :title="category"
      >
        {{ category }}
      </h3>
      <div class="flex items-center gap-2">
        <span
          class="indicator_A text-xs font-medium px-2 py-1 rounded-full"
          :class="percentCompleteClass"
        >
          {{ percentComplete }}%
        </span>
        <span
          v-if="categoryStatus"
          class="indicator_B text-xs font-medium px-2 py-1 rounded-full"
          :class="statusClass"
        >
          {{ categoryStatus }}
        </span>
      </div>
    </div>
    <div class="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 flex overflow-hidden mb-3">
      <div class="bg-green-400 h-full" :style="{ width: `${percentage.correct}%` }"></div>
      <div class="bg-red-400 h-full" :style="{ width: `${percentage.wrong}%` }"></div>
    </div>
    <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-4">
      <div class="flex gap-2">
        <span class="flex items-center"
          ><span class="w-2 h-2 inline-block bg-green-400 rounded-full mr-1"></span>
          {{ stats.correct }}</span
        >
        <span class="flex items-center"
          ><span class="w-2 h-2 inline-block bg-red-400 rounded-full mr-1"></span>
          {{ stats.wrong }}</span
        >
        <span class="flex items-center"
          ><span class="w-2 h-2 inline-block bg-gray-400 rounded-full mr-1"></span>
          {{ stats.notDone }}</span
        >
      </div>
      <span class="font-medium">Łącznie: {{ total }}</span>
    </div>
    <div class="category-card grid grid-cols-3 gap-2">
      <BaseButton
        color="blue"
        size="sm"
        class="text-xs"
        @click="$emit('go-to-questions', category)"
      >
        <span class="truncate">Pytania</span>
      </BaseButton>
      <div class="relative">
        <BaseButton
          color="green"
          size="sm"
          class="w-full text-xs"
          :disabled="isDisabled"
          @click="$emit('toggle-quiz-options')"
        >
          <span class="truncate">Quiz</span>
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
        <div v-if="showQuizOptions" class="absolute z-10 w-full mt-1">
          <div
            class="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg py-1"
          >
            <a
              class="block px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              @click="startQuizWithLimit(50)"
            >
              Max 50 pytań
            </a>
            <a
              class="block px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              @click="startQuizWithLimit(150)"
            >
              Max 150 pytań
            </a>
            <a
              class="block px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              @click="startQuizWithLimit(0)"
            >
              Cała pula
            </a>
          </div>
        </div>
      </div>
      <div class="flex gap-1">
        <BaseButton
          color="purple"
          size="sm"
          class="flex-1 text-xs"
          :disabled="isDisabled"
          @click="$emit('start-exam', category)"
        >
          <span class="truncate">Egzamin</span>
        </BaseButton>
        <BaseButton color="red" size="sm" class="px-2" @click="$emit('clear-history', category)">
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
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import BaseButton from '@/components/base/BaseButton.vue';

// Zainicjuj store na początku
const store = useStore();

const props = defineProps({
  category: { type: String, required: true },
  showQuizOptions: { type: Boolean, default: false },
});

const emit = defineEmits([
  'toggle-quiz-options',
  'start-quiz',
  'start-exam',
  'go-to-questions',
  'clear-history',
]);

// Wszystkie funkcje pomocnicze bezpośrednio w komponencie
const categoryStats = (cat) => {
  const hquestion = store.getters['user/getHquestion'] || [];
  const all = hquestion.filter((q) => q.category === cat);
  const correct = all.filter((q) => q.correct === true).length;
  const wrong = all.filter((q) => q.correct === false).length;
  const categoryCounts = store.getters['questions/getCategoryCounts'] || {};
  const total = categoryCounts[cat] || 0;
  const notDone = total - all.length;
  return { correct, wrong, notDone: Math.max(0, notDone) };
};

const categoryPercentage = (cat) => {
  const stats = categoryStats(cat);
  const categoryCounts = store.getters['questions/getCategoryCounts'] || {};
  const total = categoryCounts[cat] || 0;
  if (total === 0) return { correct: 0, wrong: 0 };
  return {
    correct: (stats.correct / total) * 100,
    wrong: (stats.wrong / total) * 100,
  };
};

const categoryPercentComplete = (cat) => {
  const stats = categoryStats(cat);
  const categoryCounts = store.getters['questions/getCategoryCounts'] || {};
  const total = categoryCounts[cat] || 0;
  if (total === 0) return 0;
  return Math.round(((stats.correct + stats.wrong) / total) * 100);
};

const getCategoryStatus = (cat) => {
  const stats = categoryStats(cat);
  const categoryCounts = store.getters['questions/getCategoryCounts'] || {};
  const total = categoryCounts[cat] || 0;
  if (total === 0) return '';
  const percentDone = ((stats.correct + stats.wrong) / total) * 100;
  if (percentDone === 0) return 'Nowa';
  if (percentDone === 100) {
    const percentCorrect = (stats.correct / total) * 100;
    if (percentCorrect === 100) return 'Opanowana';
    if (percentCorrect >= 80) return 'Bardzo dobra';
    if (percentCorrect >= 60) return 'Dobra';
    if (percentCorrect >= 40) return 'Średnia';
    return 'Do poprawy';
  }
  if (percentDone >= 75) return 'W trakcie';
  if (percentDone >= 50) return 'Połowa';
  if (percentDone >= 25) return 'Rozpoczęta';
  return 'Nowa';
};

const getCategoryStatusClass = (cat) => {
  const status = getCategoryStatus(cat);
  const classes = {
    Opanowana: 'bg-green-200 text-green-900 dark:bg-green-700 dark:text-green-100',
    'Bardzo dobra': 'bg-blue-300 text-blue-900 dark:bg-blue-700 dark:text-blue-100',
    Dobra: 'bg-blue-100 text-blue-500 dark:bg-blue-500 dark:text-blue-100',
    Średnia: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100',
    'Do poprawy': 'bg-red-200 text-red-900 dark:bg-red-700 dark:text-red-100',
    'W trakcie': 'bg-blue-100 text-blue-300 dark:bg-blue-300 dark:text-blue-100',
    Połowa: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-700 dark:text-indigo-100',
    Rozpoczęta: 'bg-purple-200 text-purple-900 dark:bg-purple-700 dark:text-purple-100',
    Nowa: 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
  };
  return classes[status] || 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-100';
};

const getCategoryCardClass = (cat) => {
  const stats = categoryStats(cat);
  const categoryCounts = store.getters['questions/getCategoryCounts'] || {};
  const total = categoryCounts[cat] || 0;
  if (total === 0) return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  const percentDone = ((stats.correct + stats.wrong) / total) * 100;
  const percentCorrect =
    stats.correct > 0 ? (stats.correct / (stats.correct + stats.wrong)) * 100 : 0;

  if (percentDone === 0) return 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600';
  if (stats.correct === total)
    return 'bg-green-200 border-green-500 shadow-lg text-green-900 dark:bg-green-800 dark:border-green-600 dark:text-green-100';
  if (stats.wrong === total)
    return 'bg-red-200 border-red-500 shadow-lg text-red-900 dark:bg-red-800 dark:border-red-600 dark:text-red-100';
  if (percentDone > 50 && percentCorrect > 70)
    return 'bg-green-100 border-green-400 shadow-md text-green-800 dark:bg-green-900 dark:border-green-500 dark:text-green-200';
  if (percentDone > 50 && percentCorrect >= 40)
    return 'bg-yellow-100 border-yellow-400 shadow-md text-yellow-800 dark:bg-yellow-900 dark:border-yellow-500 dark:text-yellow-200';
  if (percentDone > 50)
    return 'bg-red-100 border-red-400 shadow-md text-red-800 dark:bg-red-900 dark:border-red-500 dark:text-red-200';
  if (percentCorrect > 70)
    return 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900 dark:border-emerald-500 dark:text-emerald-200';
  if (percentCorrect >= 40)
    return 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900 dark:border-amber-500 dark:text-amber-200';

  return 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900 dark:border-orange-500 dark:text-orange-200';
};

const stats = computed(() => categoryStats(props.category));
const percentage = computed(() => categoryPercentage(props.category));
const percentComplete = computed(() => categoryPercentComplete(props.category));
const total = computed(() => stats.value.correct + stats.value.wrong + stats.value.notDone);
const isDisabled = computed(() => stats.value.notDone === 0 && stats.value.wrong === 0);
const categoryStatus = computed(() => getCategoryStatus(props.category));
const statusClass = computed(() => getCategoryStatusClass(props.category));
const cardClass = computed(() => getCategoryCardClass(props.category));

const percentCompleteClass = computed(() => {
  const percent = percentComplete.value;
  if (percent > 75) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (percent > 25) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
});

const startQuizWithLimit = (limit) => {
  emit('toggle-quiz-options');
  emit('start-quiz', props.category, limit);
};
</script>
