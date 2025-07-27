<template>
  <div class="container mx-auto p-4 sm:p-6 lg:p-8">
    <div class="mb-8">
      <h1 class="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200">
        Panel Administratora
      </h1>
    </div>

    <!-- Zakładki -->
    <div class="mb-8 border-b border-gray-200 dark:border-gray-700 flex gap-2">
      <BaseButton
        v-for="tab in tabs"
        :key="tab.key"
        :color="activeTab === tab.key ? 'blue' : 'gray'"
        :variant="activeTab === tab.key ? 'solid' : 'outline'"
        class="rounded-t px-4 py-2 font-medium"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </BaseButton>
    </div>

    <!-- Zawartość zakładek -->
    <div v-if="activeTab === 'questions'">
      <!-- Szybkie akcje -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          @click="openAddPopup"
          class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div class="bg-sky-500 p-3 rounded-full">
            <svg
              class="w-6 h-6 text-gray-600 dark:text-gray-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-gray-800 dark:text-gray-100">Dodaj pytanie</h3>
            <p class="text-sm text-sky-600 dark:text-sky-400">Otwórz formularz</p>
          </div>
        </div>
        <div
          class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex items-center gap-4"
        >
          <div class="bg-green-100 dark:bg-green-700 p-3 rounded-full">
            <svg
              class="w-6 h-6 text-green-600 dark:text-green-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V7a2 2 0 012-2h5l2 2h5a2 2 0 012 2v5a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-gray-700 dark:text-gray-100">Eksport</h3>
            <BaseButton color="green" size="sm" @click="exportQuestionsExcel" class="mt-1"
              >Pobierz plik .xlsx</BaseButton
            >
          </div>
        </div>
        <div
          class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex items-center gap-4"
        >
          <div class="bg-sky-100 dark:bg-sky-700 p-3 rounded-full">
            <svg
              class="w-6 h-6 text-gray-600 dark:text-gray-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-gray-700 dark:text-gray-100">Import</h3>
            <label
              class="text-sm text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200 font-medium cursor-pointer"
            >
              Wybierz plik .xlsx
              <input type="file" accept=".xlsx" @change="importQuestions" class="hidden" />
            </label>
            <BaseButton color="gray" size="sm" @click="showExcelInfo = true" class="block mt-1 p-1"
              >Jak przygotować plik?</BaseButton
            >
          </div>
        </div>
        <div
          class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex items-center gap-4"
        >
          <div class="bg-red-100 dark:bg-red-700 p-3 rounded-full">
            <svg
              class="w-6 h-6 text-red-600 dark:text-red-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-gray-700 dark:text-gray-100">Strefa niebezpieczna</h3>
            <BaseButton color="red" size="sm" @click="showClearQuestionsModal = true" class="mt-1"
              >Wyczyść bazę pytań</BaseButton
            >
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'batch'">
      <!-- Grupowa edycja pytań -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 space-y-6"
      >
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Grupowa edycja pytań po ID
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              for="batch-ids"
              class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >ID pytań (oddzielone przecinkami)</label
            >
            <input
              type="text"
              id="batch-ids"
              v-model="batchIdsInput"
              class="p-2 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Np. 123, 456, 789"
            />
          </div>
          <div>
            <label
              for="batch-category"
              class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >Nowa kategoria (opcjonalnie)</label
            >
            <select
              id="batch-category"
              v-model="batchEditCategory"
              class="p-2 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">-- Bez zmiany --</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >Nowy opis (opcjonalnie)</label
            >
            <div class="flex gap-2">
              <input
                type="text"
                v-model="batchEditDescPart1"
                class="p-2 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Część 1 opisu (np. dowolny tekst)"
              />
              <input
                type="text"
                v-model="batchEditDescPart2"
                class="p-2 block w-48 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder='Część "art..."'
              />
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Druga część powinna zaczynać się od "art" (np. art. 12 ust. 1 ...)
            </div>
          </div>
        </div>
        <div class="mt-4 flex flex-col md:flex-row gap-2">
          <BaseButton color="blue" @click="fetchBatchQuestions" class="w-full md:w-auto"
            >Pobierz pytania</BaseButton
          >
          <BaseButton
            color="green"
            @click="saveBatchEdit"
            :disabled="!batchQuestions.length"
            class="w-full md:w-auto"
            >Zapisz zmiany</BaseButton
          >
        </div>
        <div
          v-if="batchQuestions.length"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 class="text-md font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Znalezione pytania ({{ batchQuestions.length }})
          </h3>
          <div class="overflow-x-auto">
            <table class="min-w-full text-xs bg-white dark:bg-gray-800 rounded shadow">
              <thead>
                <tr>
                  <th class="p-2 text-left">ID</th>
                  <th class="p-2 text-left">Treść</th>
                  <th class="p-2 text-left">Odpowiedzi</th>
                  <th class="p-2 text-left">Poprawne</th>
                  <th class="p-2 text-left">Kategoria</th>
                  <th class="p-2 text-left">Opis</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="q in batchQuestions"
                  :key="q.ID"
                  class="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td class="p-2 font-semibold">{{ q.ID }}</td>
                  <td class="p-2">{{ q.Pytanie || q.question }}</td>
                  <td class="p-2">
                    <span
                      v-for="(odp, idx) in [
                        q.OdpA || q.answer_a,
                        q.OdpB || q.answer_b,
                        q.OdpC || q.answer_c,
                      ]"
                      :key="idx"
                    >
                      {{ odp }}<span v-if="idx < 2">, </span>
                    </span>
                  </td>
                  <td class="p-2">
                    <span
                      v-for="(isCorrect, idx) in [
                        q.PoprawnaA ?? q.isCorrectA,
                        q.PoprawnaB ?? q.isCorrectB,
                        q.PoprawnaC ?? q.isCorrectC,
                      ]"
                      :key="idx"
                    >
                      <span
                        :class="
                          isCorrect
                            ? 'text-green-600 dark:text-green-400 font-bold'
                            : 'text-gray-400'
                        "
                      >
                        {{ isCorrect ? 'Tak' : 'Nie' }}
                      </span>
                      <span v-if="idx < 2">, </span>
                    </span>
                  </td>
                  <td class="p-2">{{ q.Kategoria || q.category }}</td>
                  <td class="p-2">{{ q.Opis || q.description }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'users'">
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 space-y-6"
      >
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Zarejestrowani użytkownicy
        </h2>
        <table class="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <thead>
            <tr class="bg-blue-50 dark:bg-blue-900 text-left">
              <th class="px-4 py-2 font-medium text-gray-700 dark:text-gray-200">Login</th>
              <th class="px-4 py-2 font-medium text-gray-700 dark:text-gray-200">Avatar</th>
              <th class="px-4 py-2 font-medium text-gray-700 dark:text-gray-200">Kolor avatara</th>
              <th class="px-4 py-2 font-medium text-gray-700 dark:text-gray-200">Rola</th>
              <th class="px-4 py-2 font-medium text-gray-700 dark:text-gray-200">Akcje</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in users"
              :key="user._id"
              class="border-b border-gray-200 dark:border-gray-700"
            >
              <td class="px-4 py-2">{{ user.login }}</td>
              <td class="px-4 py-2">
                <Avatar :avatar-index="user.avatar" :color="user.avatarColors" :size="32" />
              </td>
              <td class="px-4 py-2">{{ user.avatarColors }}</td>
              <td class="px-4 py-2">
                <span
                  :class="{
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full':
                      user.rola === 'admin',
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 px-2 py-1 rounded-full':
                      user.rola !== 'admin',
                  }"
                >
                  {{ user.rola }}
                </span>
              </td>
              <td class="px-4 py-2">
                <select
                  v-model="user.rola"
                  @change="changeRole(user)"
                  class="rounded px-2 py-1 border bg-gray-50 dark:bg-gray-900 dark:text-gray-200"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-if="users.length === 0"
          class="text-gray-500 dark:text-gray-400 mt-6 text-center w-full"
        >
          Brak zarejestrowanych użytkowników.
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'categories'">
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 space-y-6"
      >
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Usuń wybraną kategorię
        </h2>
        <div class="flex gap-2 items-center w-full">
          <select
            v-model="selectedCategory"
            class="rounded px-2 py-1 border bg-gray-50 dark:bg-gray-900 dark:text-gray-200"
          >
            <option disabled value="">Wybierz kategorię</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
          <BaseButton
            color="red"
            size="md"
            :disabled="!selectedCategory"
            @click="confirmDeleteCategory"
          >
            Usuń
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Modale -->
    <BaseModal :show="showExcelInfo" @close="showExcelInfo = false">
      <template #header>Import pytań z pliku Excel</template>
      <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Przygotuj plik .xlsx z kolumnami w podanej kolejności. Pierwszy wiersz musi zawierać
        nagłówki (nazwy dowolne).
      </p>
      <div class="overflow-x-auto mb-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <table class="min-w-full text-xs">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr class="text-left">
              <th class="p-2 font-semibold text-gray-700 dark:text-gray-200">ID</th>
              <th class="p-2 font-semibold text-gray-700 dark:text-gray-200">Pytanie</th>
              <th class="p-2 font-semibold text-gray-700 dark:text-gray-200">Odp. A</th>
              <th class="p-2 font-semibold text-gray-700 dark:text-gray-200">Poprawna A</th>
              <th class="p-2 font-semibold text-gray-700 dark:text-gray-200">Odp. B</th>
              <th class="p-2 font-semibold text-gray-700 dark:text-gray-200">Poprawna B</th>
              <th class="p-2 font-semibold text-gray-700 dark:text-gray-200">Odp. C</th>
              <th class="p-2 font-semibold text-gray-700 dark:text-gray-200">Poprawna C</th>
              <th class="p-2 font-semibold text-gray-700 dark:text-gray-200">Kategoria</th>
              <th class="p-2 font-semibold text-gray-700 dark:text-gray-200">Opis</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr class="border-t border-gray-200 dark:border-gray-700">
              <td class="p-2 text-gray-700 dark:text-gray-300">123</td>
              <td class="p-2 text-gray-700 dark:text-gray-300">Treść...</td>
              <td class="p-2 text-gray-700 dark:text-gray-300">Odp...</td>
              <td class="p-2 text-gray-700 dark:text-gray-300">true</td>
              <td class="p-2 text-gray-700 dark:text-gray-300">Odp...</td>
              <td class="p-2 text-gray-700 dark:text-gray-300">false</td>
              <td class="p-2 text-gray-700 dark:text-gray-300">Odp...</td>
              <td class="p-2 text-gray-700 dark:text-gray-300">false</td>
              <td class="p-2 text-gray-700 dark:text-gray-300">Kategoria...</td>
              <td class="p-2 text-gray-700 dark:text-gray-300">Opis...</td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul class="mb-4 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300 space-y-1">
        <li>
          W kolumnach "Poprawna" wpisz <b>true</b> lub <b>false</b> (lub zostaw puste dla false).
        </li>
      </ul>
      <template #footer>
        <BaseButton color="gray" @click="showExcelInfo = false">Zrozumiałem</BaseButton>
      </template>
    </BaseModal>

    <BaseModal :show="showClearQuestionsModal" @close="showClearQuestionsModal = false">
      <template #icon>
        <div
          class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-700 sm:mx-0 sm:h-10 sm:w-10"
        >
          <svg
            class="h-6 w-6 text-red-600 dark:text-red-200"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
      </template>
      <template #header>Wyczyść bazę pytań</template>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Czy na pewno chcesz usunąć <b>wszystkie</b> pytania? Tej operacji nie można cofnąć.
      </p>
      <template #footer>
        <BaseButton color="red" @click="clearQuestions">Tak, usuń wszystko</BaseButton>
        <BaseButton color="gray" @click="showClearQuestionsModal = false">Anuluj</BaseButton>
      </template>
    </BaseModal>

    <BaseModal :show="showAddPopup" @close="closeAddPopup" class="!max-w-5xl">
      <template #header>Nowe pytanie</template>
      <form @submit.prevent="saveNewQuestion()">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6">
          <div class="lg:col-span-2 space-y-6">
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-200"
                for="question-text"
                >Treść pytania</label
              >
              <textarea
                v-model="formModel.question"
                id="question-text"
                rows="4"
                class="mt-1 p-2 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Wpisz treść pytania..."
                required
              ></textarea>
            </div>
            <div class="space-y-4">
              <div v-for="key in ['a', 'b', 'c']" :key="key">
                <label
                  :for="`answer-${key}`"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >Odpowiedź {{ key.toUpperCase() }}</label
                >
                <input
                  type="text"
                  :id="`answer-${key}`"
                  v-model="formModel[`answer_${key}`].answer"
                  class="mt-1 p-2 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  :placeholder="`Treść odpowiedzi ${key.toUpperCase()}`"
                  required
                />
              </div>
            </div>
          </div>

          <div
            class="bg-gray-50 rounded-lg p-6 space-y-6 border dark:bg-gray-800 dark:border-gray-700"
          >
            <div>
              <h3 class="text-sm font-medium text-gray-800 dark:text-gray-100">
                Poprawna odpowiedź
              </h3>
              <div class="grid grid-cols-3 gap-2 mt-2">
                <button
                  v-for="key in ['a', 'b', 'c']"
                  :key="`btn-${key}`"
                  type="button"
                  @click="setCorrectAnswer(key)"
                  :class="[
                    'p-2 rounded-md text-sm font-semibold border-2 transition-all',
                    formModel[`answer_${key}`].isCorret
                      ? 'bg-green-600 text-white border-green-600 shadow dark:bg-green-500 dark:border-green-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-900',
                  ]"
                >
                  {{ key.toUpperCase() }}
                </button>
              </div>
            </div>

            <div>
              <label
                for="category"
                class="block text-sm font-medium text-gray-800 dark:text-gray-100"
                >Kategoria</label
              >
              <select
                v-model="formModel.category"
                id="category"
                class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              >
                <option value="" disabled>Wybierz kategorię</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                <option value="__nowa__">[Dodaj nową kategorię]</option>
              </select>
              <div v-if="formModel.category === '__nowa__'" class="flex gap-2 mt-2">
                <input
                  v-model="newCategoryInput"
                  @keyup.enter.prevent="confirmNewCategory()"
                  class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Nowa kategoria"
                />
                <BaseButton size="sm" color="green" type="button" @click="confirmNewCategory()"
                  >OK</BaseButton
                >
              </div>
            </div>

            <div>
              <label
                for="description"
                class="block text-sm font-medium text-gray-800 dark:text-gray-100"
                >Opis (opcjonalnie)</label
              >
              <input
                type="text"
                v-model="formModel.description"
                id="description"
                class="mt-1 p-2 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Np. podstawa prawna"
              />
            </div>
          </div>
        </div>
      </form>
      <template #footer>
        <BaseButton color="gray" type="button" @click="closeAddPopup()">Anuluj</BaseButton>
        <BaseButton color="blue" type="submit" @click="saveNewQuestion()"
          >Zapisz pytanie</BaseButton
        >
      </template>
    </BaseModal>

    <BaseModal :show="showConfirmDelete" @close="showConfirmDelete = false">
      <template #header>Usuń pytania z kategorii</template>
      <div class="p-4">
        <p>
          Czy na pewno chcesz usunąć <b>wszystkie pytania</b> z kategorii
          <b>{{ selectedCategory }}</b
          >? Ta operacja jest nieodwracalna.
        </p>
        <div class="mt-4 flex gap-2 justify-end">
          <BaseButton color="gray" @click="showConfirmDelete = false">Anuluj</BaseButton>
          <BaseButton color="red" @click="deleteCategoryQuestions" :loading="deleting"
            >Usuń</BaseButton
          >
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, watch } from 'vue';
import { useStore } from 'vuex';
import apiClient from '@/api';
import Avatar from '@/components/Avatar.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseModal from '@/components/BaseModal.vue';

// Zakładki
const tabs = [
  { key: 'questions', label: 'Pytania' },
  { key: 'batch', label: 'Grupowa edycja' },
  { key: 'users', label: 'Użytkownicy' },
  { key: 'categories', label: 'Kategorie' },
];
const activeTab = ref('questions');

const store = useStore();
const showAlert = inject('showAlert');

const currentUser = computed(() => store.getters['user/getUser']);
const isAdmin = computed(() => currentUser.value?.rola === 'admin');

const users = ref([]);
const categories = ref([]);
const selectedCategory = ref('');
const showConfirmDelete = ref(false);
const deleting = ref(false);

const showAddPopup = ref(false);
const newCategoryInput = ref('');
const showExcelInfo = ref(false);
const showClearQuestionsModal = ref(false);
const formModel = ref({
  question: '',
  answer_a: { answer: '', isCorret: false },
  answer_b: { answer: '', isCorret: false },
  answer_c: { answer: '', isCorret: false },
  category: '',
  description: '',
});

const batchIdsInput = ref('');
const batchQuestions = ref([]);
const batchEditCategory = ref('');
const batchEditDescription = ref('');
const batchEditDescPart1 = ref('');
const batchEditDescPart2 = ref('');

onMounted(async () => {
  if (!isAdmin.value) {
    showAlert && showAlert('error', 'Brak uprawnień do panelu administratora.');
    return;
  }
  try {
    const res = await apiClient.get('/users/all');
    users.value = Array.isArray(res.data) ? res.data : [];
    if (users.value.length === 0) {
      showAlert && showAlert('info', 'Brak zarejestrowanych użytkowników.');
    }
  } catch (e) {
    users.value = [];
    showAlert && showAlert('error', 'Błąd podczas pobierania listy użytkowników.');
  }
  try {
    const res = await apiClient.get('/stats');
    categories.value = res.data.categories.map((cat) => cat.name);
    if (categories.value.length === 0) {
      showAlert && showAlert('info', 'Brak kategorii pytań.');
    }
  } catch (e) {
    categories.value = [];
    showAlert && showAlert('error', 'Błąd podczas pobierania kategorii.');
  }
});

// Funkcja do podziału opisu na dwa człony
function splitDescription(desc) {
  if (!desc) return ['', ''];
  const match = desc.match(/^(.*?)(\s*(art.*))$/i);
  if (match) {
    return [match[1].trim(), match[2].trim()];
  }
  return [desc, ''];
}

// Gdy pobieramy pytania, ustawiamy domyślne wartości do edycji
watch(batchQuestions, (val) => {
  if (val.length === 1) {
    const [part1, part2] = splitDescription(val[0].Opis || val[0].description || '');
    batchEditDescPart1.value = part1;
    batchEditDescPart2.value = part2;
  } else {
    batchEditDescPart1.value = '';
    batchEditDescPart2.value = '';
  }
});

async function changeRole(user) {
  try {
    await apiClient.put(`/users/${user._id}/role`, { rola: user.rola });
    showAlert && showAlert('success', `Zmieniono rolę użytkownika ${user.login}.`);
  } catch (e) {
    showAlert && showAlert('error', 'Błąd podczas zmiany roli użytkownika.');
  }
}

function confirmDeleteCategory() {
  showConfirmDelete.value = true;
}

async function deleteCategoryQuestions() {
  if (!selectedCategory.value) {
    showAlert && showAlert('warning', 'Wybierz kategorię!');
    return;
  }
  deleting.value = true;
  try {
    const res = await apiClient.delete(
      `/questions/category/${encodeURIComponent(selectedCategory.value)}`
    );
    showConfirmDelete.value = false;
    deleting.value = false;

    if (res.data && res.data.success) {
      if (res.data.deletedCount > 0) {
        showAlert(
          'success',
          `Usunięto ${res.data.deletedCount} pytań z kategorii "${selectedCategory.value}"`
        );
      } else {
        showAlert(
          'info',
          `Nie znaleziono pytań do usunięcia w kategorii "${selectedCategory.value}"`
        );
      }
      await store.dispatch('questions/fetchStats');
    } else {
      showAlert('error', 'Nie udało się usunąć pytań (brak odpowiedzi z serwera)');
    }
  } catch (e) {
    deleting.value = false;
    showConfirmDelete.value = false;
    let msg = 'Błąd usuwania pytań z kategorii';
    if (e.response) {
      msg += ` (${e.response.status}): ${e.response.data?.message || JSON.stringify(e.response.data)}`;
    } else {
      msg += `: ${e.message}`;
    }
    showAlert && showAlert('error', msg);
  }
}

function openAddPopup() {
  formModel.value = {
    question: '',
    answer_a: { answer: '', isCorret: false },
    answer_b: { answer: '', isCorret: false },
    answer_c: { answer: '', isCorret: false },
    category: '',
    description: '',
  };
  showAddPopup.value = true;
}

function closeAddPopup() {
  showAddPopup.value = false;
}

async function saveNewQuestion() {
  try {
    await apiClient.post('/questions', formModel.value);
    showAlert && showAlert('success', 'Pytanie zostało dodane pomyślnie!');
    closeAddPopup();
    await store.dispatch('questions/addQuestion', formModel.value);
  } catch (error) {
    showAlert && showAlert('error', 'Błąd podczas dodawania pytania.');
  }
}

function confirmNewCategory() {
  const newCat = newCategoryInput.value.trim();
  if (!newCat) {
    showAlert && showAlert('warning', 'Podaj nazwę nowej kategorii.');
    return;
  }
  if (!categories.value.includes(newCat)) {
    categories.value.push(newCat);
    showAlert && showAlert('success', `Dodano nową kategorię "${newCat}".`);
  } else {
    showAlert && showAlert('info', 'Taka kategoria już istnieje.');
  }
  formModel.value.category = newCat;
  newCategoryInput.value = '';
}

async function exportQuestionsExcel() {
  try {
    const response = await apiClient.get('/questions/export/excel', {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'pytania.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    showAlert && showAlert('success', 'Pytania zostały wyeksportowane do Excela.');
  } catch (e) {
    const errorMessage = e.response && e.response.data ? e.response.data.error : e.message;
    showAlert && showAlert('error', `Błąd eksportu do Excela: ${errorMessage}`);
  }
}

async function importQuestions(event) {
  const file = event.target.files[0];
  if (!file) {
    showAlert && showAlert('warning', 'Nie wybrano pliku do importu.');
    return;
  }
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await apiClient.post('/questions/import/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    showAlert && showAlert('success', `Dodano ${response.data.added} nowych pytań.`);
    await store.dispatch('questions/fetchStats');
  } catch (error) {
    const errorMessage =
      error.response && error.response.data ? error.response.data.error : error.message;
    showAlert && showAlert('error', `Wystąpił błąd podczas importu: ${errorMessage}`);
  } finally {
    event.target.value = ''; // Reset input file
  }
}

function setCorrectAnswer(correctKey) {
  formModel.value.answer_a.isCorret = false;
  formModel.value.answer_b.isCorret = false;
  formModel.value.answer_c.isCorret = false;
  formModel.value[`answer_${correctKey}`].isCorret = true;
}

async function clearQuestions() {
  showClearQuestionsModal.value = false;
  try {
    await apiClient.post('/questions/clear');
    showAlert && showAlert('success', 'Baza pytań została pomyślnie wyczyszczona!');
    await store.dispatch('questions/fetchStats');
  } catch (e) {
    showAlert && showAlert('error', 'Błąd podczas czyszczenia bazy pytań.');
  }
}

async function fetchBatchQuestions() {
  const ids = batchIdsInput.value
    .split(',')
    .map((id) => id.trim())
    .filter((id) => /^\d+$/.test(id));
  if (!ids.length) {
    showAlert && showAlert('warning', 'Podaj poprawne ID pytań (oddzielone przecinkami)');
    return;
  }
  try {
    // Pobierz pytania po ID (możesz dodać endpoint GET /questions?ids=1,2,3 po stronie backendu)
    const res = await apiClient.get(`/questions?ids=${ids.join(',')}`);
    batchQuestions.value = Array.isArray(res.data.questions) ? res.data.questions : [];
    if (batchQuestions.value.length === 0) {
      showAlert && showAlert('info', 'Nie znaleziono pytań o podanych ID.');
    }
  } catch (e) {
    showAlert && showAlert('error', 'Błąd podczas pobierania pytań.');
    batchQuestions.value = [];
  }
}

async function saveBatchEdit() {
  if (!batchQuestions.value.length) return;
  try {
    await Promise.all(
      batchQuestions.value.map((q) => {
        let newDescription = q.description || q.Opis || '';
        // Podziel aktualny opis na dwa człony
        const [oldPart1, oldPart2] = splitDescription(newDescription);

        if (batchEditDescPart1.value !== '' || batchEditDescPart2.value !== '') {
          // Jeśli użytkownik coś wpisał
          const part1 = batchEditDescPart1.value !== '' ? batchEditDescPart1.value : oldPart1;
          const part2 = batchEditDescPart2.value !== '' ? batchEditDescPart2.value : oldPart2;
          newDescription = [part1, part2].filter(Boolean).join(' ');
        } else if (batchEditDescription.value !== '') {
          // Jeśli użyto starego pola, nadpisz całość
          newDescription = batchEditDescription.value;
        }
        return apiClient.put(`/questions/${q.ID}`, {
          ...q,
          category: batchEditCategory.value || q.category,
          description: newDescription,
        });
      })
    );
    showAlert && showAlert('success', 'Zaktualizowano wybrane pytania.');
    batchQuestions.value = [];
    batchIdsInput.value = '';
    batchEditCategory.value = '';
    batchEditDescription.value = '';
    batchEditDescPart1.value = '';
    batchEditDescPart2.value = '';
    await store.dispatch('questions/fetchStats');
  } catch (e) {
    showAlert && showAlert('error', 'Błąd podczas grupowej edycji pytań.');
  }
}
</script>
