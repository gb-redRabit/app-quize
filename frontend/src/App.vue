<template>
  <div
    id="app"
    class="w-[100vw] flex flex-col items-center justify-start min-h-screen dark:bg-gray-900 dark:text-gray-200"
    :data-theme="currentTheme"
  >
    <Navbar v-if="showNavbar" />

    <!-- Ulepszony skeleton z lepszym dopasowaniem do treści strony -->
    <div v-if="isPageLoading && showNavbar" class="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto">
      <BaseSkeleton
        :variant="skeletonVariant"
        :cardCount="skeletonCardCount"
        :showLines="showSkeletonLines"
        :showCards="showSkeletonCards"
        :showHeader="showSkeletonHeader"
        :showSubtitle="showSkeletonSubtitle"
        :containerClass="skeletonContainerClass"
        :gridCols="skeletonGridCols"
        :lineWidths="getLineWidths"
        class="my-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
      />
    </div>

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

    // Dynamicznie wybierz wariant skeletonu na podstawie ścieżki
    skeletonVariant() {
      const path = this.$route.path;
      if (path.includes('/quiz') || path.includes('/exam')) return 'question';
      if (path.includes('/profile')) return 'profile';
      if (path.includes('/history')) return 'article';
      return 'default';
    },

    // Dostosuj liczbę kart w zależności od ścieżki
    skeletonCardCount() {
      const path = this.$route.path;
      if (path.includes('/categories')) return 8;
      if (path.includes('/questions')) return 5;
      return 3;
    },

    // Pokaż karty tylko dla niektórych ścieżek
    showSkeletonCards() {
      const path = this.$route.path;
      return !path.includes('/profile') && !path.includes('/settings');
    },

    // Dynamicznie dostosowane szerokości linii dla różnych typów stron
    getLineWidths() {
      const path = this.$route.path;

      if (path.includes('/history')) {
        return ['100%', '90%', '95%', '85%', '70%'];
      } else if (path.includes('/questions')) {
        return ['80%', '100%', '95%', '90%'];
      } else if (path.includes('/quiz') || path.includes('/exam')) {
        return ['90%', '45%', '45%', '45%'];
      } else {
        return ['67%', '45%', '78%', '60%'];
      }
    },

    // Klasy kontenera dla skeletonu
    skeletonContainerClass() {
      const path = this.$route.path;

      if (path.includes('/profile')) {
        return 'max-w-4xl mx-auto p-6';
      } else if (path.includes('/quiz') || path.includes('/exam')) {
        return 'max-w-3xl mx-auto p-4';
      } else if (path.includes('/admin')) {
        return 'container mx-auto p-6';
      }

      return 'container mx-auto p-4';
    },

    // Układ kolumn dla siatki
    skeletonGridCols() {
      const path = this.$route.path;

      if (path.includes('/categories') || path.includes('/home')) {
        return 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      } else if (path.includes('/questions')) {
        return 'grid-cols-1';
      } else if (path.includes('/history')) {
        return 'grid-cols-1 md:grid-cols-2';
      }

      return 'sm:grid-cols-2 lg:grid-cols-3';
    },

    // Czy pokazywać nagłówek skeletonu
    showSkeletonHeader() {
      const path = this.$route.path;
      return !path.includes('/quiz') && !path.includes('/exam');
    },

    // Czy pokazywać podtytuł skeletonu
    showSkeletonSubtitle() {
      const path = this.$route.path;
      return path.includes('/home') || path.includes('/categories') || path.includes('/history');
    },

    // Czy pokazywać linie tekstu w skeletonie
    showSkeletonLines() {
      const path = this.$route.path;
      return !path.includes('/categories') || path.includes('/home');
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
      // Dostosuj opóźnienie w zależności od złożoności strony
      const delay = this.$route.path.includes('/questions') ? 600 : 400;

      setTimeout(() => {
        this.isPageLoading = false;
      }, delay);
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
