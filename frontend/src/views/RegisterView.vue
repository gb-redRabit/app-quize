<template>
  <div class="register-container">
    <div class="register-card-wrapper">
      <div class="register-card">
        <div class="register-header">
          <h2 class="register-title">Rejestracja</h2>
          <p class="register-subtitle">Utwórz nowe konto</p>
        </div>

        <form @submit.prevent="handleRegister" class="register-form">
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
                placeholder="Wybierz nazwę użytkownika"
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
                minlength="4"
                class="form-input"
                placeholder="Minimum 4 znaki"
              />
            </div>
            <div class="password-strength" v-if="password">
              <div class="strength-bar" :class="passwordStrengthClass"></div>
              <span class="strength-text">{{ passwordStrengthText }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password2" class="form-label">Powtórz hasło</label>
            <div class="input-wrapper">
              <div class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M15.75 1.5a6.75 6.75 0 00-6.651 7.906c.067.39-.032.717-.221.906l-6.5 6.499a3 3 0 00-.878 2.121v2.818c0 .414.336.75.75.75H6a.75.75 0 00.75-.75v-1.5h1.5A.75.75 0 009 19.5V18h1.5a.75.75 0 00.75-.75V15h1.5a.75.75 0 00.75-.75v-1.5a.75.75 0 01.75-.75 6.75 6.75 0 009-6.75V4.5a3 3 0 00-3-3h-6z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="password"
                v-model="password2"
                id="password2"
                required
                minlength="4"
                class="form-input"
                placeholder="Wpisz hasło ponownie"
              />
            </div>
            <div class="password-match" v-if="password && password2">
              <span v-if="password === password2" class="match-success">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    fill-rule="evenodd"
                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                    clip-rule="evenodd"
                  />
                </svg>
                Hasła są identyczne
              </span>
              <span v-else class="match-error">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    fill-rule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                    clip-rule="evenodd"
                  />
                </svg>
                Hasła nie są identyczne
              </span>
            </div>
          </div>

          <BaseButton
            type="submit"
            color="blue"
            size="lg"
            class="register-button"
            :disabled="!canRegister"
          >
            <span>Zarejestruj się</span>
          </BaseButton>
        </form>

        <div class="alert-container">
          <BaseAlert
            v-if="errorMessage"
            :message="errorMessage"
            type="error"
            class="register-alert"
          />
          <BaseAlert
            v-if="successMessage"
            :message="successMessage"
            type="success"
            class="register-alert"
          />
        </div>

        <div class="register-footer">
          <router-link to="/login" class="login-link">
            Masz już konto? <span>Zaloguj się</span>
          </router-link>
        </div>
      </div>

      <div class="register-decoration">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseButton from '@/components/BaseButton.vue';
import apiClient from '@/api';

export default {
  components: { BaseButton },
  inject: ['showAlert', 'showLoader', 'hideLoader'],
  data() {
    return {
      loginInput: '',
      password: '',
      password2: '',
      errorMessage: '',
      successMessage: '',
    };
  },
  computed: {
    passwordStrength() {
      if (!this.password) return 0;
      let strength = 0;

      // Długość
      if (this.password.length >= 8) strength += 1;
      if (this.password.length >= 12) strength += 1;

      // Zawartość
      if (/[A-Z]/.test(this.password)) strength += 1;
      if (/[0-9]/.test(this.password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(this.password)) strength += 1;

      return Math.min(strength, 4);
    },
    passwordStrengthClass() {
      const classes = ['weak', 'fair', 'good', 'strong', 'very-strong'];
      return classes[this.passwordStrength];
    },
    passwordStrengthText() {
      const texts = ['Bardzo słabe', 'Słabe', 'Dobre', 'Silne', 'Bardzo silne'];
      return texts[this.passwordStrength];
    },
    canRegister() {
      return (
        this.loginInput &&
        this.password &&
        this.password2 &&
        this.password.length >= 4 &&
        this.password === this.password2
      );
    },
  },
  methods: {
    async handleRegister() {
      if (!this.loginInput || !this.password || !this.password2) {
        this.showAlert('warning', 'Wszystkie pola są wymagane.');
        return;
      }

      if (this.password.length < 4) {
        this.showAlert('warning', 'Hasło musi mieć co najmniej 4 znaki.');
        return;
      }

      if (this.password !== this.password2) {
        this.showAlert('error', 'Hasła nie są takie same.');
        return;
      }

      try {
        this.showLoader('Tworzenie konta...');
        await apiClient.post('/auth/register', {
          login: this.loginInput,
          password: this.password,
        });
        this.hideLoader();
        this.showAlert('success', 'Rejestracja zakończona sukcesem! Możesz się zalogować.');

        // Przekierowanie po udanej rejestracji
        setTimeout(() => {
          this.$router.push('/login');
        }, 1500);
      } catch (e) {
        this.hideLoader();
        if (e.response && e.response.status === 409) {
          this.showAlert('error', 'Użytkownik o podanej nazwie już istnieje.');
        } else {
          this.showAlert('error', 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.');
        }
      }
    },
  },
};
</script>

<style scoped>
.register-container {
  @apply min-h-screen w-full flex items-center justify-center p-4;
}

.register-card-wrapper {
  @apply relative w-full max-w-md;
}

.register-card {
  @apply bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full relative z-10 overflow-hidden;
  border: 1px solid rgba(226, 232, 240, 0.8);
  animation: slideUp 0.5s ease-out forwards;
}

.register-header {
  @apply mb-6 text-center;
}

.register-title {
  @apply text-2xl sm:text-3xl font-bold text-gray-800 mb-2;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.register-subtitle {
  @apply text-gray-500 text-sm sm:text-base;
}

.register-form {
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

.register-button {
  @apply w-full py-3 mt-6 font-semibold flex items-center justify-center gap-2 rounded-lg;
}

.btn-icon {
  @apply h-5 w-5 ml-1 transition-transform duration-300;
}

.register-button:hover .btn-icon {
  transform: rotate(90deg);
}

.alert-container {
  @apply mt-4;
}

.register-alert {
  @apply mb-2;
}

.register-footer {
  @apply mt-6 text-center pt-4 border-t border-gray-100;
}

.login-link {
  @apply text-gray-600 text-sm hover:text-gray-800 transition;
}

.login-link span {
  @apply text-blue-600 font-medium hover:underline;
}

/* Siła hasła */
.password-strength {
  @apply mt-2 flex flex-col;
}

.strength-bar {
  @apply h-1.5 rounded-full mt-1;
  width: 100%;
}

.strength-bar.weak {
  @apply bg-red-400;
  width: 20%;
}

.strength-bar.fair {
  @apply bg-yellow-400; /* Zmienione z bg-orange-400 na bg-yellow-400 */
  width: 40%;
}

.strength-bar.good {
  @apply bg-yellow-400;
  width: 60%;
}

.strength-bar.strong {
  @apply bg-green-400;
  width: 80%;
}

.strength-bar.very-strong {
  @apply bg-green-500;
  width: 100%;
}

.strength-text {
  @apply text-xs text-gray-500 mt-1;
}

/* Dopasowanie haseł */
.password-match {
  @apply flex items-center mt-1.5;
}

.match-success {
  @apply text-xs text-green-600 flex items-center gap-1;
}

.match-error {
  @apply text-xs text-red-600 flex items-center gap-1;
}

/* Dekoracyjne elementy */
.register-decoration {
  @apply absolute inset-0 pointer-events-none overflow-hidden;
  z-index: -1;
}

.decoration-circle {
  @apply absolute rounded-full opacity-70;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -120px;
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

.circle-3 {
  width: 150px;
  height: 150px;
  bottom: 100px;
  right: -50px;
  background: radial-gradient(circle, rgba(147, 51, 234, 0.1), rgba(168, 85, 247, 0.02));
}

/* Animacje */
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
</style>
