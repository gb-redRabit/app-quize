<template>
  <nav
    class="fixed inset-x-3 bottom-3 z-30 mx-auto flex max-w-md items-center justify-around gap-1 rounded-2xl border px-2 py-1.5 shadow-lg backdrop-blur-md lg:hidden"
    style="background-color: var(--bg-glass); border-color: var(--border-bento); padding-bottom: max(0.375rem, env(safe-area-inset-bottom))"
    aria-label="Nawigacja mobilna"
  >
    <router-link
      v-for="item in items"
      :key="item.path"
      :to="item.path"
      class="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors"
      :style="
        isActive(item)
          ? 'background-color: var(--accent-soft); color: var(--accent)'
          : 'color: var(--text-muted)'
      "
      :aria-current="isActive(item) ? 'page' : undefined"
    >
      <component :is="item.icon" class="h-5 w-5" />
      <span class="truncate max-w-full">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed, h } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

const route = useRoute();
const store = useStore();

const user = computed(() => store.getters['user/getUser'] || {});
const isAdmin = computed(() => user.value.rola === 'admin');

// Ikony jako funkcje renderujące — bez runtime compilera Vue.
const makeIcon = (props, children) => ({
  render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', ...props }, children),
});
const path = (props) => h('path', props);
const commonProps = {
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
  class: 'h-6 w-6',
};
const pathProps = {
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'stroke-width': '1.8',
};

const HomeIcon = makeIcon(commonProps, [
  path({ ...pathProps, d: 'M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5Z' }),
]);
const HistoryIcon = makeIcon(commonProps, [
  path({ ...pathProps, d: 'M12 8v4l3 2m6-2a9 9 0 1 1-3.2-6.9' }),
]);
const ListIcon = makeIcon(commonProps, [
  path({ ...pathProps, d: 'M4 6h16M4 12h16M4 18h16' }),
]);
const UserIcon = makeIcon(commonProps, [
  path({ ...pathProps, d: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21a8 8 0 0 1 16 0' }),
]);
const AdminIcon = makeIcon(commonProps, [
  path({
    ...pathProps,
    d: 'M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Zm0 5v4m0 4h.01',
  }),
]);

const items = computed(() => {
  const base = [
    { path: '/', label: 'Start', icon: HomeIcon },
    { path: '/history', label: 'Historia', icon: HistoryIcon },
    { path: '/questions', label: 'Pytania', icon: ListIcon },
    { path: '/user', label: 'Profil', icon: UserIcon },
  ];
  if (isAdmin.value) {
    base.push({ path: '/admin', label: 'Admin', icon: AdminIcon });
  }
  return base;
});

function isActive(item) {
  if (item.path === '/') return route.path === '/';
  return route.path === item.path || route.path.startsWith(`${item.path}/`);
}
</script>
