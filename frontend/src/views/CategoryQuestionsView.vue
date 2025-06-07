<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">
      Pytania z kategorii:
      <span class="text-blue-700">{{ categoryLabel }}</span>
    </h1>
    <div v-if="loading" class="text-lg">Ładowanie pytań...</div>
    <div v-else>
      <div v-if="filteredQuestions.length === 0" class="text-gray-500">
        Brak pytań w tej kategorii.
      </div>
      <ul v-else class="space-y-6">
        <li
          v-for="q in filteredQuestions"
          :key="q.ID"
          class="bg-white rounded-lg shadow p-6 border"
        >
          <div class="font-semibold text-lg mb-2">{{ q.question }}</div>
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
export default {
  name: "CategoryQuestionsView",
  data() {
    return {
      questions: [],
      loading: true,
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
      if (this.category === "all") return this.questions;
      return this.questions.filter((q) => q.category === this.category);
    },
  },
  async created() {
    const res = await axios.get("/api/questions");
    this.questions = res.data.filter((q) => q.question);
    this.loading = false;
  },
};
</script>
