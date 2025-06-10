<template>
  <div class="container flex flex-col items-center justify-start px-2">
    <div class="bg-white rounded-lg shadow-lg p-4 flex flex-col gap-8 w-full">
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
        <BaseLoader v-if="loading" />
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
      <SummaryBox
        v-else
        :questions="questions"
        :answersStatus="answersStatus"
        :score="score"
        :total="examLength"
        :userAnswerText="userAnswerText"
        :correctAnswerText="correctAnswerText"
        @restart="restartExam"
        @retry-wrong="retryWrongQuestions"
      />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapActions } from "vuex";
import QuestionList from "@/components/QuestionList.vue";
import SummaryBox from "@/components/SummaryBox.vue";
import BaseLoader from "@/components/BaseLoader.vue";
import { getRandomUniqueQuestions } from "@/utils/randomQuestions";

export default {
  components: {
    QuestionList,
    SummaryBox,
    BaseLoader,
  },
  data() {
    return {
      questions: [],
      currentQuestionIndex: 0,
      score: 0,
      loading: true,
      answersStatus: [],
      showSummary: false,
      timeLeft: 60 * 60,
      timer: null,
      examLength: 150,
      examTimeMinutes: 60,
      isCorrection: false,
      initialExamLength: 150, // ← dodaj to
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
    const length = parseInt(this.$route.query.length, 10);
    const time = parseInt(this.$route.query.time, 10);
    this.examLength = length && !isNaN(length) ? length : 150;
    this.initialExamLength = this.examLength; // ← zapamiętaj oryginalną liczbę pytań
    this.examTimeMinutes = time && !isNaN(time) ? time : 60;
    this.timeLeft = this.examTimeMinutes * 60;
    this.fetchQuestions();
    this.startTimer();
  },
  methods: {
    ...mapActions(["fetchUserHistory"]),
    async fetchQuestions() {
      try {
        this.loading = true;
        const response = await axios.get("/api/questions");
        const keys = ["answer_a", "answer_b", "answer_c", "answer_d"];
        this.questions = getRandomUniqueQuestions(
          response.data,
          this.examLength // ← używaj examLength
        ).map((q) => ({
          ...q,
          correctIndex: keys.findIndex((k) => q[k] && q[k].isCorret),
        }));
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
      this.isCorrection = false; // ← resetuj tryb poprawy
      this.examLength = this.initialExamLength; // ← przywróć oryginalną liczbę pytań
      this.timeLeft = this.examTimeMinutes * 60;
      this.fetchQuestions();
      this.startTimer();
    },
    async startTimer() {
      clearInterval(this.timer);
      this.timer = setInterval(async () => {
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
          await this.saveExamHistory();
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
            type: this.isCorrection ? "egzamin - poprawa błędów" : "egzamin",
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        await this.fetchUserHistory();
        this.isCorrection = false;
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
    goToQuestion(idx) {
      if (!this.showSummary) this.currentQuestionIndex = idx;
    },
    retryWrongQuestions() {
      // Zbierz indeksy błędnych odpowiedzi
      const wrongIndexes = this.answersStatus
        .map((a, idx) =>
          a.selected !== this.getCorrectIndex(this.questions[idx]) ? idx : null
        )
        .filter((idx) => idx !== null);

      // Jeśli nie ma błędnych, nie rób nic
      if (!wrongIndexes.length) return;

      // Przygotuj tylko błędne pytania
      this.questions = wrongIndexes.map((idx) => this.questions[idx]);
      this.answersStatus = this.questions.map(() => ({
        answered: false,
        selected: null,
      }));
      this.currentQuestionIndex = 0;
      this.showSummary = false;
      this.score = 0;
      this.timeLeft = this.examTimeMinutes * 60;
      this.examLength = this.questions.length; // ← liczba pytań do poprawy
      this.isCorrection = true;
      this.startTimer(); // ← DODAJ TO!
    },
    getCorrectIndex(q) {
      const keys = ["answer_a", "answer_b", "answer_c", "answer_d"];
      return keys.findIndex((k) => q[k] && q[k].isCorret);
    },
  },
};
</script>

<style scoped>
/* Dodaj własne style, jeśli potrzebujesz */
</style>
