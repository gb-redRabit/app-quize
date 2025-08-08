<!-- filepath: d:\git nowe\app-quize\frontend\src\components\dashboard\StatisticsSummary.vue -->
<template>
  <section class="mb-3">
    <h2 class="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4 px-1">Twoje statystyki</h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatisticCard :value="questionsCount" label="Wszystkich" color="blue" />
      <StatisticCard :value="hqStats.correct" label="Poprawnie" color="green" />
      <StatisticCard :value="hqStats.wrong" label="Błędnie" color="red" />
      <StatisticCard :value="historyStats.quizCount" label="Quizy" color="indigo" />
      <StatisticCard :value="historyStats.examCount" label="Egzaminy" color="purple" />
      <StatisticCard :value="`${historyStats.avg}%`" label="Średnia" color="yellow" />
    </div>
  </section>
</template>

<script setup>
import { useUserStats } from '@/composables/useUserStats';
import StatisticCard from '@/components/dashboard/StatisticCard.vue';

const { hqStats, historyStats, questionsCount } = useUserStats();
</script>
