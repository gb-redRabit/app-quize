<template>
  <div
    class="nav w-full xl:hidden z-30 transition-all duration-300"
    :class="{
      relative: !isFixed,
      'fixed top-0 left-0 right-0 animate-slide-down': isFixed,
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
    </nav>
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
  handleScroll();
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
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
</style>
