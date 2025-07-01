<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <h1 class="text-5xl font-bold text-blue-700 mb-4">404</h1>
    <p class="text-xl text-gray-700 mb-8">Nie znaleziono strony.</p>
    <BaseButton color="blue" tag="router-link" :to="{ name: 'Home' }">
      Wróć na stronę główną
    </BaseButton>
  </div>
</template>

<script>
import BaseButton from '@/components/BaseButton.vue';
export default {
  components: { BaseButton },
};
</script>
