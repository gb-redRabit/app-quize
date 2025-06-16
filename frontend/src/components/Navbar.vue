<template>
  <nav
    class="w-full bg-white shadow flex items-center justify-between px-6 py-3 mb-2 relative"
  >
    <!-- Lewa strona: użytkownik -->
    <h1 class="ml-2 font-bold text-blue-600 capitalize-first-letter">
      {{ userName }}
    </h1>

    <!-- Hamburger (mobile/tablet) -->
    <button
      class="md:hidden flex flex-col justify-center items-center w-10 h-10 focus:outline-none"
      @click="toggleMenu"
      aria-label="Otwórz menu"
    >
      <span
        class="block w-7 h-1 bg-blue-600 mb-1 rounded transition-all"
        :class="{ 'rotate-45 translate-y-2': menuOpen }"
      ></span>
      <span
        class="block w-7 h-1 bg-blue-600 mb-1 rounded transition-all"
        :class="{ 'opacity-0': menuOpen }"
      ></span>
      <span
        class="block w-7 h-1 bg-blue-600 rounded transition-all"
        :class="{ '-rotate-45 -translate-y-2': menuOpen }"
      ></span>
    </button>

    <!-- Środek: menu (desktop) -->
    <div class="hidden md:flex gap-6">
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
    <!-- Prawa strona: wyloguj (desktop) -->
    <button
      @click="logout"
      class="hidden md:block bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold"
    >
      Wyloguj
    </button>

    <!-- Menu mobilne -->
    <transition name="fade">
      <div
        v-if="menuOpen"
        class="absolute top-full left-0 w-full bg-white shadow-lg z-50 flex flex-col items-center py-4 md:hidden"
      >
        <router-link
          to="/"
          class="py-2 w-full text-center hover:bg-blue-50 font-medium"
          @click="closeMenu"
          >Strona główna</router-link
        >
        <router-link
          to="/history"
          class="py-2 w-full text-center hover:bg-blue-50 font-medium"
          @click="closeMenu"
          >Historia</router-link
        >
        <router-link
          to="/admin"
          class="py-2 w-full text-center hover:bg-blue-50 font-medium"
          @click="closeMenu"
          >Panel administracyjny</router-link
        >
        <button
          @click="logout"
          class="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold w-11/12"
        >
          Wyloguj
        </button>
      </div>
    </transition>
  </nav>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      menuOpen: false,
    };
  },
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
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      this.$store.dispatch("logout");
      this.$router.push({ name: "Login" }).then(() => {
        window.location.reload();
      });
    },
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
    closeMenu() {
      this.menuOpen = false;
    },
  },
  watch: {
    // Zamknij menu po zmianie trasy
    $route() {
      this.menuOpen = false;
    },
  },
};
</script>

<style scoped>
/* Dodatkowe style, jeśli potrzebne */
</style>
