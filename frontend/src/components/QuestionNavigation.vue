<template>
  <div class="question-navigation-container">
    <div ref="scrollNav" class="navigation-scroller">
      <div class="navigation-track">
        <button
          v-for="(q, idx) in questions"
          :key="idx"
          @click="goTo(idx)"
          class="navigation-button"
          :class="navClass(idx)"
          :aria-current="currentIdx === idx ? 'true' : undefined"
          :title="q.question"
          :disabled="disabled"
        >
          <span class="button-number">{{ idx + 1 }}</span>
          <span v-if="answersStatus[idx] && answersStatus[idx].answered" class="status-indicator">
            <svg
              v-if="isCorrect(idx)"
              class="status-icon correct"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <svg v-else class="status-icon wrong" viewBox="0 0 20 20" fill="currentColor">
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

    <!-- Wskaźniki przewijania -->
    <div class="scroll-indicators" v-if="questions.length > visibleButtons">
      <button @click="scrollLeft" class="scroll-button left" :disabled="isAtStart">
        <svg viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
          <path
            fill-rule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
      <button @click="scrollRight" class="scroll-button right" :disabled="isAtEnd">
        <svg viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
          <path
            fill-rule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <!-- Mini legenda -->
    <div class="navigation-legend">
      <div class="legend-item">
        <span class="legend-dot current"></span>
        <span class="legend-text">Aktualny</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot correct"></span>
        <span class="legend-text">Poprawny</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot wrong"></span>
        <span class="legend-text">Błędny</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot unanswered"></span>
        <span class="legend-text">Brak odp.</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    questions: { type: Array, required: true },
    currentIdx: { type: Number, required: true },
    answersStatus: { type: Array, required: true },
    disabled: { type: Boolean, default: false },
    showSummary: { type: Boolean, default: false },
  },
  emits: ['goTo'],
  inject: ['showAlert'], // Dodajemy injekcję jeśli jest używana
  data() {
    return {
      isAtStart: true,
      isAtEnd: false,
      visibleButtons: 10, // Szacunkowa liczba widocznych przycisków
    };
  },
  methods: {
    goTo(idx) {
      if (!this.showSummary) this.$emit('goTo', idx);
    },
    navClass(idx) {
      let classes = '';

      // Aktualnie wybrany
      if (this.currentIdx === idx) {
        classes += 'current ';
      }

      // Stan odpowiedzi
      const status = this.answersStatus[idx];
      if (status && status.answered) {
        if (this.isCorrect(idx)) {
          classes += 'correct ';
        } else {
          classes += 'wrong ';
        }
      } else {
        classes += 'unanswered ';
      }

      return classes;
    },
    isCorrect(idx) {
      const status = this.answersStatus[idx];
      const question = this.questions[idx];
      if (!status || !question) return false;

      const keys = ['answer_a', 'answer_b', 'answer_c', 'answer_d'];
      const correctKey = keys.find((k) => question[k] && question[k].isCorret);

      return status.selectedKey === correctKey;
    },
    updateScrollState() {
      const nav = this.$refs.scrollNav;
      if (!nav) return;

      this.isAtStart = nav.scrollLeft <= 10;
      this.isAtEnd = nav.scrollLeft >= nav.scrollWidth - nav.clientWidth - 10;
    },
    scrollLeft() {
      const nav = this.$refs.scrollNav;
      if (nav) {
        nav.scrollBy({ left: -200, behavior: 'smooth' });
      }
    },
    scrollRight() {
      const nav = this.$refs.scrollNav;
      if (nav) {
        nav.scrollBy({ left: 200, behavior: 'smooth' });
      }
    },
    scrollToActive() {
      this.$nextTick(() => {
        const nav = this.$refs.scrollNav;
        if (!nav) return;

        const activeBtn = nav.querySelector('.current');
        if (activeBtn) {
          const navRect = nav.getBoundingClientRect();
          const btnRect = activeBtn.getBoundingClientRect();

          if (btnRect.left < navRect.left || btnRect.right > navRect.right) {
            const scrollAmount =
              btnRect.left - navRect.left - navRect.width / 2 + btnRect.width / 2;
            nav.scrollLeft += scrollAmount;
          }
        }

        this.updateScrollState();
      });
    },
  },
  mounted() {
    const nav = this.$refs.scrollNav;
    if (nav) {
      nav.scrollLeft = 0;
      nav.addEventListener('scroll', this.updateScrollState);
    }

    this.updateScrollState();
    this.scrollToActive();

    // Dostosuj liczbę widocznych przycisków do rozmiaru ekranu
    const updateVisibleButtons = () => {
      const width = window.innerWidth;
      this.visibleButtons = width < 640 ? 5 : width < 1024 ? 8 : 12;
    };

    updateVisibleButtons();
    window.addEventListener('resize', updateVisibleButtons);
  },
  beforeUnmount() {
    const nav = this.$refs.scrollNav;
    if (nav) {
      nav.removeEventListener('scroll', this.updateScrollState);
    }
    window.removeEventListener('resize', this.updateVisibleButtons);
  },
  watch: {
    currentIdx() {
      this.scrollToActive();
    },
  },
};
</script>

<style scoped>
.question-navigation-container {
  @apply md:absolute w-full max-w-4xl  bottom-0 left-0 right-0 relative -mt-10;
}

.navigation-scroller {
  @apply w-full overflow-x-auto py-4 px-2;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

/* Niestandardowe style dla scrollbara zamiast klas tailwind-scrollbar */
.navigation-scroller::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}

.navigation-scroller::-webkit-scrollbar-track {
  background: transparent;
}

.navigation-scroller::-webkit-scrollbar-thumb {
  @apply bg-gray-300 rounded-full;
}

.navigation-scroller::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400;
}

.navigation-track {
  @apply flex space-x-2 min-w-max;
  padding: 0.25rem 2rem;
}

.navigation-button {
  @apply relative flex items-center justify-center rounded-full border-2 focus:outline-none transition-all duration-300;
  width: 3rem;
  height: 3rem;
  font-weight: 600;
}

.button-number {
  @apply text-base z-10;
}

.status-indicator {
  @apply absolute bottom-0 right-0 rounded-full z-20;
  height: 1rem;
  width: 1rem;
  transform: translate(25%, 25%);
}

.status-icon {
  @apply h-full w-full;
}

.navigation-button.current {
  @apply border-blue-500 bg-blue-500 text-white shadow-md z-10;
  transform: scale(1.1);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
}

.navigation-button.correct {
  @apply border-green-500 bg-green-500 text-white;
}

.navigation-button.wrong {
  @apply border-red-500 bg-red-500 text-white;
}

.navigation-button.unanswered {
  @apply border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:border-gray-400;
}

.navigation-button:disabled {
  @apply cursor-not-allowed opacity-70;
}

.status-icon.correct {
  @apply text-green-100 bg-green-600 rounded-full;
}

.status-icon.wrong {
  @apply text-red-100 bg-red-600 rounded-full;
}

/* Przyciski przewijania */
.scroll-indicators {
  @apply absolute top-4 left-0 w-full flex justify-between;
  pointer-events: none;
}

.scroll-button {
  @apply flex items-center justify-center bg-white rounded-full shadow-md border border-gray-200 h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none transition-all duration-200;
  pointer-events: auto;
}

.scroll-button:disabled {
  @apply opacity-0 cursor-default;
}

.scroll-button.left {
  margin-top: 1rem;
  margin-left: -2.25rem;
}

.scroll-button.right {
  margin-top: 1rem;
  margin-right: -2.25rem;
}

/* Legenda */
.navigation-legend {
  @apply flex flex-wrap justify-center mt-2 text-xs text-gray-500;
}

.legend-item {
  @apply flex items-center mx-2 mb-1;
}

.legend-dot {
  @apply inline-block rounded-full mr-1;
  width: 8px;
  height: 8px;
}

.legend-dot.current {
  @apply bg-blue-500;
}

.legend-dot.correct {
  @apply bg-green-500;
}

.legend-dot.wrong {
  @apply bg-red-500;
}

.legend-dot.unanswered {
  @apply bg-gray-300;
}

.legend-text {
  @apply text-xs;
}

/* Responsywność */
@media (max-width: 640px) {
  .navigation-button {
    width: 2.5rem;
    height: 2.5rem;
  }

  .button-number {
    @apply text-sm;
  }

  .navigation-legend {
    display: none;
  }

  .navigation-legend > * + * {
    margin-top: 0.25rem;
  }

  .legend-item {
    @apply mx-1;
  }
}

@media (min-width: 1024px) {
  .navigation-button {
    width: 3.5rem;
    height: 3.5rem;
  }

  .button-number {
    @apply text-lg;
  }
}

/* Animacje */
@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
  }
}

.navigation-button.current {
  animation: pulse 2s infinite;
}
</style>
