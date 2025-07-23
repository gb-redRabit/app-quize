<template>
  <div class="container mx-auto p-4 sm:p-6 lg:p-8">
    <div class="">
      <div class="mb-4">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200">
          Panel Administratora
        </h1>
      </div>

      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-4"
      >
        <div class="p-4 md:p-6">
          <div class="flex flex-col md:flex-row items-center mb-2">
            <div class="flex flex-col md:flex-row gap-2 items-center w-full h-full">
              <SearchBar v-model:search="searchQuery" class="w-full" />
              <BaseButton
                :color="searchMode === 'id' ? 'blue' : 'gray'"
                :outline="searchMode !== 'id'"
                size="sm"
                @click="searchMode = 'id'"
                type="button"
              >
                Szukaj po ID
              </BaseButton>
              <BaseButton
                :color="searchMode === 'text' ? 'blue' : 'gray'"
                :outline="searchMode !== 'text'"
                size="sm"
                @click="searchMode = 'text'"
                type="button"
              >
                Szukaj po treści
              </BaseButton>
            </div>
          </div>

          <div class="flex flex-col md:flex-row gap-4 mb-4">
            <!-- Dodaj select do sortowania po kategorii -->
            <div class="flex items-center gap-2">
              <label for="sort-category" class="text-sm text-gray-700 dark:text-gray-200"
                >Sortuj według kategorii:</label
              >
              <select
                id="sort-category"
                v-model="selectedSortCategory"
                class="rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 text-sm"
              >
                <option value="">Wszystkie</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              @click="openAddPopup"
              class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div class="bg-sky-500 p-3 rounded-full">
                <svg
                  class="w-6 h-6 text-gray-600 dark:text-gray-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800 dark:text-gray-100">Dodaj pytanie</h3>
                <p class="text-sm text-sky-600 dark:text-sky-400">Otwórz formularz</p>
              </div>
            </div>
            <div
              class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex items-center gap-4"
            >
              <div class="bg-green-100 dark:bg-green-700 p-3 rounded-full">
                <svg
                  class="w-6 h-6 text-green-600 dark:text-green-200"
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
                <h3 class="font-semibold text-gray-700 dark:text-gray-100">Eksport</h3>
                <button
                  @click="exportQuestionsExcel"
                  class="text-sm text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200 font-medium"
                >
                  Pobierz plik .xlsx
                </button>
              </div>
            </div>
            <div
              class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex items-center gap-4"
            >
              <div class="bg-sky-100 dark:bg-sky-700 p-3 rounded-full">
                <svg
                  class="w-6 h-6 text-gray-600 dark:text-gray-200"
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
                <h3 class="font-semibold text-gray-700 dark:text-gray-100">Import</h3>
                <label
                  class="text-sm text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200 font-medium cursor-pointer"
                >
                  Wybierz plik .xlsx
                  <input type="file" accept=".xlsx" @change="importQuestions" class="hidden" />
                </label>
                <button
                  @click="showExcelInfo = true"
                  class="block text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  Jak przygotować plik?
                </button>
              </div>
            </div>
            <div
              class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex items-center gap-4"
            >
              <div class="bg-red-100 dark:bg-red-700 p-3 rounded-full">
                <svg
                  class="w-6 h-6 text-red-600 dark:text-red-200"
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
                <h3 class="font-semibold text-gray-700 dark:text-gray-100">Strefa niebezpieczna</h3>
                <button
                  @click="showClearQuestionsModal = true"
                  class="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 font-medium"
                >
                  Wyczyść bazę pytań
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div
          class="hidden sm:flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
        >
          <div
            class="w-24 font-mono text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
          >
            ID
          </div>
          <div
            class="flex-grow font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
          >
            Treść pytania
          </div>
          <div
            class="w-32 text-center font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
          >
            Akcje
          </div>
        </div>

        <DynamicScroller
          :items="filteredQuestions()"
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
                'border-b border-gray-200 dark:border-gray-700 transition-colors duration-150',
                'hover:bg-sky-100/50 dark:hover:bg-sky-900/50',
              ]"
            >
              <div
                :class="[
                  'block sm:hidden p-4',
                  index % 2 === 0 ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-700',
                ]"
              >
                <div
                  class="flex justify-between items-center cursor-pointer"
                  @click="toggleRow(item.ID)"
                >
                  <div class="flex-grow truncate pr-2">
                    <span class="text-gray-400 dark:text-gray-500 font-mono text-xs block"
                      >ID: {{ item.ID }}</span
                    >
                    <span class="text-gray-800 dark:text-gray-200">{{ item.question }}</span>
                    <span v-if="item.flagged" class="text-yellow-500 font-bold ml-2">★ Ważne</span>
                    <span v-if="item.note" class="text-gray-500 ml-2">📝 {{ item.note }}</span>
                  </div>
                  <svg
                    :class="[
                      'w-6 h-6 transition-transform flex-shrink-0 text-gray-500 dark:text-gray-400',
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
                  class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                  <div class="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    <b>Kategoria:</b> {{ item.category || 'Brak' }}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    <b>Opis:</b> {{ item.description || 'Brak' }}
                  </div>
                  <div class="flex">
                    <QuestionActions
                      :question="item"
                      @edit="onQuestionEdited"
                      @deleted="onQuestionDeleted"
                    />
                  </div>
                </div>
              </div>
              <div
                :class="[
                  'hidden sm:flex items-center px-4 py-4',
                  index % 2 === 0 ? 'bg-white dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800',
                ]"
              >
                <div class="w-24 font-mono text-sm text-gray-600 dark:text-gray-400">
                  {{ item.ID }}
                </div>
                <div
                  class="flex-grow text-gray-800 dark:text-gray-200 pr-4 cursor-pointer"
                  @click="toggleRow(item.ID)"
                >
                  <span v-if="!expandedRows.includes(item.ID) && item.question.length > 150">
                    {{ item.question.substring(0, 150) }}...
                  </span>
                  <span v-else>
                    {{ item.question }}
                  </span>
                  <span v-if="item.flagged" class="text-yellow-500 font-bold ml-2">★ Ważne</span>
                  <span v-if="item.note" class="text-gray-500 ml-2">📝 {{ item.note }}</span>
                </div>
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
      <BaseModal :show="showExcelInfo" @close="showExcelInfo = false">
        <template #header>Import pytań z pliku Excel</template>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Przygotuj plik .xlsx z kolumnami w podanej kolejności. Pierwszy wiersz musi zawierać
          nagłówki (nazwy dowolne).
        </p>
        <div class="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <table class="min-w-full text-xs">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr class="text-left">
                <th class="p-2 font-semibold text-gray-700 dark:text-gray-200">ID</th>
                <th class="p-2 font-semibold text-gray-700 dark:text-gray-200">Pytanie</th>
                <th class="p-2 font-semibold text-gray-700 dark:text-gray-200">Odp. A</th>
                <th class="p-2 font-semibold text-gray-700 dark:text-gray-200">Poprawna A</th>
                <th class="p-2 font-semibold text-gray-700 dark:text-gray-200">Odp. B</th>
                <th class="p-2 font-semibold text-gray-700 dark:text-gray-200">Poprawna B</th>
                <th class="p-2 font-semibold text-gray-700 dark:text-gray-200">Odp. C</th>
                <th class="p-2 font-semibold text-gray-700 dark:text-gray-200">Poprawna C</th>
                <th class="p-2 font-semibold text-gray-700 dark:text-gray-200">Kategoria</th>
                <th class="p-2 font-semibold text-gray-700 dark:text-gray-200">Opis</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr class="border-t border-gray-200 dark:border-gray-700">
                <td class="p-2 text-gray-700 dark:text-gray-300">123</td>
                <td class="p-2 text-gray-700 dark:text-gray-300">Treść...</td>
                <td class="p-2 text-gray-700 dark:text-gray-300">Odp...</td>
                <td class="p-2 text-gray-700 dark:text-gray-300">true</td>
                <td class="p-2 text-gray-700 dark:text-gray-300">Odp...</td>
                <td class="p-2 text-gray-700 dark:text-gray-300">false</td>
                <td class="p-2 text-gray-700 dark:text-gray-300">Odp...</td>
                <td class="p-2 text-gray-700 dark:text-gray-300">false</td>
                <td class="p-2 text-gray-700 dark:text-gray-300">Kategoria...</td>
                <td class="p-2 text-gray-700 dark:text-gray-300">Opis...</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul class="mb-4 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300 space-y-1">
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
            class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-700 sm:mx-0 sm:h-10 sm:w-10"
          >
            <svg
              class="h-6 w-6 text-red-600 dark:text-red-200"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 24 24"
            >
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
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Czy na pewno chcesz usunąć <b>wszystkie</b> pytania? Tej operacji nie można cofnąć.
        </p>
        <template #footer>
          <BaseButton color="red" @click="clearQuestions">Tak, usuń wszystko</BaseButton>
          <BaseButton color="gray" @click="showClearQuestionsModal = false">Anuluj</BaseButton>
        </template>
      </BaseModal>

      <BaseModal :show="showAddPopup" @close="closeAddPopup" class="!max-w-5xl">
        <template #header>Nowe pytanie</template>
        <form @submit.prevent="saveNewQuestion()">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6">
            <div class="lg:col-span-2 space-y-6">
              <div>
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  for="question-text"
                  >Treść pytania</label
                >
                <textarea
                  v-model="formModel.question"
                  id="question-text"
                  rows="4"
                  class="mt-1 p-2 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Wpisz treść pytania..."
                  required
                ></textarea>
              </div>
              <div class="space-y-4">
                <div v-for="key in ['a', 'b', 'c']" :key="key">
                  <label
                    :for="`answer-${key}`"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-200"
                    >Odpowiedź {{ key.toUpperCase() }}</label
                  >
                  <input
                    type="text"
                    :id="`answer-${key}`"
                    v-model="formModel[`answer_${key}`].answer"
                    class="mt-1 p-2 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    :placeholder="`Treść odpowiedzi ${key.toUpperCase()}`"
                    required
                  />
                </div>
              </div>
            </div>

            <div
              class="bg-gray-50 rounded-lg p-6 space-y-6 border dark:bg-gray-800 dark:border-gray-700"
            >
              <div>
                <h3 class="text-sm font-medium text-gray-800 dark:text-gray-100">
                  Poprawna odpowiedź
                </h3>
                <div class="grid grid-cols-3 gap-2 mt-2">
                  <button
                    v-for="key in ['a', 'b', 'c']"
                    :key="`btn-${key}`"
                    type="button"
                    @click="setCorrectAnswer(key)"
                    :class="[
                      'p-2 rounded-md text-sm font-semibold border-2 transition-all',
                      formModel[`answer_${key}`].isCorret
                        ? 'bg-green-600 text-white border-green-600 shadow dark:bg-green-500 dark:border-green-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-900',
                    ]"
                  >
                    {{ key.toUpperCase() }}
                  </button>
                </div>
              </div>

              <div>
                <label
                  for="category"
                  class="block text-sm font-medium text-gray-800 dark:text-gray-100"
                  >Kategoria</label
                >
                <select
                  v-model="formModel.category"
                  id="category"
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                    class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Nowa kategoria"
                  />
                  <BaseButton size="sm" color="green" type="button" @click="confirmNewCategory()"
                    >OK</BaseButton
                  >
                </div>
              </div>

              <div>
                <label
                  for="description"
                  class="block text-sm font-medium text-gray-800 dark:text-gray-100"
                  >Opis (opcjonalnie)</label
                >
                <input
                  type="text"
                  v-model="formModel.description"
                  id="description"
                  class="mt-1 p-2 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Np. podstawa prawna"
                />
              </div>
            </div>
          </div>
        </form>
        <template #footer>
          <BaseButton color="gray" type="button" @click="closeAddPopup()">Anuluj</BaseButton>
          <BaseButton color="blue" type="submit" @click="saveNewQuestion()"
            >Zapisz pytanie</BaseButton
          >
        </template>
      </BaseModal>
    </div>
  </div>
</template>

<script>
import SearchBar from '@/components/SearchBar.vue';
import BaseButton from '@/components/BaseButton.vue';
import IconButton from '@/components/IconButton.vue';
import BaseModal from '@/components/BaseModal.vue';
import apiClient from '@/api';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import QuestionActions from '@/components/QuestionActions.vue';
import store from '@/store';

export default {
  components: {
    SearchBar,
    BaseButton,
    IconButton,
    BaseModal,
    DynamicScroller,
    DynamicScrollerItem,
    QuestionActions,
  },
  inject: ['showAlert', 'showLoader', 'hideLoader'],
  data() {
    return {
      questions: [],
      categories: [],
      selectedSortCategory: '',
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
      // PAGINACJA
      page: 1,
      limit: 100,
      total: 0,
      pages: 1,
      isLoadingMore: false,
      cancelSearching: false,
      searchMode: 'text',
    };
  },
  created() {
    this.fetchQuestions();
  },
  watch: {
    async searchQuery(newVal) {
      // Resetuj listę i pobierz od nowa tylko pierwszą stronę
      this.page = 1;
      await this.fetchQuestions(true);

      const q = newVal && newVal.toLowerCase();
      if (this.searchMode === 'id') {
        if (/^\d+$/.test(q)) {
          const found = this.questions.some(
            (question) => question.ID && question.ID.toString() === q
          );
          if (!found && !this.isLoadingMore) {
            await this.loadPageWithId(q);
          }
        }
      } else if (this.searchMode === 'text') {
        if (q && q.length > 2) {
          let found = this.questions.some(
            (question) => question.question && question.question.toLowerCase().includes(q)
          );
          if (!found && !this.isLoadingMore) {
            await this.findQuestionByContent(q);
          }
        }
      }
    },
  },
  methods: {
    async loadPageWithId(id) {
      const idNum = parseInt(id, 10);
      if (!idNum || !this.limit) return;
      const pageToLoad = Math.ceil(idNum / this.limit);

      // Zabezpieczenie: sprawdź zakres strony
      if (pageToLoad < 1 || (this.pages && pageToLoad > this.pages)) {
        this.showAlert('error', `Brak pytania o ID ${id} (poza zakresem bazy pytań).`);
        return;
      }

      this.showLoader(`Pobieranie strony ${pageToLoad} z pytaniem o ID ${id}...`);
      try {
        const res = await apiClient.get(`/questions?page=${pageToLoad}&limit=${this.limit}`);
        const { questions } = res.data;
        // Dodaj nowe pytania do listy, unikając duplikatów
        const newQuestions = questions.filter(
          (q) => !this.questions.some((existing) => existing.ID === q.ID)
        );
        this.questions = [...this.questions, ...newQuestions].sort((a, b) => a.ID - b.ID);
        this.showAlert('success', `Załadowano stronę ${pageToLoad}.`);
        // Wymuś ponowne przeliczenie filteredQuestions
        this.$nextTick(() => {
          const prev = this.searchQuery;
          this.searchQuery = '';
          this.$nextTick(() => {
            this.searchQuery = prev;
          });
        });
      } catch (e) {
        this.showAlert('error', 'Błąd podczas pobierania strony z pytaniem.');
      }
      this.hideLoader();
    },
    // --- POCZĄTEK POPRAWKI: DODANIE BRAKUJĄCYCH METOD ---
    onQuestionEdited(editedQuestion) {
      const index = this.questions.findIndex((q) => q.ID === editedQuestion.ID);
      if (index !== -1) {
        // Użyj $set lub splice, aby zapewnić reaktywność
        this.questions.splice(index, 1, editedQuestion);
      }
    },
    async onQuestionDeleted(deletedQuestion) {
      this.questions = this.questions.filter((q) => q.ID !== deletedQuestion.ID);
    },
    // --- KONIEC POPRAWKI ---

    async clearQuestions() {
      this.showClearQuestionsModal = false;
      this.showLoader('Czyszczenie bazy pytań...');
      try {
        await apiClient.post('/questions/clear');
        this.showAlert('success', 'Baza pytań została pomyślnie wyczyszczona!');
        await this.fetchQuestions();
        await store.dispatch('questions/fetchStats');
      } catch (e) {
        this.showAlert('error', 'Błąd podczas czyszczenia bazy pytań.');
      }
      this.hideLoader();
    },
    async fetchQuestions(reset = true) {
      this.showLoader('Pobieranie pytań...');
      try {
        if (reset) {
          this.page = 1;
          this.questions = [];
        }
        const res = await apiClient.get(`/questions?page=${this.page}&limit=${this.limit}`);
        const { questions, total, page, pages, limit } = res.data;
        this.questions = reset ? questions : [...this.questions, ...questions];
        this.total = total;
        this.page = page;
        this.pages = pages;
        this.limit = limit;
        this.categories = [...new Set(this.questions.map((q) => q.category).filter(Boolean))];
      } catch (error) {
        this.showAlert('error', 'Błąd podczas pobierania pytań.');
        console.error('Błąd pobierania pytań:', error);
      }
      this.hideLoader();
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
      this.showLoader('Zapisywanie nowego pytania...');
      try {
        await apiClient.post('/questions', this.formModel);
        this.showAlert('success', 'Pytanie zostało dodane pomyślnie!');
        this.closeAddPopup();
        // Po dodaniu/edycji/usunięciu pytania:
        await store.dispatch('questions/addQuestion', this.formModel);
        await this.fetchQuestions();
      } catch (error) {
        this.showAlert('error', 'Błąd podczas dodawania pytania.');
        console.error('Błąd dodawania pytania:', error);
      }
      this.hideLoader();
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
      this.showLoader('Eksportowanie do Excela...');
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

        this.showAlert('success', 'Pytania zostały wyeksportowane do Excela.');
      } catch (e) {
        const errorMessage = e.response && e.response.data ? e.response.data.error : e.message;
        this.showAlert('error', `Błąd eksportu do Excela: ${errorMessage}`);
      } finally {
        this.hideLoader();
      }
    },
    async importQuestions(event) {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);
      this.showLoader('Importowanie pytań...');
      try {
        const response = await apiClient.post('/questions/import/excel', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        this.showAlert('success', `Dodano ${response.data.added} nowych pytań.`);
        await store.dispatch('questions/fetchStats');
        await this.fetchQuestions();
      } catch (error) {
        const errorMessage =
          error.response && error.response.data ? error.response.data.error : error.message;
        this.showAlert('error', `Wystąpił błąd podczas importu: ${errorMessage}`);
      } finally {
        event.target.value = ''; // Reset input file
        this.hideLoader();
      }
    },
    setCorrectAnswer(correctKey) {
      this.formModel.answer_a.isCorret = false;
      this.formModel.answer_b.isCorret = false;
      this.formModel.answer_c.isCorret = false;
      this.formModel[`answer_${correctKey}`].isCorret = true;
    },
    async loadMoreQuestions() {
      if (this.isLoadingMore || this.page >= this.pages) return;
      this.isLoadingMore = true;
      try {
        this.page += 1;
        await this.fetchQuestions(false);
      } finally {
        this.isLoadingMore = false;
      }
    },
    filteredQuestions() {
      let result = this.questions;
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        if (/^\d+$/.test(q)) {
          result = result.filter((question) => question.ID && question.ID.toString() === q);
          if (result.length === 0) {
            return [
              {
                ID: q,
                question: `Pytanie o ID ${q} nie zostało znalezione.`,
                notFound: true,
              },
            ];
          }
        } else {
          result = result.filter(
            (question) =>
              question.question.toLowerCase().includes(q) ||
              (question.ID && question.ID.toString().includes(q))
          );
        }
      }
      if (this.selectedSortCategory) {
        result = result.filter((q) => q.category === this.selectedSortCategory);
      }
      return result;
    },
    async findQuestionByContent(query) {
      let currentPage = this.page;
      let anyFound = false;
      this.cancelSearching = false; // resetuj na początku

      while (currentPage < this.pages) {
        if (this.cancelSearching) break; // przerwij jeśli opuszczono stronę
        currentPage += 1;
        this.showLoader(`Szukam pytania: "${query}" (strona ${currentPage})...`);
        try {
          const res = await apiClient.get(`/questions?page=${currentPage}&limit=${this.limit}`);
          const { questions } = res.data;
          const newQuestions = questions.filter(
            (q) => !this.questions.some((existing) => existing.ID === q.ID)
          );
          this.questions = [...this.questions, ...newQuestions];
          const foundOnThisPage = newQuestions.some((q) =>
            q.question.toLowerCase().includes(query.toLowerCase())
          );
          if (foundOnThisPage) {
            anyFound = true;
          }
        } catch (e) {
          this.showAlert('error', 'Błąd podczas pobierania kolejnej strony.');
          break;
        }
        this.hideLoader();
      }
      if (!this.cancelSearching) {
        if (anyFound) {
          this.showAlert('success', 'Znaleziono dopasowane pytania (przeszukano całą bazę).');
        } else {
          this.showAlert('warning', 'Nie znaleziono żadnego pytania z podaną frazą.');
        }
        this.$nextTick(() => {
          const prev = this.searchQuery;
          this.searchQuery = '';
          this.$nextTick(() => {
            this.searchQuery = prev;
          });
        });
      }
      this.hideLoader();
    },
  },
  mounted() {
    // Dodaj nasłuchiwanie scrolla do scroller-a
    const scroller = this.$el.querySelector('.scroller');
    if (scroller) {
      scroller.addEventListener('scroll', () => {
        if (
          scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 50 &&
          !this.isLoadingMore &&
          this.page < this.pages
        ) {
          this.loadMoreQuestions();
        }
      });
    }
  },
  beforeUnmount() {
    // jeśli Vue 2: beforeDestroy()
    this.cancelSearching = true;
  },
};
</script>

<style scoped>
.scroller {
  height: 70vh; /* Nadaj scrollerowi konkretną, stałą wysokość */
  overflow-y: auto; /* KLUCZOWA ZMIANA: Włącz pionowy pasek przewijania w razie potrzeby */
}
</style>
