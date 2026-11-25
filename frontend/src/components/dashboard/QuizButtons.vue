<template>
  <section class="mb-5">
    <div class="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        class="surface p-4 flex items-center gap-3 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/40 dark:hover:border-blue-700 dark:hover:bg-blue-900/10"
        @click="$emit('show-exam-popup')"
      >
        <span
          class="h-11 w-11 shrink-0 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 grid place-items-center"
          aria-hidden="true"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </span>
        <span class="flex-1 min-w-0">
          <span class="block text-sm font-semibold text-gray-900 dark:text-gray-100">
            Egzamin z ubiegłych lat
          </span>
          <span class="block text-xs text-gray-500 dark:text-gray-400">
            Pełny zestaw pytań egzaminacyjnych
          </span>
        </span>
        <svg
          class="h-5 w-5 shrink-0 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <button
        type="button"
        class="surface p-4 flex items-center gap-3 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/40 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/10"
        @click="$emit('show-other-quiz-popup')"
      >
        <span
          class="h-11 w-11 shrink-0 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300 grid place-items-center"
          aria-hidden="true"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </span>
        <span class="flex-1 min-w-0">
          <span class="block text-sm font-semibold text-gray-900 dark:text-gray-100">
            Quiz z pozostałych kategorii
          </span>
          <span class="block text-xs text-gray-500 dark:text-gray-400">
            Wybierz zakres i sprawdź swoją wiedzę
          </span>
        </span>
        <svg
          class="h-5 w-5 shrink-0 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </section>
</template>

<script setup>
defineEmits(['show-exam-popup', 'show-other-quiz-popup']);
</script>
