<template>
  <div class="flex flex-col items-center justify-center bg-gray-100">
    <div
      class="w-full max-w-3xl min-w-[600px] bg-white rounded-lg shadow-lg p-8 flex flex-col gap-8"
    >
      <div v-if="!showSummary">
        <h1 class="text-3xl font-bold mb-6 text-center">Egzamin – 150 pytań</h1>
        <div class="flex justify-between items-center mb-4">
          <span class="text-lg font-semibold"
            >Pytanie {{ currentQuestionIndex + 1 }} / 150</span
          >
          <span class="text-lg font-semibold text-blue-700"
            >Pozostały czas: {{ formattedTime }}</span
          >
        </div>
        <div v-if="loading" class="text-lg">Ładowanie pytań...</div>
        <div v-else>
          <QuestionList
            v-if="questions.length && currentQuestionIndex < questions.length"
            :question="questions[currentQuestionIndex]"
            :answered="
              answersStatus.length > currentQuestionIndex &&
              answersStatus[currentQuestionIndex]
                ? answersStatus[currentQuestionIndex].answered
                : false
            "
            :selected="
              answersStatus.length > currentQuestionIndex &&
              answersStatus[currentQuestionIndex]
                ? answersStatus[currentQuestionIndex].selected
                : null
            "
            :showCorrect="false"
            @select="selectAnswer"
          />
        </div>
      </div>
      <!-- Podsumowanie -->
      <div v-else>
        <h2 class="text-2xl mb-2">Podsumowanie egzaminu</h2>
        <p class="mb-4">Twój wynik: {{ score }} / 150</p>
        <div class="space-y-6">
          <div
            v-for="(q, idx) in questions"
            :key="idx"
            class="border rounded-lg p-4"
          >
            <div class="font-semibold mb-2">
              {{ idx + 1 }}. {{ q.question }}
            </div>
            <div>
              <span class="font-bold">Twoja odpowiedź: </span>
              <span>{{ userAnswerText(q, answersStatus[idx].selected) }}</span>
            </div>
          </div>
        </div>
        <button
          class="bg-green-500 text-white p-2 rounded mt-8"
          @click="restartExam"
        >
          Rozpocznij ponownie
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapActions } from "vuex";
import QuestionList from "@/components/QuestionList.vue";
import { getRandomUniqueQuestions } from "@/utils/randomQuestions";

export default {
  components: { QuestionList },
  data() {
    return {
      questions: [],
      currentQuestionIndex: 0,
      score: 0,
      loading: true,
      answersStatus: [],
      showSummary: false,
      timeLeft: 60 * 60, // 1 godzina w sekundach
      timer: null,
    };
  },
  computed: {
    formattedTime() {
      const min = Math.floor(this.timeLeft / 60)
        .toString()
        .padStart(2, "0");
      const sec = (this.timeLeft % 60).toString().padStart(2, "0");
      return `${min}:${sec}`;
    },
  },
  created() {
    this.fetchQuestions();
    this.startTimer();
  },
  methods: {
    ...mapActions(["fetchUserHistory"]),
    async fetchQuestions() {
      try {
        this.loading = true;
        const response = await axios.get("/api/questions");
        this.questions = getRandomUniqueQuestions(response.data, 150);
        this.answersStatus = this.questions.map(() => ({
          answered: false,
          selected: null,
        }));
        this.loading = false;
        this.showSummary = false;
        this.score = 0;
        this.currentQuestionIndex = 0;
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    },
    async selectAnswer(index) {
      if (this.answersStatus[this.currentQuestionIndex].answered) return;
      this.answersStatus[this.currentQuestionIndex] = {
        answered: true,
        selected: index,
      };
      setTimeout(async () => {
        if (this.currentQuestionIndex < this.questions.length - 1) {
          this.currentQuestionIndex++;
        } else {
          this.showSummary = true;
          clearInterval(this.timer);
          this.countScore();
          await this.saveExamHistory();
        }
      }, 300);
    },
    countScore() {
      this.score = this.answersStatus.reduce((acc, a, idx) => {
        const q = this.questions[idx];
        const keys = ["answer_a", "answer_b", "answer_c", "answer_d"];
        const correctIdx = keys.findIndex((k) => q[k] && q[k].isCorret);
        return acc + (a.selected === correctIdx ? 1 : 0);
      }, 0);
    },
    userAnswerText(q, selectedIdx) {
      const keys = ["answer_a", "answer_b", "answer_c", "answer_d"];
      const key = keys[selectedIdx];
      return q[key] && q[key].answer ? q[key].answer : "";
    },
    restartExam() {
      this.timeLeft = 60 * 60;
      this.fetchQuestions();
      this.startTimer();
    },
    startTimer() {
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          clearInterval(this.timer);
          this.showSummary = true;
          this.countScore();
        }
      }, 1000);
    },
    async saveExamHistory() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const list = this.questions.map((q, idx) => ({
          id_questions: q.ID || q.id || q.Id || q.id_question,
          answer: this.userAnswerLetter(q, this.answersStatus[idx].selected),
        }));
        const correct = this.answersStatus.reduce((acc, a, idx) => {
          const q = this.questions[idx];
          const keys = ["answer_a", "answer_b", "answer_c", "answer_d"];
          const correctIdx = keys.findIndex((k) => q[k] && q[k].isCorret);
          return acc + (a.selected === correctIdx ? 1 : 0);
        }, 0);
        const wrong = this.answersStatus.length - correct;
        await axios.put(
          "/api/users/update",
          {
            data: new Date().toISOString(),
            list,
            correct,
            wrong,
            type: "egzamin",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        await this.fetchUserHistory();
      } catch (e) {
        console.error("Błąd zapisu historii egzaminu:", e);
      }
    },
    userAnswerLetter(q, selectedIdx) {
      const keys = ["answer_a", "answer_b", "answer_c", "answer_d"];
      if (selectedIdx == null) return "";
      if (selectedIdx === 0) return "A";
      if (selectedIdx === 1) return "B";
      if (selectedIdx === 2) return "C";
      if (selectedIdx === 3) return "D";
      return "";
    },
  },
};
</script>
