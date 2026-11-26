<!-- filepath: d:\git nowe\app-quize\frontend\src\components\dashboard\CategoryCard.vue -->
<template>
  <div
    :data-category="category"
    class="categories-container surface p-4 transition-all duration-200 hover:shadow-sm flex flex-col h-full"
    :class="cardClass"
  >
    <div class="flex flex-wrap justify-between items-start gap-2 mb-3">
      <h3
        class="text-sm font-semibold text-gray-900 dark:text-gray-100 break-words flex-1 min-w-0"
        :title="category"
      >
        {{ category }}
      </h3>
      <div class="flex items-center gap-1.5 shrink-0">
        <span
          class="indicator_A text-[11px] font-semibold px-2 py-0.5 rounded-full"
          :class="percentCompleteClass"
        >
          {{ percentComplete }}%
        </span>
        <span
          v-if="categoryStatus"
          class="indicator_B text-[11px] font-semibold px-2 py-0.5 rounded-full"
          :class="statusClass"
        >
          {{ categoryStatus }}
        </span>
      </div>
    </div>
    <!-- Pasek postępu -->
    <div class="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 flex overflow-hidden mb-3">
      <div class="bg-green-500 h-full" :style="{ width: `${percentage.correct}%` }"></div>
      <div class="bg-red-500 h-full" :style="{ width: `${percentage.wrong}%` }"></div>
      <div class="bg-gray-300 dark:bg-gray-700 h-full" :style="{ width: `${percentage.notDone}%` }"></div>
    </div>
    <div class="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-3">
      <div class="flex gap-2.5">
        <span class="flex items-center"
          ><span class="w-1.5 h-1.5 inline-block bg-green-500 rounded-full mr-1"></span>
          {{ stats.correct }}</span
        >
        <span class="flex items-center"
          ><span class="w-1.5 h-1.5 inline-block bg-red-500 rounded-full mr-1"></span>
          {{ stats.wrong }}</span
        >
        <span class="flex items-center"
          ><span class="w-1.5 h-1.5 inline-block bg-gray-400 rounded-full mr-1"></span>
          {{ stats.notDone }}</span
        >
      </div>
      <span class="font-medium">Łącznie: {{ total }}</span>
    </div>
    <div class="category-card grid grid-cols-3 gap-1.5 mt-auto">
      <BaseButton
        color="gray"
        variant="outline"
        size="xs"
        class="text-xs"
        @click="$emit('go-to-questions', category)"
      >
        <span class="truncate">Pytania</span>
      </BaseButton>
      <div class="relative">
        <BaseButton
          ref="quizToggleRef"
          color="blue"
          size="xs"
          class="w-full text-xs"
          :disabled="isDisabled"
          aria-haspopup="menu"
          :aria-expanded="showQuizOptions ? 'true' : 'false'"
          :aria-controls="menuId"
          @click="$emit('toggle-quiz-options')"
          @keydown.down.prevent="openMenuAndFocusFirst"
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
        <div
          v-if="showQuizOptions"
          :id="menuId"
          role="menu"
          :aria-label="`Opcje quizu: ${category}`"
          class="absolute z-10 w-full mt-1"
          @keydown.esc.stop.prevent="closeMenuAndFocus"
          @keydown.down.prevent="focusMenuItem(1)"
          @keydown.up.prevent="focusMenuItem(-1)"
        >
          <div
            class="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg py-1"
          >
            <button
              v-for="option in quizOptions"
              :key="option.value"
              type="button"
              role="menuitem"
              class="block w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-hidden"
              @click="startQuizWithLimit(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>
      <div class="flex gap-1">
        <BaseButton
          color="purple"
          variant="outline"
          size="xs"
          class="flex-1 text-xs"
          :disabled="isDisabled"
          @click="$emit('start-exam', category)"
        >
          <span class="truncate">Egzamin</span>
        </BaseButton>
        <BaseButton
          color="red"
          variant="ghost"
          size="xs"
          class="px-2"
          ariaLabel="Wyczyść historię kategorii"
          title="Wyczyść historię kategorii"
          @click="$emit('clear-history', category)"
        >
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
import { computed, ref, defineProps, defineEmits } from 'vue';
import BaseButton from '@/components/base/BaseButton.vue';

const props = defineProps({
  category: { type: String, required: true },
  stats: {
    type: Object,
    required: true,
    default: () => ({ correct: 0, wrong: 0, notDone: 0 }),
  },
  showQuizOptions: { type: Boolean, default: false },
});

const emit = defineEmits([
  'toggle-quiz-options',
  'start-quiz',
  'start-exam',
  'go-to-questions',
  'clear-history',
]);

// --- Menu opcji quizu (dostępne z klawiatury) ---
const quizOptions = [
  { value: 50, label: 'Max 50 pytań' },
  { value: 150, label: 'Max 150 pytań' },
  { value: 0, label: 'Cała pula' },
];

const menuId = computed(
  () => `quiz-menu-${String(props.category).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
);

const quizToggleRef = ref(null);

function focusMenuItem(delta) {
  const menu = document.getElementById(menuId.value);
  if (!menu) return;
  const items = [...menu.querySelectorAll('[role="menuitem"]')];
  if (!items.length) return;
  const current = items.indexOf(document.activeElement);
  const next = current === -1 ? 0 : (current + delta + items.length) % items.length;
  items[next].focus();
}

function openMenuAndFocusFirst() {
  if (!props.showQuizOptions) emit('toggle-quiz-options');
  setTimeout(() => focusMenuItem(1), 0);
}

function closeMenuAndFocus() {
  emit('toggle-quiz-options');
  const el = quizToggleRef.value?.$el;
  if (el && typeof el.focus === 'function') el.focus();
}

// --- Obliczone właściwości dla statystyk ---

const total = computed(() => {
  if (!props.stats) return 0;
  return props.stats.correct + props.stats.wrong + props.stats.notDone;
});

const doneCount = computed(() => {
  if (!props.stats) return 0;
  return props.stats.correct + props.stats.wrong;
});

const percentComplete = computed(() => {
  if (total.value === 0) return 0;
  return Math.round((doneCount.value / total.value) * 100);
});

const percentage = computed(() => {
  // Pasek postępu pokazuje proporcje wszystkich 3 statusów WZGLĘDEM całej puli pytań.
  if (total.value === 0) {
    return { correct: 0, wrong: 0, notDone: 100 };
  }
  return {
    correct: (props.stats.correct / total.value) * 100,
    wrong: (props.stats.wrong / total.value) * 100,
    notDone: (props.stats.notDone / total.value) * 100,
  };
});

const isDisabled = computed(() => {
  if (!props.stats) return true;
  return props.stats.notDone === 0 && props.stats.wrong === 0;
});

// --- PRZYWRÓCONA, PEŁNA LOGIKA STATUSU I KLAS CSS ---

const categoryStatus = computed(() => {
  if (!props.stats || total.value === 0) return 'Nowa';
  if (doneCount.value === 0) return 'Nowa';
  const accuracy = (props.stats.correct / doneCount.value) * 100;
  if (doneCount.value === total.value && accuracy >= 80) return 'Opanowana';
  return 'W trakcie';
});

const statusClass = computed(() => {
  const classes = {
    Opanowana: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'W trakcie': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    Nowa: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };
  return classes[categoryStatus.value] || classes['Nowa'];
});

// Kolor karty ograniczamy do delikatnego obramowania — tło zostaje neutralne.
const cardClass = computed(() => {
  if (categoryStatus.value === 'Opanowana') return 'border-green-300 dark:border-green-700';
  if (categoryStatus.value === 'W trakcie') return 'border-amber-300 dark:border-amber-700';
  return 'border-gray-200 dark:border-gray-700';
});

const percentCompleteClass = computed(() => {
  const percent = percentComplete.value;
  if (percent > 75) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (percent > 25) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
});

// --- Funkcje pomocnicze ---

const startQuizWithLimit = (limit) => {
  emit('toggle-quiz-options');
  emit('start-quiz', props.category, limit);
};
</script>

<style scoped>
/* Styl animacji pozostaje bez zmian */
@keyframes refresh {
  0% {
    opacity: 0.5;
    transform: scale(0.98);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.01);
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: none;
  }
}

.refreshing {
  animation: refresh 0.8s ease-out forwards;
}
</style>
