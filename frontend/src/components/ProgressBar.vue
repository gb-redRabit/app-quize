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
  name: 'ProgressBar',
  props: {
    current: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  computed: {
    percent() {
      if (!this.total) return 0;
      return Math.round((this.current / this.total) * 100);
    },
  },
};
</script>
