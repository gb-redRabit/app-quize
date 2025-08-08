<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    <HistoryCard
      v-for="(entry, idx) in filteredHistory"
      :key="idx"
      :entry="entry"
      :index="idx"
      @show-details="$emit('show-details', { entry, index: idx })"
    />
  </div>
</template>

<script setup>
import HistoryCard from './HistoryCard.vue';

defineProps({
  filteredHistory: {
    type: Array,
    required: true,
  },
});

defineEmits(['show-details']);
</script>
