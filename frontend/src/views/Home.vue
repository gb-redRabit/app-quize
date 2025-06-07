<template>
  <div
    class="flex flex-col items-center justify-start bg-gradient-to-br min-h-screen"
  >
    <!-- Szybki wybór quizu -->
    <div class="flex flex-wrap justify-center gap-4 mb-8">
      <button
        v-for="n in [100, 150, 250]"
        :key="n"
        @click="startQuickQuiz(n)"
        class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold shadow transition"
      >
        Szybki quiz {{ n }} pytań
      </button>
      <button
        @click="startExam(150, 60)"
        class="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full font-semibold shadow transition"
      >
        Egzamin 150 pytań (1h)
      </button>
      <button
        @click="startExam(250, 120)"
        class="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-full font-semibold shadow transition"
      >
        Egzamin 250 pytań (2h)
      </button>
    </div>
    <!-- Dwie kolumny -->
    <div class="flex flex-col md:flex-row gap-8 w-full max-w-6xl">
      <!-- Lewa kolumna: Quiz -->
      <div
        class="flex-1 flex flex-col gap-8 bg-white/95 rounded-3xl p-10 shadow-2xl border border-blue-100"
      >
        <h2 class="text-3xl font-bold mb-4 text-blue-700">Quiz</h2>
        <div class="mb-6">
          <label class="block mb-2 text-gray-700 font-medium">Ile pytań?</label>
          <div class="flex items-center gap-4">
            <input
              type="range"
              min="10"
              max="250"
              step="10"
              v-model="selectedLength"
              class="w-full accent-blue-500"
            />
            <span
              class="text-xl font-bold text-blue-700 min-w-[48px] text-center"
              >{{ selectedLength }}</span
            >
          </div>
          <div class="flex justify-between text-xs text-gray-400 mt-1">
            <span>10</span>
            <span>250</span>
          </div>
        </div>
        <label class="block mb-2 text-gray-700 font-medium">Kategorie:</label>
        <div class="flex flex-wrap gap-2 mb-6">
          <span
            v-for="cat in ['all', ...categories]"
            :key="cat"
            @click="toggleCategory(cat)"
            :class="[
              'px-4 py-2 rounded-full cursor-pointer text-sm font-semibold border shadow transition',
              selectedCategories.includes(cat)
                ? 'bg-blue-500 text-white border-blue-500 scale-105'
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100',
            ]"
          >
            {{ cat === "all" ? "Wszystkie" : cat }}
          </span>
        </div>
        <router-link
          :to="{
            name: 'QuizView',
            query: {
              length: selectedLength,
              categories: selectedCategories.join(','),
            },
          }"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-xl font-semibold shadow transition text-center block"
        >
          Rozpocznij Quiz
        </router-link>
      </div>
      <!-- Prawa kolumna: Statystyki i kategorie -->
      <div
        class="flex-1 flex flex-col gap-8 bg-white/95 rounded-3xl p-10 shadow-2xl border border-blue-100"
      >
        <h2 class="text-3xl font-bold mb-4 text-blue-700">Statystyki</h2>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="bg-blue-50 rounded-lg p-4 flex flex-col items-center">
            <span class="text-2xl font-bold text-blue-700">{{
              questionsCount
            }}</span>
            <span class="text-gray-600">Liczba pytań</span>
          </div>
          <div class="bg-blue-50 rounded-lg p-4 flex flex-col items-center">
            <span class="text-2xl font-bold text-blue-700">{{
              stats.totalTests
            }}</span>
            <span class="text-gray-600">Wszystkich testów</span>
          </div>
          <div class="bg-green-50 rounded-lg p-4 flex flex-col items-center">
            <span class="text-2xl font-bold text-green-700">{{
              stats.correct
            }}</span>
            <span class="text-gray-600">Poprawnych</span>
          </div>
          <div class="bg-red-50 rounded-lg p-4 flex flex-col items-center">
            <span class="text-2xl font-bold text-red-700">{{
              stats.wrong
            }}</span>
            <span class="text-gray-600">Błędnych</span>
          </div>
          <div
            class="bg-yellow-50 rounded-lg p-4 flex flex-col items-center col-span-2"
          >
            <span class="text-2xl font-bold text-yellow-700"
              >{{ stats.avgScore }}%</span
            >
            <span class="text-gray-600">Średni wynik</span>
          </div>
        </div>
        <div class="mb-4 text-center text-lg">
          <span class="font-semibold text-blue-700">Quizy:</span>
          {{ stats.quiz.total }} (śr. {{ stats.quiz.avg }}%) &nbsp;|&nbsp;
          <span class="font-semibold text-purple-700">Egzaminy:</span>
          {{ stats.exam.total }} (śr. {{ stats.exam.avg }}%)
        </div>
        <div class="flex flex-wrap gap-2 justify-center">
          <router-link
            v-for="cat in ['all', ...categories]"
            :key="cat"
            :to="
              cat === 'all'
                ? { name: 'CategoryQuestions', params: { category: 'all' } }
                : { name: 'CategoryQuestions', params: { category: cat } }
            "
            class="px-4 py-2 rounded-full bg-gray-200 hover:bg-blue-400 hover:text-white text-gray-700 font-semibold text-sm shadow transition-all duration-200"
          >
            {{ cat === "all" ? "Wszystkie pytania" : cat }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Home",
  data() {
    return {
      selectedLength: 10,
      selectedCategories: ["all"],
      categories: [],
      questionsCount: 0,
      stats: {
        totalTests: 0,
        avgScore: 0,
        correct: 0,
        wrong: 0,
        quiz: { total: 0, avg: 0, correct: 0, wrong: 0 },
        exam: { total: 0, avg: 0, correct: 0, wrong: 0 },
      },
    };
  },
  created() {
    this.fetchCategoriesAndStats();
  },
  methods: {
    async fetchCategoriesAndStats() {
      const res = await axios.get("/api/questions");
      this.categories = [
        ...new Set(res.data.map((q) => q.category).filter(Boolean)),
      ];
      this.questionsCount = res.data.length;

      // Pobierz historię użytkownika
      try {
        const token = localStorage.getItem("token");
        const historyRes = await axios.get("/api/users/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const history = historyRes.data || [];

        // Statystyki ogólne
        const all = history.reduce(
          (acc, h) => {
            acc.totalTests++;
            acc.correct += h.correct || 0;
            acc.wrong += h.wrong || 0;
            acc.sumScore +=
              ((h.correct || 0) / ((h.correct || 0) + (h.wrong || 0) || 1)) *
              100;
            if (h.type === "quiz") {
              acc.quiz.total++;
              acc.quiz.correct += h.correct || 0;
              acc.quiz.wrong += h.wrong || 0;
              acc.quiz.sumScore +=
                ((h.correct || 0) / ((h.correct || 0) + (h.wrong || 0) || 1)) *
                100;
            }
            if (h.type === "egzamin") {
              acc.exam.total++;
              acc.exam.correct += h.correct || 0;
              acc.exam.wrong += h.wrong || 0;
              acc.exam.sumScore +=
                ((h.correct || 0) / ((h.correct || 0) + (h.wrong || 0) || 1)) *
                100;
            }
            return acc;
          },
          {
            totalTests: 0,
            correct: 0,
            wrong: 0,
            sumScore: 0,
            quiz: { total: 0, correct: 0, wrong: 0, sumScore: 0 },
            exam: { total: 0, correct: 0, wrong: 0, sumScore: 0 },
          }
        );
        this.stats = {
          totalTests: all.totalTests,
          avgScore: all.totalTests
            ? Math.round(all.sumScore / all.totalTests)
            : 0,
          correct: all.correct,
          wrong: all.wrong,
          quiz: {
            total: all.quiz.total,
            avg: all.quiz.total
              ? Math.round(all.quiz.sumScore / all.quiz.total)
              : 0,
            correct: all.quiz.correct,
            wrong: all.quiz.wrong,
          },
          exam: {
            total: all.exam.total,
            avg: all.exam.total
              ? Math.round(all.exam.sumScore / all.exam.total)
              : 0,
            correct: all.exam.correct,
            wrong: all.exam.wrong,
          },
        };
      } catch (e) {
        // Brak historii lub nie zalogowany
        this.stats = {
          totalTests: 0,
          avgScore: 0,
          correct: 0,
          wrong: 0,
          quiz: { total: 0, avg: 0, correct: 0, wrong: 0 },
          exam: { total: 0, avg: 0, correct: 0, wrong: 0 },
        };
      }
    },
    toggleCategory(cat) {
      if (cat === "all") {
        this.selectedCategories = ["all"];
      } else {
        if (this.selectedCategories.includes("all"))
          this.selectedCategories = [];
        const idx = this.selectedCategories.indexOf(cat);
        if (idx === -1) this.selectedCategories.push(cat);
        else this.selectedCategories.splice(idx, 1);
        if (this.selectedCategories.length === 0)
          this.selectedCategories = ["all"];
      }
    },
    startQuickQuiz(n) {
      this.selectedLength = n;
      this.selectedCategories = ["all"];
      this.$router.push({
        name: "QuizView",
        query: { length: n, categories: "all" },
      });
    },
    startExam(length, minutes) {
      this.$router.push({ name: "ExamView", query: { length, time: minutes } });
    },
  },
};
</script>

<style scoped>
/* Możesz dodać własne style jeśli chcesz */
</style>
