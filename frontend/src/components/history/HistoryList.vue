<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <HistoryCard
        v-for="(entry, idx) in visibleHistory"
        :key="idx"
        :entry="entry"
        :index="idx"
        @show-details="$emit('show-details', { entry, index: idx })"
      />
    </div>

    <div
      v-if="filteredHistory.length > PAGE_SIZE"
      class="mt-6 flex flex-col items-center gap-2"
    >
      <p class="text-xs text-gray-500 dark:text-gray-400">
        Pokazano {{ visibleHistory.length }} z {{ filteredHistory.length }}
      </p>
      <BaseButton
        v-if="hasMore"
        color="blue"
        variant="outline"
        size="sm"
        @click="showMore"
      >
        Pokaż więcej ({{ remaining }})
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import HistoryCard from './HistoryCard.vue';
import BaseButton from '@/components/base/BaseButton.vue';

const PAGE_SIZE = 12;

const props = defineProps({
  filteredHistory: {
    type: Array,
    required: true,
  },
});

defineEmits(['show-details']);

const visibleCount = ref(PAGE_SIZE);

const visibleHistory = computed(() => props.filteredHistory.slice(0, visibleCount.value));
const hasMore = computed(() => visibleCount.value < props.filteredHistory.length);
const remaining = computed(() =>
  Math.max(0, props.filteredHistory.length - visibleCount.value)
);

function showMore() {
  visibleCount.value = Math.min(
    props.filteredHistory.length,
    visibleCount.value + PAGE_SIZE
  );
}

// Zmiana filtra/sortowania pokazuje od nowa pierwszy fragment listy.
watch(
  () => props.filteredHistory,
  () => {
    visibleCount.value = PAGE_SIZE;
  }
);
</script>
