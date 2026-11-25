<template>
  <div
    class="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950"
  >
    <div
      class="w-full max-w-4xl overflow-hidden rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl grid lg:grid-cols-2"
      style="animation: fadeIn 0.4s ease-out forwards"
    >
      <!-- Panel marki (desktop) -->
      <aside class="hidden lg:flex flex-col justify-between bg-gray-900 text-white p-10">
        <div class="flex items-center gap-3">
          <div
            class="h-10 w-10 rounded-xl bg-blue-600 grid place-items-center text-sm font-bold"
            aria-hidden="true"
          >
            Q
          </div>
          <span class="font-semibold tracking-tight">Quiz App</span>
        </div>

        <div>
          <h2 class="text-3xl font-semibold tracking-tight leading-tight">
            Ucz się mądrze,<br />nie tylko długo.
          </h2>
          <p class="mt-3 text-sm text-gray-300">
            Pytania, egzaminy i statystyki w jednym miejscu.
          </p>
          <ul class="mt-7 space-y-3 text-sm text-gray-300">
            <li class="flex items-center gap-2"><span class="text-blue-400">✓</span> Losowe pytania i odpowiedzi</li>
            <li class="flex items-center gap-2"><span class="text-blue-400">✓</span> Tryb egzaminu z czasem</li>
            <li class="flex items-center gap-2"><span class="text-blue-400">✓</span> Postępy i historia nauki</li>
            <li class="flex items-center gap-2"><span class="text-blue-400">✓</span> Działa offline (PWA)</li>
          </ul>
        </div>

        <p class="text-xs text-gray-400">Twoje dane pozostają na koncie.</p>
      </aside>

      <!-- Formularz -->
      <div class="p-6 sm:p-10">
        <div class="mb-7">
          <div class="lg:hidden mb-5 flex items-center gap-2.5">
            <div class="h-9 w-9 rounded-xl bg-blue-600 grid place-items-center text-xs font-bold text-white">
              Q
            </div>
            <span class="font-semibold tracking-tight text-gray-900 dark:text-gray-100">Quiz App</span>
          </div>
          <h1 class="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            Zaloguj się
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Witaj z powrotem — kontynuuj naukę tam, gdzie skończyłeś.
          </p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label
              for="login"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >Login</label
            >
            <div
              class="relative flex items-center overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900"
            >
              <div class="flex items-center justify-center h-full px-3 text-gray-400 dark:text-gray-500">
                <img src="@/assets/icons/user.svg" alt="Ikona użytkownika" class="h-5 w-5" />
              </div>
              <input
                type="text"
                v-model="loginInput"
                id="login"
                required
                autocomplete="username"
                class="w-full p-3 bg-transparent border-none outline-hidden text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="Wprowadź nazwę użytkownika"
              />
            </div>
          </div>

          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >Hasło</label
            >
            <div
              class="relative flex items-center overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900"
            >
              <div class="flex items-center justify-center h-full px-3 text-gray-400 dark:text-gray-500">
                <img src="@/assets/icons/lock.svg" alt="Ikona hasła" class="h-5 w-5" />
              </div>
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                id="password"
                required
                autocomplete="current-password"
                class="w-full p-3 bg-transparent border-none outline-hidden text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="Wprowadź hasło"
              />
              <PasswordVisibilityToggle
                :visible="showPassword"
                @toggle="showPassword = !showPassword"
              />
            </div>
          </div>

          <BaseButton
            type="submit"
            color="blue"
            size="lg"
            class="w-full mt-2 font-semibold"
            :disabled="isLoggingIn"
          >
            <span class="flex items-center justify-center">
              <svg
                v-if="isLoggingIn"
                class="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <span>{{ isLoggingIn ? 'Logowanie...' : 'Zaloguj się' }}</span>
            </span>
          </BaseButton>
        </form>

        <div class="mt-6 text-center pt-4 border-t border-gray-100 dark:border-gray-800">
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
    </div>
  </div>
</template>

<script setup>
import { ref, inject, defineAsyncComponent } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
const BaseButton = defineAsyncComponent(() => import('@/components/base/BaseButton.vue'));
const PasswordVisibilityToggle = defineAsyncComponent(
  () => import('@/components/base/PasswordVisibilityToggle.vue')
);

// Zmienne reaktywne
const loginInput = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoggingIn = ref(false);
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

  isLoggingIn.value = true;
  try {
    await store.dispatch('user/login', {
      login: loginInput.value,
      password: password.value,
    });

    showAlert('success', 'Zalogowano pomyślnie');
    setTimeout(() => {
      router.push('/');
    }, 300);
  } catch (error) {
    showAlert('error', 'Niepoprawny login lub hasło');
  } finally {
    isLoggingIn.value = false;
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
