<!-- filepath: d:\git nowe\app-quize\frontend\src\components\dashboard\QuizButtons.vue -->
<template>
  <section class="mb-3">
    <div class="flex flex-col sm:flex-row gap-4">
      <BaseButton
        color="purple"
        class="flex-1 py-4 rounded-xl shadow-md hover:shadow-lg transition-all text-center font-semibold"
        @click="$emit('show-exam-popup')"
      >
        <div class="flex items-center justify-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Rozpocznij egzamin z ubiegłych lat</span>
        </div>
      </BaseButton>
      <BaseButton
        color="blue"
        class="flex-1 py-4 rounded-xl shadow-md hover:shadow-lg transition-all text-center font-semibold"
        @click="$emit('show-other-quiz-popup')"
      >
        <div class="flex items-center justify-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Rozpocznij quiz z pozostałych kategorii</span>
        </div>
      </BaseButton>
    </div>
  </section>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue';

defineEmits(['show-exam-popup', 'show-other-quiz-popup']);
</script>
