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

    <div v-else class="flex justify-end mb-3">
      <button
        class="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        @click="exportHistory"
      >
        Eksport CSV ({{ filteredHistory.length }})
      </button>
    </div>

    <HistoryList
      v-if="history.length > 0"
      :filtered-history="filteredHistory"
      @show-details="$emit('show-details', $event.entry, $event.index)"
    />
  </div>
</template>

<script setup>
import HistoryStatsPanel from './HistoryStatsPanel.vue';
import HistoryEmptyState from './HistoryEmptyState.vue';
import HistoryList from './HistoryList.vue';

const props = defineProps({
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

function escapeCsv(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function exportHistory() {
  const rows = [
    ['Data', 'Typ', 'Kategoria', 'Poprawne', 'Błędne', 'Procent', 'Czas (s)'],
  ];
  for (const item of props.filteredHistory) {
    const total = (item.correct || 0) + (item.wrong || 0);
    const percent = total > 0 ? Math.round(((item.correct || 0) / total) * 100) : 0;
    rows.push([
      item.data ? new Date(item.data).toLocaleString('pl-PL') : '',
      item.type || '',
      item.category || '',
      item.correct || 0,
      item.wrong || 0,
      `${percent}%`,
      item.time ?? '',
    ]);
  }
  const csv = '\uFEFF' + rows.map((row) => row.map(escapeCsv).join(';')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `historia-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
</script>
