<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Szczegóły historii quizu</h1>
    <div v-if="!entry">
      <p class="text-red-600">Nie znaleziono wpisu historii.</p>
    </div>
    <div v-else>
      <div class="mb-4">
        <span class="font-semibold">Data:</span>
        {{ new Date(entry.data).toLocaleString() }}
      </div>
      <div class="mb-4">
        <span class="font-semibold pr-3">Typ:</span>
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
      </div>
      <ul class="space-y-4">
        <li
          v-for="(item, i) in entry.list"
          :key="i"
          class="p-3 bg-gray-50 rounded shadow"
        >
          <div class="font-semibold mb-1">
            <span class="text-gray-500">ID: {{ item.id_questions }}</span>
            <span v-if="getQuestion(item.id_questions)">
              — {{ getQuestion(item.id_questions).question }}
            </span>
          </div>
          <div
            v-if="
              getQuestion(item.id_questions) &&
              getQuestion(item.id_questions).description
            "
            class="text-gray-500 text-sm mt-1"
          >
            Opis: {{ getQuestion(item.id_questions).description }}
          </div>
          <div>
            <span class="font-bold">Twoja odpowiedź: </span>
            <span
              :class="{
                'text-green-700': isUserAnswerCorrect(item),
                'text-red-700': !isUserAnswerCorrect(item),
              }"
            >
              {{ getUserAnswerText(item) }}
            </span>
          </div>
          <div v-if="!isUserAnswerCorrect(item)">
            <span class="font-bold text-green-700">Poprawna odpowiedź:</span>
            <span class="text-green-700">
              {{ getCorrectAnswerText(item) }}
            </span>
          </div>
        </li>
      </ul>
      <button
        class="mt-8 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold"
        @click="$router.back()"
      >
        Powrót
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";

export default {
  name: "HistoryDetailsView",
  data() {
    return {
      entry: null,
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
    getQuestion(id) {
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
    async fetchAllQuestions() {
      try {
        const res = await axios.get("/api/questions");
        this.allQuestions = res.data;
      } catch (e) {
        this.allQuestions = [];
      }
    },
  },
  async created() {
    await this.fetchAllQuestions();
    const idx = this.$route.params.idx;
    this.entry = this.history[idx] || null;
  },
};
</script>
