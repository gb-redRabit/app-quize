<template>
  <div
    class="nav w-full transition-all duration-300"
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

      <!-- Desktop menu -->
      <div class="hidden lg:flex items-center gap-6">
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
        >
          <span class="flex items-center">
            <component :is="item.icon" class="h-5 w-5" />
          </span>
          <span>{{ item.label }}</span>
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
  <div v-if="isFixed" style="width: 100%; height: 72px"></div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, inject, h } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import Avatar from '@/components/base/Avatar.vue';

// Inject globalnego alertu jeśli istnieje
const showAlert = inject('showAlert', null);

// Inicjalizacja store, router i route
const store = useStore();
const router = useRouter();
const route = useRoute();

// Reaktywne zmienne
const menuOpen = ref(false);
const isFixed = ref(false);
const scrollThreshold = 300;
const scrollY = ref(0);
const ticking = ref(false);

// Ikony jako funkcje renderujące — bez runtime compilera Vue.
const makeIcon = (props, children) => ({
  render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', ...props }, children),
});
const path = (props) => h('path', props);
const rect = (props) => h('rect', props);

const HomeIcon = makeIcon(
  { class: 'h-5 w-5', viewBox: '0 0 20 20', fill: 'currentColor' },
  [
    path({
      d: 'M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z',
    }),
  ]
);

const HistoryIcon = makeIcon(
  { class: 'h-5 w-5', viewBox: '0 0 20 20', fill: 'currentColor' },
  [
    path({
      'fill-rule': 'evenodd',
      d: 'M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z',
      'clip-rule': 'evenodd',
    }),
  ]
);

const ListIcon = makeIcon(
  { class: 'h-5 w-5', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' },
  [
    path({
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'stroke-width': '2',
      d: 'M4 6h16M4 10h16M4 14h16M4 18h16',
    }),
  ]
);

const UserIcon = makeIcon(
  { class: 'h-5 w-5', viewBox: '0 0 20 20', fill: 'currentColor' },
  [
    path({
      'fill-rule': 'evenodd',
      d: 'M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z',
      'clip-rule': 'evenodd',
    }),
  ]
);

const AdminIcon = makeIcon(
  { class: 'h-5 w-5', viewBox: '0 0 20 20', fill: 'currentColor' },
  [
    path({
      'fill-rule': 'evenodd',
      d: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z',
      'clip-rule': 'evenodd',
    }),
  ]
);

const DuplicateIcon = makeIcon(
  { class: 'h-5 w-5', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' },
  [
    rect({ x: '4', y: '4', width: '16', height: '16', rx: '2', 'stroke-width': '2', fill: 'none' }),
    rect({ x: '8', y: '8', width: '8', height: '8', rx: '1', 'stroke-width': '2', fill: 'none' }),
  ]
);

// Elementy nawigacyjne
const navItems = [
  {
    path: '/',
    label: 'Strona główna',
    icon: HomeIcon,
  },
  {
    path: '/history',
    label: 'Historia',
    icon: HistoryIcon,
  },
  {
    path: '/questions',
    label: 'Lista pytań',
    icon: ListIcon,
  },
  {
    path: '/duplikaty',
    label: 'Duplikaty pytań',
    icon: DuplicateIcon,
    adminOnly: true,
  },
  {
    path: '/user',
    label: 'Panel użytkownika',
    icon: UserIcon,
  },
  {
    path: '/admin',
    label: 'Panel administracyjny',
    icon: AdminIcon,
    adminOnly: true,
  },
];

// Właściwości computed
const user = computed(() => store.state.user.user);
const isAdmin = computed(() => user.value?.rola === 'admin');
const userName = computed(() => user.value?.login || 'nieznany');
const visibleNavItems = computed(() =>
  navItems.filter((item) => !item.adminOnly || (item.adminOnly && isAdmin.value))
);

// Metody
function logout() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  store.dispatch('user/logout');

  router.push({ name: 'Login' }).then(() => {
    if (showAlert) showAlert('info', 'Zostałeś wylogowany');
    window.location.reload();
  });
}

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
