<template>
  <div class="description-container" :class="{ answered: answered, unanswered: !answered }">
    <div class="description-icon">
      <svg
        v-if="answered"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
          clip-rule="evenodd"
        />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path
          fill-rule="evenodd"
          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z"
          clip-rule="evenodd"
        />
      </svg>
    </div>

    <div class="description-content">
      <transition name="fade" mode="out-in">
        <p v-if="answered" key="description" class="description-text">
          {{ description }}
        </p>
        <p v-else key="prompt" class="description-prompt">Odpowiedz aby uzyskać opis</p>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    answered: Boolean,
    description: String,
  },
};
</script>

<style scoped>
.description-container {
  @apply flex items-center p-4 rounded-xl shadow-sm transition-all duration-300 mt-4 overflow-hidden;
  min-height: 5rem;
  border: 1px solid;
}

.answered {
  @apply bg-blue-50 border-blue-200;
  background-image: linear-gradient(to right, rgba(219, 234, 254, 0.5), rgba(239, 246, 255, 0.8));
}

.unanswered {
  @apply bg-gray-50 border-gray-200;
  background-image: linear-gradient(to right, rgba(249, 250, 251, 0.5), rgba(243, 244, 246, 0.8));
}

.description-icon {
  @apply flex-shrink-0 mr-4 text-opacity-80;
}

.answered .description-icon {
  @apply text-blue-500;
}

.unanswered .description-icon {
  @apply text-gray-400;
}

.description-icon svg {
  @apply w-6 h-6;
}

.description-content {
  @apply flex-grow;
}

.description-text {
  @apply text-gray-700 text-sm sm:text-base leading-relaxed;
}

.description-prompt {
  @apply text-gray-500 italic text-sm sm:text-base;
}

/* Animacje */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Responsywność dla większych ekranów */
@media (min-width: 640px) {
  .description-container {
    @apply p-5;
  }

  .description-icon svg {
    @apply w-8 h-8;
  }

  .description-text,
  .description-prompt {
    @apply text-base;
  }
}

/* Efekt hover */
.description-container:hover {
  @apply shadow-md;
}

.answered:hover {
  @apply bg-blue-100;
}

.unanswered:hover {
  @apply bg-gray-100;
}
</style>
