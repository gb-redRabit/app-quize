<template>
  <div class="surface mb-4 p-3">
    <div class="flex flex-wrap gap-3 justify-between items-center">
      <div class="stats-summary flex items-center gap-2">
        <div class="rounded-xl bg-blue-50 dark:bg-blue-900/30 px-3 py-2 text-center min-w-[4.5rem]">
          <div class="text-lg font-semibold text-blue-700 dark:text-blue-200">{{ historyCount }}</div>
          <div class="text-[11px] text-blue-700/70 dark:text-blue-300">Łącznie</div>
        </div>
        <div class="rounded-xl bg-purple-50 dark:bg-purple-900/30 px-3 py-2 text-center min-w-[4.5rem]">
          <div class="text-lg font-semibold text-purple-700 dark:text-purple-200">{{ examCount }}</div>
          <div class="text-[11px] text-purple-700/70 dark:text-purple-300">Egzaminy</div>
        </div>
        <div class="rounded-xl bg-green-50 dark:bg-green-900/30 px-3 py-2 text-center min-w-[4.5rem]">
          <div class="text-lg font-semibold text-green-700 dark:text-green-200">{{ quizCount }}</div>
          <div class="text-[11px] text-green-700/70 dark:text-green-300">Quizy</div>
        </div>
      </div>

      <div class="flex items-center gap-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
        <button
          @click="$emit('filter-change', 'all')"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          :class="
            activeFilter === 'all'
              ? 'bg-white text-gray-900 shadow-xs dark:bg-gray-700 dark:text-gray-100'
              : 'text-gray-500 dark:text-gray-400'
          "
        >
          Wszystkie
        </button>
        <button
          @click="$emit('filter-change', 'quiz')"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          :class="
            activeFilter === 'quiz'
              ? 'bg-white text-blue-700 shadow-xs dark:bg-gray-700 dark:text-blue-300'
              : 'text-gray-500 dark:text-gray-400'
          "
        >
          Quizy
        </button>
        <button
          @click="$emit('filter-change', 'exam')"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          :class="
            activeFilter === 'exam'
              ? 'bg-white text-purple-700 shadow-xs dark:bg-gray-700 dark:text-purple-300'
              : 'text-gray-500 dark:text-gray-400'
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
