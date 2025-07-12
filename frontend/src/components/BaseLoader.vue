<template>
  <div class="loader-container">
    <transition name="loader-fade">
      <div v-if="visible" class="loading-bar-container">
        <div class="loading-bar" :class="{ 'loading-bar-infinite': !percentComplete }">
          <div
            class="loading-bar-progress"
            :style="{ width: percentComplete ? percentComplete + '%' : '100%' }"
          ></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'BaseLoader',
  emits: [],

  // Dodajemy inject, aby móc używać globalnego showAlert
  inject: {
    showAlert: {
      default: null,
    },
  },

  data() {
    return {
      visible: false,
      message: '',
      requestCount: 0,
      showTimerId: null,
      hideTimerId: null,
      minimumDisplayTime: 300,
      showDelay: 100,
      showStartTime: 0,
      percentComplete: 0,
      progressInterval: null,

      // Dodajemy grupowanie zapytań
      requestQueue: [],
      isProcessing: false,
      batchDelay: 50,
    };
  },

  methods: {
    show(message, percent = 0) {
      // Dodajemy do kolejki zamiast natychmiast wykonywać
      this.requestQueue.push({ action: 'show', message, percent });
      this._processQueue();
    },

    hide() {
      // Dodajemy do kolejki zamiast natychmiast wykonywać
      this.requestQueue.push({ action: 'hide' });
      this._processQueue();
    },

    // Metoda do przetwarzania kolejki zapytań
    _processQueue() {
      if (this.isProcessing) return;

      this.isProcessing = true;

      setTimeout(() => {
        // Grupuj podobne operacje - zostaw tylko pierwszą show i ostatnią hide
        let actions = [];

        for (const request of this.requestQueue) {
          if (request.action === 'show' && !actions.some((a) => a.action === 'show')) {
            actions.push(request);
          } else if (request.action === 'hide') {
            // Usuwamy poprzednie operacje hide i dodajemy tylko najnowszą
            actions = actions.filter((a) => a.action !== 'hide');
            actions.push(request);
          }
        }

        // Wykonuj zgrupowane akcje
        for (const action of actions) {
          if (action.action === 'show') {
            this._actualShow(action.message, action.percent);
          } else if (action.action === 'hide') {
            this._actualHide();
          }
        }

        // Wyczyść kolejkę i zakończ przetwarzanie
        this.requestQueue = [];
        this.isProcessing = false;
      }, this.batchDelay);
    },

    // Implementacje faktycznych metod show/hide
    _actualShow(message, percent) {
      // Zwiększ licznik aktywnych zapytań
      this.requestCount++;

      // Zapisz wiadomość i pokaż alert
      if (message && message.trim() !== '') {
        this.message = message;
        this._showMessageAsAlert(message);
      }

      // Ustaw procent ukończenia, jeśli podany
      if (percent > 0) {
        this.percentComplete = Math.min(99, percent); // Nigdy nie pokazuj 100% do czasu ukończenia
      } else {
        this.percentComplete = 0; // Używaj animacji nieokreślonej
      }

      // Jeśli loader już jest widoczny, nie resetuj timerów
      if (this.visible) {
        return;
      }

      // Anuluj istniejący timer ukrywania, jeśli istnieje
      if (this.hideTimerId) {
        clearTimeout(this.hideTimerId);
        this.hideTimerId = null;
      }

      // Anuluj istniejący timer pokazywania, jeśli istnieje
      if (this.showTimerId) {
        clearTimeout(this.showTimerId);
      }

      // Opóźnij pokazanie loadera, aby uniknąć migotania przy szybkich zapytaniach
      this.showTimerId = setTimeout(() => {
        // Pokaż loader tylko jeśli nadal są aktywne zapytania
        if (this.requestCount > 0) {
          this.visible = true;
          this.showStartTime = Date.now();

          // Dodaj animację postępu dla nieokreślonego ładowania
          if (!this.percentComplete && !this.progressInterval) {
            this._startIndeterminateAnimation();
          }
        }
        this.showTimerId = null;
      }, this.showDelay);
    },

    _actualHide() {
      // Zmniejsz licznik aktywnych zapytań
      if (this.requestCount > 0) {
        this.requestCount--;
      }

      // Jeśli nadal są aktywne zapytania, nie ukrywaj loadera
      if (this.requestCount > 0) {
        return;
      }

      // Anuluj timer pokazywania, jeśli istnieje
      if (this.showTimerId) {
        clearTimeout(this.showTimerId);
        this.showTimerId = null;
      }

      // Zatrzymaj animację nieokreślonego ładowania
      this._stopIndeterminateAnimation();

      // Oblicz jak długo loader był już wyświetlany
      const currentDisplayTime = this.visible ? Date.now() - this.showStartTime : 0;
      const remainingTime = Math.max(0, this.minimumDisplayTime - currentDisplayTime);

      // Pokaż 100% przed ukryciem paska
      this.percentComplete = 100;

      // Jeśli loader był wyświetlany krócej niż minimalny czas, opóźnij ukrycie
      if (this.visible && remainingTime > 0) {
        if (this.hideTimerId) {
          clearTimeout(this.hideTimerId);
        }

        this.hideTimerId = setTimeout(() => {
          this.visible = false;
          this.message = ''; // Czyścimy wiadomość przy ukrywaniu
          this.hideTimerId = null;
        }, remainingTime);
      } else {
        // W przeciwnym razie ukryj po małym opóźnieniu, aby pokazać 100%
        if (this.hideTimerId) {
          clearTimeout(this.hideTimerId);
        }

        this.hideTimerId = setTimeout(() => {
          this.visible = false;
          this.message = ''; // Czyścimy wiadomość przy ukrywaniu
          this.hideTimerId = null;
        }, 300); // Krótkie opóźnienie, aby pokazać 100%
      }
    },

    // Metoda resetująca licznik zapytań (na wypadek błędów)
    reset() {
      this.requestCount = 0;
      if (this.showTimerId) {
        clearTimeout(this.showTimerId);
        this.showTimerId = null;
      }
      if (this.hideTimerId) {
        clearTimeout(this.hideTimerId);
        this.hideTimerId = null;
      }
      this._stopIndeterminateAnimation();
      this.visible = false;
      this.message = '';
    },

    // Aktualizacja procentowego postępu
    updateProgress(percent) {
      if (percent >= 0 && percent <= 100) {
        this.percentComplete = percent;
        // Jeśli osiągnięto 100%, zakończ ładowanie po krótkiej chwili
        if (percent >= 100) {
          setTimeout(() => this.hide(), 200);
        }
      }
    },

    // Używamy tylko globalnego API alertu
    _showMessageAsAlert(message) {
      if (typeof this.showAlert === 'function') {
        this.showAlert('info', message, 2000);
      }
    },

    // Metody do obsługi animacji nieokreślonego ładowania
    _startIndeterminateAnimation() {
      this._stopIndeterminateAnimation();
      this.progressInterval = setInterval(() => {
        // Symuluj postęp dla nieokreślonego ładowania
        if (this.percentComplete < 90) {
          // Szybszy postęp na początku, wolniejszy pod koniec
          const increment = Math.max(0.5, (90 - this.percentComplete) / 15);
          this.percentComplete += increment;
        }
      }, 200);
    },

    _stopIndeterminateAnimation() {
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }
    },
  },

  beforeUnmount() {
    // Wyczyść wszystkie timery przed usunięciem komponentu
    if (this.showTimerId) {
      clearTimeout(this.showTimerId);
    }
    if (this.hideTimerId) {
      clearTimeout(this.hideTimerId);
    }
    this._stopIndeterminateAnimation();
  },
};
</script>

<style scoped>
.loader-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999;
  pointer-events: none;
}

.loading-bar-container {
  width: 100%;
  height: 3px;
  background-color: transparent;
}

.loading-bar {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.loading-bar-progress {
  height: 100%;
  /* Tailwind doesn't directly support arbitrary linear gradients with named colors like this
     so we keep it here or require extending Tailwind config.
     For Tailwind 2.2.17, direct arbitrary values in classes are not fully supported for gradients.
     Keeping custom properties for flexibility. */
  background: linear-gradient(
    to right,
    var(--color-primary-dark, #4f46e5),
    var(--color-primary, #6366f1),
    var(--color-primary-light, #818cf8)
  );
  transition: width 0.3s ease-out;
  position: absolute;
  top: 0;
  left: 0;
}

.loading-bar-infinite .loading-bar-progress {
  /* Similar to above, custom properties and animation are retained.
     For Tailwind 2.2.17, direct arbitrary values for background-size and animation
     within utility classes are not available. */
  background: linear-gradient(
    to right,
    var(--color-primary-dark, #4f46e5),
    var(--color-primary, #6366f1),
    var(--color-primary-light, #818cf8),
    var(--color-primary-dark, #4f46e5)
  );
  background-size: 200% 100%;
  animation: loading-gradient 2s ease-in-out infinite;
  transition: width 0.5s ease-in-out;
}

@keyframes loading-gradient {
  0% {
    background-position: 0% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.loader-fade-enter-active,
.loader-fade-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.loader-fade-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.loader-fade-leave-to {
  opacity: 0;
}

/* Dopasowanie do ciemnego motywu */
[data-theme='dark'] .loading-bar-progress {
  background: linear-gradient(
    to right,
    var(--color-primary-dark, #3730a3),
    var(--color-primary, #4f46e5),
    var(--color-primary-light, #6366f1),
    var(--color-primary-dark, #3730a3)
  );
}
</style>
