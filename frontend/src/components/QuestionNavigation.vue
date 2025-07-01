<template>
  <div
    ref="scrollNav"
    class="w-full max-w-2xl mx-auto -mt-4 mb-2 sm:mb-0 sm:mt-1 overflow-x-auto pb-2 py-2 flex justify-start"
    style="scrollbar-width: thin"
  >
    <div class="flex gap-2 px-2 min-w-max whitespace-nowrap" style="width: max-content">
      <button
        v-for="(q, idx) in questions"
        :key="idx"
        @click="goTo(idx)"
        class="w-9 h-9 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center text-base sm:text-lg font-bold transition-colors duration-200 focus:outline-none"
        :class="navClass(idx)"
        :aria-current="currentIdx === idx ? 'true' : undefined"
        :title="q.question"
        :disabled="disabled"
        style="box-sizing: content-box"
      >
        {{ idx + 1 }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    questions: { type: Array, required: true },
    currentIdx: { type: Number, required: true },
    answersStatus: { type: Array, required: true },
    disabled: { type: Boolean, default: false },
    showSummary: { type: Boolean, default: false },
  },
  emits: ['goTo'],
  methods: {
    goTo(idx) {
      if (!this.showSummary) this.$emit('goTo', idx);
    },
    navClass(idx) {
      if (this.currentIdx === idx) {
        return 'ring-4 ring-blue-400 bg-blue-500 text-white scale-110 shadow';
      }
      const status = this.answersStatus[idx];
      const question = this.questions[idx];
      const keys = ['answer_a', 'answer_b', 'answer_c', 'answer_d'];
      const correctKey = keys.find((k) => question[k] && question[k].isCorret);

      if (status.answered && status.selectedKey && status.selectedKey === correctKey)
        return 'bg-green-500 text-white';
      if (status.answered && status.selectedKey && status.selectedKey !== correctKey)
        return 'bg-red-500 text-white';
      return 'bg-gray-200 text-gray-800';
    },
  },
  mounted() {
    this.$refs.scrollNav && (this.$refs.scrollNav.scrollLeft = 0);
  },
  watch: {
    currentIdx() {
      this.$nextTick(() => {
        const nav = this.$refs.scrollNav;
        if (!nav) return;
        const activeBtn = nav.querySelector('.ring-4');
        if (activeBtn) {
          const navRect = nav.getBoundingClientRect();
          const btnRect = activeBtn.getBoundingClientRect();
          if (btnRect.left < navRect.left || btnRect.right > navRect.right) {
            nav.scrollLeft += btnRect.left - navRect.left - 16;
          }
        }
      });
    },
  },
};
</script>

<style scoped>
/* Upewnij się, że na mobile overflow działa i nie łamie się linia */
@media (max-width: 640px) {
  .min-w-max {
    min-width: max-content;
  }
}
</style>
