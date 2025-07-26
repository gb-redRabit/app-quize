<template>
  <div class="w-full relative z-50">
    <nav
      class="flex justify-between items-center p-3 px-5 bg-gradient-to-r from-white to-gray-50 shadow-md mb-4 dark:from-gray-800 dark:to-gray-900 dark:shadow-lg"
    >
      <div class="flex items-center gap-2">
        <div class="flex items-center justify-center mr-0.5">
          <Avatar
            :avatar-index="getUser && getUser.avatar !== undefined ? getUser.avatar : 0"
            :color="getUser && getUser.avatarColors !== undefined ? getUser.avatarColors : 0"
            :size="40"
          />
        </div>
        <h1
          class="font-semibold text-lg tracking-wide capitalize"
          :style="{ color: getUser && getUser.avatarColors ? getUser.avatarColors : '#3b82f6' }"
        >
          {{ userName }}
        </h1>
      </div>

      <div class="hidden lg:flex items-center gap-6">
        <router-link
          v-for="(item, idx) in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-2 px-3 py-2 rounded-md text-gray-600 font-medium transition-all duration-200 relative dark:text-gray-300"
          :class="{ 'font-semibold': $route.path === item.path }"
          :style="
            $route.path === item.path || hoveredIndex === idx
              ? { color: getUser && getUser.avatarColors ? getUser.avatarColors : '#3b82f6' }
              : {}
          "
          @mouseover="hoveredIndex = idx"
          @mouseleave="hoveredIndex = null"
        >
          <i class="flex items-center" v-html="item.icon"></i>
          <span>{{ item.label }}</span>
          <span
            v-if="$route.path === item.path"
            class="absolute left-2 right-2 -bottom-1 h-1 rounded-full"
            :style="{
              background: getUser && getUser.avatarColors ? getUser.avatarColors : '#3b82f6',
            }"
          ></span>
        </router-link>
      </div>

      <button
        @click="logout"
        class="hidden lg:flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-400 text-white font-semibold rounded-md transition-all duration-300 shadow-sm hover:from-red-600 hover:to-red-500 hover:shadow-md hover:shadow-red-400/40"
      >
        <span>Wyloguj</span>
      </button>

      <button
        class="flex lg:hidden items-center justify-center w-10 h-10 rounded-md border border-blue-200 bg-white transition-all duration-200 hover:bg-blue-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
        @click="toggleMenu"
        aria-label="Otwórz menu"
      >
        <div class="relative w-6 h-5">
          <span
            class="absolute w-full h-0.5 bg-blue-500 rounded-full transition-all duration-300 origin-center top-0 left-0 right-0"
            :class="{ 'translate-y-2.5 rotate-45': menuOpen }"
          ></span>
          <span
            class="absolute w-full h-0.5 bg-blue-500 rounded-full transition-all duration-300 origin-center top-2.5 left-0 right-0"
            :class="{ 'opacity-0': menuOpen }"
          ></span>
          <span
            class="absolute w-full h-0.5 bg-blue-500 rounded-full transition-all duration-300 origin-center bottom-0 left-0 right-0"
            :class="{ '-translate-y-2.5 -rotate-45': menuOpen }"
          ></span>
        </div>
      </button>
    </nav>

    <transition name="mobile-menu">
      <div
        v-if="menuOpen"
        class="fixed top-16 left-0 w-full h-auto max-h-[calc(100vh-4rem)] bg-white shadow-md z-40 overflow-y-auto border-t border-gray-300 dark:bg-gray-800 dark:shadow-lg dark:border-gray-700"
      >
        <div class="p-6 flex flex-col gap-3">
          <router-link
            v-for="(item, idx) in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 relative"
            :class="{ 'font-semibold': $route.path === item.path }"
            :style="($route.path === item.path || hoveredIndex === idx)
              ? { color: getUser && getUser.avatarColors ? getUser.avatarColors : '#3b82f6' }
              : {}"
            @mouseover="hoveredIndex = idx"
            @mouseleave="hoveredIndex = null"
            @click="closeMenu"
          >
            <i class="flex items-center" v-html="item.icon"></i>
            <span>{{ item.label }}</span>
            <span
              v-if="$route.path === item.path"
              class="absolute left-2 right-2 -bottom-1 h-1 rounded-full"
              :style="{ background: getUser && getUser.avatarColors ? getUser.avatarColors : '#3b82f6' }"
            ></span>
          </router-link>
          <button
            @click="logout"
            class="flex items-center justify-center gap-2 mt-4 p-3 bg-gradient-to-r from-red-500 to-red-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:from-red-600 hover:to-red-500"
          >
            <span>Wyloguj</span>
          </button>
        </div>
      </div>
    </transition>

    <div v-if="menuOpen" class="fixed top-16 left-0 w-full bg-black z-30" @click="closeMenu"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import Avatar from '@/components/Avatar.vue';

export default {
  components: {
    Avatar,
  },
  data() {
    return {
      menuOpen: false,
      hoveredIndex: null,
      navItems: [
        {
          path: '/',
          label: 'Strona główna',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>',
        },
        {
          path: '/history',
          label: 'Historia',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path></svg>',
        },
        {
          path: '/questions',
          label: 'Lista pytań',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>`,
        },
        {
          path: '/user',
          label: 'Panel użytkownika',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"></path></svg>',
        },
        {
          path: '/admin',
          label: 'Panel administracyjny',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"></path></svg>',
        },
      ],
    };
  },
  computed: {
    ...mapGetters('user', ['getUser', 'isAuthenticated']),
    userName() {
      return this.getUser && this.getUser.login ? this.getUser.login : 'nieznany';
    },
    isAdmin() {
      return this.getUser?.rola === 'admin';
    },
  },
  methods: {
    ...mapActions('user', ['login']),
    logout() {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      this.$store.dispatch('user/logout');
      this.$router.push({ name: 'Login' }).then(() => {
        window.location.reload();
      });
    },
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
      // Blokada przewijania strony gdy menu jest otwarte
      document.body.style.overflow = this.menuOpen ? 'hidden' : '';
    },
    closeMenu() {
      this.menuOpen = false;
      document.body.style.overflow = '';
    },
  },
  watch: {
    $route() {
      this.closeMenu();
    },
  },
  beforeUnmount() {
    // Upewnij się, że przewijanie zostanie odblokowane po zniszczeniu komponentu
    document.body.style.overflow = '';
  },
};
</script>

<style>
/* Animacje - Tailwind's transition classes handle most of this, but if you have specific
   enter/leave states not fully covered by Tailwind's defaults, you might keep
   these or configure custom variants in tailwind.config.js. For now,
   I'll assume basic transform and opacity transitions are sufficient
   with Tailwind's built-in transition classes. */

/* If you need very specific enter/leave animations that Tailwind's utility
   classes don't directly provide, you might still need custom CSS or
   extend Tailwind's theme with custom transitions.
   For this example, I'm relying on Vue's transition component and
   generic Tailwind classes. */

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

.mobile-menu-enter-to,
.mobile-menu-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
