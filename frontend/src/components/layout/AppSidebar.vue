<template>
  <aside
    class="hidden xl:flex fixed inset-y-0 left-0 z-40 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-[width] duration-200"
    :class="collapsed ? 'w-20' : 'w-60'"
    aria-label="Nawigacja główna"
  >
    <!-- Użytkownik -->
    <div
      class="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800"
      :class="collapsed ? 'justify-center p-3' : 'p-5'"
    >
      <Avatar :avatar-index="user?.avatar || 0" :color="user?.avatarColors || ''" :size="40" />
      <div v-if="!collapsed" class="min-w-0">
        <p class="font-semibold truncate capitalize text-gray-800 dark:text-gray-100">
          {{ userName }}
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {{ isAdmin ? 'Administrator' : 'Uczeń' }}
        </p>
      </div>
    </div>

    <!-- Linki -->
    <nav class="flex-1 overflow-y-auto p-3 space-y-1">
      <router-link
        v-for="item in visibleNavItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
        :class="[
          isActive(item)
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
            : 'text-gray-600 hover:bg-gray-100 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-300',
          collapsed ? 'justify-center px-0' : 'px-3',
        ]"
        :title="collapsed ? item.label : undefined"
        :aria-current="isActive(item) ? 'page' : undefined"
      >
        <component :is="item.icon" class="h-5 w-5 shrink-0" />
        <span :class="collapsed ? 'sr-only' : 'truncate'">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Zwijanie + wylogowanie -->
    <div class="p-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
      <button
        type="button"
        class="w-full flex items-center gap-2 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        :class="collapsed ? 'justify-center px-0' : 'px-3'"
        :aria-label="collapsed ? 'Rozwiń panel nawigacji' : 'Zwiń panel nawigacji'"
        :aria-expanded="!collapsed"
        :title="collapsed ? 'Rozwiń panel nawigacji' : undefined"
        @click="toggle"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 shrink-0 transition-transform duration-200"
          :class="collapsed ? 'rotate-180' : ''"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span v-if="!collapsed">Zwiń panel</span>
      </button>

      <button
        type="button"
        class="w-full flex items-center gap-2 py-2.5 rounded-lg text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
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
