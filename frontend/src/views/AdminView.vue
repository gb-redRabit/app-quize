<template>
  <div class="container mx-auto p-2 sm:p-4 bg-gray-100 min-h-screen">
    <BaseLoader :show="loading" />
    <h1 class="text-2xl font-bold mb-4">Panel administratora</h1>
    <div class="mb-4">
      <BaseButton color="gray" @click="showExcelInfo = true">
        Jak przygotować plik Excel do importu?
      </BaseButton>
    </div>
    <BaseModal :show="showExcelInfo" @close="showExcelInfo = false">
      <h2 class="text-xl font-bold mb-4 text-center">Import pytań z Excela</h2>
      <p class="mb-4">
        Plik Excel powinien mieć następujące kolumny (pierwszy wiersz to
        nagłówki):
      </p>
      <div class="overflow-x-auto mb-4">
        <table class="min-w-full border text-xs">
          <thead>
            <tr class="bg-gray-100">
              <th class="border px-2 py-1">ID</th>
              <th class="border px-2 py-1">Pytanie</th>
              <th class="border px-2 py-1">Odpowiedź A</th>
              <th class="border px-2 py-1">Poprawna A</th>
              <th class="border px-2 py-1">Odpowiedź B</th>
              <th class="border px-2 py-1">Poprawna B</th>
              <th class="border px-2 py-1">Odpowiedź C</th>
              <th class="border px-2 py-1">Poprawna C</th>
              <th class="border px-2 py-1">Kategoria</th>
              <th class="border px-2 py-1">Opis</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border px-2 py-1">Numer</td>
              <td class="border px-2 py-1">Treść pytania</td>
              <td class="border px-2 py-1">Odpowiedź A</td>
              <td class="border px-2 py-1">true / false</td>
              <td class="border px-2 py-1">Odpowiedź B</td>
              <td class="border px-2 py-1">true / false</td>
              <td class="border px-2 py-1">Odpowiedź C</td>
              <td class="border px-2 py-1">true / false</td>
              <td class="border px-2 py-1">Kategoria</td>
              <td class="border px-2 py-1">Opis / podstawa prawna</td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul class="mb-4 list-disc pl-6 text-sm">
        <li>
          W kolumnach <b>Poprawna A/B/C</b> wpisz <b>true/tak/yes/1/x</b> jeśli
          odpowiedź jest poprawna, w przeciwnym razie zostaw puste lub wpisz
          false/0
        </li>
        <li>Pierwszy wiersz musi zawierać nagłówki jak powyżej.</li>
      </ul>
      <div class="text-center">
        <BaseButton color="blue" @click="showExcelInfo = false">
          Zamknij
        </BaseButton>
      </div>
    </BaseModal>

    <div
      class="flex flex-col sm:flex-row justify-between items-center mb-2 gap-2"
    >
      <div class="flex">
        <BaseButton color="blue" @click="openAddPopup">
          Dodaj pytanie
        </BaseButton>
        <BaseButton
          color="blue"
          class="ml-2 mb-2 sm:mb-0 relative overflow-hidden"
        >
          <span>Importuj pytania z Excela</span>
          <input
            type="file"
            accept=".xlsx"
            @change="handleExcelUpload"
            class="absolute inset-0 opacity-0 cursor-pointer"
            style="width: 100%; height: 100%"
            title="Importuj pytania z Excela"
          />
        </BaseButton>
        <BaseButton
          color="green"
          class="ml-2 mb-2 sm:mb-0"
          @click="exportQuestionsExcel"
        >
          Eksportuj do Excela
        </BaseButton>
      </div>
      <SearchBar v-model:search="searchQuery" class="w-full sm:w-80" />
    </div>

    <div class="overflow-x-auto">
      <!-- Mobile/Tablet: Zwijane karty -->
      <div class="block sm:hidden">
        <div
          v-for="question in visibleQuestions"
          :key="question.ID"
          class="bg-white rounded-lg shadow mb-4 border"
        >
          <div
            class="flex justify-between items-center px-4 py-2 cursor-pointer"
            @click="toggleRow(question.ID)"
          >
            <div>
              <span class="text-gray-500 font-bold">ID: {{ question.ID }}</span>
              <span class="ml-2">{{ question.question }}</span>
            </div>
            <svg
              :class="[
                'w-6 h-6 transition-transform',
                { 'rotate-180': expandedRows.includes(question.ID) },
              ]"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          <div v-if="expandedRows.includes(question.ID)" class="px-4 pb-4">
            <div class="mb-2 flex gap-2">
              <IconButton
                color="yellow"
                size="sm"
                title="Edytuj"
                @click.stop="openEditPopup(question)"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h6"
                  />
                </svg>
              </IconButton>
              <IconButton
                color="red"
                size="sm"
                title="Usuń"
                @click.stop="confirmDeleteQuestion(question)"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </IconButton>
            </div>
            <div class="text-xs text-gray-600 mb-1">
              Kategoria: {{ question.category }}
            </div>
            <div class="text-xs text-gray-600 mb-1">
              Opis: {{ question.description }}
            </div>
          </div>
        </div>
      </div>
      <!-- Desktop: Tabela -->
      <table
        class="hidden sm:table min-w-[600px] w-full bg-white border border-gray-300 rounded-lg overflow-hidden shadow text-sm sm:text-base"
      >
        <thead class="bg-gray-100">
          <tr>
            <th class="py-2 px-2 sm:px-4 border-b">ID</th>
            <th class="py-2 px-2 sm:px-4 border-b">Pytanie</th>
            <th class="py-2 px-2 sm:px-4 border-b">Edytuj</th>
            <th class="py-2 px-2 sm:px-4 border-b">Usuń</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="question in visibleQuestions"
            :key="question.ID"
            class="hover:bg-gray-50 transition"
          >
            <td class="py-2 px-2 sm:px-4 border-b break-all sm:w-24">
              {{ question.ID }}
            </td>
            <td class="py-2 px-2 sm:px-4 border-b break-all">
              {{ question.question }}
            </td>
            <td class="py-2 px-2 sm:px-4 border-b text-center">
              <IconButton
                color="yellow"
                size="sm"
                class="mr-2"
                title="Edytuj"
                @click="openEditPopup(question)"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h6"
                  />
                </svg>
              </IconButton>
            </td>
            <td class="py-2 px-2 sm:px-4 border-b text-center">
              <IconButton
                color="red"
                size="sm"
                title="Usuń"
                @click="confirmDeleteQuestion(question)"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </IconButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Popup edycji pytania -->
    <BaseModal :show="showEditPopup" @close="closeEditPopup">
      <h2 class="text-xl font-bold mb-4">Edytuj pytanie</h2>
      <form @submit.prevent="saveEdit">
        <div class="mb-4">
          <label class="block font-semibold mb-1" for="edit-question"
            >Treść pytania</label
          >
          <input
            v-model="editQuestion.question"
            class="w-full border rounded p-2"
            required
            id="edit-question"
            name="edit-question"
          />
        </div>
        <div class="mb-4">
          <label class="block font-semibold mb-1" for="edit-answer-a"
            >Odpowiedź A</label
          >
          <input
            v-model="editQuestion.answer_a.answer"
            class="w-full border rounded p-2"
            required
            id="edit-answer-a"
            name="edit-answer-a"
          />
          <label class="inline-flex items-center mt-1">
            <input
              type="checkbox"
              v-model="editQuestion.answer_a.isCorret"
              class="mr-2"
              id="edit-correct-a"
              name="edit-correct-a"
            />
            Poprawna
          </label>
        </div>
        <div class="mb-4">
          <label class="block font-semibold mb-1" for="edit-answer-b"
            >Odpowiedź B</label
          >
          <input
            v-model="editQuestion.answer_b.answer"
            class="w-full border rounded p-2"
            required
            id="edit-answer-b"
            name="edit-answer-b"
          />
          <label class="inline-flex items-center mt-1">
            <input
              type="checkbox"
              v-model="editQuestion.answer_b.isCorret"
              class="mr-2"
              id="edit-correct-b"
              name="edit-correct-b"
            />
            Poprawna
          </label>
        </div>
        <div class="mb-4">
          <label class="block font-semibold mb-1" for="edit-answer-c"
            >Odpowiedź C</label
          >
          <input
            v-model="editQuestion.answer_c.answer"
            class="w-full border rounded p-2"
            required
            id="edit-answer-c"
            name="edit-answer-c"
          />
          <label class="inline-flex items-center mt-1">
            <input
              type="checkbox"
              v-model="editQuestion.answer_c.isCorret"
              class="mr-2"
              id="edit-correct-c"
              name="edit-correct-c"
            />
            Poprawna
          </label>
        </div>
        <div class="mb-4">
          <label class="block font-semibold mb-1" for="edit-category"
            >Kategoria</label
          >
          <select
            v-model="editQuestion.category"
            class="w-full border rounded p-2"
            required
            id="edit-category"
            name="edit-category"
          >
            <option value="" disabled>Wybierz kategorię</option>
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat }}
            </option>
            <option value="__nowa__">[Dodaj nową kategorię]</option>
          </select>
          <div
            v-if="editQuestion.category === '__nowa__'"
            class="flex gap-2 mt-2"
          >
            <input
              v-model="newCategoryInput"
              class="w-full border rounded p-2"
              placeholder="Wpisz nową kategorię"
              id="edit-new-category"
              name="edit-new-category"
            />
            <BaseButton
              color="green"
              type="button"
              @click="confirmNewCategory('edit')"
            >
              Dodaj
            </BaseButton>
          </div>
        </div>
        <div class="mb-4">
          <label class="block font-semibold mb-1" for="edit-description"
            >Opis / podstawa prawna</label
          >
          <input
            v-model="editQuestion.description"
            class="w-full border rounded p-2"
            id="edit-description"
            name="edit-description"
          />
        </div>
        <BaseButton color="blue" type="submit">Zapisz</BaseButton>
      </form>
    </BaseModal>

    <!-- Popup dodawania pytania -->
    <BaseModal :show="showAddPopup" @close="closeAddPopup">
      <h2 class="text-xl font-bold mb-4">Dodaj pytanie</h2>
      <form @submit.prevent="saveNewQuestion">
        <div class="mb-4">
          <label class="block font-semibold mb-1" for="new-question"
            >Treść pytania</label
          >
          <input
            v-model="newQuestion.question"
            class="w-full border rounded p-2"
            required
            id="new-question"
            name="new-question"
          />
        </div>
        <div class="mb-4">
          <label class="block font-semibold mb-1" for="new-answer-a"
            >Odpowiedź A</label
          >
          <input
            v-model="newQuestion.answer_a.answer"
            class="w-full border rounded p-2"
            required
            id="new-answer-a"
            name="new-answer-a"
          />
          <label class="inline-flex items-center mt-1">
            <input
              type="checkbox"
              v-model="newQuestion.answer_a.isCorret"
              class="mr-2"
              id="new-correct-a"
              name="new-correct-a"
            />
            Poprawna
          </label>
        </div>
        <div class="mb-4">
          <label class="block font-semibold mb-1" for="new-answer-b"
            >Odpowiedź B</label
          >
          <input
            v-model="newQuestion.answer_b.answer"
            class="w-full border rounded p-2"
            required
            id="new-answer-b"
            name="new-answer-b"
          />
          <label class="inline-flex items-center mt-1">
            <input
              type="checkbox"
              v-model="newQuestion.answer_b.isCorret"
              class="mr-2"
              id="new-correct-b"
              name="new-correct-b"
            />
            Poprawna
          </label>
        </div>
        <div class="mb-4">
          <label class="block font-semibold mb-1" for="new-answer-c"
            >Odpowiedź C</label
          >
          <input
            v-model="newQuestion.answer_c.answer"
            class="w-full border rounded p-2"
            required
            id="new-answer-c"
            name="new-answer-c"
          />
          <label class="inline-flex items-center mt-1">
            <input
              type="checkbox"
              v-model="newQuestion.answer_c.isCorret"
              class="mr-2"
              id="new-correct-c"
              name="new-correct-c"
            />
            Poprawna
          </label>
        </div>
        <div class="mb-4">
          <label class="block font-semibold mb-1" for="new-category"
            >Kategoria</label
          >
          <select
            v-model="newQuestion.category"
            class="w-full border rounded p-2"
            required
            id="new-category"
            name="new-category"
          >
            <option value="" disabled>Wybierz kategorię</option>
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat }}
            </option>
            <option value="__nowa__">[Dodaj nową kategorię]</option>
          </select>
          <div
            v-if="newQuestion.category === '__nowa__'"
            class="flex gap-2 mt-2"
          >
            <input
              v-model="newCategoryInput"
              class="w-full border rounded p-2"
              placeholder="Wpisz nową kategorię"
              id="new-new-category"
              name="new-new-category"
            />
            <BaseButton
              color="green"
              type="button"
              @click="confirmNewCategory('new')"
            >
              Dodaj
            </BaseButton>
          </div>
        </div>
        <div class="mb-4">
          <label class="block font-semibold mb-1" for="new-description"
            >Opis / podstawa prawna</label
          >
          <input
            v-model="newQuestion.description"
            class="w-full border rounded p-2"
            id="new-description"
            name="new-description"
          />
        </div>
        <BaseButton color="blue" type="submit">Dodaj</BaseButton>
      </form>
    </BaseModal>

    <!-- Popup potwierdzenia usunięcia -->
    <BaseModal :show="showDeletePopup" @close="cancelDelete">
      <h2 class="text-xl font-bold mb-4 text-center text-red-600">
        Potwierdź usunięcie
      </h2>
      <p class="mb-6 text-center">
        Czy na pewno chcesz usunąć to pytanie?<br />
        <span class="font-semibold text-gray-700">
          {{ questionToDelete && questionToDelete.question }}
        </span>
      </p>
      <div class="flex justify-center gap-4">
        <BaseButton color="red" @click="deleteQuestionConfirmed">
          Tak, usuń
        </BaseButton>
        <BaseButton color="gray" @click="cancelDelete"> Anuluj </BaseButton>
      </div>
    </BaseModal>
  </div>
</template>

<script>
import axios from "axios";
import SearchBar from "@/components/SearchBar.vue";
import BaseButton from "@/components/BaseButton.vue";
import IconButton from "@/components/IconButton.vue";
import BaseModal from "@/components/BaseModal.vue";
import BaseLoader from "@/components/BaseLoader.vue";

export default {
  components: { SearchBar, BaseButton, IconButton, BaseModal, BaseLoader },
  data() {
    return {
      questions: [],
      categories: [],
      showEditPopup: false,
      editQuestion: null,
      showAddPopup: false,
      newQuestion: {
        question: "",
        answer_a: { answer: "", isCorret: false },
        answer_b: { answer: "", isCorret: false },
        answer_c: { answer: "", isCorret: false },
        category: "",
        description: "",
      },
      showDeletePopup: false,
      questionToDelete: null,
      newCategoryInput: "",
      searchQuery: "",
      displayCount: 100,
      loadingMore: false,
      showExcelInfo: false,
      expandedRows: [],
      loading: false,
    };
  },
  created() {
    this.fetchQuestions();
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  computed: {
    filteredQuestions() {
      if (!this.searchQuery) return this.questions;
      const q = this.searchQuery.toLowerCase();
      return this.questions.filter(
        (item) =>
          (item.ID && item.ID.toString().includes(q)) ||
          (item.question && item.question.toLowerCase().includes(q))
      );
    },
    visibleQuestions() {
      return this.filteredQuestions.slice(0, this.displayCount);
    },
    hasMoreQuestions() {
      return this.displayCount < this.filteredQuestions.length;
    },
  },
  methods: {
    async fetchQuestions() {
      this.loading = true;
      try {
        const response = await axios.get("/api/questions");
        this.questions = response.data;
        this.categories = [
          ...new Set(
            response.data
              .map((q) => q.category)
              .filter((cat) => cat && cat.trim() !== "")
          ),
        ];
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
      this.loading = false;
    },
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
    openEditPopup(question) {
      this.editQuestion = JSON.parse(JSON.stringify(question));
      this.showEditPopup = true;
    },
    closeEditPopup() {
      this.showEditPopup = false;
      this.editQuestion = null;
    },
    async saveEdit() {
      this.loading = true;
      try {
        const token = localStorage.getItem("token");
        await axios.put(
          `/api/questions/${this.editQuestion.ID}`,
          this.editQuestion,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        this.showEditPopup = false;
        this.editQuestion = null;
        this.fetchQuestions();
      } catch (error) {
        alert("Błąd podczas zapisu edycji pytania!");
        console.error(error);
      }
      this.loading = false;
    },
    openAddPopup() {
      this.showAddPopup = true;
      this.newQuestion = {
        question: "",
        answer_a: { answer: "", isCorret: false },
        answer_b: { answer: "", isCorret: false },
        answer_c: { answer: "", isCorret: false },
        category: "",
        description: "",
      };
    },
    closeAddPopup() {
      this.showAddPopup = false;
    },
    async saveNewQuestion() {
      this.loading = true;
      try {
        const token = localStorage.getItem("token");
        await axios.post("/api/questions", this.newQuestion, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.showAddPopup = false;
        this.fetchQuestions();
      } catch (error) {
        alert("Błąd podczas dodawania pytania!");
        console.error(error);
      }
      this.loading = false;
    },
    confirmDeleteQuestion(question) {
      this.questionToDelete = question;
      this.showDeletePopup = true;
    },
    async deleteQuestionConfirmed() {
      this.loading = true;
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/api/questions/${this.questionToDelete.ID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.showDeletePopup = false;
        this.questionToDelete = null;
        this.fetchQuestions();
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // Pytanie już nie istnieje, odśwież listę i nie pokazuj alertu
          this.showDeletePopup = false;
          this.questionToDelete = null;
          this.fetchQuestions();
        } else {
          alert("Błąd podczas usuwania pytania!");
          console.error(error);
        }
      }
      this.loading = false;
    },
    cancelDelete() {
      this.showDeletePopup = false;
      this.questionToDelete = null;
    },
    confirmNewCategory(type) {
      const newCat = this.newCategoryInput.trim();
      if (!newCat) return;
      if (!this.categories.includes(newCat)) {
        this.categories.push(newCat);
      }
      if (type === "new") {
        this.newQuestion.category = newCat;
      } else if (type === "edit") {
        this.editQuestion.category = newCat;
      }
      this.newCategoryInput = "";
    },
    toggleRow(id) {
      const idx = this.expandedRows.indexOf(id);
      if (idx === -1) this.expandedRows.push(id);
      else this.expandedRows.splice(idx, 1);
    },
    async exportQuestionsExcel() {
      this.loading = true;
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/questions/export/excel", {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "pytania.xlsx");
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (e) {
        alert("Błąd eksportu do Excela: " + (e.message || e));
      }
      this.loading = false;
    },
    async handleExcelUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      this.loading = true;
      try {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("file", file);

        await axios.post("/api/questions/import/excel", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        window.location.reload();
      } catch (e) {
        alert("Błąd importu pytań z Excela: " + (e.message || e));
      }
      this.loading = false;
      event.target.value = "";
    },
  },
};
</script>

<style scoped></style>
