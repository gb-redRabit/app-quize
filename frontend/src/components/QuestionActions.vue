<template>
  <div>
    <div
      class="relative flex items-center justify-center -ml-3"
      style="min-width: 60px; height: 40px"
    >
      <!-- Przycisk główny -->
      <button
        class="relative z-20 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shadow hover:bg-blue-600 transition"
        @click="toggleMenu"
        :aria-expanded="showMenu"
        title="Opcje pytania"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>
      <!-- Menu rozwijane w dół -->
      <transition name="slide">
        <div
          v-if="showMenu"
          class="absolute left-1/2 top-full mt-2 -translate-x-1/2 flex flex-col gap-2 z-30"
        >
          <button
            class="w-32 h-10 bg-yellow-400 hover:bg-yellow-500 text-white rounded shadow flex items-center justify-center"
            @click="
              openEditModal();
              showMenu = false;
            "
            title="Edytuj"
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h6" />
            </svg>
            Edytuj
          </button>
          <button
            class="w-32 h-10 bg-red-500 hover:bg-red-600 text-white rounded shadow flex items-center justify-center"
            @click="
              showDelete = true;
              showMenu = false;
            "
            title="Usuń"
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" />
            </svg>
            Usuń
          </button>
        </div>
      </transition>
    </div>

    <!-- Modal usuwania -->
    <BaseModal :show="showDelete" @close="showDelete = false">
      <h2 class="text-xl font-bold mb-4 text-center text-red-600">Potwierdź usunięcie</h2>
      <p class="mb-6 text-center">
        Czy na pewno chcesz usunąć to pytanie?<br />
        <span class="font-semibold text-gray-700">
          {{ question && question.question }}
        </span>
      </p>
      <div class="flex justify-center gap-4">
        <BaseButton color="red" @click="deleteQuestion" :loading="loading">Tak, usuń</BaseButton>
        <BaseButton color="gray" @click="showDelete = false">Anuluj</BaseButton>
      </div>
    </BaseModal>
    <!-- Modal edycji -->
    <BaseModal :show="showEdit" @close="showEdit = false">
      <h2 class="text-xl font-bold mb-4 text-center">Edytuj pytanie</h2>
      <form @submit.prevent="saveEdit">
        <div class="mb-2">
          <label class="block font-semibold mb-1">Treść pytania</label>
          <input v-model="editData.question" class="w-full border rounded px-2 py-1" required />
        </div>
        <div class="mb-2">
          <label class="block font-semibold mb-1">Odpowiedź A</label>
          <input
            v-model="editData.answer_a.answer"
            class="w-full border rounded px-2 py-1"
            required
          />
          <label class="inline-flex items-center ml-2">
            <input type="checkbox" v-model="editData.answer_a.isCorret" class="mr-1" />
            Poprawna
          </label>
        </div>
        <div class="mb-2">
          <label class="block font-semibold mb-1">Odpowiedź B</label>
          <input
            v-model="editData.answer_b.answer"
            class="w-full border rounded px-2 py-1"
            required
          />
          <label class="inline-flex items-center ml-2">
            <input type="checkbox" v-model="editData.answer_b.isCorret" class="mr-1" />
            Poprawna
          </label>
        </div>
        <div class="mb-2">
          <label class="block font-semibold mb-1">Odpowiedź C</label>
          <input
            v-model="editData.answer_c.answer"
            class="w-full border rounded px-2 py-1"
            required
          />
          <label class="inline-flex items-center ml-2">
            <input type="checkbox" v-model="editData.answer_c.isCorret" class="mr-1" />
            Poprawna
          </label>
        </div>
        <div class="mb-2">
          <label class="block font-semibold mb-1">Kategoria</label>
          <input v-model="editData.category" class="w-full border rounded px-2 py-1" />
        </div>
        <div class="mb-2">
          <label class="block font-semibold mb-1">Opis</label>
          <input v-model="editData.description" class="w-full border rounded px-2 py-1" />
        </div>
        <div class="flex justify-center gap-4 mt-4">
          <BaseButton color="green" type="submit" :loading="loading">Zapisz</BaseButton>
          <BaseButton color="gray" @click="showEdit = false" type="button">Anuluj</BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script>
import apiClient from '@/api';
import BaseButton from './BaseButton.vue';
import BaseModal from './BaseModal.vue';

export default {
  props: {
    question: { type: Object, required: true },
  },
  emits: ['deleted', 'edit'],
  components: { BaseButton, BaseModal },
  data() {
    return {
      showDelete: false,
      showEdit: false,
      showMenu: false,
      loading: false,
      editData: null,
    };
  },
  methods: {
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
    openEditModal() {
      this.editData = JSON.parse(JSON.stringify(this.question));
      this.showEdit = true;
    },
    async saveEdit() {
      this.loading = true;
      try {
        await apiClient.put(`/questions/${this.editData.ID}`, this.editData);
        this.$emit('edit', this.editData);
        this.showEdit = false;
      } catch (e) {
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
        alert('Błąd usuwania pytania.');
      }
      this.loading = false;
    },
  },
};
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
