<!-- filepath: d:\git nowe\app-quize\frontend\src\components\dashboard\StatisticCard.vue -->
<template>
  <div
    class="p-4 rounded-xl shadow-sm border flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow"
    :class="colorClasses"
  >
    <span class="text-2xl font-bold mb-1">{{ value }}</span>
    <span class="text-xs font-medium">{{ label }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  value: {
    type: [Number, String],
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'green', 'red', 'indigo', 'purple', 'yellow'].includes(value),
  },
});

const colorClasses = computed(() => {
  const colorMap = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200',
    green:
      'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200',
    red: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-200',
    indigo:
      'bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:border-indigo-700 dark:text-indigo-200',
    purple:
      'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900 dark:border-purple-700 dark:text-purple-200',
    yellow:
      'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200',
  };

  return colorMap[props.color] || colorMap.blue;
});
</script>
