<template>
  <div
    class="container mx-auto p-4 md:flex md:flex-col md:justify-start md:items-center"
  >
    <h1 class="text-2xl font-bold mb-4">Twoja historia quizów</h1>
    <div v-if="history.length === 0" class="text-gray-500">
      Brak historii quizów.
    </div>
    <div
      v-else
      class="space-y-6 md:space-y-0 md:flex md:flex-row md:flex-wrap md:gap-6 md:justify-center"
    >
      <div
        v-for="(entry, idx) in history"
        :key="entry.data"
        class="bg-white rounded-lg shadow md:flex md:flex-row md:w-96 md:items-center md:justify-between p-6"
      >
        <!-- Diagram po lewej -->
        <div class="flex flex-col items-center mr-8 sm:mr-auto">
          <svg width="70" height="70" viewBox="0 0 36 36" class="mb-2">
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="#e5e7eb"
              stroke-width="6"
            />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              :stroke="entry.correct > entry.wrong ? '#22c55e' : '#ef4444'"
              stroke-width="6"
              :stroke-dasharray="pieGood(entry)"
              stroke-linecap="round"
              transform="rotate(-90 18 18)"
            />
            <text
              x="18"
              y="24"
              text-anchor="middle"
              font-size="14"
              fill="#374151"
              font-weight="bold"
            >
              {{ percentGood(entry) }}%
            </text>
          </svg>
          <div class="text-xs text-gray-600">
            <span class="text-green-600 font-bold">{{
              entry.correct || 0
            }}</span>
            /
            <span class="text-red-600 font-bold">{{ entry.wrong || 0 }}</span>
          </div>
        </div>
        <div
          class="flex flex-wrap justify-between gap-1 md:flex-nowrap md:flex-col md:items-end h-full"
        >
          <span
            class="inline-block px-3 py-1 rounded-full text-xs font-bold"
            :class="
              entry.type === 'egzamin'
                ? 'bg-purple-200 text-purple-800'
                : 'bg-blue-200 text-blue-800'
            "
          >
            {{ entry.type === "egzamin" ? "Egzamin" : "Quiz" }}
          </span>
          <div class="font-semibold text-base">
            {{ new Date(entry.data).toLocaleString() }}
          </div>
          <router-link
            :to="{ name: 'HistoryDetails', params: { idx } }"
            class="bg-blue-500 hover:bg-blue-600 text-white m-auto px-4 py-2 rounded font-semibold mt-2 w-full md:w-auto md:m-0"
          >
            Pokaż szczegóły
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapState, mapActions } from "vuex";

export default {
  name: "History",
  data() {
    return {
      allQuestions: [],
    };
  },
  computed: {
    ...mapState(["user"]),
    history() {
      return this.user.history || [];
    },
  },
  methods: {
    ...mapActions(["fetchUserHistory"]),
    percentGood(entry) {
      const total = (entry.correct || 0) + (entry.wrong || 0);
      if (!total) return 0;
      return Math.round(((entry.correct || 0) / total) * 100);
    },
    pieGood(entry) {
      const percent = this.percentGood(entry);
      return `${percent} ${100 - percent}`;
    },
    async fetchAllQuestions() {
      try {
        const res = await axios.get("/api/questions");
        this.allQuestions = res.data;
      } catch (e) {
        this.allQuestions = [];
      }
    },
    getQuestion(id) {
      // ID może być różnie nazwane w bazie
      return (
        this.allQuestions.find(
          (q) => q.ID == id || q.id == id || q.Id == id || q.id_question == id
        ) || null
      );
    },
    getUserAnswerText(item) {
      const q = this.getQuestion(item.id_questions);
      if (!q) return "Brak pytania";
      const answerKey = item.answer ? item.answer.toUpperCase() : "";
      const answerObj = q[`answer_${answerKey.toLowerCase()}`];
      return answerObj && answerObj.answer
        ? answerObj.answer
        : "Brak odpowiedzi";
    },
    getCorrectAnswerText(item) {
      const q = this.getQuestion(item.id_questions);
      if (!q) return "Brak pytania";
      const keys = ["a", "b", "c", "d"];
      const correctKey = keys.find(
        (k) => q[`answer_${k}`] && q[`answer_${k}`].isCorret
      );
      if (!correctKey) return "Brak poprawnej odpowiedzi";
      return q[`answer_${correctKey}`].answer;
    },
    isUserAnswerCorrect(item) {
      const q = this.getQuestion(item.id_questions);
      if (!q) return false;
      const answerKey = item.answer ? item.answer.toUpperCase() : "";
      const answerObj = q[`answer_${answerKey.toLowerCase()}`];
      return answerObj && answerObj.isCorret === true;
    },
  },
  async created() {
    await this.fetchUserHistory();
    await this.fetchAllQuestions();
  },
};
</script>

<style scoped></style>
