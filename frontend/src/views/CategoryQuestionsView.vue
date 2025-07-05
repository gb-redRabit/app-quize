<template>
  <div class="container mx-auto p-2 sm:p-6">
    <BaseLoader :show="loading" />

    <div class="flex flex-col sm:flex-row justify-between items-center gap-2 mb-4">
      <h1 class="text-2xl font-bold mb-2 sm:mb-0">
        Pytania z kategorii:
        <span class="text-blue-700">{{ categoryLabel }}</span>
      </h1>
      <SearchBar v-model:search="searchQuery" class="w-full sm:w-80" />
    </div>
    <div class="mb-2 text-base">
      <span v-if="lastAttemptStats.total > 0">
        Z ostatniego podejścia w tej kategorii było
        <span class="font-bold">{{ lastAttemptStats.total }}</span>
        pytań, w tym
        <span class="font-bold text-green-600">{{ lastAttemptStats.correct }}</span>
        /
        <span class="font-bold text-red-600">{{ lastAttemptStats.wrong }}</span>
        (prawidłowe/nieprawidłowe)
      </span>
      <span v-else class="text-gray-400">Brak podejścia w tej kategorii.</span>
    </div>
    <BaseButton color="green" size="sm" class="mb-4" @click="downloadQuestionsTxt">
      Pobierz pytania do Worda (TXT)
    </BaseButton>
    <BaseButton
      color="yellow"
      size="sm"
      class="mb-4 ml-2"
      @click="showDuplicates = !showDuplicates"
    >
      {{ showDuplicates ? 'Pokaż wszystkie pytania' : 'Pokaż duplikaty pytań' }}
    </BaseButton>
    <!-- Pasek wizualny poprawnych/błędnych -->
    <div
      v-if="lastAttemptStats.total > 0"
      class="w-full h-4 rounded mb-4 flex overflow-hidden border border-gray-300"
    >
      <div
        v-if="lastAttemptStats.correct > 0"
        :style="{
          width: (lastAttemptStats.correct / lastAttemptStats.total) * 100 + '%',
        }"
        class="bg-green-400 h-full transition-all"
        title="Poprawne"
      ></div>
      <div
        v-if="lastAttemptStats.wrong > 0"
        :style="{
          width: (lastAttemptStats.wrong / lastAttemptStats.total) * 100 + '%',
        }"
        class="bg-red-400 h-full transition-all"
        title="Niepoprawne"
      ></div>
    </div>

    <div v-if="loading" class="text-lg">Ładowanie pytań...</div>
    <div v-else>
      <div v-if="filteredQuestions.length === 0" class="text-gray-500">
        Brak pytań w tej kategorii.
      </div>
      <ul class="space-y-6">
        <li
          v-for="q in visibleQuestions"
          :key="q.ID"
          class="bg-white rounded-lg shadow border p-4"
          :class="{
            'bg-green-100 border-green-400': lastAttemptMap[q.ID] === true,
            'bg-red-100 border-red-400': lastAttemptMap[q.ID] === false,
          }"
        >
          <div class="flex items-start justify-between">
            <div class="font-semibold text-base sm:text-lg mb-2 break-words">
              <span class="text-gray-500">ID: {{ q.ID }} -</span> {{ q.question }}
            </div>
            <QuestionActions :question="q" @deleted="onQuestionDeleted" @edit="onQuestionEdited" />
          </div>
          <div class="mb-2 text-gray-700">
            <span class="font-bold">A:</span>
            {{ q.answer_a && q.answer_a.answer }}
            <span v-if="q.answer_a && q.answer_a.isCorret" class="text-green-600 font-bold ml-2"
              >(poprawna)</span
            >
          </div>
          <div class="mb-2 text-gray-700">
            <span class="font-bold">B:</span>
            {{ q.answer_b && q.answer_b.answer }}
            <span v-if="q.answer_b && q.answer_b.isCorret" class="text-green-600 font-bold ml-2"
              >(poprawna)</span
            >
          </div>
          <div class="mb-2 text-gray-700">
            <span class="font-bold">C:</span>
            {{ q.answer_c && q.answer_c.answer }}
            <span v-if="q.answer_c && q.answer_c.isCorret" class="text-green-600 font-bold ml-2"
              >(poprawna)</span
            >
          </div>
          <div v-if="q.answer_d" class="mb-2 text-gray-700">
            <span class="font-bold">D:</span>
            {{ q.answer_d && q.answer_d.answer }}
            <span v-if="q.answer_d && q.answer_d.isCorret" class="text-green-600 font-bold ml-2"
              >(poprawna)</span
            >
          </div>
          <div class="text-sm text-gray-500 mt-2">
            {{ q.description }}
          </div>
        </li>
      </ul>
      <div v-if="hasMoreQuestions" class="text-center py-4 text-gray-400">
        Przewiń w dół, aby załadować więcej pytań...
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import SearchBar from '@/components/SearchBar.vue';
import BaseLoader from '@/components/BaseLoader.vue';
import BaseButton from '@/components/BaseButton.vue';
import QuestionActions from '@/components/QuestionActions.vue'; // <-- DODAJ TO
export default {
  name: 'CategoryQuestionsView',
  components: { SearchBar, BaseLoader, BaseButton, QuestionActions }, // <-- DODAJ TU
  data() {
    return {
      loading: true,
      searchQuery: '',
      displayCount: 100,
      loadingMore: false,
      localQuestions: [],
      showDuplicates: false,
      showDuplicates: false,
    };
  },
  computed: {
    ...mapGetters('questions', ['getQuestions']),
    ...mapGetters('user', ['getUser']),
    ...mapState(['user']),
    category() {
      return this.$route.params.category;
    },
    categoryLabel() {
      return this.category === 'all' ? 'Wszystkie' : this.category;
    },
    // Ostatnie podejście (quiz/egzamin, bez poprawy) w tej kategorii
    lastAttempt() {
      if (!this.user || !this.user.history) return null;
      // Szukaj od końca, bez poprawy błędów, z pytaniami z tej kategorii
      return (
        [...this.user.history].reverse().find(
          (entry) =>
            (entry.type === 'quiz' || entry.type === 'egzamin') &&
            entry.list.some((item) => {
              const q = this.getQuestions.find(
                (qq) =>
                  qq.ID == item.id_questions ||
                  qq.id == item.id_questions ||
                  qq.Id == item.id_questions ||
                  qq.id_question == item.id_questions
              );
              return this.category === 'all' || (q && q.category === this.category);
            })
        ) || null
      );
    },
    // Mapa: id pytania => { correct: true/false }
    lastAttemptMap() {
      if (!this.lastAttempt) return {};
      const map = {};
      for (const item of this.lastAttempt.list) {
        // Jeśli jest pole correct, użyj go
        if (typeof item.correct === 'boolean') {
          map[item.id_questions] = item.correct;
        } else if (item.answer) {
          // Jeśli nie ma correct, sprawdź czy answer jest poprawny
          const q = this.getQuestions.find(
            (qq) =>
              qq.ID == item.id_questions ||
              qq.id == item.id_questions ||
              qq.Id == item.id_questions ||
              qq.id_question == item.id_questions
          );
          if (q) {
            // znajdź poprawną literę
            const keys = ['answer_a', 'answer_b', 'answer_c', 'answer_d'];
            const correctIdx = keys.findIndex((k) => q[k] && q[k].isCorret);
            const correctLetter = ['A', 'B', 'C', 'D'][correctIdx];
            map[item.id_questions] = item.answer === correctLetter;
          }
        }
      }
      return map;
    },
    // Liczby do wyświetlenia
    lastAttemptStats() {
      if (!this.lastAttempt) return { total: 0, correct: 0, wrong: 0 };
      let total = 0,
        correct = 0,
        wrong = 0;
      for (const item of this.lastAttempt.list) {
        const q = this.getQuestions.find(
          (qq) =>
            qq.ID == item.id_questions ||
            qq.id == item.id_questions ||
            qq.Id == item.id_questions ||
            qq.id_question == item.id_questions
        );
        if (this.category === 'all' || (q && q.category === this.category)) {
          total++;
          // Sprawdź poprawność jak wyżej
          let isCorrect = null;
          if (typeof item.correct === 'boolean') {
            isCorrect = item.correct;
          } else if (item.answer && q) {
            const keys = ['answer_a', 'answer_b', 'answer_c', 'answer_d'];
            const correctIdx = keys.findIndex((k) => q[k] && q[k].isCorret);
            const correctLetter = ['A', 'B', 'C', 'D'][correctIdx];
            isCorrect = item.answer === correctLetter;
          }
          if (isCorrect === true) correct++;
          else if (isCorrect === false) wrong++;
        }
      }
      return { total, correct, wrong };
    },
    // Lista pytań: najpierw z ostatniego podejścia (posortowane: nieprawidłowe, prawidłowe), potem reszta
    sortedQuestions() {
      const idsInAttempt = this.lastAttempt
        ? this.lastAttempt.list
            .filter((item) => {
              const q = this.getQuestions.find(
                (qq) =>
                  qq.ID == item.id_questions ||
                  qq.id == item.id_questions ||
                  qq.Id == item.id_questions ||
                  qq.id_question == item.id_questions
              );
              return this.category === 'all' || (q && q.category === this.category);
            })
            .map((item) => item.id_questions)
        : [];
      // Najpierw nieprawidłowe, potem prawidłowe, potem reszta
      const wrong = [];
      const correct = [];
      const rest = [];
      for (const q of this.filteredQuestions) {
        if (idsInAttempt.includes(q.ID)) {
          if (this.lastAttemptMap[q.ID] === false) wrong.push(q);
          else if (this.lastAttemptMap[q.ID] === true) correct.push(q);
          else rest.push(q);
        } else {
          rest.push(q);
        }
      }
      return [...wrong, ...correct, ...rest];
    },
    filteredQuestions() {
      let questions =
        this.category === 'all'
          ? this.localQuestions
          : this.localQuestions.filter((q) => q.category === this.category);
      if (!this.searchQuery) return this.showDuplicates ? this.duplicateQuestions : questions;
      const q = this.searchQuery.toLowerCase();
      const base = this.showDuplicates ? this.duplicateQuestions : questions;
      return base.filter(
        (item) =>
          (item.ID && item.ID.toString().includes(q)) ||
          (item.question && item.question.toLowerCase().includes(q))
      );
    },
    duplicateQuestions() {
      // Najpierw filtruj po kategorii
      const questions =
        this.category === 'all'
          ? this.localQuestions
          : this.localQuestions.filter((q) => q.category === this.category);

      // Szukaj duplikatów po oczyszczeniu końcówki pytania
      const map = {};
      for (const q of questions) {
        const norm = this.normalizeQuestion(q.question);
        if (!map[norm]) map[norm] = [];
        map[norm].push(q);
      }
      // Zwróć tylko te, które mają więcej niż jeden wpis
      return Object.values(map)
        .filter((arr) => arr.length > 1)
        .flat();
    },
    visibleQuestions() {
      return this.sortedQuestions.slice(0, this.displayCount);
    },
    hasMoreQuestions() {
      return this.displayCount < this.sortedQuestions.length;
    },
  },
  async created() {
    if (!this.getQuestions.length) {
      await this.$store.dispatch('questions/fetchQuestionsAndCategories');
    }
    this.localQuestions = [...this.getQuestions];
    this.loading = false;
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
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
    downloadQuestionsTxt() {
      // Pobierz widoczne pytania z kategorii
      const questions = this.sortedQuestions;
      let txt = '';
      questions.forEach((q, idx) => {
        txt += `${idx + 1}. ${q.ID}. ${q.question}\n`;
        const answers = [
          { key: 'A', obj: q.answer_a },
          { key: 'B', obj: q.answer_b },
          { key: 'C', obj: q.answer_c },
          { key: 'D', obj: q.answer_d },
        ];
        answers.forEach((ans) => {
          if (ans.obj && ans.obj.answer) {
            txt += `   ${ans.key}. ${ans.obj.answer}`;
            if (ans.obj.isCorret) txt += '   [poprawna]';
            txt += '\n';
          }
        });
        if (q.description) txt += `   Opis: ${q.description}\n`;
        txt += '\n';
      });

      // Utwórz i pobierz plik
      const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pytania_${this.categoryLabel}.txt`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    },
    onQuestionDeleted(deletedQuestion) {
      this.localQuestions = this.localQuestions.filter((q) => q.ID !== deletedQuestion.ID);
    },
    onQuestionEdited(editedQuestion) {
      const idx = this.localQuestions.findIndex((q) => q.ID === editedQuestion.ID);
      if (idx !== -1) {
        this.localQuestions.splice(idx, 1, editedQuestion);
      }
    },
    normalizeQuestion(text) {
      return text
        ? text
            .trim()
            .replace(/[\s:.\?!]+$/, '')
            .toLowerCase()
        : '';
    },
  },
};
</script>
