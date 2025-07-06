<template>
  <div>
    <!-- Nowy, bezpośredni układ przycisków akcji -->
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
      <!-- Modal usuwania (odświeżony wygląd) -->
      <BaseModal :show="showDelete" @close="showDelete = false">
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
        <template #header>Usuń pytanie</template>
        <p class="text-sm text-slate-500">
          Czy na pewno chcesz usunąć to pytanie? Ta akcja jest nieodwracalna.
        </p>
        <p class="mt-2 text-sm font-semibold text-slate-700 bg-slate-100 p-2 rounded-md">
          "{{ question && question.question }}"
        </p>
        <template #footer>
          <BaseButton color="red" @click="deleteQuestion" :loading="loading">Tak, usuń</BaseButton>
          <BaseButton color="gray" @click="showDelete = false">Anuluj</BaseButton>
        </template>
      </BaseModal>

      <!-- Modal edycji (całkowicie przebudowany) -->
      <BaseModal :show="showEdit" @close="showEdit = false" class="!max-w-5xl">
        <template #header>Edycja pytania</template>
        <form v-if="editData" @submit.prevent="saveEdit">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6">
            <!-- LEWA KOLUMNA: Pytanie i Odpowiedzi -->
            <div class="lg:col-span-2 space-y-6">
              <div>
                <label class="block text-sm font-medium text-slate-700" for="edit-question-text"
                  >Treść pytania</label
                >
                <textarea
                  v-model="editData.question"
                  id="edit-question-text"
                  rows="4"
                  class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                  required
                ></textarea>
              </div>
              <div class="space-y-4">
                <div v-for="key in ['a', 'b', 'c']" :key="key">
                  <label
                    :for="`edit-answer-${key}`"
                    class="block text-sm font-medium text-slate-700"
                    >Odpowiedź {{ key.toUpperCase() }}</label
                  >
                  <input
                    type="text"
                    :id="`edit-answer-${key}`"
                    v-model="editData[`answer_${key}`].answer"
                    class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <!-- PRAWA KOLUMNA: Ustawienia -->
            <div class="bg-slate-50 rounded-lg p-6 space-y-6 border">
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
                      editData[`answer_${key}`].isCorret
                        ? 'bg-green-600 text-white border-green-600 shadow'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-200',
                    ]"
                  >
                    {{ key.toUpperCase() }}
                  </button>
                </div>
              </div>
              <div>
                <label for="edit-category" class="block text-sm font-medium text-slate-800"
                  >Kategoria</label
                >
                <input
                  v-model="editData.category"
                  id="edit-category"
                  class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                />
              </div>
              <div>
                <label for="edit-description" class="block text-sm font-medium text-slate-800"
                  >Opis (opcjonalnie)</label
                >
                <input
                  type="text"
                  v-model="editData.description"
                  id="edit-description"
                  class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </form>
        <template #footer>
          <BaseButton color="gray" @click="showEdit = false">Anuluj</BaseButton>
          <BaseButton color="blue" type="submit" @click="saveEdit" :loading="loading"
            >Zapisz zmiany</BaseButton
          >
        </template>
      </BaseModal>
    </Teleport>
  </div>
</template>

<script>
import apiClient from '@/api';
import BaseButton from './BaseButton.vue';
import BaseModal from './BaseModal.vue';
import IconButton from './IconButton.vue';

export default {
  props: {
    question: { type: Object, required: true },
  },
  emits: ['deleted', 'edit'],
  components: { BaseButton, BaseModal, IconButton },
  data() {
    return {
      showDelete: false,
      showEdit: false,
      loading: false,
      editData: null,
    };
  },
  methods: {
    openEditModal() {
      this.editData = JSON.parse(JSON.stringify(this.question));
      this.showEdit = true;
    },
    setCorrectAnswer(correctKey) {
      if (!this.editData) return;
      this.editData.answer_a.isCorret = false;
      this.editData.answer_b.isCorret = false;
      this.editData.answer_c.isCorret = false;
      this.editData[`answer_${correctKey}`].isCorret = true;
    },
    async saveEdit() {
      this.loading = true;
      try {
        await apiClient.put(`/questions/${this.editData.ID}`, this.editData);
        this.$emit('edit', this.editData);
        this.showEdit = false;
      } catch (e) {
        console.error('Błąd zapisu pytania:', e);
        alert('Błąd zapisu pytania.');
      }
      this.loading = false;
    },
    async deleteQuestion() {
      this.loading = true;
      try {
        const id = this.question.ID;
        await apiClient.delete(`/questions/${id}`);
        this.$emit('deleted', this.question);
        this.showDelete = false;
      } catch (e) {
        console.error('Błąd usuwania pytania:', e);
        alert('Błąd usuwania pytania.');
      }
      this.loading = false;
    },
  },
};
</script>
