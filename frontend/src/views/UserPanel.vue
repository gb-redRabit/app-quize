<template>
  <div class="user-panel-container">
    <div class="user-panel-card">
      <div class="user-panel-header">
        <h1 class="panel-title">Panel użytkownika</h1>
        <div class="user-badge">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="user-icon"
          >
            <path
              fill-rule="evenodd"
              d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="user-login">{{ user.login }}</span>
        </div>
      </div>

      <div class="user-panel-content">
        <!-- Sekcja motywu -->
        <div class="panel-section">
          <div class="section-header">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="section-icon"
            >
              <path
                d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"
              />
            </svg>
            <h2 class="section-title">Wybór motywu</h2>
          </div>

          <div class="theme-selector">
            <div
              class="theme-option"
              :class="{ selected: theme === 'light' }"
              @click="theme = 'light'"
            >
              <div class="theme-preview light-preview"></div>
              <span>Jasny</span>
            </div>

            <div
              class="theme-option"
              :class="{ selected: theme === 'dark' }"
              @click="theme = 'dark'"
            >
              <div class="theme-preview dark-preview"></div>
              <span>Ciemny</span>
            </div>
          </div>

          <BaseButton color="blue" @click="saveTheme" class="save-button">
            <span>Zapisz motyw</span>
          </BaseButton>
        </div>

        <!-- Sekcja zmiany hasła -->
        <div class="panel-section">
          <div class="section-header">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="section-icon"
            >
              <path
                fill-rule="evenodd"
                d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                clip-rule="evenodd"
              />
            </svg>
            <h2 class="section-title">Zmiana hasła</h2>
          </div>

          <div class="password-form">
            <div class="form-group">
              <label class="form-label">Stare hasło</label>
              <div class="input-wrapper">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="input-icon"
                >
                  <path
                    fill-rule="evenodd"
                    d="M15.75 1.5a6.75 6.75 0 00-6.651 7.906c.067.39-.032.717-.221.906l-6.5 6.499a3 3 0 00-.878 2.121v2.818c0 .414.336.75.75.75H6a.75.75 0 00.75-.75v-1.5h1.5A.75.75 0 009 19.5V18h1.5a.75.75 0 00.75-.75V15h1.5a.75.75 0 00.75-.75v-1.5a.75.75 0 01.75-.75 6.75 6.75 0 009-6.75V4.5a3 3 0 00-3-3h-6z"
                    clip-rule="evenodd"
                  />
                </svg>
                <input
                  v-model="oldPassword"
                  type="password"
                  placeholder="Wprowadź aktualne hasło"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Nowe hasło</label>
              <div class="input-wrapper">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="input-icon"
                >
                  <path
                    fill-rule="evenodd"
                    d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
                    clip-rule="evenodd"
                  />
                </svg>
                <input
                  v-model="newPassword"
                  type="password"
                  placeholder="Wprowadź nowe hasło"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Powtórz nowe hasło</label>
              <div class="input-wrapper">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="input-icon"
                >
                  <path
                    fill-rule="evenodd"
                    d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
                    clip-rule="evenodd"
                  />
                </svg>
                <input
                  v-model="newPassword2"
                  type="password"
                  placeholder="Potwierdź nowe hasło"
                  class="form-input"
                />
              </div>
            </div>

            <div v-if="passwordMatch !== null" class="password-feedback">
              <svg
                v-if="passwordMatch"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="feedback-icon success"
              >
                <path
                  fill-rule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="feedback-icon error"
              >
                <path
                  fill-rule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                  clip-rule="evenodd"
                />
              </svg>
              <span :class="{ 'text-green-600': passwordMatch, 'text-red-600': !passwordMatch }">
                {{ passwordMatch ? 'Hasła są identyczne' : 'Hasła nie są identyczne' }}
              </span>
            </div>

            <BaseButton color="green" @click="changePassword" class="change-password-button">
              <span>Zmień hasło</span>
            </BaseButton>

            <div
              v-if="passwordMsg"
              class="message-container"
              :class="{
                'success-message': passwordMsgType.includes('green'),
                'error-message': passwordMsgType.includes('red'),
              }"
            >
              <svg
                v-if="passwordMsgType.includes('green')"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="message-icon"
              >
                <path
                  fill-rule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="message-icon"
              >
                <path
                  fill-rule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ passwordMsg }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import BaseButton from '@/components/BaseButton.vue';
import apiClient from '@/api';

export default {
  components: { BaseButton },
  data() {
    return {
      theme: 'light',
      oldPassword: '',
      newPassword: '',
      newPassword2: '',
      passwordMsg: '',
      passwordMsgType: 'text-green-600',
    };
  },
  computed: {
    ...mapState('user', ['user']),
    passwordMatch() {
      if (!this.newPassword && !this.newPassword2) return null;
      return this.newPassword === this.newPassword2;
    },
  },
  mounted() {
    this.theme = this.user.option || 'light';
  },
  methods: {
    async saveTheme() {
      try {
        await apiClient.put('/users/update', { option: this.theme });
        document.documentElement.setAttribute('data-theme', this.theme);
        this.passwordMsg = 'Motyw zapisany!';
        this.passwordMsgType = 'text-green-600';
        setTimeout(() => {
          this.passwordMsg = '';
        }, 3000);
      } catch {
        this.passwordMsg = 'Błąd zapisu motywu.';
        this.passwordMsgType = 'text-red-600';
      }
    },
    async changePassword() {
      this.passwordMsg = '';
      if (!this.oldPassword || !this.newPassword || !this.newPassword2) {
        this.passwordMsg = 'Wypełnij wszystkie pola.';
        this.passwordMsgType = 'text-red-600';
        return;
      }
      if (this.newPassword !== this.newPassword2) {
        this.passwordMsg = 'Nowe hasła nie są takie same.';
        this.passwordMsgType = 'text-red-600';
        return;
      }
      try {
        await apiClient.put('/users/update', {
          changePassword: true,
          oldPassword: this.oldPassword,
          newPassword: this.newPassword,
        });
        this.passwordMsg = 'Hasło zmienione!';
        this.passwordMsgType = 'text-green-600';
        this.oldPassword = '';
        this.newPassword = '';
        this.newPassword2 = '';
        setTimeout(() => {
          this.passwordMsg = '';
        }, 3000);
      } catch (e) {
        this.passwordMsg = 'Błąd zmiany hasła.';
        this.passwordMsgType = 'text-red-600';
      }
    },
  },
};
</script>

<style scoped>
.user-panel-container {
  @apply container mx-auto py-8 px-4;
}

.user-panel-card {
  @apply mx-auto max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden;
  border: 1px solid rgba(226, 232, 240, 0.8);
  animation: slideUp 0.5s ease-out forwards;
}

.user-panel-header {
  @apply p-6 bg-gradient-to-r from-blue-500 to-blue-600 flex flex-col sm:flex-row justify-between items-center gap-4;
}

.panel-title {
  @apply text-2xl font-bold text-white;
}

.user-badge {
  @apply flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 rounded-full text-white;
}

.user-icon {
  @apply w-5 h-5;
}

.user-login {
  @apply font-medium;
}

.user-panel-content {
  @apply p-6;
}

.panel-section {
  @apply mb-8;
}

.panel-section:last-child {
  @apply mb-0;
}

.section-header {
  @apply flex items-center gap-3 mb-6;
}

.section-icon {
  @apply w-6 h-6 text-blue-500;
}

.section-title {
  @apply text-xl font-semibold text-gray-800;
}

.theme-selector {
  @apply flex items-center gap-6 mb-6;
}

.theme-option {
  @apply flex flex-col items-center cursor-pointer transition-transform hover:scale-105;
}

.theme-option.selected {
  @apply font-semibold text-blue-600;
}

.theme-preview {
  @apply w-16 h-16 rounded-lg mb-2 border-2 transition-all;
}

.theme-option.selected .theme-preview {
  @apply border-blue-500 shadow-md;
}

.light-preview {
  @apply bg-gradient-to-br from-white to-gray-100;
}

.dark-preview {
  @apply bg-gradient-to-br from-gray-800 to-gray-900;
}

.save-button {
  @apply w-full flex items-center justify-center gap-2;
}

.password-form {
  @apply space-y-4;
}

.form-group {
  @apply w-full;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.input-wrapper {
  @apply relative flex items-center overflow-hidden rounded-lg border border-gray-300 transition-all duration-200;
}

.input-wrapper:focus-within {
  @apply border-blue-400 ring-2 ring-blue-100;
}

.input-icon {
  @apply absolute left-3 w-5 h-5 text-gray-400;
}

.form-input {
  @apply w-full p-3 pl-10 bg-transparent border-none outline-none text-gray-700;
}

.password-feedback {
  @apply flex items-center gap-2 text-sm mt-2;
}

.feedback-icon {
  @apply w-4 h-4;
}

.feedback-icon.success {
  @apply text-green-500;
}

.feedback-icon.error {
  @apply text-red-500;
}

.change-password-button {
  @apply w-full flex items-center justify-center gap-2 mt-4;
}

.button-icon {
  @apply w-5 h-5;
}

.message-container {
  @apply flex items-center gap-2 p-3 mt-4 rounded-lg text-sm;
}

.success-message {
  @apply bg-green-50 text-green-700 border border-green-200;
}

.error-message {
  @apply bg-red-50 text-red-700 border border-red-200;
}

.message-icon {
  @apply w-5 h-5;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsywność */
@media (max-width: 640px) {
  .theme-selector {
    @apply justify-center;
  }

  .section-header {
    @apply mb-4;
  }
}
</style>
