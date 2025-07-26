<template>
  <div class="container flex flex-col gap-6 p-6 animate-pulse">
    <!-- Nagłówek -->
    <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
    <!-- Podtytuł -->
    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
    <!-- Kilka linii tekstu -->
    <div class="flex flex-col gap-2 mb-4">
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
    </div>
    <!-- Lista kart/elementów -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="i in 4"
        :key="i"
        class="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg flex flex-col gap-2"
      >
        <div class="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
        <div class="flex gap-2 mt-2">
          <div class="h-8 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div class="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseSkeleton',
};
</script>
