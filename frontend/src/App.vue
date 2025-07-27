<template>
  <div
    id="app"
    class="w-[100vw] flex flex-col items-center justify-start min-h-screen dark:bg-gray-900 dark:text-gray-200"
    :data-theme="currentTheme"
  >
    <Navbar v-if="showNavbar" />
    <!-- <GnomePet :size="120" /> -->
    <BaseSkeleton v-if="isPageLoading && showNavbar" />
    <router-view v-else :key="$route.fullPath" />

    <!-- Globalne komponenty -->
    <BaseAlert ref="globalAlert" />
    <BaseLoader ref="globalLoader" />
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue';
import BaseAlert from '@/components/BaseAlert.vue';
import BaseLoader from '@/components/BaseLoader.vue';
import BaseSkeleton from '@/components/BaseSkeleton.vue';
import { mapGetters } from 'vuex';

export default {
  components: {
    Navbar,
    BaseAlert,
    BaseLoader,
    BaseSkeleton,
  },

  data() {
    return {
      isPageLoading: false,
    };
  },

  computed: {
    ...mapGetters('user', ['isAuthenticated']),
    ...mapGetters('ui', ['currentTheme']),
    showNavbar() {
      return this.$route.name !== 'Login' && this.$route.name !== 'Register';
    },
  },

  watch: {
    // Dodaj watcher na currentTheme
    currentTheme: {
      immediate: true, // Wykonaj od razu przy montowaniu komponentu
      handler(newTheme) {
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        // Opcjonalnie, zapisz w localStorage dla zapamiętania między sesjami
        localStorage.setItem('theme', newTheme);
      },
    },
  },

  mounted() {
    // Ustaw początkowy motyw z localStorage lub Vuex store
    const savedTheme = localStorage.getItem('theme') || this.currentTheme;
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    this.$router.beforeEach((to, from, next) => {
      this.isPageLoading = true;
      next();
    });
    this.$router.afterEach(() => {
      setTimeout(() => {
        this.isPageLoading = false;
      }, 400); // krótka animacja skeletona
    });
  },

  provide() {
    return {
      showAlert: this.showAlert,
      hideAlert: this.hideAlert,
    };
  },

  methods: {
    showAlert(type, message, duration = 3000) {
      this.$refs.globalAlert.show(type, message, duration);
    },
    hideAlert() {
      this.$refs.globalAlert.hide();
    },
  },
};
</script>

<style></style>
