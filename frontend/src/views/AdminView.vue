<template>
  <div class="container mx-auto p-2 sm:p-4 bg-gray-100 min-h-screen">
    <h1 class="text-2xl font-bold mb-4">Admin Panel</h1>
    <div
      class="flex flex-col sm:flex-row justify-between items-center mb-2 gap-2"
    >
      <button
        @click="openAddPopup"
        class="bg-blue-500 text-white px-4 py-2 rounded mb-2 sm:mb-0"
      >
        Dodaj pytanie
      </button>
      <SearchBar v-model:search="searchQuery" class="w-full sm:w-80" />
    </div>
    <div class="overflow-x-auto">
      <table
        class="min-w-[600px] w-full bg-white border border-gray-300 rounded-lg overflow-hidden shadow text-sm sm:text-base"
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
              <button
                @click="openEditPopup(question)"
                class="p-2 rounded hover:bg-yellow-100 transition"
                title="Edytuj"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-6 h-6 text-yellow-500 hover:text-yellow-700 transition"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.232 5.232l3.536 3.536M9 13l6.536-6.536a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L5 12l4-4z"
                  />
                </svg>
              </button>
            </td>
            <td class="py-2 px-2 sm:px-4 border-b text-center">
              <button
                @click="confirmDeleteQuestion(question)"
                class="p-2 rounded hover:bg-red-100 transition"
                title="Usuń"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-6 h-6 text-red-500 hover:text-red-700 transition"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="showEditPopup"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl relative">
        <button
          class="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl"
          @click="closeEditPopup"
        >
          &times;
        </button>
        <h2 class="text-xl font-bold mb-4">Edytuj pytanie</h2>
        <form @submit.prevent="saveEdit">
          <div class="mb-4">
            <label class="block font-semibold mb-1">Treść pytania</label>
            <input
              v-model="editQuestion.question"
              class="w-full border rounded p-2"
              required
            />
          </div>
          <div class="mb-4">
            <label class="block font-semibold mb-1">Odpowiedź A</label>
            <input
              v-model="editQuestion.answer_a.answer"
              class="w-full border rounded p-2"
              required
            />
            <label class="inline-flex items-center mt-1">
              <input
                type="checkbox"
                v-model="editQuestion.answer_a.isCorret"
                class="mr-2"
              />
              Poprawna
            </label>
          </div>
          <div class="mb-4">
            <label class="block font-semibold mb-1">Odpowiedź B</label>
            <input
              v-model="editQuestion.answer_b.answer"
              class="w-full border rounded p-2"
              required
            />
            <label class="inline-flex items-center mt-1">
              <input
                type="checkbox"
                v-model="editQuestion.answer_b.isCorret"
                class="mr-2"
              />
              Poprawna
            </label>
          </div>
          <div class="mb-4">
            <label class="block font-semibold mb-1">Odpowiedź C</label>
            <input
              v-model="editQuestion.answer_c.answer"
              class="w-full border rounded p-2"
              required
            />
            <label class="inline-flex items-center mt-1">
              <input
                type="checkbox"
                v-model="editQuestion.answer_c.isCorret"
                class="mr-2"
              />
              Poprawna
            </label>
          </div>
          <!-- Edycja pytania -->
          <div class="mb-4">
            <label class="block font-semibold mb-1">Kategoria</label>
            <select
              v-model="editQuestion.category"
              class="w-full border rounded p-2"
              required
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
              />
              <button
                type="button"
                class="bg-green-500 text-white px-3 py-1 rounded"
                @click="confirmNewCategory('edit')"
              >
                Dodaj
              </button>
            </div>
          </div>
          <div class="mb-4">
            <label class="block font-semibold mb-1"
              >Opis / podstawa prawna</label
            >
            <input
              v-model="editQuestion.description"
              class="w-full border rounded p-2"
            />
          </div>
          <button
            type="submit"
            class="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Zapisz
          </button>
        </form>
      </div>
    </div>

    <div
      v-if="showAddPopup"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl relative">
        <button
          class="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl"
          @click="closeAddPopup"
        >
          &times;
        </button>
        <h2 class="text-xl font-bold mb-4">Dodaj pytanie</h2>
        <form @submit.prevent="saveNewQuestion">
          <div class="mb-4">
            <label class="block font-semibold mb-1">Treść pytania</label>
            <input
              v-model="newQuestion.question"
              class="w-full border rounded p-2"
              required
            />
          </div>
          <div class="mb-4">
            <label class="block font-semibold mb-1">Odpowiedź A</label>
            <input
              v-model="newQuestion.answer_a.answer"
              class="w-full border rounded p-2"
              required
            />
            <label class="inline-flex items-center mt-1">
              <input
                type="checkbox"
                v-model="newQuestion.answer_a.isCorret"
                class="mr-2"
              />
              Poprawna
            </label>
          </div>
          <div class="mb-4">
            <label class="block font-semibold mb-1">Odpowiedź B</label>
            <input
              v-model="newQuestion.answer_b.answer"
              class="w-full border rounded p-2"
              required
            />
            <label class="inline-flex items-center mt-1">
              <input
                type="checkbox"
                v-model="newQuestion.answer_b.isCorret"
                class="mr-2"
              />
              Poprawna
            </label>
          </div>
          <div class="mb-4">
            <label class="block font-semibold mb-1">Odpowiedź C</label>
            <input
              v-model="newQuestion.answer_c.answer"
              class="w-full border rounded p-2"
              required
            />
            <label class="inline-flex items-center mt-1">
              <input
                type="checkbox"
                v-model="newQuestion.answer_c.isCorret"
                class="mr-2"
              />
              Poprawna
            </label>
          </div>
          <!-- Dodawanie pytania -->
          <div class="mb-4">
            <label class="block font-semibold mb-1">Kategoria</label>
            <select
              v-model="newQuestion.category"
              class="w-full border rounded p-2"
              required
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
              />
              <button
                type="button"
                class="bg-green-500 text-white px-3 py-1 rounded"
                @click="confirmNewCategory('new')"
              >
                Dodaj
              </button>
            </div>
          </div>
          <div class="mb-4">
            <label class="block font-semibold mb-1"
              >Opis / podstawa prawna</label
            >
            <input
              v-model="newQuestion.description"
              class="w-full border rounded p-2"
            />
          </div>
          <button
            type="submit"
            class="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Dodaj
          </button>
        </form>
      </div>
    </div>

    <div
      v-if="showDeletePopup"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
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
          <button
            @click="deleteQuestionConfirmed"
            class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold"
          >
            Tak, usuń
          </button>
          <button
            @click="cancelDelete"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-semibold"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import SearchBar from "@/components/SearchBar.vue";

export default {
  components: { SearchBar },
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
      // Paginacja/ładowanie
      displayCount: 100,
      loadingMore: false,
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
    },
    handleScroll() {
      if (this.loadingMore || !this.hasMoreQuestions) return;
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      // Jeśli użytkownik jest blisko dołu strony (np. 200px od dołu)
      if (scrollY + windowHeight + 200 >= docHeight) {
        this.loadingMore = true;
        setTimeout(() => {
          this.displayCount += 100;
          this.loadingMore = false;
        }, 200); // małe opóźnienie dla płynności
      }
    },
    async deleteQuestion(id) {
      if (confirm("Are you sure you want to delete this question?")) {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`/api/questions/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          this.fetchQuestions();
        } catch (error) {
          console.error("Error deleting question:", error);
        }
      }
    },
    openEditPopup(question) {
      // Tworzymy kopię, żeby nie edytować bezpośrednio w liście
      this.editQuestion = JSON.parse(JSON.stringify(question));
      this.showEditPopup = true;
    },
    closeEditPopup() {
      this.showEditPopup = false;
      this.editQuestion = null;
    },
    async saveEdit() {
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
    },
    openDeletePopup(id) {
      this.questionToDelete = id;
      this.showDeletePopup = true;
    },
    closeDeletePopup() {
      this.showDeletePopup = false;
      this.questionToDelete = null;
    },
    confirmDeleteQuestion(question) {
      this.questionToDelete = question;
      this.showDeletePopup = true;
    },
    async deleteQuestionConfirmed() {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/api/questions/${this.questionToDelete.ID}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.showDeletePopup = false;
        this.questionToDelete = null;
        this.fetchQuestions();
      } catch (error) {
        alert("Błąd podczas usuwania pytania!");
        console.error(error);
      }
    },
    cancelDelete() {
      this.showDeletePopup = false;
      this.questionToDelete = null;
    },
    onNewCategoryEdit(type) {
      if (type === "edit" && this.editQuestion.category !== "__nowa__") return;
      if (type === "new" && this.newQuestion.category !== "__nowa__") return;
      // Jeśli użytkownik wpisuje nową kategorię, nie rób nic specjalnego
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
  },
};
</script>

<style scoped></style>
