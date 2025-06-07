<template>
  <div class="container mx-auto p-2 sm:p-6">
    <div
      class="flex flex-col sm:flex-row justify-between items-center gap-2 mb-4"
    >
      <h1 class="text-2xl font-bold mb-2 sm:mb-0">
        Pytania z kategorii:
        <span class="text-blue-700">{{ categoryLabel }}</span>
      </h1>
      <SearchBar v-model:search="searchQuery" class="w-full sm:w-80" />
    </div>
    <div v-if="loading" class="text-lg">Ładowanie pytań...</div>
    <div v-else>
      <div v-if="filteredQuestions.length === 0" class="text-gray-500">
        Brak pytań w tej kategorii.
      </div>
      <!-- MOBILE: zwijane pytania -->
      <!-- <ul v-else class="space-y-6 sm:hidden">
        <li
          v-for="q in visibleQuestions"
          :key="q.ID"
          class="bg-white rounded-lg shadow border"
        >
          <div
            class="flex justify-between items-center px-4 py-2 cursor-pointer"
            @click="toggleRow(q.ID)"
          >
            <div>
              <span class="text-gray-500 font-bold">ID: {{ q.ID }}</span>
              <span class="ml-2">{{ q.question }}</span>
            </div>
            <svg
              :class="[
                'w-6 h-6 transition-transform',
                { 'rotate-180': expandedRows.includes(q.ID) },
              ]"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          <div v-if="expandedRows.includes(q.ID)" class="px-4 pb-4">
            <div class="mb-2 text-gray-700">
              <span class="font-bold">A:</span>
              {{ q.answer_a && q.answer_a.answer }}
              <span
                v-if="q.answer_a && q.answer_a.isCorret"
                class="text-green-600 font-bold ml-2"
                >(poprawna)</span
              >
            </div>
            <div class="mb-2 text-gray-700">
              <span class="font-bold">B:</span>
              {{ q.answer_b && q.answer_b.answer }}
              <span
                v-if="q.answer_b && q.answer_b.isCorret"
                class="text-green-600 font-bold ml-2"
                >(poprawna)</span
              >
            </div>
            <div class="mb-2 text-gray-700">
              <span class="font-bold">C:</span>
              {{ q.answer_c && q.answer_c.answer }}
              <span
                v-if="q.answer_c && q.answer_c.isCorret"
                class="text-green-600 font-bold ml-2"
                >(poprawna)</span
              >
            </div>
            <div v-if="q.answer_d" class="mb-2 text-gray-700">
              <span class="font-bold">D:</span>
              {{ q.answer_d && q.answer_d.answer }}
              <span
                v-if="q.answer_d && q.answer_d.isCorret"
                class="text-green-600 font-bold ml-2"
                >(poprawna)</span
              >
            </div>
            <div class="text-sm text-gray-500 mt-2">
              {{ q.description }}
            </div>
          </div>
        </li>
      </ul> -->
      <!-- DESKTOP: klasyczna lista -->
      <ul v-else class="space-y-6 hidden sm:block">
        <li
          v-for="q in visibleQuestions"
          :key="q.ID"
          class="bg-white rounded-lg shadow p-4 sm:p-6 border"
        >
          <div class="font-semibold text-base sm:text-lg mb-2 break-words">
            <span class="text-gray-500">ID: {{ q.ID }} -</span> {{ q.question }}
          </div>
          <div class="mb-2 text-gray-700">
            <span class="font-bold">A:</span>
            {{ q.answer_a && q.answer_a.answer }}
            <span
              v-if="q.answer_a && q.answer_a.isCorret"
              class="text-green-600 font-bold ml-2"
              >(poprawna)</span
            >
          </div>
          <div class="mb-2 text-gray-700">
            <span class="font-bold">B:</span>
            {{ q.answer_b && q.answer_b.answer }}
            <span
              v-if="q.answer_b && q.answer_b.isCorret"
              class="text-green-600 font-bold ml-2"
              >(poprawna)</span
            >
          </div>
          <div class="mb-2 text-gray-700">
            <span class="font-bold">C:</span>
            {{ q.answer_c && q.answer_c.answer }}
            <span
              v-if="q.answer_c && q.answer_c.isCorret"
              class="text-green-600 font-bold ml-2"
              >(poprawna)</span
            >
          </div>
          <div v-if="q.answer_d" class="mb-2 text-gray-700">
            <span class="font-bold">D:</span>
            {{ q.answer_d && q.answer_d.answer }}
            <span
              v-if="q.answer_d && q.answer_d.isCorret"
              class="text-green-600 font-bold ml-2"
              >(poprawna)</span
            >
          </div>
          <div class="text-sm text-gray-500 mt-2">
            {{ q.description }}
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import SearchBar from "@/components/SearchBar.vue";
export default {
  name: "CategoryQuestionsView",
  components: {
    SearchBar,
  },
  data() {
    return {
      questions: [],
      loading: true,
      searchQuery: "",
      displayCount: 100,
      loadingMore: false,
      expandedRows: [], // do obsługi zwijania na mobile
    };
  },
  computed: {
    category() {
      return this.$route.params.category;
    },
    categoryLabel() {
      return this.category === "all" ? "Wszystkie" : this.category;
    },
    filteredQuestions() {
      let questions =
        this.category === "all"
          ? this.questions
          : this.questions.filter((q) => q.category === this.category);
      if (!this.searchQuery) return questions;
      const q = this.searchQuery.toLowerCase();
      return questions.filter(
        (item) =>
          (item.ID && item.ID.toString().includes(q)) ||
          (item.question && item.question.toLowerCase().includes(q))
      );
    },
    visibleQuestions() {
      return this.filteredQuestions.slice(0, this.displayCount);
    },
    hasMoreQuestions() {
      return this.displayCount < this.filteredQuestions.length;
    },
  },
  async created() {
    const res = await axios.get("/api/questions");
    this.questions = res.data.filter((q) => q.question);
    this.loading = false;
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    handleScroll() {
      if (this.loadingMore || !this.hasMoreQuestions) return;
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      if (scrollY + windowHeight + 200 >= docHeight) {
        this.loadingMore = true;
        setTimeout(() => {
          this.displayCount += 100;
          this.loadingMore = false;
        }, 200);
      }
    },
    toggleRow(id) {
      const idx = this.expandedRows.indexOf(id);
      if (idx === -1) this.expandedRows.push(id);
      else this.expandedRows.splice(idx, 1);
    },
  },
};
</script>
