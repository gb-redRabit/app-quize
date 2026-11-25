<!-- filepath: d:\git nowe\app-quize\frontend\src\components\dashboard\StatisticCard.vue -->
<template>
  <div class="surface p-4 flex items-center gap-3">
    <span
      class="h-10 w-10 shrink-0 rounded-xl grid place-items-center text-sm font-bold"
      :class="accentClasses"
      aria-hidden="true"
    >
      <span class="h-2.5 w-2.5 rounded-full bg-current"></span>
    </span>
    <div class="min-w-0">
      <p class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ label }}</p>
      <p class="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
        {{ value }}
      </p>
    </div>
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

const accentClasses = computed(() => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-300',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300',
    yellow: 'bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300',
  };

  return colorMap[props.color] || colorMap.blue;
});
</script>
