<template>
  <div
    class="nav w-full lg:hidden z-30 transition-all duration-300"
    :class="{
      relative: !isFixed,
      'fixed top-0 left-0 right-0 animate-slide-down': isFixed,
    }"
  >
    <nav
      aria-label="Nawigacja główna"
      class="relative z-40 mb-4 flex items-center justify-between gap-3 border-b px-4 py-2.5 backdrop-blur-md"
      style="background-color: var(--bg-glass); border-color: var(--border-bento)"
    >
      <div class="flex min-w-0 items-center gap-2.5">
        <Avatar :avatar-index="user?.avatar || 0" :color="user?.avatarColors || ''" :size="36" />
        <h1 class="truncate text-base font-semibold tracking-tight" style="color: var(--text-primary)">
          {{ userName }}
        </h1>
      </div>

      <div class="flex items-center gap-1">
        <button
          type="button"
          class="grid h-9 w-9 place-items-center rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style="color: var(--text-muted)"
          aria-label="Szukaj i akcje (Ctrl+K)"
          @click="openCommandPalette"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m21 21-4.35-4.35M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
            />
          </svg>
        </button>
      </div>
    </nav>
  </div>

  <!-- Placeholder div, aby zapobiec skakaniu zawartości podczas przełączania na fixed navbar -->
  <div v-if="isFixed" class="lg:hidden" style="width: 100%; height: 68px"></div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import Avatar from '@/components/base/Avatar.vue';

const store = useStore();

// Reaktywne zmienne
const isFixed = ref(false);
const scrollThreshold = 300;
const scrollY = ref(0);
const ticking = ref(false);

// Właściwości computed
const user = computed(() => store.state.user.user);
const userName = computed(() => user.value?.login || 'nieznany');

function openCommandPalette() {
  window.dispatchEvent(new CustomEvent('open-command-palette'));
}

function handleScroll() {
  scrollY.value = window.scrollY;

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
