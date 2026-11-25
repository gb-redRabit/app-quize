<template>
  <aside
    class="hidden xl:flex fixed inset-y-0 left-0 z-40 flex-col border-r border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 transition-[width] duration-200"
    :class="collapsed ? 'w-20' : 'w-60'"
    aria-label="Nawigacja główna"
  >
    <!-- Marka + zwijanie -->
    <div class="border-b border-gray-200/80 dark:border-gray-800 p-3" :class="collapsed ? 'px-2' : ''">
      <div class="flex items-center gap-2.5" :class="collapsed ? 'justify-center' : ''">
        <div
          class="h-9 w-9 shrink-0 rounded-xl bg-blue-600 text-white grid place-items-center text-sm font-bold shadow-sm"
          aria-hidden="true"
        >
          Q
        </div>
        <div v-if="!collapsed" class="min-w-0">
          <p class="text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            Quiz App
          </p>
          <p class="text-[11px] text-gray-500 dark:text-gray-400">Nauka prawa</p>
        </div>
      </div>
      <button
        type="button"
        class="mt-2 w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        :class="collapsed ? 'justify-center' : ''"
        :aria-label="collapsed ? 'Rozwiń panel nawigacji' : 'Zwiń panel nawigacji'"
        :aria-expanded="!collapsed"
        @click="toggle"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 shrink-0 transition-transform duration-200"
          :class="collapsed ? 'rotate-180' : ''"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span v-if="!collapsed">Zwiń panel</span>
      </button>
    </div>

    <!-- Linki -->
    <nav class="flex-1 overflow-y-auto p-2.5 space-y-1">
      <router-link
        v-for="item in visibleNavItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-colors"
        :class="[
          isActive(item)
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100',
          collapsed ? 'justify-center px-0' : 'px-3',
        ]"
        :title="collapsed ? item.label : undefined"
        :aria-current="isActive(item) ? 'page' : undefined"
      >
        <component :is="item.icon" class="h-5 w-5 shrink-0" />
        <span :class="collapsed ? 'sr-only' : 'truncate'">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Użytkownik + wylogowanie -->
    <div class="p-2.5 border-t border-gray-200/80 dark:border-gray-800 space-y-2">
      <div
        class="flex items-center gap-2.5 rounded-xl p-2"
        :class="collapsed ? 'justify-center' : 'bg-gray-50 dark:bg-gray-800/60'"
      >
        <Avatar :avatar-index="user?.avatar || 0" :color="user?.avatarColors || ''" :size="36" />
        <div v-if="!collapsed" class="min-w-0">
          <p class="text-sm font-semibold truncate capitalize text-gray-900 dark:text-gray-100">
            {{ userName }}
          </p>
          <p class="text-[11px] text-gray-500 dark:text-gray-400">
            {{ isAdmin ? 'Administrator' : 'Uczeń' }}
          </p>
        </div>
      </div>

      <button
        type="button"
        class="w-full flex items-center gap-2 rounded-lg py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-300 transition-colors"
        :class="collapsed ? 'justify-center px-0' : 'px-3'"
        aria-label="Wyloguj"
        :title="collapsed ? 'Wyloguj' : undefined"
        @click="logout"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        <span v-if="!collapsed">Wyloguj</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import Avatar from '@/components/base/Avatar.vue';
import { NAV_ITEMS } from './navIcons';
import { useLogout } from '@/composables/useLogout';
import { useSidebar } from '@/composables/useSidebar';

const route = useRoute();
const store = useStore();
const logout = useLogout();
const { collapsed, toggle } = useSidebar();

const user = computed(() => store.getters['user/getUser'] || {});
const isAdmin = computed(() => user.value?.rola === 'admin');
const userName = computed(() => user.value?.login || 'nieznany');
const visibleNavItems = computed(() =>
  NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin.value)
);

function isActive(item) {
  if (item.path === '/') return route.path === '/';
  return route.path === item.path || route.path.startsWith(`${item.path}/`);
}
</script>
