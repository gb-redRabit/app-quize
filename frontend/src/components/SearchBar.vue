<template>
  <div class="search-container">
    <div class="search-wrapper" :class="{ 'has-value': search }">
      <!-- Ikona lupy -->
      <div class="search-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          class="w-5 h-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <!-- Pole wyszukiwania -->
      <input
        v-model="search"
        @input="$emit('update:search', search)"
        type="text"
        placeholder="Szukaj po ID lub treści pytania..."
        class="search-input"
      />

      <!-- Przycisk czyszczenia -->
      <button
        v-if="search"
        @click="clear"
        class="clear-button"
        title="Wyczyść"
        aria-label="Wyczyść wyszukiwanie"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-5 h-5"
        >
          <path
            fill-rule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: String,
  },
  data() {
    return {
      search: this.modelValue || '',
    };
  },
  watch: {
    modelValue(val) {
      this.search = val;
    },
  },
  methods: {
    clear() {
      this.search = '';
      this.$emit('update:search', '');
    },
  },
};
</script>

<style scoped>
.search-container {
  @apply w-full sm:w-2/5 mb-4;
}

.search-wrapper {
  @apply flex items-center relative w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300;
}

.search-wrapper:hover {
  @apply border-blue-300 shadow-md;
}

.search-wrapper:focus-within {
  @apply border-blue-400 ring-2 ring-blue-100 shadow-md;
}

.search-wrapper.has-value {
  @apply border-blue-400;
}

.search-icon {
  @apply flex items-center justify-center text-gray-400 pl-3 pr-0;
}

.search-input {
  @apply w-full p-3 text-gray-700 bg-transparent border-none outline-none focus:ring-0;
}

.search-input::placeholder {
  @apply text-gray-400;
}

.clear-button {
  @apply flex items-center justify-center p-2 mr-1 text-gray-400 rounded-full hover:bg-gray-100 transition-colors duration-200;
  width: 28px;
  height: 28px;
}

.clear-button:hover {
  @apply text-gray-600;
}

.clear-button:focus {
  @apply outline-none ring-2 ring-blue-300;
}

.clear-button svg {
  @apply transition-transform duration-200;
}

.clear-button:hover svg {
  transform: scale(1.1);
}

/* Responsywność */
@media (max-width: 640px) {
  .search-container {
    @apply w-full mb-3;
  }

  .search-input {
    @apply py-2.5;
    font-size: 0.95rem;
  }

  .clear-button {
    width: 24px;
    height: 24px;
  }
}
</style>
