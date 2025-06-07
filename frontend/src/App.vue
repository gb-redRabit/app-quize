<template>
  <div
    id="app"
    class="w-[100vw] flex flex-col items-center justify-start bg-gray-100 min-h-screen"
  >
    <Navbar v-if="showNavbar" />
    <router-view />
    <button
      v-if="$route.name !== 'Home'"
      @click="$router.back()"
      class="fixed-back-btn bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg font-bold text-lg transition flex items-center group"
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
      // Navbar nie pojawia się na stronie logowania
      return this.isAuthenticated && this.$route.name !== "Login";
    },
  },
};
</script>

<style>
@import "./assets/tailwind.css";
/* Możesz dodać do App.vue lub tailwind.css */
.fixed-back-btn {
  position: fixed;
  left: 24px;
  bottom: 24px;
  z-index: 100;
}
</style>
