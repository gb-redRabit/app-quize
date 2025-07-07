<template>
  <component
    :is="buttonTag"
    v-bind="buttonProps"
    :class="[
      'base-button',
      `base-button-${color}`,
      `base-button-${size}`,
      {
        'base-button-disabled': disabled || loading,
        'base-button-outline': variant === 'outline',
        'base-button-ghost': variant === 'ghost',
      },
      customClass,
    ]"
    :disabled="isButton && (disabled || loading)"
    :aria-label="ariaLabel"
    @click="handleClick"
    ref="btn"
    tabindex="0"
  >
    <div class="btn-content">
      <span v-if="loading" class="btn-loader"></span>
      <slot name="icon"></slot>
      <span v-if="$slots.default" class="btn-text">
        <slot></slot>
      </span>
      <span v-if="showRipple" class="ripple" :style="rippleStyle"></span>
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
.base-button {
  @apply relative overflow-hidden rounded-lg font-medium transition-all duration-200 flex items-center justify-center;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.06);
  transform: translateY(0);
}

.base-button:focus-visible {
  @apply outline-none ring-2 ring-offset-2;
}

.base-button:active:not(.base-button-disabled) {
  transform: translateY(1px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Warianty przycisków */
.base-button-solid {
  @apply text-white;
}

/* Kolory dla wariantu solid */
.base-button-blue:not(.base-button-outline):not(.base-button-ghost) {
  background: linear-gradient(to right, #3b82f6, #60a5fa);
  @apply hover:shadow-md;
}

.base-button-blue:not(.base-button-outline):not(.base-button-ghost):hover {
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
}

.base-button-green:not(.base-button-outline):not(.base-button-ghost) {
  background: linear-gradient(to right, #10b981, #34d399);
  @apply hover:shadow-md;
}

.base-button-green:not(.base-button-outline):not(.base-button-ghost):hover {
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
}

.base-button-red:not(.base-button-outline):not(.base-button-ghost) {
  background: linear-gradient(to right, #ef4444, #f87171);
  @apply hover:shadow-md;
}

.base-button-red:not(.base-button-outline):not(.base-button-ghost):hover {
  box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2);
}

.base-button-yellow:not(.base-button-outline):not(.base-button-ghost) {
  background: linear-gradient(to right, #f59e0b, #fbbf24);
  @apply hover:shadow-md;
}

.base-button-yellow:not(.base-button-outline):not(.base-button-ghost):hover {
  box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.2);
}

.base-button-gray:not(.base-button-outline):not(.base-button-ghost) {
  background: linear-gradient(to right, #6b7280, #9ca3af);
  @apply hover:shadow-md;
}

.base-button-gray:not(.base-button-outline):not(.base-button-ghost):hover {
  box-shadow: 0 4px 6px -1px rgba(107, 114, 128, 0.2);
}

.base-button-purple:not(.base-button-outline):not(.base-button-ghost) {
  background: linear-gradient(to right, #8b5cf6, #a78bfa);
  @apply hover:shadow-md;
}

.base-button-purple:not(.base-button-outline):not(.base-button-ghost):hover {
  box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.2);
}

/* Wariant outline */
.base-button-outline {
  @apply border-2 bg-white shadow-sm;
}

.base-button-outline.base-button-blue {
  @apply border-blue-500 text-blue-600 hover:bg-blue-50;
}

.base-button-outline.base-button-green {
  @apply border-green-500 text-green-600 hover:bg-green-50;
}

.base-button-outline.base-button-red {
  @apply border-red-500 text-red-600 hover:bg-red-50;
}

.base-button-outline.base-button-yellow {
  @apply border-yellow-500 text-yellow-600 hover:bg-yellow-50;
}

.base-button-outline.base-button-gray {
  @apply border-gray-500 text-gray-600 hover:bg-gray-50;
}

.base-button-outline.base-button-purple {
  @apply border-purple-500 text-purple-600 hover:bg-purple-50;
}

/* Wariant ghost */
.base-button-ghost {
  @apply bg-transparent shadow-none;
}

.base-button-ghost.base-button-blue {
  @apply text-blue-600 hover:bg-blue-50;
}

.base-button-ghost.base-button-green {
  @apply text-green-600 hover:bg-green-50;
}

.base-button-ghost.base-button-red {
  @apply text-red-600 hover:bg-red-50;
}

.base-button-ghost.base-button-yellow {
  @apply text-yellow-600 hover:bg-yellow-50;
}

.base-button-ghost.base-button-gray {
  @apply text-gray-600 hover:bg-gray-50;
}

.base-button-ghost.base-button-purple {
  @apply text-purple-600 hover:bg-purple-50;
}

/* Rozmiary */
.base-button-sm {
  @apply px-3 py-1.5 text-xs;
}

.base-button-md {
  @apply px-4 py-2 text-sm;
}

.base-button-lg {
  @apply px-6 py-2.5 text-base;
}

.base-button-xl {
  @apply px-8 py-3 text-lg;
}

/* Stan disabled */
.base-button-disabled {
  @apply opacity-60 cursor-not-allowed shadow-none;
  transform: none !important;
}

/* Zawartość przycisku */
.btn-content {
  @apply flex items-center justify-center relative z-10;
}

/* Poprawka: usunięcie first:ml-0 i zastąpienie standardowym CSS */
.btn-text {
  @apply ml-2;
}

.btn-text:first-child {
  margin-left: 0;
}

/* Loader - nowoczesna animacja */
.btn-loader {
  @apply inline-block w-4 h-4 mr-2 rounded-full;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-left-color: currentColor;
  animation: spin 0.8s linear infinite;
}

.base-button-outline .btn-loader,
.base-button-ghost .btn-loader {
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-left-color: currentColor;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Efekt Ripple */
.ripple {
  @apply absolute rounded-full bg-white bg-opacity-30;
  width: 100px;
  height: 100px;
  margin-top: -50px;
  margin-left: -50px;
  animation: ripple 0.6s linear;
  pointer-events: none;
}

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

/* Dodane wsparcie dla ciemnego motywu */
[data-theme='dark'] .base-button-outline {
  @apply bg-gray-800;
}

[data-theme='dark'] .base-button-ghost {
  @apply hover:bg-gray-800;
}
</style>
