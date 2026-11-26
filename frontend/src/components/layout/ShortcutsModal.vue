<template>
  <BaseModal :show="show" @close="$emit('close')">
    <template #header>Skróty klawiszowe</template>
    <div class="text-sm text-gray-700 dark:text-gray-200">
      <p class="text-gray-500 dark:text-gray-400">
        Skróty działają poza polem tekstowym i poza quizem/egzaminem.
      </p>
      <dl class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        <div
          v-for="item in shortcuts"
          :key="item.keys"
          class="flex items-start justify-between gap-3"
        >
          <dt class="min-w-0">
            <span class="block text-gray-800 dark:text-gray-100">{{ item.label }}</span>
            <span v-if="item.hint" class="block text-xs text-gray-500 dark:text-gray-400">
              {{ item.hint }}
            </span>
          </dt>
          <dd class="shrink-0">
            <kbd
              class="inline-flex items-center rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 text-xs font-mono text-gray-700 dark:text-gray-200"
            >
              {{ item.keys }}
            </kbd>
          </dd>
        </div>
      </dl>
    </div>
    <template #footer>
      <BaseButton color="gray" @click="$emit('close')">Zamknij</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/components/base/BaseModal.vue';
import BaseButton from '@/components/base/BaseButton.vue';

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['close']);

const shortcuts = [
  { keys: '?', label: 'Pomoc / skróty', hint: 'Otwiera tę listę' },
  { keys: 'g h', label: 'Strona główna' },
  { keys: 'g q', label: 'Lista pytań' },
  { keys: 'g p', label: 'Panel użytkownika' },
  { keys: 'g a', label: 'Panel administratora', hint: 'Tylko dla admina' },
  { keys: '/', label: 'Szukaj pytań', hint: 'Na liście pytań' },
  { keys: 'N', label: 'Nowe pytanie', hint: 'W panelu admina' },
  { keys: 'Esc', label: 'Zamknij okno / wróć' },
];
</script>
