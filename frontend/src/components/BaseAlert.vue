<template>
  <transition name="fade">
    <div
      v-if="showInternal"
      :class="[
        'rounded px-4 py-3 mb-4 flex items-center gap-4 shadow-lg',
        type === 'error'
          ? 'bg-red-100 text-red-700 border border-red-300'
          : 'bg-green-100 text-green-700 border border-green-300',
        customClass,
      ]"
      role="alert"
    >
      <!-- Licznik w okręgu -->
      <div class="relative flex-shrink-0" style="width: 36px; height: 36px">
        <svg width="36" height="36">
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            :stroke="type === 'error' ? '#f87171' : '#22c55e'"
            stroke-width="4"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="progressOffset"
            style="transition: stroke-dashoffset 0.2s linear"
          />
        </svg>
        <span
          class="absolute inset-0 flex items-center justify-center text-xs font-bold"
          :class="type === 'error' ? 'text-red-600' : 'text-green-600'"
        >
          {{ secondsLeft }}
        </span>
      </div>
      <div class="flex-1">
        <slot>
          <span>{{ message }}</span>
        </slot>
      </div>
      <button
        class="ml-2 text-lg font-bold px-2 hover:text-gray-700"
        @click="close"
        aria-label="Zamknij"
        type="button"
      >
        ×
      </button>
    </div>
  </transition>
</template>

<script>
export default {
  name: "BaseAlert",
  props: {
    show: Boolean,
    message: String,
    type: { type: String, default: "error" }, // error, success
    timeout: { type: Number, default: 5000 }, // ms
    customClass: { type: [String, Array, Object], default: "" },
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
      // Im mniej sekund, tym większy offset (okrąg się "zamyka")
      return (
        this.circumference *
        (1 - this.secondsLeft / Math.ceil(this.timeout / 1000))
      );
    },
  },
  watch: {
    show(val) {
      this.showInternal = val;
      if (val) this.startTimer();
    },
    timeout() {
      // Jeśli zmieni się timeout, zresetuj licznik
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
      // Odliczanie sekund
      this.interval = setInterval(() => {
        if (this.secondsLeft > 0) {
          this.secondsLeft--;
        }
      }, 1000);
      // Zamknięcie po timeout
      this.timer = setTimeout(() => {
        this.close();
      }, this.timeout);
    },
    close() {
      this.showInternal = false;
      clearInterval(this.interval);
      clearTimeout(this.timer);
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
