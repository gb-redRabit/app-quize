<template>
  <div class="flex items-center justify-center min-h-screen">
    <form @submit.prevent="handleRegister" class="bg-white p-6 rounded shadow-md w-80">
      <h2 class="text-2xl font-bold mb-4 text-center">Rejestracja</h2>
      <div class="mb-4">
        <label for="login" class="block text-sm font-medium text-gray-700">Login</label>
        <input
          type="text"
          v-model="loginInput"
          id="login"
          required
          autocomplete="username"
          class="w-full p-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
      </div>
      <div class="mb-4">
        <label for="password" class="block text-sm font-medium text-gray-700">Hasło</label>
        <input
          type="password"
          v-model="password"
          id="password"
          required
          minlength="4"
          class="w-full p-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
      </div>
      <div class="mb-4">
        <label for="password2" class="block text-sm font-medium text-gray-700">Powtórz hasło</label>
        <input
          type="password"
          v-model="password2"
          id="password2"
          required
          minlength="4"
          class="w-full p-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
      </div>
      <BaseButton type="submit" color="blue" class="w-full font-semibold py-2 rounded shadow">
        Zarejestruj się
      </BaseButton>
      <BaseAlert v-if="errorMessage" :message="errorMessage" type="error" />
      <BaseAlert v-if="successMessage" :message="successMessage" type="success" />
      <router-link to="/login" class="block mt-4 text-blue-600 text-sm text-center hover:underline">
        Masz już konto? Zaloguj się
      </router-link>
    </form>
  </div>
</template>

<script>
import BaseButton from '@/components/BaseButton.vue';
import BaseAlert from '@/components/BaseAlert.vue';
import apiClient from '@/api'; // <-- ZMIANA

export default {
  components: { BaseButton, BaseAlert },
  data() {
    return {
      loginInput: '',
      password: '',
      password2: '',
      errorMessage: '',
      successMessage: '',
    };
  },
  methods: {
    async handleRegister() {
      this.errorMessage = '';
      this.successMessage = '';
      if (!this.loginInput || !this.password || !this.password2) {
        this.errorMessage = 'Wszystkie pola są wymagane.';
        return;
      }
      if (this.password.length < 4) {
        this.errorMessage = 'Hasło musi mieć co najmniej 4 znaki.';
        return;
      }
      if (this.password !== this.password2) {
        this.errorMessage = 'Hasła nie są takie same.';
        return;
      }
      try {
        await apiClient.post('/auth/register', {
          // <-- ZMIANA
          login: this.loginInput,
          password: this.password,
        });
        this.successMessage = 'Rejestracja zakończona sukcesem! Możesz się zalogować.';
        setTimeout(() => {
          this.$router.push({ name: 'Login' });
        }, 1500);
      } catch (e) {
        this.errorMessage =
          (e.response && e.response.data && e.response.data.message) || 'Błąd rejestracji.';
      }
    },
  },
};
</script>
