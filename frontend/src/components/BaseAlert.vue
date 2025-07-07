<template>
  <!-- Alert -->
  <transition name="alert-fade">
    <div
      v-if="visible"
      class="fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md alert"
      :class="alertTypeClass"
    >
      <div class="flex items-center">
        <!-- Ikona alertu -->
        <div class="flex-shrink-0 mr-3">
          <!-- Ikona sukcesu -->
          <svg
            v-if="type === 'success'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>

          <!-- Ikona błędu -->
          <svg
            v-else-if="type === 'error'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>

          <!-- Ikona ostrzeżenia -->
          <svg
            v-else-if="type === 'warning'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>

          <!-- Ikona informacji -->
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            />
          </svg>
        </div>

        <!-- Treść alertu -->
        <div class="flex-grow">
          <p class="text-sm">{{ message }}</p>
        </div>

        <!-- Przycisk zamknięcia -->
        <button @click="hide" class="ml-3 flex-shrink-0">
          <svg
            class="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Pasek postępu -->
      <div
        v-if="duration > 0"
        class="absolute bottom-0 left-0 h-1 bg-white bg-opacity-30"
        :style="{ width: `${progressWidth}%` }"
      ></div>
    </div>
  </transition>

  <!-- Okno potwierdzenia -->
  <transition name="modal-fade">
    <div v-if="isConfirmVisible" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black bg-opacity-50" @click="cancelConfirm"></div>
      <div class="relative z-10 bg-card-bg rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-medium mb-4 text-gray-800">{{ confirmMessage }}</h3>
        <div class="flex justify-end space-x-3">
          <button @click="cancelConfirm" class="px-4 py-2 rounded-md bg-gray-200 text-gray-800">
            Anuluj
          </button>
          <button @click="confirmAction" class="px-4 py-2 rounded-md bg-blue-600 text-white">
            Potwierdź
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'BaseAlert',
  // Dodajemy jawną deklarację emitowanych zdarzeń
  emits: ['close'],

  data() {
    return {
      visible: false,
      type: 'info',
      message: '',
      duration: 5000,
      progressWidth: 100,
      timeoutId: null,
      intervalId: null,

      // Dane dla okna potwierdzenia
      isConfirmVisible: false,
      confirmMessage: '',
      onConfirm: null,
      onCancel: null,
    };
  },

  computed: {
    alertTypeClass() {
      switch (this.type) {
        case 'success':
          return 'bg-green-50 text-green-800 border border-green-200';
        case 'error':
          return 'bg-red-50 text-red-800 border border-red-200';
        case 'warning':
          return 'bg-yellow-50 text-yellow-800 border border-yellow-200';
        default:
          return 'bg-blue-50 text-blue-800 border border-blue-200';
      }
    },
  },

  methods: {
    show(type = 'info', message, duration = 5000) {
      // Wyczyść poprzednie timery
      this.clearTimers();

      this.type = type;
      this.message = message;
      this.duration = duration;
      this.progressWidth = 100;
      this.visible = true;

      // Ustaw timer do ukrycia alertu
      if (this.duration > 0) {
        // Timer do ukrycia alertu
        this.timeoutId = setTimeout(() => {
          this.hide();
        }, this.duration);

        // Aktualizacja paska postępu
        const updateInterval = 30; // ms
        const totalSteps = this.duration / updateInterval;
        const step = 100 / totalSteps;

        this.intervalId = setInterval(() => {
          this.progressWidth -= step;
          if (this.progressWidth <= 0) {
            this.clearTimers();
          }
        }, updateInterval);
      }
    },

    hide() {
      this.visible = false;
      this.clearTimers();
    },

    clearTimers() {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }

      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    },

    // Metody dla okna potwierdzenia
    showConfirm(message, confirmCallback, cancelCallback) {
      this.confirmMessage = message;
      this.onConfirm = confirmCallback;
      this.onCancel = cancelCallback;
      this.isConfirmVisible = true;
    },

    confirmAction() {
      this.isConfirmVisible = false;
      if (typeof this.onConfirm === 'function') {
        this.onConfirm();
      }
    },

    cancelConfirm() {
      this.isConfirmVisible = false;
      if (typeof this.onCancel === 'function') {
        this.onCancel();
      }
    },
  },

  beforeUnmount() {
    this.clearTimers();
  },
};
</script>

<style scoped>
.alert-fade-enter-active,
.alert-fade-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
