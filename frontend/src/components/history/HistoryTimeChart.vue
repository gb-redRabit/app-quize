<template>
  <div class="mb-8">
    <div class="flex flex-col items-center w-full mx-auto">
      <div class="flex w-full items-center mb-4">
        <h2 class="flex-1 text-xl font-semibold text-gray-800 dark:text-gray-200 w-full text-left">
          Czas odpowiedzi na pytania
        </h2>
        <div class="flex-1 text-base text-gray-700 dark:text-gray-300 mb-2 w-full text-right pr-2">
          Suma czasu: <span class="font-bold">{{ totalTime }} s</span>
        </div>
      </div>

      <div
        class="flex items-end gap-3 h-72 w-full bg-gray-50 dark:bg-gray-900 rounded-lg shadow-inner px-4 overflow-x-auto border border-gray-200 dark:border-gray-700 relative"
        style="min-width: 900px; max-width: 100%"
      >
        <div
          v-for="(t, idx) in answerTimes"
          :key="idx"
          class="flex flex-col items-center justify-end"
          style="flex: 0 0 38px; min-width: 38px"
        >
          <span class="text-sm text-gray-500 mt-1"> {{ idx + 1 }} </span>
          <div
            :style="{ height: (t || 1) * 10 + 'px' }"
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
          <span class="text-sm text-gray-500 mt-1"> {{ t }}s </span>
        </div>
      </div>

      <div class="w-full text-xs text-gray-400 mt-2 text-right">
        <span class="inline-block mr-4">
          <span class="inline-block w-3 h-3 bg-green-500 rounded mr-1"></span> Poprawna
        </span>
        <span class="inline-block mr-4">
          <span class="inline-block w-3 h-3 bg-red-500 rounded mr-1"></span> Błędna
        </span>
        <span class="inline-block mr-4">
          <span class="inline-block w-3 h-3 bg-blue-500 rounded mr-1"></span> &le;20s
        </span>
        <span class="inline-block mr-4">
          <span class="inline-block w-3 h-3 bg-yellow-400 rounded mr-1"></span> 21-40s
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
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
