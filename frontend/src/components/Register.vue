<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <form
      @submit.prevent="handleRegister"
      class="bg-white p-6 rounded shadow-md w-80"
    >
      <h2 class="text-2xl font-bold mb-4 text-center">Rejestracja</h2>
      <div class="mb-4">
        <label for="login" class="block text-sm font-medium text-gray-700"
          >Login</label
        >
        <input
          type="text"
          v-model="loginInput"
          id="login"
          required
          class="mt-1 block w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div class="mb-4">
        <label for="password" class="block text-sm font-medium text-gray-700"
          >Hasło</label
        >
        <input
          type="password"
          v-model="password"
          id="password"
          required
          minlength="4"
          class="mt-1 block w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div class="mb-4">
        <label for="password2" class="block text-sm font-medium text-gray-700"
          >Powtórz hasło</label
        >
        <input
          type="password"
          v-model="password2"
          id="password2"
          required
          minlength="4"
          class="mt-1 block w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <button
        type="submit"
        class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Zarejestruj się
      </button>
      <p v-if="errorMessage" class="mt-4 text-red-500 text-sm">
        {{ errorMessage }}
      </p>
      <p v-if="successMessage" class="mt-4 text-green-600 text-sm">
        {{ successMessage }}
      </p>
      <router-link
        to="/login"
        class="block mt-4 text-blue-600 text-sm text-center hover:underline"
      >
        Masz już konto? Zaloguj się
      </router-link>
    </form>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      loginInput: "",
      password: "",
      password2: "",
      errorMessage: "",
      successMessage: "",
    };
  },
  methods: {
    async handleRegister() {
      this.errorMessage = "";
      this.successMessage = "";
      if (!this.loginInput || !this.password || !this.password2) {
        this.errorMessage = "Wszystkie pola są wymagane.";
        return;
      }
      if (this.password.length < 4) {
        this.errorMessage = "Hasło musi mieć co najmniej 4 znaki.";
        return;
      }
      if (this.password !== this.password2) {
        this.errorMessage = "Hasła nie są takie same.";
        return;
      }
      try {
        await axios.post("/api/auth/register", {
          login: this.loginInput,
          password: this.password,
        });
        this.successMessage =
          "Rejestracja zakończona sukcesem! Możesz się zalogować.";
        setTimeout(() => {
          this.$router.push({ name: "Login" });
        }, 1500);
      } catch (e) {
        this.errorMessage =
          (e.response && e.response.data && e.response.data.message) ||
          "Błąd rejestracji.";
      }
    },
  },
};
</script>
