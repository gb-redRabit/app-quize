<template>
  <div
    class="nav w-full xl:hidden transition-all duration-300"
    :class="{
      relative: !isFixed,
      'fixed top-0 left-0 right-0 animate-slide-down': isFixed,
      'z-50': menuOpen,
      'z-30': !menuOpen,
    }"
  >
    <nav
      aria-label="Nawigacja główna"
      class="relative z-40 flex justify-between items-center p-3 px-5 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 shadow-xs mb-4"
    >
      <!-- Logo/nazwa użytkownika -->
      <div class="flex items-center gap-2">
        <div class="flex items-center justify-center mr-0.5">
          <Avatar :avatar-index="user?.avatar || 0" :color="user?.avatarColors || ''" :size="40" />
        </div>
        <h1 class="font-semibold text-lg tracking-wide capitalize text-gray-800 dark:text-gray-100">
          {{ userName }}
        </h1>
      </div>

      <!-- Desktop menu (lg–xl: ikony z podpowiedziami; od xl sidebar) -->
      <div class="hidden lg:flex items-center gap-2 xl:gap-6">
        <router-link
          v-for="item in visibleNavItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-2 px-3 py-2 rounded-full font-medium transition-all duration-200"
          :class="
            route.path === item.path
              ? 'font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
              : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-300'
          "
          :title="item.label"
        >
          <span class="flex items-center">
            <component :is="item.icon" class="h-5 w-5" />
          </span>
          <span class="sr-only">{{ item.label }}</span>
        </router-link>
      </div>

      <!-- Logout button dla desktopu -->
      <button
        @click="logout"
        class="hidden lg:flex items-center px-4 py-2 bg-linear-to-r from-red-500 to-red-400 text-white font-semibold rounded-md transition-all duration-300 shadow-xs hover:from-red-600 hover:to-red-500 hover:shadow-md"
      >
        <span>Wyloguj</span>
      </button>

      <!-- Przycisk hamburgerowy dla urządzeń mobilnych -->
      <button
        @click="toggleMenu"
        class="lg:hidden flex items-center justify-center p-3 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-hidden focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-700"
        :aria-expanded="menuOpen"
        aria-controls="mobile-menu"
        :aria-label="menuOpen ? 'Zamknij menu' : 'Otwórz menu'"
      >
        <span class="sr-only">Menu</span>
        <!-- Ikona hamburgera gdy menu zamknięte -->
        <svg
          v-if="!menuOpen"
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <!-- Ikona X gdy menu otwarte -->
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </nav>

    <div
      v-if="menuOpen"
      class="fixed inset-0 z-20 lg:hidden bg-gray-900/50"
      aria-hidden="true"
      @click="closeMenu"
    ></div>

    <transition name="mobile-menu">
      <nav
        v-if="menuOpen"
        id="mobile-menu"
        aria-label="Nawigacja mobilna"
        class="fixed left-0 right-0 bottom-0 w-full bg-white shadow-md z-40 overflow-y-auto border-t border-gray-300 dark:bg-gray-900 dark:shadow-lg dark:border-gray-700"
        style="
          top: calc(4rem + env(safe-area-inset-top));
          padding-bottom: env(safe-area-inset-bottom);
        "
      >
        <div class="p-6 flex flex-col gap-3">
          <router-link
            v-for="item in visibleNavItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200"
            :class="
              route.path === item.path
                ? 'font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-300'
            "
            @click="closeMenu"
          >
            <span class="flex items-center">
              <component :is="item.icon" class="h-5 w-5" />
            </span>
            <span>{{ item.label }}</span>
          </router-link>

          <button
            @click="logout"
            class="mt-4 flex items-center gap-2 px-4 py-3 bg-linear-to-r from-red-500 to-red-400 text-white font-semibold rounded-md transition-all duration-300 shadow-xs hover:from-red-600 hover:to-red-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Wyloguj</span>
          </button>
        </div>
      </nav>
    </transition>
  </div>

  <!-- Placeholder div, aby zapobiec skakaniu zawartości podczas przełączania na fixed navbar -->
  <div v-if="isFixed" class="xl:hidden" style="width: 100%; height: 72px"></div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import Avatar from '@/components/base/Avatar.vue';
import { NAV_ITEMS as navItems } from './navIcons';
import { useLogout } from '@/composables/useLogout';

// Inicjalizacja store i route
const store = useStore();
const route = useRoute();
const logout = useLogout();

// Reaktywne zmienne
const menuOpen = ref(false);
const isFixed = ref(false);
const scrollThreshold = 300;
const scrollY = ref(0);
const ticking = ref(false);

// Właściwości computed
const user = computed(() => store.state.user.user);
const isAdmin = computed(() => user.value?.rola === 'admin');
const userName = computed(() => user.value?.login || 'nieznany');
const visibleNavItems = computed(() =>
  navItems.filter((item) => !item.adminOnly || (item.adminOnly && isAdmin.value))
);

function toggleMenu() {
  menuOpen.value = !menuOpen.value;

  if (menuOpen.value) {
    document.body.classList.add('no-scroll');
  } else {
    document.body.classList.remove('no-scroll');
  }
}

function closeMenu() {
  menuOpen.value = false;
  document.body.classList.remove('no-scroll');
}

function handleKeydown(event) {
  if (event.key === 'Escape' && menuOpen.value) {
    closeMenu();
  }
}

function handleScroll() {  scrollY.value = window.scrollY;

  if (!ticking.value) {
    window.requestAnimationFrame(() => {
      isFixed.value = scrollY.value > scrollThreshold;
      ticking.value = false;
    });

    ticking.value = true;
  }
}

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('keydown', handleKeydown);
  handleScroll();
});

onBeforeUnmount(() => {
  document.body.classList.remove('no-scroll');
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
/* Animacje dla menu mobilnego */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* Animacja dla płynnego pojawiania się navbara z góry */
@keyframes slide-down {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-down {
  animation: slide-down 0.3s ease forwards;
}

/* Klasa do blokowania przewijania gdy menu jest otwarte */
:global(.no-scroll) {
  overflow: hidden;
}
</style>
