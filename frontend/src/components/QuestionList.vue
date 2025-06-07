<template>
  <div class="">
    <h2 class="text-sm sm:text-2xl mb-6 font-semibold break-words sm:h-56">
      {{ question.question }}
    </h2>
    <div class="flex flex-col w-full">
      <button
        v-for="(answer, idx) in answers"
        :key="idx"
        class="p-2 sm:p-4 rounded mb-1 sm:mb-4 border text-sm sm:text-lg transition-colors flex items-center sm:h-20"
        :class="buttonClass(idx)"
        @click="onSelect(idx)"
        :disabled="answered"
      >
        <span class="mr-2 sm:mr-4 font-bold text-lg sm:text-xl">
          {{ answerLetter(idx) }}
        </span>
        <span class="text-left break-words">{{ answer.answer }}</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    question: { type: Object, required: true },
    answered: Boolean,
    selected: Number,
    showCorrect: Boolean,
  },
  emits: ["select"],
  computed: {
    answers() {
      return ["answer_a", "answer_b", "answer_c"]
        .map((k) => this.question[k])
        .filter(Boolean);
    },
    correctIndex() {
      return this.answers.findIndex((a) => a.isCorret);
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
      return String.fromCharCode(65 + idx);
    },
  },
};
</script>
