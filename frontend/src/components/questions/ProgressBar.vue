<template>
  <div
    class="w-full flex flex-col space-y-1"
    :class="{ 'progress-fixed': position === 'fixed' }"
    style="min-width: 100%"
  >
    <div class="flex justify-between items-center text-xs font-medium px-1">
      <span class="text-blue-600 dark:text-blue-400">{{ percent }}%</span>
      <span class="text-gray-500 dark:text-gray-400">{{ current }}/{{ total }}</span>
    </div>

    <div
      class="w-full bg-gray-100 dark:bg-gray-700 rounded-full relative overflow-hidden"
      style="height: 0.625rem; box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1); min-width: 100%"
    >
      <div
        class="h-full rounded-full relative overflow-hidden transition-all duration-500 ease-out"
        :class="{ 'progress-complete': percent === 100 }"
        :style="{
          width: percent + '%',
          background:
            percent === 100
              ? 'linear-gradient(90deg, #10b981, #34d399)'
              : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
          boxShadow: '0 1px 3px rgba(59, 130, 246, 0.3)',
          minWidth: '0.5rem',
          transformOrigin: 'left',
        }"
      ></div>

      <div
        v-if="showMilestones && total > 1"
        class="absolute top-0 left-0 w-full h-full pointer-events-none"
      >
        <div
          v-for="i in total - 1"
          :key="i"
          class="absolute top-0 h-full bg-white bg-opacity-50"
          :style="{
            left: `${(i / total) * 100}%`,
            width: '1px',
            transform: 'translateX(-50%)',
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  current: { type: Number, required: true },
  total: { type: Number, required: true },
  showMilestones: { type: Boolean, default: true },
  position: { type: String, default: 'relative' }, // 'relative' or 'fixed'
});

const percent = computed(() => {
  if (!props.total) return 0;
  return Math.round((props.current / props.total) * 100);
});
</script>

<style scoped>
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.progress-complete {
  animation: none !important;
}

/* Dodatkowe style dla wariantu fixed */
.progress-fixed {
  position: fixed; /* Przywrócenie fixed zamiast relative */
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%; /* Wyraźne ustawienie szerokości */
  z-index: 50;
  padding: 0.5rem 1rem;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
  backdrop-filter: blur(5px);
}

/* Responsywność */
@media (min-width: 640px) {
  .progress-fixed {
    padding: 0.75rem 1.5rem;
  }
}
</style>
