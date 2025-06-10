<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed left-0 right-0 top-0 z-50"
      style="pointer-events: none"
    >
      <div class="w-full h-1 bg-blue-200">
        <div
          class="h-full bg-blue-500 animate-loader-bar"
          :style="{ width: progress + '%' }"
        ></div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    show: { type: Boolean, default: true },
    progress: { type: Number, default: 80 }, // Możesz sterować szerokością paska
  },
};
</script>

<style scoped>
@keyframes loader-bar {
  0% {
    width: 0%;
  }
  80% {
    width: 80%;
  }
  100% {
    width: 100%;
  }
}
.animate-loader-bar {
  animation: loader-bar 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
