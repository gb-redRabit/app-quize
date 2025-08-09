<template>
  <div
    id="app"
    class="w-[100vw] flex flex-col items-center justify-start min-h-screen dark:bg-gray-900 dark:text-gray-200"
    :data-theme="currentTheme"
  >
    <template v-if="isAuthChecked">
      <Navbar v-if="showNavbar" />
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

      <router-view :key="$route.fullPath" />

      <!-- Globalne komponenty -->
      <BaseAlert ref="globalAlert" />
      <BaseLoader ref="globalLoader" v-if="globalLoaderVisible" />
      <BaseModal :show="showSessionModal" @close="showSessionModal = false">
        <template #header>
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Sesja wygasa</h2>
        </template>
        <div class="p-2 text-gray-700 dark:text-gray-200">
          Twoja sesja wygaśnie za około <b>{{ sessionMinutesLeft }}</b> minut.<br />
          Kliknij poniżej, aby odświeżyć sesję i kontynuować pracę.
        </div>
        <template #footer>
          <button
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-60"
            :disabled="sessionModalLoading"
            @click="refreshSessionToken"
          >
            <span v-if="sessionModalLoading">Odświeżanie...</span>
            <span v-else>Odśwież sesję</span>
          </button>
          <button
            class="ml-2 px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            @click="showSessionModal = false"
            :disabled="sessionModalLoading"
          >
            Zamknij
          </button>
        </template>
      </BaseModal>
    </template>
  </div>
</template>

<script>
import Navbar from '@/components/layout/Navbar.vue';
import BaseAlert from '@/components/base/BaseAlert.vue';
import BaseLoader from '@/components/base/BaseLoader.vue';
import BaseSkeleton from '@/components/base/BaseSkeleton.vue';
import BaseModal from '@/components/base/BaseModal.vue';
import apiClient from '@/api';
import { mapGetters } from 'vuex';
import store from '@/store';

export default {
  components: {
    Navbar,
    BaseAlert,
    BaseLoader,
    BaseSkeleton,
    BaseModal, // Dodaj jeśli nie było
  },

  data() {
    return {
      isPageLoading: false,
      showSessionModal: false,
      globalLoaderVisible: false,
      sessionMinutesLeft: 5,
      sessionModalLoading: false,
      isAuthChecked: false,
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

    // Obsługa powrotu online
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Dodaj weryfikację tokenu po wznowieniu ze stanu uśpienia
    window.addEventListener('focus', this.verifySession);

    // Sprawdzaj czas ważności tokenu co minutę
    this.sessionCheckInterval = setInterval(this.checkTokenExpiration, 60 * 1000);

    // Dodaj testowy przycisk do ręcznego wywołania modala
    window.testSessionModal = () => this.showSessionExpirationModal(5);

    // Sprawdź od razu po starcie
    this.checkTokenExpiration();

    // Sprawdź autoryzację przed pokazaniem aplikacji
    this.checkAuthOnStart();
  },

  beforeUnmount() {
    clearInterval(this.sessionCheckInterval);
    // Usuwanie nasłuchiwania
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
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
    handleOnline() {
      this.showAlert('success', 'Połączenie przywrócone. Odświeżanie danych...');
      this.refreshData();
    },
    handleOffline() {
      this.showAlert('warning', 'Brak połączenia z internetem', 0);
    },
    async refreshData() {
      try {
        // Odśwież podstawowe dane
        await store.dispatch('user/fetchUserHistoryAndHQ');
        await store.dispatch('questions/fetchStats');
      } catch (error) {
        console.error('Błąd odświeżania danych:', error);
      }
    },

    // Dodaj nową metodę weryfikacji sesji
    async verifySession() {
      try {
        // Sprawdź, czy token istnieje
        const token = sessionStorage.getItem('token');
        if (!token) return;

        // Spróbuj odświeżyć token
        await store.dispatch('user/verifySession');

        // Jeśli wszystko OK, odśwież dane
        this.refreshData();
      } catch (error) {
        console.error('Sesja wygasła:', error);
        // Jeśli wystąpił błąd, przekieruj do logowania
        if (this.$route.name !== 'Login') {
          this.showAlert('warning', 'Twoja sesja wygasła. Zaloguj się ponownie.', 5000);
          this.$router.push('/login');
        }
      }
    },

    async refreshSessionToken() {
      this.sessionModalLoading = true;
      try {
        const res = await apiClient.silentPost('/auth/refresh', {});
        if (res.data && res.data.token) {
          sessionStorage.setItem('token', res.data.token);
          this.showAlert('success', 'Sesja została odświeżona!');
          this.showSessionModal = false;
        } else {
          this.showAlert('error', 'Nie udało się odświeżyć sesji.');
        }
      } catch (e) {
        this.showAlert('error', 'Błąd podczas odświeżania sesji.');
      } finally {
        this.sessionModalLoading = false;
      }
    },

    showSessionExpirationModal(minutesLeft = 5) {
      this.sessionMinutesLeft = minutesLeft;
      this.showSessionModal = true;
    },

    checkTokenExpiration() {
      const token = sessionStorage.getItem('token');
      if (!token) return;
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const decoded = JSON.parse(jsonPayload);
        if (!decoded.exp) return;
        const currentTime = Math.floor(Date.now() / 1000);
        const timeRemaining = decoded.exp - currentTime;
        if (timeRemaining < 5 * 60 && timeRemaining > 0) {
          // Pokaż modal tylko jeśli nie jest już widoczny
          if (!this.showSessionModal) {
            this.showSessionExpirationModal(Math.ceil(timeRemaining / 60));
          }
        }
      } catch (e) {
        // Ignoruj błędy parsowania
      }
    },

    async checkAuthOnStart() {
      const token = sessionStorage.getItem('token');
      if (!token) {
        // Jeśli nie ma tokenu, przekieruj na login (jeśli nie jesteś już na login)
        if (this.$route.name !== 'Login' && this.$route.name !== 'Register') {
          await this.$router.replace({ name: 'Login' });
        }
        this.isAuthChecked = true;
        this.$hideLoader();
        return;
      }
      // Jeśli jest token, możesz dodać dodatkową weryfikację (np. /users/me)
      try {
        await this.$store.dispatch('user/verifySession');
        this.isAuthChecked = true;
        this.$hideLoader();
      } catch (e) {
        // Jeśli token nieważny, przekieruj na login
        if (this.$route.name !== 'Login' && this.$route.name !== 'Register') {
          await this.$router.replace({ name: 'Login' });
        }
        this.isAuthChecked = true;
        this.$hideLoader();
      }
    },
    $showLoader() {
      this.globalLoaderVisible = true;
      this.$refs.globalLoader?.show();
    },
    $hideLoader() {
      this.globalLoaderVisible = false;
      this.$refs.globalLoader?.hide();
    },
  },
};
</script>

<style></style>
