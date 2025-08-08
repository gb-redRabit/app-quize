<!-- filepath: d:\git nowe\app-quize\frontend\src\components\quiz\OtherQuizCategoriesModal.vue -->
<template>
  <BaseModal :show="show" @close="$emit('close')">
    <template #header>
      <h2 class="text-xl font-semibold">Wybierz kategorię quizu</h2>
    </template>
    <div class="max-h-[70vh] overflow-y-auto p-4">
      <div v-if="!categories || categories.length === 0" class="text-center text-gray-500 py-4">
        Brak dostępnych kategorii
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

          <!-- Przyciski -->
          <div class="flex gap-2 mt-2">
            <button
              class="flex-1 py-2 px-3 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors dark:bg-blue-600 dark:hover:bg-blue-500"
              @click="$emit('start-quiz', category, 50)"
            >
              Quiz 50 pytań
            </button>
            <button
              class="flex-1 py-2 px-3 bg-indigo-500 text-white text-sm rounded-md hover:bg-indigo-600 transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-500"
              @click="$emit('start-quiz', category, 0)"
            >
              Cała pula pozostałych pytań
            </button>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/components/base/BaseModal.vue';
import { computed } from 'vue';

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

defineEmits(['close', 'start-quiz']);
</script>
