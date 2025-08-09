<template>
  <div class="container mx-auto">
    <div class="relative mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <!-- Sekcja powitalna -->
      <section class="mb-4">
        <div class="flex flex-col md:flex-row gap-6 items-center">
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Witaj w systemie nauki!
            </h1>
            <p class="mt-2 text-gray-600 dark:text-gray-300">
              Monitoruj swoje postępy i kontynuuj naukę
            </p>
          </div>
          <div class="w-full flex-1 relative sm:w-auto">
            <RandomQuote />
            <!-- Przycisk pomocy -->
          </div>
        </div>
      </section>
      <IconButton
        @click="showUserGuide = true"
        class="info-icon fixed bottom-3 left-3 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
        aria-label="Pokaż instrukcję"
        title="Instrukcja obsługi"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
            clip-rule="evenodd"
          />
        </svg>
      </IconButton>
      <!-- Statystyki -->
      <StatisticsSummary class="statistics-summary" />

      <!-- Przyciski akcji -->
      <QuizButtons
        class="quiz-buttons"
        @show-exam-popup="openExamPopup"
        @show-other-quiz-popup="openOtherQuizPopup"
      />

      <!-- Lista kategorii -->
      <section>
        <CategoryFilter
          v-model:active-filter="activeFilter"
          v-model:view-type="viewType"
          v-model:grid-columns="gridColumns"
          v-model:search-query="searchQuery"
        />

        <template v-if="viewType === 'grid'">
          <div :class="gridLayoutClass">
            <CategoryCard
              v-for="cat in searchedCategories"
              :key="cat"
              :category="cat"
              :show-quiz-options="showQuizOptions[cat]"
              class="categories-list"
              @toggle-quiz-options="showQuizOptions[cat] = !showQuizOptions[cat]"
              @start-quiz="startQuizNotDone"
              @start-exam="startExamNotDone"
              @go-to-questions="goToCategoryQuestions"
              @clear-history="clearCategoryHistory"
            />
          </div>
        </template>

        <template v-else>
          <CategoryList
            :categories="searchedCategories"
            :show-quiz-options="showQuizOptions"
            @toggle-quiz-options="(cat) => (showQuizOptions[cat] = !showQuizOptions[cat])"
            @start-quiz="startQuizNotDone"
            @start-exam="startExamNotDone"
            @go-to-questions="goToCategoryQuestions"
            @clear-history="clearCategoryHistory"
          />
        </template>
      </section>
    </div>

    <!-- Modalne okna -->
    <ExamCategoriesModal
      :show="showExamPopup"
      :categories="questionsHelper.examCategories.value"
      :categoryStats="categoryStats"
      @close="showExamPopup = false"
      @select-category="startExamFromCategory"
    />

    <OtherQuizCategoriesModal
      :show="showOtherQuizPopup"
      :categories="questionsHelper.otherCategories.value"
      :categoryStats="categoryStats"
      @close="showOtherQuizPopup = false"
      @start-quiz="startQuizNotDone"
    />

    <UserGuide :show="showUserGuide" @close="showUserGuide = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, inject, watch, onBeforeMount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import apiClient from '@/api';

// Komponenty
import RandomQuote from '@/components/dashboard/RandomQuote.vue';
import StatisticsSummary from '@/components/dashboard/StatisticsSummary.vue';
import QuizButtons from '@/components/dashboard/QuizButtons.vue';
import CategoryFilter from '@/components/dashboard/CategoryFilter.vue';
import CategoryCard from '@/components/dashboard/CategoryCard.vue';
import CategoryList from '@/components/dashboard/CategoryList.vue';
import ExamCategoriesModal from '@/components/quiz/ExamCategoriesModal.vue';
import OtherQuizCategoriesModal from '@/components/quiz/OtherQuizCategoriesModal.vue';
import UserGuide from '@/components/UserGuide.vue';
import IconButton from '@/components/base/IconButton.vue';

// Hooki
const showAlert = inject('showAlert');
const router = useRouter();
const store = useStore(); // Inicjalizuj store na najwyższym poziomie
const route = useRoute();

// Utworzenie lokalnych obiektów pomocniczych (zamiast composables)
const questionsHelper = (() => {
  const categories = computed(() => store.getters['questions/getCategories'] || []);
  const categoryCounts = computed(() => store.getters['questions/getCategoryCounts'] || {});
  const hiddenCategory = computed(() => store.getters['user/getUser'].hiddenCategory || []);

  const examCategories = computed(() =>
    categories.value.filter((cat) => cat && cat.toLowerCase().includes('egzamin'))
  );

  const otherCategories = computed(() =>
    categories.value.filter((cat) => cat && !examCategories.value.includes(cat))
  );

  const lawTestCategories = computed(() =>
    categories.value.filter((cat) => cat && cat.startsWith('TP:'))
  );

  const getQuestionIdsForQuiz = async (cat) => {
    try {
      // Pobierz wszystkie pytania z kategorii
      const res = await store.dispatch('questions/fetchQuestionsByCategory', cat);
      const questions = res;
      const allIds = questions.map((q) => q.ID || q.id || q.Id || q.id_question);

      // Pobierz historię użytkownika dla danej kategorii
      const hquestion = store.getters['user/getHquestion'] || [];
      const hq = hquestion.filter((q) => q.category === cat);

      // Filtruj tylko pytania, które nie zostały odpowiedziane lub odpowiedziane błędnie
      return allIds.filter((id) => {
        const entry = hq.find(
          (q) =>
            String(q.id) === String(id) ||
            String(q.ID) === String(id) ||
            String(q.question_id) === String(id)
        );
        return !entry || entry.correct === false;
      });
    } catch (e) {
      console.error('Błąd pobierania pytań dla quizu:', e);
      return [];
    }
  };

  return {
    categories,
    categoryCounts,
    examCategories,
    otherCategories,
    lawTestCategories,
    hiddenCategory,
    getQuestionIdsForQuiz,
  };
})();

// Stan lokalny
const showExamPopup = ref(false);
const showOtherQuizPopup = ref(false);
const showQuizOptions = ref({});
const activeFilter = ref('all');
const viewType = ref('grid');
const gridColumns = ref(3);
const searchQuery = ref('');
const categoryStats = ref({});
const showUserGuide = ref(false);

// Obliczone właściwości
const filteredCategories = computed(() => {
  if (activeFilter.value === 'exam')
    return questionsHelper.examCategories.value.slice().sort((a, b) => a.localeCompare(b));
  if (activeFilter.value === 'other')
    return questionsHelper.otherCategories.value.slice().sort((a, b) => a.localeCompare(b));
  if (activeFilter.value === 'lawtest')
    return questionsHelper.lawTestCategories.value.slice().sort((a, b) => a.localeCompare(b));
  return questionsHelper.categories.value;
});

const searchedCategories = computed(() => {
  const hidden = questionsHelper.hiddenCategory.value || [];
  return filteredCategories.value
    .filter((cat) => !hidden.includes(cat))
    .filter(
      (cat) => !searchQuery.value || cat.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

const gridLayoutClass = computed(() => {
  switch (gridColumns.value) {
    case 2:
      return 'grid grid-cols-1 md:grid-cols-2 gap-4';
    case 4:
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4';
    default:
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
  }
});

// Metody
const openExamPopup = () => {
  showExamPopup.value = true;
};

const openOtherQuizPopup = () => {
  showOtherQuizPopup.value = true;
};

const startExamFromCategory = (cat) => {
  showExamPopup.value = false;
  const max = questionsHelper.categoryCounts.value[cat] || 10;
  router.push({ name: 'QuizView', query: { length: max, categories: cat } });
};

const goToCategoryQuestions = async (cat) => {
  try {
    await router.push({ name: 'CategoryQuestions', params: { category: cat } });
  } catch (e) {
    showAlert('error', 'Błąd ładowania pytań z kategorii');
  }
};

const startQuizNotDone = async (cat, limit = 150) => {
  if (typeof showAlert === 'function') showAlert('info', 'Przygotowywanie quizu...');
  try {
    const idsToUse = await questionsHelper.getQuestionIdsForQuiz(cat);

    if (!idsToUse.length) {
      showAlert('warning', 'Brak pytań do quizu w tej kategorii.');
      return;
    }

    const length = limit === 0 ? idsToUse.length : Math.min(limit, idsToUse.length);

    router.push({
      name: 'QuizView',
      query: {
        length,
        categories: cat,
        onlyNotDone: 'true', // Upewnij się, że ten parametr ma wartość string 'true'
        ids: idsToUse.join(','),
        r: Math.random().toString(36).substring(2, 8), // Zapobiega buforowaniu
      },
    });
  } catch (e) {
    console.error('Error fetching questions for quiz:', e);
    showAlert('error', 'Błąd pobierania pytań z serwera.');
  }
};

const startExamNotDone = async (cat) => {
  try {
    const idsToUse = await questionsHelper.getQuestionIdsForQuiz(cat);
    const length = Math.min(150, idsToUse.length);
    router.push({
      name: 'ExamView',
      query: { length, categories: cat, time: 60, onlyNotDone: true, ids: idsToUse.join(',') },
    });
  } catch (e) {
    showAlert('error', 'Błąd pobierania pytań z serwera.');
  }
};

async function clearCategoryHistory(category) {
  try {
    // Pokaż powiadomienie o rozpoczęciu procesu
    showAlert('info', `Czyszczenie historii kategorii "${category}"...`);

    // 1. Dodaj trwałą blokadę dla kategorii (zwiększ czas do 24h)
    const blockRefreshKey = `block_refresh_${category}`;
    const expiryTime = Date.now() + 24 * 60 * 60 * 1000; // 24 godziny
    sessionStorage.setItem(blockRefreshKey, expiryTime.toString());

    // 2. Najpierw optymistycznie zaktualizuj lokalny stan
    if (categoryStats.value[category]) {
      categoryStats.value[category] = {
        correct: 0,
        wrong: 0,
        notDone: questionsHelper.categoryCounts.value[category] || 0,
      };
    }

    // 3. Resetuj opcje quizu dla tej kategorii
    if (showQuizOptions.value[category]) {
      showQuizOptions.value[category] = false;
    }

    // 4. Natychmiast filtruj dane w store dla lepszego UX
    const hquestion = store.getters['user/getHquestion'] || [];
    const filteredHq = hquestion.filter((q) => q.category !== category);
    store.commit('user/SET_HQUESTION', filteredHq);

    // Filtruj też historię zawierającą tę kategorię
    const history = store.getters['user/getUserHistory'] || [];
    const filteredHistory = history.filter((h) => {
      if (h.category) return h.category !== category;
      if (h.categories) return !h.categories.includes(category);
      return true;
    });
    store.commit('user/SET_USER_HISTORY', filteredHistory);

    // 5. Aktualizacja w sessionStorage z flagą blokady
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (userData) {
      userData.hquestion = filteredHq;
      userData.history = filteredHistory;
      userData.clearedCategories = userData.clearedCategories || {};
      userData.clearedCategories[category] = Date.now();
      sessionStorage.setItem('user', JSON.stringify(userData));
    }

    // 6. Wywołaj akcję w store z dodatkowym parametrem permanent
    const success = await store.dispatch('user/clearCategoryHistory', {
      category,
      refreshUI: true,
      permanent: true,
    });

    if (!success) {
      throw new Error('Serwer nie potwierdził usunięcia danych');
    }

    // 7. Emituj zdarzenie czyszczenia kategorii
    window.dispatchEvent(
      new CustomEvent('category-history-cleared', {
        detail: {
          category,
          timestamp: Date.now(),
          forceUIRefresh: true,
          permanent: true,
        },
      })
    );

    // 8. Tylko aktualizuj lokalne statystyki
    await calculateCategoryStats();

    // 9. Pokaż powiadomienie o sukcesie
    showAlert('success', `Historia kategorii "${category}" została wyczyszczona`);
  } catch (e) {
    console.error('Błąd podczas czyszczenia historii kategorii:', e);
    showAlert('error', 'Nie udało się wyczyścić historii kategorii.');

    // Usuń blokadę w przypadku błędu
    const blockRefreshKey = `block_refresh_${category}`;
    sessionStorage.removeItem(blockRefreshKey);
  }
}

// Dodaj tę funkcję przed onMounted, razem z innymi funkcjami obsługującymi zdarzenia
// Funkcja obsługująca odświeżanie danych użytkownika
const handleDataRefresh = async (event) => {
  console.debug('Otrzymano zdarzenie user-data-refreshed');
  try {
    // Sprawdź czy istnieje blokada dla danej kategorii z uwzględnieniem czasu wygaśnięcia
    if (event.detail && event.detail.category) {
      const category = event.detail.category;
      const blockRefreshKey = `block_refresh_${category}`;
      const blockValue = sessionStorage.getItem(blockRefreshKey);

      if (blockValue) {
        const blockUntil = parseInt(blockValue, 10);
        // Jeśli blokada jest aktywna i nie wygasła
        if (!isNaN(blockUntil) && blockUntil > Date.now()) {
          console.debug(
            `Odświeżanie dla kategorii ${category} zablokowane do ${new Date(blockUntil)}`
          );
          return; // Przerwij odświeżanie
        } else {
          // Blokada wygasła, usuń ją
          sessionStorage.removeItem(blockRefreshKey);
        }
      }
    }

    // Pobierz zaktualizowane dane, ale zastosuj filtr dla wyczyszczonych kategorii
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    const clearedCategories = userData.clearedCategories || {};

    // Pobierz dane
    await store.dispatch('user/fetchUserHistoryAndHQ');

    // Zastosuj filtr dla wyczyszczonych kategorii
    if (Object.keys(clearedCategories).length > 0) {
      const hquestion = store.getters['user/getHquestion'] || [];
      const history = store.getters['user/getUserHistory'] || [];

      // Filtruj pytania z wyczyszczonych kategorii
      const filteredHq = hquestion.filter((q) => !clearedCategories[q.category]);

      // Filtruj historię zawierającą wyczyszczone kategorie
      const filteredHistory = history.filter((h) => {
        if (h.category) return !clearedCategories[h.category];
        if (h.categories) return !h.categories.some((cat) => clearedCategories[cat]);
        return true;
      });

      // Aktualizuj store
      if (filteredHq.length !== hquestion.length) {
        store.commit('user/SET_HQUESTION', filteredHq);
      }

      if (filteredHistory.length !== history.length) {
        store.commit('user/SET_USER_HISTORY', filteredHistory);
      }
    }

    // Ponownie oblicz statystyki kategorii
    await calculateCategoryStats();

    // Odśwież UI dla konkretnej kategorii jeśli określono
    if (event.detail && event.detail.category) {
      const category = event.detail.category;
      nextTick(() => {
        const cardsContainer = document.querySelector('.categories-list');
        if (cardsContainer) {
          const cards = cardsContainer.querySelectorAll('.categories-container');
          cards.forEach((card) => {
            if (card.dataset.category === category) {
              card.classList.add('refreshing');
              setTimeout(() => card.classList.remove('refreshing'), 500);
            }
          });
        }
      });
    }
  } catch (e) {
    console.error('Błąd podczas odświeżania danych:', e);
  }
};

// Dodaj tę funkcję po deklaracji zmiennych stanu, przed metodami
const calculateCategoryStats = async () => {
  try {
    // Pobierz wszystkie kategorie
    const categories = questionsHelper.categories.value;
    if (!categories || !categories.length) return;

    // Pobierz historię odpowiedzi użytkownika
    const hquestion = store.getters['user/getHquestion'] || [];

    // Dla każdej kategorii oblicz statystyki
    for (const category of categories) {
      // Pobierz liczbę wszystkich pytań w kategorii
      const totalQuestions = questionsHelper.categoryCounts.value[category] || 0;

      // Pobierz historię odpowiedzi dla tej kategorii
      const categoryHistory = hquestion.filter((q) => q.category === category);

      // Oblicz poprawne i błędne odpowiedzi
      const correctAnswers = categoryHistory.filter((q) => q.correct === true).length;
      const wrongAnswers = categoryHistory.filter((q) => q.correct === false).length;

      // Oblicz liczbę nierozwiązanych pytań
      const notDone = totalQuestions - (correctAnswers + wrongAnswers);

      // Zapisz statystyki dla kategorii
      categoryStats.value[category] = {
        correct: correctAnswers,
        wrong: wrongAnswers,
        notDone: Math.max(0, notDone), // Upewnij się, że liczba jest nieujemna
      };
    }
  } catch (e) {
    console.error('Błąd podczas obliczania statystyk kategorii:', e);
  }
};

// Dodaj nową funkcję do obsługi zdarzenia czyszczenia kategorii
const handleCategoryClearedEvent = async (event) => {
  const { category } = event.detail;

  // Wymuś natychmiastowe przeliczenie statystyk dla tej kategorii
  const totalQuestions = questionsHelper.categoryCounts.value[category] || 0;
  categoryStats.value[category] = {
    correct: 0,
    wrong: 0,
    notDone: totalQuestions,
  };

  // Wymuś przerenderowanie komponentów poprzez zmianę ich kluczy
  // Jest to bardziej efektywne niż manipulowanie stanem widoku
  nextTick(() => {
    const cardsContainer = document.querySelector('.categories-list');
    if (cardsContainer) {
      const cards = cardsContainer.querySelectorAll('.categories-container');
      cards.forEach((card) => {
        if (card.dataset.category === category) {
          card.classList.add('refreshing');
          setTimeout(() => card.classList.remove('refreshing'), 500);
        }
      });
    }
  });
};

// Dodaj poniżej innych deklaracji
// Dodaj nową funkcję odświeżania wszystkich danych
const refreshAllData = async () => {
  try {
    showAlert('info', 'Aktualizacja danych...');

    // Pobierz wszystkie dane z serwera
    await Promise.all([
      store.dispatch('user/fetchUserHistoryAndHQ'),
      store.dispatch('questions/fetchStats'),
    ]);

    // Zastosuj filtr dla wyczyszczonych kategorii
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    const clearedCategories = userData.clearedCategories || {};

    if (Object.keys(clearedCategories).length > 0) {
      const hquestion = store.getters['user/getHquestion'] || [];
      const history = store.getters['user/getUserHistory'] || [];

      // Filtruj pytania z wyczyszczonych kategorii
      const filteredHq = hquestion.filter((q) => !clearedCategories[q.category]);

      // Filtruj historię
      const filteredHistory = history.filter((h) => {
        if (h.category) return !clearedCategories[h.category];
        if (h.categories) return !h.categories.some((cat) => clearedCategories[cat]);
        return true;
      });

      // Aktualizuj store
      if (filteredHq.length !== hquestion.length) {
        store.commit('user/SET_HQUESTION', filteredHq);
      }

      if (filteredHistory.length !== history.length) {
        store.commit('user/SET_USER_HISTORY', filteredHistory);
      }
    }

    // Przelicz statystyki lokalnie
    await calculateCategoryStats();

    // Wymuś odświeżenie wszystkich komponentów
    window.dispatchEvent(
      new CustomEvent('user-data-refreshed', {
        detail: {
          all: true,
          timestamp: Date.now(),
          forceUIUpdate: true,
        },
      })
    );

    showAlert('success', 'Dane zaktualizowane');
  } catch (e) {
    console.error('Błąd podczas odświeżania danych:', e);
    showAlert('error', 'Nie udało się zaktualizować danych');
  }
};

// Dodaj poniżej pozostałych hooków cyklu życia
onBeforeMount(async () => {
  // Odśwież dane przed montowaniem komponentu
  await refreshAllData();
});

// Dodaj watcher na zmianę ścieżki, aby odświeżać dane gdy użytkownik wraca na stronę główną
watch(
  () => route.path,
  async (newPath, oldPath) => {
    // Sprawdź czy jest to nawigacja do strony głównej z innej strony
    if (newPath === '/' && oldPath !== undefined) {
      console.log('Powrót na stronę główną - odświeżanie danych');
      await refreshAllData();
    }
  }
);

// Zmodyfikuj istniejącą funkcję onMounted
onMounted(async () => {
  // Oblicz początkowe statystyki kategorii
  await calculateCategoryStats();

  // Nasłuchuj na zdarzenia odświeżające dane
  window.addEventListener('user-data-refreshed', handleDataRefresh);
  window.addEventListener('category-history-cleared', handleCategoryClearedEvent);

  // Dodaj obserwowanie zdarzeń nawigacji z poziomu aplikacji
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

// Dodaj tę funkcję pod onMounted
const handleVisibilityChange = async () => {
  // Sprawdź czy użytkownik wrócił do karty po tym jak była nieaktywna
  if (document.visibilityState === 'visible' && route.path === '/') {
    console.log('Karta aktywowana - odświeżanie danych');
    await refreshAllData();
  }
};

// Rozszerz onUnmounted o usunięcie nowego listenera
onUnmounted(() => {
  window.removeEventListener('user-data-refreshed', handleDataRefresh);
  window.removeEventListener('category-history-cleared', handleCategoryClearedEvent);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<style scoped></style>
