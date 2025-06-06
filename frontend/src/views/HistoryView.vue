<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Twoja historia quizów</h1>
    <div v-if="history.length === 0" class="text-gray-500">
      Brak historii quizów.
    </div>
    <div v-else class="space-y-6">
      <div
        v-for="(entry, idx) in history"
        :key="entry.data"
        class="bg-white rounded-lg shadow flex flex-col md:flex-row items-center justify-between p-6"
      >
        <!-- Diagram po lewej -->
        <div class="flex flex-col items-center mr-8">
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
        <!-- Opis i przycisk po prawej -->
        <div class="flex-1 flex flex-col items-start">
          <div class="font-semibold text-lg mb-1">
            {{ new Date(entry.data).toLocaleString() }}
          </div>
          <div class="mb-2">
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
        </div>
        <router-link
          :to="{ name: 'HistoryDetails', params: { idx } }"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold mt-2"
        >
          Pokaż szczegóły
        </router-link>
      </div>
    </div>

    <!-- POPUP SZCZEGÓŁÓW -->
    <div
      v-if="showPopup"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-hidden"
      @click.self="closePopup"
    >
      <div
        class="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative overflow-y-auto max-h-[60vh]"
      >
        <button
          class="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl"
          @click="closePopup"
        >
          &times;
        </button>
        <h2 class="text-xl font-bold mb-4">Szczegóły odpowiedzi</h2>
        <div v-if="popupEntry">
          <ul class="space-y-4">
            <li
              v-for="(item, i) in popupEntry.list"
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
                <span class="font-bold text-green-700"
                  >Poprawna odpowiedź:</span
                >
                <span class="text-green-700">
                  {{ getCorrectAnswerText(item) }}
                </span>
              </div>
            </li>
          </ul>
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
      showPopup: false,
      popupEntry: null,
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
    openDetails(idx) {
      this.popupEntry = this.history[idx];
      this.showPopup = true;
    },
    closePopup() {
      this.showPopup = false;
      this.popupEntry = null;
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

<style scoped>
.container {
  max-width: 900px;
}
</style>
