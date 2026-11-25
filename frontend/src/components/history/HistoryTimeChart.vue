<template>
  <div class="mb-6">
    <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-base sm:text-xl font-semibold text-gray-800 dark:text-gray-200">
        Czas odpowiedzi na pytania
      </h2>
      <div class="text-sm sm:text-base text-gray-700 dark:text-gray-300">
        Suma czasu: <span class="font-bold">{{ totalTime }} s</span>
      </div>
    </div>

    <div
      class="mt-3 flex items-end gap-3 h-64 sm:h-72 w-full bg-gray-50 dark:bg-gray-900 rounded-lg inset-shadow-sm px-4 overflow-x-auto border border-gray-200 dark:border-gray-700 relative"
    >
      <div
        v-for="(t, idx) in answerTimes"
        :key="idx"
        class="flex flex-col items-center justify-end h-full pb-2"
        style="flex: 0 0 38px; min-width: 38px"
      >
        <div
          :style="{ height: barHeight(t) + 'px' }"
          :class="[
            isAnswerCorrect(entryList[idx]) === true
              ? 'bg-green-500 hover:bg-green-600'
              : isAnswerCorrect(entryList[idx]) === false
                ? 'bg-red-500 hover:bg-red-600'
                : t > 40
                  ? 'bg-red-500 hover:bg-red-600'
                  : t > 20
                    ? 'bg-yellow-400 hover:bg-yellow-500'
                    : 'bg-blue-500 hover:bg-blue-600',
            'transition w-full rounded-t cursor-pointer',
          ]"
          :title="`Pytanie ${idx + 1}: ${t}s`"
          @click="$emit('click-bar', idx)"
        ></div>
        <span class="text-xs text-gray-500 mt-1 whitespace-nowrap">
          {{ answerTimes.length <= 20 ? `${idx + 1} · ${t}s` : idx + 1 }}
        </span>
      </div>
    </div>

    <div
      class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 sm:justify-end"
    >
      <span class="inline-flex items-center gap-1">
        <span class="inline-block w-3 h-3 bg-green-500 rounded-sm"></span> Poprawna
      </span>
      <span class="inline-flex items-center gap-1">
        <span class="inline-block w-3 h-3 bg-red-500 rounded-sm"></span> Błędna
      </span>
      <span class="inline-flex items-center gap-1">
        <span class="inline-block w-3 h-3 bg-blue-500 rounded-sm"></span> &le;20s
      </span>
      <span class="inline-flex items-center gap-1">
        <span class="inline-block w-3 h-3 bg-yellow-400 rounded-sm"></span> 21-40s
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  answerTimes: {
    type: Array,
    required: true,
  },
  entryList: {
    type: Array,
    required: true,
  },
  totalTime: {
    type: String,
    required: true,
  },
});

defineEmits(['click-bar']);

// Skalujemy słupek względem najdłuższej odpowiedzi, żeby wykres był czytelny
// także przy bardzo szybkich odpowiedziach (ułamki sekund).
const maxTime = computed(() =>
  Math.max(1e-6, ...props.answerTimes.map((value) => Math.max(0, Number(value) || 0)))
);

function barHeight(seconds) {
  const value = Math.max(0, Number(seconds) || 0);
  return Math.max(8, Math.round((value / maxTime.value) * 200));
}

function isAnswerCorrect(item) {
  if (item && (item.correct === true || item.isCorrect === true)) {
    return true;
  }
  if (item && (item.correct === false || item.isCorrect === false)) {
    return false;
  }
  return null; // Nieznany stan
}
</script>
