<template>
  <div
    id="app"
    class="w-[100vw] flex flex-col items-center justify-start bg-gray-100 min-h-screen"
  >
    <Navbar v-if="showNavbar" />
    <router-view />
    <button
      v-if="$route.name !== 'Home' && $route.name !== 'Login'"
      @click="$router.back()"
      class="fixed top-4 sm:bottom-6 sm:top-auto sm:left-6 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 sm:px-6 sm:py-3 rounded-full shadow-lg font-bold text-lg transition flex items-center group z-50"
      style="box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.12)"
    >
      <svg
        class="w-7 h-7 mr-1 transition-transform duration-300 group-hover:-translate-x-2"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import { mapGetters } from "vuex";
export default {
  components: { Navbar },
  computed: {
    ...mapGetters(["isAuthenticated"]),
    showNavbar() {
      return this.isAuthenticated && this.$route.name !== "Login";
    },
  },
};
</script>

<style>
@import "./assets/tailwind.css";
</style>
