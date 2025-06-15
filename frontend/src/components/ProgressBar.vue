<template>
  <div class="w-full bottom-0 fixed">
    <div class="w-full bg-gray-200 h-1">
      <div
        class="bg-blue-500 h-3 transition-all duration-300"
        :style="{ width: percent + '%' }"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProgressBar",
  props: {
    current: { type: Number, required: true }, // liczba odpowiedzi udzielonych
    total: { type: Number, required: true }, // liczba wszystkich pytań
  },
  computed: {
    percent() {
      if (!this.total) return 0;
      // 0% na starcie, 100% dopiero po odpowiedzi na wszystkie
      return Math.round((this.current / this.total) * 100);
    },
  },
};
</script>
