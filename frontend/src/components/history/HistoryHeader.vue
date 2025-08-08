<template>
  <div class="flex flex-col sm:flex-row justify-between items-center mb-8">
    <div>
      <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-200">Historia nauki</h1>
      <p class="text-gray-500 mt-1 dark:text-gray-400">
        Przeglądaj swoje wcześniejsze quizy i egzaminy
      </p>
    </div>
    <BaseButton
      v-if="hasHistory && !detailsMode"
      color="red"
      class="mt-4 sm:mt-0 rounded-full px-6"
      @click="$emit('clear-history')"
    >
      <span class="flex items-center">
        <img src="@/assets/icons/trash.svg" alt="Usuń" class="h-5 w-5 mr-2" />
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
