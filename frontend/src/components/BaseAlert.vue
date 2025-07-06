<template>
  <transition name="alert-transition">
    <div
      v-if="showInternal"
      :class="['alert-container', type === 'error' ? 'alert-error' : 'alert-success', customClass]"
      role="alert"
    >
      <!-- Ikona alertu -->
      <div class="alert-icon">
        <svg
          v-if="type === 'error'"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
            clip-rule="evenodd"
          />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <!-- Licznik w okręgu -->
      <div class="alert-timer">
        <svg class="alert-timer-svg" viewBox="0 0 36 36">
          <circle class="alert-timer-bg" cx="18" cy="18" r="16" />
          <circle
            class="alert-timer-progress"
            :class="type === 'error' ? 'alert-timer-error' : 'alert-timer-success'"
            cx="18"
            cy="18"
            r="16"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="progressOffset"
          />
        </svg>
        <span class="alert-timer-text">{{ secondsLeft }}</span>
      </div>

      <!-- Treść alertu -->
      <div class="alert-content">
        <slot>
          <span>{{ message }}</span>
        </slot>
      </div>

      <!-- Przycisk zamknięcia -->
      <button class="alert-close-button" @click="close" aria-label="Zamknij" type="button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'BaseAlert',
  props: {
    show: Boolean,
    message: String,
    type: { type: String, default: 'error' }, // error, success
    timeout: { type: Number, default: 5000 }, // ms
    customClass: { type: [String, Array, Object], default: '' },
  },
  data() {
    return {
      showInternal: this.show,
      timer: null,
      secondsLeft: Math.ceil(this.timeout / 1000),
      interval: null,
      circumference: 2 * Math.PI * 16,
    };
  },
  computed: {
    progressOffset() {
      return this.circumference * (1 - this.secondsLeft / Math.ceil(this.timeout / 1000));
    },
  },
  watch: {
    show(val) {
      this.showInternal = val;
      if (val) this.startTimer();
    },
    timeout() {
      if (this.showInternal) this.startTimer();
    },
  },
  mounted() {
    if (this.showInternal) this.startTimer();
  },
  beforeUnmount() {
    clearTimeout(this.timer);
    clearInterval(this.interval);
  },
  methods: {
    startTimer() {
      clearTimeout(this.timer);
      clearInterval(this.interval);
      this.secondsLeft = Math.ceil(this.timeout / 1000);

      this.interval = setInterval(() => {
        if (this.secondsLeft > 0) {
          this.secondsLeft--;
        }
      }, 1000);

      this.timer = setTimeout(() => {
        this.close();
      }, this.timeout);
    },
    close() {
      this.showInternal = false;
      clearInterval(this.interval);
      clearTimeout(this.timer);
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
.alert-container {
  @apply flex items-center gap-3 px-4 py-3 mb-4 rounded-xl shadow-lg;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.95));
  backdrop-filter: blur(8px);
  border-left: 4px solid;
  animation: slide-in 0.3s ease forwards;
}

.alert-error {
  border-color: #ef4444;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.15);
}

.alert-success {
  border-color: #10b981;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.15);
}

.alert-icon {
  @apply flex-shrink-0;
  width: 24px;
  height: 24px;
}

.alert-error .alert-icon {
  @apply text-red-500;
}

.alert-success .alert-icon {
  @apply text-green-500;
}

.alert-timer {
  @apply relative flex-shrink-0;
  width: 36px;
  height: 36px;
}

.alert-timer-svg {
  @apply w-full h-full -rotate-90;
}

.alert-timer-bg {
  fill: none;
  stroke: #e5e7eb;
  stroke-width: 3;
}

.alert-timer-progress {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.2s linear;
}

.alert-timer-error {
  stroke: #f87171;
}

.alert-timer-success {
  stroke: #34d399;
}

.alert-timer-text {
  @apply absolute inset-0 flex items-center justify-center text-xs font-bold;
}

.alert-error .alert-timer-text {
  @apply text-red-600;
}

.alert-success .alert-timer-text {
  @apply text-green-600;
}

.alert-content {
  @apply flex-1 text-gray-700 text-sm;
  font-weight: 500;
}

.alert-close-button {
  @apply flex-shrink-0 ml-auto rounded-full p-1 transition-transform duration-200;
  width: 22px;
  height: 22px;
}

.alert-error .alert-close-button {
  @apply text-red-400 hover:text-red-600;
}

.alert-success .alert-close-button {
  @apply text-green-400 hover:text-green-600;
}

.alert-close-button:hover {
  transform: scale(1.1);
}

.alert-close-button:active {
  transform: scale(0.95);
}

/* Animacje */
.alert-transition-enter-active,
.alert-transition-leave-active {
  transition: all 0.4s cubic-bezier(0.5, 0, 0.3, 1);
  max-height: 200px;
  opacity: 1;
  transform: translateY(0) scale(1);
}

.alert-transition-enter-from,
.alert-transition-leave-to {
  max-height: 0;
  opacity: 0;
  margin-bottom: 0;
  transform: translateY(-10px) scale(0.95);
}

@keyframes slide-in {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsywność */
@media (max-width: 640px) {
  .alert-container {
    @apply px-3 py-2.5;
  }

  .alert-icon {
    width: 20px;
    height: 20px;
  }

  .alert-timer {
    width: 32px;
    height: 32px;
  }
}
</style>
