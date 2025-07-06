<template>
  <div class="container mx-auto p-4 sm:p-6 lg:p-8">
    <BaseLoader :show="loading" />
    <div class="">
      <!-- Nagłówek strony -->
      <div class="mb-4">
        <h1 class="text-3xl md:text-4xl font-bold text-slate-800">Panel Administratora</h1>
      </div>

      <!-- --- POCZĄTEK POPRAWKI: NAPRAWIONA STRUKTURA HTML --- -->
      <!-- Panel sterowania -->
      <div class="bg-white rounded-lg shadow-md border border-slate-200 mb-4">
        <div class="p-4 md:p-6">
          <!-- Główne akcje i wyszukiwarka -->
          <div class="flex flex-col md:flex-row justify-between items-center mb-2 gap-4">
            <SearchBar v-model:search="searchQuery" class="w-full order-2 md:order-1" />
          </div>

          <!-- Nowoczesny, "karciany" layout dla narzędzi -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Karta: Dodaj pytanie -->
            <div
              @click="openAddPopup"
              class="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center gap-4"
            >
              <div class="bg-sky-500 p-3 rounded-full">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold">Dodaj pytanie</h3>
                <p class="text-sm text-sky-200">Otwórz formularz</p>
              </div>
            </div>
            <!-- Karta: Eksport -->
            <div
              class="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center gap-4"
            >
              <div class="bg-green-100 p-3 rounded-full">
                <svg
                  class="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V7a2 2 0 012-2h5l2 2h5a2 2 0 012 2v5a2 2 0 01-2 2z"
                  ></path>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-slate-700">Eksport</h3>
                <button
                  @click="exportQuestionsExcel"
                  class="text-sm text-sky-600 hover:text-sky-800 font-medium"
                >
                  Pobierz plik .xlsx
                </button>
              </div>
            </div>
            <!-- Karta: Import -->
            <div
              class="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center gap-4"
            >
              <div class="bg-sky-100 p-3 rounded-full">
                <svg
                  class="w-6 h-6 text-sky-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  ></path>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-slate-700">Import</h3>
                <label class="text-sm text-sky-600 hover:text-sky-800 font-medium cursor-pointer">
                  Wybierz plik .xlsx
                  <input type="file" accept=".xlsx" @change="importQuestions" class="hidden" />
                </label>
                <button
                  @click="showExcelInfo = true"
                  class="block text-xs text-slate-400 hover:text-slate-600"
                >
                  Jak przygotować plik?
                </button>
              </div>
            </div>
            <!-- Karta: Strefa niebezpieczna -->
            <div
              class="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center gap-4"
            >
              <div class="bg-red-100 p-3 rounded-full">
                <svg
                  class="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  ></path>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-slate-700">Strefa niebezpieczna</h3>
                <button
                  @click="showClearQuestionsModal = true"
                  class="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Wyczyść bazę pytań
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista pytań -->
      <div class="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div class="hidden sm:flex items-center p-4 border-b border-slate-200 bg-slate-50">
          <div class="w-24 font-mono text-xs font-semibold text-slate-500 uppercase tracking-wider">
            ID
          </div>
          <div class="flex-grow font-semibold text-slate-600 uppercase tracking-wider">
            Treść pytania
          </div>
          <div class="w-32 text-center font-semibold text-slate-600 uppercase tracking-wider">
            Akcje
          </div>
        </div>

        <DynamicScroller
          :items="filteredQuestions"
          key-field="ID"
          :min-item-size="72"
          class="scroller"
        >
          <template v-slot="{ item, index, active }">
            <DynamicScrollerItem
              :item="item"
              :active="active"
              :size-dependencies="[item.question, expandedRows.includes(item.ID)]"
              :data-index="index"
              :class="[
                'border-b border-slate-200 transition-colors duration-150',
                'hover:bg-sky-100/50',
                // --- POCZĄTEK POPRAWKI: Usunięcie klas tła z komponentu-wrappera ---
                // Klasy tła zostaną przeniesione do wewnętrznych elementów
                // --- KONIEC POPRAWKI ---
              ]"
            >
              <!-- Widok mobilny -->
              <div
                :class="[
                  'block sm:hidden p-4',
                  index % 2 === 0 ? 'bg-gray-100' : 'bg-white', // --- POCZĄTEK POPRAWKI: Dodanie klasy tła ---
                ]"
              >
                <div
                  class="flex justify-between items-center cursor-pointer"
                  @click="toggleRow(item.ID)"
                >
                  <div class="flex-grow truncate pr-2">
                    <span class="text-slate-400 font-mono text-xs block">ID: {{ item.ID }}</span>
                    <span class="text-slate-800">{{ item.question }}</span>
                  </div>
                  <svg
                    :class="[
                      'w-6 h-6 transition-transform flex-shrink-0 text-slate-500',
                      { 'rotate-180': expandedRows.includes(item.ID) },
                    ]"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div
                  v-if="expandedRows.includes(item.ID)"
                  class="mt-4 pt-4 border-t border-slate-200"
                >
                  <div class="text-sm text-slate-600 mb-3">
                    <b>Kategoria:</b> {{ item.category || 'Brak' }}
                  </div>
                  <div class="text-sm text-slate-600 mb-4">
                    <b>Opis:</b> {{ item.description || 'Brak' }}
                  </div>
                  <!-- --- POCZĄTEK ZMIANY: UŻYCIE QuestionActions --- -->
                  <div class="flex">
                    <QuestionActions
                      :question="item"
                      @edit="onQuestionEdited"
                      @deleted="onQuestionDeleted"
                    />
                  </div>
                  <!-- --- KONIEC ZMIANY --- -->
                </div>
              </div>
              <!-- Widok desktopowy -->
              <div
                :class="[
                  'hidden sm:flex items-center px-4 py-4',
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-100', // Użyłem bg-slate-50 dla subtelniejszego efektu
                ]"
              >
                <div class="w-24 font-mono text-sm text-slate-600">{{ item.ID }}</div>
                <!-- --- POCZĄTEK POPRAWKI: Skracanie i rozwijanie tekstu --- -->
                <div
                  class="flex-grow text-slate-800 pr-4 cursor-pointer"
                  @click="toggleRow(item.ID)"
                >
                  <span v-if="!expandedRows.includes(item.ID) && item.question.length > 150">
                    {{ item.question.substring(0, 150) }}...
                  </span>
                  <span v-else>
                    {{ item.question }}
                  </span>
                </div>
                <!-- --- KONIEC POPRAWKI --- -->
                <div class="w-32 flex justify-center">
                  <QuestionActions
                    :question="item"
                    @edit="onQuestionEdited"
                    @deleted="onQuestionDeleted"
                  />
                </div>
              </div>
            </DynamicScrollerItem>
          </template>
        </DynamicScroller>
      </div>
      <!-- --- KONIEC POPRAWKI --- -->

      <!-- --- MODALE --- -->
      <BaseModal :show="showExcelInfo" @close="showExcelInfo = false">
        <template #header>Import pytań z pliku Excel</template>
        <p class="text-sm text-slate-600 mb-4">
          Przygotuj plik .xlsx z kolumnami w podanej kolejności. Pierwszy wiersz musi zawierać
          nagłówki (nazwy dowolne).
        </p>
        <div class="overflow-x-auto mb-4 rounded-lg border border-slate-200">
          <table class="min-w-full text-xs">
            <thead class="bg-slate-50">
              <tr class="text-left">
                <th class="p-2 font-semibold">ID</th>
                <th class="p-2 font-semibold">Pytanie</th>
                <th class="p-2 font-semibold">Odp. A</th>
                <th class="p-2 font-semibold">Poprawna A</th>
                <th class="p-2 font-semibold">Odp. B</th>
                <th class="p-2 font-semibold">Poprawna B</th>
                <th class="p-2 font-semibold">Odp. C</th>
                <th class="p-2 font-semibold">Poprawna C</th>
                <th class="p-2 font-semibold">Kategoria</th>
                <th class="p-2 font-semibold">Opis</th>
              </tr>
            </thead>
            <tbody class="bg-white">
              <tr class="border-t border-slate-200">
                <td class="p-2">123</td>
                <td class="p-2">Treść...</td>
                <td class="p-2">Odp...</td>
                <td class="p-2">true</td>
                <td class="p-2">Odp...</td>
                <td class="p-2">false</td>
                <td class="p-2">Odp...</td>
                <td class="p-2">false</td>
                <td class="p-2">Kategoria...</td>
                <td class="p-2">Opis...</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul class="mb-4 list-disc pl-5 text-sm text-slate-600 space-y-1">
          <li>
            W kolumnach "Poprawna" wpisz <b>true</b> lub <b>false</b> (lub zostaw puste dla false).
          </li>
        </ul>
        <template #footer>
          <BaseButton color="gray" @click="showExcelInfo = false">Zrozumiałem</BaseButton>
        </template>
      </BaseModal>

      <BaseModal :show="showClearQuestionsModal" @close="showClearQuestionsModal = false">
        <template #icon>
          <div
            class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
          >
            <svg class="h-6 w-6 text-red-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
          </div>
        </template>
        <template #header>Wyczyść bazę pytań</template>
        <p class="text-sm text-slate-500">
          Czy na pewno chcesz usunąć <b>wszystkie</b> pytania? Tej operacji nie można cofnąć.
        </p>
        <template #footer>
          <BaseButton color="red" @click="clearQuestions">Tak, usuń wszystko</BaseButton>
          <BaseButton color="gray" @click="showClearQuestionsModal = false">Anuluj</BaseButton>
        </template>
      </BaseModal>

      <!-- Modal dodawania (pozostaje, bo jest unikalny dla tego widoku) -->
      <BaseModal :show="showAddPopup" @close="closeAddPopup" class="!max-w-5xl">
        <!-- --- POCZĄTEK POPRAWKI: USUNIĘCIE ZBĘDNEJ LOGIKI --- -->
        <template #header>Nowe pytanie</template>
        <!-- --- KONIEC POPRAWKI --- -->
        <form @submit.prevent="saveNewQuestion()">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6">
            <!-- LEWA KOLUMNA: Pytanie i Odpowiedzi -->
            <div class="lg:col-span-2 space-y-6">
              <div>
                <label class="block text-sm font-medium text-slate-700" for="question-text"
                  >Treść pytania</label
                >
                <textarea
                  v-model="formModel.question"
                  id="question-text"
                  rows="4"
                  class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                  placeholder="Wpisz treść pytania..."
                  required
                ></textarea>
              </div>
              <div class="space-y-4">
                <div v-for="key in ['a', 'b', 'c']" :key="key">
                  <label :for="`answer-${key}`" class="block text-sm font-medium text-slate-700"
                    >Odpowiedź {{ key.toUpperCase() }}</label
                  >
                  <input
                    type="text"
                    :id="`answer-${key}`"
                    v-model="formModel[`answer_${key}`].answer"
                    class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                    :placeholder="`Treść odpowiedzi ${key.toUpperCase()}`"
                    required
                  />
                </div>
              </div>
            </div>

            <!-- PRAWA KOLUMNA: Ustawienia -->
            <div class="bg-slate-50 rounded-lg p-6 space-y-6 border">
              <!-- Ustawienie poprawnej odpowiedzi -->
              <div>
                <h3 class="text-sm font-medium text-slate-800">Poprawna odpowiedź</h3>
                <div class="grid grid-cols-3 gap-2 mt-2">
                  <button
                    v-for="key in ['a', 'b', 'c']"
                    :key="`btn-${key}`"
                    type="button"
                    @click="setCorrectAnswer(key)"
                    :class="[
                      'p-2 rounded-md text-sm font-semibold border-2 transition-all',
                      formModel[`answer_${key}`].isCorret
                        ? 'bg-green-600 text-white border-green-600 shadow'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-200',
                    ]"
                  >
                    {{ key.toUpperCase() }}
                  </button>
                </div>
              </div>

              <!-- Kategoria -->
              <div>
                <label for="category" class="block text-sm font-medium text-slate-800"
                  >Kategoria</label
                >
                <select
                  v-model="formModel.category"
                  id="category"
                  class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                  required
                >
                  <option value="" disabled>Wybierz kategorię</option>
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                  <option value="__nowa__">[Dodaj nową kategorię]</option>
                </select>
                <div v-if="formModel.category === '__nowa__'" class="flex gap-2 mt-2">
                  <input
                    v-model="newCategoryInput"
                    @keyup.enter.prevent="confirmNewCategory()"
                    class="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                    placeholder="Nowa kategoria"
                  />
                  <BaseButton size="sm" color="green" type="button" @click="confirmNewCategory()"
                    >OK</BaseButton
                  >
                </div>
              </div>

              <!-- Opis -->
              <div>
                <label for="description" class="block text-sm font-medium text-slate-800"
                  >Opis (opcjonalnie)</label
                >
                <input
                  type="text"
                  v-model="formModel.description"
                  id="description"
                  class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                  placeholder="Np. podstawa prawna"
                />
              </div>
            </div>
          </div>
        </form>
        <template #footer>
          <!-- --- POCZĄTEK POPRAWKI: UPROSZCZENIE PRZYCISKÓW --- -->
          <BaseButton color="gray" type="button" @click="closeAddPopup()">Anuluj</BaseButton>
          <BaseButton color="blue" type="submit" @click="saveNewQuestion()"
            >Zapisz pytanie</BaseButton
          >
          <!-- --- KONIEC POPRAWKI --- -->
        </template>
      </BaseModal>

      <!-- Modale edycji i usuwania pojedynczego pytania nie są już tutaj potrzebne -->
    </div>
  </div>
</template>

<script>
import SearchBar from '@/components/SearchBar.vue';
import BaseButton from '@/components/BaseButton.vue';
import IconButton from '@/components/IconButton.vue';
import BaseModal from '@/components/BaseModal.vue';
import BaseLoader from '@/components/BaseLoader.vue';
import apiClient from '@/api';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import QuestionActions from '@/components/QuestionActions.vue';

export default {
  components: {
    SearchBar,
    BaseButton,
    IconButton,
    BaseModal,
    BaseLoader,
    DynamicScroller,
    DynamicScrollerItem,
    QuestionActions,
  },
  data() {
    return {
      questions: [],
      categories: [],
      showAddPopup: false,
      newCategoryInput: '',
      searchQuery: '',
      showExcelInfo: false,
      expandedRows: [],
      loading: false,
      showClearQuestionsModal: false,
      formModel: {
        question: '',
        answer_a: { answer: '', isCorret: false },
        answer_b: { answer: '', isCorret: false },
        answer_c: { answer: '', isCorret: false },
        category: '',
        description: '',
      },
    };
  },
  created() {
    this.fetchQuestions();
  },
  computed: {
    filteredQuestions() {
      if (!this.searchQuery) return this.questions;
      const q = this.searchQuery.toLowerCase();
      return this.questions.filter(
        (question) =>
          question.question.toLowerCase().includes(q) ||
          (question.ID && question.ID.toString().includes(q))
      );
    },
  },
  methods: {
    // --- POCZĄTEK POPRAWKI: DODANIE BRAKUJĄCYCH METOD ---
    onQuestionEdited(editedQuestion) {
      const index = this.questions.findIndex((q) => q.ID === editedQuestion.ID);
      if (index !== -1) {
        // Użyj $set lub splice, aby zapewnić reaktywność
        this.questions.splice(index, 1, editedQuestion);
      }
    },
    onQuestionDeleted(deletedQuestion) {
      this.questions = this.questions.filter((q) => q.ID !== deletedQuestion.ID);
    },
    // --- KONIEC POPRAWKI ---

    async clearQuestions() {
      this.showClearQuestionsModal = false;
      this.loading = true;
      try {
        await apiClient.post('/questions/clear');
        alert('Baza pytań została wyczyszczona!');
        await this.fetchQuestions();
      } catch (e) {
        alert('Błąd czyszczenia bazy pytań.');
      }
      this.loading = false;
    },
    async fetchQuestions() {
      this.loading = true;
      try {
        const res = await apiClient.get('/questions');
        this.questions = res.data;
        this.categories = [...new Set(res.data.map((q) => q.category).filter(Boolean))];
      } catch (error) {
        console.error('Błąd ładowania pytań:', error);
      }
      this.loading = false;
    },
    openAddPopup() {
      this.formModel = {
        question: '',
        answer_a: { answer: '', isCorret: false },
        answer_b: { answer: '', isCorret: false },
        answer_c: { answer: '', isCorret: false },
        category: '',
        description: '',
      };
      this.showAddPopup = true;
    },
    closeAddPopup() {
      this.showAddPopup = false;
    },
    async saveNewQuestion() {
      this.loading = true;
      try {
        const response = await apiClient.post('/questions', this.formModel);
        this.questions.unshift(response.data); // Dodaj nowe pytanie na początek listy
        this.closeAddPopup();
      } catch (error) {
        console.error('Błąd dodawania pytania:', error);
      }
      this.loading = false;
    },
    confirmNewCategory() {
      const newCat = this.newCategoryInput.trim();
      if (!newCat) return;
      if (!this.categories.includes(newCat)) {
        this.categories.push(newCat);
      }
      this.formModel.category = newCat;
      this.newCategoryInput = '';
    },
    toggleRow(id) {
      const idx = this.expandedRows.indexOf(id);
      if (idx === -1) this.expandedRows.push(id);
      else this.expandedRows.splice(idx, 1);
    },
    async exportQuestionsExcel() {
      if (this.loading) return;
      this.loading = true;
      try {
        const response = await apiClient.get('/questions/export/excel', {
          responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'pytania.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (e) {
        const errorMessage = e.response?.data?.error || e.message || 'Nieznany błąd';
        alert(`Błąd eksportu do Excela: ${errorMessage}`);
      } finally {
        this.loading = false;
      }
    },
    async importQuestions(event) {
      const file = event.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      this.loading = true;
      try {
        await apiClient.post('/questions/import/excel', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Pytania zostały pomyślnie zaimportowane!');
        await this.fetchQuestions();
      } catch (error) {
        console.error('Błąd importu pliku:', error);
        const errorMessage = error.response?.data?.error || 'Nieznany błąd serwera.';
        alert(`Wystąpił błąd podczas importu: ${errorMessage}`);
      } finally {
        this.loading = false;
        event.target.value = ''; // Reset inputa, aby można było wgrać ten sam plik ponownie
      }
    },
    setCorrectAnswer(correctKey) {
      this.formModel.answer_a.isCorret = false;
      this.formModel.answer_b.isCorret = false;
      this.formModel.answer_c.isCorret = false;
      this.formModel[`answer_${correctKey}`].isCorret = true;
    },
  },
};
</script>

<style scoped>
.scroller {
  height: 70vh; /* Nadaj scrollerowi konkretną, stałą wysokość */
  overflow-y: auto; /* KLUCZOWA ZMIANA: Włącz pionowy pasek przewijania w razie potrzeby */
}
</style>
