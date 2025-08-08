<template>
  <div class="container mx-auto p-4 overflow-hidden">
    <!-- Nagłówek panelu użytkownika -->
    <div
      class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg mb-8 p-6 flex flex-wrap items-center justify-between"
    >
      <div class="flex items-center">
        <div
          class="w-20 h-20 bg-white/20 rounded-full p-1 shadow-xl mr-4 flex items-center justify-center backdrop-blur-sm"
        >
          <Avatar
            :avatar-index="user?.avatar || 0"
            :color="user?.avatarColors || '#60A5FA'"
            :size="72"
          />
        </div>
        <div>
          <h1 class="text-3xl font-bold text-white">Panel użytkownika</h1>
          <p class="text-blue-100 text-lg">Cześć, {{ user?.login || 'użytkowniku' }}!</p>
        </div>
      </div>
      <div class="text-right hidden sm:block">
        <p class="text-blue-100 text-sm md:text-2xl">Zarządzaj swoim profilem i preferencjami.</p>
      </div>
    </div>

    <!-- Sekcje ustawień -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Personalizacja awatara -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div class="px-6 py-4 flex items-center">
            <div
              class="w-10 h-10 rounded-md bg-blue-500 text-white flex items-center justify-center mr-3"
            >
              <img src="@/assets/icons/user.svg" alt="Ikona użytkownika" class="w-6 h-6" />
            </div>
            <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Personalizacja awatara
            </h2>
          </div>
        </div>

        <div class="p-6">
          <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Wybierz styl i kolor, który najlepiej Cię reprezentuje.
          </p>

          <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            <!-- Koło wyboru koloru -->
            <div class="flex flex-col items-center justify-center">
              <h3
                class="text-sm uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-4"
              >
                Podgląd i kolor
              </h3>
              <div class="relative w-64 h-64 mb-4">
                <canvas
                  ref="colorWheelCanvas"
                  class="rounded-full cursor-pointer shadow-inner"
                  width="256"
                  height="256"
                  @mousedown="startColorSelection"
                  @touchstart="startColorSelection"
                ></canvas>
                <div
                  class="absolute w-6 h-6 rounded-full border-2 border-white shadow-md transition-transform duration-200 pointer-events-none"
                  :style="{
                    left: `${selectorPosition.x - 12}px`,
                    top: `${selectorPosition.y - 12}px`,
                    backgroundColor: selectedColor,
                  }"
                ></div>
              </div>
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-full shadow-lg border-2 border-white dark:border-gray-700"
                  :style="{ backgroundColor: selectedColor }"
                ></div>
                <p class="font-mono text-lg text-gray-800 dark:text-gray-200">
                  {{ selectedColor.toUpperCase() }}
                </p>
              </div>
              <BaseButton
                color="blue"
                @click="updateAvatarColor(selectedColor)"
                class="mt-4"
                :disabled="selectedColor === user?.avatarColors"
              >
                Zapisz kolor
              </BaseButton>
            </div>

            <!-- Wybór stylu awatara -->
            <div class="flex flex-col">
              <h3
                class="text-sm uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-4 text-center md:text-left"
              >
                Wybierz styl
              </h3>
              <div
                class="flex flex-wrap gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-700 max-h-80 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 dark:scrollbar-track-gray-800"
              >
                <button
                  v-for="i in 17"
                  :key="`avatar-select-${i - 1}`"
                  @click="selectAvatar(i - 1)"
                  class="rounded-full p-1 transition-all duration-200 focus:outline-none relative hover:bg-gray-200 dark:hover:bg-gray-600"
                  :class="{
                    'ring-2 ring-blue-500 scale-110': currentAvatarIndex === i - 1,
                    'bg-gray-300 dark:bg-gray-500': user?.avatar === i - 1,
                  }"
                >
                  <Avatar :avatar-index="i - 1" :color="selectedColor" :size="56" />
                </button>
              </div>
              <BaseButton
                color="blue"
                @click="updateAvatar(currentAvatarIndex)"
                class="mt-4"
                :disabled="currentAvatarIndex === user?.avatar"
              >
                Zapisz styl
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-8">
        <!-- Personalizacja motywu -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-fit">
          <div
            class="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
          >
            <div class="px-6 py-4 flex items-center">
              <div
                class="w-10 h-10 rounded-md bg-purple-500 text-white flex items-center justify-center mr-3"
              >
                <img src="@/assets/icons/theme.svg" alt="Ikona motywu" class="w-6 h-6" />
              </div>
              <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Personalizacja motywu
              </h2>
            </div>
          </div>

          <div class="p-6">
            <div class="flex flex-col md:flex-row gap-6">
              <!-- Jasny motyw -->
              <ThemeOption
                :active="theme === 'light'"
                theme-name="light"
                title="Jasny motyw"
                @select="theme = 'light'"
              />

              <!-- Ciemny motyw -->
              <ThemeOption
                :active="theme === 'dark'"
                theme-name="dark"
                title="Ciemny motyw"
                @select="theme = 'dark'"
              />
            </div>

            <BaseButton
              color="blue"
              @click="saveTheme"
              class="w-full py-3 flex items-center justify-center gap-2 mt-6 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Zapisz motyw</span>
            </BaseButton>
          </div>
        </div>

        <!-- Zmiana hasła -->
        <PasswordChangeForm :user="user" @password-changed="onPasswordChanged" />
      </div>
    </div>

    <!-- Ukrywanie kategorii -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
      <div class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div class="px-6 py-4 flex items-center">
          <div
            class="w-10 h-10 rounded-md bg-yellow-400 text-white flex items-center justify-center mr-3"
          >
            <img src="@/assets/icons/bulb.svg" alt="Ikona kategorii" class="w-6 h-6" />
          </div>
          <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100">Ukryj kategorie</h2>
        </div>
      </div>

      <div class="p-6">
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Kliknij na kategorię, aby ją ukryć. I zapisz.
        </p>

        <div
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 dark:scrollbar-track-gray-800 p-1"
        >
          <button
            v-for="category in allCategories"
            :key="category"
            @click="toggleCategory(getCategoryNameForDisplay(category))"
            class="px-3 py-2 text-sm font-medium rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500"
            :class="
              selectedHiddenCategories.includes(getCategoryNameForDisplay(category))
                ? 'bg-blue-500 border-blue-500 text-white line-through hover:bg-blue-600'
                : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            "
          >
            {{ getCategoryNameForDisplay(category) }}
          </button>
        </div>

        <BaseButton
          color="blue"
          @click="saveHiddenCategories"
          class="w-full py-3 flex items-center justify-center gap-2 mt-6 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Zapisz zmiany</span>
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, inject, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import BaseButton from '@/components/base/BaseButton.vue';
import Avatar from '@/components/base/Avatar.vue';
import ThemeOption from '@/components/settings/ThemeOption.vue';
import PasswordChangeForm from '@/components/settings/PasswordChangeForm.vue';
import apiClient from '@/api';

// Globalny system alertów
const showAlert = inject('showAlert');
const store = useStore();

// Stan reaktywny
const theme = ref('light');
const selectorPosition = ref({ x: 0, y: 0 });
const selectedColor = ref('#3B82F6');
const currentAvatarIndex = ref(0);
const selectedHiddenCategories = ref([]);
const allCategories = ref([]);
const colorWheelCanvas = ref(null);

// Właściwości obliczeniowe
const user = computed(() => store.getters['user/getUser']);
const hiddenCategory = computed(() => user.value?.hiddenCategory || []);

// Rysowanie koła kolorów
const drawColorWheel = () => {
  const canvas = colorWheelCanvas.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Rysowanie koła kolorów
  for (let i = 0; i < 360; i++) {
    const angle = (i * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, angle, angle + Math.PI / 180);
    ctx.closePath();
    ctx.fillStyle = `hsl(${i}, 100%, 50%)`;
    ctx.fill();
  }

  // Gradienty dla koła kolorów
  const whiteGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  whiteGradient.addColorStop(0, 'rgba(255,255,255,1)');
  whiteGradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = whiteGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const blackGradient = ctx.createRadialGradient(
    centerX,
    centerY,
    radius * 0.75,
    centerX,
    centerY,
    radius
  );
  blackGradient.addColorStop(0, 'rgba(0,0,0,0)');
  blackGradient.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.fillStyle = blackGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

// Konwersja HEX na HSL (dla pozycjonowania selektora na kole kolorów)
const hexToHsl = (hex) => {
  // Konwersja hex na RGB
  let r, g, b;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16) / 255;
    g = parseInt(hex[2] + hex[2], 16) / 255;
    b = parseInt(hex[3] + hex[3], 16) / 255;
  } else {
    r = parseInt(hex.slice(1, 3), 16) / 255;
    g = parseInt(hex.slice(3, 5), 16) / 255;
    b = parseInt(hex.slice(5, 7), 16) / 255;
  }

  // Konwersja RGB na HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  return { h, s: s * 100, l: l * 100 };
};

// Aktualizacja pozycji selektora na kole kolorów na podstawie koloru HEX
const updateSelectorPositionFromColor = (hexColor) => {
  const { h, s, l } = hexToHsl(hexColor);
  const canvas = colorWheelCanvas.value;
  if (!canvas) return;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY);
  const angleInRadians = (h * Math.PI) / 180;
  const distance = (s / 100) * radius * (1 - (l / 100 - 0.5) * 1.5);

  selectorPosition.value = {
    x: centerX + distance * Math.cos(angleInRadians),
    y: centerY + distance * Math.sin(angleInRadians),
  };
};

// Obsługa motywu
const saveTheme = async () => {
  try {
    await apiClient.put('/users/update-profile', { option: theme.value });
    store.dispatch('ui/setTheme', theme.value);

    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const updatedUser = { ...user.value, option: theme.value };
    store.commit('user/SET_USER', updatedUser);
    sessionStorage.setItem('user', JSON.stringify(updatedUser));

    showAlert('success', 'Motyw zapisany pomyślnie!');
  } catch (error) {
    showAlert('error', 'Błąd zapisu motywu.');
  }
};

// Obsługa zmiany hasła
const onPasswordChanged = (success, message) => {
  showAlert(success ? 'success' : 'error', message);
};

// Obsługa awatara
const updateAvatar = async (index) => {
  if (index === user.value?.avatar) return;

  try {
    await apiClient.put('/users/update-profile', { avatar: index });

    const updatedUser = { ...user.value, avatar: index };
    store.commit('user/SET_USER', updatedUser);
    sessionStorage.setItem('user', JSON.stringify(updatedUser));

    showAlert('success', 'Styl awatara został zaktualizowany');
  } catch (error) {
    showAlert('error', 'Nie udało się zaktualizować stylu awatara');
  }
};

const updateAvatarColor = async (colorHex) => {
  if (colorHex === user.value?.avatarColors) return;

  try {
    await apiClient.put('/users/update-profile', { avatarColors: colorHex });

    const updatedUser = { ...user.value, avatarColors: colorHex };
    store.commit('user/SET_USER', updatedUser);
    sessionStorage.setItem('user', JSON.stringify(updatedUser));

    showAlert('success', 'Kolor awatara został zaktualizowany');
  } catch (error) {
    showAlert('error', 'Nie udało się zaktualizować koloru awatara');
  }
};

const selectAvatar = (index) => {
  if (index >= 0 && index < 17) {
    currentAvatarIndex.value = index;
  }
};

// Obsługa wyboru koloru
const startColorSelection = (event) => {
  event.preventDefault();
  updateColorFromEvent(event);

  document.addEventListener('mousemove', onColorMouseMove);
  document.addEventListener('mouseup', stopColorSelection);

  // Poprawiona obsługa zdarzeń dotykowych - używamy passive: false aby preventDefault działało
  document.addEventListener('touchmove', onColorTouchMove, { passive: false });
  document.addEventListener('touchend', stopColorSelection);
};

const onColorMouseMove = (event) => updateColorFromEvent(event);

const onColorTouchMove = (event) => {
  event.preventDefault(); // To zadziała tylko z passive: false
  updateColorFromEvent(event);
};

const updateColorFromEvent = (event) => {
  const canvas = colorWheelCanvas.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;

  const x = clientX - rect.left;
  const y = clientY - rect.top;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY);

  // Ograniczenie wyboru do koła
  const dx = x - centerX;
  const dy = y - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  let posX = x,
    posY = y;
  if (distance > radius) {
    const angle = Math.atan2(dy, dx);
    posX = centerX + radius * Math.cos(angle);
    posY = centerY + radius * Math.sin(angle);
  }

  selectorPosition.value = { x: posX, y: posY };

  // Odczytanie koloru
  const ctx = canvas.getContext('2d');
  const pixel = ctx.getImageData(posX, posY, 1, 1).data;
  selectedColor.value =
    '#' +
    ((1 << 24) | (pixel[0] << 16) | (pixel[1] << 8) | pixel[2]).toString(16).slice(1).toUpperCase();
};

const stopColorSelection = () => {
  document.removeEventListener('mousemove', onColorMouseMove);
  document.removeEventListener('mouseup', stopColorSelection);
  document.removeEventListener('touchmove', onColorTouchMove);
  document.removeEventListener('touchend', stopColorSelection);
};

// Obsługa kategorii
const saveHiddenCategories = async () => {
  try {
    const categoriesToSave = selectedHiddenCategories.value.map((cat) =>
      cat === 'Pytania bez kategorii' ? '' : cat
    );

    await apiClient.put('/users/update-profile', { hiddenCategory: categoriesToSave });

    const updatedUser = { ...user.value, hiddenCategory: categoriesToSave };
    store.commit('user/SET_USER', updatedUser);
    sessionStorage.setItem('user', JSON.stringify(updatedUser));

    showAlert('success', 'Ukryte kategorie zapisane!');
  } catch (e) {
    showAlert('error', 'Błąd zapisu ukrytych kategorii');
  }
};

const toggleCategory = (catDisplayName) => {
  const index = selectedHiddenCategories.value.indexOf(catDisplayName);
  if (index > -1) {
    selectedHiddenCategories.value.splice(index, 1);
  } else {
    selectedHiddenCategories.value.push(catDisplayName);
  }
};

const getCategoryNameForDisplay = (categoryName) =>
  categoryName === '' ? 'Pytania bez kategorii' : categoryName;

// Inicjalizacja komponentu
onMounted(async () => {
  // Ustawienie początkowego stanu
  theme.value = user.value?.option || 'light';
  if (theme.value === 'dark') document.documentElement.classList.add('dark');

  selectedColor.value = user.value?.avatarColors || '#3B82F6';
  currentAvatarIndex.value = user.value?.avatar || 0;

  // Inicjalizacja koła kolorów
  drawColorWheel();
  nextTick(() => updateSelectorPositionFromColor(selectedColor.value));

  // Pobieranie kategorii
  try {
    await store.dispatch('questions/fetchStats');
    allCategories.value = store.getters['questions/getCategories']
      .filter((name) => name !== '')
      .sort((a, b) => a.localeCompare(b));

    allCategories.value.unshift(''); // Dodaj kategorię dla pytań bez kategorii

    selectedHiddenCategories.value = hiddenCategory.value.map((cat) =>
      getCategoryNameForDisplay(cat)
    );
  } catch (e) {
    showAlert('error', 'Nie udało się pobrać kategorii');
  }
});
</script>

<style scoped>
/* Zastosuj style tylko w tym komponencie */
</style>
