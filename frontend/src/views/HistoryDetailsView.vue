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
      <!-- filepath: d:\git nowe\app-quize\frontend\src\views\HistoryDetailsView.vue -->
      <div v-if="answerTimes.length" class="mb-8">
        <div class="flex flex-col items-center w-full mx-auto">
          <div class="flex w-full items-center mb-4">
            <h2
              class="flex-1 text-xl font-semibold text-gray-800 dark:text-gray-200 w-full text-left"
            >
              Czas odpowiedzi na pytania
            </h2>
            <div
              class="flex-1 text-base text-gray-700 dark:text-gray-300 mb-2 w-full text-right pr-2"
            >
              Suma czasu: <span class="font-bold">{{ totalTime }} s</span>
            </div>
          </div>
          <div
            class="flex items-end gap-3 h-72 w-full bg-gray-50 dark:bg-gray-900 rounded-lg shadow-inner px-4 overflow-x-auto border border-gray-200 dark:border-gray-700 relative"
            style="min-width: 900px; max-width: 100%"
          >
            <div
              v-for="(t, idx) in answerTimes"
              :key="idx"
              class="flex flex-col items-center justify-end"
              style="flex: 0 0 38px; min-width: 38px"
            >
              <span class="text-sm text-gray-500 mt-1"> {{ idx + 1 }} </span>
              <div
                :style="{ height: (t || 1) * 10 + 'px' }"
                :class="[
                  isAnswerCorrect(entryList[idx]) === true
                    ? 'bg-green-500 hover:bg-green-600'
                    : isAnswerCorrect(entryList[idx]) === false
                      ? 'bg-red-500 hover:bg-red-600'
                      : t > 40
                        ? 'bg-red-500 hover:bg-red-600'
                        : t > 20
                          ? 'bg-yellow-400 hover:bg-yellow-500'
                          : 'bg-blue-500 hover:bg-blue-600',
                  'transition w-full rounded-t cursor-pointer',
                ]"
                :title="`Pytanie ${idx + 1}: ${t}s`"
                @click="scrollToAnswer(idx)"
              ></div>
              <span class="text-sm text-gray-500 mt-1"> {{ t }}s </span>
            </div>
          </div>
          <div class="w-full text-xs text-gray-400 mt-2 text-right">
            <span class="inline-block mr-4"
              ><span class="inline-block w-3 h-3 bg-green-500 rounded mr-1"></span> Poprawna</span
            >
            <span class="inline-block mr-4"
              ><span class="inline-block w-3 h-3 bg-red-500 rounded mr-1"></span> Błędna</span
            >
            <span class="inline-block mr-4"
              ><span class="inline-block w-3 h-3 bg-blue-500 rounded mr-1"></span> &le;20s</span
            >
            <span class="inline-block mr-4"
              ><span class="inline-block w-3 h-3 bg-yellow-400 rounded mr-1"></span> 21-40s</span
            >
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
          :ref="'answer-' + index"
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

    answerTimes() {
      // Jeśli brak danych, zwróć pustą tablicę
      if (
        !this.historyEntry ||
        !Array.isArray(this.historyEntry.questionTimes) ||
        this.historyEntry.questionTimes.length === 0
      ) {
        return [];
      }
      // Start quizu jako liczba (sekundy)
      const start = new Date(this.historyEntry.data).getTime() / 1000;
      const times = this.historyEntry.questionTimes;
      // Pierwszy czas to różnica między pierwszym timestampem a startem quizu
      const result = [Math.max(0, times[0] - start)];
      // Kolejne czasy to różnice między kolejnymi timestampami
      for (let i = 1; i < times.length; i++) {
        result.push(Math.max(0, times[i] - times[i - 1]));
      }
      // Zaokrąglij do 2 miejsc po przecinku
      return result.map((t) => Math.round(t * 100) / 100);
    },
    totalTime() {
      // Suma czasów odpowiedzi
      return this.answerTimes.reduce((sum, t) => sum + t, 0).toFixed(2);
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

    scrollToAnswer(idx) {
      this.$nextTick(() => {
        const el = this.$refs['answer-' + idx];
        // $refs może być tablicą jeśli v-for, więc bierz pierwszy element
        const target = Array.isArray(el) ? el[0] : el;
        if (target && typeof target.scrollIntoView === 'function') {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Opcjonalnie: dodać animację podświetlenia
          target.classList.add('ring', 'ring-blue-400');
          setTimeout(() => target.classList.remove('ring', 'ring-blue-400'), 1200);
        }
      });
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
