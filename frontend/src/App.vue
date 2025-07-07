<template>
  <div
    id="app"
    class="w-[100vw] flex flex-col items-center justify-start min-h-screen"
    :data-theme="currentTheme"
  >
    <Navbar v-if="showNavbar" />
    <router-view :key="$route.fullPath" />

    <!-- Globalne komponenty -->
    <BaseAlert ref="globalAlert" />
    <BaseLoader ref="globalLoader" />
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue';
import BaseAlert from '@/components/BaseAlert.vue';
import BaseLoader from '@/components/BaseLoader.vue';
import { mapGetters } from 'vuex';

export default {
  components: {
    Navbar,
    BaseAlert,
    BaseLoader,
  },

  computed: {
    ...mapGetters('user', ['isAuthenticated']),
    ...mapGetters('ui', ['currentTheme']),
    showNavbar() {
      return this.$route.name !== 'Login' && this.$route.name !== 'Register';
    },
  },

  provide() {
    return {
      showAlert: this.showAlert,
      hideAlert: this.hideAlert,
      showLoader: this.showLoader,
      hideLoader: this.hideLoader,
    };
  },

  methods: {
    showAlert(type, message, duration = 5000) {
      this.$refs.globalAlert.show(type, message, duration);
    },
    hideAlert() {
      this.$refs.globalAlert.hide();
    },
    showLoader(text) {
      this.$refs.globalLoader.show(text);
    },
    hideLoader() {
      this.$refs.globalLoader.hide();
    },
  },
};
</script>

<style></style>
