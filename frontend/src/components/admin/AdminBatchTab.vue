<template>
  <div>
      <!-- Grupowa edycja pytań -->
      <div
        class="surface p-6 space-y-6"
      >
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Grupowa edycja pytań po ID
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              for="batch-ids"
              class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >ID pytań (oddzielone przecinkami lub zakresami)</label
            >
            <input
              type="text"
              id="batch-ids"
              v-model="batchIdsInput"
              class="p-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="Np. 123, 456, 789 lub 123 - 125 albo 123-130, 131, 132-134"
            />
          </div>
          <div>
            <label
              for="batch-category"
              class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >Nowa kategoria (opcjonalnie)</label
            >
            <select
              id="batch-category"
              v-model="batchEditCategory"
              class="p-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">-- Bez zmiany --</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >Nowy opis (opcjonalnie)</label
            >
            <div class="flex gap-2">
              <input
                type="text"
                v-model="batchEditDescPart1"
                class="p-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="Część 1 opisu (np. dowolny tekst)"
              />
              <input
                type="text"
                v-model="batchEditDescPart2"
                style="width: 12rem"
                class="p-2 block rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder='Część "art..."'
              />
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Druga część powinna zaczynać się od "art" (np. art. 12 ust. 1 ...)
            </div>
          </div>
        </div>
        <div class="mt-4 flex flex-col md:flex-row gap-2">
          <BaseButton
            color="blue"
            @click="fetchBatchQuestions"
            class="w-full md:w-auto"
            :loading="isFetchingBatch"
          >
            Pobierz pytania
          </BaseButton>
          <BaseButton
            color="green"
            @click="saveBatchEdit"
            :disabled="!batchQuestions.length"
            class="w-full md:w-auto"
            :loading="isSavingBatch"
          >
            Zapisz zmiany
          </BaseButton>
        </div>

        <!-- Tabela z pytaniami do edycji grupowej -->
        <div
          v-if="batchQuestions.length"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 class="text-md font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Znalezione pytania ({{ batchQuestions.length }})
          </h3>
          <div class="overflow-x-auto">
            <table class="min-w-full text-xs bg-white dark:bg-gray-800 rounded-sm shadow-sm">
              <thead>
                <tr>
                  <th class="p-2 text-left">ID</th>
                  <th class="p-2 text-left">Treść</th>
                  <th class="p-2 text-left">Odpowiedzi</th>
                  <th class="p-2 text-left">Poprawne</th>
                  <th class="p-2 text-left">Kategoria</th>
                  <th class="p-2 text-left">Opis</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="q in batchQuestions"
                  :key="q.ID"
                  class="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td class="p-2 font-semibold">{{ q.ID }}</td>
                  <td class="p-2">{{ q.Pytanie || q.question }}</td>
                  <td class="p-2">
                    <span
                      v-for="(odp, idx) in [
                        q.OdpA || q.answer_a,
                        q.OdpB || q.answer_b,
                        q.OdpC || q.answer_c,
                      ]"
                      :key="idx"
                    >
                      {{ odp }}<span v-if="idx < 2">, </span>
                    </span>
                  </td>
                  <td class="p-2">
                    <span
                      v-for="(isCorrect, idx) in [
                        q.PoprawnaA ?? q.isCorrectA,
                        q.PoprawnaB ?? q.isCorrectB,
                        q.PoprawnaC ?? q.isCorrectC,
                      ]"
                      :key="idx"
                    >
                      <span
                        :class="
                          isCorrect
                            ? 'text-green-600 dark:text-green-400 font-bold'
                            : 'text-gray-400'
                        "
                      >
                        {{ isCorrect ? 'Tak' : 'Nie' }}
                      </span>
                      <span v-if="idx < 2">, </span>
                    </span>
                  </td>
                  <td class="p-2">{{ q.Kategoria || q.category }}</td>
                  <td class="p-2">{{ q.Opis || q.description }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue';
import { useStore } from 'vuex';
import apiClient from '@/api';
import { getCachedQuestionsByIds } from '@/services/questionsSync';
import { queueQuestionUpdate } from '@/services/offlineSync';
import BaseButton from '@/components/base/BaseButton.vue';

const store = useStore();
const showAlert = inject('showAlert');

const categories = computed(() =>
  (store.getters['questions/getCategories'] || []).filter(Boolean)
);

const batchIdsInput = ref('');
const batchQuestions = ref([]);
const batchEditCategory = ref('');
const batchEditDescPart1 = ref('');
const batchEditDescPart2 = ref('');
const isFetchingBatch = ref(false);
const isSavingBatch = ref(false);

function splitDescription(desc) {
  if (!desc) return ['', ''];
  const match = desc.match(/^(.*?)(\s*(art.*))$/i);
  if (match) {
    return [match[1].trim(), match[2].trim()];
  }
  return [desc, ''];
}

watch(batchQuestions, (value) => {
  if (value.length === 1) {
    const [part1, part2] = splitDescription(value[0].description || value[0].Opis || '');
    batchEditDescPart1.value = part1;
    batchEditDescPart2.value = part2;
  } else {
    batchEditDescPart1.value = '';
    batchEditDescPart2.value = '';
  }
});

async function fetchBatchQuestions() {
  isFetchingBatch.value = true;
  try {
    const ids = batchIdsInput.value
      .split(',')
      .map((part) => part.trim())
      .flatMap((part) => {
        if (/^\d+$/.test(part)) return [part];
        const match = part.match(/^(\d+)\s*-\s*(\d+)$/);
        if (match) {
          const from = parseInt(match[1], 10);
          const to = parseInt(match[2], 10);
          if (from <= to) {
            return Array.from({ length: to - from + 1 }, (_, i) => String(from + i));
          }
        }
        return [];
      })
      .filter((id) => /^\d+$/.test(id));

    if (!ids.length) {
      showAlert?.(
        'warning',
        'Podaj poprawne ID pytań (oddzielone przecinkami lub zakresy np. 123-130)'
      );
      return;
    }
    try {
      const res = await apiClient.get(`/questions?ids=${ids.join(',')}`);
      batchQuestions.value = Array.isArray(res.data.questions) ? res.data.questions : [];
      if (batchQuestions.value.length === 0) {
        showAlert?.('info', 'Nie znaleziono pytań o podanych ID.');
      }
    } catch (e) {
      const cached = await getCachedQuestionsByIds(ids.map(Number));
      if (cached.length) {
        batchQuestions.value = cached;
        showAlert?.('info', 'Brak sieci — pytania z lokalnego cache.', 4000);
      } else {
        showAlert?.('error', 'Błąd podczas pobierania pytań.');
        batchQuestions.value = [];
      }
    }
  } finally {
    isFetchingBatch.value = false;
  }
}

async function saveBatchEdit() {
  if (!batchQuestions.value.length) return;
  isSavingBatch.value = true;
  let updates = [];

  const clearForm = () => {
    batchQuestions.value = [];
    batchIdsInput.value = '';
    batchEditCategory.value = '';
    batchEditDescPart1.value = '';
    batchEditDescPart2.value = '';
  };

  try {
    updates = batchQuestions.value.map((q) => {
      let newDescription = q.description || q.Opis || '';
      const [oldPart1, oldPart2] = splitDescription(newDescription);

      if (batchEditDescPart1.value !== '' || batchEditDescPart2.value !== '') {
        const part1 = batchEditDescPart1.value !== '' ? batchEditDescPart1.value : oldPart1;
        const part2 = batchEditDescPart2.value !== '' ? batchEditDescPart2.value : oldPart2;
        newDescription = [part1, part2].filter(Boolean).join(' ');
      }

      return {
        ...q,
        category: batchEditCategory.value || q.category,
        description: newDescription,
      };
    });

    if (navigator.onLine === false) {
      updates.forEach((update) => queueQuestionUpdate(update));
      clearForm();
      showAlert?.(
        'info',
        `Brak sieci — ${updates.length} pytań zapisanych lokalnie i wysłanych później.`,
        5000
      );
      return;
    }

    await Promise.all(updates.map((update) => apiClient.put(`/questions/${update.ID}`, update)));
    showAlert?.('success', 'Zaktualizowano wybrane pytania.');
    clearForm();
    await store.dispatch('questions/fetchStats');
  } catch (e) {
    if (!e?.response) {
      updates.forEach((update) => queueQuestionUpdate(update));
      clearForm();
      showAlert?.('info', 'Brak sieci — zmiany zapisane lokalnie i wysłane później.', 5000);
      return;
    }
    showAlert?.('error', 'Błąd podczas grupowej edycji pytań.');
  } finally {
    isSavingBatch.value = false;
  }
}
</script>
