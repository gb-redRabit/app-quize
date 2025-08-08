<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-fit">
    <div
      class="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
    >
      <div class="px-6 py-4 flex items-center">
        <div
          class="w-10 h-10 rounded-md bg-green-500 text-white flex items-center justify-center mr-3"
        >
          <img src="@/assets/icons/lock.svg" alt="Ikona hasła" class="w-6 h-6" />
        </div>
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">Zmiana hasła</h2>
      </div>
    </div>

    <div class="p-6">
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
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Stare hasło
            </label>
            <div
              class="relative flex items-center overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30"
            >
              <img
                src="@/assets/icons/password.svg"
                alt="Ikona hasła"
                class="absolute left-3 w-5 h-5 text-gray-400 dark:text-gray-500"
              />
              <input
                v-model="oldPassword"
                type="password"
                autocomplete="current-password"
                placeholder="Wprowadź aktualne hasło"
                class="w-full p-3 pl-10 bg-transparent border-none outline-none text-gray-700 dark:text-gray-300"
              />
            </div>
          </div>

          <!-- Nowe hasło -->
          <div class="w-full">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nowe hasło
            </label>
            <div
              class="relative flex items-center overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30"
            >
              <img
                src="@/assets/icons/new-password.svg"
                alt="Ikona nowego hasła"
                class="absolute left-3 w-5 h-5 text-gray-400 dark:text-gray-500"
              />
              <input
                v-model="newPassword"
                type="password"
                autocomplete="new-password"
                placeholder="Wprowadź nowe hasło"
                class="w-full p-3 pl-10 bg-transparent border-none outline-none text-gray-700 dark:text-gray-300"
              />
            </div>
          </div>

          <!-- Powtórzenie hasła -->
          <div class="w-full">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Powtórz nowe hasło
            </label>
            <div
              class="relative flex items-center overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30"
            >
              <img
                src="@/assets/icons/new-password.svg"
                alt="Ikona nowego hasła"
                class="absolute left-3 w-5 h-5 text-gray-400 dark:text-gray-500"
              />
              <input
                v-model="newPassword2"
                type="password"
                autocomplete="new-password"
                placeholder="Potwierdź nowe hasło"
                class="w-full p-3 pl-10 bg-transparent border-none outline-none text-gray-700 dark:text-gray-300"
              />
            </div>
          </div>

          <!-- Wskaźnik zgodności -->
          <div v-if="passwordMatch !== null" class="flex items-center gap-2 text-sm mt-2">
            <img
              v-if="passwordMatch"
              src="@/assets/icons/check.svg"
              alt="OK"
              class="w-4 h-4 text-green-500"
            />
            <img v-else src="@/assets/icons/warning.svg" alt="Błąd" class="w-4 h-4 text-red-500" />
            <span :class="{ 'text-green-600': passwordMatch, 'text-red-600': !passwordMatch }">
              {{ passwordMatch ? 'Hasła są identyczne' : 'Hasła nie są identyczne' }}
            </span>
          </div>

          <BaseButton
            color="green"
            type="submit"
            class="w-full flex items-center justify-center gap-2 mt-4 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Zmień hasło</span>
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

// Props
const props = defineProps({
  user: Object,
});

// Emits
const emit = defineEmits(['password-changed']);

// Stan formularza
const oldPassword = ref('');
const newPassword = ref('');
const newPassword2 = ref('');

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
