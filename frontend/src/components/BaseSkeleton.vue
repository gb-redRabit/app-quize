<template>
  <div
    class="flex flex-col gap-4 md:gap-6 p-4 md:p-6"
    :class="[containerClass, loading ? 'fast-pulse' : '']"
  >
    <!-- Header section -->
    <div v-if="showHeader" class="space-y-3">
      <!-- Title -->
      <div class="h-8 bg-gray-300 dark:bg-gray-500 rounded" :class="[titleWidth]"></div>

      <!-- Subtitle -->
      <div
        v-if="showSubtitle"
        class="h-4 bg-gray-300 dark:bg-gray-500 rounded"
        :class="[subtitleWidth]"
      ></div>
    </div>

    <!-- Text lines -->
    <div v-if="showLines" class="flex flex-col gap-2 mb-2">
      <div
        v-for="(width, i) in lineWidths"
        :key="`line-${i}`"
        class="h-4 bg-gray-300 dark:bg-gray-500 rounded"
        :style="{ width }"
      ></div>
    </div>

    <!-- Cards/items grid -->
    <div
      v-if="showCards"
      :class="{
        'grid gap-4': true,
        'grid-cols-1': true,
        [`${gridCols}`]: true,
      }"
    >
      <div
        v-for="i in cardCount"
        :key="`card-${i}`"
        :class="{
          'p-4 rounded-lg flex flex-col gap-2': true,
          'border-2 border-gray-300 dark:border-gray-500': variant === 'question',
          'bg-gray-300 dark:bg-gray-500': variant !== 'question',
        }"
      >
        <!-- Card header (for question variant) -->
        <div v-if="variant === 'question'" class="flex justify-between">
          <div class="h-5 w-16 bg-gray-300 dark:bg-gray-500 rounded"></div>
          <div class="flex gap-2">
            <div class="h-7 w-24 bg-gray-300 dark:bg-gray-500 rounded-full"></div>
            <div class="h-7 w-16 bg-gray-300 dark:bg-gray-500 rounded-full"></div>
          </div>
        </div>

        <!-- Card title -->
        <div
          class="h-5 bg-gray-300 dark:bg-gray-500 rounded"
          :style="{ width: randomWidth() }"
        ></div>

        <!-- Card content -->
        <div
          class="h-3 bg-gray-300 dark:bg-gray-500 rounded"
          :style="{ width: randomWidth() }"
        ></div>
        <div
          class="h-3 bg-gray-300 dark:bg-gray-500 rounded"
          :style="{ width: randomWidth() }"
        ></div>

        <!-- Question variant answers -->
        <div v-if="variant === 'question'" class="mt-2 space-y-2">
          <div v-for="j in 3" :key="`answer-${i}-${j}`" class="flex items-center gap-3">
            <div class="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-500"></div>
            <div
              class="h-4 bg-gray-300 dark:bg-gray-500 rounded"
              :style="{ width: randomWidth() }"
            ></div>
          </div>
        </div>

        <!-- Card footer -->
        <div v-else class="flex gap-2 mt-2">
          <div class="h-8 w-20 bg-gray-300 dark:bg-gray-500 rounded"></div>
          <div class="h-8 w-8 bg-gray-300 dark:bg-gray-500 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseSkeleton',
  props: {
    loading: {
      type: Boolean,
      default: true,
    },
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'question', 'profile', 'article'].includes(value),
    },
    cardCount: {
      type: Number,
      default: 4,
    },
    showHeader: {
      type: Boolean,
      default: true,
    },
    showSubtitle: {
      type: Boolean,
      default: true,
    },
    showLines: {
      type: Boolean,
      default: true,
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
  },
  data() {
    return {
      lineWidths: ['67%', '45%', '78%', '60%'],
    };
  },
  methods: {
    // Generuje losową szerokość dla dynamicznego wyglądu
    randomWidth() {
      const widths = ['40%', '50%', '60%', '70%', '80%', '90%'];
      return widths[Math.floor(Math.random() * widths.length)];
    },
  },
};
</script>

<style>
/* Szybsza wersja animacji pulse */
@keyframes fastPulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.fast-pulse {
  animation: fastPulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite; /* Szybsza animacja (1s zamiast 2s) */
}

/* Alternatywna animacja - fade */
@keyframes breathe {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(0.99);
    opacity: 0.7;
  }
}

.breathe {
  animation: breathe 1.2s ease-in-out infinite;
}
</style>
