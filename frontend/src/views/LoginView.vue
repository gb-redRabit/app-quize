<template>
  <div class="flex items-center justify-center min-h-screen">
    <form @submit.prevent="handleLogin" class="bg-white p-6 rounded shadow-md w-80">
      <h2 class="text-2xl font-bold mb-4 text-center">Login</h2>
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
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          v-model="password"
          id="password"
          required
          autocomplete="current-password"
          class="w-full p-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
      </div>
      <BaseButton type="submit" color="blue" class="w-full font-semibold py-2 rounded shadow">
        Login
      </BaseButton>
      <BaseAlert v-if="errorMessage" :message="errorMessage" type="error" />
      <router-link
        to="/register"
        class="block mt-4 text-blue-600 text-sm text-center hover:underline"
      >
        Nie masz konta? Zarejestruj się
      </router-link>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import BaseButton from '@/components/BaseButton.vue';
import BaseAlert from '@/components/BaseAlert.vue';

export default {
  components: { BaseButton, BaseAlert },
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
      try {
        await this.login({
          login: this.loginInput,
          password: this.password,
        });
        this.$router.push({ name: 'Home' });
      } catch {
        this.errorMessage = 'Login failed.';
      }
    },
  },
};
</script>

<style scoped></style>
