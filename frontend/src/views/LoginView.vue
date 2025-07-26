<template>
  <div class="min-h-screen w-full flex items-center justify-center p-4">
    <div class="relative w-full max-w-md">
      <div
        class="rounded-xl shadow-lg p-6 sm:p-8 w-full relative z-10 overflow-hidden animate-fadeIn"
      >
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

        <form @submit.prevent="handleLogin" class="space-y-5">
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
                class="w-full p-3 bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Wprowadź nazwę użytkownika"
              />
            </div>
          </div>

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
                autocomplete="current-password"
                class="w-full p-3 bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Wprowadź hasło"
              />
            </div>
          </div>

          <BaseButton
            type="submit"
            color="blue"
            size="lg"
            class="w-full py-3 mt-6 font-semibold flex items-center justify-center gap-2 rounded-lg"
          >
            <span>Zaloguj się</span>
          </BaseButton>
        </form>

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

      <div class="absolute inset-0 pointer-events-none overflow-hidden -z-10 rounded-xl">
        <div
          class="absolute rounded-full opacity-70"
          :style="{
            width: '300px',
            height: '300px',
            top: '-80px',
            right: '-100px',
            background:
              'radial-gradient(circle, rgba(59, 130, 246, 0.2), rgba(96, 165, 250, 0.05))',
          }"
        ></div>
        <div
          class="absolute rounded-full opacity-70"
          :style="{
            width: '200px',
            height: '200px',
            bottom: '-70px',
            left: '-80px',
            background:
              'radial-gradient(circle, rgba(59, 130, 246, 0.1), rgba(96, 165, 250, 0.02))',
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import BaseButton from '@/components/BaseButton.vue';

export default {
  components: { BaseButton },
  inject: ['showAlert'],
  data() {
    return {
      loginInput: '',
      password: '',
      errorMessage: '',
    };
  },
  methods: {
    ...mapActions('user', ['login']),
    async handleLogin() {
      if (!this.loginInput || !this.password) {
        this.showAlert('warning', 'Wprowadź login i hasło.');
        return;
      }
      try {
        this.errorMessage = '';

        await this.login({
          login: this.loginInput,
          password: this.password,
        });
        this.showAlert('success', 'Zalogowano pomyślnie');

        // Bezpieczniejsza nawigacja po zalogowaniu
        setTimeout(() => {
          window.location.href = '/';
        }, 300);
      } catch (error) {
        this.errorMessage = 'Niepoprawny login lub hasło. Spróbuj ponownie.';
        this.showAlert('error', 'Niepoprawny login lub hasło');
      }
    },
  },
};
</script>

<style>
/* Keyframes for fadeIn animation */
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

/* Apply animation directly to the class used in template */
.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}
</style>
