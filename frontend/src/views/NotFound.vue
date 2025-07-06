<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="illustration-container">
        <div class="error-code">
          <span class="digit">4</span>
          <div class="circle-illustration">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="search-icon"
            >
              <path
                fill-rule="evenodd"
                d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <span class="digit">4</span>
        </div>
        <div class="not-found-decoration">
          <div class="decoration-circle circle-1"></div>
          <div class="decoration-circle circle-2"></div>
          <div class="decoration-circle circle-3"></div>
        </div>
      </div>

      <h1 class="not-found-title">Strona nie została znaleziona</h1>
      <p class="not-found-message">
        Wygląda na to, że strona, której szukasz, nie istnieje lub została przeniesiona.
      </p>

      <div class="actions-container">
        <BaseButton
          color="blue"
          size="lg"
          tag="router-link"
          :to="{ name: 'Home' }"
          class="home-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="button-icon"
          >
            <path
              d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z"
            />
            <path
              d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z"
            />
          </svg>
          Wróć na stronę główną
        </BaseButton>

        <BaseButton color="gray" size="lg" @click="goBack" class="back-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="button-icon"
          >
            <path
              fill-rule="evenodd"
              d="M9.53 2.47a.75.75 0 010 1.06L4.81 8.25H15a6.75 6.75 0 010 13.5h-3a.75.75 0 010-1.5h3a5.25 5.25 0 100-10.5H4.81l4.72 4.72a.75.75 0 11-1.06 1.06l-6-6a.75.75 0 010-1.06l6-6a.75.75 0 011.06 0z"
              clip-rule="evenodd"
            />
          </svg>
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
  methods: {
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
.not-found-container {
  @apply w-full flex items-center justify-center p-4;
}

.not-found-content {
  @apply w-full max-w-md text-center bg-white rounded-xl shadow-lg p-8 relative overflow-hidden;
  animation: fadeIn 0.8s ease-out forwards;
}

.illustration-container {
  @apply flex flex-col items-center justify-center mb-8 relative;
  height: 180px;
}

.error-code {
  @apply flex items-center justify-center;
}

.digit {
  @apply text-8xl font-black;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: pulse 3s infinite;
}

.circle-illustration {
  @apply w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-2;
  border: 4px solid rgba(59, 130, 246, 0.3);
  animation: spin 10s linear infinite;
}

.search-icon {
  @apply w-12 h-12 text-blue-500;
}

.not-found-title {
  @apply text-2xl font-bold text-gray-800 mb-4;
}

.not-found-message {
  @apply text-gray-500 text-lg mb-8;
}

.actions-container {
  @apply flex flex-col sm:flex-row items-center justify-center gap-4;
}

.home-button,
.back-button {
  @apply flex items-center gap-2 py-3 px-5;
  transition: transform 0.3s ease;
}

.home-button:hover,
.back-button:hover {
  transform: translateY(-2px);
}

.button-icon {
  @apply w-5 h-5;
}

/* Dekoracyjne elementy */
.not-found-decoration {
  @apply absolute inset-0 pointer-events-none;
  z-index: -1;
}

.decoration-circle {
  @apply absolute rounded-full opacity-70;
}

.circle-1 {
  width: 80px;
  height: 80px;
  top: -20px;
  right: 20px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.2), rgba(96, 165, 250, 0.05));
  animation: float 6s ease-in-out infinite;
}

.circle-2 {
  width: 60px;
  height: 60px;
  bottom: 40px;
  left: 30px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15), rgba(96, 165, 250, 0.03));
  animation: float 8s ease-in-out infinite reverse;
}

.circle-3 {
  width: 40px;
  height: 40px;
  bottom: 20px;
  right: 40px;
  background: radial-gradient(circle, rgba(147, 51, 234, 0.15), rgba(168, 85, 247, 0.03));
  animation: float 7s ease-in-out infinite 1s;
}

/* Animacje */
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
</style>
