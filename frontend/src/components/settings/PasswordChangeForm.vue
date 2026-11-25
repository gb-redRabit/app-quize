<template>
  <div class="surface overflow-hidden h-fit">
    <div class="px-5 py-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-800">
      <div
        class="h-9 w-9 shrink-0 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 grid place-items-center"
        aria-hidden="true"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h2 class="text-base font-semibold tracking-tight text-gray-900 dark:text-gray-50">
        Zmiana hasła
      </h2>
    </div>

    <div class="p-5 sm:p-6">
      <form @submit.prevent="changePassword">
        <!-- Ukryte pole dla wsparcia autouzupełniania -->
        <input
          type="text"
          :value="user?.login"
          autocomplete="username"
          class="hidden"
          tabindex="-1"
          aria-hidden="true"
          readonly
        />

        <div class="space-y-4">
          <!-- Stare hasło -->
          <div class="w-full">
            <label
              for="old-password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Stare hasło
            </label>
            <div
              class="relative flex items-center overflow-hidden h-11 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30"
            >
              <svg
                class="absolute left-3 w-5 h-5 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.8"
                  d="M7 11V8a5 5 0 0110 0v3M5 11h14v9H5z"
                />
              </svg>
              <input
                id="old-password"
                v-model="oldPassword"
                :type="showOldPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Wprowadź aktualne hasło"
                class="w-full h-full pl-10 pr-2 bg-transparent border-none outline-hidden text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
              <PasswordVisibilityToggle
                :visible="showOldPassword"
                @toggle="showOldPassword = !showOldPassword"
              />
            </div>
          </div>

          <!-- Nowe hasło -->
          <div class="w-full">
            <label
              for="new-password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Nowe hasło
            </label>
            <div
              class="relative flex items-center overflow-hidden h-11 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30"
            >
              <svg
                class="absolute left-3 w-5 h-5 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.8"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <input
                id="new-password"
                v-model="newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Wprowadź nowe hasło"
                class="w-full h-full pl-10 pr-2 bg-transparent border-none outline-hidden text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
              <PasswordVisibilityToggle
                :visible="showNewPassword"
                @toggle="showNewPassword = !showNewPassword"
              />
            </div>
          </div>

          <!-- Powtórzenie hasła -->
          <div class="w-full">
            <label
              for="repeat-password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Powtórz nowe hasło
            </label>
            <div
              class="relative flex items-center overflow-hidden h-11 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30"
            >
              <svg
                class="absolute left-3 w-5 h-5 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.8"
                  d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 012-2z"
                />
              </svg>
              <input
                id="repeat-password"
                v-model="newPassword2"
                :type="showNewPassword2 ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Potwierdź nowe hasło"
                class="w-full h-full pl-10 pr-2 bg-transparent border-none outline-hidden text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
              <PasswordVisibilityToggle
                :visible="showNewPassword2"
                @toggle="showNewPassword2 = !showNewPassword2"
              />
            </div>
          </div>

          <!-- Wskaźnik zgodności -->
          <div v-if="passwordMatch !== null" class="flex items-center gap-2 text-sm">
            <svg
              v-if="passwordMatch"
              class="w-4 h-4 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <svg
              v-else
              class="w-4 h-4 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"
              />
            </svg>
            <span
              :class="
                passwordMatch
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
              "
            >
              {{ passwordMatch ? 'Hasła są identyczne' : 'Hasła nie są identyczne' }}
            </span>
          </div>

          <BaseButton color="green" type="submit" class="w-full mt-2">
            Zmień hasło
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import apiClient from '@/api';
import BaseButton from '@/components/base/BaseButton.vue';
import PasswordVisibilityToggle from '@/components/base/PasswordVisibilityToggle.vue';

// Props
defineProps({
  user: Object,
});

// Emits
const emit = defineEmits(['password-changed']);

// Stan formularza
const oldPassword = ref('');
const newPassword = ref('');
const newPassword2 = ref('');
const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showNewPassword2 = ref(false);

// Obliczanie zgodności haseł
const passwordMatch = computed(() => {
  if (!newPassword.value && !newPassword2.value) return null;
  return newPassword.value === newPassword2.value;
});

// Zmiana hasła
const changePassword = async () => {
  if (!oldPassword.value || !newPassword.value || !newPassword2.value) {
    emit('password-changed', false, 'Wypełnij wszystkie pola.');
    return;
  }

  if (newPassword.value !== newPassword2.value) {
    emit('password-changed', false, 'Nowe hasła nie są takie same.');
    return;
  }

  try {
    await apiClient.put('/users/update-profile', {
      changePassword: true,
      oldPassword: oldPassword.value,
      newPassword: newPassword.value,
    });

    // Czyszczenie pól po sukcesie
    oldPassword.value = '';
    newPassword.value = '';
    newPassword2.value = '';

    emit('password-changed', true, 'Hasło zostało zmienione pomyślnie!');
  } catch (e) {
    emit('password-changed', false, 'Błąd zmiany hasła. Sprawdź, czy stare hasło jest poprawne.');
  }
};
</script>
