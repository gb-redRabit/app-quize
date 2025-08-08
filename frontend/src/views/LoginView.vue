<template>
  <div class="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
    <div class="relative w-full max-w-md">
      <!-- Karta logowania -->
      <div
        class="rounded-xl shadow-lg p-6 sm:p-8 w-full relative z-10 overflow-hidden border border-gray-200 dark:border-gray-700"
        style="animation: fadeIn 0.5s ease-out forwards"
      >
        <!-- Nagłówek -->
        <div class="mb-6 text-center">
          <h2
            class="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-blue-400 text-transparent bg-clip-text"
          >
            Logowanie
          </h2>
          <p class="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            Witaj z powrotem! Zaloguj się do swojego konta
          </p>
        </div>

        <!-- Formularz logowania -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Login -->
          <div class="mb-4">
            <label
              for="login"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >Login</label
            >
            <div
              class="relative flex items-center overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:border-blue-500 dark:focus-within:ring-blue-900"
            >
              <div
                class="flex items-center justify-center h-full px-3 text-gray-400 dark:text-gray-500"
              >
                <img src="@/assets/icons/user.svg" alt="Ikona użytkownika" class="h-5 w-5" />
              </div>
              <input
                type="text"
                v-model="loginInput"
                id="login"
                required
                autocomplete="username"
                class="w-full p-3 bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Wprowadź nazwę użytkownika"
              />
            </div>
          </div>

          <!-- Hasło -->
          <div class="mb-4">
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >Hasło</label
            >
            <div
              class="relative flex items-center overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:border-blue-500 dark:focus-within:ring-blue-900"
            >
              <div
                class="flex items-center justify-center h-full px-3 text-gray-400 dark:text-gray-500"
              >
                <img src="@/assets/icons/lock.svg" alt="Ikona hasła" class="h-5 w-5" />
              </div>
              <input
                type="password"
                v-model="password"
                id="password"
                required
                autocomplete="current-password"
                class="w-full p-3 bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Wprowadź hasło"
              />
            </div>
          </div>

          <!-- Przycisk logowania -->
          <BaseButton
            type="submit"
            color="blue"
            size="lg"
            class="w-full py-3 mt-6 font-semibold flex items-center justify-center gap-2 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Zaloguj się</span>
          </BaseButton>
        </form>

        <!-- Link do rejestracji -->
        <div class="mt-6 text-center pt-4 border-t border-gray-100 dark:border-gray-700">
          <router-link
            to="/register"
            class="text-gray-600 dark:text-gray-400 text-sm hover:text-gray-800 dark:hover:text-gray-200 transition"
          >
            Nie masz konta?
            <span class="text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >Zarejestruj się</span
            >
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
import { ref, inject } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import BaseButton from '@/components/base/BaseButton.vue';

// Zmienne reaktywne
const loginInput = ref('');
const password = ref('');

// Store, router i alert
const store = useStore();
const router = useRouter();
const showAlert = inject('showAlert');

// Obsługa logowania
const handleLogin = async () => {
  if (!loginInput.value || !password.value) {
    showAlert('warning', 'Wprowadź login i hasło.');
    return;
  }

  try {
    await store.dispatch('user/login', {
      login: loginInput.value,
      password: password.value,
    });

    showAlert('success', 'Zalogowano pomyślnie');

    // Przekierowanie po zalogowaniu
    setTimeout(() => {
      router.push('/');
    }, 300);
  } catch (error) {
    showAlert('error', 'Niepoprawny login lub hasło');
  }
};
</script>

<style>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
