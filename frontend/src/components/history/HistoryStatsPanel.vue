<template>
  <div
    class="mb-8 bg-white rounded-xl shadow-sm p-4 border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
  >
    <div class="flex flex-wrap gap-4 justify-between items-center">
      <!-- Statystyki -->
      <div class="stats-summary">
        <div class="grid grid-cols-3 gap-3 text-center">
          <div class="p-2 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
            <div class="text-2xl font-bold">{{ historyCount }}</div>
            <div class="text-xs">Łącznie</div>
          </div>
          <div
            class="p-2 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-200"
          >
            <div class="text-2xl font-bold">{{ examCount }}</div>
            <div class="text-xs">Egzaminy</div>
          </div>
          <div
            class="p-2 rounded-lg bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200"
          >
            <div class="text-2xl font-bold">{{ quizCount }}</div>
            <div class="text-xs">Quizy</div>
          </div>
        </div>
      </div>

      <!-- Filtry -->
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-sm text-gray-500 dark:text-gray-400">Filtruj:</span>
        <button
          @click="$emit('filter-change', 'all')"
          class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
          :class="
            activeFilter === 'all'
              ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
          "
        >
          Wszystkie
        </button>
        <button
          @click="$emit('filter-change', 'quiz')"
          class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
          :class="
            activeFilter === 'quiz'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
          "
        >
          Quizy
        </button>
        <button
          @click="$emit('filter-change', 'exam')"
          class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
          :class="
            activeFilter === 'exam'
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
          "
        >
          Egzaminy
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  historyCount: {
    type: Number,
    required: true,
  },
  quizCount: {
    type: Number,
    required: true,
  },
  examCount: {
    type: Number,
    required: true,
  },
  activeFilter: {
    type: String,
    required: true,
  },
});

defineEmits(['filter-change']);
</script>
