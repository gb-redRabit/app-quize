<template>
  <header class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div class="min-w-0">
      <p v-if="eyebrow" class="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
        {{ eyebrow }}
      </p>
      <h1 class="mt-1 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 sm:text-3xl">
        <slot name="title">{{ title }}</slot>
      </h1>
      <p v-if="subtitle || $slots.subtitle" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        <slot name="subtitle">{{ subtitle }}</slot>
      </p>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2 shrink-0">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
});
</script>
