<template>
  <!-- Nagłówek z avatarem -->
  <div class="container mx-auto p-4 max-w-4xl">
    <div
      class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg mb-6 p-5 flex items-center"
    >
      <div
        class="w-16 h-16 bg-white rounded-full p-1 shadow-xl mr-4 flex items-center justify-center"
      >
        <Avatar
          :avatar-index="getUser.avatar || 0"
          :color="getUser.avatarColors || '#3B82F6'"
          :size="56"
        />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-white">Panel użytkownika</h1>
        <p class="text-blue-100">Cześć, {{ getUser.login || 'użytkowniku' }}!</p>
      </div>
    </div>

    <!-- Sekcja personalizacji avatara - całkowicie przeprojektowana -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-8 overflow-hidden">
      <!-- Nagłówek sekcji z kolorowym akcentem -->
      <div
        class="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
      >
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
          <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Personalizacja avatara
          </h2>
        </div>
      </div>

      <div class="p-6">
        <!-- Interaktywny podgląd avatara -->
        <div class="flex flex-col md:flex-row items-center gap-8 mb-8">
          <div class="relative">
            <!-- Duży podgląd z efektem cienia -->
            <div
              class="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full opacity-75 blur"
            ></div>
            <div class="relative bg-white dark:bg-gray-900 rounded-full p-3 shadow-lg">
              <Avatar
                :avatar-index="getUser.avatar || 0"
                :color="getUser.avatarColors || '#3B82F6'"
                :size="128"
              />
            </div>
          </div>

          <div class="flex-1 space-y-4">
            <div>
              <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                Jak wygląda twój avatar?
              </h3>
              <p class="text-gray-500 dark:text-gray-400 text-sm mb-4">
                Wybierz styl i kolor, który najlepiej cię reprezentuje.
              </p>
            </div>

            <!-- Statystyki -->
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <p class="text-xs text-gray-500 dark:text-gray-400">Aktualny styl</p>
                <p class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Styl #{{ getUser.avatar + 1 || 1 }}
                </p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <p class="text-xs text-gray-500 dark:text-gray-400">Aktualny kolor</p>
                <p class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Kolor #{{ getUser.avatarColors + 1 || 1 }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Style avatara w formie karuzeli z nawigacją -->
        <div class="mb-8">
          <h3
            class="text-sm uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-4 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fill-rule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clip-rule="evenodd"
              />
            </svg>
            Wybierz styl avatara
          </h3>

          <!-- Karuzela z avatarami -->
          <div class="avatar-carousel">
            <!-- Podgląd avatara -->
            <div class="avatar-showcase">
              <div
                class="avatar-current"
                :style="{ transform: `translateX(${-currentAvatarIndex * 100}%)` }"
              >
                <div v-for="i in 17" :key="`showcase-avatar-${i - 1}`" class="avatar-item">
                  <div class="avatar-card">
                    <div class="avatar-preview">
                      <Avatar :avatar-index="i - 1" :color="selectedColor" :size="120" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Kontrolki nawigacji -->
            <div class="avatar-controls">
              <button
                @click="prevAvatar"
                class="nav-button prev-button"
                :disabled="currentAvatarIndex === 0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    fill-rule="evenodd"
                    d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>

              <!-- Miniatury avatarów (pokazuje 5 na raz) -->
              <div class="avatar-thumbnails">
                <button
                  v-for="i in 5"
                  :key="`thumb-${getThumbIndex(i)}`"
                  @click="selectAvatar(getThumbIndex(i))"
                  class="thumb-button"
                  :class="{ active: getUser.avatar === getThumbIndex(i) }"
                >
                  <Avatar :avatar-index="getThumbIndex(i)" :color="selectedColor" :size="40" />
                </button>
              </div>

              <button
                @click="nextAvatar"
                class="nav-button next-button"
                :disabled="currentAvatarIndex === 16"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    fill-rule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <!-- Wskaźnik pozycji -->
            <div class="avatar-indicator">
              <div class="indicator-dots">
                <button
                  v-for="group in 6"
                  :key="`dot-${group}`"
                  @click="jumpToAvatarGroup(group - 1)"
                  class="indicator-dot"
                  :class="{ active: Math.floor(currentAvatarIndex / 3) === group - 1 }"
                ></button>
              </div>

              <!-- Przycisk wyboru -->
              <BaseButton
                color="blue"
                @click="updateAvatar(currentAvatarIndex)"
                class="select-avatar-button"
                :disabled="getUser.avatar === currentAvatarIndex"
              >
                <span v-if="getUser.avatar === currentAvatarIndex">Wybrany avatar</span>
                <span v-else>Wybierz avatar</span>
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- Kolory avatara jako interaktywne koło barw -->
        <div>
          <h3
            class="text-sm uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-4 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z"
                clip-rule="evenodd"
              />
            </svg>
            Wybierz kolor avatara
          </h3>

          <!-- Interaktywne koło kolorów -->
          <div
            class="p-6 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700"
          >
            <div class="flex flex-col md:flex-row items-center gap-8">
              <!-- Koło kolorów -->
              <div class="relative w-64 h-64 mx-auto md:mx-0">
                <div
                  ref="colorWheel"
                  class="color-wheel-container"
                  @mousedown="startColorSelection"
                  @touchstart="startColorSelection"
                >
                  <!-- Koło barw jako tło -->
                  <div class="color-wheel"></div>

                  <!-- Wewnętrzny biały do czarnego gradient -->
                  <div class="brightness-gradient"></div>

                  <!-- Wskaźnik wyboru koloru -->
                  <div
                    class="color-selector"
                    :style="{
                      left: `${selectorPosition.x}px`,
                      top: `${selectorPosition.y}px`,
                      backgroundColor: selectedColor,
                    }"
                  ></div>
                </div>
              </div>

              <!-- Podgląd wybranego koloru -->
              <div class="flex-1 flex flex-col items-center md:items-start gap-4">
                <div class="flex items-center gap-4">
                  <div
                    class="w-16 h-16 rounded-full shadow-lg border-4 border-white dark:border-gray-700"
                    :style="{ backgroundColor: selectedColor }"
                  ></div>
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Wybrany kolor</p>
                    <p class="font-medium text-gray-800 dark:text-gray-200">
                      {{ selectedColor.toUpperCase() }}
                    </p>
                  </div>
                </div>

                <!-- Podgląd avatara z wybranym kolorem -->
                <div
                  class="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm flex items-center gap-4"
                >
                  <Avatar :avatar-index="getUser.avatar || 0" :color="selectedColor" :size="48" />
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Podgląd avatara</p>
                    <p class="font-medium text-gray-800 dark:text-gray-200">Z wybranym kolorem</p>
                  </div>
                </div>

                <!-- Przycisk zastosowania koloru -->
                <BaseButton
                  color="blue"
                  @click="updateAvatarColor(selectedColor)"
                  class="mt-2 flex items-center justify-center gap-2"
                  :disabled="selectedColor === getUser.avatarColors"
                >
                  <span>Zastosuj kolor</span>
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sekcja motywu - nowoczesny design -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-8 overflow-hidden">
      <!-- Nagłówek sekcji -->
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

      <!-- Wybór motywu z interaktywnymi kartami -->
      <div class="p-6">
        <div class="flex flex-col md:flex-row gap-6">
          <!-- Jasny motyw -->
          <div
            class="flex-1 relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300"
            :class="{
              'ring-4 ring-blue-400': theme === 'light',
              'hover:shadow-lg': theme !== 'light',
            }"
            @click="theme = 'light'"
          >
            <!-- Ikona wyboru -->
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

            <!-- Podgląd jasnego motywu -->
            <div class="bg-white border border-gray-200 shadow-sm">
              <!-- Nagłówek z kontrolkami okna -->
              <div class="bg-gray-100 border-b border-gray-200 px-3 py-2 flex items-center gap-1.5">
                <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <div class="flex-1 text-center">
                  <div class="h-2 w-24 bg-gray-300 rounded mx-auto"></div>
                </div>
              </div>

              <!-- Zawartość podglądu -->
              <div class="p-4">
                <div class="h-2 w-16 bg-blue-500 rounded mb-3"></div>
                <div class="h-2 w-32 bg-gray-300 rounded mb-2"></div>
                <div class="h-2 w-24 bg-gray-300 rounded mb-4"></div>
                <div class="h-10 bg-gray-100 rounded flex items-center justify-center mb-3">
                  <div class="w-6 h-6 bg-blue-500 rounded-full"></div>
                </div>
                <div class="flex gap-2 mb-2">
                  <div class="h-6 w-6 bg-gray-200 rounded"></div>
                  <div class="h-6 flex-1 bg-gray-200 rounded"></div>
                </div>
                <div class="flex gap-2">
                  <div class="h-6 w-6 bg-gray-200 rounded"></div>
                  <div class="h-6 flex-1 bg-gray-200 rounded"></div>
                </div>
              </div>

              <!-- Etykieta -->
              <div
                class="p-3 bg-gray-50 border-t border-gray-200 text-center text-sm font-medium text-gray-700"
              >
                Jasny motyw
              </div>
            </div>
          </div>

          <!-- Ciemny motyw -->
          <div
            class="flex-1 relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300"
            :class="{
              'ring-4 ring-blue-400': theme === 'dark',
              'hover:shadow-lg': theme !== 'dark',
            }"
            @click="theme = 'dark'"
          >
            <!-- Ikona wyboru -->
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

            <!-- Podgląd ciemnego motywu -->
            <div class="bg-gray-900 border border-gray-700 shadow-sm">
              <!-- Nagłówek z kontrolkami okna -->
              <div class="bg-gray-800 border-b border-gray-700 px-3 py-2 flex items-center gap-1.5">
                <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <div class="flex-1 text-center">
                  <div class="h-2 w-24 bg-gray-600 rounded mx-auto"></div>
                </div>
              </div>

              <!-- Zawartość podglądu -->
              <div class="p-4">
                <div class="h-2 w-16 bg-blue-500 rounded mb-3"></div>
                <div class="h-2 w-32 bg-gray-700 rounded mb-2"></div>
                <div class="h-2 w-24 bg-gray-700 rounded mb-4"></div>
                <div class="h-10 bg-gray-800 rounded flex items-center justify-center mb-3">
                  <div class="w-6 h-6 bg-blue-500 rounded-full"></div>
                </div>
                <div class="flex gap-2 mb-2">
                  <div class="h-6 w-6 bg-gray-700 rounded"></div>
                  <div class="h-6 flex-1 bg-gray-700 rounded"></div>
                </div>
                <div class="flex gap-2">
                  <div class="h-6 w-6 bg-gray-700 rounded"></div>
                  <div class="h-6 flex-1 bg-gray-700 rounded"></div>
                </div>
              </div>

              <!-- Etykieta -->
              <div
                class="p-3 bg-gray-800 border-t border-gray-700 text-center text-sm font-medium text-gray-300"
              >
                Ciemny motyw
              </div>
            </div>
          </div>
        </div>

        <!-- Przycisk zapisz -->
        <BaseButton
          color="blue"
          @click="saveTheme"
          class="w-full py-3 flex items-center justify-center gap-2 mt-6 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Zapisz motyw</span>
        </BaseButton>
      </div>
    </div>

    <!-- Sekcja zmiany hasła - nowoczesny design -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <!-- Nagłówek sekcji -->
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

      <!-- Formularz zmiany hasła -->
      <div class="p-6">
        <div class="space-y-4">
          <!-- Stare hasło -->
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
                  d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-2h2v-2H6v-2h2v-2H6V8h2V6H6V4h2V2h2v2h2v2h2v2h2v2h-2v2h2v2h-2v2h-2v-2h-2v-2h-2v-2h2v-2h2V8zm-8 6v-4h4v4h-4z"
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

          <!-- Nowe hasło -->
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

          <!-- Powtórz nowe hasło -->
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

          <!-- Wskaźnik zgodności haseł -->
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

          <!-- Przycisk zmiany hasła -->
          <BaseButton
            color="green"
            @click="changePassword"
            class="w-full flex items-center justify-center gap-2 mt-4 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Zmień hasło</span>
          </BaseButton>

          <!-- Komunikat zwrotny -->
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
</template>

<script>
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
      availableColors: [
        '#3B82F6', // niebieski (domyślny)
        '#EF4444', // czerwony
        '#10B981', // zielony
        '#F59E0B', // pomarańczowy
        '#8B5CF6', // fioletowy
        '#EC4899', // różowy
        '#6366F1', // indigo
        '#14B8A6', // turkusowy
        '#F97316', // pomarańczowy-ciemny
        '#84CC16', // limonkowy
        '#2563EB', // niebieski royal
        '#9333EA', // fioletowy
        '#DC2626', // czerwony
        '#65A30D', // zielony limonkowy
        '#0891B2', // cyjan
        '#C026D3', // magenta
        '#D97706', // pomarańczowy bursztyn
        '#059669', // szmaragdowy
        '#7C3AED', // fioletowy indygo
        '#EA580C', // pomarańczowy czerwony
        '#0EA5E9', // błękitny
        '#D946EF', // jasny fiolet
        '#4ADE80', // jasny zielony
        '#F43F5E', // różowo-czerwony
        '#8D8D8D', // szary
      ],
      selectorPosition: { x: 0, y: 0 },
      selectedColor: '#3B82F6',
      currentAvatarIndex: 0, // Dodane do zarządzania aktualnie wybranym avatarem w karuzeli
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
    // Dodajemy getter do konwersji indeksu na kolor, gdy użytkownik ma stary format
    userAvatarColor() {
      if (this.getUser.avatarColors && typeof this.getUser.avatarColors === 'string') {
        // Jeśli jest już wartością heksadecymalną, zwracamy ją
        return this.getUser.avatarColors;
      } else if (this.getUser.avatarColors !== undefined) {
        // Jeśli jest indeksem, konwertujemy go na kolor
        const index = Math.abs(parseInt(this.getUser.avatarColors) % this.availableColors.length);
        return this.availableColors[index];
      }
      // Domyślny kolor
      return '#3B82F6';
    },
  },
  mounted() {
    this.theme = this.user.option || 'light';

    // Konwersja starego formatu (indeks) na nowy format (hex)
    // jeśli avatarColors jest liczbą, konwertujemy na hex
    if (this.getUser.avatarColors !== undefined && typeof this.getUser.avatarColors === 'number') {
      this.updateAvatarColor(this.userAvatarColor);
    }

    // Ustaw początkowy indeks avatara na ten wybrany przez użytkownika
    this.currentAvatarIndex = this.getUser.avatar || 0;
    this.selectedColor = this.userAvatarColor;
  },
  methods: {
    ...mapActions('ui', ['setTheme']),
    async saveTheme() {
      this.showLoader('Zapisywanie motywu...');
      try {
        // Używamy poprawnego endpointu /users/update-profile, który istnieje w API
        await apiClient.put('/users/update-profile', { option: this.theme });

        // Aktualizacja Vuex i localStorage po pomyślnym zapisie
        this.setTheme(this.theme);
        document.documentElement.setAttribute('data-theme', this.theme);

        // Aktualizacja obiektu użytkownika w store i sessionStorage
        const updatedUser = { ...this.getUser, option: this.theme };
        this.$store.commit('user/SET_USER', updatedUser);
        sessionStorage.setItem('user', JSON.stringify(updatedUser));

        this.hideLoader();
        this.showAlert('success', 'Motyw zapisany pomyślnie!');
      } catch (error) {
        console.error('Błąd zapisu motywu:', error);
        this.hideLoader();
        this.showAlert('error', 'Błąd zapisu motywu.');
      }
    },
    async changePassword() {
      if (!this.oldPassword || !this.newPassword || !this.newPassword2) {
        this.showAlert('warning', 'Wypełnij wszystkie pola.');
        return;
      }
      if (this.newPassword !== this.newPassword2) {
        // Dodano brakujący nawias otwierający (
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
        this.hideLoader();
        this.showAlert('success', 'Hasło zostało zmienione!');
      } catch (e) {
        this.hideLoader();
        this.showAlert('error', 'Błąd zmiany hasła. Sprawdź czy stare hasło jest poprawne.');
      }
    },
    async updateAvatar(index) {
      this.showLoader('Aktualizowanie avatara...');
      try {
        await apiClient.put('/users/update-profile', {
          avatar: index,
        });

        // Aktualizacja store i sessionStorage
        const updatedUser = { ...this.getUser, avatar: index };
        this.$store.commit('user/SET_USER', updatedUser);
        sessionStorage.setItem('user', JSON.stringify(updatedUser));

        this.showAlert('success', 'Avatar został zaktualizowany');
      } catch (error) {
        this.showAlert('error', 'Nie udało się zaktualizować avatara');
      } finally {
        this.hideLoader();
      }
    },
    async updateAvatarColor(colorHex) {
      this.showLoader('Aktualizowanie koloru avatara...');
      try {
        await apiClient.put('/users/update-profile', {
          avatarColors: colorHex, // Teraz przesyłamy sam kolor zamiast indeksu
        });

        // Aktualizacja store i sessionStorage
        const updatedUser = { ...this.getUser, avatarColors: colorHex };
        this.$store.commit('user/SET_USER', updatedUser);
        sessionStorage.setItem('user', JSON.stringify(updatedUser));

        this.showAlert('success', 'Kolor avatara został zaktualizowany');
      } catch (error) {
        this.showAlert('error', 'Nie udało się zaktualizować koloru avatara');
      } finally {
        this.hideLoader();
      }
    },
    startColorSelection(event) {
      const { offsetX, offsetY } = event;
      this.selectorPosition = { x: offsetX, y: offsetY };
      this.updateSelectedColor(offsetX, offsetY);

      document.addEventListener('mousemove', this.onColorMouseMove);
      document.addEventListener('mouseup', this.stopColorSelection);
      document.addEventListener('touchmove', this.onColorTouchMove);
      document.addEventListener('touchend', this.stopColorSelection);
    },
    onColorMouseMove(event) {
      const { clientX, clientY } = event;
      const wheelRect = this.$refs.colorWheel.getBoundingClientRect();
      const offsetX = clientX - wheelRect.left;
      const offsetY = clientY - wheelRect.top;

      this.updateSelectedColor(offsetX, offsetY);
    },
    onColorTouchMove(event) {
      const touch = event.touches[0];
      const { clientX, clientY } = touch;
      const wheelRect = this.$refs.colorWheel.getBoundingClientRect();
      const offsetX = clientX - wheelRect.left;
      const offsetY = clientY - wheelRect.top;

      this.updateSelectedColor(offsetX, offsetY);
    },
    updateSelectedColor(x, y) {
      const radius = 100;
      const centerX = radius;
      const centerY = radius;

      // Obliczanie kąta i promienia
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Ograniczenie promienia do maksymalnej wartości
      const clampedDistance = Math.min(distance, radius);

      // Obliczanie nowej pozycji wskaźnika
      const newX = centerX + clampedDistance * (dx / distance);
      const newY = centerY + clampedDistance * (dy / distance);

      this.selectorPosition = { x: newX, y: newY };

      // Konwersja pozycji na kolor
      const hue = (Math.atan2(dy, dx) * 180) / Math.PI + 180;
      const saturation = (clampedDistance / radius) * 100;
      const lightness = 50;

      this.selectedColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    },
    stopColorSelection() {
      document.removeEventListener('mousemove', this.onColorMouseMove);
      document.removeEventListener('mouseup', this.stopColorSelection);
      document.removeEventListener('touchmove', this.onColorTouchMove);
      document.removeEventListener('touchend', this.stopColorSelection);
    },
    // Dodane metody do obsługi karuzeli avatarów
    nextAvatar() {
      if (this.currentAvatarIndex < 16) {
        this.currentAvatarIndex++;
      }
    },
    prevAvatar() {
      if (this.currentAvatarIndex > 0) {
        this.currentAvatarIndex--;
      }
    },
    selectAvatar(index) {
      if (index >= 0 && index < 17) {
        this.currentAvatarIndex = index;
      }
    },
    jumpToAvatarGroup(groupIndex) {
      // Każda grupa zawiera 3 avatary
      const newIndex = groupIndex * 3;
      if (newIndex >= 0 && newIndex < 17) {
        this.currentAvatarIndex = newIndex;
      }
    },
    getThumbIndex(position) {
      // Pobierz indeks miniatury na podstawie aktualnej pozycji i pozycji miniatury
      // Pokazujemy 5 miniatur na raz, z aktualnym avatarem w środku
      const start = Math.max(0, Math.min(12, this.currentAvatarIndex - 2));
      return start + position - 1;
    },
    // Zaktualizuj tę metodę, aby używała aktualnego indeksu
    updateAvatar(index) {
      this.showLoader('Aktualizowanie avatara...');
      try {
        apiClient
          .put('/users/update-profile', {
            avatar: index,
          })
          .then(() => {
            // Aktualizacja store i sessionStorage
            const updatedUser = { ...this.getUser, avatar: index };
            this.$store.commit('user/SET_USER', updatedUser);
            sessionStorage.setItem('user', JSON.stringify(updatedUser));

            this.showAlert('success', 'Avatar został zaktualizowany');
          })
          .catch(() => {
            this.showAlert('error', 'Nie udało się zaktualizować avatara');
          })
          .finally(() => {
            this.hideLoader();
          });
      } catch (error) {
        this.hideLoader();
        this.showAlert('error', 'Nie udało się zaktualizować avatara');
      }
    },
  },
};
</script>

<style scoped>
/* Stylizacja kart motywów */
.theme-card {
  position: relative;
  transition: all 0.3s ease;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.theme-card-active {
  ring: 2px solid #3b82f6;
  transform: scale(1.05);
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.5);
}

.theme-card-preview {
  height: 160px;
  transition: all 0.3s ease;
}

.theme-card:hover .theme-card-preview {
  opacity: 0.9;
}

/* Animacja dla avatarów */
.color-selector {
  transition: all 0.2s ease;
}

.color-selector:hover {
  z-index: 10;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

/* Zachowuję resztę stylów */
.user-panel-card {
  margin: 0 auto;
  max-width: 42rem;
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.8);
  animation: slideUp 0.5s ease-out forwards;
}

.user-panel-header {
  padding: 1.5rem;
  background-image: linear-gradient(to right, #3b82f6, #2563eb);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

@media (min-width: 640px) {
  .user-panel-header {
    flex-direction: row;
  }
}

.panel-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  color: white;
}

.user-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.user-login {
  font-weight: 500;
}

.user-panel-content {
  padding: 1.5rem;
}

.panel-section {
  margin-bottom: 2rem;
}

.panel-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.section-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #3b82f6;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.theme-selector {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.theme-option:hover {
  transform: scale(1.05);
}

.theme-option.selected {
  font-weight: 600;
  color: #2563eb;
}

.theme-preview {
  width: 4rem;
  height: 4rem;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.theme-option.selected .theme-preview {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.light-preview {
  background-image: linear-gradient(to bottom right, white, #f3f4f6);
}

.dark-preview {
  background-image: linear-gradient(to bottom right, #1f2937, #111827);
}

.save-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  width: 100%;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  transition: all 0.2s;
}

.input-wrapper:focus-within {
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  padding-left: 2.5rem;
  background-color: transparent;
  border: none;
  outline: none;
  color: #374151;
}

.password-feedback {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.feedback-icon {
  width: 1rem;
  height: 1rem;
}

.feedback-icon.success {
  color: #10b981;
}

.feedback-icon.error {
  color: #ef4444;
}

.change-password-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.button-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.message-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  margin-top: 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.success-message {
  background-color: #f0fdf4;
  color: #15803d;
  border: 1px solid #dcfce7;
}

.error-message {
  background-color: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fee2e2;
}

.message-icon {
  width: 1.25rem;
  height: 1.25rem;
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

/* Style dla palety kolorów */
.color-swatch {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

html[data-theme='dark'] .color-swatch {
  border-color: rgba(0, 0, 0, 0.3);
}

.color-swatch:hover {
  border-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

html[data-theme='dark'] .color-swatch:hover {
  border-color: rgba(255, 255, 255, 0.3);
}

/* Stylizacja koła kolorów */
.color-wheel-container {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.color-wheel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(from 180deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);
}

.brightness-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.7) 0%,
    rgba(0, 0, 0, 0.3) 70%,
    rgba(0, 0, 0, 0.7) 100%
  );
}

.color-selector {
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

/* Stylizacja karuzeli avatarów */
.avatar-carousel {
  background-color: #fff;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

html[data-theme='dark'] .avatar-carousel {
  background-color: #1f2937;
  border: 1px solid rgba(55, 65, 81, 0.8);
}

.avatar-showcase {
  position: relative;
  overflow: hidden;
  height: 200px;
}

.avatar-current {
  position: absolute;
  display: flex;
  transition: transform 0.5s ease-out;
  width: 100%;
  height: 100%;
}

.avatar-item {
  min-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.avatar-preview {
  background-image: linear-gradient(to bottom, #eff6ff, #eef2ff);
  border-radius: 9999px;
  padding: 1.5rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  transform-style: preserve-3d;
  perspective: 1000px;
}

html[data-theme='dark'] .avatar-preview {
  background-image: linear-gradient(to bottom, rgba(30, 58, 138, 0.2), rgba(79, 70, 229, 0.2));
}

.avatar-badge {
  font-size: 0.875rem;
  font-weight: 500;
  color: #2563eb;
  background-color: #eff6ff;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
}

html[data-theme='dark'] .avatar-badge {
  color: #93c5fd;
  background-color: #1e3a8a;
  background-opacity: 0.3;
}

.avatar-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-top: 1px solid #f3f4f6;
}

html[data-theme='dark'] .avatar-controls {
  border-top: 1px solid #374151;
}

.nav-button {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.3s ease;
}

html[data-theme='dark'] .nav-button {
  background-color: #374151;
  color: #9ca3af;
}

.nav-button:not(:disabled):hover {
  background-color: #3b82f6;
  color: #fff;
  transform: scale(1.05);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.avatar-thumbnails {
  display: flex;
  gap: 0.5rem;
}

.thumb-button {
  border-radius: 9999px;
  padding: 0.25rem;
  transition: all 0.3s ease;
  position: relative;
}

.thumb-button.active {
  background-color: #dbeafe;
  transform: scale(1.1);
}

html[data-theme='dark'] .thumb-button.active {
  background-color: rgba(30, 58, 138, 0.5);
}

.thumb-button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0.375rem;
  height: 0.375rem;
  background-color: #3b82f6;
  border-radius: 9999px;
  transform: translateX(-50%) translateY(0.25rem);
}

.avatar-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid #f3f4f6;
}

html[data-theme='dark'] .avatar-indicator {
  border-top: 1px solid #374151;
}

@media (min-width: 640px) {
  .avatar-indicator {
    flex-direction: row;
  }
}

.indicator-dots {
  display: flex;
  gap: 0.375rem;
}

.indicator-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background-color: #d1d5db;
  transition: all 0.2s ease;
}

html[data-theme='dark'] .indicator-dot {
  background-color: #4b5563;
}

.indicator-dot.active {
  width: 1rem;
  background-color: #3b82f6;
}

.select-avatar-button {
  min-width: 160px;
  display: flex;
  justify-content: center;
}
</style>
