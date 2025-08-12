<template>
  <div v-if="show" class="fixed inset-0" style="z-index: 1000">
    <div class="absolute inset-0 bg-black bg-opacity-60 transition-opacity duration-300"></div>

    <div
      v-if="currentStepEl && currentStepEl.rect"
      class="absolute spotlight transition-all duration-300 ease-in-out"
      style="z-index: 1005"
      :style="{
        left: `${currentStepEl.rect.left - 15}px`,
        top: `${currentStepEl.rect.top - 15}px`,
        width: `${currentStepEl.rect.width + 30}px`,
        height: `${currentStepEl.rect.height + 30}px`,
        border: '1px solid rgba(59, 130, 246, 0.1)',
      }"
    ></div>

    <div
      v-if="currentStepEl && currentStepEl.rect"
      class="absolute bg-white dark:bg-gray-800 rounded-lg shadow-xl p-7 max-w-xl transition-all duration-300 border-2 border-blue-400 dark:border-blue-500"
      style="z-index: 1005"
      :style="tooltipPosition"
    >
      <h3 class="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3">
        {{ steps[currentStep].title }}
      </h3>
      <p class="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
        {{ steps[currentStep].description }}
      </p>
      <div
        class="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="flex space-x-2">
          <span
            v-for="(_, idx) in steps.length"
            :key="idx"
            class="w-2.5 h-2.5 rounded-full transition-all duration-300"
            :class="idx === currentStep ? 'bg-blue-500 scale-125' : 'bg-gray-300 dark:bg-gray-600'"
          ></span>
        </div>

        <div class="flex space-x-3">
          <button
            v-if="currentStep > 0"
            @click="prevStep"
            class="px-4 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Wstecz
          </button>
          <button
            v-if="currentStep < steps.length - 1"
            @click="nextStep"
            class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Dalej
          </button>
          <button
            v-else
            @click="closeGuide"
            class="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded dark:bg-green-500 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            Zakończ
          </button>
        </div>
      </div>
    </div>

    <!-- Przycisk do pominięcia -->
    <button
      @click="closeGuide"
      class="fixed top-4 right-4 text-white bg-gray-700 bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
      style="z-index: 1010"
      aria-label="Pomiń instrukcję"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick, watch } from 'vue';

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(['close']);

// Stan
const currentStep = ref(0);
const currentStepEl = ref(null);
const originalScrollPosition = ref(0);
const wheelEventHandler = ref(null);
const keydownEventHandler = ref(null);
const touchmoveEventHandler = ref(null);

// Zmodyfikowana funkcja blokująca przewijanie z dodanym przewijaniem na górę
const disableScroll = () => {
  // Przewiń stronę na samą górę
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });

  // Zapisz aktualną pozycję przewijania
  originalScrollPosition.value = 0; // Ustawiamy na 0, bo przewijamy na górę

  // Poczekaj na zakończenie przewijania
  setTimeout(() => {
    // Zablokuj przewijanie przez ustawienie fixed na body
    document.body.style.position = 'fixed';
    document.body.style.top = '0'; // Zmienione na 0, bo jesteśmy na górze
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.bottom = '0';
    document.body.style.overflow = 'hidden';

    // Reszta istniejącego kodu do blokowania eventów...
    // Zablokuj wydarzenia kółka myszy
    wheelEventHandler.value = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Zablokuj klawisze strzałek, spacji i Page Up/Down
    keydownEventHandler.value = (e) => {
      if ([32, 33, 34, 37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault();
        return false;
      }
    };

    // Zablokuj przewijanie na urządzeniach dotykowych
    touchmoveEventHandler.value = (e) => {
      if (
        e.target.closest('.spotlight') === null &&
        e.target.closest('[style*="z-index: 1005"]') === null
      ) {
        e.preventDefault();
      }
    };

    // Dodaj nasłuchiwanie zdarzeń
    window.addEventListener('wheel', wheelEventHandler.value, { passive: false });
    window.addEventListener('touchmove', touchmoveEventHandler.value, { passive: false });
    window.addEventListener('keydown', keydownEventHandler.value, { passive: false });

    // Dodaj klasę CSS do html elementu
    document.documentElement.classList.add('no-scroll');
  }, 300); // Daj czas na zakończenie przewijania
};

// Poprawiona funkcja odblokowująca przewijanie
const enableScroll = () => {
  // Usuń wszystkie blokady stylów
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.bottom = '';
  document.body.style.overflow = '';

  // Usuń klasę CSS
  document.documentElement.classList.remove('no-scroll');

  // Usuń nasłuchiwanie zdarzeń
  if (wheelEventHandler.value) {
    window.removeEventListener('wheel', wheelEventHandler.value, { passive: false });
    window.removeEventListener('wheel', wheelEventHandler.value); // Dodatkowe usunięcie bez opcji passive
    wheelEventHandler.value = null;
  }

  if (touchmoveEventHandler.value) {
    window.removeEventListener('touchmove', touchmoveEventHandler.value, { passive: false });
    window.removeEventListener('touchmove', touchmoveEventHandler.value); // Dodatkowe usunięcie bez opcji passive
    touchmoveEventHandler.value = null;
  }

  if (keydownEventHandler.value) {
    window.removeEventListener('keydown', keydownEventHandler.value, { passive: false });
    window.removeEventListener('keydown', keydownEventHandler.value); // Dodatkowe usunięcie bez opcji passive
    keydownEventHandler.value = null;
  }

  // Dodaj te linie, aby wymusić odświeżenie stanu przewijania
  document.documentElement.style.overflow = '';
  document.body.style.height = '';
  document.documentElement.style.height = '';

  // Wymuszenie reflow strony aby przeglądarka zaktualizowała stan interfejsu
  void document.documentElement.offsetHeight;

  // Odblokowujemy przewijanie poprzez symulację zdarzenia przewijania
  window.dispatchEvent(new Event('scroll'));

  // Ustaw focus na body, co może pomóc przywrócić obsługę zdarzeń myszy
  document.body.focus();

  // Ostatecznie przewiń do zapisanej pozycji
  setTimeout(() => {
    window.scrollTo(0, originalScrollPosition.value);
  }, 10);
};

// Definicja kroków przewodnika - zmodyfikowana z bardziej szczegółowymi opisami
const steps = [
  {
    title: 'Witaj w systemie nauki!',
    description:
      'Zapoznaj się z podstawowymi funkcjami aplikacji. Naciśnij "Dalej", aby rozpocząć.',
    selector: 'body',
    position: 'center',
  },
  {
    title: 'Pasek nawigacyjny',
    description:
      'Pasek nawigacyjny zawiera dostęp do wszystkich głównych funkcji: strony głównej, historii quizów, przeglądania pytań, panelu użytkownika oraz przycisk wylogowania po prawej stronie.',
    selector: '.nav',
    position: 'bottom',
  },
  {
    title: 'Szybki wybór kategorii',
    description:
      'Szybki wybór kategorii pozwala na szybkie rozpoczęcie quizu lub egzaminu z pytań z ubiegłych lat lub pozostałych kategorii. Ukazuje statystyki ostatnich podejść do quizów.',
    selector: '.quiz-buttons ',
    position: 'bottom',
  },
  {
    title: 'Rozpocznij egzamin z ubiegłych lat',
    description:
      'Kliknij tutaj, aby rozpocząć egzamin z oficjalnych pytań z poprzednich lat. Zawsze odpala pełną listę pytań.',
    selector: '.quiz-buttons button:first-child',
    position: 'bottom',
  },
  {
    title: 'Rozpocznij quiz z pozostałych kategorii',
    description: 'Kliknij tutaj, aby rozpocząć quiz z pytaniami z różnych kategorii tematycznych. ',
    selector: '.quiz-buttons button:last-child',
    position: 'bottom',
  },
  {
    title: 'Statystyki',
    description:
      'Śledź swoje postępy i sprawdzaj wyniki w poszczególnych kategoriach. Tutaj zobaczysz procent poprawnych odpowiedzi i najczęstsze błędy.',
    selector: '.statistics-summary',
    position: 'top',
  },
  {
    title: 'Wyszukiwarka kategorii',
    description:
      'Wpisz nazwę lub fragment kategorii, aby szybko znaleźć interesujące Cię kategorie.',
    selector: '.search-input',
    position: 'bottom',
  },
  {
    title: 'Zmiana układu listy',
    description:
      'Dostosuj widok kategorii - możesz wybrać układ listy lub siatki oraz zmienić liczbę kolumn (2,3,4) dla wygodniejszego przeglądania.',
    selector: '.view-options',
    position: 'bottom',
  },
  {
    title: 'Filtrowanie kategorii',
    description: 'Filtruj kategorie według typów: wszystkie, egzaminy, pozostałe quizy.',
    selector: '.filter-options',
    position: 'top',
  },
  {
    title: 'Lista dostępnych kategorii',
    description:
      'Tutaj znajdziesz wszystkie kategorie pytań. Każda kategoria pokazuje statystyki twoich odpowiedzi oraz opcje rozpoczęcia quizu lub egzaminu. Kolor tła oznacza stopień udzielonych poprawnych/błędnych odpowiedzi.',
    selector: '.categories-container',
    position: 'top',
  },
  {
    title: 'Wskaźnik pokazujący ilość przerobionych pytań',
    description:
      'Wskaźnik pokazuje, ile pytań zostało przerobionych w danej kategorii. Im wyższy wskaźnik, tym lepiej.',
    selector: '.categories-container .indicator_A',
    position: 'top',
  },
  {
    title: 'Wskaźnik pokazujący stopień opanowania kategorii',
    description:
      'Wskaźnik pokazuje, jak dobrze opanowałeś daną kategorię. Im wyższy wskaźnik, tym lepiej.',
    selector: '.categories-container .indicator_B',
    position: 'top',
  },
  {
    title: 'Opcje kategorii',
    description:
      'Dla każdej kategorii możesz: rozpocząć quiz, rozpocząć egzamin, przeglądać pytania lub wyczyścić historię.',
    selector: '.category-card',
    position: 'top',
  },
  {
    title: 'Sterowanie podczas quizu/egzaminu',
    description:
      'Sterowanie odbywa się za pomocą przycisków 1 od 4, które odpowiadają odpowiedziom A, B, C i D. Możesz także użyć przycisków strzałek do nawigacji między pytaniami.',
    selector: 'body',
    position: 'center',
  },
  {
    title: 'O tutaj jestem:P',
    description:
      'Pamiętaj, że możesz zawsze wrócić do tego przewodnika klikając ikonę "i" na stronie głównej.',
    selector: '.info-icon',
    position: 'info',
  },
  {
    title: 'Wszystko gotowe!',
    description: 'Teraz możesz korzystać z aplikacji. Powodzenia w nauce!.',
    selector: 'body',
    position: 'center',
  },
];

// Obliczenie pozycji dymka
const tooltipPosition = computed(() => {
  if (!currentStepEl.value || !currentStepEl.value.rect) return {};

  const rect = currentStepEl.value.rect;
  let position = steps[currentStep.value].position || 'bottom';

  // Wymiary okna przeglądarki
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  // Wymiary dymka (przybliżone)
  const tooltipWidth = 340;
  const tooltipHeight = 220;

  // Margines bezpieczeństwa od krawędzi ekranu
  const safeMargin = 30;

  // NOWA OBSŁUGA POZYCJI 'info' - po prawej i na górze elementu
  if (position === 'info') {
    // Podstawowa pozycja - prawy górny róg elementu
    let infoLeft = rect.right + 30;
    let infoTop = rect.top + 20; // Lekkie przesunięcie w górę

    // Sprawdź czy dymek nie wyjdzie poza prawą krawędź ekranu
    if (infoLeft + tooltipWidth > viewportWidth - safeMargin) {
      // Jeśli wychodzi poza prawą krawędź, pokaż po lewej stronie
      infoLeft = Math.max(safeMargin, rect.left - tooltipWidth - 20);
    }

    // Sprawdź czy dymek nie wyjdzie poza górną krawędź ekranu
    if (infoTop < safeMargin) {
      // Jeśli wychodzi poza górną krawędź, pokaż poniżej elementu
      infoTop = Math.min(rect.bottom + 15, viewportHeight - tooltipHeight - safeMargin);
    }

    // Dodatkowe sprawdzenie czy dymek nie wyjdzie poza dolną krawędź
    if (infoTop + tooltipHeight > viewportHeight - safeMargin) {
      infoTop = viewportHeight - tooltipHeight - safeMargin;
    }

    return {
      left: `${infoLeft}px`,
      top: `${infoTop}px`,
      transform: 'none',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
    };
  }

  // Pozostała istniejąca logika dla innych pozycji

  // Podstawowe położenie dymka w zależności od wybranej pozycji
  let left,
    top,
    transform = '';

  // Najpierw sprawdźmy, czy jest wystarczająco miejsca w preferowanej pozycji
  // Jeśli nie, automatycznie zmień pozycję na przeciwną lub bardziej odpowiednią

  // Sprawdzenie czy jest miejsce w górę
  const hasSpaceTop = rect.top > tooltipHeight + 60;

  // Sprawdzenie czy jest miejsce w dół
  const hasSpaceBottom = rect.bottom + tooltipHeight + 60 < viewportHeight;

  // Sprawdzenie czy jest miejsce po lewej
  const hasSpaceLeft = rect.left > tooltipWidth + 60;

  // Sprawdzenie czy jest miejsce po prawej
  const hasSpaceRight = rect.right + tooltipWidth + 60 < viewportWidth;

  // Dostosuj pozycję, jeśli brakuje miejsca w preferowanej pozycji
  if (position === 'top' && !hasSpaceTop) {
    position = hasSpaceBottom ? 'bottom' : hasSpaceLeft ? 'left' : 'right';
  } else if (position === 'bottom' && !hasSpaceBottom) {
    position = hasSpaceTop ? 'top' : hasSpaceLeft ? 'left' : 'right';
  } else if (position === 'left' && !hasSpaceLeft) {
    position = hasSpaceRight ? 'right' : hasSpaceTop ? 'top' : 'bottom';
  } else if (position === 'right' && !hasSpaceRight) {
    position = hasSpaceLeft ? 'left' : hasSpaceTop ? 'top' : 'bottom';
  }

  // Oblicz pozycję na podstawie dostosowanego ustawienia
  switch (position) {
    case 'top':
      left = rect.left + rect.width / 2;
      top = rect.top - tooltipHeight - 30;
      transform = 'translateX(-50%)';
      break;
    case 'bottom':
      left = rect.left + rect.width / 2;
      top = rect.bottom + 30;
      transform = 'translateX(-50%)';
      break;
    case 'left':
      left = rect.left - tooltipWidth - 30;
      top = rect.top + rect.height / 2;
      transform = 'translateY(-50%)';
      break;
    case 'right':
      left = rect.right + 30;
      top = rect.top + rect.height / 2;
      transform = 'translateY(-50%)';
      break;
    case 'center':
      left = viewportWidth / 2;
      top = viewportHeight / 2;
      transform = 'translate(-50%, -50%)';
      break;
    default:
      left = rect.left + rect.width / 2;
      top = rect.bottom + 30;
      transform = 'translateX(-50%)';
      break;
  }

  // Dodatkowa korekta pozycji, aby dymek nie wychodził poza ekran

  // Korekta pozioma
  if (position !== 'center') {
    // Jeśli pozycja to 'left' lub 'right', nie używamy transformacji poziomej
    if (position === 'left' || position === 'right') {
      if (top < safeMargin) {
        top = safeMargin;
      } else if (top + tooltipHeight > viewportHeight - safeMargin) {
        top = viewportHeight - tooltipHeight - safeMargin;
      }
    }
    // Dla 'top' i 'bottom' używamy transformacji poziomej
    else {
      if (left - tooltipWidth / 2 < safeMargin) {
        // Za blisko lewej krawędzi - przesuwamy w prawo i usuwamy transformację
        left = safeMargin;
        transform = 'none';
      } else if (left + tooltipWidth / 2 > viewportWidth - safeMargin) {
        // Za blisko prawej krawędzi - przesuwamy w lewo i usuwamy transformację
        left = viewportWidth - tooltipWidth - safeMargin;
        transform = 'none';
      }
    }
  }

  // Korekta pionowa dla pozycji 'left' i 'right'
  if (position === 'left' || position === 'right') {
    if (top - tooltipHeight / 2 < safeMargin) {
      top = safeMargin + tooltipHeight / 2;
    } else if (top + tooltipHeight / 2 > viewportHeight - safeMargin) {
      top = viewportHeight - tooltipHeight / 2 - safeMargin;
    }
  }

  // Dodatkowa logika dla elementu z klasą '.info-icon' w funkcji tooltipPosition
  if (steps[currentStep.value].selector === '.info-icon') {
    // Sprawdzamy dostępność miejsca po prawej stronie przycisku
    const hasSpaceRight = rect.right + 370 < window.innerWidth;

    if (hasSpaceRight) {
      // Jeśli jest miejsce po prawej, pokazujemy dymek po prawej stronie
      return {
        left: `${rect.right + 20}px`,
        top: `${rect.top - tooltipHeight / 2 + rect.height / 2}px`,
        transform: 'none',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
        maxWidth: '390px',
      };
    } else {
      // Jeśli nie ma miejsca po prawej, pokazujemy dymek powyżej przycisku
      return {
        left: `${Math.max(20, rect.left + rect.width / 2 - tooltipWidth / 2)}px`,
        top: `${rect.top - tooltipHeight - 20}px`,
        transform: 'none',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
        maxWidth: '390px',
      };
    }
  }

  return {
    left: `${left}px`,
    top: `${top}px`,
    transform: transform,
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
  };
});

// Metody
const findElement = () => {
  const step = steps[currentStep.value];
  if (!step || !step.selector) return null;

  const el = document.querySelector(step.selector);
  if (!el) return null;

  const rect = el.getBoundingClientRect();
  return {
    element: el,
    rect: {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height,
      right: rect.right + window.scrollX,
      bottom: rect.bottom + window.scrollY,
    },
  };
};

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    // Wyczyść style z poprzedniego elementu
    resetElementStyles();
    currentStep.value++;
    updateCurrentElement();
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    // Wyczyść style z poprzedniego elementu
    resetElementStyles();
    currentStep.value--;
    updateCurrentElement();
  }
};

// Zmodyfikuj funkcję closeGuide, aby upewnić się, że przewijanie jest odblokowane
const closeGuide = () => {
  resetElementStyles();
  emit('close');
  currentStep.value = 0;
  localStorage.setItem('userGuideShown', 'true');
  setTimeout(() => {
    enableScroll();
  }, 200); // 200ms - czas na zniknięcie modala
};

// Funkcja resetująca style elementów
const resetElementStyles = () => {
  if (currentStepEl.value && currentStepEl.value.element) {
    // Przywróć oryginalne pozycjonowanie, jeśli zostało zachowane
    if (currentStepEl.value.originalPosition === 'fixed') {
      // Dla elementów fixed resetujemy tylko z-index i pointerEvents
      currentStepEl.value.element.style.zIndex = '';
      currentStepEl.value.element.style.pointerEvents = '';
    } else {
      // Dla pozostałych elementów resetujemy wszystkie zmienione style
      currentStepEl.value.element.style.position = '';
      currentStepEl.value.element.style.zIndex = '';
      currentStepEl.value.element.style.pointerEvents = '';
    }
  }
};

const updateCurrentElement = async () => {
  await nextTick();
  currentStepEl.value = findElement();

  if (currentStepEl.value && currentStepEl.value.element) {
    // Sprawdź, czy element ma już pozycjonowanie fixed
    const computedStyle = window.getComputedStyle(currentStepEl.value.element);
    const originalPosition = computedStyle.position;

    // Zapisz oryginalne pozycjonowanie elementu
    currentStepEl.value.originalPosition = originalPosition;

    // Ustaw style z zachowaniem oryginalnego pozycjonowania dla elementów fixed
    if (originalPosition === 'fixed') {
      // Dla elementów fixed nie zmieniaj position, tylko z-index
      currentStepEl.value.element.style.zIndex = '1003';
      currentStepEl.value.element.style.pointerEvents = 'auto';
    } else {
      // Dla pozostałych elementów ustaw position: relative
      currentStepEl.value.element.style.position = 'relative';
      currentStepEl.value.element.style.zIndex = '1003';
      currentStepEl.value.element.style.pointerEvents = 'auto';
    }
  }
};

// Obserwuj zmiany w pokazie/ukryciu przewodnika
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      nextTick(() => {
        disableScroll(); // Blokuj przewijanie po renderowaniu przewodnika
        updateCurrentElement();
      });
    } else {
      enableScroll(); // Odblokuj przewijanie przy zamknięciu
      resetElementStyles();
    }
  },
  { immediate: true }
);

// Obsługa zmiany rozmiaru okna
const handleResize = () => {
  if (props.show) {
    updateCurrentElement();
  }
};

onMounted(() => {
  if (props.show) {
    disableScroll();
    updateCurrentElement();
  }
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  enableScroll();
  window.removeEventListener('resize', handleResize);
  resetElementStyles();
});
</script>

<style scoped>
/* Dodaj globalny styl dla blokady przewijania */
:global(html.no-scroll) {
  overflow: hidden !important;
  height: 100% !important;
}

.spotlight {
  border-radius: 12px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  animation: glow 2s infinite alternate;
}

@keyframes glow {
  0% {
    box-shadow:
      0 0 0 4px rgba(59, 130, 246, 0.3),
      /* Zwiększone z 3px */ 0 0 0 9999px rgba(0, 0, 0, 0.6);
  }
  100% {
    box-shadow:
      0 0 0 8px rgba(59, 130, 246, 0.5),
      /* Zwiększone z 5px */ 0 0 0 9999px rgba(0, 0, 0, 0.6);
  }
}

/* Usuń starą animację pulse, zastąpiona przez glow */
.animate-pulse {
  animation: none;
}

/* Dodaj jawny reset dla blokady przewijania */
:global(.no-scroll) {
  overflow: hidden !important;
}

:global(body:not(.no-scroll)) {
  overflow: auto !important;
  overscroll-behavior: auto !important;
}
</style>
