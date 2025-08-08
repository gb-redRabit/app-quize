<template>
  <div class="bg-white shadow-md rounded-lg p-6 mb-6 dark:bg-gray-800 dark:shadow-lg">
    <div class="grid md:grid-cols-3 gap-4">
      <div>
        <span class="text-gray-500 block text-sm dark:text-gray-400">Data:</span>
        <span class="font-medium text-gray-900 dark:text-gray-100">{{
          formatDate(historyEntry.data)
        }}</span>
      </div>
      <div>
        <span class="text-gray-500 block text-sm dark:text-gray-400">Typ:</span>
        <span
          class="inline-block px-3 py-1 rounded-full text-xs font-bold"
          :class="getDetailTypeClass(historyEntry.type)"
        >
          {{ getTypeName(historyEntry.type) }}
        </span>
      </div>
      <div>
        <span class="text-gray-500 block text-sm dark:text-gray-400">Wynik:</span>
        <span class="font-medium text-gray-900 dark:text-gray-100">
          {{ historyEntry.correct || 0 }} /
          {{ (historyEntry.correct || 0) + (historyEntry.wrong || 0) }} ({{
            calculatePercentage(historyEntry.correct, historyEntry.wrong)
          }}%)
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  historyEntry: {
    type: Object,
    required: true,
  },
});

function getDetailTypeClass(type) {
  if (type === 'quiz' || type === 'Quiz - poprawa błędów')
    return 'bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-100';
  return 'bg-purple-200 text-purple-800 dark:bg-purple-700 dark:text-purple-100';
}

function getTypeName(type) {
  if (type === 'quiz') return 'Quiz';
  if (type === 'egzamin') return 'Egzamin';
  if (type === 'Quiz - poprawa błędów') return 'Quiz - poprawa';
  if (type === 'Egzamin - poprawa błędów') return 'Egzamin - poprawa';
  return type;
}

function formatDate(dateString) {
  if (!dateString) {
    return 'Brak daty';
  }

  try {
    const date = new Date(dateString);
    return date.toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    console.error('Błąd formatowania daty:', e);
    return dateString;
  }
}

function calculatePercentage(correct, wrong) {
  const total = (correct || 0) + (wrong || 0);
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}
</script>
