<template>
  <div v-if="visible" class="fixed top-0 left-0 w-full z-50 pointer-events-none">
    <transition name="loader-fade">
      <div class="w-full bg-transparent" style="height: 3px">
        <div class="w-full h-full relative overflow-hidden">
          <div class="h-full w-full loading-bar-progress"></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const visible = ref(false);

function show() {
  visible.value = true;
}

function hide() {
  visible.value = false;
}

// Eksport metod, aby były dostępne z zewnątrz (wymagane do zachowania kompatybilności)
defineExpose({
  show,
  hide,
  reset: hide, // Zachowanie metody reset dla kompatybilności
});
</script>

<style scoped>
/* Gradient i animacja, których nie można łatwo uzyskać za pomocą klas Tailwind */
.loading-bar-progress {
  background: linear-gradient(
    to right,
    var(--color-primary-dark, #4f46e5),
    var(--color-primary, #6366f1),
    var(--color-primary-light, #818cf8)
  );
  animation: loading-gradient 2s linear infinite;
}
@keyframes loading-gradient {
  0% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.7;
  }
}

/* Animacja dla transition */
.loader-fade-enter-active,
.loader-fade-leave-active {
  transition: opacity 0.3s;
}
.loader-fade-enter-from,
.loader-fade-leave-to {
  opacity: 0;
}
</style>
