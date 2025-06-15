<template>
  <div
    class="container flex flex-col items-center justify-start bg-gradient-to-br"
  >
    <BaseLoader :show="loading" />
    <div class="flex flex-wrap justify-center gap-4">
      <BaseButton
        v-for="n in [100, 150, 250]"
        :key="n"
        color="blue"
        size="lg"
        class="font-semibold shadow"
        @click="startQuickQuiz(n)"
      >
        Szybki quiz {{ n }} pytań
      </BaseButton>
      <BaseButton
        color="purple"
        size="lg"
        class="font-semibold shadow"
        @click="startExam(10, 10)"
      >
        Szybki egzamin
      </BaseButton>
      <BaseButton
        color="purple"
        size="lg"
        class="font-semibold shadow"
        @click="startExam(150, 60)"
      >
        Egzamin 150 pytań (1h)
      </BaseButton>
      <BaseButton
        color="purple"
        size="lg"
        class="font-semibold shadow"
        @click="startExam(250, 120)"
      >
        Egzamin 250 pytań (2h)
      </BaseButton>
      <BaseButton
        color="purple"
        size="lg"
        class="font-semibold shadow"
        @click="showExamPopup = true"
        :aria-label="'Rozpocznij Egzamin'"
      >
        Rozpocznij Egzamin z ubiegłych lat
      </BaseButton>
    </div>
    <RandomQuote />
    <div class="flex flex-col md:flex-row gap-8 w-full">
      <!-- Lewa kolumna: Quiz -->
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
            >
              {{ selectedLength }}
            </span>
          </div>
          <div class="flex justify-between text-xs text-gray-400 mt-1">
            <span>10</span>
            <span>250</span>
          </div>
        </div>
        <div class="mb-2">
          <span class="font-medium text-gray-700">Pula pytań do quizu:</span>
          <span class="font-bold text-blue-700 ml-1">{{
            selectedCategoriesCount
          }}</span>
          <span
            v-if="isTooFewQuestions"
            class="ml-2 text-red-600 font-semibold"
          >
            (za mało pytań)
          </span>
        </div>
        <label class="block mb-2 text-gray-700 font-medium">Kategorie:</label>
        <div class="flex items-center gap-4 mb-2">
          <select
            v-model="selectedCategoryToAdd"
            class="border rounded px-3 py-2 w-full"
            @change="addCategoryOnSelect"
          >
            <option disabled value="">Wybierz kategorię...</option>
            <option
              v-for="cat in categories.filter(
                (c) =>
                  !selectedCategories.includes(c) &&
                  !c.toLowerCase().includes('egzamin')
              )"
              :key="cat"
              :value="cat"
            >
              {{ cat }}
            </option>
          </select>
        </div>
        <!-- Wybrane kategorie -->
        <div class="flex flex-wrap gap-2 mb-2">
          <span
            v-for="cat in selectedCategories"
            :key="cat"
            class="px-2 py-1 rounded-full bg-blue-500 text-white font-semibold flex items-center gap-1"
          >
            {{ cat.length > 60 ? cat.slice(0, 60) + "…" : cat }}
            <button
              class="ml-1 text-white bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs"
              @click="removeCategory(cat)"
              type="button"
              aria-label="Usuń"
            >
              ×
            </button>
          </span>
        </div>
        <div class="flex items-center gap-4">
          <label class="font-medium text-gray-700">Czas egzaminu (min):</label>
          <input
            type="range"
            min="10"
            max="120"
            step="1"
            v-model="examDuration"
            class="w-full accent-purple-500"
          />
          <span
            class="text-xl font-bold text-purple-700 min-w-[48px] text-center"
          >
            {{ examDuration }}
          </span>
        </div>
        <!-- Przyciski Quiz/Egzamin i suwak czasu -->
        <div class="flex flex-col gap-3">
          <label class="block text-gray-700 font-medium"
            >Rozpocznij jako:</label
          >
          <div class="flex gap-4">
            <BaseButton
              color="blue"
              size="xl"
              class="w-full text-xl font-semibold shadow"
              @click="startQuiz"
              :aria-label="'Rozpocznij Quiz'"
            >
              Quiz
            </BaseButton>
            <BaseButton
              color="purple"
              size="xl"
              class="w-full text-xl font-semibold shadow"
              @click="startExamFromQuiz"
              :aria-label="'Rozpocznij jako Egzamin'"
            >
              Egzamin
            </BaseButton>
          </div>
        </div>
        <!-- Popup z egzaminami -->
        <BaseModal :show="showExamPopup" @close="showExamPopup = false">
          <h3 class="text-lg font-bold mb-4">Wybierz kategorię egzaminu:</h3>
          <div class="grid grid-cols-2 gap-2">
            <BaseButton
              v-for="cat in examCategories"
              :key="cat"
              color="purple"
              class="w-full flex flex-col items-start"
              @click="startExamFromCategory(cat)"
            >
              <div class="flex w-full items-end justify-between">
                <!-- Pasek postępu -->
                <div class="flex-1 mr-2">
                  <div
                    v-if="
                      examStatsByCategory[cat] &&
                      examStatsByCategory[cat].total > 0
                    "
                    class="w-3/4 h-2 rounded bg-gray-200 my-1 flex overflow-hidden"
                  >
                    <div
                      class="bg-green-400 h-2"
                      :style="{
                        width:
                          (examStatsByCategory[cat].correct /
                            examStatsByCategory[cat].total) *
                            100 +
                          '%',
                      }"
                    ></div>
                    <div
                      class="bg-red-400 h-2"
                      :style="{
                        width:
                          (examStatsByCategory[cat].wrong /
                            examStatsByCategory[cat].total) *
                            100 +
                          '%',
                      }"
                    ></div>
                  </div>
                </div>
                <!-- Statystyki i nazwa kategorii -->
                <div class="flex flex-col items-end min-w-[90px]">
                  <span class="font-bold">{{ cat }}</span>
                  <span
                    v-if="
                      examStatsByCategory[cat] &&
                      examStatsByCategory[cat].total > 0
                    "
                    class="mt-1"
                  >
                    <span class="text-green-700 font-semibold">{{
                      examStatsByCategory[cat].correct
                    }}</span
                    >/<span class="text-red-700 font-semibold">{{
                      examStatsByCategory[cat].wrong
                    }}</span
                    >/<span class="text-gray-700 font-semibold">{{
                      examStatsByCategory[cat].total
                    }}</span>
                  </span>
                  <span v-else class="text-xs mt-1">Brak historii</span>
                </div>
              </div>
            </BaseButton>
          </div>
        </BaseModal>
        <BaseAlert
          v-if="quizAlert"
          :message="quizAlert"
          type="error"
          :show="!!quizAlert"
          class="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md"
          @close="quizAlert = ''"
        />
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
        <div class="flex flex-col justify-center mt-2 mx-auto gap-2">
          <h2 class="text-lg font-semibold mb-2">
            Przeglądaj pytania wg kategorii:
          </h2>
          <BaseButton
            color="blue"
            class="mb-2"
            v-if="examCategories.length"
            @click="showCategoryPopup = 'exam'"
          >
            Kategorie zawierające „egzamin”
          </BaseButton>
          <BaseButton
            color="gray"
            v-if="otherCategories.length"
            @click="showCategoryPopup = 'other'"
          >
            Pozostałe kategorie
          </BaseButton>
        </div>
        <!-- Popup z kategoriami -->
        <BaseModal
          :show="!!showCategoryPopup"
          @close="showCategoryPopup = false"
        >
          <div v-if="showCategoryPopup === 'exam'">
            <h3 class="text-lg font-bold mb-2">Kategorie z „egzamin”:</h3>
            <ul class="flex flex-row flex-wrap gap-2">
              <li v-for="cat in examCategories" :key="cat" class="mb-2">
                <BaseButton color="blue" @click="goToCategoryFromPopup(cat)">
                  {{ cat }}
                </BaseButton>
              </li>
            </ul>
          </div>
          <div v-else-if="showCategoryPopup === 'other'">
            <h3 class="text-lg font-bold mb-2">Pozostałe kategorie:</h3>
            <ul class="flex flex-row flex-wrap gap-2">
              <li v-for="cat in otherCategories" :key="cat" class="mb-2">
                <BaseButton color="gray" @click="goToCategoryFromPopup(cat)">
                  {{ cat }}
                </BaseButton>
              </li>
            </ul>
          </div>
        </BaseModal>
      </div>
    </div>
  </div>
</template>

<script>
import RandomQuote from "@/components/RandomQuote.vue";
import BaseButton from "@/components/BaseButton.vue";
import BaseAlert from "@/components/BaseAlert.vue";
import BaseLoader from "@/components/BaseLoader.vue";
import BaseModal from "@/components/BaseModal.vue";
import axios from "axios";

export default {
  name: "Home",
  components: {
    RandomQuote,
    BaseButton,
    BaseAlert,
    BaseLoader,
    BaseModal,
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
      loading: false,
      error: "",
      categoryCounts: {},
      selectedCategoryToAdd: "",
      quizAlert: "",
      showCategoryPopup: false,
      showExamPopup: false,
      userHistory: [],
      examDuration: 30,
    };
  },
  computed: {
    selectedCategoriesCount() {
      if (
        this.selectedCategories.length === 1 &&
        this.selectedCategories[0] === "all"
      ) {
        return this.questionsCount;
      }
      return this.selectedCategories.reduce(
        (sum, cat) => sum + (this.categoryCounts[cat] || 0),
        0
      );
    },
    isTooFewQuestions() {
      return this.selectedLength > this.selectedCategoriesCount;
    },
    examCategories() {
      return this.categories.filter(
        (cat) => cat && cat.toLowerCase().includes("egzamin")
      );
    },
    otherCategories() {
      return this.categories.filter(
        (cat) => !cat.toLowerCase().includes("egzamin")
      );
    },
    examStatsByCategory() {
      if (!this.userHistory || !this.userHistory.length) return {};
      const stats = {};
      for (const cat of this.examCategories) {
        // Szukaj po polu categories
        const last = [...this.userHistory]
          .reverse()
          .find(
            (entry) =>
              (entry.type === "quiz" || entry.type === "egzamin") &&
              entry.categories &&
              entry.categories.some(
                (c) => c && c.toLowerCase() === cat.toLowerCase()
              )
          );
        if (last) {
          stats[cat] = {
            correct: last.correct || 0,
            wrong: last.wrong || 0,
            total: (last.correct || 0) + (last.wrong || 0),
          };
        } else {
          stats[cat] = { correct: 0, wrong: 0, total: 0 };
        }
      }
      return stats;
    },
  },
  created() {
    this.fetchCategoriesAndStats();
    let categories = this.$route.query.categories || "all";
    if (categories === "all") {
      categories = ["all"];
    } else if (typeof categories === "string") {
      categories = categories.split(",");
    }
    this.selectedCategories = categories;
  },
  methods: {
    async fetchCategoriesAndStats() {
      this.loading = true;
      try {
        const res = await axios.get("/api/questions");
        // Po pobraniu pytań:
        const questions = res.data;
        this.categories = [
          ...new Set(questions.map((q) => q.category).filter(Boolean)),
        ];

        // Liczba pytań w każdej kategorii
        this.categoryCounts = {};
        for (const cat of this.categories) {
          this.categoryCounts[cat] = questions.filter(
            (q) => q.category === cat
          ).length;
        }
        // Liczba wszystkich pytań
        this.categoryCounts["all"] = questions.length;

        this.questionsCount = questions.length;

        // Pobierz historię użytkownika
        try {
          const token = localStorage.getItem("token");
          const historyRes = await axios.get("/api/users/history", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const history = historyRes.data || [];
          this.userHistory = history;

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
                  ((h.correct || 0) /
                    ((h.correct || 0) + (h.wrong || 0) || 1)) *
                  100;
              }
              if (h.type === "egzamin") {
                acc.exam.total++;
                acc.exam.correct += h.correct || 0;
                acc.exam.wrong += h.wrong || 0;
                acc.exam.sumScore +=
                  ((h.correct || 0) /
                    ((h.correct || 0) + (h.wrong || 0) || 1)) *
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
      } catch (e) {
        this.error = "Błąd ładowania danych";
      }
      this.loading = false;
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
    addCategoryOnSelect() {
      if (
        this.selectedCategoryToAdd &&
        !this.selectedCategories.includes(this.selectedCategoryToAdd)
      ) {
        if (this.selectedCategories.includes("all")) {
          this.selectedCategories = [];
        }
        this.selectedCategories.push(this.selectedCategoryToAdd);
      }
      this.selectedCategoryToAdd = "";
    },
    removeCategory(cat) {
      this.selectedCategories = this.selectedCategories.filter(
        (c) => c !== cat
      );
      if (this.selectedCategories.length === 0) {
        this.selectedCategories = ["all"];
      }
    },
    startQuiz() {
      if (this.isTooFewQuestions) {
        this.quizAlert =
          "Nie można rozpocząć quizu: wybrano więcej pytań niż jest dostępnych w wybranych kategoriach.";
        return;
      }
      this.$router.push({
        name: "QuizView",
        query: {
          length: this.selectedLength,
          categories:
            this.selectedCategories.length === 1 &&
            this.selectedCategories[0] === "all"
              ? "all"
              : this.selectedCategories.join(","),
        },
      });
    },
    goToCategory(event) {
      const cat = event.target.value;
      if (cat) {
        this.$router.push({
          name: "CategoryQuestions",
          params: { category: cat },
        });
      }
    },
    goToCategoryFromPopup(cat) {
      this.showCategoryPopup = false;
      this.$router.push({
        name: "CategoryQuestions",
        params: { category: cat },
      });
    },
    startExamFromCategory(cat) {
      this.showExamPopup = false;
      // Maksymalna liczba pytań z tej kategorii
      const max = this.categoryCounts[cat] || 10;
      this.$router.push({
        name: "QuizView",
        query: {
          length: max,
          categories: cat,
          exam: true,
        },
      });
    },
    startExamFromQuiz() {
      if (this.isTooFewQuestions) {
        this.quizAlert =
          "Nie można rozpocząć egzaminu: wybrano więcej pytań niż jest dostępnych w wybranych kategoriach.";
        return;
      }
      this.$router.push({
        name: "ExamView",
        query: {
          length: this.selectedLength,
          categories:
            this.selectedCategories.length === 1 &&
            this.selectedCategories[0] === "all"
              ? "all"
              : this.selectedCategories.join(","),
          time: this.examDuration,
        },
      });
    },
  },
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  padding: 2rem;
}
</style>
