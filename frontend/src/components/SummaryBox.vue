<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-2xl">Podsumowanie testu</h2>
        <p>Twój wynik: {{ score }} / {{ total }}</p>
      </div>
      <div class="flex gap-2">
        <BaseButton color="green" @click="$emit('restart')">
          Rozpocznij ponownie
        </BaseButton>
        <BaseButton
          v-if="hasWrong"
          color="yellow"
          @click="$emit('retry-wrong')"
        >
          Popraw błędne odpowiedzi
        </BaseButton>
      </div>
    </div>
    <div class="space-y-6">
      <div
        v-for="(q, idx) in questions"
        :key="idx"
        class="border rounded-lg p-4"
      >
        <div class="font-semibold mb-2">{{ idx + 1 }}. {{ q.question }}</div>
        <div v-if="isCorrect(idx)">
          <span class="text-green-700 font-bold"
            >✔ {{ correctAnswerText(q) }}</span
          >
        </div>
        <div v-else>
          <div>
            <span class="text-red-700 font-bold">Twoja odpowiedź: </span>
            <span>{{ userAnswerText(q, answersStatus[idx].selected) }}</span>
          </div>
          <div>
            <span class="text-green-700 font-bold">Prawidłowa odpowiedź: </span>
            <span>{{ correctAnswerText(q) }}</span>
          </div>
        </div>
        <div
          class="mt-2 text-gray-700 text-base font-medium bg-gray-100 rounded p-3"
        >
          {{ q.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseButton from "@/components/BaseButton.vue";
export default {
  components: { BaseButton },
  props: {
    questions: Array,
    answersStatus: Array,
    score: Number,
    total: Number,
    userAnswerText: Function,
    correctAnswerText: Function,
  },
  computed: {
    hasWrong() {
      return this.answersStatus.some(
        (a, idx) =>
          a.selected !== null &&
          typeof this.questions[idx].correctIndex === "number" &&
          a.selected !== this.questions[idx].correctIndex
      );
    },
  },
  methods: {
    isCorrect(idx) {
      return (
        this.answersStatus[idx].selected !== null &&
        typeof this.questions[idx].correctIndex === "number" &&
        this.answersStatus[idx].selected === this.questions[idx].correctIndex
      );
    },
  },
};
</script>
