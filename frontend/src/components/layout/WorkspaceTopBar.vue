<template>
  <header class="sticky top-0 z-20 hidden px-4 pt-4 lg:block lg:px-8">
    <div class="bento-glass flex items-center gap-2 px-3 py-2">
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
