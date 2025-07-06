<template>
  <div class="login-container">
    <div class="login-card-wrapper">
      <div class="login-card">
        <div class="login-header">
          <h2 class="login-title">Logowanie</h2>
          <p class="login-subtitle">Witaj z powrotem! Zaloguj się do swojego konta</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="login" class="form-label">Login</label>
            <div class="input-wrapper">
              <div class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                v-model="loginInput"
                id="login"
                required
                autocomplete="username"
                class="form-input"
                placeholder="Wprowadź nazwę użytkownika"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Hasło</label>
            <div class="input-wrapper">
              <div class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="password"
                v-model="password"
                id="password"
                required
                autocomplete="current-password"
                class="form-input"
                placeholder="Wprowadź hasło"
              />
            </div>
          </div>

          <BaseButton type="submit" color="blue" size="lg" class="login-button">
            <span>Zaloguj się</span>
          </BaseButton>
        </form>

        <BaseAlert v-if="errorMessage" :message="errorMessage" type="error" class="login-alert" />

        <div class="login-footer">
          <router-link to="/register" class="register-link">
            Nie masz konta? <span>Zarejestruj się</span>
          </router-link>
        </div>
      </div>

      <div class="login-decoration">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import BaseButton from '@/components/BaseButton.vue';
import BaseAlert from '@/components/BaseAlert.vue';

export default {
  components: { BaseButton, BaseAlert },
  data() {
    return {
      loginInput: '',
      password: '',
      errorMessage: '',
    };
  },
  methods: {
    ...mapActions('user', ['login']),
    async handleLogin() {
      try {
        this.errorMessage = '';
        await this.login({
          login: this.loginInput,
          password: this.password,
        });
        this.$router.push({ name: 'Home' });
      } catch (error) {
        this.errorMessage = 'Niepoprawny login lub hasło. Spróbuj ponownie.';
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  @apply min-h-screen w-full flex items-center justify-center p-4;
}

.login-card-wrapper {
  @apply relative w-full max-w-md;
}

.login-card {
  @apply bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full relative z-10 overflow-hidden;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.login-header {
  @apply mb-6 text-center;
}

.login-title {
  @apply text-2xl sm:text-3xl font-bold text-gray-800 mb-2;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-subtitle {
  @apply text-gray-500 text-sm sm:text-base;
}

.login-form {
  @apply space-y-5;
}

.form-group {
  @apply mb-4;
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
  @apply flex items-center justify-center h-full px-3 text-gray-400;
}

.input-icon svg {
  @apply h-5 w-5;
}

.form-input {
  @apply w-full p-3 bg-transparent border-none outline-none text-gray-700;
}

.form-input::placeholder {
  @apply text-gray-400;
}

.login-button {
  @apply w-full py-3 mt-6 font-semibold flex items-center justify-center gap-2 rounded-lg;
}

.btn-icon {
  @apply h-5 w-5 ml-1 transition-transform duration-300;
}

.login-button:hover .btn-icon {
  transform: translateX(3px);
}

.login-alert {
  @apply mt-4;
}

.login-footer {
  @apply mt-6 text-center pt-4 border-t border-gray-100;
}

.register-link {
  @apply text-gray-600 text-sm hover:text-gray-800 transition;
}

.register-link span {
  @apply text-blue-600 font-medium hover:underline;
}

/* Dekoracyjne elementy */
.login-decoration {
  @apply absolute inset-0 pointer-events-none overflow-hidden;
  z-index: -1;
}

.decoration-circle {
  @apply absolute rounded-full opacity-70;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -80px;
  right: -100px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.2), rgba(96, 165, 250, 0.05));
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -70px;
  left: -80px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.1), rgba(96, 165, 250, 0.02));
}

/* Animacja */
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

.login-card {
  animation: fadeIn 0.5s ease-out forwards;
}
</style>
