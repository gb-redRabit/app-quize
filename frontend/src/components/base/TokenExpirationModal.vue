<!-- filepath: d:\git nowe\app-quize\frontend\src\components\base\TokenExpirationModal.vue -->
<template>
  <Transition name="modal-fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ options.title || 'Uwaga' }}
          </h3>
          <button
            @click="handleAction(options.actions?.[1])"
            class="text-gray-400 hover:text-gray-500"
          >
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div class="mb-5 text-gray-700 dark:text-gray-300">
          {{ options.message || '' }}
        </div>

        <div class="flex justify-end space-x-3">
          <button
            v-for="(action, index) in options.actions || []"
            :key="index"
            @click="handleAction(action)"
            class="px-4 py-2 rounded-md text-sm font-medium"
            :class="getButtonClass(action.variant)"
          >
            {{ action.text }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  options: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['close']);

function handleAction(action) {
  if (action && typeof action.handler === 'function') {
    action.handler();
  }
  emit('close');
}

function getButtonClass(variant) {
  const classes = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  };
  return classes[variant] || classes.secondary;
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
