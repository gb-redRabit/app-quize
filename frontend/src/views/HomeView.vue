<template>
  <div class="container mx-auto">
    <div class="mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <section class="mb-10">
        <div class="flex flex-col md:flex-row gap-6 items-center">
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Witaj w systemie nauki!
            </h1>
            <p class="mt-2 text-gray-600 dark:text-gray-300">
              Monitoruj swoje postępy i kontynuuj naukę
            </p>
          </div>
          <div class="flex-1">
            <RandomQuote />
          </div>
        </div>
      </section>
      <section class="mb-10">
        <h2 class="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4 px-1">
          Twoje statystyki
        </h2>
        <div class="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <div
            class="p-4 rounded-xl shadow-sm border flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200"
          >
            <span class="text-2xl font-bold mb-1">{{ questionsCount }}</span>
            <span class="text-xs font-medium">Wszystkich</span>
          </div>
          <div
            class="p-4 rounded-xl shadow-sm border flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200"
          >
            <span class="text-2xl font-bold mb-1">{{ hqStats.correct }}</span>
            <span class="text-xs font-medium">Poprawnie</span>
          </div>
          <div
            class="p-4 rounded-xl shadow-sm border flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow bg-red-50 border-red-200 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-200"
          >
            <span class="text-2xl font-bold mb-1">{{ hqStats.wrong }}</span>
            <span class="text-xs font-medium">Błędnie</span>
          </div>
          <div
            class="p-4 rounded-xl shadow-sm border flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:border-indigo-700 dark:text-indigo-200"
          >
            <span class="text-2xl font-bold mb-1">{{ historyStats.quizCount }}</span>
            <span class="text-xs font-medium">Quizy</span>
          </div>
          <div
            class="p-4 rounded-xl shadow-sm border flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900 dark:border-purple-700 dark:text-purple-200"
          >
            <span class="text-2xl font-bold mb-1">{{ historyStats.examCount }}</span>
            <span class="text-xs font-medium">Egzaminy</span>
          </div>
          <div
            class="p-4 rounded-xl shadow-sm border flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200"
          >
            <span class="text-2xl font-bold mb-1">{{ historyStats.avg }}%</span>
            <span class="text-xs font-medium">Średnia</span>
          </div>
        </div>
      </section>
      <section class="mb-10">
        <div class="flex flex-col sm:flex-row gap-4">
          <BaseButton
            color="blue"
            class="flex-1 py-4 rounded-xl shadow-md hover:shadow-lg transition-all text-center font-semibold"
            @click="showExamPopup = true"
          >
            <div class="flex items-center justify-center gap-2">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Rozpocznij egzamin z ubiegłych lat</span>
            </div>
          </BaseButton>
          <BaseButton
            color="blue"
            class="flex-1 py-4 rounded-xl shadow-md hover:shadow-lg transition-all text-center font-semibold"
            @click="showOtherQuizPopup = true"
          >
            <div class="flex items-center justify-center gap-2">
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
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Rozpocznij quiz z pozostałych kategorii</span>
            </div>
          </BaseButton>
        </div>
      </section>
      <section>
        <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-700 dark:text-gray-200 px-1">Lista kategorii</h2>
            <div class="flex items-center space-x-2">
              <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex">
                <button
                  @click="viewType = 'grid'"
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
                  @click="viewType = 'list'"
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
              <div
                v-if="viewType === 'grid'"
                class="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex"
              >
                <button
                  v-for="cols in [2, 3, 4]"
                  :key="cols"
                  @click="gridColumns = cols"
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
                v-model="searchQuery"
                placeholder="Szukaj kategorii..."
                class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
              />
            </div>
          </div>

          <div class="flex overflow-x-auto hide-scrollbar bg-gray-50 dark:bg-gray-900 rounded-lg">
            <button
              @click="activeFilter = 'all'"
              class="px-4 py-3 text-sm font-medium whitespace-nowrap"
              :class="
                activeFilter === 'all'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              "
            >
              Wszystkie kategorie
            </button>
            <button
              @click="activeFilter = 'exam'"
              class="px-4 py-3 text-sm font-medium whitespace-nowrap"
              :class="
                activeFilter === 'exam'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              "
            >
              Egzaminy
            </button>
            <button
              @click="activeFilter = 'other'"
              class="px-4 py-3 text-sm font-medium whitespace-nowrap"
              :class="
                activeFilter === 'other'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              "
            >
              Pozostałe
            </button>
            <button
              @click="activeFilter = 'lawtest'"
              class="px-4 py-3 text-sm font-medium whitespace-nowrap"
              :class="
                activeFilter === 'lawtest'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              "
            >
              Testy prawnicze
            </button>
          </div>
        </div>
        <div v-if="viewType === 'grid'" :class="gridLayoutClass">
          <div
            v-for="cat in searchedCategories"
            :key="cat"
            class="rounded-lg border-2 shadow-sm p-4 transition-all duration-300 hover:shadow-lg"
            :class="getCategoryCardClass(cat)"
          >
            <div class="flex justify-between items-start mb-3">
              <h3
                class="font-semibold text-gray-800 dark:text-gray-100 truncate max-w-[70%]"
                :title="cat"
              >
                {{ cat }}
              </h3>
              <div class="flex items-center gap-2">
                <span
                  class="text-xs font-medium px-2 py-1 rounded-full"
                  :class="{
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200':
                      categoryPercentComplete(cat) > 75,
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200':
                      categoryPercentComplete(cat) > 25 && categoryPercentComplete(cat) <= 75,
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200':
                      categoryPercentComplete(cat) <= 25,
                  }"
                >
                  {{ categoryPercentComplete(cat) }}%
                </span>
                <span
                  v-if="getCategoryStatus(cat)"
                  class="text-xs font-medium px-2 py-1 rounded-full"
                  :class="getCategoryStatusClass(cat)"
                >
                  {{ getCategoryStatus(cat) }}
                </span>
              </div>
            </div>
            <div
              class="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 flex overflow-hidden mb-3"
            >
              <div
                class="bg-green-400 h-full"
                :style="{ width: categoryPercentage(cat).correct + '%' }"
              ></div>
              <div
                class="bg-red-400 h-full"
                :style="{ width: categoryPercentage(cat).wrong + '%' }"
              ></div>
            </div>
            <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-4">
              <div class="flex gap-2">
                <span class="flex items-center"
                  ><span class="w-2 h-2 inline-block bg-green-400 rounded-full mr-1"></span>
                  {{ categoryStats(cat).correct }}</span
                >
                <span class="flex items-center"
                  ><span class="w-2 h-2 inline-block bg-red-400 rounded-full mr-1"></span>
                  {{ categoryStats(cat).wrong }}</span
                >
                <span class="flex items-center"
                  ><span class="w-2 h-2 inline-block bg-gray-400 rounded-full mr-1"></span>
                  {{ categoryStats(cat).notDone }}</span
                >
              </div>
              <span class="font-medium">Łącznie: {{ categoryCounts[cat] || 0 }}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <BaseButton
                color="blue"
                size="sm"
                class="text-xs"
                @click="goToCategoryQuestions(cat)"
              >
                <span class="truncate">Pytania</span>
              </BaseButton>
              <div class="relative">
                <BaseButton
                  color="green"
                  size="sm"
                  class="w-full text-xs"
                  :disabled="categoryStats(cat).notDone === 0 && categoryStats(cat).wrong === 0"
                  @click="showQuizOptions[cat] = !showQuizOptions[cat]"
                >
                  <span class="truncate">Quiz</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3 w-3 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </BaseButton>
                <div v-if="showQuizOptions[cat]" class="absolute z-10 w-full mt-1">
                  <div
                    class="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg py-1"
                  >
                    <a
                      class="block px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      @click="
                        startQuizNotDone(cat, 50);
                        showQuizOptions[cat] = false;
                      "
                    >
                      Max 50 pytań
                    </a>
                    <a
                      class="block px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      @click="
                        startQuizNotDone(cat, 150);
                        showQuizOptions[cat] = false;
                      "
                    >
                      Max 150 pytań
                    </a>
                    <a
                      class="block px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      @click="
                        startQuizNotDone(cat, 0);
                        showQuizOptions[cat] = false;
                      "
                    >
                      Cała pula
                    </a>
                  </div>
                </div>
              </div>
              <div class="flex gap-1">
                <BaseButton
                  color="purple"
                  size="sm"
                  class="flex-1 text-xs"
                  :disabled="categoryStats(cat).notDone === 0 && categoryStats(cat).wrong === 0"
                  @click="startExamNotDone(cat)"
                >
                  <span class="truncate">Egzamin</span>
                </BaseButton>
                <BaseButton color="red" size="sm" class="px-2" @click="clearCategoryHistory(cat)">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </BaseButton>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="cat in searchedCategories"
            :key="cat"
            class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-3 transition-colors"
          >
            <div class="flex-1">
              <div class="flex items-start justify-between mb-2">
                <h3 class="font-semibold text-gray-800 dark:text-gray-100" :title="cat">
                  {{ cat }}
                </h3>
                <div class="flex items-center gap-2 ml-3">
                  <span
                    class="text-xs font-medium px-2 py-1 rounded-full"
                    :class="{
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200':
                        categoryPercentComplete(cat) > 75,
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200':
                        categoryPercentComplete(cat) > 25 && categoryPercentComplete(cat) <= 75,
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200':
                        categoryPercentComplete(cat) <= 25,
                    }"
                  >
                    {{ categoryPercentComplete(cat) }}%
                  </span>
                  <span
                    v-if="getCategoryStatus(cat)"
                    class="text-xs font-medium px-2 py-1 rounded-full"
                    :class="getCategoryStatusClass(cat)"
                  >
                    {{ getCategoryStatus(cat) }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-4 mb-2">
                <div
                  class="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 flex overflow-hidden"
                >
                  <div
                    class="bg-green-400 h-full"
                    :style="{ width: categoryPercentage(cat).correct + '%' }"
                  ></div>
                  <div
                    class="bg-red-400 h-full"
                    :style="{ width: categoryPercentage(cat).wrong + '%' }"
                  ></div>
                </div>
                <span class="text-xs font-medium whitespace-nowrap dark:text-gray-300">
                  Łącznie: {{ categoryCounts[cat] || 0 }}
                </span>
              </div>

              <div class="flex gap-3 text-xs text-gray-600 dark:text-gray-400">
                <span class="flex items-center"
                  ><span class="w-2 h-2 inline-block bg-green-400 rounded-full mr-1"></span>
                  {{ categoryStats(cat).correct }}</span
                >
                <span class="flex items-center"
                  ><span class="w-2 h-2 inline-block bg-red-400 rounded-full mr-1"></span>
                  {{ categoryStats(cat).wrong }}</span
                >
                <span class="flex items-center"
                  ><span class="w-2 h-2 inline-block bg-gray-400 rounded-full mr-1"></span>
                  {{ categoryStats(cat).notDone }}</span
                >
              </div>
            </div>

            <div class="flex flex-wrap gap-2 justify-end">
              <BaseButton
                color="blue"
                size="md"
                class="text-md"
                @click="goToCategoryQuestions(cat)"
              >
                Pytania
              </BaseButton>
              <div class="relative">
                <BaseButton
                  color="green"
                  size="md"
                  class="text-md"
                  :disabled="categoryStats(cat).notDone === 0 && categoryStats(cat).wrong === 0"
                  @click="showQuizOptions[cat] = !showQuizOptions[cat]"
                >
                  Quiz
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3 w-3 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </BaseButton>
                <div v-if="showQuizOptions[cat]" class="absolute z-10 w-full mt-1">
                  <div
                    class="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg py-1"
                  >
                    <a
                      class="block px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      @click="
                        startQuizNotDone(cat, 50);
                        showQuizOptions[cat] = false;
                      "
                    >
                      Max 50 pytań
                    </a>
                    <a
                      class="block px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      @click="
                        startQuizNotDone(cat, 150);
                        showQuizOptions[cat] = false;
                      "
                    >
                      Max 150 pytań
                    </a>
                    <a
                      class="block px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      @click="
                        startQuizNotDone(cat, 0);
                        showQuizOptions[cat] = false;
                      "
                    >
                      Cała pula
                    </a>
                  </div>
                </div>
              </div>
              <BaseButton
                color="purple"
                size="md"
                class="text-xs"
                :disabled="categoryStats(cat).notDone === 0 && categoryStats(cat).wrong === 0"
                @click="startExamNotDone(cat)"
              >
                Egzamin
              </BaseButton>
              <BaseButton color="red" size="md" class="px-2" @click="clearCategoryHistory(cat)">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </BaseButton>
            </div>
          </div>
        </div>
      </section>
    </div>

    <BaseModal :show="showExamPopup" @close="showExamPopup = false">
      <h3 class="text-lg font-bold mb-6 text-gray-800 dark:text-gray-100">
        Wybierz kategorię egzaminu:
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          v-for="cat in examCategories"
          :key="cat"
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900 dark:hover:border-blue-600"
          @click="startExamFromCategory(cat)"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="flex-1">
              <h4 class="font-medium text-gray-800 dark:text-gray-200 mb-1">{{ cat }}</h4>
              <div
                v-if="examStatsByCategory[cat] && examStatsByCategory[cat].total > 0"
                class="w-full h-2 rounded bg-gray-200 dark:bg-gray-700 flex overflow-hidden"
              >
                <div
                  class="bg-green-400 h-2"
                  :style="{
                    width:
                      (examStatsByCategory[cat].correct / examStatsByCategory[cat].total) * 100 +
                      '%',
                  }"
                ></div>
                <div
                  class="bg-red-400 h-2"
                  :style="{
                    width:
                      (examStatsByCategory[cat].wrong / examStatsByCategory[cat].total) * 100 + '%',
                  }"
                ></div>
              </div>
            </div>

            <div
              class="px-2 py-1 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full whitespace-nowrap"
            >
              <span v-if="examStatsByCategory[cat] && examStatsByCategory[cat].total > 0">
                {{ examStatsByCategory[cat].correct }}/{{ examStatsByCategory[cat].total }}
              </span>
              <span v-else>Nowy</span>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>

    <BaseModal :show="showOtherQuizPopup" @close="showOtherQuizPopup = false">
      <h3 class="text-lg font-bold mb-6 text-gray-800 dark:text-gray-100">
        Wybierz kategorię quizu:
      </h3>
      <div class="grid grid-cols-1 gap-3">
        <div
          v-for="cat in otherCategories"
          :key="cat"
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 transition-all"
        >
          <div class="flex items-center justify-between gap-3 mb-2">
            <div class="flex-1">
              <h4 class="font-medium text-gray-800 dark:text-gray-200 mb-1">{{ cat }}</h4>
              <div
                v-if="quizStatsByCategory[cat] && quizStatsByCategory[cat].total > 0"
                class="w-full h-2 rounded bg-gray-200 dark:bg-gray-700 flex overflow-hidden"
              >
                <div
                  class="bg-green-400 h-2"
                  :style="{
                    width:
                      (quizStatsByCategory[cat].correct / quizStatsByCategory[cat].total) * 100 +
                      '%',
                  }"
                ></div>
                <div
                  class="bg-red-400 h-2"
                  :style="{
                    width:
                      (quizStatsByCategory[cat].wrong / quizStatsByCategory[cat].total) * 100 + '%',
                  }"
                ></div>
              </div>
            </div>

            <div
              class="px-2 py-1 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full whitespace-nowrap"
            >
              <span v-if="quizStatsByCategory[cat] && quizStatsByCategory[cat].total > 0">
                {{ quizStatsByCategory[cat].correct }}/{{ quizStatsByCategory[cat].total }}
              </span>
              <span v-else>Nowy</span>
            </div>
          </div>

          <div class="flex gap-2">
            <BaseButton
              color="green"
              size="sm"
              class="flex-1"
              :disabled="categoryStats(cat).notDone === 0 && categoryStats(cat).wrong === 0"
              @click="startQuizNotDone(cat, 50)"
            >
              Max 50 pytań
            </BaseButton>
            <BaseButton
              color="green"
              size="sm"
              class="flex-1"
              :disabled="categoryStats(cat).notDone === 0 && categoryStats(cat).wrong === 0"
              @click="startQuizNotDone(cat, 0)"
            >
              Cała pula
            </BaseButton>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import RandomQuote from '@/components/RandomQuote.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseModal from '@/components/BaseModal.vue';
import apiClient from '@/api';

// --- Injections, Store and Router ---
const showAlert = inject('showAlert');
const store = useStore();
const router = useRouter();

// --- State ---
const showExamPopup = ref(false);
const showOtherQuizPopup = ref(false);
const showQuizOptions = ref({});
const activeFilter = ref('all');
const viewType = ref('grid');
const gridColumns = ref(3);
const searchQuery = ref('');
const stats = ref({ totalQuestions: 0, categories: [] });

// --- Getters and State from Vuex ---

const hiddenCategory = computed(() => store.getters['user/getUser'].hiddenCategory);
const categories = computed(() =>
  (store.getters['questions/getCategories'] || []).sort((a, b) => a.localeCompare(b))
);
const categoryCounts = computed(() => store.getters['questions/getCategoryCounts'] || {});
const questionsCount = computed(() =>
  Object.values(categoryCounts.value).reduce((a, b) => a + b, 0)
);
const userHistory = computed(() => store.getters['user/getUserHistory'] || []);
const hquestion = computed(() => store.getters['user/getHquestion'] || []);

// --- Computed Properties ---
const examCategories = computed(() =>
  categories.value.filter((cat) => cat && cat.toLowerCase().includes('egzamin'))
);

const lawTestCategories = computed(() =>
  categories.value.filter((cat) => cat && cat.startsWith('TP:'))
);

const otherCategories = computed(() =>
  categories.value.filter(
    (cat) => cat && !examCategories.value.includes(cat) && !lawTestCategories.value.includes(cat)
  )
);

const examStatsByCategory = computed(() => {
  if (!userHistory.value.length) return {};
  const stats = {};
  for (const cat of examCategories.value) {
    const last = [...userHistory.value]
      .reverse()
      .find(
        (entry) =>
          entry.category === cat ||
          (Array.isArray(entry.categories) && entry.categories.includes(cat))
      );
    stats[cat] = last
      ? {
          correct: last.correct || 0,
          wrong: last.wrong || 0,
          total: (last.correct || 0) + (last.wrong || 0),
        }
      : { correct: 0, wrong: 0, total: 0 };
  }
  return stats;
});

const quizStatsByCategory = computed(() => {
  if (!userHistory.value.length) return {};
  const stats = {};
  for (const cat of otherCategories.value) {
    const last = [...userHistory.value]
      .reverse()
      .find(
        (entry) =>
          entry.category === cat ||
          (Array.isArray(entry.categories) && entry.categories.includes(cat))
      );
    stats[cat] = last
      ? {
          correct: last.correct || 0,
          wrong: last.wrong || 0,
          total: (last.correct || 0) + (last.wrong || 0),
        }
      : { correct: 0, wrong: 0, total: 0 };
  }
  return stats;
});

const hqStats = computed(() => {
  const hq = hquestion.value;
  const done = hq.length;
  const correct = hq.filter((q) => q.correct === true).length;
  const wrong = hq.filter((q) => q.correct === false).length;
  const notDone = questionsCount.value - done;
  return { done, correct, wrong, notDone: Math.max(0, notDone) };
});

const historyStats = computed(() => {
  const onlyMain = userHistory.value.filter((h) => h.type === 'quiz' || h.type === 'egzamin');
  const quizCount = userHistory.value.filter((h) => h.type === 'quiz').length;
  const examCount = userHistory.value.filter((h) => h.type === 'egzamin').length;
  let avg = 0;
  if (onlyMain.length) {
    const sum = onlyMain.reduce((acc, h) => {
      const total = (h.correct || 0) + (h.wrong || 0);
      return total > 0 ? acc + Math.round(((h.correct || 0) / total) * 100) : acc;
    }, 0);
    avg = Math.round(sum / onlyMain.length);
  }
  return { quizCount, examCount, avg };
});

const filteredCategories = computed(() => {
  if (activeFilter.value === 'exam')
    return examCategories.value.slice().sort((a, b) => a.localeCompare(b));
  if (activeFilter.value === 'other')
    return otherCategories.value.slice().sort((a, b) => a.localeCompare(b));
  if (activeFilter.value === 'lawtest')
    return lawTestCategories.value.slice().sort((a, b) => a.localeCompare(b));
  return categories.value;
});

const searchedCategories = computed(() => {
  const hidden = hiddenCategory.value || [];
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

// --- Methods ---
const startExamFromCategory = (cat) => {
  showExamPopup.value = false;
  const max = categoryCounts.value[cat] || 10;
  router.push({ name: 'QuizView', query: { length: max, categories: cat } });
};

const categoryStats = (cat) => {
  const all = hquestion.value.filter((q) => q.category === cat);
  const correct = all.filter((q) => q.correct === true).length;
  const wrong = all.filter((q) => q.correct === false).length;
  const total = categoryCounts.value[cat] || 0;
  const notDone = total - all.length;
  return { correct, wrong, notDone: Math.max(0, notDone) };
};

const categoryPercentage = (cat) => {
  const stats = categoryStats(cat);
  const total = categoryCounts.value[cat] || 0;
  if (total === 0) return { correct: 0, wrong: 0 };
  return {
    correct: (stats.correct / total) * 100,
    wrong: (stats.wrong / total) * 100,
  };
};

const categoryPercentComplete = (cat) => {
  const stats = categoryStats(cat);
  const total = categoryCounts.value[cat] || 0;
  if (total === 0) return 0;
  return Math.round(((stats.correct + stats.wrong) / total) * 100);
};

const goToCategoryQuestions = async (cat) => {
  try {
    await store.dispatch('questions/fetchQuestionsByCategory', cat);
    router.push({ name: 'CategoryQuestions', params: { category: cat } });
  } catch (e) {
    showAlert('error', 'Błąd ładowania pytań z kategorii');
  } finally {
  }
};

const startQuizNotDone = async (cat, limit = 150) => {
  if (typeof showAlert === 'function') showAlert('info', 'Przygotowywanie quizu...');
  try {
    const idsToUse = await getQuestionIdsForQuiz(cat);
    if (!idsToUse.length) {
      showAlert && showAlert('warning', 'Brak pytań do quizu w tej kategorii.');
      return;
    }
    const length = limit === 0 ? idsToUse.length : Math.min(limit, idsToUse.length);
    router.push({
      name: 'QuizView',
      query: { length, categories: cat, onlyNotDone: true, ids: idsToUse.join(',') },
    });
  } catch (e) {
    showAlert && showAlert('error', 'Błąd pobierania pytań z serwera.');
  }
};

const getQuestionIdsForQuiz = async (cat) => {
  try {
    const questions = await store.dispatch('questions/fetchQuestionsByCategory', cat);
    const allIds = questions.map((q) => q.ID || q.id || q.Id || q.id_question);

    const hq = hquestion.value.filter((q) => q.category === cat);
    const wrongOrNotDoneIds = allIds.filter((id) => {
      const entry = hq.find((q) => q.id == id);
      return !entry || entry.correct === false;
    });

    return wrongOrNotDoneIds.length > 0 ? wrongOrNotDoneIds : allIds;
  } catch (e) {
    showAlert && showAlert('error', 'Błąd pobierania pytań z serwera.');
    return [];
  }
};

const startExamNotDone = async (cat) => {
  try {
    const idsToUse = await getQuestionIdsForQuiz(cat);
    const length = Math.min(150, idsToUse.length);
    router.push({
      name: 'ExamView',
      query: { length, categories: cat, time: 60, onlyNotDone: true, ids: idsToUse.join(',') },
    });
  } catch (e) {
    showAlert('error', 'Błąd pobierania pytań z serwera.');
  } finally {
  }
};

const clearCategoryHistory = async (cat) => {
  try {
    await store.dispatch('user/clearCategoryHistory', cat);
    await store.dispatch('user/fetchUserHistoryAndHQ');
    showAlert('success', `Historia kategorii "${cat}" została wyczyszczona`);
  } catch (e) {
    showAlert('error', 'Błąd podczas czyszczenia pytań z kategorii.');
  } finally {
  }
};

const fetchStats = async () => {
  try {
    const res = await apiClient.get('/stats');
    stats.value = res.data || { totalQuestions: 0, categories: [] };
  } catch (e) {
    showAlert('error', 'Błąd ładowania statystyk');
  } finally {
  }
};

const getCategoryCardClass = (cat) => {
  const stats = categoryStats(cat);
  const total = categoryCounts.value[cat] || 0;
  if (total === 0) return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  const percentDone = ((stats.correct + stats.wrong) / total) * 100;
  const percentCorrect =
    stats.correct > 0 ? (stats.correct / (stats.correct + stats.wrong)) * 100 : 0;
  if (percentDone === 0) return 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600';
  if (stats.correct === total)
    return 'bg-green-200 border-green-500 shadow-lg text-green-900 dark:bg-green-800 dark:border-green-600 dark:text-green-100';
  if (stats.wrong === total)
    return 'bg-red-200 border-red-500 shadow-lg text-red-900 dark:bg-red-800 dark:border-red-600 dark:text-red-100';
  if (percentDone > 50 && percentCorrect > 70)
    return 'bg-green-100 border-green-400 shadow-md text-green-800 dark:bg-green-900 dark:border-green-500 dark:text-green-200';
  if (percentDone > 50 && percentCorrect >= 40)
    return 'bg-yellow-100 border-yellow-400 shadow-md text-yellow-800 dark:bg-yellow-900 dark:border-yellow-500 dark:text-yellow-200';
  if (percentDone > 50)
    return 'bg-red-100 border-red-400 shadow-md text-red-800 dark:bg-red-900 dark:border-red-500 dark:text-red-200';
  if (percentCorrect > 70)
    return 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900 dark:border-emerald-500 dark:text-emerald-200';
  if (percentCorrect >= 40)
    return 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900 dark:border-amber-500 dark:text-amber-200';
  return 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900 dark:border-orange-500 dark:text-orange-200';
};

const getCategoryStatus = (cat) => {
  const stats = categoryStats(cat);
  const total = categoryCounts.value[cat] || 0;
  if (total === 0) return '';
  const percentDone = ((stats.correct + stats.wrong) / total) * 100;
  if (percentDone === 0) return 'Nowa';
  if (percentDone === 100) {
    const percentCorrect = (stats.correct / total) * 100;
    if (percentCorrect === 100) return 'Opanowana';
    if (percentCorrect >= 80) return 'Bardzo dobra';
    if (percentCorrect >= 60) return 'Dobra';
    if (percentCorrect >= 40) return 'Średnia';
    return 'Do poprawy';
  }
  if (percentDone >= 75) return 'W trakcie';
  if (percentDone >= 50) return 'Połowa';
  if (percentDone >= 25) return 'Rozpoczęta';
  return 'Nowa';
};

const getCategoryStatusClass = (cat) => {
  const status = getCategoryStatus(cat);
  const classes = {
    Opanowana: 'bg-green-200 text-green-900 dark:bg-green-700 dark:text-green-100',
    'Bardzo dobra': 'bg-blue-300 text-blue-900 dark:bg-blue-700 dark:text-blue-100',
    Dobra: 'bg-blue-100 text-blue-500 dark:bg-blue-500 dark:text-blue-100',
    Średnia: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100',
    'Do poprawy': 'bg-red-200 text-red-900 dark:bg-red-700 dark:text-red-100',
    'W trakcie': 'bg-blue-100 text-blue-300 dark:bg-blue-300 dark:text-blue-100',
    Połowa: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-700 dark:text-indigo-100',
    Rozpoczęta: 'bg-purple-200 text-purple-900 dark:bg-purple-700 dark:text-purple-100',
    Nowa: 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
  };
  return classes[status] || 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-100';
};

// --- Lifecycle Hook ---
onMounted(async () => {
  await store.dispatch('questions/fetchStats');
  await store.dispatch('user/fetchUserHistoryAndHQ'); // <-- dodaj to!
});
</script>

<style scoped></style>
