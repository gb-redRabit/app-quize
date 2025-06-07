<template>
  <div
    class="sm:h-20 text-gray-700 text-sm sm:text-lg font-medium bg-gray-100 rounded p-3 flex items-center justify-center"
  >
    <span v-if="answered">
      {{ description }}
    </span>
    <span v-else>Odpowiedz aby uzyskać opis</span>
  </div>
</template>

<script>
export default {
  props: {
    answered: Boolean,
    description: String,
  },
};
</script>
