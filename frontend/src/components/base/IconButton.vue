<template>
  <button
    @click="handleClick"
    :type="type"
    class="z-10 bg-transparent cursor-pointer active:scale-95 rounded-full flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300"
    :class="[colorClass, sizeClass, { 'opacity-50 cursor-not-allowed': disabled }]"
    :disabled="disabled"
    :title="title || ''"
    :aria-label="title || ''"
  >
    <span class="pointer-events-none">
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue';

// Props z domyślnymi wartościami
const props = defineProps({
  color: { type: String, default: 'gray' },
  size: { type: String, default: 'md' },
  disabled: Boolean,
  title: String,
  type: { type: String, default: 'button' },
});

// Emits
const emit = defineEmits(['click']);

// Obliczone klasy dla kolorów
const colorClass = computed(() => {
  switch (props.color) {
    case 'red':
      return 'bg-red-100 hover:bg-red-300 text-red-700';
    case 'green':
      return 'bg-green-100 hover:bg-green-300 text-green-700';
    case 'blue':
      return 'bg-blue-100 hover:bg-blue-300 text-blue-700';
    case 'yellow':
      return 'bg-yellow-100 hover:bg-yellow-300 text-yellow-700';
    default:
      return 'bg-gray-200 hover:bg-gray-300 text-gray-700';
  }
});

// Obliczone klasy dla rozmiaru
const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-7 h-7 text-base';
    case 'lg':
      return 'w-12 h-12 text-2xl';
    default:
      return 'w-9 h-9 text-lg';
  }
});

// Metoda obsługi kliknięcia
function handleClick(event) {
  if (!props.disabled) {
    emit('click', event);
  }
}
</script>

<style scoped></style>
