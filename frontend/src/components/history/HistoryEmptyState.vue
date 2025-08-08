<template>
  <div
    class="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm p-12 border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
  >
    <img
      src="@/assets/icons/plus.svg"
      alt="Dodaj"
      class="h-16 w-16 text-gray-300 mb-4 dark:text-gray-600"
    />
    <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300">Brak historii quizów</h2>
    <p class="text-gray-500 mt-2 text-center dark:text-gray-400">
      Ukończ swój pierwszy quiz lub egzamin, aby zobaczyć tutaj historię
    </p>
    <router-link
      to="/"
      class="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <span>Rozpocznij naukę</span>
      <img src="@/assets/icons/arrow-right.svg" alt="Strzałka w prawo" class="h-5 w-5 ml-2" />
    </router-link>
  </div>
</template>
