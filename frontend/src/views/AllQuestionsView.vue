<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6 text-sky-700 dark:text-sky-300">Lista wszystkich pytań</h1>
    <div class="flex flex-col md:flex-row md:items-center gap-4 mb-6">
      <SearchBar
        :modelValue="search"
        @update:search="search = $event"
        placeholder="Szukaj po ID lub treści pytania..."
        class="flex-1"
      />
    </div>

    <div v-if="filteredQuestions.length === 0" class="text-gray-500 mt-8 text-center">
      Brak pytań spełniających kryteria.
    </div>

    <div v-else class="overflow-x-auto rounded-xl shadow">
      <table class="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr class="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
            <th class="p-2">ID</th>
            <th class="p-2">Treść pytania</th>
            <th class="p-2">Kategoria</th>
            <th class="p-2" v-if="isAdmin">Akcje</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(q, idx) in filteredQuestions"
            :key="q.ID"
            :class="[
              'border-t border-gray-200 dark:border-gray-700 transition',
              idx % 2 === 1 ? 'bg-gray-50 dark:bg-gray-900' : '',
            ]"
            class="hover:bg-sky-50 dark:hover:bg-sky-900"
          >
            <td class="p-2 font-mono">{{ q.ID }}</td>
            <td class="p-2">{{ q.question }}</td>
            <td class="p-2">{{ q.category }}</td>
            <td class="p-2" v-if="isAdmin">
              <QuestionActions :question="q" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Nowoczesna paginacja z BaseButton -->
    <nav v-if="pages > 1" class="flex justify-center mt-8">
      <ul class="inline-flex items-center space-x-1">
        <li>
          <BaseButton
            color="gray"
            size="sm"
            class="rounded-l"
            :disabled="page === 1"
            @click="changePage(page - 1)"
            aria-label="Poprzednia strona"
          >
            &laquo;
          </BaseButton>
        </li>
        <li v-for="p in visiblePages" :key="p">
          <BaseButton
            color="gray"
            size="sm"
            class="rounded"
            :class="{ 'bg-sky-500 text-white !border-sky-500': page === p }"
            @click="changePage(p)"
          >
            {{ p }}
          </BaseButton>
        </li>
        <li>
          <BaseButton
            color="gray"
            size="sm"
            class="rounded-r"
            :disabled="page === pages"
            @click="changePage(page + 1)"
            aria-label="Następna strona"
          >
            &raquo;
          </BaseButton>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue';
import SearchBar from '@/components/SearchBar.vue';
import QuestionActions from '@/components/QuestionActions.vue';
import BaseButton from '@/components/BaseButton.vue';
import apiClient from '@/api';
import { useStore } from 'vuex';

const store = useStore();

const showAlert = inject('showAlert');

const search = ref('');
const questions = ref([]);
const page = ref(1);
const limit = ref(50);
const total = ref(0);
const pages = ref(1);
const searching = ref(false);

const currentUser = computed(() => store.getters['user/getUser']);
const isAdmin = computed(() => currentUser.value?.rola === 'admin');

async function fetchQuestions() {
  try {
    if (search.value.trim() === '') {
      searching.value = false;
      const res = await apiClient.get(`/questions?page=${page.value}&limit=${limit.value}`);
      if (!res.data || !Array.isArray(res.data.questions)) {
        showAlert && showAlert('error', 'Błędna odpowiedź serwera podczas pobierania pytań.');
        questions.value = [];
        total.value = 0;
        pages.value = 1;
        return;
      }
      questions.value = res.data.questions;
      total.value = res.data.total;
      pages.value = res.data.pages;
      if (questions.value.length === 0) {
        showAlert && showAlert('info', 'Brak pytań do wyświetlenia.');
      }
    } else {
      searching.value = true;
      const res = await apiClient.get(
        `/questions/search?query=${encodeURIComponent(search.value.trim())}`
      );
      if (!res.data || !Array.isArray(res.data.questions)) {
        showAlert && showAlert('error', 'Błędna odpowiedź serwera podczas wyszukiwania pytań.');
        questions.value = [];
        total.value = 0;
        pages.value = 1;
        page.value = 1;
        return;
      }
      questions.value = res.data.questions;
      total.value = res.data.questions.length;
      pages.value = 1;
      page.value = 1;
      if (questions.value.length === 0) {
        showAlert && showAlert('info', 'Brak wyników wyszukiwania.');
      }
    }
  } catch (e) {
    showAlert && showAlert('error', 'Błąd pobierania pytań');
    questions.value = [];
    total.value = 0;
    pages.value = 1;
  }
}

onMounted(fetchQuestions);
watch([page, search], fetchQuestions);

const filteredQuestions = computed(() => questions.value);

// Nowoczesna paginacja: pokazuj max 5 stron wokół bieżącej
const visiblePages = computed(() => {
  const arr = [];
  let start = Math.max(1, page.value - 2);
  let end = Math.min(pages.value, page.value + 2);
  if (page.value <= 3) end = Math.min(5, pages.value);
  if (page.value >= pages.value - 2) start = Math.max(1, pages.value - 4);
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
});

function changePage(newPage) {
  if (!searching.value && newPage >= 1 && newPage <= pages.value) {
    page.value = newPage;
  } else if (searching.value) {
    showAlert && showAlert('warning', 'Nie można zmienić strony podczas wyszukiwania.');
  }
}
</script>
