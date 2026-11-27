<template>
  <div>
    <div class="surface space-y-6 p-6">
      <h2 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
        Usuń wybraną kategorię
      </h2>
      <div class="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
        <select
          v-model="selectedCategory"
          class="w-full min-w-0 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 sm:flex-1"
          aria-label="Kategoria do usunięcia"
        >
          <option disabled value="">Wybierz kategorię</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <BaseButton
          color="red"
          size="md"
          class="w-full shrink-0 sm:w-auto"
          :disabled="!selectedCategory"
          @click="showConfirmDelete = true"
        >
          Usuń
        </BaseButton>
      </div>
    </div>

    <BaseModal :show="showConfirmDelete" @close="showConfirmDelete = false">
      <template #header>Usuń pytania z kategorii</template>
      <div class="p-4">
        <p>
          Czy na pewno chcesz usunąć <b>wszystkie pytania</b> z kategorii
          <b>{{ selectedCategory }}</b>? Ta operacja jest nieodwracalna.
        </p>
        <div class="mt-4 flex justify-end gap-2">
          <BaseButton color="gray" @click="showConfirmDelete = false">Anuluj</BaseButton>
          <BaseButton color="red" :loading="deleting" @click="deleteCategoryQuestions">
            Usuń
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, inject, ref } from 'vue';
import { useStore } from 'vuex';
import apiClient from '@/api';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseModal from '@/components/base/BaseModal.vue';

const store = useStore();
const showAlert = inject('showAlert');

const categories = computed(() =>
  (store.getters['questions/getCategories'] || []).filter(Boolean)
);
const selectedCategory = ref('');
const showConfirmDelete = ref(false);
const deleting = ref(false);

async function deleteCategoryQuestions() {
  if (!selectedCategory.value) {
    showAlert?.('warning', 'Wybierz kategorię!');
    return;
  }
  deleting.value = true;
  try {
    const res = await apiClient.delete(
      `/questions/category/${encodeURIComponent(selectedCategory.value)}`
    );
    showConfirmDelete.value = false;
    deleting.value = false;

    if (res.data && res.data.success) {
      if (res.data.deletedCount > 0) {
        showAlert?.(
          'success',
          `Usunięto ${res.data.deletedCount} pytań z kategorii "${selectedCategory.value}"`
        );
      } else {
        showAlert?.(
          'info',
          `Nie znaleziono pytań do usunięcia w kategorii "${selectedCategory.value}"`
        );
      }
      await store.dispatch('questions/fetchStats');
      selectedCategory.value = '';
    } else {
      showAlert?.('error', 'Nie udało się usunąć pytań (brak odpowiedzi z serwera)');
    }
  } catch (e) {
    deleting.value = false;
    showConfirmDelete.value = false;
    let msg = 'Błąd usuwania pytań z kategorii';
    if (e.response) {
      msg += ` (${e.response.status}): ${e.response.data?.message || JSON.stringify(e.response.data)}`;
    } else {
      msg += `: ${e.message}`;
    }
    showAlert?.('error', msg);
  }
}
</script>
