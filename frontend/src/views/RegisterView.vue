<template>
  <div class="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
    <div class="relative w-full max-w-md">
      <!-- Karta rejestracji -->
      <div
        class="rounded-xl shadow-lg p-6 sm:p-8 w-full relative z-10 overflow-hidden border border-gray-200 dark:border-gray-700 animate-slide-up"
      >
        <!-- Nagłówek -->
        <div class="mb-6 text-center">
          <h2
            class="text-2xl sm:text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400"
          >
            Rejestracja
          </h2>
          <p class="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Utwórz nowe konto</p>
        </div>

        <!-- Formularz -->
        <form @submit.prevent="handleRegister" class="space-y-5">
          <!-- Login -->
          <div class="mb-4">
            <label
              for="login"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Login
            </label>
            <div
              class="relative flex items-center overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30"
            >
              <div
                class="flex items-center justify-center h-full px-3 text-gray-400 dark:text-gray-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="h-5 w-5"
                >
                  <path
                    fill-rule="evenodd"
                    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                v-model="loginInput"
                id="login"
                required
                autocomplete="username"
                class="w-full p-3 bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Wybierz nazwę użytkownika"
              />
            </div>
          </div>

          <!-- Hasło -->
          <div class="mb-4">
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Hasło
            </label>
            <div
              class="relative flex items-center overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30"
            >
              <div
                class="flex items-center justify-center h-full px-3 text-gray-400 dark:text-gray-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="h-5 w-5"
                >
                  <path
                    fill-rule="evenodd"
                    d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="password"
                v-model="password"
                id="password"
                required
                minlength="4"
                autocomplete="new-password"
                class="w-full p-3 bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Minimum 4 znaki"
              />
            </div>
            <!-- Wskaźnik siły hasła -->
            <div v-if="password" class="mt-2 flex flex-col">
              <div
                class="h-1.5 rounded-full mt-1 transition-all duration-300"
                :class="strengthBarClasses"
              ></div>
              <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ passwordStrengthText }}
              </span>
            </div>
          </div>

          <!-- Powtórz hasło -->
          <div class="mb-4">
            <label
              for="password2"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Powtórz hasło
            </label>
            <div
              class="relative flex items-center overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30"
            >
              <div
                class="flex items-center justify-center h-full px-3 text-gray-400 dark:text-gray-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="h-5 w-5"
                >
                  <path
                    fill-rule="evenodd"
                    d="M15.75 1.5a6.75 6.75 0 00-6.651 7.906c.067.39-.032.717-.221.906l-6.5 6.499a3 3 0 00-.878 2.121v2.818c0 .414.336.75.75.75H6a.75.75 0 00.75-.75v-1.5h1.5A.75.75 0 009 19.5V18h1.5a.75.75 0 00.75-.75V15h1.5a.75.75 0 00.75-.75v-1.5a.75.75 0 01.75-.75 6.75 6.75 0 009-6.75V4.5a3 3 0 00-3-3h-6z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="password"
                v-model="password2"
                id="password2"
                required
                minlength="4"
                autocomplete="new-password"
                class="w-full p-3 bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Wpisz hasło ponownie"
              />
            </div>
            <!-- Wskaźnik zgodności haseł -->
            <div v-if="password && password2" class="flex items-center mt-1.5">
              <span
                v-if="password === password2"
                class="text-xs text-green-600 dark:text-green-400 flex items-center gap-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    fill-rule="evenodd"
                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                    clip-rule="evenodd"
                  />
                </svg>
                Hasła są identyczne
              </span>
              <span v-else class="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    fill-rule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                    clip-rule="evenodd"
                  />
                </svg>
                Hasła nie są identyczne
              </span>
            </div>
          </div>

          <!-- Przycisk rejestracji -->
          <BaseButton
            type="submit"
            color="blue"
            size="lg"
            class="w-full py-3 mt-6 font-semibold flex items-center justify-center gap-2 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            :disabled="!canRegister"
          >
            <span>Zarejestruj się</span>
          </BaseButton>
        </form>

        <!-- Stopka -->
        <div class="mt-6 text-center pt-4 border-t border-gray-100 dark:border-gray-700">
          <router-link
            to="/login"
            class="text-gray-600 dark:text-gray-400 text-sm hover:text-gray-800 dark:hover:text-gray-200 transition"
          >
            Masz już konto?{" "}
            <span class="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Zaloguj się
            </span>
          </router-link>
        </div>
      </div>

      <!-- Dekoracyjne elementy tła -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div
          class="absolute rounded-full opacity-70"
          style="
            width: 300px;
            height: 300px;
            top: -80px;
            right: -100px;
            background: radial-gradient(
              circle,
              rgba(59, 130, 246, 0.2) 0%,
              rgba(96, 165, 250, 0.05) 100%
            );
          "
        ></div>
        <div
          class="absolute rounded-full opacity-70"
          style="
            width: 200px;
            height: 200px;
            bottom: -70px;
            left: -80px;
            background: radial-gradient(
              circle,
              rgba(59, 130, 246, 0.1) 0%,
              rgba(96, 165, 250, 0.02) 100%
            );
          "
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import { useRouter } from 'vue-router';
import BaseButton from '@/components/base/BaseButton.vue';
import apiClient from '@/api';

// Router i alert
const router = useRouter();
const showAlert = inject('showAlert');

// Stan formularza
const loginInput = ref('');
const password = ref('');
const password2 = ref('');

// Obliczanie siły hasła
const passwordStrength = computed(() => {
  if (!password.value) return 0;
  let strength = 0;

  // Długość
  if (password.value.length >= 8) strength += 1;
  if (password.value.length >= 12) strength += 1;

  // Zawartość
  if (/[A-Z]/.test(password.value)) strength += 1;
  if (/[0-9]/.test(password.value)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password.value)) strength += 1;

  return Math.min(strength, 4);
});

// Klasy dla wskaźnika siły hasła
const strengthBarClasses = computed(() => {
  const classes = [
    'bg-red-400 w-[20%]', // Bardzo słabe
    'bg-yellow-400 w-[40%]', // Słabe
    'bg-yellow-400 w-[60%]', // Dobre
    'bg-green-400 w-[80%]', // Silne
    'bg-green-500 w-full', // Bardzo silne
  ];
  return classes[passwordStrength.value];
});

// Tekst opisujący siłę hasła
const passwordStrengthText = computed(() => {
  const texts = ['Bardzo słabe', 'Słabe', 'Dobre', 'Silne', 'Bardzo silne'];
  return texts[passwordStrength.value];
});

// Walidacja możliwości rejestracji
const canRegister = computed(
  () =>
    loginInput.value &&
    password.value &&
    password2.value &&
    password.value.length >= 4 &&
    password.value === password2.value
);

// Obsługa rejestracji
const handleRegister = async () => {
  if (!loginInput.value || !password.value || !password2.value) {
    showAlert('warning', 'Wszystkie pola są wymagane.');
    return;
  }

  if (password.value.length < 4) {
    showAlert('warning', 'Hasło musi mieć co najmniej 4 znaki.');
    return;
  }

  if (password.value !== password2.value) {
    showAlert('error', 'Hasła nie są takie same.');
    return;
  }

  try {
    await apiClient.post('/auth/register', {
      login: loginInput.value,
      password: password.value,
    });

    showAlert('success', 'Rejestracja zakończona sukcesem! Możesz się zalogować.');

    // Przekierowanie po udanej rejestracji
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  } catch (e) {
    if (e.response?.status === 409) {
      showAlert('error', 'Użytkownik o podanej nazwie już istnieje.');
    } else if (e.response?.data?.message) {
      showAlert('error', e.response.data.message);
    } else {
      showAlert('error', 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.');
    }
  }
};
</script>

<style>
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.5s ease-out forwards;
}

.bg-gradient-radial {
  background-image: radial-gradient(var(--tw-gradient-stops));
}
</style>
