<template>
  <div class="w-full flex items-center justify-center p-4">
    <div
      class="w-full max-w-md text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 relative overflow-hidden animate-fadeIn"
    >
      <div class="flex flex-col items-center justify-center mb-8 relative h-48">
        <div class="flex items-center justify-center">
          <span
            class="text-8xl font-black bg-gradient-to-br from-blue-500 to-blue-300 dark:from-blue-400 dark:to-blue-200 bg-clip-text text-transparent animate-pulse"
            >4</span
          >
          <div
            class="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-2 border-4 border-blue-200 dark:border-blue-700 animate-spin"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-12 h-12 text-blue-500 dark:text-blue-300"
            >
              <path
                fill-rule="evenodd"
                d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <span
            class="text-8xl font-black bg-gradient-to-br from-blue-500 to-blue-300 dark:from-blue-400 dark:to-blue-200 bg-clip-text text-transparent animate-pulse"
            >4</span
          >
        </div>
        <div class="absolute inset-0 pointer-events-none -z-10">
          <div
            class="absolute rounded-full opacity-70 w-20 h-20 top-0 right-5 bg-gradient-to-br from-blue-200 to-blue-50 dark:from-blue-800 dark:to-blue-950 animate-float"
            style="animation-delay: 0s"
          ></div>
          <div
            class="absolute rounded-full opacity-70 w-16 h-16 bottom-10 left-8 bg-gradient-to-br from-blue-200 to-blue-50 dark:from-blue-800 dark:to-blue-950 animate-float-reverse"
            style="animation-delay: 1s"
          ></div>
          <div
            class="absolute rounded-full opacity-70 w-10 h-10 bottom-5 right-10 bg-gradient-to-br from-purple-200 to-purple-50 dark:from-purple-800 dark:to-purple-950 animate-float"
            style="animation-delay: 2s"
          ></div>
        </div>
      </div>

      <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        Strona nie została znaleziona
      </h1>
      <p class="text-gray-500 dark:text-gray-300 text-lg mb-8">
        Wygląda na to, że strona, której szukasz, nie istnieje lub została przeniesiona.
      </p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <BaseButton
          color="blue"
          size="lg"
          tag="router-link"
          :to="{ name: 'Home' }"
          class="flex items-center gap-2 py-3 px-5 transition-transform duration-300 hover:-translate-y-0.5"
        >
          Wróć na stronę główną
        </BaseButton>

        <BaseButton
          color="gray"
          size="lg"
          @click="goBack"
          class="flex items-center gap-2 py-3 px-5 transition-transform duration-300 hover:-translate-y-0.5"
        >
          Wróć do poprzedniej strony
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script>
import BaseButton from '@/components/BaseButton.vue';

export default {
  components: { BaseButton },
  inject: ['showAlert'],
  methods: {
    goBack() {
      const canGoBack = window.history.length > 1;
      if (canGoBack) {
        this.$router.go(-1);
      } else {
        this.$router.push('/');
        this.showAlert('info', 'Przekierowano na stronę główną');
      }
    },
  },
};
</script>

<style>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes float-reverse {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(10px);
  }
}
</style>
