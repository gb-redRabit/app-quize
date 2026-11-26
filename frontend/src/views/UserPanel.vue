<template>
  <div class="app-shell overflow-hidden">
    <!-- Nagłówek panelu użytkownika -->
    <div class="surface mb-5 p-5 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="shrink-0">
          <Avatar
            :avatar-index="user?.avatar || 0"
            :color="user?.avatarColors || '#60A5FA'"
            :size="56"
          />
        </div>
        <div class="min-w-0">
          <p class="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Konto
          </p>
          <h1 class="mt-0.5 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            {{ user?.login || 'Użytkownik' }}
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Zarządzaj profilem, wyglądem i preferencjami nauki.
          </p>
        </div>
      </div>
      <span
        class="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-semibold text-gray-600 dark:text-gray-300"
      >
        {{ user?.rola === 'admin' ? 'Administrator' : 'Uczeń' }}
      </span>
    </div>

    <!-- Zakładki panelu -->
    <div
      class="mb-5 grid grid-cols-3 gap-1 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 p-1 sm:flex sm:flex-nowrap sm:overflow-x-auto"
      role="tablist"
      aria-label="Ustawienia profilu"
    >
      <button
        v-for="tab in profileTabs"
        :key="tab.id"
        role="tab"
        :aria-selected="activeTab === tab.id"
        class="h-9 px-2 sm:px-3 rounded-xl text-[13px] sm:text-sm font-medium whitespace-nowrap transition-colors"
        :class="
          activeTab === tab.id
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
        "
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Sekcje ustawień -->
    <div class="space-y-8 mb-8">
      <!-- Personalizacja awatara -->
      <div
        v-if="activeTab === 'profile'"
        class="surface overflow-hidden"
      >
        <div class="px-5 py-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-800">
          <div
            class="h-9 w-9 shrink-0 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 grid place-items-center"
          >
            <img src="@/assets/icons/user.svg" alt="" class="w-5 h-5" aria-hidden="true" />
          </div>
          <h2 class="text-base font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            Personalizacja awatara
          </h2>
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
                  class="rounded-full cursor-pointer inset-shadow-sm"
                  width="256"
                  height="256"
                  role="img"
                  aria-label="Koło kolorów — kliknij lub przeciągnij, aby wybrać kolor"
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

              <!-- Gotowe kolory: szybsze i wygodniejsze na telefonie -->
              <div
                class="mt-4 flex flex-wrap justify-center gap-2 max-w-xs"
                role="group"
                aria-label="Gotowe kolory awatara"
              >
                <button
                  v-for="preset in colorPresets"
                  :key="preset"
                  type="button"
                  class="h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                  :class="
                    selectedColor.toUpperCase() === preset.toUpperCase()
                      ? 'border-gray-900 dark:border-white'
                      : 'border-white dark:border-gray-700'
                  "
                  :style="{ backgroundColor: preset }"
                  :aria-label="`Wybierz kolor ${preset}`"
                  :aria-pressed="selectedColor.toUpperCase() === preset.toUpperCase()"
                  @click="pickPresetColor(preset)"
                ></button>
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
                  type="button"
                  :aria-label="`Wybierz styl awatara ${i}`"
                  :aria-pressed="currentAvatarIndex === i - 1"
                  @click="selectAvatar(i - 1)"
                  class="rounded-full p-1 transition-all duration-200 focus:outline-hidden relative hover:bg-gray-200 dark:hover:bg-gray-600"
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
        <div
          v-if="activeTab === 'appearance'"
          class="surface overflow-hidden h-fit"
        >
          <div class="px-5 py-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-800">
            <div
              class="h-9 w-9 shrink-0 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 grid place-items-center"
            >
              <img src="@/assets/icons/theme.svg" alt="" class="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 class="text-base font-semibold tracking-tight text-gray-900 dark:text-gray-50">
              Personalizacja motywu
            </h2>
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

              <!-- Motyw systemowy -->
              <ThemeOption
                :active="theme === 'system'"
                theme-name="system"
                title="Systemowy"
                @select="theme = 'system'"
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

        <!-- Bezpieczeństwo -->
        <div v-if="activeTab === 'security'" class="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <!-- Zmiana hasła -->
          <PasswordChangeForm :user="user" @password-changed="onPasswordChanged" />

          <!-- Sesja -->
          <section class="surface overflow-hidden h-fit">
            <div
              class="px-5 py-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-800"
            >
              <div
                class="h-9 w-9 shrink-0 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 grid place-items-center"
                aria-hidden="true"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <h2 class="text-base font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                Sesja
              </h2>
            </div>

            <div class="p-5 sm:p-6">
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Wylogowanie kończy sesję na tym urządzeniu. Postępy są już zapisane.
              </p>
              <div class="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  class="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  @click="logout"
                >
                  Wyloguj się
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  @click="showLogoutAllModal = true"
                >
                  Wyloguj wszystkie urządzenia
                </button>
              </div>
            </div>
          </section>

          <!-- Dane i konto -->
          <section class="surface overflow-hidden xl:col-span-2">
            <div
              class="px-5 py-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-800"
            >
              <div
                class="h-9 w-9 shrink-0 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 grid place-items-center"
                aria-hidden="true"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 7c0 1.657 3.582 3 8 3s8-1.343 8-3-3.582-3-8-3-8 1.343-8 3zm0 5c0 1.657 3.582 3 8 3s8-1.343 8-3M4 12v5c0 1.657 3.582 3 8 3s8-1.343 8-3v-5"
                  />
                </svg>
              </div>
              <h2 class="text-base font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                Dane i konto
              </h2>
            </div>

            <div class="p-5 sm:p-6">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p class="text-sm font-medium text-gray-800 dark:text-gray-100">
                    Eksport danych
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Profil, historia quizów i odpowiedzi w pliku JSON.
                  </p>
                </div>
                <BaseButton color="gray" variant="outline" @click="exportUserData">
                  Pobierz moje dane
                </BaseButton>
              </div>

              <div
                class="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-200 dark:border-gray-800 pt-5"
              >
                <div>
                  <p class="text-sm font-medium text-red-700 dark:text-red-300">Usuń konto</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Trwale usuwa konto, historię i statystyki. Tej operacji nie można cofnąć.
                  </p>
                </div>
                <BaseButton color="red" variant="outline" @click="openDeleteAccountModal">
                  Usuń konto
                </BaseButton>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- Ukrywanie kategorii -->
    <div
      v-if="activeTab === 'categories'"
      class="surface overflow-hidden mb-8"
    >
      <div class="px-5 py-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-800">
        <div
          class="h-9 w-9 shrink-0 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 grid place-items-center"
        >
          <img src="@/assets/icons/bulb.svg" alt="" class="w-5 h-5" aria-hidden="true" />
        </div>
        <h2 class="text-base font-semibold tracking-tight text-gray-900 dark:text-gray-50">
          Ukryj kategorie
        </h2>
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
            class="px-3 py-2 text-sm font-medium rounded-full border transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500"
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

    <!-- Preferencje nauki -->
    <div
      v-if="activeTab === 'learning'"
      class="surface overflow-hidden mb-8"
    >
      <div class="px-5 py-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-800">
        <div
          class="h-9 w-9 shrink-0 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 grid place-items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h2 class="text-base font-semibold tracking-tight text-gray-900 dark:text-gray-50">
          Preferencje nauki
        </h2>
      </div>

      <div class="p-6 space-y-4">
        <label
          class="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
        >
          <input
            v-model="learningSettings.autoNext"
            type="checkbox"
            class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>
            <span class="block font-medium text-gray-800 dark:text-gray-100">
              Automatyczne przejście do następnego pytania
            </span>
            <span class="block text-sm text-gray-500 dark:text-gray-400">
              Po odpowiedzi odczekaj 5 sekund (możesz to wyłączyć podczas quizu przyciskiem
              Auto-Next).
            </span>
          </span>
        </label>

        <label
          class="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
        >
          <input
            v-model="learningSettings.showDescriptions"
            type="checkbox"
            class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>
            <span class="block font-medium text-gray-800 dark:text-gray-100">
              Pokazuj opis po odpowiedzi
            </span>
            <span class="block text-sm text-gray-500 dark:text-gray-400">
              Podstawa prawna lub wyjaśnienie pojawi się pod odpowiedziami.
            </span>
          </span>
        </label>

        <div class="p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <label for="exam-length" class="block font-medium text-gray-800 dark:text-gray-100">
            Liczba pytań w egzaminie
          </label>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Domyślnie 150. Egzamin wylosuje tyle pytań (lub mniej, jeśli w puli jest ich za
            mało).
          </p>
          <div class="mt-3 flex items-center gap-2">
            <input
              id="exam-length"
              v-model.number="learningSettings.examLength"
              type="number"
              inputmode="numeric"
              :min="MIN_EXAM_LENGTH"
              :max="MAX_EXAM_LENGTH"
              step="10"
              class="h-10 w-28 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-hidden"
            />
            <span class="text-sm text-gray-500 dark:text-gray-400">
              pytań ({{ MIN_EXAM_LENGTH }}–{{ MAX_EXAM_LENGTH }})
            </span>
          </div>
        </div>

        <BaseButton color="blue" :loading="savingSettings" @click="saveLearningSettings">
          Zapisz preferencje
        </BaseButton>
      </div>
    </div>

    <BaseModal :show="showLogoutAllModal" @close="showLogoutAllModal = false">
      <template #header>Wyloguj wszystkie urządzenia</template>
      <p class="text-sm text-gray-700 dark:text-gray-200">
        Ta operacja unieważni wszystkie aktywne sesje na wszystkich urządzeniach, w tym tę
        bieżącą. Będziesz musiał zalogować się ponownie.
      </p>
      <template #footer>
        <BaseButton color="gray" @click="showLogoutAllModal = false">Anuluj</BaseButton>
        <BaseButton color="red" :loading="loggingOutAll" @click="logoutAllDevices">
          Wyloguj wszędzie
        </BaseButton>
      </template>
    </BaseModal>

    <BaseModal :show="showDeleteAccountModal" @close="closeDeleteAccountModal">
      <template #header>Usuń konto</template>
      <div class="text-sm text-gray-700 dark:text-gray-200 space-y-3">
        <p>
          Konto, historia quizów, odpowiedzi i statystyki zostaną trwale usunięte. Tej
          operacji nie można cofnąć.
        </p>
        <div>
          <label
            for="delete-account-password"
            class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
          >
            Potwierdź hasłem
          </label>
          <input
            id="delete-account-password"
            v-model="deleteAccountPassword"
            type="password"
            autocomplete="current-password"
            class="h-11 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-gray-100 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 focus:outline-hidden"
            :aria-invalid="Boolean(deleteAccountError)"
            @input="deleteAccountError = ''"
          />
          <p
            v-if="deleteAccountError"
            role="alert"
            class="mt-1 text-xs font-medium text-red-600 dark:text-red-400"
          >
            {{ deleteAccountError }}
          </p>
        </div>
      </div>
      <template #footer>
        <BaseButton color="gray" @click="closeDeleteAccountModal">Anuluj</BaseButton>
        <BaseButton color="red" :loading="deletingAccount" @click="deleteAccount">
          Usuń konto
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  nextTick,
  inject,
  defineAsyncComponent,
  watch,
} from 'vue';
import { useStore } from 'vuex';
const BaseButton = defineAsyncComponent(() => import('@/components/base/BaseButton.vue'));
const Avatar = defineAsyncComponent(() => import('@/components/base/Avatar.vue'));
const ThemeOption = defineAsyncComponent(() => import('@/components/settings/ThemeOption.vue'));
const PasswordChangeForm = defineAsyncComponent(
  () => import('@/components/settings/PasswordChangeForm.vue')
);
const BaseModal = defineAsyncComponent(() => import('@/components/base/BaseModal.vue'));
import apiClient from '@/api';
import { useLogout } from '@/composables/useLogout';
import { setUser } from '@/utils/authStorage';
import { clearHistoryCache } from '@/utils/historyCache';
import { clearQueue } from '@/utils/offlineQueue';
import {
  DEFAULT_EXAM_LENGTH,
  MIN_EXAM_LENGTH,
  MAX_EXAM_LENGTH,
} from '@/utils/examSettings';

// Globalny system alertów
const showAlert = inject('showAlert');
const store = useStore();
const logout = useLogout();

// Stan reaktywny
const activeTab = ref('profile');
const profileTabs = [
  { id: 'profile', label: 'Profil' },
  { id: 'appearance', label: 'Wygląd' },
  { id: 'security', label: 'Bezpieczeństwo' },
  { id: 'categories', label: 'Kategorie' },
  { id: 'learning', label: 'Nauka' },
];
const theme = ref('light');
const selectorPosition = ref({ x: 0, y: 0 });
const selectedColor = ref('#3B82F6');
const currentAvatarIndex = ref(0);
const selectedHiddenCategories = ref([]);
const learningSettings = ref({
  autoNext: true,
  showDescriptions: true,
  examLength: DEFAULT_EXAM_LENGTH,
});
const savingSettings = ref(false);
const showLogoutAllModal = ref(false);
const loggingOutAll = ref(false);
const showDeleteAccountModal = ref(false);
const deleteAccountPassword = ref('');
const deleteAccountError = ref('');
const deletingAccount = ref(false);
const allCategories = ref([]);
const colorWheelCanvas = ref(null);

// Gotowe kolory — wygodne na telefonie (koło kolorów zostaje do precyzji).
const colorPresets = [
  '#2563EB',
  '#7C3AED',
  '#DB2777',
  '#DC2626',
  '#EA580C',
  '#CA8A04',
  '#16A34A',
  '#0D9488',
  '#0891B2',
  '#4B5563',
];

function pickPresetColor(color) {
  selectedColor.value = color;
  updateSelectorPositionFromColor(color);
}

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
  // 1. Natychmiastowa zmiana motywu lokalnie (App.vue stosuje klasę .dark)
  store.dispatch('ui/setTheme', theme.value);

  // 2. Zapisz w local/sessionStorage i store
  const updatedUser = { ...user.value, option: theme.value };
  store.commit('user/SET_USER', updatedUser);
  setUser(updatedUser);

  // 3. Dopiero teraz wyślij żądanie do API (asynchronicznie)
  try {
    await apiClient.put('/users/update-profile', { option: theme.value });
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
    setUser(updatedUser);

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
    setUser(updatedUser);

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
    setUser(updatedUser);

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

async function saveLearningSettings() {
  if (savingSettings.value) return;

  const examLength = Number(learningSettings.value.examLength);
  if (
    !Number.isInteger(examLength) ||
    examLength < MIN_EXAM_LENGTH ||
    examLength > MAX_EXAM_LENGTH
  ) {
    showAlert(
      'error',
      `Liczba pytań w egzaminie musi być liczbą ${MIN_EXAM_LENGTH}–${MAX_EXAM_LENGTH}.`
    );
    return;
  }
  learningSettings.value.examLength = examLength;

  savingSettings.value = true;
  try {
    const res = await apiClient.put('/users/update-profile', {
      settings: learningSettings.value,
    });
    const updated = {
      ...(user.value || {}),
      settings: res.data?.settings || learningSettings.value,
    };
    store.commit('user/SET_USER', updated);
    setUser(updated);
    showAlert('success', 'Preferencje nauki zapisane.');
  } catch (e) {
    showAlert('error', 'Błąd zapisu preferencji nauki.');
  } finally {
    savingSettings.value = false;
  }
}

async function logoutAllDevices() {
  if (loggingOutAll.value) return;
  loggingOutAll.value = true;
  try {
    await apiClient.post('/auth/logout-all', {});
  } catch (e) {
    // Nawet przy błędzie czyścimy lokalną sesję.
    showAlert('error', e?.response?.data?.message || 'Nie udało się unieważnić sesji.');
  } finally {
    loggingOutAll.value = false;
    showLogoutAllModal.value = false;
    logout();
  }
}

function exportUserData() {
  const profile = { ...(user.value || {}) };
  delete profile.password;
  delete profile.__v;

  const payload = {
    exportedAt: new Date().toISOString(),
    profile,
    settings: profile.settings || {},
    history: store.state.user.history || [],
    hquestion: store.state.user.hquestion || [],
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `quiz-app-dane-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showAlert('success', 'Dane zostały wyeksportowane.');
}

function openDeleteAccountModal() {
  deleteAccountPassword.value = '';
  deleteAccountError.value = '';
  showDeleteAccountModal.value = true;
}

function closeDeleteAccountModal() {
  if (deletingAccount.value) return;
  showDeleteAccountModal.value = false;
  deleteAccountPassword.value = '';
  deleteAccountError.value = '';
}

async function deleteAccount() {
  if (deletingAccount.value) return;
  if (!deleteAccountPassword.value) {
    deleteAccountError.value = 'Podaj hasło, aby usunąć konto.';
    return;
  }

  deletingAccount.value = true;
  deleteAccountError.value = '';
  try {
    await apiClient.delete('/users/me', {
      data: { password: deleteAccountPassword.value },
    });
    // Kolejka mogła zawierać dane tego konta — nie przenosimy jej na inne konto.
    clearQueue();
    await clearHistoryCache().catch(() => {});
    showDeleteAccountModal.value = false;
    logout();
  } catch (e) {
    deleteAccountError.value =
      e?.response?.data?.message || 'Nie udało się usunąć konta. Spróbuj ponownie.';
  } finally {
    deletingAccount.value = false;
  }
}

// Inicjalizacja komponentu
watch(activeTab, (tab) => {
  if (tab === 'profile') {
    nextTick(() => {
      drawColorWheel();
      updateSelectorPositionFromColor(selectedColor.value);
    });
  }
});

onMounted(async () => {
  // Ustawienie początkowego stanu
  theme.value = user.value?.option || 'light';

  selectedColor.value = user.value?.avatarColors || '#3B82F6';
  currentAvatarIndex.value = user.value?.avatar || 0;
  learningSettings.value = {
    autoNext: user.value?.settings?.autoNext !== false,
    showDescriptions: user.value?.settings?.showDescriptions !== false,
    examLength: Number(user.value?.settings?.examLength) || DEFAULT_EXAM_LENGTH,
  };

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
