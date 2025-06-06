<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Your Quiz History</h1>
    <div v-if="history.length === 0" class="text-gray-500">
      No quiz history available.
    </div>
    <ul v-else class="space-y-4">
      <li
        v-for="entry in history"
        :key="entry.data"
        class="border p-4 rounded-lg shadow"
      >
        <h2 class="font-semibold">
          Data: {{ new Date(entry.data).toLocaleString() }}
          <span class="ml-2 px-2 py-1 rounded text-xs">{{
            entry.type === "egzamin" ? "Egzamin" : "Quiz"
          }}</span>
        </h2>
        <div>
          <span class="text-green-600 font-bold"
            >Poprawnych: {{ entry.correct || 0 }}</span
          >
          <span class="ml-4 text-red-600 font-bold"
            >Błędnych: {{ entry.wrong || 0 }}</span
          >
        </div>
        <ul class="mt-2">
          <li v-for="item in entry.list" :key="item.id_questions">
            Question ID: {{ item.id_questions }} - Answer: {{ item.answer }}
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "History",
  computed: {
    ...mapState(["user"]),
    history() {
      return this.user.history || [];
    },
  },
  methods: {
    ...mapActions(["fetchUserHistory"]),
  },
  async created() {
    await this.fetchUserHistory();
  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
}
</style>
