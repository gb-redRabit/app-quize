<template>
  <component
    :is="buttonTag"
    v-bind="buttonProps"
    :class="[
      // Podstawowe style Tailwind
      'relative overflow-hidden rounded-lg font-medium transition-all duration-200 flex items-center justify-center shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'active:translate-y-0.5 active:shadow',
      // Kolory solid
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
    ref="btnRef"
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
        class="absolute rounded-full bg-white bg-opacity-30 pointer-events-none animate-ripple"
        :style="{
          width: '100px',
          height: '100px',
          marginTop: '-50px',
          marginLeft: '-50px',
          top: `${rippleY}px`,
          left: `${rippleX}px`,
        }"
      ></span>
    </div>
  </component>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  color: {
    type: String,
    default: 'primary',
    validator: (value) =>
      [
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
        'blue',
        'green',
        'red',
        'purple',
      ].includes(value),
  },
  size: {
    type: String,
    default: 'md',
  },
  variant: {
    type: String,
    default: 'solid',
  },
  disabled: Boolean,
  loading: Boolean,
  type: {
    type: String,
    default: 'button',
  },
  tag: {
    type: String,
    default: 'button',
  },
  to: {
    type: [String, Object],
    default: null,
  },
  customClass: {
    type: [String, Array, Object],
    default: '',
  },
  ariaLabel: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['click']);

// Refs
const btnRef = ref(null);
const isClicking = ref(false);
const showRipple = ref(false);
const rippleX = ref(0);
const rippleY = ref(0);

// Computed
const buttonTag = computed(() => {
  return props.tag === 'router-link' ? 'router-link' : 'button';
});

const buttonProps = computed(() => {
  if (props.tag === 'router-link') {
    return { to: props.to, custom: false };
  }
  return { type: props.type };
});

const isButton = computed(() => {
  return props.tag !== 'router-link';
});

// Methods
function handleClick(event) {
  if (props.disabled || props.loading) {
    event.preventDefault();
    return;
  }
  if (isClicking.value) {
    event.preventDefault();
    return;
  }

  // Tworzenie efektu ripple
  createRipple(event);

  isClicking.value = true;
  emit('click', event);
  setTimeout(() => {
    isClicking.value = false;
  }, 300);
}

function createRipple(event) {
  const button = btnRef.value;
  const rect = button.getBoundingClientRect();

  rippleX.value = event.clientX - rect.left;
  rippleY.value = event.clientY - rect.top;

  showRipple.value = true;

  setTimeout(() => {
    showRipple.value = false;
  }, 600);
}

function focus() {
  btnRef.value && btnRef.value.focus();
}

function blur() {
  btnRef.value && btnRef.value.blur();
}

// Expose methods
defineExpose({
  focus,
  blur,
});
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

.animate-ripple {
  animation: ripple 0.6s linear;
}
</style>
