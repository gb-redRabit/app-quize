<template>
  <div class="container mx-auto p-4">
    <div
      class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg mb-8 p-6 flex items-center justify-between"
    >
      <div class="flex items-center">
        <div
          class="w-20 h-20 bg-white/20 rounded-full p-1 shadow-xl mr-4 flex items-center justify-center backdrop-blur-sm"
        >
          <Avatar
            :avatar-index="getUser.avatar || 0"
            :color="getUser.avatarColors || '#60A5FA'"
            :size="72"
          />
        </div>
        <div>
          <h1 class="text-3xl font-bold text-white">Panel użytkownika</h1>
          <p class="text-blue-100 text-lg">Cześć, {{ getUser.login || 'użytkowniku' }}!</p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-blue-100 text-sm md:text-2xl">Zarządzaj swoim profilem i preferencjami.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div class="px-6 py-4 flex items-center">
            <div
              class="w-10 h-10 rounded-md bg-blue-500 text-white flex items-center justify-center mr-3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Personalizacja awatara
            </h2>
          </div>
        </div>

        <div class="p-6">
          <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Wybierz styl i kolor, który najlepiej Cię reprezentuje. Zmiany są widoczne od razu na
            podglądzie.
          </p>

          <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
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
                >
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
                :disabled="selectedColor === getUser.avatarColors"
              >
                Zapisz kolor
              </BaseButton>
            </div>

            <div class="flex flex-col">
              <h3
                class="text-sm uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-4 text-center md:text-left"
              >
                Wybierz styl
              </h3>
              <div
                class="flex flex-wrap gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-700 max-h-80 overflow-y-auto"
              >
                <button
                  v-for="i in 17"
                  :key="`avatar-select-${i - 1}`"
                  @click="selectAvatar(i - 1)"
                  class="rounded-full p-1 transition-all duration-200 focus:outline-none relative"
                  :class="{
                    'ring-2 ring-blue-500 scale-110': currentAvatarIndex === i - 1,
                    'hover:bg-gray-200 dark:hover:bg-gray-600': currentAvatarIndex !== i - 1,
                    'bg-gray-300 dark:bg-gray-500': getUser.avatar === i - 1,
                  }"
                >
                  <Avatar :avatar-index="i - 1" :color="selectedColor" :size="56" />
                </button>
              </div>
              <BaseButton
                color="blue"
                @click="updateAvatar(currentAvatarIndex)"
                class="mt-4"
                :disabled="currentAvatarIndex === getUser.avatar"
              >
                Zapisz styl
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-8">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-fit">
          <div
            class="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
          >
            <div class="px-6 py-4 flex items-center">
              <div
                class="w-10 h-10 rounded-md bg-purple-500 text-white flex items-center justify-center mr-3"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                  <path
                    fill-rule="evenodd"
                    d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Personalizacja motywu
              </h2>
            </div>
          </div>

          <div class="p-6">
            <div class="flex flex-col md:flex-row gap-6">
              <div
                class="flex-1 relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 group"
                :class="{
                  'ring-4 ring-blue-400': theme === 'light',
                }"
                @click="theme = 'light'"
              >
                <div
                  v-if="theme === 'light'"
                  class="absolute top-3 right-3 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center z-10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div
                  class="bg-white border border-gray-200 shadow-sm transform group-hover:scale-105 transition-transform duration-300"
                >
                  <div
                    class="bg-gray-100 border-b border-gray-200 px-3 py-2 flex items-center gap-1.5"
                  >
                    <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div class="p-4 space-y-2">
                    <div class="h-2 w-16 bg-blue-500 rounded"></div>
                    <div class="h-2 w-full bg-gray-300 rounded"></div>
                    <div class="h-2 w-2/3 bg-gray-300 rounded"></div>
                  </div>
                  <div
                    class="p-3 bg-gray-50 border-t border-gray-200 text-center text-sm font-medium text-gray-700"
                  >
                    Jasny motyw
                  </div>
                </div>
              </div>

              <div
                class="flex-1 relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 group"
                :class="{
                  'ring-4 ring-blue-400': theme === 'dark',
                }"
                @click="theme = 'dark'"
              >
                <div
                  v-if="theme === 'dark'"
                  class="absolute top-3 right-3 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center z-10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div
                  class="bg-gray-900 border border-gray-700 shadow-sm transform group-hover:scale-105 transition-transform duration-300"
                >
                  <div
                    class="bg-gray-800 border-b border-gray-700 px-3 py-2 flex items-center gap-1.5"
                  >
                    <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div class="p-4 space-y-2">
                    <div class="h-2 w-16 bg-blue-500 rounded"></div>
                    <div class="h-2 w-full bg-gray-700 rounded"></div>
                    <div class="h-2 w-2/3 bg-gray-700 rounded"></div>
                  </div>
                  <div
                    class="p-3 bg-gray-800 border-t border-gray-700 text-center text-sm font-medium text-gray-300"
                  >
                    Ciemny motyw
                  </div>
                </div>
              </div>
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

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-fit">
          <div
            class="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
          >
            <div class="px-6 py-4 flex items-center">
              <div
                class="w-10 h-10 rounded-md bg-green-500 text-white flex items-center justify-center mr-3"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">Zmiana hasła</h2>
            </div>
          </div>

          <div class="p-6">
            <div class="space-y-4">
              <div class="w-full">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >Stare hasło</label
                >
                <div
                  class="relative flex items-center overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="absolute left-3 w-5 h-5 text-gray-400 dark:text-gray-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-2h2v-2H6v-2h2v-2H6V8h2V6H6V4h2V2h2v2h2v2h2v2h2v2h-2v2h2v2h-2v-2h-2v-2h-2v-2h2v-2h2V8zm-8 6v-4h4v4h-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <input
                    v-model="oldPassword"
                    type="password"
                    placeholder="Wprowadź aktualne hasło"
                    class="w-full p-3 pl-10 bg-transparent border-none outline-none text-gray-700 dark:text-gray-300"
                  />
                </div>
              </div>

              <div class="w-full">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >Nowe hasło</label
                >
                <div
                  class="relative flex items-center overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="absolute left-3 w-5 h-5 text-gray-400 dark:text-gray-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <input
                    v-model="newPassword"
                    type="password"
                    placeholder="Wprowadź nowe hasło"
                    class="w-full p-3 pl-10 bg-transparent border-none outline-none text-gray-700 dark:text-gray-300"
                  />
                </div>
              </div>

              <div class="w-full">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >Powtórz nowe hasło</label
                >
                <div
                  class="relative flex items-center overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="absolute left-3 w-5 h-5 text-gray-400 dark:text-gray-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <input
                    v-model="newPassword2"
                    type="password"
                    placeholder="Potwierdź nowe hasło"
                    class="w-full p-3 pl-10 bg-transparent border-none outline-none text-gray-700 dark:text-gray-300"
                  />
                </div>
              </div>

              <div v-if="passwordMatch !== null" class="flex items-center gap-2 text-sm mt-2">
                <svg
                  v-if="passwordMatch"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="w-4 h-4 text-green-500"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="w-4 h-4 text-red-500"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span :class="{ 'text-green-600': passwordMatch, 'text-red-600': !passwordMatch }">
                  {{ passwordMatch ? 'Hasła są identyczne' : 'Hasła nie są identyczne' }}
                </span>
              </div>

              <BaseButton
                color="green"
                @click="changePassword"
                class="w-full flex items-center justify-center gap-2 mt-4 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Zmień hasło</span>
              </BaseButton>

              <div
                v-if="passwordMsg"
                class="flex items-center gap-2 p-3 mt-4 rounded-lg text-sm"
                :class="{
                  'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800':
                    passwordMsgType.includes('green'),
                  'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800':
                    passwordMsgType.includes('red'),
                }"
              >
                <svg
                  v-if="passwordMsgType.includes('green')"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
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

    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
      <div class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div class="px-6 py-4 flex items-center">
          <div
            class="w-10 h-10 rounded-md bg-yellow-400 text-white flex items-center justify-center mr-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M10 3.5a1.5 1.5 0 01.954 2.753l-2.454 2.453A3.501 3.501 0 007.5 13.5V15a1 1 0 001 1h3a1 1 0 001-1v-1.5a3.5 3.5 0 00-2.957-3.453L12.5 7.58A1.5 1.5 0 0110 3.5zM7.547 14.53A2.5 2.5 0 019.5 10.96V10h1v.96a2.5 2.5 0 011.953 3.57A1 1 0 0111.5 15h-2a1 1 0 01-.953-.47z"
              />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100">Ukryj kategorie</h2>
        </div>
      </div>

      <div class="p-6">
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Kliknij na kategorię, aby ją ukryć. I zapisz.
        </p>

        <div
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-1"
        >
          <button
            v-for="(category, index) in allCategories"
            :key="category"
            @click="toggleCategory(getCategoryNameForDisplay(category, index))"
            class="px-3 py-2 text-sm font-medium rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500"
            :class="
              selectedHiddenCategories.includes(getCategoryNameForDisplay(category, index))
                ? 'bg-blue-500 border-blue-500 text-white line-through hover:bg-blue-600'
                : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            "
          >
            {{ getCategoryNameForDisplay(category, index) }}
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

<script>
// Logika skryptu pozostaje bez zmian
import { mapState, mapActions, mapGetters } from 'vuex';
import BaseButton from '@/components/BaseButton.vue';
import Avatar from '@/components/Avatar.vue';
import apiClient from '@/api';

export default {
  components: { BaseButton, Avatar },
  inject: ['showAlert', 'showLoader', 'hideLoader'],
  data() {
    return {
      theme: 'light',
      oldPassword: '',
      newPassword: '',
      newPassword2: '',
      passwordMsg: '',
      passwordMsgType: 'text-green-600',
      selectorPosition: { x: 0, y: 0 },
      selectedColor: '#3B82F6', // Domyślny kolor
      currentAvatarIndex: 0,
      selectedHiddenCategories: [],
      allCategories: [],
    };
  },
  computed: {
    ...mapState('user', ['user']),
    ...mapGetters('ui', ['currentTheme']),
    passwordMatch() {
      if (!this.newPassword && !this.newPassword2) return null;
      return this.newPassword === this.newPassword2;
    },
    ...mapGetters('user', ['getUser']),
    hiddenCategory() {
      return this.getUser.hiddenCategory || [];
    },
  },
  async mounted() {
    this.theme = this.user.option || 'light';
    this.applyThemeToHtml(this.theme);

    this.selectedColor = this.getUser.avatarColors || '#3B82F6';
    this.currentAvatarIndex = this.getUser.avatar || 0;

    this.drawColorWheel();
    this.$nextTick(() => {
      this.updateSelectorPositionFromColor(this.selectedColor);
    });

    try {
      this.showLoader('Pobieranie kategorii...');
      // Pobierz kategorie z Vuex
      await this.$store.dispatch('questions/fetchStats');
      this.allCategories = this.$store.getters['questions/getCategories']
        .filter((name) => name !== '')
        .sort((a, b) => a.localeCompare(b));
      this.selectedHiddenCategories = this.hiddenCategory.map((cat) =>
        this.getCategoryNameForDisplay(cat)
      );
    } catch (e) {
      console.error('Błąd pobierania kategorii:', e);
      this.showAlert('error', 'Nie udało się pobrać kategorii');
    } finally {
      this.hideLoader();
    }
  },
  methods: {
    ...mapActions('ui', ['setTheme']),
    drawColorWheel() {
      const canvas = this.$refs.colorWheelCanvas;
      if (!canvas) return;
      // Poprawka: dodaj willReadFrequently: true
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 360; i++) {
        const angle = (i * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle, angle + Math.PI / 180);
        ctx.closePath();
        ctx.fillStyle = `hsl(${i}, 100%, 50%)`;
        ctx.fill();
      }

      const gradientWhite = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradientWhite.addColorStop(0, 'rgba(255,255,255,1)');
      gradientWhite.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradientWhite;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradientBlack = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.75,
        centerX,
        centerY,
        radius
      );
      gradientBlack.addColorStop(0, 'rgba(0,0,0,0)');
      gradientBlack.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = gradientBlack;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    hexToHsl(hex) {
      let r = 0,
        g = 0,
        b = 0;
      if (hex.length == 4) {
        r = '0x' + hex[1] + hex[1];
        g = '0x' + hex[2] + hex[2];
        b = '0x' + hex[3] + hex[3];
      } else if (hex.length == 7) {
        r = '0x' + hex[1] + hex[2];
        g = '0x' + hex[3] + hex[4];
        b = '0x' + hex[5] + hex[6];
      }
      r /= 255;
      g /= 255;
      b /= 255;
      let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;
      if (delta == 0) h = 0;
      else if (cmax == r) h = ((g - b) / delta) % 6;
      else if (cmax == g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
      h = Math.round(h * 60);
      if (h < 0) h += 360;
      l = (cmax + cmin) / 2;
      s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
      s = +(s * 100).toFixed(1);
      l = +(l * 100).toFixed(1);
      return { h, s, l };
    },
    updateSelectorPositionFromColor(hexColor) {
      const { h, s, l } = this.hexToHsl(hexColor);
      const canvas = this.$refs.colorWheelCanvas;
      if (!canvas) return;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY);
      const angleInRadians = (h * Math.PI) / 180;
      const distance = (s / 100) * radius * (1 - (l / 100 - 0.5) * 1.5);

      const x = centerX + distance * Math.cos(angleInRadians);
      const y = centerY + distance * Math.sin(angleInRadians);

      this.selectorPosition = { x, y };
    },
    async saveTheme() {
      this.showLoader('Zapisywanie motywu...');
      try {
        await apiClient.put('/users/update-profile', { option: this.theme });
        this.setTheme(this.theme);
        this.applyThemeToHtml(this.theme);
        const updatedUser = { ...this.getUser, option: this.theme };
        this.$store.commit('user/SET_USER', updatedUser);
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        this.showAlert('success', 'Motyw zapisany pomyślnie!');
      } catch (error) {
        this.showAlert('error', 'Błąd zapisu motywu.');
      } finally {
        this.hideLoader();
      }
    },
    applyThemeToHtml(theme) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    async changePassword() {
      this.passwordMsg = '';
      if (!this.oldPassword || !this.newPassword || !this.newPassword2) {
        this.showAlert('warning', 'Wypełnij wszystkie pola.');
        return;
      }
      if (this.newPassword !== this.newPassword2) {
        this.showAlert('error', 'Nowe hasła nie są takie same.');
        return;
      }
      this.showLoader('Zmiana hasła...');
      try {
        await apiClient.put('/users/update-profile', {
          changePassword: true,
          oldPassword: this.oldPassword,
          newPassword: this.newPassword,
        });
        this.oldPassword = '';
        this.newPassword = '';
        this.newPassword2 = '';
        this.passwordMsgType = 'green';
        this.passwordMsg = 'Hasło zostało zmienione pomyślnie!';
      } catch (e) {
        this.passwordMsgType = 'red';
        this.passwordMsg = 'Błąd zmiany hasła. Sprawdź, czy stare hasło jest poprawne.';
      } finally {
        this.hideLoader();
      }
    },
    async updateAvatar(index) {
      if (index === this.getUser.avatar) return;
      this.showLoader('Aktualizowanie stylu awatara...');
      try {
        await apiClient.put('/users/update-profile', { avatar: index });
        const updatedUser = { ...this.getUser, avatar: index };
        this.$store.commit('user/SET_USER', updatedUser);
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        this.showAlert('success', 'Styl awatara został zaktualizowany');
      } catch (error) {
        this.showAlert('error', 'Nie udało się zaktualizować stylu awatara');
      } finally {
        this.hideLoader();
      }
    },
    async updateAvatarColor(colorHex) {
      if (colorHex === this.getUser.avatarColors) return;
      this.showLoader('Aktualizowanie koloru awatara...');
      try {
        await apiClient.put('/users/update-profile', { avatarColors: colorHex });
        const updatedUser = { ...this.getUser, avatarColors: colorHex };
        this.$store.commit('user/SET_USER', updatedUser);
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        this.showAlert('success', 'Kolor awatara został zaktualizowany');
      } catch (error) {
        this.showAlert('error', 'Nie udało się zaktualizować koloru awatara');
      } finally {
        this.hideLoader();
      }
    },
    startColorSelection(event) {
      event.preventDefault();
      const canvas = this.$refs.colorWheelCanvas;
      if (!canvas) return;
      this.updateColorFromEvent(event);
      document.addEventListener('mousemove', this.onColorMouseMove);
      document.addEventListener('mouseup', this.stopColorSelection);
      document.addEventListener('touchmove', this.onColorTouchMove, { passive: false });
      document.addEventListener('touchend', this.stopColorSelection);
    },
    onColorMouseMove(event) {
      this.updateColorFromEvent(event);
    },
    onColorTouchMove(event) {
      event.preventDefault();
      this.updateColorFromEvent(event);
    },
    updateColorFromEvent(event) {
      const canvas = this.$refs.colorWheelCanvas;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      this.updateSelectedColor(x, y);
    },
    updateSelectedColor(x, y) {
      const canvas = this.$refs.colorWheelCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY);
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      let clampedX = x;
      let clampedY = y;

      if (distance > radius) {
        const angle = Math.atan2(dy, dx);
        clampedX = centerX + radius * Math.cos(angle);
        clampedY = centerY + radius * Math.sin(angle);
      }
      this.selectorPosition = { x: clampedX, y: clampedY };

      const imageData = ctx.getImageData(clampedX, clampedY, 1, 1).data;
      this.selectedColor =
        '#' +
        ((1 << 24) + (imageData[0] << 16) + (imageData[1] << 8) + imageData[2])
          .toString(16)
          .slice(1)
          .toUpperCase();
    },
    stopColorSelection() {
      document.removeEventListener('mousemove', this.onColorMouseMove);
      document.removeEventListener('mouseup', this.stopColorSelection);
      document.removeEventListener('touchmove', this.onColorTouchMove);
      document.removeEventListener('touchend', this.stopColorSelection);
    },
    selectAvatar(index) {
      if (index >= 0 && index < 17) {
        this.currentAvatarIndex = index;
      }
    },
    async saveHiddenCategories() {
      this.showLoader('Zapisywanie ukrytych kategorii...');
      try {
        const categoriesToSave = this.selectedHiddenCategories.map((cat) =>
          cat === 'Pytania bez kategorii' ? '' : cat
        );
        await apiClient.put('/users/update-profile', { hiddenCategory: categoriesToSave });
        const updatedUser = { ...this.getUser, hiddenCategory: categoriesToSave };
        this.$store.commit('user/SET_USER', updatedUser);
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        this.showAlert('success', 'Ukryte kategorie zapisane!');
      } catch (e) {
        this.showAlert('error', 'Błąd zapisu ukrytych kategorii');
      } finally {
        this.hideLoader();
      }
    },
    toggleCategory(catDisplayName) {
      const index = this.selectedHiddenCategories.indexOf(catDisplayName);
      if (index > -1) {
        this.selectedHiddenCategories.splice(index, 1);
      } else {
        this.selectedHiddenCategories.push(catDisplayName);
      }
    },
    getCategoryNameForDisplay(categoryName) {
      return categoryName === '' ? 'Pytania bez kategorii' : categoryName;
    },
  },
};
</script>

<style scoped>
/* These styles are for scrollbar customization, which is not directly supported by Tailwind 2.2.17 utility classes.
   They remain here as custom CSS. If you need to manage these with Tailwind, consider using a custom plugin
   or a newer version of Tailwind that supports arbitrary values for scrollbar styling. */
.max-h-80 {
  scrollbar-width: thin;
  scrollbar-color: #9ca3af #f3f4f6;
}
.dark .max-h-80 {
  scrollbar-color: #4b5563 #374151;
}
.max-h-80::-webkit-scrollbar {
  width: 8px;
}
.max-h-80::-webkit-scrollbar-track {
  background-color: #f3f4f6;
  border-radius: 10px;
}
.dark .max-h-80::-webkit-scrollbar-track {
  background-color: #1e293b; /* slate-800 */
}
.max-h-80::-webkit-scrollbar-thumb {
  background-color: #9ca3af;
  border-radius: 10px;
  border: 2px solid #f3f4f6;
}
.dark .max-h-80::-webkit-scrollbar-thumb {
  background-color: #475569; /* slate-600 */
  border-color: #1e293b; /* slate-800 */
}
</style>
