<template>
  <div>
    <!-- Header skeleton -->
    <div
      v-if="showHeader"
      :class="[titleWidth, 'h-8 mb-4 bg-gray-200 dark:bg-gray-700 rounded']"
      style="animation: fastPulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite"
    ></div>

    <!-- Subtitle skeleton -->
    <div
      v-if="showSubtitle"
      :class="[subtitleWidth, 'h-6 mb-6 bg-gray-200 dark:bg-gray-700 rounded']"
      style="animation: fastPulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite"
    ></div>

    <!-- Lines skeleton -->
    <div v-if="showLines" class="space-y-3">
      <div
        v-for="(width, i) in computedLineWidths"
        :key="i"
        class="h-4 bg-gray-200 dark:bg-gray-700 rounded"
        :style="{
          width,
          animation: 'fastPulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }"
      ></div>
    </div>

    <!-- Cards skeleton -->
    <div v-if="showCards" :class="['mt-8 grid gap-4', gridCols]">
      <div
        v-for="i in cardCount"
        :key="i"
        class="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm h-40"
        style="animation: fastPulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: String,
  cardCount: {
    type: Number,
    default: 3,
  },
  showLines: {
    type: Boolean,
    default: true,
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
  showSubtitle: {
    type: Boolean,
    default: false,
  },
  showCards: {
    type: Boolean,
    default: true,
  },
  gridCols: {
    type: String,
    default: 'md:grid-cols-2 lg:grid-cols-3',
  },
  containerClass: {
    type: String,
    default: 'container mx-auto',
  },
  titleWidth: {
    type: String,
    default: 'w-1/3',
  },
  subtitleWidth: {
    type: String,
    default: 'w-1/4',
  },
  lineWidths: {
    type: Array,
    default: () => ['67%', '45%', '78%', '60%'],
  },
});

// Obliczone szerokości linii z randomizacją dla bardziej naturalnego wyglądu
const computedLineWidths = computed(() => {
  return props.lineWidths.map((width) => {
    const baseWidth = parseInt(width);
    const variance = Math.random() * 6 - 3; // -3% do +3%
    return `${baseWidth + variance}%`;
  });
});
</script>

<style>
@keyframes fastPulse {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
