<template>
  <div
    class="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
    :class="{
      'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-800/40':
        isCorrect,
    }"
  >
    <div
      class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium"
      :class="{
        'bg-green-500 dark:bg-green-600 text-white': isCorrect,
      }"
    >
      {{ letter }}
    </div>
    <div class="text-gray-700 dark:text-gray-300">
      {{ answer?.answer }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  letter: {
    type: String,
    required: true,
  },
  answer: {
    type: Object,
    default: null,
  },
});

const isCorrect = computed(() => {
  return props.answer && (props.answer.isCorret || props.answer.isCorrect);
});
</script>
