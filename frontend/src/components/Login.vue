<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <form
      @submit.prevent="handleLogin"
      class="bg-white p-6 rounded shadow-md w-80"
    >
      <h2 class="text-2xl font-bold mb-4 text-center">Login</h2>
      <div class="mb-4">
        <label for="login" class="block text-sm font-medium text-gray-700"
          >Login</label
        >
        <input
          type="text"
          v-model="loginInput"
          id="login"
          required
          autocomplete="username"
          class="mt-1 block w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div class="mb-4">
        <label for="password" class="block text-sm font-medium text-gray-700"
          >Password</label
        >
        <input
          type="password"
          v-model="password"
          id="password"
          required
          autocomplete="current-password"
          class="mt-1 block w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <button
        type="submit"
        class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Login
      </button>
      <p v-if="errorMessage" class="mt-4 text-red-500 text-sm">
        {{ errorMessage }}
      </p>
      <!-- <router-link
        to="/register"
        class="block mt-4 text-blue-600 text-sm text-center hover:underline"
      >
        Nie masz konta? Zarejestruj się
      </router-link> -->
    </form>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  data() {
    return {
      loginInput: "",
      password: "",
      errorMessage: "",
    };
  },
  methods: {
    ...mapActions(["login"]),
    async handleLogin() {
      try {
        await this.login({
          login: this.loginInput,
          password: this.password,
        });
        this.$router.push({ name: "Home" });
      } catch {
        this.errorMessage = "Login failed.";
      }
    },
  },
};
</script>

<style scoped></style>
