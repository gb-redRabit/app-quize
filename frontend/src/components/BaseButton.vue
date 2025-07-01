<template>
  <component
    :is="buttonTag"
    v-bind="buttonProps"
    :class="[
      'rounded',
      'font-semibold',
      'transition',
      'flex',
      'items-center',
      'justify-center',
      colorClass,
      sizeClass,
      { 'opacity-50': disabled || loading, 'cursor-not-allowed': disabled || loading },
      customClass,
    ]"
    :disabled="isButton && (disabled || loading)"
    :aria-label="ariaLabel"
    @click="handleClick"
    ref="btn"
    tabindex="0"
  >
    <slot name="icon" />
    <span v-if="loading" class="loader mr-2"></span>
    <slot />
  </component>
</template>

<script>
export default {
  // KLUCZOWA ZMIANA: Deklarujemy, że komponent emituje zdarzenie 'click'.
  // To powstrzymuje Vue przed automatycznym dodawaniem drugiego nasłuchiwacza.
  emits: ['click'],

  props: {
    color: { type: String, default: 'blue' },
    size: { type: String, default: 'md' },
    disabled: Boolean,
    loading: Boolean,
    type: { type: String, default: 'button' },
    tag: { type: String, default: 'button' },
    to: { type: [String, Object], default: null },
    customClass: { type: [String, Array, Object], default: '' },
    ariaLabel: { type: String, default: '' },
  },
  data() {
    return {
      isClicking: false, // Prosta flaga do blokowania wielokrotnych kliknięć
    };
  },
  computed: {
    buttonTag() {
      return this.tag === 'router-link' ? 'router-link' : 'button';
    },
    buttonProps() {
      if (this.tag === 'router-link') {
        return { to: this.to, custom: false };
      }
      return { type: this.type };
    },
    isButton() {
      return this.tag !== 'router-link';
    },
    colorClass() {
      switch (this.color) {
        case 'green':
          return 'bg-green-500 hover:bg-green-600 text-white';
        case 'red':
          return 'bg-red-500 hover:bg-red-600 text-white';
        case 'yellow':
          return 'bg-yellow-500 hover:bg-yellow-600 text-white';
        case 'gray':
          return 'bg-gray-500 hover:bg-gray-600 text-white';
        case 'purple':
          return 'bg-purple-500 hover:bg-purple-600 text-white';
        default:
          return 'bg-blue-500 hover:bg-blue-600 text-white';
      }
    },
    sizeClass() {
      switch (this.size) {
        case 'sm':
          return 'px-2 py-1 text-sm';
        case 'lg':
          return 'px-6 py-3 text-lg';
        case 'xl':
          return 'px-8 py-4 text-2xl';
        default:
          return 'px-4 py-2';
      }
    },
  },
  methods: {
    handleClick(event) {
      if (this.disabled || this.loading) {
        event.preventDefault();
        return;
      }
      if (this.isClicking) {
        event.preventDefault();
        return;
      }
      this.isClicking = true;
      this.$emit('click', event);
      setTimeout(() => {
        this.isClicking = false;
      }, 300);
    },
    focus() {
      this.$refs.btn && this.$refs.btn.focus();
    },
    blur() {
      this.$refs.btn && this.$refs.btn.blur();
    },
  },
};
</script>

<style scoped>
.loader {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  width: 1em;
  height: 1em;
  animation: spin 1s linear infinite;
  display: inline-block;
  vertical-align: middle;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
