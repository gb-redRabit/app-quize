<template>
  <button
    :class="[
      'rounded-full flex items-center justify-center transition',
      colorClass,
      sizeClass,
      { 'opacity-50 cursor-not-allowed': disabled },
    ]"
    :disabled="disabled"
    @click.stop="$emit('click', $event)"
    :title="title"
    :type="type"
  >
    <slot />
  </button>
</template>

<script>
export default {
  props: {
    color: { type: String, default: 'gray' },
    size: { type: String, default: 'md' },
    disabled: Boolean,
    title: String,
    type: { type: String, default: 'button' },
  },
  computed: {
    colorClass() {
      switch (this.color) {
        case 'red':
          return 'bg-red-100 hover:bg-red-300 text-red-700';
        case 'green':
          return 'bg-green-100 hover:bg-green-300 text-green-700';
        case 'blue':
          return 'bg-blue-100 hover:bg-blue-300 text-blue-700';
        default:
          return 'bg-gray-200 hover:bg-gray-300 text-gray-700';
      }
    },
    sizeClass() {
      switch (this.size) {
        case 'sm':
          return 'w-7 h-7 text-base';
        case 'lg':
          return 'w-12 h-12 text-2xl';
        default:
          return 'w-9 h-9 text-lg';
      }
    },
  },
};
</script>
