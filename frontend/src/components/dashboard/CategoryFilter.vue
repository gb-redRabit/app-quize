<!-- filepath: d:\git nowe\app-quize\frontend\src\components\dashboard\CategoryFilter.vue -->
<template>
  <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-xl font-bold text-gray-700 dark:text-gray-200 px-1">Lista kategorii</h2>
      <div class="hidden md:flex items-center space-x-2 view-options">
        <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex">
          <button
            @click="$emit('update:view-type', 'grid')"
            class="p-1.5 rounded-md"
            :class="
              viewType === 'grid'
                ? 'bg-white dark:bg-gray-700 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            "
            title="Widok kafelków"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
          <button
            @click="$emit('update:view-type', 'list')"
            class="p-1.5 rounded-md"
            :class="
              viewType === 'list'
                ? 'bg-white dark:bg-gray-700 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            "
            title="Widok listy"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </button>
        </div>
        <div v-if="viewType === 'grid'" class="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex">
          <button
            v-for="cols in [2, 3, 4]"
            :key="cols"
            @click="$emit('update:grid-columns', cols)"
            class="px-2.5 py-1.5 rounded-md text-xs font-medium"
            :class="
              gridColumns === cols
                ? 'bg-white dark:bg-gray-700 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            "
          >
            {{ cols }}
          </button>
        </div>
      </div>
    </div>
    <div class="flex mb-4">
      <div class="relative w-full">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
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
          type="text"
          :value="searchQuery"
          @input="$emit('update:search-query', $event.target.value)"
          placeholder="Szukaj kategorii..."
          class="search-input block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
        />
      </div>
    </div>

    <div
      class="filter-options flex overflow-x-auto hide-scrollbar bg-gray-50 dark:bg-gray-900 rounded-lg"
    >
      <button
        v-for="filter in filters"
        :key="filter.value"
        @click="$emit('update:active-filter', filter.value)"
        class="px-4 py-3 text-sm font-medium whitespace-nowrap"
        :class="
          activeFilter === filter.value
            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        "
      >
        {{ filter.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  activeFilter: {
    type: String,
    required: true,
  },
  viewType: {
    type: String,
    required: true,
  },
  gridColumns: {
    type: Number,
    required: true,
  },
  searchQuery: {
    type: String,
    required: true,
  },
});

const emit = defineEmits([
  'update:active-filter',
  'update:view-type',
  'update:grid-columns',
  'update:search-query',
]);

const filters = [
  { value: 'all', label: 'Wszystkie kategorie' },
  { value: 'exam', label: 'Egzaminy' },
  { value: 'other', label: 'Pozostałe' },
  { value: 'lawtest', label: 'Testy prawnicze' },
];
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
