<template>
  <BaseModal :show="show" max-width="44rem" @close="close">
    <template #header>Szukaj i akcje</template>

    <div class="-mx-1">
      <label for="command-search" class="sr-only">Szukaj kategorii, pytania lub akcji</label>
      <div class="flex items-center gap-2 rounded-xl border px-3 py-2" style="border-color: var(--border-bento); background-color: var(--bg-subtle)">
        <svg class="h-4 w-4 shrink-0" style="color: var(--text-muted)" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" />
        </svg>
        <input
          id="command-search"
          ref="inputRef"
          v-model="query"
          type="search"
          autocomplete="off"
          class="min-w-0 flex-1 bg-transparent text-sm outline-hidden"
          placeholder="Kategoria, ID pytania lub akcja…"
          role="combobox"
          aria-controls="command-results"
          :aria-expanded="show"
          aria-autocomplete="list"
          @keydown.down.prevent="move(1)"
          @keydown.up.prevent="move(-1)"
          @keydown.enter.prevent="choose(activeItem, $event)"
        />
        <kbd class="hidden rounded-md border px-1.5 py-0.5 font-data text-[10px] sm:inline" style="border-color: var(--border-bento); color: var(--text-muted)">Esc</kbd>
      </div>

      <ul id="command-results" role="listbox" class="mt-3 max-h-[50vh] space-y-1 overflow-y-auto">
        <li
          v-for="(item, index) in results"
          :key="item.id"
          role="option"
          :aria-selected="index === activeIndex"
          class="cursor-pointer rounded-xl px-3 py-2.5 transition-colors"
          :style="index === activeIndex ? 'background-color: var(--accent-soft); color: var(--accent)' : ''"
          @mouseenter="activeIndex = index"
          @click="choose(item, $event)"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="min-w-0 truncate text-sm font-medium">{{ item.label }}</span>
            <span v-if="item.hint" class="shrink-0 text-[11px]" style="color: var(--text-muted)">{{ item.hint }}</span>
          </div>
        </li>
        <li v-if="results.length === 0" class="px-3 py-6 text-center text-sm" style="color: var(--text-muted)">
          Brak wyników dla „{{ query }}”.
        </li>
      </ul>

      <p class="mt-3 text-[11px]" style="color: var(--text-muted)">
        ↑↓ wybór · Enter otwórz · Shift+Enter szybki quiz z kategorii · Esc zamknij
      </p>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import BaseModal from '@/components/base/BaseModal.vue';

const props = defineProps({
  show: { type: Boolean, default: false },
});
const emit = defineEmits(['close']);

const router = useRouter();
const store = useStore();
const inputRef = ref(null);
const query = ref('');
const activeIndex = ref(0);

const normalize = (value) =>
  String(value || '')
    .toLocaleLowerCase('pl')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const categories = computed(() => {
  const list = store.getters['questions/getCategories'] || [];
  return [...list].sort((a, b) => a.localeCompare(b, 'pl'));
});

const isAdmin = computed(() => store.getters['user/getUser']?.rola === 'admin');

const actions = computed(() => {
  const list = [
    {
      id: 'theme',
      label: 'Przełącz motyw',
      hint: 'Wygląd',
      keywords: 'motyw ciemny jasny theme',
      run: () => {
        const next = store.state.ui?.theme === 'dark' ? 'light' : 'dark';
        store.dispatch('ui/setTheme', next);
      },
    },
    {
      id: 'shortcuts',
      label: 'Skróty klawiszowe',
      hint: '?',
      keywords: 'pomoc skroty klawiatura',
      run: () => window.dispatchEvent(new CustomEvent('open-shortcuts')),
    },
    {
      id: 'exam',
      label: 'Egzamin z ubiegłych lat',
      hint: 'Wybierz rocznik',
      keywords: 'egzamin rocznik',
      run: () => router.push({ path: '/', query: { exam: '1' } }),
    },
    {
      id: 'other',
      label: 'Quiz z pozostałych kategorii',
      hint: 'Szybki start',
      keywords: 'quiz inne kategorie',
      run: () => router.push({ path: '/', query: { otherQuiz: '1' } }),
    },
  ];

  if (isAdmin.value) {
    list.push({
      id: 'add-question',
      label: 'Dodaj pytanie',
      hint: 'Panel admina',
      keywords: 'nowe pytanie dodaj admin',
      run: () => router.push({ path: '/admin' }),
    });
  }

  return list;
});

const results = computed(() => {
  const q = normalize(query.value).trim();
  const out = [];

  if (/^\d+$/.test(q)) {
    out.push({
      id: 'question-id',
      label: `Otwórz pytanie #${q}`,
      hint: 'Baza pytań',
      run: () => router.push({ path: '/questions', query: { search: q } }),
    });
  }

  const matchingActions = actions.value.filter(
    (action) => !q || normalize(`${action.label} ${action.keywords || ''}`).includes(q)
  );
  out.push(...matchingActions);

  const matchingCategories = categories.value
    .filter((category) => !q || normalize(category).includes(q))
    .slice(0, 8)
    .map((category) => ({
      id: `cat:${category}`,
      label: category,
      hint: 'Kategoria',
      run: () =>
        router.push({
          name: 'CategoryQuestions',
          params: { category },
        }),
      runAlt: () =>
        router.push({
          name: 'QuizView',
          query: {
            categories: category,
            length: 20,
            r: Math.random().toString(36).slice(2, 8),
          },
        }),
    }));

  out.push(...matchingCategories);
  return out.slice(0, 14);
});

const activeItem = computed(() => results.value[activeIndex.value] || null);

watch(query, () => {
  activeIndex.value = 0;
});

watch(
  () => props.show,
  (visible) => {
    if (!visible) return;
    query.value = '';
    activeIndex.value = 0;
    // BaseModal przenosi fokus na dialog w nextTick — dopiero potem input.
    nextTick(() => {
      setTimeout(() => inputRef.value?.focus(), 30);
    });
  },
  { immediate: true }
);

function move(delta) {
  const total = results.value.length;
  if (total === 0) return;
  activeIndex.value = (activeIndex.value + delta + total) % total;
}

function choose(item, event) {
  if (!item) return;
  const useAlt = Boolean(event?.shiftKey) && typeof item.runAlt === 'function';
  (useAlt ? item.runAlt : item.run)();
  close();
}

function close() {
  emit('close');
}
</script>
