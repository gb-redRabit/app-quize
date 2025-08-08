<!-- filepath: d:\git nowe\app-quize\frontend\src\components\quiz\ExamCategoriesModal.vue -->
<template>
  <BaseModal :show="show" @close="$emit('close')">
    <template #header>
      <h2 class="text-xl font-semibold">Wybierz egzamin</h2>
    </template>
    <div class="max-h-[70vh] overflow-y-auto p-4">
      <div v-if="!categories || categories.length === 0" class="text-center text-gray-500 py-4">
        Brak dostępnych egzaminów
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="category in categories"
          :key="category"
          class="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all p-4"
        >
          <!-- Nazwa kategorii i pasek postępu -->
          <div class="mb-3">
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-medium text-gray-800 dark:text-gray-200">{{ category }}</h3>
              <div class="flex items-center text-xs">
                <span
                  v-if="categoryStats[category]"
                  class="text-green-600 dark:text-green-400 font-medium"
                >
                  {{ categoryStats[category].correct || 0 }}
                </span>
                <span v-if="categoryStats[category]" class="mx-1 text-gray-500 dark:text-gray-400"
                  >/</span
                >
                <span
                  v-if="categoryStats[category]"
                  class="text-red-600 dark:text-red-400 font-medium"
                >
                  {{ categoryStats[category].wrong || 0 }}
                </span>
              </div>
            </div>

            <!-- Pasek postępu -->
            <div
              v-if="categoryStats[category]"
              class="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
            >
              <div class="flex h-full">
                <div
                  class="bg-green-500 dark:bg-green-400 h-full"
                  :style="{ width: `${getCorrectPercentage(category)}%` }"
                ></div>
                <div
                  class="bg-red-500 dark:bg-red-400 h-full"
                  :style="{ width: `${getWrongPercentage(category)}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Przycisk egzaminu -->
          <button
            class="w-full py-2 px-4 bg-purple-500 text-white text-sm rounded-md hover:bg-purple-600 transition-colors dark:bg-purple-600 dark:hover:bg-purple-500 flex items-center justify-center gap-2"
            @click="$emit('select-category', category)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
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
            Rozpocznij egzamin
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/components/base/BaseModal.vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  categories: {
    type: Array,
    default: () => [],
  },
  categoryStats: {
    type: Object,
    default: () => ({}),
  },
});

const getCorrectPercentage = (category) => {
  if (!props.categoryStats[category]) return 0;

  const { correct, wrong } = props.categoryStats[category];
  const total = (correct || 0) + (wrong || 0);

  if (total === 0) return 0;
  return (correct / total) * 100;
};

const getWrongPercentage = (category) => {
  if (!props.categoryStats[category]) return 0;

  const { correct, wrong } = props.categoryStats[category];
  const total = (correct || 0) + (wrong || 0);

  if (total === 0) return 0;
  return (wrong / total) * 100;
};

defineEmits(['close', 'select-category']);
</script>
