<template>
  <div
    id="app"
    class="w-[100vw] flex flex-col items-center justify-start bg-gray-100 min-h-screen"
  >
    <Navbar v-if="showNavbar" />
    <router-view />
    <IconButton
      v-if="$route.name !== 'Home' && $route.name !== 'Login'"
      color="blue"
      size="lg"
      class="fixed top-4 sm:bottom-6 sm:top-auto sm:left-6 z-50"
      title="Cofnij"
      @click="$router.back()"
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
    </IconButton>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import IconButton from "@/components/IconButton.vue";
import { mapGetters } from "vuex";
export default {
  components: { Navbar, IconButton },
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
