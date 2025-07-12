<template>
  <component
    :is="buttonTag"
    v-bind="buttonProps"
    :class="[
      // Podstawowe style Tailwind
      'relative overflow-hidden rounded-lg font-medium transition-all duration-200 flex items-center justify-center shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'active:translate-y-0.5 active:shadow',
      // Kolory solid - bez gradientów, tylko jeden kolor
      color === 'blue' && variant === 'solid' ? 'bg-blue-500 text-white hover:bg-blue-600' : '',
      color === 'green' && variant === 'solid' ? 'bg-green-500 text-white hover:bg-green-600' : '',
      color === 'red' && variant === 'solid' ? 'bg-red-500 text-white hover:bg-red-600' : '',
      color === 'yellow' && variant === 'solid'
        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
        : '',
      color === 'gray' && variant === 'solid' ? 'bg-gray-600 text-white hover:bg-gray-700' : '',
      color === 'purple' && variant === 'solid'
        ? 'bg-purple-500 text-white hover:bg-purple-600'
        : '',
      // Outline
      variant === 'outline' ? 'border-2 bg-white shadow-sm' : '',
      variant === 'outline' && color === 'blue'
        ? 'border-blue-500 text-blue-600 hover:bg-blue-50 dark:bg-gray-800'
        : '',
      variant === 'outline' && color === 'green'
        ? 'border-green-500 text-green-600 hover:bg-green-50 dark:bg-gray-800'
        : '',
      variant === 'outline' && color === 'red'
        ? 'border-red-500 text-red-600 hover:bg-red-50 dark:bg-gray-800'
        : '',
      variant === 'outline' && color === 'yellow'
        ? 'border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:bg-gray-800'
        : '',
      variant === 'outline' && color === 'gray'
        ? 'border-gray-500 text-gray-600 hover:bg-gray-50 dark:bg-gray-800'
        : '',
      variant === 'outline' && color === 'purple'
        ? 'border-purple-500 text-purple-600 hover:bg-purple-50 dark:bg-gray-800'
        : '',
      // Ghost
      variant === 'ghost' ? 'bg-transparent shadow-none' : '',
      variant === 'ghost' && color === 'blue'
        ? 'text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800'
        : '',
      variant === 'ghost' && color === 'green'
        ? 'text-green-600 hover:bg-green-50 dark:hover:bg-gray-800'
        : '',
      variant === 'ghost' && color === 'red'
        ? 'text-red-600 hover:bg-red-50 dark:hover:bg-gray-800'
        : '',
      variant === 'ghost' && color === 'yellow'
        ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-gray-800'
        : '',
      variant === 'ghost' && color === 'gray'
        ? 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
        : '',
      variant === 'ghost' && color === 'purple'
        ? 'text-purple-600 hover:bg-purple-50 dark:hover:bg-gray-800'
        : '',
      // Rozmiary
      size === 'sm' ? 'px-3 py-1.5 text-xs' : '',
      size === 'md' ? 'px-4 py-2 text-sm' : '',
      size === 'lg' ? 'px-6 py-2.5 text-base' : '',
      size === 'xl' ? 'px-8 py-3 text-lg' : '',
      // Disabled
      disabled || loading ? 'opacity-60 cursor-not-allowed shadow-none pointer-events-none' : '',
      customClass,
    ]"
    :disabled="isButton && (disabled || loading)"
    :aria-label="ariaLabel"
    @click="handleClick"
    ref="btn"
    tabindex="0"
  >
    <div class="flex items-center justify-center relative z-10">
      <span
        v-if="loading"
        class="inline-block w-4 h-4 mr-2 rounded-full border-2 border-white/30 border-l-current animate-spin"
      ></span>
      <slot name="icon"></slot>
      <span v-if="$slots.default">
        <slot></slot>
      </span>
      <span
        v-if="showRipple"
        class="absolute rounded-full bg-white bg-opacity-30 w-[100px] h-[100px] -mt-[50px] -ml-[50px] pointer-events-none animate-[ripple_0.6s_linear]"
        :style="rippleStyle"
      ></span>
    </div>
  </component>
</template>

<script>
export default {
  name: 'BaseButton',
  emits: ['click'],
  props: {
    color: {
      type: String,
      default: 'primary',
      validator: (value) => {
        return [
          'primary',
          'secondary',
          'success',
          'danger',
          'warning',
          'info',
          'light',
          'dark',
          'link',
          'yellow',
          'gray',
          // Dodane brakujące kolory
          'blue',
          'green',
          'red',
          'purple',
        ].includes(value);
      },
    },
    // pozostałe propsy bez zmian
    size: { type: String, default: 'md' },
    variant: { type: String, default: 'solid' },
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
      isClicking: false,
      showRipple: false,
      rippleX: 0,
      rippleY: 0,
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
    rippleStyle() {
      return {
        top: `${this.rippleY}px`,
        left: `${this.rippleX}px`,
      };
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

      // Tworzenie efektu ripple
      this.createRipple(event);

      this.isClicking = true;
      this.$emit('click', event);
      setTimeout(() => {
        this.isClicking = false;
      }, 300);
    },

    createRipple(event) {
      const button = this.$refs.btn;
      const rect = button.getBoundingClientRect();

      this.rippleX = event.clientX - rect.left;
      this.rippleY = event.clientY - rect.top;

      this.showRipple = true;

      setTimeout(() => {
        this.showRipple = false;
      }, 600);
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
@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 0.4;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}
</style>
