<template>
  <div
    v-if="show"
    :class="[
      'rounded px-4 py-3 mb-4 flex items-center',
      type === 'error'
        ? 'bg-red-100 text-red-700 border border-red-300'
        : 'bg-green-100 text-green-700 border border-green-300',
    ]"
    role="alert"
  >
    <slot>
      <span>{{ message }}</span>
    </slot>
    <button
      class="ml-auto text-lg font-bold px-2"
      @click="$emit('close')"
      aria-label="Zamknij"
    >
      ×
    </button>
  </div>
</template>

<script>
export default {
  props: {
    show: Boolean,
    message: String,
    type: { type: String, default: "error" }, // error, success
  },
};
</script>
