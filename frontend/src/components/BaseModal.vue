<template>
  <Transition name="modal-fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity flex items-center justify-center z-50 p-4"
      @click.self="$emit('close')"
    >
      <div
        class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all sm:my-8 sm:max-w-5xl w-full flex flex-col"
        style="max-height: 90vh"
      >
        <div
          class="flex justify-between items-center p-4 border-b border-slate-200 dark:border-gray-700"
        >
          <h3
            v-if="$slots.header"
            class="text-xl font-semibold text-slate-800 dark:text-white"
            id="modal-title"
          >
            <slot name="header"></slot>
          </h3>
          <div v-else></div>
          <button
            @click="$emit('close')"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Zamknij"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div class="p-6 overflow-y-auto">
          <div class="sm:flex sm:items-start">
            <div
              v-if="$slots.icon"
              class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
            >
              <slot name="icon"></slot>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <slot></slot>
            </div>
          </div>
        </div>

        <div
          v-if="$slots.footer"
          class="bg-slate-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3 rounded-b-lg border-t border-slate-200 dark:border-gray-600"
        >
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
export default {
  name: 'BaseModal',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],
};
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
