<template>
  <div class="container flex flex-col items-center justify-start min-h-screen">
    <BaseLoader :show="loading" />

    <section class="w-full py-6 px-2 sm:px-0">
      <div class="mx-auto flex flex-col gap-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <!-- LEWA KOLUMNA: PYTANIA -->
          <div
            class="bg-white rounded-lg shadow border border-gray-200 p-4 flex flex-col gap-4"
          >
            <div class="grid grid-cols-2 gap-3">
              <div class="stat-tile-min col-span-2">
                <span class="stat-value-min text-blue-800">{{
                  questionsCount
                }}</span>
                <span class="stat-label-min">Wszystkich</span>
              </div>
              <div class="stat-tile-min">
                <span class="stat-value-min text-green-700">{{
                  hqStats.correct
                }}</span>
                <span class="stat-label-min">Poprawnie</span>
              </div>
              <div class="stat-tile-min">
                <span class="stat-value-min text-red-600">{{
                  hqStats.wrong
                }}</span>
                <span class="stat-label-min">Błędnie</span>
              </div>
              <div class="stat-tile-min col-span-2">
                <span class="stat-value-min text-gray-700">{{
                  hqStats.notDone
                }}</span>
                <span class="stat-label-min">Nie przerobione</span>
              </div>
            </div>
          </div>
          <!-- PRAWA KOLUMNA: QUIZY, EGZAMINY, POPRAWKI, ŚREDNIE -->
          <div
            class="bg-white rounded-lg shadow border border-gray-200 p-4 flex flex-col gap-4"
          >
            <div class="grid grid-cols-2 gap-3">
              <div class="stat-tile-min">
                <span class="stat-label-min">Quizy</span>
                <span class="stat-value-min text-blue-900">{{
                  historyStats.quizCount
                }}</span>
              </div>
              <div class="stat-tile-min">
                <span class="stat-label-min">Egzaminy</span>
                <span class="stat-value-min text-blue-900">{{
                  historyStats.examCount
                }}</span>
              </div>
              <div class="stat-tile-min">
                <span class="stat-label-min">Poprawki</span>
                <span class="stat-value-min text-gray-700">{{
                  historyStats.corrections
                }}</span>
              </div>
              <div class="stat-tile-min">
                <span class="stat-label-min">Śr. quizy+egz.</span>
                <span class="stat-value-min text-green-800"
                  >{{ historyStats.avg }}%</span
                >
              </div>
              <div class="stat-tile-min">
                <span class="stat-label-min">Śr. quizy.</span>
                <span class="stat-value-min text-green-800"
                  >{{ historyStats.quizAvg }}%</span
                >
              </div>
              <div class="stat-tile-min">
                <span class="stat-label-min">Śr. egzaminy</span>
                <span class="stat-value-min text-green-800"
                  >{{ historyStats.examAvg }}%</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Reszta kodu (przyciski, popupy, cytat) -->
    <div class="flex flex-row justify-center gap-4 mb-2 w-full">
      <BaseButton
        color="blue"
        size="lg"
        class="font-semibold shadow w-1/2"
        @click="showExamPopup = true"
        :aria-label="'Rozpocznij Egzamin'"
      >
        Rozpocznij Egzamin z ubiegłych lat
      </BaseButton>
      <BaseButton
        color="blue"
        size="lg"
        class="font-semibold shadow w-1/2"
        @click="showOtherQuizPopup = true"
      >
        Rozpocznij Quiz z pozostałych kategorii
      </BaseButton>
    </div>
    <RandomQuote />

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
                  examStatsByCategory[cat] && examStatsByCategory[cat].total > 0
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
                  examStatsByCategory[cat] && examStatsByCategory[cat].total > 0
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

    <!-- Popup z innymi quizami -->
    <BaseModal :show="showOtherQuizPopup" @close="showOtherQuizPopup = false">
      <h3 class="text-lg font-bold mb-4">Wybierz kategorię quizu:</h3>
      <div class="grid grid-cols-2 gap-2">
        <BaseButton
          v-for="cat in otherCategories"
          :key="cat"
          color="blue"
          class="w-full flex flex-col items-start"
          @click="startQuizFromCategory(cat)"
        >
          <div class="flex w-full items-end justify-between">
            <!-- Pasek postępu -->
            <div class="flex-1 mr-2">
              <div
                v-if="
                  quizStatsByCategory[cat] && quizStatsByCategory[cat].total > 0
                "
                class="w-3/4 h-2 rounded bg-gray-200 my-1 flex overflow-hidden"
              >
                <div
                  class="bg-green-400 h-2"
                  :style="{
                    width:
                      (quizStatsByCategory[cat].correct /
                        quizStatsByCategory[cat].total) *
                        100 +
                      '%',
                  }"
                ></div>
                <div
                  class="bg-red-400 h-2"
                  :style="{
                    width:
                      (quizStatsByCategory[cat].wrong /
                        quizStatsByCategory[cat].total) *
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
                  quizStatsByCategory[cat] && quizStatsByCategory[cat].total > 0
                "
                class="mt-1"
              >
                <span class="text-green-700 font-semibold">{{
                  quizStatsByCategory[cat].correct
                }}</span
                >/<span class="text-red-700 font-semibold">{{
                  quizStatsByCategory[cat].wrong
                }}</span
                >/<span class="text-gray-700 font-semibold">{{
                  quizStatsByCategory[cat].total
                }}</span>
              </span>
              <span v-else class="text-xs mt-1">Brak historii</span>
            </div>
          </div>
        </BaseButton>
      </div>
    </BaseModal>

    <!-- DODANY DIV Z KATEGORIAMI I STATYSTYKAMI NA DOLE -->
    <div class="w-full mx-auto mt-10 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="cat in categories"
          :key="cat"
          class="bg-white rounded-lg shadow border border-gray-200 mb-4 p-4 flex flex-col gap-4"
          :class="{
            'bg-green-100': categoryStats(cat).correct === categoryCounts[cat],
            'bg-red-100': categoryStats(cat).wrong === categoryCounts[cat],
          }"
        >
          <!-- NAZWA KATEGORII WYŚRODKOWANA -->
          <div class="text-center font-semibold text-blue-700 text-lg mb-2">
            {{ cat }}
          </div>
          <!-- Pasek postępu + statystyki w jednej linii -->
          <div class="flex items-center w-full gap-2">
            <div class="flex-1">
              <div class="w-full h-4 rounded bg-gray-200 flex overflow-hidden">
                <div
                  class="bg-green-400 h-4"
                  :style="{
                    width: categoryCounts[cat]
                      ? (
                          (categoryStats(cat).correct / categoryCounts[cat]) *
                          100
                        ).toFixed(1) + '%'
                      : '0%',
                  }"
                ></div>
                <div
                  class="bg-red-400 h-4"
                  :style="{
                    width: categoryCounts[cat]
                      ? (
                          (categoryStats(cat).wrong / categoryCounts[cat]) *
                          100
                        ).toFixed(1) + '%'
                      : '0%',
                  }"
                ></div>
                <div
                  class="bg-gray-400 h-4"
                  :style="{
                    width: categoryCounts[cat]
                      ? (
                          (categoryStats(cat).notDone / categoryCounts[cat]) *
                          100
                        ).toFixed(1) + '%'
                      : '0%',
                  }"
                ></div>
              </div>
            </div>
            <div
              class="flex gap-1 min-w-[120px] justify-end text-base font-bold ml-2"
            >
              <span class="text-green-700" :title="'Poprawnie'">
                {{ categoryStats(cat).correct }}
              </span>
              <span>/</span>
              <span class="text-red-700" :title="'Błędnie'">
                {{ categoryStats(cat).wrong }}
              </span>
              <span>/</span>
              <span class="text-gray-700" :title="'Nie przerobione'">
                {{ categoryStats(cat).notDone }}
              </span>
              <span>/</span>
              <span class="text-blue-700" :title="'Wszystkich pytań'">
                {{ categoryCounts[cat] || 0 }}
              </span>
            </div>
          </div>
          <!-- Przyciski w jednym rzędzie, równa szerokość -->
          <div class="flex flex-row gap-2 mt-2">
            <BaseButton
              color="blue"
              size="sm"
              class="flex-1"
              @click="goToCategoryQuestions(cat)"
            >
              Pytania
            </BaseButton>
            <BaseButton
              color="green"
              size="sm"
              class="flex-1"
              :disabled="
                categoryStats(cat).notDone === 0 &&
                categoryStats(cat).wrong === 0
              "
              @click="startQuizNotDone(cat)"
            >
              Quiz
            </BaseButton>
            <BaseButton
              color="purple"
              size="sm"
              class="flex-1"
              :disabled="
                categoryStats(cat).notDone === 0 &&
                categoryStats(cat).wrong === 0
              "
              @click="startExamNotDone(cat)"
            >
              Egzamin
            </BaseButton>
            <BaseButton
              color="red"
              size="sm"
              class="flex-1"
              @click="clearCategoryHistory(cat)"
            >
              Wyczyść
            </BaseButton>
          </div>
        </div>
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
      quizAlert: "",
      showExamPopup: false,
      userHistory: [],
      showOtherQuizPopup: false,
      hquestion: [],
    };
  },
  computed: {
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
    quizStatsByCategory() {
      if (!this.userHistory || !this.userHistory.length) return {};
      const stats = {};
      for (const cat of this.otherCategories) {
        const last = [...this.userHistory]
          .reverse()
          .find(
            (entry) =>
              entry.type === "quiz" &&
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
    hqStats() {
      const done = this.hquestion.length;
      const correct = this.hquestion.filter((q) => q.correct === true).length;
      const wrong = this.hquestion.filter((q) => q.correct === false).length;
      const notDone = this.questionsCount - done;
      return { done, correct, wrong, notDone: notDone < 0 ? 0 : notDone };
    },
    historyStats() {
      // quizy i egzaminy bez poprawek
      const onlyMain = this.userHistory.filter(
        (h) => h.type === "quiz" || h.type === "egzamin"
      );
      // quizy poprawkowe
      const quizCorrections = this.userHistory.filter(
        (h) => h.type && h.type.toLowerCase().includes("quiz - poprawa")
      );
      // egzaminy poprawkowe
      const examCorrections = this.userHistory.filter(
        (h) => h.type && h.type.toLowerCase().includes("egzamin - poprawa")
      );
      // wszystkie poprawki
      const allCorrections = quizCorrections.length + examCorrections.length;

      // liczby
      const quizCount = this.userHistory.filter(
        (h) => h.type === "quiz"
      ).length;
      const examCount = this.userHistory.filter(
        (h) => h.type === "egzamin"
      ).length;

      // średnia quizy+egzaminy (bez poprawek)
      let avg = 0;
      if (onlyMain.length) {
        const sum = onlyMain.reduce((acc, h) => {
          const total = (h.correct || 0) + (h.wrong || 0);
          if (total > 0) {
            acc += Math.round(((h.correct || 0) / total) * 100);
          }
          return acc;
        }, 0);
        avg = Math.round(sum / onlyMain.length);
      }

      // średnia quizy
      const quizArr = this.userHistory.filter((h) => h.type === "quiz");
      let quizAvg = 0;
      if (quizArr.length) {
        const sum = quizArr.reduce((acc, h) => {
          const total = (h.correct || 0) + (h.wrong || 0);
          if (total > 0) {
            acc += Math.round(((h.correct || 0) / total) * 100);
          }
          return acc;
        }, 0);
        quizAvg = Math.round(sum / quizArr.length);
      }

      // średnia egzaminy
      const examArr = this.userHistory.filter((h) => h.type === "egzamin");
      let examAvg = 0;
      if (examArr.length) {
        const sum = examArr.reduce((acc, h) => {
          const total = (h.correct || 0) + (h.wrong || 0);
          if (total > 0) {
            acc += Math.round(((h.correct || 0) / total) * 100);
          }
          return acc;
        }, 0);
        examAvg = Math.round(sum / examArr.length);
      }

      return {
        quizCount,
        examCount,
        corrections: allCorrections,
        avg,
        quizAvg,
        examAvg,
      };
    },
  },
  created() {
    this.fetchCategoriesAndStats();
  },
  methods: {
    async fetchCategoriesAndStats() {
      this.loading = true;
      try {
        const res = await axios.get("/api/questions");
        const questions = res.data;
        this.categories = [
          ...new Set(questions.map((q) => q.category).filter(Boolean)),
        ];
        this.categoryCounts = {};
        for (const cat of this.categories) {
          this.categoryCounts[cat] = questions.filter(
            (q) => q.category === cat
          ).length;
        }
        this.categoryCounts["all"] = questions.length;
        this.questionsCount = questions.length;
        try {
          const token = sessionStorage.getItem("token");
          const historyRes = await axios.get("/api/users/history", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const history = historyRes.data || [];
          this.userHistory = history;
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
          this.stats = {
            totalTests: 0,
            avgScore: 0,
            correct: 0,
            wrong: 0,
            quiz: { total: 0, avg: 0, correct: 0, wrong: 0 },
            exam: { total: 0, avg: 0, correct: 0, wrong: 0 },
          };
        }
        // POBIERZ hquestion
        const token = sessionStorage.getItem("token");
        const meRes = await axios.get("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.hquestion =
          meRes.data && meRes.data.hquestion ? meRes.data.hquestion : [];
      } catch (e) {
        this.error = "Błąd ładowania danych";
      }
      this.loading = false;
    },
    startExamFromCategory(cat) {
      this.showExamPopup = false;
      const max = this.categoryCounts[cat] || 10;
      this.$router.push({
        name: "QuizView", // <-- tu zmiana!
        query: {
          length: max,
          categories: cat,
        },
      });
    },
    startQuizFromCategory(cat) {
      this.showOtherQuizPopup = false;
      const max = this.categoryCounts[cat] || 10;
      this.$router.push({
        name: "QuizView",
        query: {
          length: 150,
          categories: cat,
        },
      });
    },
    categoryStats(cat) {
      const all = this.hquestion.filter((q) => q.category === cat);
      const correct = all.filter((q) => q.correct === true).length;
      const wrong = all.filter((q) => q.correct === false).length;
      const total = this.categoryCounts[cat] || 0;
      const notDone = total - all.length;
      return {
        correct,
        wrong,
        notDone: notDone < 0 ? 0 : notDone,
      };
    },
    goToCategoryQuestions(cat) {
      this.$router.push({
        name: "CategoryQuestions",
        params: { category: cat },
      });
    },
    async startQuizNotDone(cat) {
      // Pobierz wszystkie pytania z danej kategorii
      const res = await axios.get("/api/questions");
      const questions = res.data.filter((q) => q.category === cat);
      const allIds = questions.map(
        (q) => q.ID || q.id || q.Id || q.id_question
      );

      // Pobierz ID pytań przerobionych błędnie lub nieprzerobionych
      const hq = this.hquestion.filter((q) => q.category === cat);
      const wrongOrNotDoneIds = allIds.filter((id) => {
        const entry = hq.find((q) => q.id == id);
        return !entry || entry.correct === false;
      });

      const length = Math.min(150, wrongOrNotDoneIds.length);
      this.$router.push({
        name: "QuizView",
        query: {
          length,
          categories: cat,
          onlyNotDone: true,
          ids: wrongOrNotDoneIds.join(","),
        },
      });
    },
    async startExamNotDone(cat) {
      // Pobierz wszystkie pytania z danej kategorii
      const res = await axios.get("/api/questions");
      const questions = res.data.filter((q) => q.category === cat);
      const allIds = questions.map(
        (q) => q.ID || q.id || q.Id || q.id_question
      );

      // Pobierz ID pytań przerobionych błędnie lub nieprzerobionych
      const hq = this.hquestion.filter((q) => q.category === cat);
      const wrongOrNotDoneIds = allIds.filter((id) => {
        const entry = hq.find((q) => q.id == id);
        return !entry || entry.correct === false;
      });

      const length = Math.min(150, wrongOrNotDoneIds.length);
      this.$router.push({
        name: "ExamView", // <-- tu zmiana!
        query: {
          length,
          categories: cat,
          time: 60,
          onlyNotDone: true,
          ids: wrongOrNotDoneIds.join(","),
        },
      });
    },
    async clearCategoryHistory(cat) {
      try {
        const token = sessionStorage.getItem("token");
        await axios.put(
          "/api/users/clear-category",
          { category: cat },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await this.fetchCategoriesAndStats();
      } catch (e) {
        alert("Błąd podczas czyszczenia pytań z kategorii.");
      }
    },
  },
};
</script>

<style scoped>
.stat-tile {
  @apply rounded-xl p-6 flex flex-col items-center shadow border transition-all duration-200 bg-opacity-90;
  min-height: 100px;
  background-clip: padding-box;
}
.stat-value {
  @apply text-3xl font-extrabold mb-1 drop-shadow;
}
.stat-label {
  @apply text-base font-semibold tracking-wide;
}
.stat-tile-min {
  @apply flex flex-col items-center justify-center border border-gray-100 rounded h-20 bg-gray-50;
  min-height: 80px;
}
.stat-value-min {
  @apply text-xl font-bold;
}
.stat-label-min {
  @apply text-xs text-gray-500;
}
</style>
