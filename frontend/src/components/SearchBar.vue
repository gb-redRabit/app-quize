<template>
  <div class="w-full sm:w-2/5 mb-4">
    <div
      class="flex items-center relative w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:border-blue-300 hover:shadow-md focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 focus-within:shadow-md"
      :class="{ 'border-blue-400': search }"
    >
      <div class="flex items-center justify-center text-gray-400 pl-3 pr-0">
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

      <input
        v-model="search"
        @input="$emit('update:search', search)"
        type="text"
        placeholder="Szukaj po ID lub treści pytania..."
        class="w-full p-3 text-gray-700 dark:text-gray-200 bg-transparent border-none outline-none focus:ring-0 placeholder-gray-400 dark:placeholder-gray-500 py-2.5 sm:text-base text-sm"
      />

      <button
        v-if="search"
        @click="clear"
        class="flex items-center justify-center p-2 mr-1 text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
        title="Wyczyść"
        aria-label="Wyczyść wyszukiwanie"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-5 h-5 transition-transform duration-200 hover:scale-110"
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
/* Responsive adjustments for small screens - equivalent to @media (max-width: 640px) */
@media (max-width: 640px) {
  .w-full.sm:w-2\/5.mb-4 {
    margin-bottom: 0.75rem; /* mb-3 */
  }

  .p-3.py-2\.5.text-sm {
    padding-top: 0.625rem; /* py-2.5 */
    padding-bottom: 0.625rem; /* py-2.5 */
    font-size: 0.95rem;
  }

  .clear-button {
    width: 24px;
    height: 24px;
  }
}
</style>
