<template>
  <div>
    <h2 class="text-2xl mb-6 font-semibold">{{ question.question }}?</h2>
    <div class="flex flex-col w-full">
      <button
        v-for="(answer, key) in answersList"
        :key="key"
        class="p-4 rounded mb-4 border text-lg transition-colors flex items-center"
        :class="buttonClass(key)"
        @click="onSelect(key)"
        :disabled="answered"
      >
        <span
          class="mr-4 flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white font-bold text-xl"
          :class="letterClass(key)"
        >
          {{ answerLetter(key) }}
        </span>
        <span class="text-left">{{ answer }}</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    question: { type: Object, required: true },
    answered: { type: Boolean, default: false },
    selected: { type: Number, default: null },
    showCorrect: { type: Boolean, default: false },
  },
  emits: ["select"],
  computed: {
    answersList() {
      return ["answer_a", "answer_b", "answer_c", "answer_d"]
        .map((k) => this.question[k])
        .filter(Boolean)
        .map((a) => (typeof a === "object" ? a.answer || "" : a));
    },
    correctIndex() {
      const keys = ["answer_a", "answer_b", "answer_c", "answer_d"];
      return keys.findIndex(
        (k) => this.question[k] && this.question[k].isCorret
      );
    },
  },
  methods: {
    onSelect(idx) {
      this.$emit("select", idx);
    },
    buttonClass(idx) {
      if (!this.answered) return "bg-blue-500 text-white";
      if (this.showCorrect && idx === this.correctIndex)
        return "bg-green-500 text-white";
      if (idx === this.selected) return "bg-red-500 text-white";
      return "bg-gray-200 text-gray-700";
    },
    letterClass(idx) {
      if (!this.answered) return "border-blue-500 text-blue-500";
      if (this.showCorrect && idx === this.correctIndex)
        return "border-green-500 text-green-500";
      if (idx === this.selected) return "border-red-500 text-red-500";
      return "border-gray-400 text-gray-400";
    },
    answerLetter(idx) {
      return String.fromCharCode(65 + idx); // 65 = 'A'
    },
  },
};
</script>
