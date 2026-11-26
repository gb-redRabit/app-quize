<template>
  <aside
    class="hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col border-r transition-[width] duration-200"
    :class="collapsed ? 'w-[76px]' : 'w-[248px]'"
    style="background-color: var(--bg-bento); border-color: var(--border-bento)"
    aria-label="Nawigacja główna"
  >
    <!-- Marka + zwijanie -->
    <div class="p-3" :class="collapsed ? 'px-2' : ''" style="border-bottom: 1px solid var(--border-bento)">
      <div class="flex items-center gap-2.5" :class="collapsed ? 'justify-center' : ''">
        <div
          class="h-9 w-9 shrink-0 rounded-xl text-white grid place-items-center text-sm font-bold shadow-sm"
          style="background-color: var(--accent)"
          aria-hidden="true"
        >
          Q
        </div>
        <div v-if="!collapsed" class="min-w-0">
          <p class="text-sm font-semibold tracking-tight" style="color: var(--text-primary)">
            Quiz App
          </p>
          <p class="text-[11px]" style="color: var(--text-muted)">Nauka prawa</p>
        </div>
      </div>
      <button
        type="button"
        class="mt-2 w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
        :class="collapsed ? 'justify-center' : ''"
        style="color: var(--text-muted)"
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

    <!-- Linki w sekcjach -->
    <nav class="flex-1 overflow-y-auto p-2.5 space-y-4">
      <div v-for="group in navGroups" :key="group.label" class="space-y-1">
        <p
          v-if="!collapsed"
          class="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
          style="color: var(--text-muted)"
        >
          {{ group.label }}
        </p>
        <router-link
          v-for="item in group.items"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-colors"
          :class="[
            isActive(item) ? 'font-semibold' : 'hover:bg-black/5 dark:hover:bg-white/5',
            collapsed ? 'justify-center px-0' : 'px-3',
          ]"
          :style="
            isActive(item)
              ? 'background-color: var(--accent-soft); color: var(--accent)'
              : 'color: var(--text-muted)'
          "
          :title="collapsed ? item.label : undefined"
          :aria-current="isActive(item) ? 'page' : undefined"
        >
          <component :is="item.icon" class="h-5 w-5 shrink-0" />
          <span :class="collapsed ? 'sr-only' : 'truncate'">{{ item.label }}</span>
        </router-link>
      </div>
    </nav>

    <!-- Użytkownik + wylogowanie -->
    <div class="p-2.5 space-y-2" style="border-top: 1px solid var(--border-bento)">
      <div
        class="flex items-center gap-2.5 rounded-xl p-2"
        :class="collapsed ? 'justify-center' : ''"
        :style="collapsed ? '' : 'background-color: var(--bg-subtle)'"
      >
        <Avatar :avatar-index="user?.avatar || 0" :color="user?.avatarColors || ''" :size="36" />
        <div v-if="!collapsed" class="min-w-0">
          <p class="text-sm font-semibold truncate capitalize" style="color: var(--text-primary)">
            {{ userName }}
          </p>
          <p class="text-[11px]" style="color: var(--text-muted)">
            {{ isAdmin ? 'Administrator' : 'Uczeń' }}
          </p>
        </div>
      </div>

      <button
        type="button"
        class="w-full flex items-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-300"
        :class="collapsed ? 'justify-center px-0' : 'px-3'"
        style="color: var(--text-muted)"
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
const navGroups = computed(() => {
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin.value);
  return [
    { label: 'Nauka', items: items.filter((item) => !item.adminOnly) },
    { label: 'Administracja', items: items.filter((item) => item.adminOnly) },
  ].filter((group) => group.items.length > 0);
});

function isActive(item) {
  if (item.path === '/') return route.path === '/';
  return route.path === item.path || route.path.startsWith(`${item.path}/`);
}
</script>
