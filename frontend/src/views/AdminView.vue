<template>
  <div class="app-shell">
    <PageHeader
      eyebrow="Administracja"
      title="Panel administratora"
      subtitle="Zarządzaj pytaniami, kategoriami i użytkownikami. Skróty: N — nowe pytanie, ? — pomoc."
    />

    <div class="lg:flex lg:items-start lg:gap-6">
      <!-- Zakładki -->
      <div
        class="surface mb-5 flex gap-1 overflow-x-auto p-1 lg:mb-0 lg:w-56 lg:shrink-0 lg:flex-col lg:sticky lg:top-20 xl:top-6"
      >
        <BaseButton
          v-for="tab in tabs"
          :key="tab.key"
          :color="activeTab === tab.key ? 'blue' : 'gray'"
          :variant="activeTab === tab.key ? 'solid' : 'ghost'"
          size="sm"
          class="rounded-xl px-4 shrink-0 whitespace-nowrap lg:w-full lg:justify-start"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </BaseButton>
      </div>

      <div class="lg:flex-1 lg:min-w-0">

    <!-- Zawartość zakładek -->
    <div v-if="activeTab === 'questions'">
      <!-- Szybkie akcje -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          @click="openAddPopup"
          class="text-left w-full surface p-4 flex items-center gap-4 hover:shadow-md transition-shadow focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span class="bg-blue-500 p-3 rounded-full shrink-0">
            <img
              src="@/assets/icons/add.svg"
              alt=""
              class="w-6 h-6 text-gray-600 dark:text-gray-200"
            />
          </span>
          <span class="min-w-0">
            <span class="block font-semibold text-gray-800 dark:text-gray-100">Dodaj pytanie</span>
            <span class="block text-sm text-blue-600 dark:text-blue-400">Otwórz formularz</span>
          </span>
        </button>
        <div
          class="surface p-4 flex items-center gap-4"
        >
          <div class="bg-green-100 dark:bg-green-700 p-3 rounded-full">
            <img
              src="@/assets/icons/download.svg"
              alt="Eksport"
              class="w-6 h-6 text-green-600 dark:text-green-200"
            />
          </div>
          <div>
            <h3 class="font-semibold text-gray-700 dark:text-gray-100">Eksport</h3>
            <BaseButton
              color="green"
              size="sm"
              :loading="exportingExcel"
              class="mt-1"
              @click="exportQuestionsExcel"
            >
              {{ exportingExcel ? 'Eksportuję…' : 'Pobierz plik .xlsx' }}
            </BaseButton>
          </div>
        </div>
        <div
          class="surface p-4 flex items-center gap-4"
        >
          <div class="bg-blue-100 dark:bg-blue-700 p-3 rounded-full">
            <img
              src="@/assets/icons/upload.svg"
              alt="Import"
              class="w-6 h-6 text-blue-600 dark:text-blue-200"
            />
          </div>
          <div>
            <h3 class="font-semibold text-gray-700 dark:text-gray-100">Import</h3>
            <button
              type="button"
              class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-medium"
              @click="excelInput?.click()"
            >
              Wybierz plik .xlsx
            </button>
            <input
              ref="excelInput"
              type="file"
              accept=".xlsx"
              class="hidden"
              @change="importQuestions"
            />
            <BaseButton color="gray" size="sm" @click="showExcelInfo = true" class="block mt-1 p-1"
              >Jak przygotować plik?</BaseButton
            >
          </div>
        </div>
        <div
          class="surface p-4 flex items-center gap-4"
        >
          <div class="bg-red-100 dark:bg-red-700 p-3 rounded-full">
            <img
              src="@/assets/icons/trash.svg"
              alt="Usuń"
              class="w-6 h-6 text-red-600 dark:text-red-200"
            />
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
        class="surface p-6 space-y-6"
      >
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Grupowa edycja pytań po ID
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              for="batch-ids"
              class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >ID pytań (oddzielone przecinkami lub zakresami)</label
            >
            <input
              type="text"
              id="batch-ids"
              v-model="batchIdsInput"
              class="p-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="Np. 123, 456, 789 lub 123 - 125 albo 123-130, 131, 132-134"
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
              class="p-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                class="p-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="Część 1 opisu (np. dowolny tekst)"
              />
              <input
                type="text"
                v-model="batchEditDescPart2"
                style="width: 12rem"
                class="p-2 block rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder='Część "art..."'
              />
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Druga część powinna zaczynać się od "art" (np. art. 12 ust. 1 ...)
            </div>
          </div>
        </div>
        <div class="mt-4 flex flex-col md:flex-row gap-2">
          <BaseButton
            color="blue"
            @click="fetchBatchQuestions"
            class="w-full md:w-auto"
            :loading="isFetchingBatch"
          >
            Pobierz pytania
          </BaseButton>
          <BaseButton
            color="green"
            @click="saveBatchEdit"
            :disabled="!batchQuestions.length"
            class="w-full md:w-auto"
            :loading="isSavingBatch"
          >
            Zapisz zmiany
          </BaseButton>
        </div>

        <!-- Tabela z pytaniami do edycji grupowej -->
        <div
          v-if="batchQuestions.length"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 class="text-md font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Znalezione pytania ({{ batchQuestions.length }})
          </h3>
          <div class="overflow-x-auto">
            <table class="min-w-full text-xs bg-white dark:bg-gray-800 rounded-sm shadow-sm">
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

    <div v-else-if="activeTab === 'users'" class="space-y-6">
      <!-- Statystyki użytkowników -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
        >
          <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Użytkownicy
          </p>
          <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ userTotals.users }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ userTotals.admins }} z rolą admin
          </p>
        </div>
        <div
          class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
        >
          <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Odpowiedzi
          </p>
          <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ userTotals.answers }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">we wszystkich kontach</p>
        </div>
        <div
          class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
        >
          <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Skuteczność
          </p>
          <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ userTotals.accuracy }}%
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">poprawnych odpowiedzi</p>
        </div>
        <div
          class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
        >
          <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Pytania w bazie
          </p>
          <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ userTotals.questions }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">łącznie</p>
        </div>
      </div>

      <div
        class="surface p-6 space-y-4"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Zarejestrowani użytkownicy
          </h2>
          <BaseButton color="blue" size="sm" @click="openAddUserModal">
            Dodaj użytkownika
          </BaseButton>
        </div>

        <div class="md:hidden space-y-3">
          <div
            v-for="user in users"
            :key="`mobile-${user._id}`"
            class="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <div class="flex items-center gap-3">
              <Avatar :avatar-index="user.avatar" :color="user.avatarColors" :size="40" />
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-800 dark:text-gray-100 truncate">
                  {{ user.login }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ user.answersCount || 0 }} odp. · {{ userAccuracy(user) }}%
                </p>
              </div>
              <select
                v-model="user.rola"
                @change="changeRole(user)"
                class="h-10 rounded-lg px-2 border bg-gray-50 dark:bg-gray-900 dark:text-gray-200 text-sm"
                :aria-label="`Rola użytkownika ${user.login}`"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <div class="mt-2 flex items-center justify-between">
              <span class="text-xs text-gray-500 dark:text-gray-400">
                Ostatnia aktywność: {{ formatLastActivity(user.lastActivity) }}
              </span>
              <button
                type="button"
                class="text-xs font-medium text-red-600 dark:text-red-400 hover:underline disabled:opacity-40 disabled:no-underline"
                :disabled="String(user._id) === String(currentUserId)"
                @click="askDeleteUser(user)"
              >
                Usuń
              </button>
            </div>
          </div>
        </div>

        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full text-sm bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <thead>
              <tr class="bg-blue-50 dark:bg-blue-900 text-left">
                <th class="px-4 py-2 font-medium text-gray-700 dark:text-gray-200">Login</th>
                <th class="px-4 py-2 font-medium text-gray-700 dark:text-gray-200">Avatar</th>
                <th class="px-4 py-2 font-medium text-gray-700 dark:text-gray-200">Rola</th>
                <th class="px-4 py-2 font-medium text-gray-700 dark:text-gray-200">Odpowiedzi</th>
                <th class="px-4 py-2 font-medium text-gray-700 dark:text-gray-200">Skuteczność</th>
                <th class="px-4 py-2 font-medium text-gray-700 dark:text-gray-200">
                  Ostatnia aktywność
                </th>
                <th class="px-4 py-2 font-medium text-gray-700 dark:text-gray-200">Akcje</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in users"
                :key="user._id"
                class="border-b border-gray-200 dark:border-gray-700"
              >
                <td class="px-4 py-2 font-medium">{{ user.login }}</td>
                <td class="px-4 py-2">
                  <Avatar :avatar-index="user.avatar" :color="user.avatarColors" :size="32" />
                </td>
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
                <td class="px-4 py-2">{{ user.answersCount || 0 }}</td>
                <td class="px-4 py-2">{{ userAccuracy(user) }}%</td>
                <td class="px-4 py-2 text-gray-600 dark:text-gray-300">
                  {{ formatLastActivity(user.lastActivity) }}
                </td>
                <td class="px-4 py-2">
                  <div class="flex items-center gap-2">
                    <select
                      v-model="user.rola"
                      @change="changeRole(user)"
                      class="rounded-md px-2 py-1 border bg-gray-50 dark:bg-gray-900 dark:text-gray-200"
                      :aria-label="`Rola użytkownika ${user.login}`"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                    <button
                      type="button"
                      class="text-xs font-medium text-red-600 dark:text-red-400 hover:underline disabled:opacity-40 disabled:no-underline"
                      :disabled="String(user._id) === String(currentUserId)"
                      :aria-label="`Usuń użytkownika ${user.login}`"
                      @click="askDeleteUser(user)"
                    >
                      Usuń
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          v-if="users.length === 0"
          class="text-gray-500 dark:text-gray-400 mt-6 text-center w-full"
        >
          Brak zarejestrowanych użytkowników.
        </div>
      </div>

      <!-- Dodawanie użytkownika -->
      <BaseModal :show="showAddUserModal" @close="closeAddUserModal">
        <template #header>Dodaj użytkownika</template>
        <div
          v-if="userFormErrors.general"
          role="alert"
          class="mb-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-3 py-2 text-sm text-red-700 dark:text-red-200"
        >
          {{ userFormErrors.general }}
        </div>
        <div class="space-y-4">
          <div>
            <label for="new-user-login" class="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >Login</label
            >
            <input
              id="new-user-login"
              v-model="newUser.login"
              type="text"
              autocomplete="off"
              class="mt-1 p-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              :class="
                userFormErrors.login ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              "
              :aria-invalid="Boolean(userFormErrors.login)"
              @input="clearUserError('login')"
            />
            <p v-if="userFormErrors.login" class="mt-1 text-xs font-medium text-red-600">
              {{ userFormErrors.login }}
            </p>
          </div>
          <div>
            <label for="new-user-password" class="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >Hasło</label
            >
            <input
              id="new-user-password"
              v-model="newUser.password"
              type="password"
              autocomplete="new-password"
              class="mt-1 p-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              :class="
                userFormErrors.password
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : ''
              "
              :aria-invalid="Boolean(userFormErrors.password)"
              @input="clearUserError('password')"
            />
            <p v-if="userFormErrors.password" class="mt-1 text-xs font-medium text-red-600">
              {{ userFormErrors.password }}
            </p>
            <p v-else class="mt-1 text-xs text-gray-500 dark:text-gray-400">Minimum 8 znaków.</p>
          </div>
          <div>
            <label for="new-user-role" class="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >Rola</label
            >
            <select
              id="new-user-role"
              v-model="newUser.rola"
              class="mt-1 p-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            <p v-if="userFormErrors.rola" class="mt-1 text-xs font-medium text-red-600">
              {{ userFormErrors.rola }}
            </p>
          </div>
        </div>
        <template #footer>
          <BaseButton color="gray" @click="closeAddUserModal">Anuluj</BaseButton>
          <BaseButton color="blue" :loading="userSaving" @click="createUser">Dodaj</BaseButton>
        </template>
      </BaseModal>

      <!-- Usuwanie użytkownika -->
      <BaseModal :show="showDeleteUserModal" @close="showDeleteUserModal = false">
        <template #header>Usuń użytkownika</template>
        <p class="text-sm text-gray-700 dark:text-gray-200">
          Czy na pewno usunąć konto <b>{{ userToDelete?.login }}</b>? Usunięta zostanie też jego
          historia i statystyki. Tej operacji nie można cofnąć.
        </p>
        <template #footer>
          <BaseButton color="gray" @click="showDeleteUserModal = false">Anuluj</BaseButton>
          <BaseButton color="red" :loading="userDeleting" @click="confirmDeleteUser">
            Usuń konto
          </BaseButton>
        </template>
      </BaseModal>
    </div>

    <div v-else-if="activeTab === 'categories'">
      <div
        class="surface p-6 space-y-6"
      >
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Usuń wybraną kategorię
        </h2>
        <div class="flex flex-col sm:flex-row gap-2 sm:items-center w-full">
          <select
            v-model="selectedCategory"
            class="w-full sm:flex-1 min-w-0 rounded-lg px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-gray-200"
            aria-label="Kategoria do usunięcia"
          >
            <option disabled value="">Wybierz kategorię</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
          <BaseButton
            color="red"
            size="md"
            class="shrink-0 sm:w-auto w-full"
            :disabled="!selectedCategory"
            @click="confirmDeleteCategory"
          >
            Usuń
          </BaseButton>
        </div>
      </div>
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
          class="mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-700 sm:mx-0 sm:h-10 sm:w-10"
        >
          <img
            src="@/assets/icons/warning.svg"
            alt="Ostrzeżenie"
            class="h-6 w-6 text-red-600 dark:text-red-200"
          />
        </div>
      </template>
      <template #header>Wyczyść bazę pytań</template>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Czy na pewno chcesz usunąć <b>wszystkie</b> pytania? Tej operacji nie można cofnąć.
      </p>
      <div class="mt-4">
        <label
          for="clear-confirm"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Wpisz <b>{{ clearConfirmPhrase }}</b>, aby potwierdzić
        </label>
        <input
          id="clear-confirm"
          v-model="clearConfirmText"
          type="text"
          autocomplete="off"
          autocapitalize="characters"
          spellcheck="false"
          class="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-red-400"
          :placeholder="clearConfirmPhrase"
        />
      </div>
      <template #footer>
        <BaseButton color="red" :disabled="!clearConfirmValid" @click="clearQuestions"
          >Tak, usuń wszystko</BaseButton
        >
        <BaseButton color="gray" @click="showClearQuestionsModal = false">Anuluj</BaseButton>
      </template>
    </BaseModal>

    <BaseModal :show="showAddPopup" @close="closeAddPopup">
      <template #header>Nowe pytanie</template>
      <div
        v-if="formErrors.general"
        role="alert"
        class="mb-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-3 py-2 text-sm text-red-700 dark:text-red-200"
      >
        {{ formErrors.general }}
      </div>
      <form @submit.prevent>
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
                class="mt-1 p-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                :class="
                  formErrors.question
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : ''
                "
                :aria-invalid="Boolean(formErrors.question)"
                aria-describedby="question-error"
                @input="clearFormError('question')"
                placeholder="Wpisz treść pytania..."
                required
              ></textarea>
              <p
                v-if="formErrors.question"
                id="question-error"
                class="mt-1 text-xs font-medium text-red-600 dark:text-red-400"
              >
                {{ formErrors.question }}
              </p>
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
                  class="mt-1 p-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  :class="
                    formErrors[`answer_${key}`]
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : ''
                  "
                  :aria-invalid="Boolean(formErrors[`answer_${key}`])"
                  :aria-describedby="`answer-${key}-error`"
                  @input="clearFormError(`answer_${key}`)"
                  :placeholder="`Treść odpowiedzi ${key.toUpperCase()}`"
                  required
                />
                <p
                  v-if="formErrors[`answer_${key}`]"
                  :id="`answer-${key}-error`"
                  class="mt-1 text-xs font-medium text-red-600 dark:text-red-400"
                >
                  {{ formErrors[`answer_${key}`] }}
                </p>
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
                  :id="`correct-${key}`"
                  :aria-invalid="Boolean(formErrors.correct)"
                  @click="
                    setCorrectAnswer(key);
                    clearFormError('correct');
                  "
                  :class="[
                    'p-2 rounded-md text-sm font-semibold border-2 transition-all',
                    formModel[`answer_${key}`].isCorret
                      ? 'bg-green-600 text-white border-green-600 shadow-sm dark:bg-green-500 dark:border-green-500'
                      : formErrors.correct
                        ? 'bg-white text-gray-700 border-red-400 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-red-500 dark:hover:bg-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-900',
                  ]"
                >
                  {{ key.toUpperCase() }}
                </button>
              </div>
              <p
                v-if="formErrors.correct"
                class="mt-2 text-xs font-medium text-red-600 dark:text-red-400"
              >
                {{ formErrors.correct }}
              </p>
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
                class="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                :class="
                  formErrors.category
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : ''
                "
                :aria-invalid="Boolean(formErrors.category)"
                aria-describedby="category-error"
                @change="clearFormError('category')"
                required
              >
                <option value="" disabled>Wybierz kategorię</option>
                <option v-for="cat in categoriesFromStats" :key="cat" :value="cat">
                  {{ cat }}
                </option>
                <option value="__nowa__">[Dodaj nową kategorię]</option>
              </select>
              <div v-if="formModel.category === '__nowa__'" class="flex gap-2 mt-2">
                <input
                  v-model="newCategoryInput"
                  @keyup.enter.prevent="confirmNewCategory()"
                  class="block w-full rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  :class="
                    formErrors.category
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : ''
                  "
                  placeholder="Nowa kategoria"
                  @input="clearFormError('category')"
                />
                <BaseButton size="sm" color="green" type="button" @click="confirmNewCategory()"
                  >OK</BaseButton
                >
              </div>
              <p
                v-if="formErrors.category"
                id="category-error"
                class="mt-1 text-xs font-medium text-red-600 dark:text-red-400"
              >
                {{ formErrors.category }}
              </p>
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
                class="mt-1 p-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                :class="
                  formErrors.description
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : ''
                "
                :aria-invalid="Boolean(formErrors.description)"
                @input="clearFormError('description')"
                placeholder="Np. podstawa prawna"
              />
              <p
                v-if="formErrors.description"
                class="mt-1 text-xs font-medium text-red-600 dark:text-red-400"
              >
                {{ formErrors.description }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 mt-6"
        >
          <h3 class="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">
            Flagi i oznaczenia pytania
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- Flagged -->
            <div
              class="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-600 shadow-xs"
              :class="{ 'ring-2 ring-green-300 dark:ring-green-500': formModel.flagged }"
            >
              <label class="flex items-center justify-between gap-2 cursor-pointer">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Ważne/Sprawdzone</span
                >
                <div class="relative">
                  <input
                    type="checkbox"
                    v-model="formModel.flagged"
                    class="sr-only peer"
                    @change="flagChangedAdd('flagged')"
                  />
                  <div
                    :class="{ 'bg-green-300 dark:bg-green-500': formModel.flagged }"
                    class="w-10 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"
                  ></div>
                </div>
              </label>
            </div>
            <!-- Bad -->
            <div
              class="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-600 shadow-xs"
              :class="{ 'ring-2 ring-red-300 dark:ring-red-500': formModel.bad }"
            >
              <label class="flex items-center justify-between gap-2 cursor-pointer">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Złe pytanie</span
                >
                <div class="relative">
                  <input
                    type="checkbox"
                    v-model="formModel.bad"
                    class="sr-only peer"
                    @change="flagChangedAdd('bad')"
                  />
                  <div
                    :class="{ 'bg-red-300 dark:bg-red-500': formModel.bad }"
                    class="w-10 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-red-500"
                  ></div>
                </div>
              </label>
            </div>
            <!-- Unknown -->
            <div
              class="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-600 shadow-xs"
              :class="{ 'ring-2 ring-yellow-300 dark:ring-yellow-500': formModel.unknown }"
            >
              <label class="flex items-center justify-between gap-2 cursor-pointer">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Nie wiem</span>
                <div class="relative">
                  <input
                    type="checkbox"
                    v-model="formModel.unknown"
                    class="sr-only peer"
                    @change="flagChangedAdd('unknown')"
                  />
                  <div
                    :class="{ 'bg-yellow-300 dark:bg-yellow-500': formModel.unknown }"
                    class="w-10 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-500"
                  ></div>
                </div>
              </label>
            </div>
          </div>
          <!-- Notatka -->
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Notatka do pytania</label
            >
            <input
              type="text"
              v-model="formModel.note"
              id="note"
              class="mt-1 p-2 block w-full rounded-lg border border-gray-200 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
              :class="
                formErrors.note
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : ''
              "
              :aria-invalid="Boolean(formErrors.note)"
              @input="clearFormError('note')"
              placeholder="Dodaj notatkę..."
            />
            <p
              v-if="formErrors.note"
              class="mt-1 text-xs font-medium text-red-600 dark:text-red-400"
            >
              {{ formErrors.note }}
            </p>
          </div>
        </div>
      </form>
      <template #footer>
        <BaseButton color="gray" type="button" @click="closeAddPopup()">Anuluj</BaseButton>
        <BaseButton color="blue" type="button" :loading="isSaving" @click="saveNewQuestion">
          Zapisz pytanie
        </BaseButton>
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

    <BaseModal :show="showShortcuts" @close="showShortcuts = false">
      <template #header>Skróty klawiszowe</template>
      <div class="p-4">
        <dl class="space-y-3 text-sm">
          <div class="flex items-start gap-3">
            <dt class="shrink-0">
              <kbd class="px-2 py-1 rounded-sm border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-mono text-xs">N</kbd>
            </dt>
            <dd class="text-gray-700 dark:text-gray-300">Nowe pytanie</dd>
          </div>
          <div class="flex items-start gap-3">
            <dt class="shrink-0">
              <kbd class="px-2 py-1 rounded-sm border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-mono text-xs">?</kbd>
            </dt>
            <dd class="text-gray-700 dark:text-gray-300">Ta pomoc</dd>
          </div>
          <div class="flex items-start gap-3">
            <dt class="shrink-0">
              <kbd class="px-2 py-1 rounded-sm border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-mono text-xs">Esc</kbd>
            </dt>
            <dd class="text-gray-700 dark:text-gray-300">Zamknij okno</dd>
          </div>
          <div class="flex items-start gap-3">
            <dt class="shrink-0">
              <kbd class="px-2 py-1 rounded-sm border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-mono text-xs">/</kbd>
            </dt>
            <dd class="text-gray-700 dark:text-gray-300">
              Wyszukiwarka pytań (na liście pytań)
            </dd>
          </div>
        </dl>
        <div class="mt-5 flex justify-end">
          <BaseButton color="gray" @click="showShortcuts = false">Zamknij</BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, inject, watch } from 'vue';
import { useStore } from 'vuex';
import apiClient from '@/api';
import { queueQuestionCreate } from '@/services/offlineSync';
import Avatar from '@/components/base/Avatar.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseModal from '@/components/base/BaseModal.vue';
import PageHeader from '@/components/layout/PageHeader.vue';

// Zakładki
const tabs = [
  { key: 'questions', label: 'Pytania' },
  { key: 'batch', label: 'Grupowa edycja' },
  { key: 'users', label: 'Użytkownicy' },
  { key: 'categories', label: 'Kategorie' },
];
const activeTab = ref('questions');

const store = useStore();
const categoriesFromStats = computed(() => store.getters['questions/getCategories'] || []);
const showAlert = inject('showAlert');

const currentUser = computed(() => store.getters['user/getUser']);
const isAdmin = computed(() => currentUser.value?.rola === 'admin');

const users = ref([]);
const userTotals = ref({ users: 0, admins: 0, answers: 0, accuracy: 0, quizzes: 0, questions: 0 });
const showAddUserModal = ref(false);
const newUser = ref({ login: '', password: '', rola: 'user' });
const userFormErrors = ref({});
const userSaving = ref(false);
const showDeleteUserModal = ref(false);
const userToDelete = ref(null);
const userDeleting = ref(false);
const currentUserId = computed(() => currentUser.value?._id || currentUser.value?.id);
const excelInput = ref(null);
const categories = ref([]);
const selectedCategory = ref('');
const showConfirmDelete = ref(false);
const deleting = ref(false);
const isFetchingBatch = ref(false);
const isSavingBatch = ref(false);
const showAddPopup = ref(false);
const showShortcuts = ref(false);
const newCategoryInput = ref('');
const showExcelInfo = ref(false);
const showClearQuestionsModal = ref(false);
const clearConfirmText = ref('');
const clearConfirmPhrase = 'USUŃ';

function normalizePhrase(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const clearConfirmValid = computed(
  () => normalizePhrase(clearConfirmText.value) === normalizePhrase(clearConfirmPhrase)
);

watch(showClearQuestionsModal, (visible) => {
  clearConfirmText.value = '';
  if (visible) {
    setTimeout(() => document.getElementById('clear-confirm')?.focus(), 50);
  }
});
const formModel = ref({
  question: '',
  answer_a: { answer: '', isCorret: false },
  answer_b: { answer: '', isCorret: false },
  answer_c: { answer: '', isCorret: false },
  category: '',
  description: '',
  flagged: false,
  bad: false,
  unknown: false,
  note: '',
});

const formErrors = ref({});

const batchIdsInput = ref('');
const batchQuestions = ref([]);
const batchEditCategory = ref('');
const batchEditDescPart1 = ref('');
const batchEditDescPart2 = ref('');
const isSaving = ref(false);

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

// Inicjalizacja komponentu
onMounted(async () => {
  window.addEventListener('keydown', handleAdminKeydown);

  if (!isAdmin.value) {
    showAlert?.('error', 'Brak uprawnień do panelu administratora.');
    return;
  }

  await loadUsers();
  if (users.value.length === 0) {
    showAlert?.('info', 'Brak zarejestrowanych użytkowników.');
  }

  try {
    const res = await apiClient.get('/stats');
    categories.value = res.data.categories.map((cat) => cat.name);
    if (categories.value.length === 0) {
      showAlert?.('info', 'Brak kategorii pytań.');
    }
  } catch (e) {
    categories.value = [];
    showAlert?.('error', 'Błąd podczas pobierania kategorii.');
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleAdminKeydown);
});

// Zmiana roli użytkownika
async function loadUsers() {
  try {
    const res = await apiClient.get('/users/stats');
    users.value = Array.isArray(res.data?.users) ? res.data.users : [];
    userTotals.value =
      res.data?.totals || { users: 0, admins: 0, answers: 0, accuracy: 0, quizzes: 0, questions: 0 };
  } catch (e) {
    users.value = [];
    showAlert?.('error', 'Błąd podczas pobierania listy użytkowników.');
  }
}

function openAddUserModal() {
  newUser.value = { login: '', password: '', rola: 'user' };
  userFormErrors.value = {};
  showAddUserModal.value = true;
  setTimeout(() => document.getElementById('new-user-login')?.focus(), 50);
}

function closeAddUserModal() {
  showAddUserModal.value = false;
  userFormErrors.value = {};
}

function clearUserError(field) {
  if (!userFormErrors.value[field]) return;
  const next = { ...userFormErrors.value };
  delete next[field];
  userFormErrors.value = next;
}

function validateNewUser() {
  const errors = {};
  const login = newUser.value.login.trim();
  if (login.length < 3 || login.length > 32) {
    errors.login = 'Login musi mieć 3–32 znaków.';
  } else if (!/^[a-zA-Z0-9._-]+$/.test(login)) {
    errors.login = 'Dozwolone są litery, cyfry, kropka, podkreślenie i myślnik.';
  }
  if (newUser.value.password.length < 8) {
    errors.password = 'Hasło musi mieć co najmniej 8 znaków.';
  } else if (newUser.value.password.length > 72) {
    errors.password = 'Hasło może mieć maksymalnie 72 znaki.';
  }
  if (!['user', 'admin'].includes(newUser.value.rola)) {
    errors.rola = 'Wybierz poprawną rolę.';
  }

  userFormErrors.value = errors;

  const firstInvalid = [
    ['login', 'new-user-login'],
    ['password', 'new-user-password'],
    ['rola', 'new-user-role'],
  ].find(([field]) => errors[field]);
  if (firstInvalid) {
    setTimeout(() => document.getElementById(firstInvalid[1])?.focus(), 0);
  }

  return Object.keys(errors).length === 0;
}

async function createUser() {
  if (userSaving.value) return;
  userFormErrors.value = {};
  if (!validateNewUser()) return;

  userSaving.value = true;
  try {
    await apiClient.post('/users', {
      login: newUser.value.login.trim(),
      password: newUser.value.password,
      rola: newUser.value.rola,
    });
    showAlert?.('success', `Dodano użytkownika ${newUser.value.login.trim()}.`);
    closeAddUserModal();
    await loadUsers();
  } catch (error) {
    const message = error?.response?.data?.message || 'Błąd podczas dodawania użytkownika.';
    userFormErrors.value = { general: message };
    showAlert?.('error', message);
  } finally {
    userSaving.value = false;
  }
}

function askDeleteUser(user) {
  userToDelete.value = user;
  showDeleteUserModal.value = true;
}

async function confirmDeleteUser() {
  if (!userToDelete.value || userDeleting.value) return;
  userDeleting.value = true;
  try {
    await apiClient.delete(`/users/${userToDelete.value._id}`);
    showAlert?.('success', `Usunięto użytkownika ${userToDelete.value.login}.`);
    showDeleteUserModal.value = false;
    userToDelete.value = null;
    await loadUsers();
  } catch (error) {
    const message = error?.response?.data?.message || 'Błąd podczas usuwania użytkownika.';
    showAlert?.('error', message);
  } finally {
    userDeleting.value = false;
  }
}

function userAccuracy(user) {
  const total = user?.answersCount || 0;
  if (!total) return 0;
  return Math.round(((user.correctAnswers || 0) / total) * 100);
}

function formatLastActivity(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

async function changeRole(user) {
  try {
    await apiClient.put(`/users/${user._id}/role`, { rola: user.rola });
    showAlert?.('success', `Zmieniono rolę użytkownika ${user.login}.`);
    await loadUsers();
  } catch (e) {
    showAlert?.('error', e?.response?.data?.message || 'Błąd podczas zmiany roli użytkownika.');
  }
}

// Potwierdzenie usunięcia kategorii
function confirmDeleteCategory() {
  showConfirmDelete.value = true;
}

// Usuwanie pytań z kategorii
async function deleteCategoryQuestions() {
  if (!selectedCategory.value) {
    showAlert?.('warning', 'Wybierz kategorię!');
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
        showAlert?.(
          'success',
          `Usunięto ${res.data.deletedCount} pytań z kategorii "${selectedCategory.value}"`
        );
      } else {
        showAlert?.(
          'info',
          `Nie znaleziono pytań do usunięcia w kategorii "${selectedCategory.value}"`
        );
      }
      await store.dispatch('questions/fetchStats');
    } else {
      showAlert?.('error', 'Nie udało się usunąć pytań (brak odpowiedzi z serwera)');
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
    showAlert?.('error', msg);
  }
}

// Otwieranie popupu dodawania pytania
function openAddPopup() {
  formModel.value = {
    question: '',
    answer_a: { answer: '', isCorret: false },
    answer_b: { answer: '', isCorret: false },
    answer_c: { answer: '', isCorret: false },
    category: '',
    description: '',
    flagged: false,
    bad: false,
    unknown: false,
    note: '',
  };
  formErrors.value = {};
  newCategoryInput.value = '';
  showAddPopup.value = true;

  // Po otwarciu ustaw fokus na treści pytania.
  setTimeout(() => {
    const field = document.getElementById('question-text');
    if (field) field.focus();
  }, 50);
}

// Zamykanie popupu dodawania pytania
function closeAddPopup() {
  showAddPopup.value = false;
  formErrors.value = {};
}

function clearFormError(field) {
  if (!formErrors.value[field]) return;
  const next = { ...formErrors.value };
  delete next[field];
  formErrors.value = next;
}

/**
 * Walidacja formularza nowego pytania. Zwraca `true`, gdy można wysłać.
 * Ustawia konkretne komunikaty przy polach i przenosi fokus na pierwszy błąd.
 */
function validateNewQuestion() {
  const errors = {};
  const value = formModel.value;

  if (!value.question.trim()) errors.question = 'Podaj treść pytania.';
  else if (value.question.length > 5000) errors.question = 'Maksymalnie 5000 znaków.';

  for (const key of ['a', 'b', 'c']) {
    const field = `answer_${key}`;
    const answer = value[field].answer.trim();
    if (!answer) errors[field] = `Podaj treść odpowiedzi ${key.toUpperCase()}.`;
    else if (answer.length > 2000) errors[field] = 'Maksymalnie 2000 znaków.';
  }

  const correctCount = ['a', 'b', 'c'].filter((key) => value[`answer_${key}`].isCorret).length;
  if (correctCount !== 1) {
    errors.correct = 'Wskaż dokładnie jedną poprawną odpowiedź.';
  }

  if (!value.category) {
    errors.category = 'Wybierz kategorię.';
  } else if (value.category === '__nowa__') {
    if (!newCategoryInput.value.trim()) {
      errors.category = 'Podaj nazwę nowej kategorii.';
    }
  } else if (value.category.length > 200) {
    errors.category = 'Maksymalnie 200 znaków.';
  }

  if (value.description.length > 2000) errors.description = 'Maksymalnie 2000 znaków.';
  if (value.note.length > 1000) errors.note = 'Maksymalnie 1000 znaków.';

  formErrors.value = errors;

  const firstInvalid = [
    ['question', 'question-text'],
    ['answer_a', 'answer-a'],
    ['answer_b', 'answer-b'],
    ['answer_c', 'answer-c'],
    ['correct', 'correct-a'],
    ['category', 'category'],
    ['description', 'description'],
    ['note', 'note'],
  ].find(([field]) => errors[field]);

  if (firstInvalid) {
    setTimeout(() => {
      const element = document.getElementById(firstInvalid[1]);
      if (element) element.focus();
    }, 0);
  }

  return Object.keys(errors).length === 0;
}

// Skróty klawiszowe panelu administracyjnego.
function isTypingTarget(target) {
  if (!target) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable === true
  );
}

function handleAdminKeydown(event) {
  if (!isAdmin.value) return;
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (isTypingTarget(event.target)) return;

  if (event.key === '?') {
    if (showAddPopup.value || showConfirmDelete.value) return;
    event.preventDefault();
    showShortcuts.value = !showShortcuts.value;
    return;
  }

  if (event.key === 'n' || event.key === 'N') {
    if (showAddPopup.value || showConfirmDelete.value || showShortcuts.value) return;
    event.preventDefault();
    activeTab.value = 'questions';
    openAddPopup();
  }
}

// Zapisywanie nowego pytania
async function saveNewQuestion() {
  if (isSaving.value) return;
  formErrors.value = {};

  if (!validateNewQuestion()) return;

  isSaving.value = true;
  try {
    // Obsługa nowej kategorii
    if (formModel.value.category === '__nowa__' && newCategoryInput.value.trim()) {
      formModel.value.category = newCategoryInput.value.trim();
      if (!categories.value.includes(formModel.value.category)) {
        categories.value.push(formModel.value.category);
      }
      newCategoryInput.value = '';
    }

    if (navigator.onLine === false) {
      // Bez sieci nie czekamy na timeout — od razu kolejkujemy.
      queueQuestionCreate(formModel.value);
      closeAddPopup();
      showAlert?.('info', 'Brak sieci — pytanie zapisane lokalnie i wysłane później.');
      return;
    }

    try {
      await apiClient.post('/questions', formModel.value);
      showAlert?.('success', 'Pytanie zostało dodane pomyślnie!');
      closeAddPopup();
      // Samo POST odświeżyło statystyki po stronie serwera; lokalnie tylko je dociągamy.
      await store.dispatch('questions/fetchStats');
    } catch (error) {
      if (!error?.response) {
        // Offline: przyjmij formularz i wyślij pytanie po powrocie sieci.
        queueQuestionCreate(formModel.value);
        closeAddPopup();
        showAlert?.('info', 'Brak sieci — pytanie zapisane lokalnie i wysłane później.');
        return;
      }
      const message =
        error?.response?.data?.message || 'Błąd podczas dodawania pytania. Spróbuj ponownie.';
      formErrors.value = { general: message };
      showAlert?.('error', message);
    }
  } finally {
    isSaving.value = false;
  }
}

// Potwierdzanie nowej kategorii
function confirmNewCategory() {
  const newCat = newCategoryInput.value.trim();
  if (!newCat) {
    showAlert?.('warning', 'Podaj nazwę nowej kategorii.');
    return;
  }
  if (!categories.value.includes(newCat)) {
    categories.value.push(newCat);
    showAlert?.('success', `Dodano nową kategorię "${newCat}".`);
  } else {
    showAlert?.('info', 'Taka kategoria już istnieje.');
  }
  formModel.value.category = newCat;
  newCategoryInput.value = '';
}

// Eksport pytań do Excela
const exportingExcel = ref(false);

async function exportQuestionsExcel() {
  if (exportingExcel.value) return;
  exportingExcel.value = true;
  try {
    const response = await apiClient.silentGet('/questions/export/excel', {
      responseType: 'blob',
      noCache: true,
      // Duży eksport na wolnym hostingu potrafi trwać ~20 s.
      timeout: 120000,
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'pytania.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    showAlert?.('success', 'Pytania zostały wyeksportowane do Excela.');
  } catch (e) {
    const errorMessage = e.response && e.response.data ? e.response.data.error : e.message;
    showAlert?.('error', `Błąd eksportu do Excela: ${errorMessage}`);
  } finally {
    exportingExcel.value = false;
  }
}

// Import pytań z Excela
async function importQuestions(event) {
  const file = event.target.files[0];
  if (!file) {
    showAlert?.('warning', 'Nie wybrano pliku do importu.');
    return;
  }
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await apiClient.post('/questions/import/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      skipErrorPage: true,
    });

    const data = response.data || {};
    const seconds = data.durationMs ? ` w ${Math.round(data.durationMs / 1000)} s` : '';
    const skipped = data.skipped ? `, pominięto ${data.skipped}` : '';
    showAlert?.('success', `Dodano ${data.added ?? 0} nowych pytań${skipped}${seconds}.`);
    await store.dispatch('questions/fetchStats');
  } catch (error) {
    const errorMessage =
      error.response && error.response.data ? error.response.data.error : error.message;
    showAlert?.('error', `Wystąpił błąd podczas importu: ${errorMessage}`);
  } finally {
    event.target.value = ''; // Reset input file
  }
}

// Ustawianie poprawnej odpowiedzi
function setCorrectAnswer(correctKey) {
  formModel.value.answer_a.isCorret = false;
  formModel.value.answer_b.isCorret = false;
  formModel.value.answer_c.isCorret = false;
  formModel.value[`answer_${correctKey}`].isCorret = true;
}

// Czyszczenie bazy pytań
async function clearQuestions() {
  showClearQuestionsModal.value = false;
  try {
    await apiClient.post('/questions/clear');
    showAlert?.('success', 'Baza pytań została pomyślnie wyczyszczona!');
    await store.dispatch('questions/fetchStats');
  } catch (e) {
    showAlert?.('error', 'Błąd podczas czyszczenia bazy pytań.');
  }
}

// Pobieranie pytań do edycji grupowej
async function fetchBatchQuestions() {
  isFetchingBatch.value = true;
  try {
    // Rozdziel po przecinku, obsłuż pojedyncze ID i zakresy
    const ids = batchIdsInput.value
      .split(',')
      .map((part) => part.trim())
      .flatMap((part) => {
        if (/^\d+$/.test(part)) {
          // pojedyncze ID
          return [part];
        }
        // zakres np. 123-130
        const match = part.match(/^(\d+)\s*-\s*(\d+)$/);
        if (match) {
          const from = parseInt(match[1], 10);
          const to = parseInt(match[2], 10);
          if (from <= to) {
            // generuj tablicę ID z zakresu
            return Array.from({ length: to - from + 1 }, (_, i) => String(from + i));
          }
        }
        return [];
      })
      .filter((id) => /^\d+$/.test(id));

    if (!ids.length) {
      showAlert?.(
        'warning',
        'Podaj poprawne ID pytań (oddzielone przecinkami lub zakresy np. 123-130)'
      );
      return;
    }
    try {
      const res = await apiClient.get(`/questions?ids=${ids.join(',')}`);
      batchQuestions.value = Array.isArray(res.data.questions) ? res.data.questions : [];
      if (batchQuestions.value.length === 0) {
        showAlert?.('info', 'Nie znaleziono pytań o podanych ID.');
      }
    } catch (e) {
      showAlert?.('error', 'Błąd podczas pobierania pytań.');
      batchQuestions.value = [];
    }
  } finally {
    isFetchingBatch.value = false;
  }
}

// Zapisywanie zmian w pytaniach
async function saveBatchEdit() {
  if (!batchQuestions.value.length) return;
  isSavingBatch.value = true;
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
        }

        return apiClient.put(`/questions/${q.ID}`, {
          ...q,
          category: batchEditCategory.value || q.category,
          description: newDescription,
        });
      })
    );
    showAlert?.('success', 'Zaktualizowano wybrane pytania.');
    batchQuestions.value = [];
    batchIdsInput.value = '';
    batchEditCategory.value = '';
    batchEditDescPart1.value = '';
    batchEditDescPart2.value = '';
    await store.dispatch('questions/fetchStats');
  } catch (e) {
    showAlert?.('error', 'Błąd podczas grupowej edycji pytań.');
  } finally {
    isSavingBatch.value = false;
  }
}

function flagChangedAdd(flagType) {
  // Wykluczanie się flagged i bad
  if (flagType === 'flagged' && formModel.value.flagged) {
    formModel.value.bad = false;
  } else if (flagType === 'bad' && formModel.value.bad) {
    formModel.value.flagged = false;
  }
}
</script>
