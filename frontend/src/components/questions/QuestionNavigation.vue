<template>
  <div class="w-full max-w-4xl mx-auto bottom-0 left-0 right-0 relative -mt-10">
    <div ref="scrollNav" class="w-full py-4 px-2 scroll-smooth overflow-x-hidden custom-scrollbar">
      <div class="flex space-x-2 min-w-max px-8">
        <button
          v-for="(q, idx) in questions"
          :key="idx"
          @click="goTo(idx)"
          class="relative flex items-center justify-center rounded-full border-2 focus:outline-none transition-all duration-300 font-semibold"
          :class="navClass(idx)"
          :style="{
            width: idx === currentIdx ? '3rem' : '2.5rem',
            height: idx === currentIdx ? '3rem' : '2.5rem',
          }"
          :aria-current="currentIdx === idx ? 'true' : undefined"
          :title="q.question"
          :disabled="disabled"
        >
          <span class="text-base sm:text-sm lg:text-lg z-10">{{ idx + 1 }}</span>
          <span
            v-if="answersStatus[idx] && answersStatus[idx].answered"
            class="absolute bottom-0 right-0 rounded-full z-20 h-4 w-4 transform translate-x-1/4 translate-y-1/4"
          >
            <svg
              v-if="isCorrect(idx)"
              class="h-full w-full text-green-100 bg-green-600 rounded-full"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else
              class="h-full w-full text-red-100 bg-red-600 rounded-full"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
        </button>
      </div>
    </div>

    <!-- Przyciski przewijania -->
    <div
      v-if="questions.length > visibleButtons"
      class="absolute top-4 left-0 w-full flex justify-between pointer-events-none"
    >
      <button
        @click="scrollLeft"
        class="flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-200 dark:border-gray-700 h-8 w-8 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200 pointer-events-auto mt-4"
        :style="{ marginLeft: '-2rem' }"
        :disabled="isAtStart"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
          <path
            fill-rule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
      <button
        @click="scrollRight"
        class="flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-200 dark:border-gray-700 h-8 w-8 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200 pointer-events-auto mt-4"
        :style="{ marginRight: '-2rem' }"
        :disabled="isAtEnd"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
          <path
            fill-rule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <!-- Legenda -->
    <div
      class="md:flex flex-wrap justify-center mt-2 text-xs text-gray-500 dark:text-gray-400 hidden"
    >
      <div class="flex items-center mx-2 mb-1">
        <span class="inline-block rounded-full mr-1 w-2 h-2 bg-blue-500"></span>
        <span class="text-xs">Aktualny</span>
      </div>
      <div class="flex items-center mx-2 mb-1">
        <span class="inline-block rounded-full mr-1 w-2 h-2 bg-green-500"></span>
        <span class="text-xs">Poprawny</span>
      </div>
      <div class="flex items-center mx-2 mb-1">
        <span class="inline-block rounded-full mr-1 w-2 h-2 bg-red-500"></span>
        <span class="text-xs">Błędny</span>
      </div>
      <div class="flex items-center mx-2 mb-1">
        <span class="inline-block rounded-full mr-1 w-2 h-2 bg-gray-300 dark:bg-gray-600"></span>
        <span class="text-xs">Brak odp.</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';

const props = defineProps({
  questions: {
    type: Array,
    required: true,
    default: () => [], // Dodaj domyślną pustą tablicę
  },
  currentIdx: { type: Number, required: true },
  answersStatus: { type: Array, required: true },
  disabled: { type: Boolean, default: false },
  showSummary: { type: Boolean, default: false },
});

const emit = defineEmits(['goTo']);

// Stan komponentu
const isAtStart = ref(true);
const isAtEnd = ref(false);
const visibleButtons = ref(10);
const scrollNav = ref(null);

// Funkcja przejścia do wybranego pytania
function goTo(idx) {
  if (!props.showSummary) emit('goTo', idx);
}

// Generowanie klas CSS dla przycisków
function navClass(idx) {
  let classes = '';

  // Aktualnie wybrany
  if (props.currentIdx === idx) {
    classes += 'border-blue-500 bg-blue-500 text-white shadow-md z-10 transform scale-110 ';
    classes += 'dark:border-blue-400 dark:bg-blue-400 dark:text-gray-900 ';
  }

  // Stan odpowiedzi
  const status = props.answersStatus[idx];
  if (status && status.answered) {
    if (isCorrect(idx)) {
      classes += 'border-green-500 bg-green-500 text-white ';
      classes += 'dark:border-green-400 dark:bg-green-400 dark:text-gray-900 ';
    } else {
      classes += 'border-red-500 bg-red-500 text-white ';
      classes += 'dark:border-red-400 dark:bg-red-400 dark:text-gray-900 ';
    }
  } else {
    classes += 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:border-gray-400 ';
    classes +=
      'dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:border-gray-500 ';
  }

  if (props.disabled) {
    classes += 'cursor-not-allowed opacity-70 ';
  }

  return classes;
}

// Sprawdzenie czy odpowiedź jest poprawna
function isCorrect(idx) {
  if (!props.questions || !props.answersStatus || idx >= props.questions.length) return false;

  const status = props.answersStatus[idx];
  const question = props.questions[idx];
  if (!status || !question) return false;

  const keys = ['answer_a', 'answer_b', 'answer_c', 'answer_d'];
  const correctKey = keys.find(
    (k) => question[k] && (question[k].isCorret || question[k].isCorrect)
  );

  return status.selectedKey === correctKey;
}

// Aktualizacja stanu przewijania
function updateScrollState() {
  const nav = scrollNav.value;
  if (!nav) return;

  isAtStart.value = nav.scrollLeft <= 10;
  isAtEnd.value = nav.scrollLeft >= nav.scrollWidth - nav.clientWidth - 10;
}

// Przewijanie w lewo
function scrollLeft() {
  const nav = scrollNav.value;
  if (nav) {
    nav.scrollBy({ left: -200, behavior: 'smooth' });
  }
}

// Przewijanie w prawo
function scrollRight() {
  const nav = scrollNav.value;
  if (nav) {
    nav.scrollBy({ left: 200, behavior: 'smooth' });
  }
}

// Przewijanie do aktywnego przycisku
function scrollToActive() {
  nextTick(() => {
    const nav = scrollNav.value;
    if (!nav) return;

    const activeBtn = nav.querySelector('.border-blue-500');
    if (activeBtn) {
      const navRect = nav.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();

      if (btnRect.left < navRect.left || btnRect.right > navRect.right) {
        const scrollAmount = btnRect.left - navRect.left - navRect.width / 2 + btnRect.width / 2;
        nav.scrollLeft += scrollAmount;
      }
    }

    updateScrollState();
  });
}

// Aktualizacja liczby widocznych przycisków
function updateVisibleButtons() {
  const width = window.innerWidth;
  visibleButtons.value = width < 640 ? 5 : width < 1024 ? 8 : 12;
}

// Montowanie komponentu
onMounted(() => {
  const nav = scrollNav.value;
  if (nav) {
    nav.scrollLeft = 0;
    nav.addEventListener('scroll', updateScrollState);
  }

  updateScrollState();
  scrollToActive();
  updateVisibleButtons();

  window.addEventListener('resize', updateVisibleButtons);
});

// Odmontowanie komponentu
onBeforeUnmount(() => {
  const nav = scrollNav.value;
  if (nav) {
    nav.removeEventListener('scroll', updateScrollState);
  }
  window.removeEventListener('resize', updateVisibleButtons);
});

// Obserwowanie zmian wybranego pytania
watch(() => props.currentIdx, scrollToActive);
</script>

<style scoped>
/* Niestandardowe style dla scrollbara - nie ma odpowiedników w Tailwind */
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 9999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
}
</style>
