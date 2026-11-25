<template>
  <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
    <h2 class="text-lg sm:text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
      {{ title }}
    </h2>
    <BaseButton color="gray" size="sm" @click="$emit('close')" class="flex items-center">
      <span class="flex items-center">
        <img src="@/assets/icons/arrow-left.svg" alt="" class="h-4 w-4 mr-2" aria-hidden="true" />
        Wróć do listy
      </span>
    </BaseButton>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
});

defineEmits(['close']);
</script>
