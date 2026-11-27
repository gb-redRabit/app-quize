<template>
  <div class="space-y-6">
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

      <!-- Aktywność i najpopularniejsze kategorie -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <section class="surface p-5">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Aktywność (ostatnie 30 dni)
          </h3>
          <p
            v-if="adminActivity.length === 0"
            class="mt-4 text-sm text-gray-500 dark:text-gray-400"
          >
            Brak zakończonych quizów w tym okresie.
          </p>
          <template v-else>
            <div
              class="mt-4 flex h-28 items-end gap-1"
              role="img"
              aria-label="Wykres liczby quizów dziennie"
            >
              <div
                v-for="day in adminActivity"
                :key="day.date"
                class="flex-1 min-w-[4px] rounded-t bg-blue-500/80 hover:bg-blue-600 transition-colors"
                :style="{
                  height: `${Math.max(4, Math.round(((day.quizzes || 0) / maxDailyQuizzes) * 100))}%`,
                }"
                :title="`${formatActivityDay(day.date)}: ${day.quizzes} quizów, ${day.correct} poprawnych, ${day.wrong} błędnych`"
              ></div>
            </div>
            <div class="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{{ formatActivityDay(adminActivity[0]?.date) }}</span>
              <span>{{ formatActivityDay(adminActivity[adminActivity.length - 1]?.date) }}</span>
            </div>
          </template>
        </section>

        <section class="surface p-5">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Najaktywniejsze kategorie
          </h3>
          <p
            v-if="adminTopCategories.length === 0"
            class="mt-4 text-sm text-gray-500 dark:text-gray-400"
          >
            Brak danych o kategoriach.
          </p>
          <ul v-else class="mt-4 space-y-3">
            <li
              v-for="category in adminTopCategories"
              :key="category.name"
              class="flex items-center gap-3"
            >
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm text-gray-800 dark:text-gray-100">
                  {{ category.name }}
                </span>
                <span class="block text-xs text-gray-500 dark:text-gray-400">
                  {{ category.quizzes }} quizów · {{ category.accuracy }}% poprawnych
                </span>
              </span>
              <span class="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <span
                  class="block h-full bg-green-500"
                  :style="{ width: `${category.accuracy}%` }"
                ></span>
              </span>
            </li>
          </ul>
        </section>
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
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import apiClient from '@/api';
import Avatar from '@/components/base/Avatar.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseModal from '@/components/base/BaseModal.vue';

const store = useStore();
const showAlert = inject('showAlert');

const currentUser = computed(() => store.getters['user/getUser']);
const currentUserId = computed(() => currentUser.value?._id || currentUser.value?.id);

const users = ref([]);
const userTotals = ref({
  users: 0,
  admins: 0,
  answers: 0,
  accuracy: 0,
  quizzes: 0,
  questions: 0,
});
const adminActivity = ref([]);
const adminTopCategories = ref([]);

const maxDailyQuizzes = computed(() =>
  Math.max(1, ...adminActivity.value.map((day) => day.quizzes || 0))
);

function formatActivityDay(date) {
  if (!date) return '';
  return new Date(`${date}T00:00:00`).toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
  });
}

const showAddUserModal = ref(false);
const newUser = ref({ login: '', password: '', rola: 'user' });
const userFormErrors = ref({});
const userSaving = ref(false);
const showDeleteUserModal = ref(false);
const userToDelete = ref(null);
const userDeleting = ref(false);

async function loadUsers() {
  try {
    const res = await apiClient.get('/users/stats');
    users.value = Array.isArray(res.data?.users) ? res.data.users : [];
    userTotals.value =
      res.data?.totals || {
        users: 0,
        admins: 0,
        answers: 0,
        accuracy: 0,
        quizzes: 0,
        questions: 0,
      };
    adminActivity.value = Array.isArray(res.data?.activity) ? res.data.activity : [];
    adminTopCategories.value = Array.isArray(res.data?.topCategories)
      ? res.data.topCategories
      : [];
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

onMounted(async () => {
  await loadUsers();
  if (users.value.length === 0) {
    showAlert?.('info', 'Brak zarejestrowanych użytkowników.');
  }
});
</script>
