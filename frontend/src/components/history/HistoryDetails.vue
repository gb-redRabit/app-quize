<template>
  <div class="mb-6">
    <HistoryDetailsHeader :title="'Szczegóły historii'" @close="$emit('close')" />

    <HistorySummaryCard :historyEntry="historyEntry" />

    <HistoryTimeChart
      v-if="answerTimes.length"
      :answerTimes="answerTimes"
      :entryList="entryList"
      :totalTime="totalTime"
      @click-bar="handleBarClick"
    />

    <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Odpowiedzi:</h2>

    <HistoryAnswersList :entryList="entryList" :answerRefs="answerRefs" />
  </div>
</template>

<script setup>
import { computed, nextTick } from 'vue';
import HistoryDetailsHeader from './HistoryDetailsHeader.vue';
import HistorySummaryCard from './HistorySummaryCard.vue';
import HistoryTimeChart from './HistoryTimeChart.vue';
import HistoryAnswersList from './HistoryAnswersList.vue';

const props = defineProps({
  historyEntry: {
    type: Object,
    required: true,
  },
  allQuestions: {
    type: Array,
    required: true,
  },
  answerRefs: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close', 'scroll-to-answer']);

// Lista odpowiedzi z wybranej historii
const entryList = computed(() => {
  return props.historyEntry && Array.isArray(props.historyEntry.list)
    ? props.historyEntry.list
    : [];
});

// Obliczanie czasów odpowiedzi
const answerTimes = computed(() => {
  // Jeśli brak danych, zwróć pustą tablicę
  if (
    !props.historyEntry ||
    !Array.isArray(props.historyEntry.questionTimes) ||
    props.historyEntry.questionTimes.length === 0
  ) {
    return [];
  }

  // Obliczenie czasów odpowiedzi
  const start = new Date(props.historyEntry.data).getTime() / 1000;
  const times = props.historyEntry.questionTimes;

  // Pierwszy czas to różnica między pierwszym timestampem a startem quizu
  const result = [Math.max(0, times[0] - start)];

  // Kolejne czasy to różnice między kolejnymi timestampami
  for (let i = 1; i < times.length; i++) {
    result.push(Math.max(0, times[i] - times[i - 1]));
  }

  // Zaokrąglij do 2 miejsc po przecinku
  return result.map((t) => Math.round(t * 100) / 100);
});

// Całkowity czas rozwiązywania
const totalTime = computed(() => {
  return answerTimes.value.reduce((sum, t) => sum + t, 0).toFixed(2);
});

// Dodaj funkcję do obsługi kliknięcia w słupek wykresu
function handleBarClick(idx) {
  nextTick(() => {
    // Bezpośrednio wyszukaj element po selektorze (numer pytania)
    const element = document.querySelector(`[data-question-index="${idx}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Dodanie animacji podświetlenia
      element.classList.add('ring', 'ring-blue-400');
      setTimeout(() => element.classList.remove('ring', 'ring-blue-400'), 1200);
    }
  });
}
</script>
