<template>
  <div
    class="container flex flex-col-reverse sm:flex-col items-center justify-start bg-gray-100 px-2"
  >
    <div class="bg-white rounded-lg shadow-lg p-4 flex flex-col gap-8 w-full">
      <div class="flex-1 flex flex-col" v-if="!showSummary">
        <div v-if="loading" class="text-lg">Loading questions...</div>
        <div v-else>
          <div class="flex justify-between items-center mb-3">
            <button
              class="bg-blue-600 text-white md:px-6 md:py-3 rounded md:text-lg px-2 py-1"
              @click="prevQuestion"
              :disabled="currentQuestionIndex === 0"
            >
              ← Poprzednie
            </button>
            <h1 class="text-3xl font-bold text-center sm:block hidden">
              Kategoria {{ questions[currentQuestionIndex].category }}
            </h1>
            <button
              class="bg-blue-600 text-white md:px-6 md:py-3 rounded md:text-lg px-2 py-1"
              @click="nextOrFinish"
              :disabled="
                !(
                  answersStatus[currentQuestionIndex] &&
                  answersStatus[currentQuestionIndex].answered
                )
              "
            >
              {{
                currentQuestionIndex === questions.length - 1
                  ? "Zakończ test"
                  : "Następne →"
              }}
            </button>
          </div>
          <QuestionList
            class="sm:h-auto h-63vh"
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
            :showCorrect="true"
            @select="selectAnswer"
          />
          <QuestionDescription
            :answered="
              answersStatus.length > currentQuestionIndex &&
              answersStatus[currentQuestionIndex] &&
              answersStatus[currentQuestionIndex].answered
            "
            :description="
              questions[currentQuestionIndex] &&
              questions[currentQuestionIndex].description
            "
          />
        </div>
      </div>
      <!-- Podsumowanie -->
      <SummaryBox
        v-else
        :questions="questions"
        :answersStatus="answersStatus"
        :score="score"
        :total="questions.length"
        :userAnswerText="userAnswerText"
        :correctAnswerText="correctAnswerText"
        @restart="restartQuiz"
        @retry-wrong="retryWrongAnswers"
      />
    </div>
    <div class="container">
      <QuestionNavigation
        :questions="questions"
        :currentIdx="currentQuestionIndex"
        :answersStatus="answersStatus"
        :showSummary="showSummary"
        @goTo="goToQuestion"
      />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapActions } from "vuex";
import QuestionList from "@/components/QuestionList.vue";
import QuestionNavigation from "@/components/QuestionNavigation.vue";
import QuestionDescription from "@/components/QuestionDescription.vue";
import SummaryBox from "@/components/SummaryBox.vue";
import { getRandomUniqueQuestions } from "@/utils/randomQuestions";

export default {
  components: {
    QuestionList,
    QuestionNavigation,
    QuestionDescription,
    SummaryBox,
  },
  data() {
    return {
      questions: [],
      currentQuestionIndex: 0,
      score: 0,
      loading: true,
      answersStatus: [],
      quizLength: 10,
      showSummary: false,
      selectedCategories: [],
    };
  },
  created() {
    const length = parseInt(this.$route.query.length, 10);
    const categories = (this.$route.query.categories || "all").split(",");
    this.quizLength = length && !isNaN(length) ? length : 10;
    this.selectedCategories = categories;
    this.fetchQuestions();
  },
  methods: {
    ...mapActions(["fetchUserHistory"]),
    async fetchQuestions() {
      const response = await axios.get("/api/questions");
      const keys = ["answer_a", "answer_b", "answer_c", "answer_d"];
      this.questions = getRandomUniqueQuestions(
        response.data,
        this.quizLength
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
    },
    selectAnswer(index) {
      if (this.answersStatus[this.currentQuestionIndex].answered) return;
      const q = this.questions[this.currentQuestionIndex];
      const keys = ["answer_a", "answer_b", "answer_c", "answer_d"];
      const correctIdx = keys.findIndex((k) => q[k] && q[k].isCorret);
      const isCorrect = index === correctIdx;
      if (isCorrect) this.score++;
      this.answersStatus[this.currentQuestionIndex] = {
        answered: true,
        correct: isCorrect,
        selected: index,
      };
    },
    async nextOrFinish() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
      } else {
        this.showSummary = true;
        await this.saveUserHistory();
      }
    },
    async saveUserHistory() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Brak tokena JWT – zaloguj się ponownie!");
          return;
        }
        const list = this.questions.map((q, idx) => ({
          id_questions: q.ID || q.id || q.Id || q.id_question,
          answer: this.userAnswerLetter(q, this.answersStatus[idx].selected),
        }));
        const correct = this.answersStatus.filter((a) => a.correct).length;
        const wrong = this.answersStatus.filter(
          (a) => a.answered && !a.correct
        ).length;
        await axios.put(
          "/api/users/update",
          {
            data: new Date().toISOString(),
            list,
            correct,
            wrong,
            type: "quiz",
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        await this.fetchUserHistory();
      } catch (e) {
        alert("Błąd zapisu historii: " + e.message);
        console.error("Błąd zapisu historii:", e);
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
    prevQuestion() {
      if (this.currentQuestionIndex > 0) this.currentQuestionIndex--;
    },
    goToQuestion(idx) {
      if (!this.showSummary) this.currentQuestionIndex = idx;
    },
    restartQuiz() {
      this.currentQuestionIndex = 0;
      this.score = 0;
      this.loading = true;
      this.fetchQuestions();
    },
    userAnswerText(q, selectedIdx) {
      const keys = ["answer_a", "answer_b", "answer_c", "answer_d"];
      const key = keys[selectedIdx];
      return q[key] && q[key].answer ? q[key].answer : "";
    },
    correctAnswerText(q) {
      const keys = ["answer_a", "answer_b", "answer_c", "answer_d"];
      const idx = keys.findIndex((k) => q[k] && q[k].isCorret);
      return idx !== -1 && q[keys[idx]] && q[keys[idx]].answer
        ? q[keys[idx]].answer
        : "";
    },
    retryWrongAnswers() {
      // Zbierz indeksy błędnych odpowiedzi
      const wrongIndexes = this.answersStatus
        .map((a, idx) => (!a.correct ? idx : null))
        .filter((v) => v !== null);

      // Jeśli nie ma błędnych, nie rób nic
      if (wrongIndexes.length === 0) return;

      // Utwórz nową listę pytań tylko z błędnych
      this.questions = wrongIndexes.map((idx) => this.questions[idx]);

      // Zresetuj status odpowiedzi
      this.answersStatus = this.questions.map(() => ({
        answered: false,
        correct: false,
        selected: null,
      }));

      this.currentQuestionIndex = 0;
      this.showSummary = false;
      this.score = 0;
    },
  },
};
</script>
