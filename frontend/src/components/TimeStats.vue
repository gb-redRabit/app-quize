<template>
  <div class="flex flex-col gap-2 items-left my-2">
    <div class="text-xs sm:text-base text-gray-700">
      <span class="font-semibold">Całkowity:</span>
      <span class="font-mono">{{ formatTime(totalTime) }}</span>
    </div>
    <div class="text-xs sm:text-base text-gray-700">
      <span class="font-semibold">Średnia:</span>
      <span class="font-mono">{{ formatTime(avgTime) }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "TimeStats",
  props: {
    totalTime: { type: Number, required: true }, // w sekundach
    avgTime: { type: Number, required: true }, // w sekundach
  },
  methods: {
    formatTime(sec) {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m}:${s.toString().padStart(2, "0")}`;
    },
  },
};
</script>
