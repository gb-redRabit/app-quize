<template>
  <div
    class="container flex flex-col items-center justify-start bg-gray-100 px-2"
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
        </div>
        <div
          class="h-20 text-gray-700 text-sm sm:text-lg font-medium bg-gray-100 rounded p-3 flex items-center justify-center"
        >
          <span
            v-if="
              answersStatus.length > currentQuestionIndex &&
              answersStatus[currentQuestionIndex] &&
              answersStatus[currentQuestionIndex].answered
            "
            >{{ questions[currentQuestionIndex].description }}</span
          >
          <span v-else>Odpowiedz aby uzyskać opis </span>
        </div>
      </div>
      <!-- Podsumowanie -->
      <div v-else>
        <div class="flex justify-between items-center mb-4">
          <div class="flex flex-col gap-1">
            <h2 class="text-2xl">Podsumowanie testu</h2>
            <p class="">Twój wynik: {{ score }} / {{ questions.length }}</p>
          </div>
          <button
            class="bg-green-500 text-white p-2 rounded"
            @click="restartQuiz"
          >
            Rozpocznij ponownie
          </button>
        </div>
        <div class="space-y-6">
          <div
            v-for="(q, idx) in questions"
            :key="idx"
            class="border rounded-lg p-4"
          >
            <div class="font-semibold mb-2">
              {{ idx + 1 }}. {{ q.question }}
            </div>
            <div v-if="answersStatus[idx].correct">
              <span class="text-green-700 font-bold"
                >✔ {{ correctAnswerText(q) }}</span
              >
            </div>
            <div v-else>
              <div>
                <span class="text-red-700 font-bold">Twoja odpowiedź: </span>
                <span>{{
                  userAnswerText(q, answersStatus[idx].selected)
                }}</span>
              </div>
              <div>
                <span class="text-green-700 font-bold"
                  >Prawidłowa odpowiedź:
                </span>
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
    </div>

    <div
      class="w-full max-w-2xl mx-auto mt-6 overflow-x-auto pb-2 py-2"
      style="scrollbar-width: thin"
    >
      <div class="flex gap-2 min-w-max px-2" style="width: fit-content">
        <button
          v-for="(q, idx) in questions"
          :key="idx"
          @click="goToQuestion(idx)"
          class="w-9 h-9 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center text-base sm:text-lg font-bold transition-colors duration-200 focus:outline-none"
          :class="questionNavClass(idx)"
          :aria-current="currentQuestionIndex === idx ? 'true' : undefined"
          :title="q.question"
          :disabled="showSummary"
          style="box-sizing: content-box"
        >
          {{ idx + 1 }}
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
      let filtered = response.data.filter((q) => q.question);
      if (!this.selectedCategories.includes("all")) {
        filtered = filtered.filter((q) =>
          this.selectedCategories.includes(q.category)
        );
      }
      this.questions = getRandomUniqueQuestions(filtered, this.quizLength);
      this.answersStatus = this.questions.map(() => ({
        answered: false,
        correct: false,
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
              Authorization: `Bearer ${token}`,
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
    questionNavClass(idx) {
      if (this.currentQuestionIndex === idx) {
        return "ring-4 ring-blue-400 bg-blue-500 text-white scale-110 shadow";
      }
      const status = this.answersStatus[idx];
      if (status.answered && status.correct) return "bg-green-500 text-white";
      if (status.answered && !status.correct) return "bg-red-500 text-white";
      return "bg-gray-200 text-gray-800";
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
  },
};
</script>
