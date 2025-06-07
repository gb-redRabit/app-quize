<template>
  <div
    class="container flex flex-col items-center justify-start bg-gradient-to-br"
  >
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
        @click="startExam(10, 10)"
        class="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full font-semibold shadow transition"
      >
        Szybki egzamin
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
    <RandomQuote />
    <div class="flex flex-col md:flex-row gap-8 w-full">
      <div
        class="flex-1 flex flex-col gap-4 bg-white/95 rounded-3xl p-10 shadow-2xl border border-blue-100"
      >
        <h2 class="text-2xl font-bold mb-2 text-blue-700">Quiz</h2>
        <div class="mb-1">
          <label class="block mb-1 text-gray-700 font-medium">Ile pytań?</label>
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
        <div class="flex flex-wrap gap-2 mb-2">
          <span
            v-for="cat in ['all', ...categories]"
            :key="cat"
            @click="toggleCategory(cat)"
            :class="[
              'px-2 py-1 rounded-full cursor-pointer text-sm font-semibold border shadow transition',
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
        class="flex-1 flex flex-col gap-6 bg-white/95 rounded-3xl p-6 shadow-2xl border border-blue-100"
      >
        <h2 class="text-2xl font-bold mb-2 text-blue-700 text-right">
          Statystyki
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
          <div class="bg-blue-50 rounded-lg p-2 flex flex-col items-center">
            <span class="text-lg font-bold text-blue-700">{{
              questionsCount
            }}</span>
            <span class="text-xs text-gray-600">Pytań</span>
          </div>
          <div class="bg-blue-50 rounded-lg p-2 flex flex-col items-center">
            <span class="text-lg font-bold text-blue-700">{{
              stats.totalTests
            }}</span>
            <span class="text-xs text-gray-600">Testów</span>
          </div>
          <div
            class="bg-yellow-50 rounded-lg p-2 flex flex-col items-center col-span-2 sm:col-span-1"
          >
            <span class="text-lg font-bold text-yellow-700"
              >{{ stats.avgScore }}%</span
            >
            <span class="text-xs text-gray-600">Śr. wynik</span>
          </div>
          <div class="bg-green-50 rounded-lg p-2 flex flex-col items-center">
            <span class="text-lg font-bold text-green-700">{{
              stats.correct
            }}</span>
            <span class="text-xs text-gray-600">Poprawnych</span>
          </div>
          <div class="bg-red-50 rounded-lg p-2 flex flex-col items-center">
            <span class="text-lg font-bold text-red-700">{{
              stats.wrong
            }}</span>
            <span class="text-xs text-gray-600">Błędnych</span>
          </div>
        </div>
        <div class="flex flex-wrap justify-center gap-2 text-xs mt-2">
          <span class="bg-blue-100 px-2 py-1 rounded">
            Quizy: {{ stats.quiz.total }} (śr. {{ stats.quiz.avg }}%)
          </span>
          <span class="bg-purple-100 px-2 py-1 rounded">
            Egzaminy: {{ stats.exam.total }} (śr. {{ stats.exam.avg }}%)
          </span>
        </div>
        <div class="flex flex-wrap gap-2 justify-center mt-2">
          <router-link
            v-for="cat in ['all', ...categories]"
            :key="cat"
            :to="
              cat === 'all'
                ? { name: 'CategoryQuestions', params: { category: 'all' } }
                : { name: 'CategoryQuestions', params: { category: cat } }
            "
            class="px-3 py-1 rounded-full bg-gray-200 hover:bg-blue-400 hover:text-white text-gray-700 font-semibold text-xs shadow transition-all duration-200"
          >
            {{ cat === "all" ? "Wszystkie pytania" : cat }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RandomQuote from "@/components/RandomQuote.vue";
import axios from "axios";

export default {
  name: "Home",
  components: {
    RandomQuote,
  },
  data() {
    return {
      selectedLength: 100,
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
