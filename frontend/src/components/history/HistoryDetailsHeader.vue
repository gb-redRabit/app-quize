<template>
  <div class="flex flex-row items-center justify-between mb-6">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200">{{ title }}</h2>
    <BaseButton color="gray" @click="$emit('close')" class="flex items-center">
      <span class="flex items-center">
        <img src="@/assets/icons/arrow-left.svg" alt="Wróć" class="h-5 w-5 mr-2" />
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
