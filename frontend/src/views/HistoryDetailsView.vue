<template>
  <div class="container mx-auto p-4 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
    <div
      v-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-800 dark:border-red-700 dark:text-red-100"
    >
      <p class="font-bold">{{ error }}</p>
      <router-link
        to="/history"
        class="text-blue-600 hover:text-blue-800 mt-2 inline-block dark:text-blue-400 dark:hover:text-blue-300"
      >
        &larr; Wróć do historii
      </router-link>
    </div>

    <div v-else-if="loading" class="text-center py-10 text-gray-700 dark:text-gray-300">
      <p>Ładowanie szczegółów historii...</p>
    </div>

    <div v-else-if="historyEntry">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Szczegóły historii</h1>
        <router-link
          to="/history"
          class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          &larr; Wróć do historii
        </router-link>
      </div>

      <div class="bg-white shadow-md rounded-lg p-6 mb-6 dark:bg-gray-800 dark:shadow-lg">
        <div class="grid md:grid-cols-3 gap-4">
          <div>
            <span class="text-gray-500 block text-sm dark:text-gray-400">Data:</span>
            <span class="font-medium text-gray-900 dark:text-gray-100">{{
              formatDate(historyEntry.data)
            }}</span>
          </div>
          <div>
            <span class="text-gray-500 block text-sm dark:text-gray-400">Typ:</span>
            <span
              class="inline-block px-3 py-1 rounded-full text-xs font-bold"
              :class="typeClasses"
            >
              {{ historyEntry.type === 'egzamin' ? 'Egzamin' : 'Quiz' }}
            </span>
          </div>
          <div>
            <span class="text-gray-500 block text-sm dark:text-gray-400">Wynik:</span>
            <span class="font-medium text-gray-900 dark:text-gray-100">
              {{ historyEntry.correct || 0 }} /
              {{ (historyEntry.correct || 0) + (historyEntry.wrong || 0) }} ({{
                calculatePercentage(historyEntry.correct, historyEntry.wrong)
              }}%)
            </span>
          </div>
        </div>
      </div>

      <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Odpowiedzi:</h2>

      <div v-if="!entryList.length" class="text-center text-gray-500 my-8 dark:text-gray-400">
        <p>Ten wpis nie zawiera żadnych odpowiedzi.</p>
      </div>

      <ul v-else class="space-y-4">
        <li
          v-for="(item, index) in entryList"
          :key="index"
          class="p-4 bg-white rounded-lg shadow-md border-l-4 dark:bg-gray-800 dark:shadow-lg"
          :class="
            isAnswerCorrect(item)
              ? 'border-green-500 dark:border-green-600'
              : 'border-red-500 dark:border-red-600'
          "
        >
          <div class="flex justify-between mb-2">
            <span class="font-semibold text-gray-700 dark:text-gray-300"
              >Pytanie {{ index + 1 }}</span
            >
            <span class="text-sm text-gray-500 dark:text-gray-400"
              >ID: {{ item.id_questions }}</span
            >
          </div>

          <div class="font-medium mb-3 text-gray-800 dark:text-gray-200">
            {{ getQuestionText(item.id_questions) }}
          </div>

          <div
            v-if="getQuestionDescription(item.id_questions)"
            class="text-gray-600 text-sm mb-3 p-2 bg-gray-50 rounded dark:bg-gray-700 dark:text-gray-300"
          >
            {{ getQuestionDescription(item.id_questions) }}
          </div>

          <div v-if="!isAnswerCorrect(item)" class="mb-3">
            <span class="font-semibold text-gray-700 dark:text-gray-300">Twoja odpowiedź: </span>
            <span class="text-red-700 font-medium dark:text-red-400">
              {{ getUserAnswerFullText(item) }}
            </span>
          </div>

          <div class="mt-2">
            <span class="font-semibold text-green-700 dark:text-green-400">
              {{ isAnswerCorrect(item) ? 'Twoja poprawna odpowiedź:' : 'Poprawna odpowiedź:' }}
            </span>
            <span class="text-green-700 dark:text-green-400">
              {{ getCorrectAnswerFullText(item.id_questions) }}
            </span>
          </div>
        </li>
      </ul>
    </div>

    <div v-else class="text-center py-10">
      <p class="text-red-600 font-medium dark:text-red-500">Nie znaleziono wpisu historii</p>
      <router-link
        to="/history"
        class="text-blue-600 hover:text-blue-800 mt-4 inline-block dark:text-blue-400 dark:hover:text-blue-300"
      >
        &larr; Wróć do historii
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import apiClient from '@/api';

export default {
  name: 'HistoryDetailsView',
  inject: ['showAlert', 'showLoader', 'hideLoader'],

  data() {
    return {
      historyEntry: null,
      loading: true,
      error: null,
      allQuestions: [], // Dodajemy jawnie allQuestions jako tablicę
    };
  },

  computed: {
    ...mapGetters('user', ['getUserHistory']),

    // Bezpiecznie pobiera historię użytkownika
    history() {
      return this.getUserHistory || [];
    },

    // Bezpiecznie pobiera listę odpowiedzi
    entryList() {
      return this.historyEntry && Array.isArray(this.historyEntry.list)
        ? this.historyEntry.list
        : [];
    },

    // Dynamiczne klasy CSS dla typu testu
    typeClasses() {
      return this.historyEntry?.type === 'egzamin'
        ? 'bg-purple-200 text-purple-800 dark:bg-purple-700 dark:text-purple-100'
        : 'bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-100';
    },
  },

  methods: {
    ...mapActions('user', ['fetchUserHistory']),

    // Formatowanie daty
    formatDate(dateStr) {
      if (!dateStr) return 'Brak daty';

      try {
        const date = new Date(dateStr);

        // Ręczne formatowanie
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${day}.${month}.${year}, ${hours}:${minutes}`;
      } catch (e) {
        console.error('Błąd formatowania daty:', e);
        return dateStr;
      }
    },

    // Obliczanie procentowego wyniku
    calculatePercentage(correct, wrong) {
      const total = (correct || 0) + (wrong || 0);
      if (total === 0) return 0;
      return Math.round((correct / total) * 100);
    },

    // Pobieranie pełnego obiektu pytania po ID
    getQuestion(id) {
      if (!id || !this.allQuestions || !Array.isArray(this.allQuestions)) return null;

      // Znajdź pytanie z pasującym ID
      return (
        this.allQuestions.find(
          (q) => q.ID == id || q.id == id || q.Id == id || q.id_question == id
        ) || null
      );
    },

    // Pobieranie samej treści pytania
    getQuestionText(id) {
      const question = this.getQuestion(id);
      return question?.question || 'Treść pytania niedostępna';
    },

    // Pobieranie opisu pytania
    getQuestionDescription(id) {
      const question = this.getQuestion(id);
      return question?.description || '';
    },

    // Pobieranie pełnego tekstu odpowiedzi użytkownika
    getUserAnswerFullText(item) {
      if (!item || !item.answer) return 'Nie udzielono odpowiedzi';

      const question = this.getQuestion(item.id_questions);
      if (!question) return `Odpowiedź ${item.answer}`;

      // Znajdź pełny tekst odpowiedzi
      const answerObj = question[item.answer];
      if (answerObj && answerObj.answer) {
        return `${item.answer.slice(-1).toUpperCase()}: ${answerObj.answer}`;
      } else {
        return `Odpowiedź ${item.answer.toUpperCase()}`;
      }
    },

    // Pobieranie pełnego tekstu poprawnej odpowiedzi
    getCorrectAnswerFullText(id) {
      const question = this.getQuestion(id);
      if (!question) return 'Brak informacji o poprawnej odpowiedzi';

      // Znajdź klucz poprawnej odpowiedzi, uwzględniając obie wersje pisowni
      for (const key of ['a', 'b', 'c', 'd']) {
        const answerObj = question[`answer_${key}`];
        if (answerObj && (answerObj.isCorrect === true || answerObj.isCorret === true)) {
          return `${key.toUpperCase()}: ${answerObj.answer}`;
        }
      }

      return 'Brak zdefiniowanej poprawnej odpowiedzi';
    },

    // Sprawdzanie czy odpowiedź jest poprawna - WYKORZYSTUJE ZAPISANĄ FLAGĘ
    isAnswerCorrect(item) {
      // Najpierw sprawdź zapisaną flagę (może mieć nazwę correct lub isCorrect)
      if (item && (item.correct === true || item.isCorrect === true)) {
        return true;
      }

      // Gdy flaga jest ustawiona na false, już wiemy że odpowiedź jest niepoprawna
      if (item && (item.correct === false || item.isCorrect === false)) {
        return false;
      }

      // Jeśli flaga nie istnieje lub jest null/undefined, musimy obliczyć sami
      if (!item || !item.answer) return false;

      const question = this.getQuestion(item.id_questions);
      if (!question) return false;

      try {
        // Znajdź klucz poprawnej odpowiedzi
        let correctKey = null;
        for (const key of ['a', 'b', 'c', 'd']) {
          const answerObj = question[`answer_${key}`];
          if (answerObj && (answerObj.isCorrect === true || answerObj.isCorret === true)) {
            correctKey = key;
            break;
          }
        }

        if (!correctKey) return false;

        // Porównaj odpowiedzi ignorując wielkość liter
        return item.answer.toLowerCase() === correctKey.toLowerCase();
      } catch (e) {
        console.error('Błąd sprawdzania poprawności odpowiedzi:', e);
        return false;
      }
    },

    // Znajdowanie wpisu historii po ID lub indeksie
    findHistoryEntry() {
      const { id } = this.$route.params;
      return this.history[id];
    },

    // Pobieranie wszystkich pytań
    async fetchAllQuestions() {
      try {
        // Pobierz wpis historii, aby znaleźć kategorię
        const entry = this.findHistoryEntry();
        // Jeśli wpis historii nie istnieje, pobierz "all"
        const category = entry?.category || entry?.categories?.[0] || 'all';
        // Pobierz pytania tylko z tej kategorii przez Vuex
        const questions = await this.$store.dispatch(
          'questions/fetchQuestionsByCategory',
          category
        );
        this.allQuestions = Array.isArray(questions) ? questions : [];
      } catch (e) {
        console.error('Błąd pobierania pytań:', e);
        this.showAlert('error', 'Błąd podczas pobierania pytań');
        this.allQuestions = [];
        throw e;
      }
    },
  },

  async created() {
    this.showLoader('Ładowanie szczegółów historii...');
    this.loading = true;
    this.error = null;
    this.allQuestions = []; // Inicjalizuj pustą tablicę na początku

    try {
      // Pobierz wszystkie pytania i odśwież historię użytkownika
      await Promise.all([this.fetchAllQuestions(), this.fetchUserHistory()]);

      // Po załadowaniu wszystkich danych, znajdź odpowiedni wpis historii
      this.historyEntry = this.findHistoryEntry();

      if (!this.historyEntry) {
        this.error = 'Nie znaleziono wpisu historii o podanym ID';
        this.showAlert('error', 'Nie znaleziono wpisu historii o podanym ID');
      }
    } catch (e) {
      console.error('Błąd podczas ładowania szczegółów historii:', e);
      this.error = 'Wystąpił błąd podczas ładowania historii';
      this.showAlert('error', 'Wystąpił błąd podczas ładowania szczegółów historii');
    } finally {
      this.hideLoader();
      this.loading = false;
    }
  },
};
</script>
