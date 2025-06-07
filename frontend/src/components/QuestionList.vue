<template>
  <div class="sm:h-auto h-63vh">
    <h2
      class="text-xl sm:text-2xl mb-6 font-semibold h-3/6 sm:h-36 break-words"
    >
      {{ question.question }}
    </h2>
    <div class="flex flex-col 4 w-full">
      <button
        v-for="(answer, key) in answersList"
        :key="key"
        class="p-2 sm:p-4 rounded mb-1 sm:mb-4 border text-sm sm:text-lg transition-colors flex items-center h-20"
        :class="buttonClass(key)"
        @click="onSelect(key)"
        :disabled="answered"
      >
        <span
          class="mr-2 sm:mr-4 flex items-center justify-center font-bold text-lg sm:text-xl"
        >
          {{ answerLetter(key) }}
        </span>
        <span class="text-left break-words">{{ answer }}</span>
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
    answerLetter(idx) {
      return String.fromCharCode(65 + idx); // 65 = 'A'
    },
  },
};
</script>
