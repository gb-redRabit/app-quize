<template>
  <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div class="min-w-0">
      <p class="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
        Postępy
      </p>
      <h1 class="mt-1 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 sm:text-3xl">
        Historia nauki
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Przeglądaj swoje wcześniejsze quizy i egzaminy.
      </p>
    </div>
    <BaseButton
      v-if="hasHistory && !detailsMode"
      color="red"
      variant="outline"
      size="sm"
      class="self-start sm:self-auto"
      @click="$emit('clear-history')"
    >
      <span class="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        Wyczyść historię
      </span>
    </BaseButton>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue';

defineProps({
  hasHistory: {
    type: Boolean,
    default: false,
  },
  detailsMode: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['clear-history']);
</script>
