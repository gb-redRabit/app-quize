<template>
  <div class="container py-8">
    <div class="mx-auto px-4">
      <div class="flex flex-col sm:flex-row justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-200">Historia nauki</h1>
          <p class="text-gray-500 mt-1 dark:text-gray-400">
            Przeglądaj swoje wcześniejsze quizy i egzaminy
          </p>
        </div>
        <BaseButton
          v-if="history.length > 0"
          color="red"
          class="mt-4 sm:mt-0 rounded-full px-6"
          @click="showConfirmModal = true"
        >
          <span class="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Wyczyść historię
          </span>
        </BaseButton>
      </div>

      <div
        v-if="history.length > 0"
        class="mb-8 bg-white rounded-xl shadow-sm p-4 border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
      >
        <div class="flex flex-wrap gap-4 justify-between items-center">
          <div class="stats-summary">
            <div class="grid grid-cols-3 gap-3 text-center">
              <div
                class="p-2 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
              >
                <div class="text-2xl font-bold">{{ history.length }}</div>
                <div class="text-xs">Łącznie</div>
              </div>
              <div
                class="p-2 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-200"
              >
                <div class="text-2xl font-bold">{{ examCount }}</div>
                <div class="text-xs">Egzaminy</div>
              </div>
              <div
                class="p-2 rounded-lg bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200"
              >
                <div class="text-2xl font-bold">{{ quizCount }}</div>
                <div class="text-xs">Quizy</div>
              </div>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">Filtruj:</span>
            <button
              @click="activeFilter = 'all'"
              class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              :class="
                activeFilter === 'all'
                  ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
              "
            >
              Wszystkie
            </button>
            <button
              @click="activeFilter = 'quiz'"
              class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              :class="
                activeFilter === 'quiz'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
              "
            >
              Quizy
            </button>
            <button
              @click="activeFilter = 'exam'"
              class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              :class="
                activeFilter === 'exam'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
              "
            >
              Egzaminy
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="history.length === 0"
        class="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm p-12 border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-16 w-16 text-gray-300 mb-4 dark:text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300">Brak historii quizów</h2>
        <p class="text-gray-500 mt-2 text-center dark:text-gray-400">
          Ukończ swój pierwszy quiz lub egzamin, aby zobaczyć tutaj historię
        </p>
        <router-link
          to="/"
          class="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span>Rozpocznij naukę</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 ml-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </router-link>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="(entry, idx) in filteredHistory"
          :key="idx"
          class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 group hover:-translate-y-1 hover:shadow-md dark:bg-gray-800 dark:border-gray-700"
        >
          <div
            class="flex justify-between items-center p-3 border-b bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
          >
            <div
              class="text-xs font-medium px-2.5 py-1 rounded-full"
              :class="getBadgeClass(entry.type)"
            >
              {{ getTypeName(entry.type) }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(entry.data) }}
            </div>
          </div>

          <div class="flex items-center justify-between p-4">
            <div class="flex flex-col items-center mr-4">
              <div class="relative w-20 h-20">
                <svg class="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke-width="10"
                    stroke="#e5e7eb"
                    fill="transparent"
                    class="dark:stroke-gray-600"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke-width="10"
                    :stroke="entry.correct > entry.wrong ? '#22c55e' : '#ef4444'"
                    fill="transparent"
                    :stroke-dasharray="getCircumference()"
                    :stroke-dashoffset="getDashOffset(entry)"
                    class="transition-all duration-500 ease-in-out"
                  />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <div class="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {{ percentGood(entry) }}%
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-center mt-2 text-sm">
                <span class="text-green-600 font-semibold">{{ entry.correct || 0 }}</span>
                <span class="mx-1 text-gray-400">/</span>
                <span class="text-red-600 font-semibold">{{ entry.wrong || 0 }}</span>
              </div>
            </div>

            <div class="flex-1 ml-2">
              <div class="mb-2">
                <h3 class="font-medium text-gray-900 dark:text-gray-100">
                  {{ entry.category && entry.category[0] ? entry.category : 'Brak kategorii' }}
                </h3>
                <div class="text-xs text-gray-500 mt-1 dark:text-gray-400">
                  {{
                    entry.categories && entry.categories.length > 1
                      ? `+${entry.categories.length - 1} więcej kategorii`
                      : 'Pojedyncza kategoria'
                  }}
                </div>
              </div>

              <router-link
                :to="{ name: 'HistoryDetails', params: { id: entry.id || String(idx) } }"
                class="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <span>Pokaż szczegóły</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BaseModal :show="showConfirmModal" @close="showConfirmModal = false" class="rounded-xl">
      <div class="p-6 bg-white dark:bg-gray-800 rounded-xl">
        <div class="flex items-center justify-center mb-4 text-red-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-center mb-2 text-gray-800 dark:text-gray-200">
          Czy na pewno chcesz usunąć całą historię?
        </h2>
        <p class="text-gray-500 text-center mb-6 dark:text-gray-400">
          Tej operacji nie można cofnąć.
        </p>

        <div class="flex justify-center gap-4">
          <BaseButton color="gray" class="px-6 py-2 rounded-lg" @click="showConfirmModal = false">
            Anuluj
          </BaseButton>
          <BaseButton color="red" class="px-6 py-2 rounded-lg" @click="confirmClearHistory">
            <span class="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Tak, usuń historię
            </span>
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import BaseButton from '@/components/BaseButton.vue';
import BaseModal from '@/components/BaseModal.vue';
import apiClient from '@/api';

export default {
  name: 'History',
  components: { BaseButton, BaseModal },
  inject: ['showAlert', 'showLoader', 'hideLoader'],

  data() {
    return {
      showConfirmModal: false,
      activeFilter: 'all',
    };
  },
  computed: {
    ...mapGetters('user', ['getUserHistory']),
    history() {
      return this.getUserHistory || [];
    },
    filteredHistory() {
      if (this.activeFilter === 'all') {
        return this.history;
      } else if (this.activeFilter === 'quiz') {
        return this.history.filter(
          (item) => item.type === 'quiz' || item.type === 'Quiz - poprawa błędów'
        );
      } else if (this.activeFilter === 'exam') {
        return this.history.filter(
          (item) => item.type === 'egzamin' || item.type === 'Egzamin - poprawa błędów'
        );
      }
      return this.history;
    },
    quizCount() {
      return this.history.filter(
        (item) => item.type === 'quiz' || item.type === 'Quiz - poprawa błędów'
      ).length;
    },
    examCount() {
      return this.history.filter(
        (item) => item.type === 'egzamin' || item.type === 'Egzamin - poprawa błędów'
      ).length;
    },
  },
  methods: {
    ...mapActions('user', ['fetchUserHistory']),
    mounted() {
      this.showLoader('Pobieranie historii...');
      this.fetchUserHistory()
        .then(() => this.ensureHistoryIds())
        .catch(() => this.showAlert('error', 'Błąd podczas pobierania historii'))
        .finally(() => this.hideLoader());
    },
    // Dodane metody
    getBadgeClass(type) {
      if (type === 'quiz') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      if (type === 'egzamin')
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      if (type === 'Quiz - poprawa błędów')
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      if (type === 'Egzamin - poprawa błędów')
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    },

    getTypeName(type) {
      if (type === 'quiz') return 'Quiz';
      if (type === 'egzamin') return 'Egzamin';
      if (type === 'Quiz - poprawa błędów') return 'Quiz - poprawa';
      if (type === 'Egzamin - poprawa błędów') return 'Egzamin - poprawa';
      return type;
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },

    getCircumference() {
      const radius = 35;
      return 2 * Math.PI * radius;
    },

    getDashOffset(entry) {
      const circumference = this.getCircumference();
      const total = (entry.correct || 0) + (entry.wrong || 0);
      if (total === 0) return circumference;

      const percent = (entry.correct || 0) / total;
      return circumference * (1 - percent);
    },

    ensureHistoryIds() {
      const updatedHistory = [...this.history];

      updatedHistory.forEach((entry, index) => {
        entry.id = index; // id równe indeksowi w tablicy
      });

      this.$store.commit('user/SET_USER_HISTORY', updatedHistory);
    },

    percentGood(entry) {
      const total = (entry.correct || 0) + (entry.wrong || 0);
      if (!total) return 0;
      return Math.round(((entry.correct || 0) / total) * 100);
    },

    async confirmClearHistory() {
      try {
        this.showLoader('Czyszczenie historii...');
        await apiClient.put('/users/update-profile', { clearHistory: true });
        await this.fetchUserHistory(); // <-- pobierz historię po czyszczeniu
        this.hideLoader();
        this.showAlert('success', 'Historia została pomyślnie wyczyszczona');
        this.showConfirmModal = false;
      } catch (e) {
        this.hideLoader();
        this.showAlert('error', 'Błąd podczas czyszczenia historii.');
        this.showConfirmModal = false;
      }
    },
  },
  mounted() {
    this.showLoader('Pobieranie historii...');
    this.fetchUserHistory()
      .then(() => this.ensureHistoryIds())
      .catch(() => this.showAlert('error', 'Błąd podczas pobierania historii'))
      .finally(() => this.hideLoader());
  },
};
</script>

<style scoped>
/* These styles are converted and applied directly in the template.
   Keeping them here for reference or if any specific complex styling
   cannot be directly mapped to Tailwind classes. */
</style>
