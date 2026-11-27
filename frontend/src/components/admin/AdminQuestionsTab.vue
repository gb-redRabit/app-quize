<template>
  <div>
      <!-- Szybkie akcje -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          @click="openAddPopup"
          class="text-left w-full surface p-4 flex items-center gap-4 hover:shadow-md transition-shadow focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span class="bg-blue-500 p-3 rounded-full shrink-0">
            <img
              src="@/assets/icons/add.svg"
              alt=""
              class="w-6 h-6 text-gray-600 dark:text-gray-200"
            />
          </span>
          <span class="min-w-0">
            <span class="block font-semibold text-gray-800 dark:text-gray-100">Dodaj pytanie</span>
            <span class="block text-sm text-blue-600 dark:text-blue-400">Otwórz formularz</span>
          </span>
        </button>
        <div
          class="surface p-4 flex items-center gap-4"
        >
          <div class="bg-green-100 dark:bg-green-700 p-3 rounded-full">
            <img
              src="@/assets/icons/download.svg"
              alt="Eksport"
              class="w-6 h-6 text-green-600 dark:text-green-200"
            />
          </div>
          <div>
            <h3 class="font-semibold text-gray-700 dark:text-gray-100">Eksport</h3>
            <BaseButton
              color="green"
              size="sm"
              :loading="exportingExcel"
              class="mt-1"
              @click="exportQuestionsExcel"
            >
              {{ exportingExcel ? 'Eksportuję…' : 'Pobierz plik .xlsx' }}
            </BaseButton>
          </div>
        </div>
        <div
          class="surface p-4 flex items-center gap-4"
        >
          <div class="bg-blue-100 dark:bg-blue-700 p-3 rounded-full">
            <img
              src="@/assets/icons/upload.svg"
              alt="Import"
              class="w-6 h-6 text-blue-600 dark:text-blue-200"
            />
          </div>
          <div>
            <h3 class="font-semibold text-gray-700 dark:text-gray-100">Import</h3>
            <button
              type="button"
              class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-medium"
              @click="excelInput?.click()"
            >
              Wybierz plik .xlsx
            </button>
            <input
              ref="excelInput"
              type="file"
              accept=".xlsx"
              class="hidden"
              @change="importQuestions"
            />
            <BaseButton color="gray" size="sm" @click="showExcelInfo = true" class="block mt-1 p-1"
              >Jak przygotować plik?</BaseButton
            >
          </div>
        </div>
        <div
          class="surface p-4 flex items-center gap-4"
        >
          <div class="bg-red-100 dark:bg-red-700 p-3 rounded-full">
            <img
              src="@/assets/icons/trash.svg"
              alt="Usuń"
              class="w-6 h-6 text-red-600 dark:text-red-200"
            />
          </div>
          <div>
            <h3 class="font-semibold text-gray-700 dark:text-gray-100">Strefa niebezpieczna</h3>
            <BaseButton color="red" size="sm" @click="showClearQuestionsModal = true" class="mt-1"
              >Wyczyść bazę pytań</BaseButton
            >
          </div>
        </div>
      </div>

    <!-- Modale -->
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
          class="mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-700 sm:mx-0 sm:h-10 sm:w-10"
        >
          <img
            src="@/assets/icons/warning.svg"
            alt="Ostrzeżenie"
            class="h-6 w-6 text-red-600 dark:text-red-200"
          />
        </div>
      </template>
      <template #header>Wyczyść bazę pytań</template>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Czy na pewno chcesz usunąć <b>wszystkie</b> pytania? Tej operacji nie można cofnąć.
      </p>
      <div class="mt-4">
        <label
          for="clear-confirm"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Wpisz <b>{{ clearConfirmPhrase }}</b>, aby potwierdzić
        </label>
        <input
          id="clear-confirm"
          v-model="clearConfirmText"
          type="text"
          autocomplete="off"
          autocapitalize="characters"
          spellcheck="false"
          class="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-red-400"
          :placeholder="clearConfirmPhrase"
        />
      </div>
      <template #footer>
        <BaseButton color="red" :disabled="!clearConfirmValid" @click="clearQuestions"
          >Tak, usuń wszystko</BaseButton
        >
        <BaseButton color="gray" @click="showClearQuestionsModal = false">Anuluj</BaseButton>
      </template>
    </BaseModal>

    <BaseModal :show="showAddPopup" @close="closeAddPopup">
      <template #header>Nowe pytanie</template>
      <div
        v-if="formErrors.general"
        role="alert"
        class="mb-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-3 py-2 text-sm text-red-700 dark:text-red-200"
      >
        {{ formErrors.general }}
      </div>
      <form @submit.prevent>
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
                class="mt-1 p-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                :class="
                  formErrors.question
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : ''
                "
                :aria-invalid="Boolean(formErrors.question)"
                aria-describedby="question-error"
                @input="clearFormError('question')"
                placeholder="Wpisz treść pytania..."
                required
              ></textarea>
              <p
                v-if="formErrors.question"
                id="question-error"
                class="mt-1 text-xs font-medium text-red-600 dark:text-red-400"
              >
                {{ formErrors.question }}
              </p>
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
                  class="mt-1 p-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  :class="
                    formErrors[`answer_${key}`]
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : ''
                  "
                  :aria-invalid="Boolean(formErrors[`answer_${key}`])"
                  :aria-describedby="`answer-${key}-error`"
                  @input="clearFormError(`answer_${key}`)"
                  :placeholder="`Treść odpowiedzi ${key.toUpperCase()}`"
                  required
                />
                <p
                  v-if="formErrors[`answer_${key}`]"
                  :id="`answer-${key}-error`"
                  class="mt-1 text-xs font-medium text-red-600 dark:text-red-400"
                >
                  {{ formErrors[`answer_${key}`] }}
                </p>
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
                  :id="`correct-${key}`"
                  :aria-invalid="Boolean(formErrors.correct)"
                  @click="
                    setCorrectAnswer(key);
                    clearFormError('correct');
                  "
                  :class="[
                    'p-2 rounded-md text-sm font-semibold border-2 transition-all',
                    formModel[`answer_${key}`].isCorret
                      ? 'bg-green-600 text-white border-green-600 shadow-sm dark:bg-green-500 dark:border-green-500'
                      : formErrors.correct
                        ? 'bg-white text-gray-700 border-red-400 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-red-500 dark:hover:bg-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-900',
                  ]"
                >
                  {{ key.toUpperCase() }}
                </button>
              </div>
              <p
                v-if="formErrors.correct"
                class="mt-2 text-xs font-medium text-red-600 dark:text-red-400"
              >
                {{ formErrors.correct }}
              </p>
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
                class="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                :class="
                  formErrors.category
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : ''
                "
                :aria-invalid="Boolean(formErrors.category)"
                aria-describedby="category-error"
                @change="clearFormError('category')"
                required
              >
                <option value="" disabled>Wybierz kategorię</option>
                <option v-for="cat in categoriesFromStats" :key="cat" :value="cat">
                  {{ cat }}
                </option>
                <option value="__nowa__">[Dodaj nową kategorię]</option>
              </select>
              <div v-if="formModel.category === '__nowa__'" class="flex gap-2 mt-2">
                <input
                  v-model="newCategoryInput"
                  @keyup.enter.prevent="confirmNewCategory()"
                  class="block w-full rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  :class="
                    formErrors.category
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : ''
                  "
                  placeholder="Nowa kategoria"
                  @input="clearFormError('category')"
                />
                <BaseButton size="sm" color="green" type="button" @click="confirmNewCategory()"
                  >OK</BaseButton
                >
              </div>
              <p
                v-if="formErrors.category"
                id="category-error"
                class="mt-1 text-xs font-medium text-red-600 dark:text-red-400"
              >
                {{ formErrors.category }}
              </p>
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
                class="mt-1 p-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                :class="
                  formErrors.description
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : ''
                "
                :aria-invalid="Boolean(formErrors.description)"
                @input="clearFormError('description')"
                placeholder="Np. podstawa prawna"
              />
              <p
                v-if="formErrors.description"
                class="mt-1 text-xs font-medium text-red-600 dark:text-red-400"
              >
                {{ formErrors.description }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 mt-6"
        >
          <h3 class="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">
            Flagi i oznaczenia pytania
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- Flagged -->
            <div
              class="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-600 shadow-xs"
              :class="{ 'ring-2 ring-green-300 dark:ring-green-500': formModel.flagged }"
            >
              <label class="flex items-center justify-between gap-2 cursor-pointer">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Ważne/Sprawdzone</span
                >
                <div class="relative">
                  <input
                    type="checkbox"
                    v-model="formModel.flagged"
                    class="sr-only peer"
                    @change="flagChangedAdd('flagged')"
                  />
                  <div
                    :class="{ 'bg-green-300 dark:bg-green-500': formModel.flagged }"
                    class="w-10 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"
                  ></div>
                </div>
              </label>
            </div>
            <!-- Bad -->
            <div
              class="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-600 shadow-xs"
              :class="{ 'ring-2 ring-red-300 dark:ring-red-500': formModel.bad }"
            >
              <label class="flex items-center justify-between gap-2 cursor-pointer">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Złe pytanie</span
                >
                <div class="relative">
                  <input
                    type="checkbox"
                    v-model="formModel.bad"
                    class="sr-only peer"
                    @change="flagChangedAdd('bad')"
                  />
                  <div
                    :class="{ 'bg-red-300 dark:bg-red-500': formModel.bad }"
                    class="w-10 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-red-500"
                  ></div>
                </div>
              </label>
            </div>
            <!-- Unknown -->
            <div
              class="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-600 shadow-xs"
              :class="{ 'ring-2 ring-yellow-300 dark:ring-yellow-500': formModel.unknown }"
            >
              <label class="flex items-center justify-between gap-2 cursor-pointer">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Nie wiem</span>
                <div class="relative">
                  <input
                    type="checkbox"
                    v-model="formModel.unknown"
                    class="sr-only peer"
                    @change="flagChangedAdd('unknown')"
                  />
                  <div
                    :class="{ 'bg-yellow-300 dark:bg-yellow-500': formModel.unknown }"
                    class="w-10 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-500"
                  ></div>
                </div>
              </label>
            </div>
          </div>
          <!-- Notatka -->
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Notatka do pytania</label
            >
            <input
              type="text"
              v-model="formModel.note"
              id="note"
              class="mt-1 p-2 block w-full rounded-lg border border-gray-200 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
              :class="
                formErrors.note
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : ''
              "
              :aria-invalid="Boolean(formErrors.note)"
              @input="clearFormError('note')"
              placeholder="Dodaj notatkę..."
            />
            <p
              v-if="formErrors.note"
              class="mt-1 text-xs font-medium text-red-600 dark:text-red-400"
            >
              {{ formErrors.note }}
            </p>
          </div>
        </div>
      </form>
      <template #footer>
        <BaseButton color="gray" type="button" @click="closeAddPopup()">Anuluj</BaseButton>
        <BaseButton color="blue" type="button" :loading="isSaving" @click="saveNewQuestion">
          Zapisz pytanie
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import apiClient from '@/api';
import { queueQuestionCreate, queueExcelImport } from '@/services/offlineSync';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseModal from '@/components/base/BaseModal.vue';

const store = useStore();
const showAlert = inject('showAlert');

const categoriesFromStats = computed(() => store.getters['questions/getCategories'] || []);
const categories = ref([]);
const excelInput = ref(null);
const showAddPopup = ref(false);
const newCategoryInput = ref('');
const showExcelInfo = ref(false);
const showClearQuestionsModal = ref(false);
const clearConfirmText = ref('');
const clearConfirmPhrase = 'USUŃ';
const exportingExcel = ref(false);
const isSaving = ref(false);

function normalizePhrase(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const clearConfirmValid = computed(
  () => normalizePhrase(clearConfirmText.value) === normalizePhrase(clearConfirmPhrase)
);

watch(showClearQuestionsModal, (visible) => {
  clearConfirmText.value = '';
  if (visible) {
    setTimeout(() => document.getElementById('clear-confirm')?.focus(), 50);
  }
});

const formModel = ref({
  question: '',
  answer_a: { answer: '', isCorret: false },
  answer_b: { answer: '', isCorret: false },
  answer_c: { answer: '', isCorret: false },
  category: '',
  description: '',
  flagged: false,
  bad: false,
  unknown: false,
  note: '',
});

const formErrors = ref({});

onMounted(async () => {
  try {
    const res = await apiClient.get('/stats');
    categories.value = res.data.categories.map((cat) => cat.name);
    if (categories.value.length === 0) {
      showAlert?.('info', 'Brak kategorii pytań.');
    }
  } catch (e) {
    categories.value = [];
    showAlert?.('error', 'Błąd podczas pobierania kategorii.');
  }
});

function openAddPopup() {
  formModel.value = {
    question: '',
    answer_a: { answer: '', isCorret: false },
    answer_b: { answer: '', isCorret: false },
    answer_c: { answer: '', isCorret: false },
    category: '',
    description: '',
    flagged: false,
    bad: false,
    unknown: false,
    note: '',
  };
  formErrors.value = {};
  newCategoryInput.value = '';
  showAddPopup.value = true;

  setTimeout(() => {
    const field = document.getElementById('question-text');
    if (field) field.focus();
  }, 50);
}

function closeAddPopup() {
  showAddPopup.value = false;
  formErrors.value = {};
}

function clearFormError(field) {
  if (!formErrors.value[field]) return;
  const next = { ...formErrors.value };
  delete next[field];
  formErrors.value = next;
}

function validateNewQuestion() {
  const errors = {};
  const value = formModel.value;

  if (!value.question.trim()) errors.question = 'Podaj treść pytania.';
  else if (value.question.length > 5000) errors.question = 'Maksymalnie 5000 znaków.';

  for (const key of ['a', 'b', 'c']) {
    const field = `answer_${key}`;
    const answer = value[field].answer.trim();
    if (!answer) errors[field] = `Podaj treść odpowiedzi ${key.toUpperCase()}.`;
    else if (answer.length > 2000) errors[field] = 'Maksymalnie 2000 znaków.';
  }

  const correctCount = ['a', 'b', 'c'].filter((key) => value[`answer_${key}`].isCorret).length;
  if (correctCount !== 1) {
    errors.correct = 'Wskaż dokładnie jedną poprawną odpowiedź.';
  }

  if (!value.category) {
    errors.category = 'Wybierz kategorię.';
  } else if (value.category === '__nowa__') {
    if (!newCategoryInput.value.trim()) {
      errors.category = 'Podaj nazwę nowej kategorii.';
    }
  } else if (value.category.length > 200) {
    errors.category = 'Maksymalnie 200 znaków.';
  }

  if (value.description.length > 2000) errors.description = 'Maksymalnie 2000 znaków.';
  if (value.note.length > 1000) errors.note = 'Maksymalnie 1000 znaków.';

  formErrors.value = errors;

  const firstInvalid = [
    ['question', 'question-text'],
    ['answer_a', 'answer-a'],
    ['answer_b', 'answer-b'],
    ['answer_c', 'answer-c'],
    ['correct', 'correct-a'],
    ['category', 'category'],
    ['description', 'description'],
    ['note', 'note'],
  ].find(([field]) => errors[field]);

  if (firstInvalid) {
    setTimeout(() => {
      const element = document.getElementById(firstInvalid[1]);
      if (element) element.focus();
    }, 0);
  }

  return Object.keys(errors).length === 0;
}

async function saveNewQuestion() {
  if (isSaving.value) return;
  formErrors.value = {};

  if (!validateNewQuestion()) return;

  isSaving.value = true;
  try {
    if (formModel.value.category === '__nowa__' && newCategoryInput.value.trim()) {
      formModel.value.category = newCategoryInput.value.trim();
      if (!categories.value.includes(formModel.value.category)) {
        categories.value.push(formModel.value.category);
      }
      newCategoryInput.value = '';
    }

    if (navigator.onLine === false) {
      queueQuestionCreate(formModel.value);
      closeAddPopup();
      showAlert?.('info', 'Brak sieci — pytanie zapisane lokalnie i wysłane później.');
      return;
    }

    try {
      await apiClient.post('/questions', formModel.value);
      showAlert?.('success', 'Pytanie zostało dodane pomyślnie!');
      closeAddPopup();
      await store.dispatch('questions/fetchStats');
    } catch (error) {
      if (!error?.response) {
        queueQuestionCreate(formModel.value);
        closeAddPopup();
        showAlert?.('info', 'Brak sieci — pytanie zapisane lokalnie i wysłane później.');
        return;
      }
      const message =
        error?.response?.data?.message || 'Błąd podczas dodawania pytania. Spróbuj ponownie.';
      formErrors.value = { general: message };
      showAlert?.('error', message);
    }
  } finally {
    isSaving.value = false;
  }
}

function confirmNewCategory() {
  const newCat = newCategoryInput.value.trim();
  if (!newCat) {
    showAlert?.('warning', 'Podaj nazwę nowej kategorii.');
    return;
  }
  if (!categories.value.includes(newCat)) {
    categories.value.push(newCat);
    showAlert?.('success', `Dodano nową kategorię "${newCat}".`);
  } else {
    showAlert?.('info', 'Taka kategoria już istnieje.');
  }
  formModel.value.category = newCat;
  newCategoryInput.value = '';
}

async function exportQuestionsExcel() {
  if (exportingExcel.value) return;
  exportingExcel.value = true;
  try {
    const response = await apiClient.silentGet('/questions/export/excel', {
      responseType: 'blob',
      noCache: true,
      timeout: 120000,
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'pytania.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    showAlert?.('success', 'Pytania zostały wyeksportowane do Excela.');
  } catch (e) {
    const errorMessage = e.response && e.response.data ? e.response.data.error : e.message;
    showAlert?.('error', `Błąd eksportu do Excela: ${errorMessage}`);
  } finally {
    exportingExcel.value = false;
  }
}

async function importQuestions(event) {
  const file = event.target.files[0];
  if (!file) {
    showAlert?.('warning', 'Nie wybrano pliku do importu.');
    return;
  }
  const formData = new FormData();
  formData.append('file', file);

  try {
    if (navigator.onLine === false) {
      await queueExcelImport(file);
      showAlert?.(
        'info',
        'Brak sieci — import zapisany w kolejce i wyśle się po powrocie internetu.',
        5000
      );
      return;
    }

    try {
      const response = await apiClient.post('/questions/import/excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        skipErrorPage: true,
      });

      const data = response.data || {};
      const seconds = data.durationMs ? ` w ${Math.round(data.durationMs / 1000)} s` : '';
      const skipped = data.skipped ? `, pominięto ${data.skipped}` : '';
      showAlert?.('success', `Dodano ${data.added ?? 0} nowych pytań${skipped}${seconds}.`);
      await store.dispatch('questions/fetchStats');
    } catch (error) {
      if (!error?.response) {
        await queueExcelImport(file);
        showAlert?.(
          'info',
          'Brak sieci — import zapisany w kolejce i wyśle się po powrocie internetu.',
          5000
        );
        return;
      }
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message;
      showAlert?.('error', `Wystąpił błąd podczas importu: ${errorMessage}`);
    }
  } catch (queueError) {
    showAlert?.(
      'error',
      queueError?.message || 'Nie udało się zapisać importu do wysłania później.'
    );
  } finally {
    event.target.value = '';
  }
}

function setCorrectAnswer(correctKey) {
  formModel.value.answer_a.isCorret = false;
  formModel.value.answer_b.isCorret = false;
  formModel.value.answer_c.isCorret = false;
  formModel.value[`answer_${correctKey}`].isCorret = true;
}

async function clearQuestions() {
  showClearQuestionsModal.value = false;
  try {
    await apiClient.post('/questions/clear');
    showAlert?.('success', 'Baza pytań została pomyślnie wyczyszczona!');
    await store.dispatch('questions/fetchStats');
  } catch (e) {
    showAlert?.('error', 'Błąd podczas czyszczenia bazy pytań.');
  }
}

function flagChangedAdd(flagType) {
  if (flagType === 'flagged' && formModel.value.flagged) {
    formModel.value.bad = false;
  } else if (flagType === 'bad' && formModel.value.bad) {
    formModel.value.flagged = false;
  }
}

defineExpose({ openAddPopup });
</script>
