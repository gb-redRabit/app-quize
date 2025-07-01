<template>
  <div id="app" class="w-[100vw] flex flex-col items-center justify-start bg-white min-h-screen">
    <Navbar v-if="showNavbar" />
    <router-view :key="$route.fullPath" />
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue';
import { mapGetters } from 'vuex';
export default {
  components: { Navbar },
  computed: {
    ...mapGetters('user', ['isAuthenticated']),
    showNavbar() {
      return this.isAuthenticated && this.$route.name !== 'Login';
    },
  },
};
</script>

<style>
@import './assets/tailwind.css';
</style>
