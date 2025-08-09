<template>
  <div class="w-full min-h-screen -mt-20 flex items-center justify-center p-4 bg-gradient-to-br">
    <div
      class="w-full max-w-md text-center bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 relative overflow-hidden animate-fadeIn"
    >
      <div class="flex flex-col items-center justify-center mb-8 relative h-48">
        <div class="flex items-center justify-center">
          <div
            class="w-24 h-24 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-2 border-4 border-red-200 dark:border-red-700 animate-spin-slow"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              fill="none"
              class="w-14 h-14 text-red-500 dark:text-red-400"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="24" cy="24" r="22" stroke="currentColor" stroke-width="3" fill="none" />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M24 16v10M24 34h.01"
              />
            </svg>
          </div>
        </div>
        <!-- Dekoracyjne elementy tła -->
        <div class="absolute inset-0 pointer-events-none -z-10">
          <div
            class="absolute rounded-full opacity-60 w-20 h-20 top-0 right-5 bg-gradient-to-br from-red-200 to-red-50 dark:from-red-800 dark:to-red-950 animate-float"
          ></div>
          <div
            class="absolute rounded-full opacity-60 w-16 h-16 bottom-10 left-8 bg-gradient-to-br from-red-200 to-red-50 dark:from-red-800 dark:to-red-950 animate-float-reverse delay-1000"
          ></div>
          <div
            class="absolute rounded-full opacity-60 w-10 h-10 bottom-5 right-10 bg-gradient-to-br from-yellow-200 to-yellow-50 dark:from-yellow-800 dark:to-yellow-950 animate-float delay-2000"
          ></div>
        </div>
      </div>

      <h1 class="text-2xl font-bold text-red-700 dark:text-red-400 mb-4">Błąd serwera (500)</h1>
      <p class="text-gray-500 dark:text-gray-300 text-lg mb-8">
        Coś poszło nie tak po stronie serwera.<br />
        Spróbuj ponownie za chwilę lub wróć na stronę główną.
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

<script setup>
import { inject, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
const BaseButton = defineAsyncComponent(() => import('@/components/base/BaseButton.vue'));

const router = useRouter();
const showAlert = inject('showAlert');

const goBack = () => {
  const canGoBack = window.history.length > 1;
  if (canGoBack) {
    router.go(-1);
  } else {
    router.push('/');
    showAlert && showAlert('info', 'Przekierowano na stronę główną');
  }
};
</script>

<style scoped>
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

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-float-reverse {
  animation: float-reverse 3s ease-in-out infinite;
}

.delay-1000 {
  animation-delay: 1s;
}

.delay-2000 {
  animation-delay: 2s;
}

.animate-spin-slow {
  animation: spin 2.5s linear infinite;
}
</style>
