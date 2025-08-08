<template>
  <div>
    <HistoryStatsPanel
      v-if="history.length > 0"
      :history-count="history.length"
      :quiz-count="quizCount"
      :exam-count="examCount"
      :active-filter="activeFilter"
      @filter-change="$emit('filter-change', $event)"
    />

    <HistoryEmptyState v-if="history.length === 0" />

    <HistoryList
      v-else-if="history.length > 0"
      :filtered-history="filteredHistory"
      @show-details="$emit('show-details', $event.entry, $event.index)"
    />
  </div>
</template>

<script setup>
import HistoryStatsPanel from './HistoryStatsPanel.vue';
import HistoryEmptyState from './HistoryEmptyState.vue';
import HistoryList from './HistoryList.vue';

defineProps({
  history: {
    type: Array,
    required: true,
  },
  filteredHistory: {
    type: Array,
    required: true,
  },
  activeFilter: {
    type: String,
    required: true,
  },
  quizCount: {
    type: Number,
    required: true,
  },
  examCount: {
    type: Number,
    required: true,
  },
});

defineEmits(['show-details', 'filter-change']);
</script>
