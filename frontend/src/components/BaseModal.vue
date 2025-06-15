<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white rounded-lg shadow-lg p-8 w-full relative overflow-y-auto"
      style="max-height: 77vh; max-width: 76.5vw"
    >
      <slot />
      <button
        class="absolute top-2 right-2 text-2xl"
        @click="$emit('close')"
        aria-label="Zamknij"
      >
        &times;
      </button>
    </div>
  </div>
</template>
<script>
export default {
  props: { show: Boolean },
};
</script>
