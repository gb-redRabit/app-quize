<template>
  <div>
    <div class="flex justify-center items-center gap-2">
      <IconButton color="yellow" size="sm" title="Edytuj" @click="openEditModal">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"
          ></path>
        </svg>
      </IconButton>
      <IconButton color="red" size="sm" title="Usuń" @click="showDelete = true">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          ></path>
        </svg>
      </IconButton>
    </div>

    <Teleport to="body">
      <!-- Modal usuwania -->
      <BaseModal :show="showDelete" @close="showDelete = false">
        <template #icon>
          <div
            class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10 dark:bg-red-800"
          >
            <svg
              class="h-6 w-6 text-red-600 dark:text-red-300"
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
        <template #header>Usuń pytanie</template>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Czy na pewno chcesz usunąć to pytanie? Ta akcja jest nieodwracalna.
        </p>
        <p
          class="mt-2 text-sm font-semibold text-gray-700 bg-gray-100 p-2 rounded-md dark:text-gray-200 dark:bg-gray-700"
        >
          "{{ question.question }}"
        </p>
        <template #footer>
          <BaseButton color="red" @click="deleteQuestion" :loading="loading">Tak, usuń</BaseButton>
          <BaseButton color="gray" @click="showDelete = false">Anuluj</BaseButton>
        </template>
      </BaseModal>

      <!-- Modal edycji -->
      <BaseModal :show="showEdit" @close="closeEditModal" class="w-full">
        <template #header>Edycja pytania</template>
        <form v-if="editData" @submit.prevent="saveEdit">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6">
            <div class="lg:col-span-2 space-y-6">
              <!-- Sekcja pytania - bez zmian -->
              <div>
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  for="edit-question-text"
                  >Treść pytania</label
                >
                <textarea
                  v-model="editData.question"
                  id="edit-question-text"
                  rows="4"
                  class="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400"
                  required
                ></textarea>
              </div>

              <!-- Sekcja odpowiedzi - bez flag -->
              <div class="space-y-4">
                <div v-for="key in ['a', 'b', 'c']" :key="key">
                  <label
                    :for="`edit-answer-${key}`"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Odpowiedź {{ key.toUpperCase() }}</label
                  >
                  <input
                    type="text"
                    :id="`edit-answer-${key}`"
                    v-model="editData[`answer_${key}`].answer"
                    class="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400"
                    required
                  />
                </div>
              </div>

              <!-- NOWA SEKCJA FLAG -->
              <div
                class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
              >
                <h3 class="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Flagi i oznaczenia pytania
                </h3>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <!-- Flagged -->
                  <div
                    class="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm"
                    :class="{
                      'ring-2 ring-green-300 dark:ring-green-500': editData && editData.flagged,
                    }"
                  >
                    <label class="flex items-center justify-between gap-2 cursor-pointer">
                      <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >Ważne/Sprawdzone</span
                      >
                      <div class="relative">
                        <input
                          type="checkbox"
                          v-model="editData.flagged"
                          class="sr-only peer"
                          @change="flagChanged('flagged')"
                        />
                        <div
                          :class="{
                            ' bg-green-300 dark:bg-green-500': editData && editData.flagged,
                          }"
                          class="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"
                        ></div>
                      </div>
                    </label>
                  </div>

                  <!-- Bad -->
                  <div
                    class="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm"
                    :class="{ 'ring-2 ring-red-300 dark:ring-red-500': editData && editData.bad }"
                  >
                    <label class="flex items-center justify-between gap-2 cursor-pointer">
                      <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >Złe pytanie</span
                      >
                      <div class="relative">
                        <input
                          type="checkbox"
                          v-model="editData.bad"
                          class="sr-only peer"
                          @change="flagChanged('bad')"
                        />
                        <div
                          :class="{
                            ' bg-red-300 dark:bg-red-500': editData && editData.bad,
                          }"
                          class="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-red-500"
                        ></div>
                      </div>
                    </label>
                  </div>

                  <!-- Unknown -->
                  <div
                    class="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm"
                    :class="{
                      'ring-2 ring-yellow-300 dark:ring-yellow-500': editData && editData.unknown,
                    }"
                  >
                    <label class="flex items-center justify-between gap-2 cursor-pointer">
                      <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >Nie wiem</span
                      >
                      <div class="relative">
                        <input
                          type="checkbox"
                          v-model="editData.unknown"
                          class="sr-only peer"
                          @change="flagChanged('unknown')"
                        />
                        <div
                          :class="{
                            ' bg-yellow-300 dark:bg-yellow-500': editData && editData.unknown,
                          }"
                          class="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-500"
                        ></div>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Notatka do pytania -->
                <div class="mt-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Notatka do pytania</label
                  >
                  <input
                    type="text"
                    v-model="editData.note"
                    class="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400"
                    placeholder="Dodaj notatkę..."
                  />
                </div>
              </div>
            </div>

            <!-- Prawa kolumna - bez zmian -->
            <div
              class="bg-gray-50 rounded-lg p-6 space-y-6 border dark:bg-gray-800 dark:border-gray-700"
            >
              <div>
                <h3 class="text-sm font-medium text-gray-800 dark:text-gray-200">
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
                      editData[`answer_${key}`].isCorret
                        ? 'bg-green-600 text-white border-green-600 shadow'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600',
                    ]"
                  >
                    {{ key.toUpperCase() }}
                  </button>
                </div>
              </div>
              <div>
                <label
                  for="edit-category"
                  class="block text-sm font-medium text-gray-800 dark:text-gray-200"
                  >Kategoria</label
                >
                <select
                  v-model="editData.category"
                  id="edit-category"
                  class="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400"
                >
                  <option disabled value="">-- wybierz kategorię --</option>
                  <option v-for="cat in categoriesFromStats" :key="cat" :value="cat">
                    {{ cat }}
                  </option>
                  <option value="__new__">+ Utwórz nową kategorię</option>
                </select>
                <input
                  v-if="editData.category === '__new__'"
                  v-model="editData.newCategory"
                  placeholder="Nowa kategoria"
                  class="mt-2 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400"
                />
              </div>
              <div>
                <label
                  for="edit-description"
                  class="block text-sm font-medium text-gray-800 dark:text-gray-200"
                  >Opis (opcjonalnie)</label
                >
                <input
                  type="text"
                  v-model="editData.description"
                  id="edit-description"
                  class="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400"
                />
              </div>
            </div>
          </div>
        </form>
        <template #footer>
          <BaseButton color="gray" @click="closeEditModal">Anuluj</BaseButton>
          <BaseButton color="blue" @click="saveEdit" :loading="loading">Zapisz zmiany</BaseButton>
        </template>
      </BaseModal>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import { useStore } from 'vuex';
import apiClient from '@/api';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseModal from '@/components/base/BaseModal.vue';
import IconButton from '@/components/base/IconButton.vue';

// Props
const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
});

// Emits
const emit = defineEmits(['deleted', 'edit']);

// Store
const store = useStore();

// Global alert
const showAlert = inject('showAlert');

// Reactive state
const showDelete = ref(false);
const showEdit = ref(false);
const loading = ref(false);
const editData = ref(null);
const flagsChanged = ref(false);

// Computed properties
const categoriesFromStats = computed(() => {
  return store.getters['questions/getCategories'] || [];
});

// Methods
function openEditModal() {
  // Głębokie klonowanie obiektu pytania
  editData.value = JSON.parse(JSON.stringify(props.question));

  // Upewnij się, że flagi mają prawidłowe wartości
  editData.value.flagged = !!editData.value.flagged;
  editData.value.bad = !!editData.value.bad;
  editData.value.unknown = !!editData.value.unknown;

  // Resetuj flagę zmian
  flagsChanged.value = false;

  showEdit.value = true;
}

function closeEditModal() {
  showEdit.value = false;
  editData.value = null;
}

function setCorrectAnswer(correctKey) {
  if (!editData.value) return;

  editData.value.answer_a.isCorret = false;
  editData.value.answer_b.isCorret = false;
  editData.value.answer_c.isCorret = false;
  editData.value[`answer_${correctKey}`].isCorret = true;
}

async function saveEdit() {
  if (!editData.value) return;

  // Przygotuj dane do wysłania
  const questionToUpdate = JSON.parse(JSON.stringify(editData.value));

  // Obsługa kategorii
  if (questionToUpdate.category === '__new__' && questionToUpdate.newCategory) {
    questionToUpdate.category = questionToUpdate.newCategory.trim();
  }
  delete questionToUpdate.newCategory;

  // Zamknij modal natychmiast
  showEdit.value = false;

  // Informuj o rozpoczęciu zapisywania (opcjonalnie)
  showAlert('info', 'Zapisywanie zmian...');

  // Natychmiast zaktualizuj lokalne dane
  emit('edit', questionToUpdate);

  // Rozpocznij zapis w tle
  apiClient
    .put(`/questions/${questionToUpdate.ID}`, questionToUpdate)
    .then(() => {
      // Komunikat sukcesu po zakończeniu zapisu
      if (flagsChanged.value) {
        showAlert('success', 'Pytanie zostało zaktualizowane wraz z flagami');
      } else {
        showAlert('success', 'Pytanie zostało zaktualizowane');
      }

      // Odśwież statystyki w tle
      store.dispatch('questions/fetchStats');
    })
    .catch((error) => {
      // W przypadku błędu, informujemy o nim
      console.error('Błąd podczas edycji pytania:', error);
      showAlert('error', 'Wystąpił błąd podczas zapisywania pytania. Odśwież stronę.');

      // Możesz tu dodać kod do przywrócenia starego stanu jeśli potrzeba
    });
}

async function deleteQuestion() {
  loading.value = true;

  try {
    const id = props.question.ID;
    await apiClient.delete(`/questions/${id}`);

    // Odśwież statystyki
    await store.dispatch('questions/fetchStats');

    emit('deleted', props.question);
    showDelete.value = false;
    showAlert('success', 'Pytanie zostało usunięte');
  } catch (e) {
    console.error('Błąd usuwania pytania:', e);
    showAlert('error', 'Błąd podczas usuwania pytania.');
  } finally {
    loading.value = false;
  }
}

// Funkcje do obsługi flag
function flagChanged(flagType) {
  if (!editData.value) return;

  // Dodajemy wizualny efekt zmiany
  flagsChanged.value = true;

  // Logika wykluczania się flag
  if (flagType === 'flagged' && editData.value.flagged) {
    // Jeśli ustawiamy flagged=true, automatycznie wyłączamy bad
    editData.value.bad = false;
  } else if (flagType === 'bad' && editData.value.bad) {
    // Jeśli ustawiamy bad=true, automatycznie wyłączamy flagged
    editData.value.flagged = false;
  }
}

// Dodajmy metodę do szybkiego przełączania flag (można wykorzystać do przycisków poza modalem)
function toggleFlag(question, flagType) {
  const payload = {
    ID: question.ID,
    [flagType]: !question[flagType],
  };

  // Logika wykluczająca dla niektórych flag
  if (flagType === 'flagged' && payload.flagged) {
    payload.bad = false;
  } else if (flagType === 'bad' && payload.bad) {
    payload.flagged = false;
  }

  apiClient
    .patch(`/questions/${question.ID}/flags`, payload)
    .then(() => {
      // Zaktualizuj lokalne dane pytania
      question[flagType] = payload[flagType];
      if (flagType === 'flagged' && payload.flagged) question.bad = false;
      if (flagType === 'bad' && payload.bad) question.flagged = false;

      showAlert('success', `Flaga "${flagType}" zmieniona`);
      store.dispatch('questions/fetchStats');
    })
    .catch((e) => {
      showAlert('error', 'Nie udało się zmienić flagi');
      console.error('Błąd zmiany flagi:', e);
    });
}
</script>
