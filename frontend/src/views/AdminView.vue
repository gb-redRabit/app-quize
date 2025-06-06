<template>
  <div class="container mx-auto p-4 bg-gray-100 min-h-screen">
    <h1 class="text-2xl font-bold mb-4">Admin Panel</h1>
    <div class="mb-4">
      <router-link
        to="/admin/add"
        class="bg-blue-500 text-white px-4 py-2 rounded"
        >Add Question</router-link
      >
    </div>
    <table class="min-w-full bg-white border border-gray-300">
      <thead>
        <tr>
          <th class="py-2 px-4 border-b">ID</th>
          <th class="py-2 px-4 border-b">Description</th>
          <th class="py-2 px-4 border-b">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="question in questions" :key="question.id">
          <td class="py-2 px-4 border-b">{{ question.id }}</td>
          <td class="py-2 px-4 border-b">{{ question.description }}</td>
          <td class="py-2 px-4 border-b">
            <router-link
              :to="`/admin/edit/${question.id}`"
              class="text-blue-500"
              >Edit</router-link
            >
            <button
              @click="deleteQuestion(question.id)"
              class="text-red-500 ml-2"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      questions: [],
    };
  },
  created() {
    this.fetchQuestions();
  },
  methods: {
    async fetchQuestions() {
      try {
        const response = await axios.get("/api/questions");
        this.questions = response.data;
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    },
    async deleteQuestion(id) {
      if (confirm("Are you sure you want to delete this question?")) {
        try {
          await axios.delete(`/api/questions/${id}`);
          this.fetchQuestions();
        } catch (error) {
          console.error("Error deleting question:", error);
        }
      }
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
}
</style>
