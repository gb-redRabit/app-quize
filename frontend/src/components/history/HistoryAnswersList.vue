<template>
  <div v-if="!entryList.length" class="text-center text-gray-500 my-8 dark:text-gray-400">
    <p>Ten wpis nie zawiera żadnych odpowiedzi.</p>
  </div>

  <ul v-else class="space-y-4 mb-8">
    <HistoryAnswerItem
      v-for="(item, index) in entryList"
      :key="index"
      :item="item"
      :index="index"
    />
  </ul>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import HistoryAnswerItem from './HistoryAnswerItem.vue';

const props = defineProps({
  entryList: {
    type: Array,
    required: true,
  },
  answerRefs: {
    type: Object,
    required: true,
  },
});

// Słuchaj zdarzenia answer-mounted, aby aktualizować referencje
const handleAnswerMounted = (event) => {
  const { index, element } = event.detail;
  props.answerRefs[index] = element;
};

onMounted(() => {
  document.addEventListener('answer-mounted', handleAnswerMounted);
});

onUnmounted(() => {
  document.removeEventListener('answer-mounted', handleAnswerMounted);
});
</script>
