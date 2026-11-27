<template>
  <header
    class="group pointer-events-none fixed right-0 top-0 z-20 hidden lg:block"
    style="left: var(--sidebar-width, 248px)"
  >
    <!-- Strefa hover przy górnej krawędzi obszaru roboczego -->
    <div class="pointer-events-auto h-3 w-full" aria-hidden="true"></div>

    <div
      class="bento-glass pointer-events-auto mx-4 mt-1 flex -translate-y-[160%] items-center gap-2 px-3 py-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 focus-within:translate-y-0 focus-within:opacity-100 lg:mx-8"
    >
      <button
        type="button"
        class="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-1.5 text-left text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
        style="color: var(--text-muted)"
        @click="openPalette"
      >
        <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m21 21-4.35-4.35M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
          />
        </svg>
        <span class="truncate">Szukaj kategorii, ID pytania lub akcji…</span>
        <kbd
          class="ml-auto hidden shrink-0 rounded-md border px-1.5 py-0.5 font-data text-[10px] sm:inline"
          style="border-color: var(--border-bento); color: var(--text-muted)"
        >
          {{ shortcutLabel }}
        </kbd>
      </button>

      <button
        type="button"
        class="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
        style="color: var(--text-muted)"
        aria-label="Skróty klawiszowe"
        title="Skróty klawiszowe (?)"
        @click="openShortcuts"
      >
        ?
      </button>
    </div>
  </header>
</template>

<script setup>
const isApple =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || '');
const shortcutLabel = isApple ? '⌘K' : 'Ctrl K';

function openPalette() {
  window.dispatchEvent(new CustomEvent('open-command-palette'));
}

function openShortcuts() {
  window.dispatchEvent(new CustomEvent('open-shortcuts'));
}
</script>
