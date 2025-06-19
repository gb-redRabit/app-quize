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
        <!-- Dodaj ProgressBar -->
        <BaseLoader v-if="loading" />
        <div v-else>
          <QuestionList
            ref="questionList"
            v-if="questions.length && currentQuestionIndex < questions.length"
            :question="questions[currentQuestionIndex]"
            :answered="
              answersStatus.length > currentQuestionIndex &&
              answersStatus[currentQuestionIndex]
                ? answersStatus[currentQuestionIndex].answered
                : false
            "
            :selected="selectedIndex"
            :selectedKey="
              answersStatus.length > currentQuestionIndex &&
              answersStatus[currentQuestionIndex]
                ? answersStatus[currentQuestionIndex].selectedKey
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
    <ProgressBar :current="answeredCount" :total="examLength" />
  </div>
</template>

<script>
import axios from "axios";
import { mapActions } from "vuex";
import QuestionList from "@/components/QuestionList.vue";
import SummaryBox from "@/components/SummaryBox.vue";
import BaseLoader from "@/components/BaseLoader.vue";
import ProgressBar from "@/components/ProgressBar.vue";
import { getRandomUniqueQuestions } from "@/utils/randomQuestions";
import { shuffleArray } from "@/utils/shuffleArray";

function getCorrectKey(q) {
  const keys = ["answer_a", "answer_b", "answer_c", "answer_d"];
  return keys.find((k) => q[k] && q[k].isCorret);
}

export default {
  components: {
    QuestionList,
    SummaryBox,
    BaseLoader,
    ProgressBar,
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
      initialExamLength: 150,
      shuffledAnswers: [],
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
    answeredCount() {
      return this.answersStatus.filter((a) => a.answered).length;
    },
    answers() {
      return this.shuffledAnswers;
    },
    selectedIndex() {
      if (!this.answersStatus[this.currentQuestionIndex]) return null;
      return this.answers.findIndex(
        (a) =>
          a.key === this.answersStatus[this.currentQuestionIndex].selectedKey
      );
    },
  },
  watch: {
    currentQuestionIndex: {
      immediate: true,
      handler() {
        const q = this.questions[this.currentQuestionIndex];
        if (!q) {
          this.shuffledAnswers = [];
          return;
        }
        this.shuffledAnswers = shuffleArray(
          ["answer_a", "answer_b", "answer_c", "answer_d"]
            .map((k) => q[k] && { ...q[k], key: k })
            .filter(Boolean)
        );
      },
    },
  },
  created() {
    const length = parseInt(this.$route.query.length, 10);
    const time = parseInt(this.$route.query.time, 10);
    this.examLength = length && !isNaN(length) ? length : 150;
    this.initialExamLength = this.examLength;
    this.examTimeMinutes = time && !isNaN(time) ? time : 60;
    this.timeLeft = this.examTimeMinutes * 60;
    this.fetchQuestions();
    this.startTimer();
  },
  mounted() {
    window.addEventListener("keydown", this.handleKeydown);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeydown);
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
          this.examLength
        ).map((q) => ({
          ...q,
          correctKey: keys.find((k) => q[k] && q[k].isCorret),
        }));
        this.answersStatus = this.questions.map(() => ({
          answered: false,
          selected: null,
          selectedKey: null,
        }));
        this.loading = false;
        this.showSummary = false;
        this.score = 0;
        this.currentQuestionIndex = 0;
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    },
    async selectAnswer(index, selectedKey) {
      if (this.answersStatus[this.currentQuestionIndex].answered) return;
      const q = this.questions[this.currentQuestionIndex];
      const correctKey = getCorrectKey(q);
      const isCorrect = selectedKey === correctKey;

      if (isCorrect) this.score++;
      this.answersStatus[this.currentQuestionIndex] = {
        answered: true,
        correct: isCorrect,
        selected: index,
        selectedKey,
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
        return acc + (a.selectedKey === getCorrectKey(q) ? 1 : 0);
      }, 0);
    },
    userAnswerText(q, selectedKey) {
      if (!selectedKey) return "";
      return q[selectedKey] && q[selectedKey].answer
        ? q[selectedKey].answer
        : "";
    },
    correctAnswerText(q) {
      const correctKey = getCorrectKey(q);
      return correctKey && q[correctKey] && q[correctKey].answer
        ? q[correctKey].answer
        : "";
    },
    restartExam() {
      this.isCorrection = false;
      this.examLength = this.initialExamLength;
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
          this.answersStatus = this.answersStatus.map((a) =>
            a.answered
              ? a
              : { answered: true, selected: null, selectedKey: null }
          );
          this.countScore();
          await this.saveExamHistory();
        }
      }, 1000);
    },
    async saveExamHistory() {
      try {
        await axios
          .post(
            "/api/auth/refresh",
            {},
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
              },
            }
          )
          .then((res) => {
            if (res.data.token) {
              sessionStorage.setItem("token", res.data.token);
            }
          })
          .catch(() => {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            window.location.href = "/login";
          });

        const token = sessionStorage.getItem("token");
        if (!token) return;
        const list = this.questions.map((q, idx) => ({
          id_questions: q.ID || q.id || q.Id || q.id_question,
          answer: this.answersStatus[idx].selectedKey
            ? this.answersStatus[idx].selectedKey
                .replace("answer_", "")
                .toUpperCase()
            : "",
          correct: this.answersStatus[idx].selectedKey === getCorrectKey(q),
        }));
        const correct = this.answersStatus.reduce((acc, a, idx) => {
          const q = this.questions[idx];
          return acc + (a.selectedKey === getCorrectKey(q) ? 1 : 0);
        }, 0);
        const wrong = this.answersStatus.length - correct;

        await axios.put(
          "/api/users/update",
          {
            data: new Date().toISOString(),
            list,
            correct,
            wrong,
            type: this.isCorrection ? "Egzamin - poprawa błędów" : "egzamin",
          },
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        this.isCorrection = true;
      } catch (e) {
        console.error("Błąd zapisu historii egzaminu:", e);
      }
    },
    goToQuestion(idx) {
      if (!this.showSummary) this.currentQuestionIndex = idx;
    },
    retryWrongQuestions() {
      const wrongIndexes = this.answersStatus
        .map((a, idx) =>
          a.selectedKey !== getCorrectKey(this.questions[idx]) ? idx : null
        )
        .filter((idx) => idx !== null);

      if (!wrongIndexes.length) return;

      this.questions = wrongIndexes.map((idx) => this.questions[idx]);
      this.answersStatus = this.questions.map(() => ({
        answered: false,
        selected: null,
        selectedKey: null,
      }));
      this.currentQuestionIndex = 0;
      this.showSummary = false;
      this.score = 0;
      this.timeLeft = this.examTimeMinutes * 60;
      this.examLength = this.questions.length;
      this.isCorrection = true;
      this.startTimer();
    },
    handleKeydown(e) {
      if (this.showSummary) return;
      if (this.loading) return;
      if (
        ["1", "2", "3", "4"].includes(e.key) &&
        this.currentQuestionIndex < this.questions.length
      ) {
        const idx = parseInt(e.key, 10) - 1;
        // Pobierz aktualne przetasowane odpowiedzi z ref
        const answers = this.$refs.questionList
          ? this.$refs.questionList.answers
          : this.answers;
        if (
          !this.answersStatus[this.currentQuestionIndex].answered &&
          answers &&
          answers[idx]
        ) {
          this.selectAnswer(idx, answers[idx].key);
        }
      }
    },
  },
};
</script>

<style scoped>
/* Dodaj własne style, jeśli potrzebujesz */
</style>
