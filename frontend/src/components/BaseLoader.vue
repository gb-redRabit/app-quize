<template>
  <div v-if="visible" class="loader-container">
    <transition name="loader-fade">
      <div class="loading-bar-container">
        <div class="loading-bar">
          <div class="loading-bar-progress"></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'BaseLoader',
  data() {
    return {
      visible: false,
    };
  },
  methods: {
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    reset() {
      this.visible = false;
    },
  },
};
</script>

<style scoped>
.loader-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  z-index: 9999;
  pointer-events: none;
}
.loading-bar-container {
  width: 100%;
  height: 3px;
  background: transparent;
}
.loading-bar {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
.loading-bar-progress {
  height: 100%;
  width: 100%;
  background: linear-gradient(
    to right,
    var(--color-primary-dark, #4f46e5),
    var(--color-primary, #6366f1),
    var(--color-primary-light, #818cf8)
  );
  animation: loading-gradient 2s linear infinite;
}
@keyframes loading-gradient {
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
}
.loader-fade-enter-active,
.loader-fade-leave-active {
  transition: opacity 0.3s;
}
.loader-fade-enter-from,
.loader-fade-leave-to {
  opacity: 0;
}
</style>
