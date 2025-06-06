<template>
  <nav
    class="w-full bg-white shadow flex items-center justify-between px-6 py-3 mb-6"
  >
    <!-- Lewa strona: użytkownik -->
    <div class="flex items-center">
      <span class="font-semibold text-blue-700">Zalogowany jako:</span>
      <span class="ml-2 font-bold text-gray-800">{{ userName }}</span>
    </div>
    <!-- Środek: menu -->
    <div class="flex gap-6">
      <router-link to="/" class="hover:text-blue-600 font-medium"
        >Strona główna</router-link
      >
      <router-link to="/history" class="hover:text-blue-600 font-medium"
        >Historia</router-link
      >
      <router-link to="/admin" class="hover:text-blue-600 font-medium"
        >Panel administracyjny</router-link
      >
    </div>
    <!-- Prawa strona: wyloguj -->
    <button
      @click="logout"
      class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold"
    >
      Wyloguj
    </button>
  </nav>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  computed: {
    ...mapGetters(["getUser"]),
    userName() {
      return this.getUser && this.getUser.login
        ? this.getUser.login
        : "nieznany";
    },
  },
  methods: {
    logout() {
      // Czyść localStorage i sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      // Wyloguj w Vuex
      this.$store.dispatch("logout");
      // Przekieruj na stronę główną i odśwież
      this.$router.push({ name: "Home" }).then(() => {
        window.location.reload();
      });
    },
  },
};
</script>
