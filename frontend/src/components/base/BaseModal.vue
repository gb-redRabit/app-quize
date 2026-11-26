<template>
  <Transition name="modal-fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-gray-950/60 backdrop-blur-sm transition-opacity flex items-center justify-center z-50 p-4 sm:p-6"
      role="presentation"
      @click.self="$emit('close')"
    >
      <div
        ref="dialogRef"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="$slots.header ? 'modal-title' : undefined"
        tabindex="-1"
        class="surface relative shadow-2xl transform transition-all sm:my-8 w-full flex flex-col outline-hidden"
        style="max-height: 90vh; max-width: 64rem"
      >
        <div
          class="flex justify-between items-center px-5 py-4 border-b border-gray-200 dark:border-gray-800"
        >
          <h3
            v-if="$slots.header"
            class="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-50"
            id="modal-title"
          >
            <slot name="header"></slot>
          </h3>
          <div v-else></div>
          <button
            @click="$emit('close')"
            class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
            aria-label="Zamknij"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div class="p-5 overflow-y-auto">
          <div class="sm:flex sm:items-start">
            <div
              v-if="$slots.icon"
              class="mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
            >
              <slot name="icon"></slot>
            </div>
            <div class="mt-3 sm:mt-0 sm:ml-4 text-left w-full">
              <slot></slot>
            </div>
          </div>
        </div>

        <div
          v-if="$slots.footer"
          class="bg-gray-50 dark:bg-gray-800/60 px-5 py-3 sm:flex sm:flex-row-reverse gap-3 rounded-b-2xl border-t border-gray-200 dark:border-gray-800"
        >
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount, onMounted } from 'vue';

// Definicja props
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});

// Definicja emitów
const emit = defineEmits(['close']);

const dialogRef = ref(null);
let previousOverflow = '';
let previouslyFocused = null;
let lastClickedElement = null;

// Na części systemów kliknięcie przycisku nie ustawia fokusu (aktywny jest body).
// Zapamiętujemy element kliknięty tuż przed otwarciem, żeby poprawnie przywrócić fokus.
function rememberClickTarget(event) {
  const target = event.target?.closest?.(FOCUSABLE_SELECTOR);
  if (target && target !== document.body) lastClickedElement = target;
}

onMounted(() => {
  if (typeof document !== 'undefined') {
    document.addEventListener('click', rememberClickTarget, true);
  }
});

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusable() {
  if (!dialogRef.value) return [];
  return Array.from(dialogRef.value.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement
  );
}

function handleDocumentKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault();
    emit('close');
    return;
  }

  if (event.key !== 'Tab') return;

  const focusable = getFocusable();
  if (focusable.length === 0) {
    event.preventDefault();
    dialogRef.value?.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;

  if (event.shiftKey) {
    if (active === first || !dialogRef.value?.contains(active)) {
      event.preventDefault();
      last.focus();
    }
  } else if (active === last || !dialogRef.value?.contains(active)) {
    event.preventDefault();
    first.focus();
  }
}

watch(
  () => props.show,
  async (visible) => {
    if (typeof document === 'undefined') return;
    if (visible) {
      const active = document.activeElement;
      previouslyFocused =
        active && active !== document.body ? active : lastClickedElement;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleDocumentKeydown);
      await nextTick();
      const focusable = getFocusable();
      (focusable[0] || dialogRef.value)?.focus();
    } else {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleDocumentKeydown);
      if (
        previouslyFocused &&
        previouslyFocused.isConnected !== false &&
        typeof previouslyFocused.focus === 'function'
      ) {
        previouslyFocused.focus();
      }
      previouslyFocused = null;
    }
  }
);

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = previousOverflow;
    document.removeEventListener('keydown', handleDocumentKeydown);
    document.removeEventListener('click', rememberClickTarget, true);
  }
});
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
