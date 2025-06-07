<template>
  <div class="mb-4 flex items-center gap-2 w-full sm:w-2/5">
    <input
      v-model="search"
      @input="$emit('update:search', search)"
      type="text"
      placeholder="Szukaj po ID lub treści pytania..."
      class="w-full p-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
    <button
      v-if="search"
      @click="clear"
      class="ml-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      title="Wyczyść"
    >
      ✕
    </button>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: String,
  },
  data() {
    return {
      search: this.modelValue || "",
    };
  },
  watch: {
    modelValue(val) {
      this.search = val;
    },
  },
  methods: {
    clear() {
      this.search = "";
      this.$emit("update:search", "");
    },
  },
};
</script>
