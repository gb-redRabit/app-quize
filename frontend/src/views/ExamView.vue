<template>
  <div class="flex flex-col items-center justify-center">
    <div
      class="w-full max-w-3xl min-w-[600px] bg-white rounded-lg shadow-lg p-8 flex flex-col gap-8"
    >
      <div v-if="!showSummary">
        <h1 class="text-3xl font-bold mb-6 text-center">
          Egzamin – {{ examLength }} pytań
        </h1>
        <div class="flex justify-between items-center mb-4">
          <span class="text-lg font-semibold"
            >Pytanie {{ currentQuestionIndex + 1 }} / {{ examLength }}</span
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
        <button
          class="bg-green-500 text-white p-2 rounded mb-8"
          @click="restartExam"
        >
          Rozpocznij ponownie
        </button>
        <h2 class="text-2xl mb-2">Podsumowanie egzaminu</h2>
        <p class="mb-4">Twój wynik: {{ score }} / {{ examLength }}</p>
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
              <span
                :class="{
                  'text-green-700': isUserAnswerCorrect(idx),
                  'text-red-700': !isUserAnswerCorrect(idx),
                }"
              >
                {{
                  userAnswerText(q, answersStatus[idx].selected) ||
                  "Brak odpowiedzi"
                }}
              </span>
            </div>
            <div v-if="!isUserAnswerCorrect(idx)">
              <span class="font-bold text-green-700">Poprawna odpowiedź:</span>
              <span class="text-green-700">
                {{ correctAnswerText(q) }}
              </span>
            </div>
          </div>
        </div>
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
      timeLeft: 60 * 60, // domyślnie 1 godzina
      timer: null,
      examLength: 150, // domyślnie 150 pytań
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
    // Pobierz parametry z query
    const length = parseInt(this.$route.query.length, 10);
    const time = parseInt(this.$route.query.time, 10);
    this.examLength = length && !isNaN(length) ? length : 150;
    this.timeLeft = time && !isNaN(time) ? time * 60 : 60 * 60;
    this.fetchQuestions();
    this.startTimer();
  },
  methods: {
    ...mapActions(["fetchUserHistory"]),
    async fetchQuestions() {
      try {
        this.loading = true;
        const response = await axios.get("/api/questions");
        this.questions = getRandomUniqueQuestions(
          response.data,
          this.examLength
        );
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
          // Uzupełnij nieodpowiedziane jako błędne
          this.answersStatus = this.answersStatus.map((a) =>
            a.answered ? a : { answered: true, selected: null }
          );
          this.countScore();
          this.saveExamHistory();
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
      if (selectedIdx === null || selectedIdx === undefined) return "";
      return keys[selectedIdx];
    },
    isUserAnswerCorrect(idx) {
      const q = this.questions[idx];
      const keys = ["answer_a", "answer_b", "answer_c", "answer_d"];
      const correctIdx = keys.findIndex((k) => q[k] && q[k].isCorret);
      return this.answersStatus[idx].selected === correctIdx;
    },
    correctAnswerText(q) {
      const keys = ["answer_a", "answer_b", "answer_c", "answer_d"];
      const idx = keys.findIndex((k) => q[k] && q[k].isCorret);
      return idx !== -1 && q[keys[idx]] && q[keys[idx]].answer
        ? q[keys[idx]].answer
        : "";
    },
  },
};
</script>

<style scoped>
/* Dodaj własne style, jeśli potrzebujesz */
</style>
