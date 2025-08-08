<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 group hover:-translate-y-1 hover:shadow-md dark:bg-gray-800 dark:border-gray-700"
  >
    <!-- Nagłówek wpisu -->
    <div
      class="flex justify-between items-center p-3 border-b bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
    >
      <div class="text-xs font-medium px-2.5 py-1 rounded-full" :class="getBadgeClass(entry.type)">
        {{ getTypeName(entry.type) }}
      </div>
      <div class="text-sm text-gray-500 dark:text-gray-400">
        {{ formatDate(entry.data) }}
      </div>
    </div>

    <!-- Zawartość wpisu -->
    <div class="flex items-center justify-between p-4">
      <div class="flex flex-col items-center mr-4">
        <div class="relative" style="width: 80px; height: 80px">
          <svg class="w-full h-full transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="35"
              stroke-width="10"
              stroke="#e5e7eb"
              fill="transparent"
              class="dark:stroke-gray-600"
            />
            <circle
              cx="40"
              cy="40"
              r="35"
              stroke-width="10"
              :stroke="entry.correct > entry.wrong ? '#22c55e' : '#ef4444'"
              fill="transparent"
              :stroke-dasharray="getCircumference()"
              :stroke-dashoffset="getDashOffset(entry)"
              class="transition-all duration-500 ease-in-out"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <div class="text-lg font-bold text-gray-800 dark:text-gray-200">
              {{ percentGood(entry) }}%
            </div>
          </div>
        </div>
        <div class="flex items-center justify-center mt-2 text-sm">
          <span class="text-green-600 font-semibold">{{ entry.correct || 0 }}</span>
          <span class="mx-1 text-gray-400">/</span>
          <span class="text-red-600 font-semibold">{{ entry.wrong || 0 }}</span>
        </div>
      </div>

      <!-- Informacje o kategorii -->
      <div class="flex-1 ml-2">
        <div class="mb-2">
          <h3 class="font-medium text-gray-900 dark:text-gray-100">
            {{ entry.category && entry.category[0] ? entry.category : 'Brak kategorii' }}
          </h3>
          <div class="text-xs text-gray-500 mt-1 dark:text-gray-400">
            {{
              entry.categories && entry.categories.length > 1
                ? `+${entry.categories.length - 1} więcej kategorii`
                : 'Pojedyncza kategoria'
            }}
          </div>
        </div>

        <!-- Przycisk do pokazania szczegółów -->
        <BaseButton
          color="blue"
          size="sm"
          @click="$emit('show-details')"
          class="inline-flex items-center text-sm transition-colors"
        >
          <span class="flex items-center">
            Pokaż szczegóły
            <img src="@/assets/icons/arrow-right.svg" alt="Strzałka w prawo" class="h-4 w-4 ml-1" />
          </span>
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue';

const props = defineProps({
  entry: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});

defineEmits(['show-details']);

function getBadgeClass(type) {
  if (type === 'quiz') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  if (type === 'egzamin')
    return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
  if (type === 'Quiz - poprawa błędów')
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (type === 'Egzamin - poprawa błędów')
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
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

function getCircumference() {
  const radius = 35;
  return 2 * Math.PI * radius;
}

function getDashOffset(entry) {
  const circumference = getCircumference();
  const total = (entry.correct || 0) + (entry.wrong || 0);
  if (total === 0) return circumference;

  const percent = (entry.correct || 0) / total;
  return circumference * (1 - percent);
}

function percentGood(entry) {
  const total = (entry.correct || 0) + (entry.wrong || 0);
  if (!total) return 0;

  return Math.round(((entry.correct || 0) / total) * 100);
}
</script>
