<!-- filepath: d:\git nowe\app-quize\frontend\src\components\quiz\OtherQuizCategoriesModal.vue -->
<template>
  <BaseModal :show="show" @close="$emit('close')">
    <template #header>
      <h2 class="text-lg font-semibold tracking-tight">Wybierz kategorię quizu</h2>
    </template>
    <div class="max-h-[70vh] overflow-y-auto">
      <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Quiz bez limitu czasu — wybierz 50 pytań albo całą pozostałą pulę.
      </p>
      <div v-if="!categories || categories.length === 0" class="text-center text-gray-500 py-4">
        Brak dostępnych kategorii
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          v-for="category in categories"
          :key="category"
          class="surface-muted p-4 flex flex-col gap-3"
        >
          <div>
            <div class="flex justify-between items-start gap-3">
              <h3 class="font-semibold text-gray-900 dark:text-gray-100">{{ category }}</h3>
              <div
                v-if="categoryStats[category]"
                class="flex items-center gap-1 text-xs font-medium shrink-0"
              >
                <span class="text-green-700 dark:text-green-300">
                  {{ categoryStats[category].correct || 0 }}
                </span>
                <span class="text-gray-400">/</span>
                <span class="text-red-700 dark:text-red-300">
                  {{ categoryStats[category].wrong || 0 }}
                </span>
              </div>
            </div>

            <!-- Pasek postępu -->
            <div
              v-if="categoryStats[category]"
              class="mt-2 w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
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

          <div class="flex gap-2">
            <BaseButton
              color="blue"
              size="sm"
              class="flex-1"
              @click="$emit('start-quiz', category, 50)"
            >
              Quiz 50 pytań
            </BaseButton>
            <BaseButton
              color="blue"
              variant="outline"
              size="sm"
              class="flex-1"
              @click="$emit('start-quiz', category, 0)"
            >
              Cała pula
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/components/base/BaseModal.vue';
import BaseButton from '@/components/base/BaseButton.vue';

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
