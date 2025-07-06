<template>
  <div class="progress-container">
    <div class="progress-stats">
      <span class="progress-percent">{{ percent }}%</span>
      <span class="progress-fraction">{{ current }}/{{ total }}</span>
    </div>

    <div class="progress-track">
      <div
        class="progress-bar"
        :style="{ width: percent + '%' }"
        :class="{ 'progress-complete': percent === 100 }"
      >
        <div class="progress-glow"></div>
      </div>

      <div v-if="showMilestones && total > 1" class="milestone-markers">
        <div
          v-for="i in total - 1"
          :key="i"
          class="milestone"
          :style="{ left: `${(i / total) * 100}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProgressBar',
  props: {
    current: { type: Number, required: true },
    total: { type: Number, required: true },
    showMilestones: { type: Boolean, default: true },
    position: { type: String, default: 'relative' }, // 'relative' or 'fixed'
  },
  computed: {
    percent() {
      if (!this.total) return 0;
      return Math.round((this.current / this.total) * 100);
    },
  },
};
</script>

<style scoped>
.progress-container {
  @apply w-full flex flex-col space-y-1;
}

.progress-stats {
  @apply flex justify-between items-center text-xs font-medium px-1;
}

.progress-percent {
  @apply text-blue-600;
}

.progress-fraction {
  @apply text-gray-500;
}

.progress-track {
  @apply w-full bg-gray-100 rounded-full h-2.5 relative overflow-hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  @apply h-full rounded-full relative overflow-hidden transition-all duration-500 ease-out;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3);
  min-width: 0.5rem;
  transform-origin: left;
  animation: pulse 2s infinite;
}

.progress-bar.progress-complete {
  background: linear-gradient(90deg, #10b981, #34d399);
  animation: none;
}

.progress-glow {
  @apply absolute top-0 right-0 h-full w-8;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.6) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shine 2s infinite;
}

.milestone-markers {
  @apply absolute top-0 left-0 w-full h-full;
  pointer-events: none;
}

.milestone {
  @apply absolute top-0 h-full w-px bg-white bg-opacity-50;
  transform: translateX(-50%);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(400%);
  }
}

/* Różne warianty w zależności od pozycji */
:deep(.progress-fixed) {
  @apply fixed bottom-0 left-0 w-full z-50;
  padding: 0.5rem 1rem;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
  backdrop-filter: blur(5px);
}

/* Responsywność */
@media (min-width: 640px) {
  .progress-stats {
    @apply text-sm;
  }

  .progress-track {
    @apply h-3;
  }
}
</style>
