<template>
  <div class="container mx-auto p-4 md:flex md:flex-col md:justify-start md:items-center">
    <h1 class="text-2xl font-bold mb-4">Twoja historia quizów</h1>
    <BaseButton color="red" class="mb-4" @click="showConfirmModal = true" v-if="history.length > 0">
      Wyczyść historię
    </BaseButton>
    <div v-if="history.length === 0" class="text-gray-500">Brak historii quizów.</div>
    <div
      v-else
      class="space-y-6 md:space-y-0 md:flex md:flex-row md:flex-wrap md:gap-6 md:justify-center"
    >
      <div
        v-for="(entry, idx) in history"
        :key="entry.data"
        class="bg-white rounded-lg shadow md:flex md:flex-row md:w-96 md:items-center md:justify-between p-6"
      >
        <div class="flex flex-col items-center mr-8 sm:mr-auto">
          <svg width="70" height="70" viewBox="0 0 36 36" class="mb-2">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" stroke-width="6" />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              :stroke="entry.correct > entry.wrong ? '#22c55e' : '#ef4444'"
              stroke-width="6"
              :stroke-dasharray="pieGood(entry)"
              stroke-linecap="round"
              transform="rotate(-90 18 18)"
            />
            <text
              x="18"
              y="24"
              text-anchor="middle"
              font-size="14"
              fill="#374151"
              font-weight="bold"
            >
              {{ percentGood(entry) }}%
            </text>
          </svg>
          <div class="text-xs text-gray-600">
            <span class="text-green-600 font-bold">{{ entry.correct || 0 }}</span>
            /
            <span class="text-red-600 font-bold">{{ entry.wrong || 0 }}</span>
          </div>
        </div>
        <div
          class="flex flex-wrap justify-between gap-1 md:flex-nowrap md:flex-col md:items-end h-full"
        >
          <span
            class="inline-block px-3 py-1 rounded-full text-xs font-bold"
            :class="
              entry.type === 'egzamin'
                ? 'bg-purple-200 text-purple-800'
                : entry.type === 'Egzamin - poprawa błędów'
                  ? 'bg-yellow-200 text-yellow-800'
                  : entry.type === 'Quiz - poprawa błędów'
                    ? 'bg-yellow-100 text-yellow-900'
                    : 'bg-blue-200 text-blue-800'
            "
          >
            {{
              entry.type === 'egzamin'
                ? 'Egzamin'
                : entry.type === 'Egzamin - poprawa błędów'
                  ? 'Egzamin - poprawa błędów'
                  : entry.type === 'Quiz - poprawa błędów'
                    ? 'Quiz - poprawa błędów'
                    : 'Quiz'
            }}
          </span>
          <div class="font-semibold text-base">
            {{ new Date(entry.data).toLocaleString() }}
          </div>
          <router-link
            :to="{ name: 'HistoryDetails', params: { idx } }"
            class="bg-blue-500 hover:bg-blue-600 text-white m-auto px-4 py-2 rounded font-semibold mt-2 w-full md:w-auto md:m-0"
          >
            Pokaż szczegóły
          </router-link>
        </div>
      </div>
    </div>
    <BaseModal :show="showConfirmModal" @close="showConfirmModal = false">
      <div class="p-4 flex flex-col items-center">
        <h2 class="text-lg font-bold mb-2 text-red-700">
          Czy na pewno chcesz usunąć całą historię quizów?
        </h2>
        <div class="flex gap-4 mt-4">
          <BaseButton color="red" @click="confirmClearHistory">Tak, usuń</BaseButton>
          <BaseButton color="gray" @click="showConfirmModal = false">Anuluj</BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import BaseButton from '@/components/BaseButton.vue';
import BaseModal from '@/components/BaseModal.vue';
import apiClient from '@/api'; // <-- ZMIANA

export default {
  name: 'History',
  components: { BaseButton, BaseModal },
  data() {
    return {
      showConfirmModal: false,
    };
  },
  computed: {
    ...mapGetters('user', ['getUserHistory']),
    history() {
      return this.getUserHistory || [];
    },
  },
  methods: {
    ...mapActions('user', ['fetchUserHistory']),
    percentGood(entry) {
      const total = (entry.correct || 0) + (entry.wrong || 0);
      if (!total) return 0;
      return Math.round(((entry.correct || 0) / total) * 100);
    },
    pieGood(entry) {
      const percent = this.percentGood(entry);
      return `${percent} ${100 - percent}`;
    },
    async confirmClearHistory() {
      try {
        await apiClient.put('/users/update', { clearHistory: true }); // <-- ZMIANA
        await this.fetchUserHistory();
        this.showConfirmModal = false;
      } catch (e) {
        alert('Błąd podczas czyszczenia historii.');
        this.showConfirmModal = false;
      }
    },
  },
  async created() {
    if (!this.history.length) {
      await this.fetchUserHistory();
    }
  },
};
</script>

<style scoped></style>
