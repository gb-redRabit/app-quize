<template>
  <BaseModal :show="show" @close="$emit('close')" class="rounded-xl">
    <div class="p-6 bg-white dark:bg-gray-800 rounded-xl">
      <div class="flex items-center justify-center mb-4 text-red-600">
        <img src="@/assets/icons/warning.svg" alt="Ostrzeżenie" class="h-12 w-12" />
      </div>
      <h2 class="text-xl font-bold text-center mb-2 text-gray-800 dark:text-gray-200">
        Czy na pewno chcesz usunąć całą historię?
      </h2>
      <p class="text-gray-500 text-center mb-6 dark:text-gray-400">
        Tej operacji nie można cofnąć.
      </p>

      <!-- Przyciski akcji -->
      <div class="flex justify-center gap-4">
        <BaseButton color="gray" class="px-6 py-2 rounded-lg" @click="$emit('close')">
          Anuluj
        </BaseButton>
        <BaseButton color="red" class="px-6 py-2 rounded-lg" @click="$emit('confirm')">
          <span class="flex items-center">
            <img src="@/assets/icons/trash.svg" alt="Usuń" class="h-5 w-5 mr-1" />
            Tak, usuń historię
          </span>
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/components/base/BaseModal.vue';
import BaseButton from '@/components/base/BaseButton.vue';

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['close', 'confirm']);
</script>
