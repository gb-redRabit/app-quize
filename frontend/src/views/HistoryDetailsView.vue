<template>
  <div class="container mx-auto p-4">
    <!-- Stan ładowania -->
    <div v-if="loading" class="text-center my-8">
      <div
        class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto animate-spin"
      ></div>
      <p class="mt-4 text-gray-600">Ładowanie szczegółów...</p>
    </div>

    <!-- Obsługa braku danych -->
    <div v-else-if="!entry" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <p class="font-bold">Nie znaleziono wpisu historii</p>
      <p>Podany wpis historii nie istnieje lub wystąpił błąd podczas jego pobierania.</p>
      <router-link to="/history" class="text-blue-600 hover:text-blue-800 mt-2 inline-block">
        &larr; Wróć do historii
      </router-link>
    </div>

    <!-- Główna zawartość -->
    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Szczegóły historii</h1>
        <router-link to="/history" class="text-blue-600 hover:text-blue-800">
          &larr; Wróć do historii
        </router-link>
      </div>

      <!-- Informacje o teście -->
      <div class="bg-white shadow-md rounded-lg p-6 mb-6">
        <div class="grid md:grid-cols-3 gap-4">
          <div>
            <span class="text-gray-500 block text-sm">Data:</span>
            <span class="font-medium">{{ formatDate(entry.data) }}</span>
          </div>
          <div>
            <span class="text-gray-500 block text-sm">Typ:</span>
            <span
              class="inline-block px-3 py-1 rounded-full text-xs font-bold"
              :class="typeClasses"
            >
              {{ entry.type === 'egzamin' ? 'Egzamin' : 'Quiz' }}
            </span>
          </div>
          <div>
            <span class="text-gray-500 block text-sm">Wynik:</span>
            <span class="font-medium">
              {{ entry.correct || 0 }} / {{ (entry.correct || 0) + (entry.wrong || 0) }} ({{
                calculatePercentage(entry.correct, entry.wrong)
              }}%)
            </span>
          </div>
        </div>
      </div>

      <!-- Lista pytań i odpowiedzi -->
      <h2 class="text-xl font-semibold mb-4">Odpowiedzi:</h2>

      <div v-if="!entryList.length" class="text-center text-gray-500 my-8">
        <p>Ten wpis nie zawiera żadnych odpowiedzi.</p>
      </div>

      <ul v-else class="space-y-4">
        <li
          v-for="(item, index) in entryList"
          :key="index"
          class="p-4 bg-white rounded-lg shadow-md border-l-4"
          :class="isAnswerCorrect(item) ? 'border-green-500' : 'border-red-500'"
        >
          <div class="flex justify-between mb-2">
            <span class="font-semibold text-gray-700">Pytanie {{ index + 1 }}</span>
            <span class="text-sm text-gray-500">ID: {{ item.id_questions }}</span>
          </div>

          <!-- Treść pytania -->
          <div class="font-medium mb-3 text-gray-800">
            {{ getQuestionText(item.id_questions) }}
          </div>

          <!-- Opis pytania (jeśli istnieje) -->
          <div
            v-if="getQuestionDescription(item.id_questions)"
            class="text-gray-600 text-sm mb-3 p-2 bg-gray-50 rounded"
          >
            {{ getQuestionDescription(item.id_questions) }}
          </div>

          <!-- Odpowiedź użytkownika tylko gdy jest niepoprawna -->
          <div v-if="!isAnswerCorrect(item)" class="mb-3">
            <span class="font-semibold">Twoja odpowiedź: </span>
            <span class="text-red-700 font-medium">
              {{ getUserAnswerFullText(item) }}
            </span>
          </div>

          <!-- Odpowiedź poprawna - zawsze wyświetlana -->
          <div class="mt-2">
            <span class="font-semibold text-green-700">
              {{ isAnswerCorrect(item) ? 'Twoja poprawna odpowiedź:' : 'Poprawna odpowiedź:' }}
            </span>
            <span class="text-green-700">
              {{ getCorrectAnswerFullText(item.id_questions) }}
            </span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import apiClient from '@/api';

export default {
  name: 'HistoryDetailsView',

  data() {
    return {
      entry: null,
      allQuestions: [],
      loading: true,
    };
  },

  computed: {
    ...mapGetters('user', ['getUserHistory']),

    // Bezpiecznie pobiera historię użytkownika
    history() {
      // Ważne: NIE odwracamy tutaj kolejności
      return this.getUserHistory || [];
    },

    // Bezpiecznie pobiera listę odpowiedzi
    entryList() {
      return this.entry && Array.isArray(this.entry.list) ? this.entry.list : [];
    },

    // Dynamiczne klasy CSS dla typu testu
    typeClasses() {
      return this.entry?.type === 'egzamin'
        ? 'bg-purple-200 text-purple-800'
        : 'bg-blue-200 text-blue-800';
    },
  },

  methods: {
    ...mapActions('user', ['fetchUserHistory']),

    // Formatowanie daty
    formatDate(dateString) {
      if (!dateString) return 'Nieznana data';

      try {
        const date = new Date(dateString);
        return date.toLocaleString('pl-PL');
      } catch (e) {
        return dateString;
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
      if (!id) return null;

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

      // Normalizuj odpowiedź użytkownika do małych liter
      const userAnswerKey = item.answer.toLowerCase();

      // Znajdź pełny tekst odpowiedzi
      const answerObj = question[`answer_${userAnswerKey}`];
      if (answerObj && answerObj.answer) {
        return `${item.answer.toUpperCase()}: ${answerObj.answer}`;
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
        return false;
      }
    },

    // Pobieranie wszystkich pytań
    async fetchAllQuestions() {
      try {
        const res = await apiClient.get('/questions');
        this.allQuestions = res.data || [];
      } catch (e) {
        console.error('Błąd podczas pobierania pytań:', e);
        this.allQuestions = [];
      }
    },
  },

  async created() {
    this.loading = true;

    try {
      // Pobierz wszystkie pytania i odśwież historię użytkownika
      await Promise.all([this.fetchAllQuestions(), this.fetchUserHistory()]);

      // Pobierz indeks z parametrów URL
      const idx = Number(this.$route.params.idx);

      // Sprawdź czy historia jest dostępna
      if (!Array.isArray(this.history) || idx >= this.history.length) {
        this.entry = null;
        return;
      }

      // Znajdź odpowiedni wpis w historii - POPRAWIONY INDEKS
      this.entry = this.history[idx];
    } catch (e) {
      console.error('Błąd podczas ładowania szczegółów historii:', e);
      this.entry = null;
    } finally {
      this.loading = false;
    }
  },
};
</script>
