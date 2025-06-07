<template>
  <div class="flex flex-col items-center justify-center bg-gray-100">
    <div
      class="w-full max-w-7xl min-w-[600px] bg-white rounded-lg shadow-lg p-8 flex flex-col gap-8"
    >
      <div class="flex-1 flex flex-col" v-if="!showSummary">
        <h1 class="text-3xl font-bold mb-6 text-center">Quiz Application</h1>
        <div v-if="loading" class="text-lg">Loading questions...</div>
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
            :showCorrect="true"
            @select="selectAnswer"
          />
          <div
            v-if="
              answersStatus.length > currentQuestionIndex &&
              answersStatus[currentQuestionIndex] &&
              answersStatus[currentQuestionIndex].answered
            "
            class="mt-4 text-center"
          >
            <span
              v-if="answersStatus[currentQuestionIndex].correct"
              class="text-green-600 font-bold text-xl"
              >Dobra odpowiedź!</span
            >
            <span v-else class="text-red-600 font-bold text-xl"
              >Zła odpowiedź!</span
            >
            <div
              class="mt-4 text-gray-700 text-base font-medium bg-gray-100 rounded p-3 min-h-[60px] min-w-max flex items-center justify-center"
            >
              <span>{{ questions[currentQuestionIndex].description }}</span>
            </div>
          </div>
        </div>
        <div class="flex justify-between items-center mt-8">
          <button
            class="bg-gray-400 text-white px-6 py-3 rounded text-lg"
            @click="prevQuestion"
            :disabled="currentQuestionIndex === 0"
          >
            ← Poprzednie
          </button>
          <button
            class="bg-blue-500 text-white px-6 py-3 rounded text-lg"
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
      </div>
      <!-- Podsumowanie -->
      <div v-else>
        <h2 class="text-2xl mb-2">Podsumowanie testu</h2>
        <p class="mb-4">Twój wynik: {{ score }} / {{ questions.length }}</p>
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
        <button
          class="bg-green-500 text-white p-2 rounded mt-8"
          @click="restartQuiz"
        >
          Rozpocznij ponownie
        </button>
      </div>
    </div>
    <!-- Lista pytań na dole strony -->
    <div class="w-full flex flex-col items-center mt-8">
      <div class="mb-2 font-semibold text-lg">Pytania</div>
      <div class="flex flex-wrap gap-3 justify-center w-full max-w-5xl">
        <button
          v-for="(q, idx) in questions"
          :key="idx"
          @click="goToQuestion(idx)"
          class="w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-colors duration-200"
          :class="questionNavClass(idx)"
          :aria-current="currentQuestionIndex === idx ? 'true' : undefined"
          :title="q.question"
          :disabled="showSummary"
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
        return "ring-4 ring-blue-400 bg-blue-500 text-white";
      }
      const status = this.answersStatus[idx];
      if (status.answered && status.correct) return "bg-green-500 text-white";
      if (status.answered && !status.correct) return "bg-red-500 text-white";
      return "bg-white text-gray-800";
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
