<template>
  <div
    id="app"
    class="flex flex-col items-center justify-start min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100"
    :data-theme="currentTheme"
  >
    <BaseLoader v-if="!isAuthChecked" />
    <template v-else>
      <a
        href="#main"
        class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-blue-700 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
      >
        Przejdź do treści
      </a>
      <AppSidebar v-if="showAppNavigation" />
      <Navbar v-if="showAppNavigation" class="lg:hidden" />
      <div
        v-if="!isOnline && !offlineBannerDismissed"
        class="fixed left-1/2 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-50 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-gray-700/60 bg-gray-900/95 px-3 py-1.5 text-xs text-gray-100 shadow-lg backdrop-blur lg:left-auto lg:right-6 lg:bottom-6 lg:translate-x-0"
        role="status"
        aria-live="polite"
      >
        <span class="h-2 w-2 shrink-0 rounded-full bg-amber-400" aria-hidden="true"></span>
        <span class="truncate">
          Tryb offline
          <template v-if="pendingChanges > 0">
            · {{ pendingChanges }}
            {{ pendingChanges === 1 ? 'zmiana czeka' : 'zmiany czekają' }}
          </template>
        </span>
        <button
          type="button"
          class="ml-1 rounded-full p-0.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white/60"
          aria-label="Ukryj powiadomienie o braku połączenia"
          @click="dismissOfflineBanner"
        >
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div
        class="w-full flex flex-col flex-1 min-h-screen"
        :class="
          showAppNavigation
            ? sidebarCollapsed
              ? 'xl:pl-20'
              : 'xl:pl-60'
            : ''
        "
      >
        <main
          id="main"
          tabindex="-1"
          class="w-full flex-1"
          :class="
            showBottomNav ? 'pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0' : ''
          "
        >
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="isPageLoading ? null : Component" :key="$route.fullPath" />
            </transition>
            <!-- Skeleton pojawia się tylko, gdy isPageLoading i nie ma widoku -->
            <BaseSkeleton
              v-if="isPageLoading"
              :variant="skeletonVariant"
              :cardCount="skeletonCardCount"
              :showLines="showSkeletonLines"
              :showCards="showSkeletonCards"
              :showHeader="showSkeletonHeader"
              :showSubtitle="showSkeletonSubtitle"
              :containerClass="skeletonContainerClass"
              :gridCols="skeletonGridCols"
              :lineWidths="getLineWidths"
              class="container my-6 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700"
            />
          </router-view>
        </main>

        <AppFooter v-if="showFooter" />
      </div>

      <!-- Nowa wersja PWA: Service Worker czeka na aktywację. -->
      <div
        v-if="updateAvailable"
        class="fixed z-50 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bottom-[calc(6.25rem+env(safe-area-inset-bottom))] lg:bottom-6 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 shadow-lg p-3 flex items-center gap-3"
        :class="
          showAppNavigation
            ? sidebarCollapsed
              ? 'xl:left-[calc(50%+2.5rem)]'
              : 'xl:left-[calc(50%+7.5rem)]'
            : ''
        "
        role="status"
        aria-live="polite"
      >
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">
            Nowa wersja aplikacji
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Odśwież, aby zobaczyć zmiany.
          </p>
        </div>
        <button
          type="button"
          class="h-9 px-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shrink-0"
          @click="applyUpdate"
        >
          Odśwież
        </button>
        <button
          type="button"
          class="h-9 w-9 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
          aria-label="Zamknij powiadomienie o aktualizacji"
          @click="dismissUpdate"
        >
          ✕
        </button>
      </div>

      <BottomNav v-if="showBottomNav" />

      <!-- Pasek z czasem ważności tokenu -->
      <!-- <div
        v-if="tokenTimeLeft > 0 && isAuthChecked"
        class="fixed bottom-2 right-2 bg-gray-800 text-white px-4 py-2 rounded-sm shadow-lg text-sm z-50 opacity-90"
      >
        Token ważny jeszcze: <b>{{ tokenTimeLeftStr }}</b>
      </div> -->

      <!-- Globalne komponenty -->
      <BaseAlert ref="globalAlert" />
      <BaseLoader ref="globalLoader" v-if="globalLoaderVisible" />
      <BaseModal :show="showSessionModal" @close="showSessionModal = false">
        <template #header>
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Sesja wygasa</h2>
        </template>
        <div class="p-2 text-gray-700 dark:text-gray-200">
          Twoja sesja wygaśnie za około <b>{{ sessionMinutesLeft }}</b> minut
          <span v-if="sessionSecondsLeft > 0">({{ sessionSecondsLeft }} s)</span>.<br />
          Kliknij poniżej, aby odświeżyć sesję i kontynuować pracę.
        </div>
        <template #footer>
          <button
            class="bg-blue-600 text-white px-4 py-2 rounded-sm hover:bg-blue-700 transition disabled:opacity-60"
            :disabled="sessionModalLoading"
            @click="refreshSessionToken"
          >
            <span v-if="sessionModalLoading">Odświeżanie...</span>
            <span v-else>Odśwież sesję</span>
          </button>
          <button
            class="ml-2 px-4 py-2 rounded-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            @click="showSessionModal = false"
            :disabled="sessionModalLoading"
          >
            Zamknij
          </button>
        </template>
      </BaseModal>
    </template>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  provide,
  defineAsyncComponent,
} from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
const Navbar = defineAsyncComponent(() => import('@/components/layout/Navbar.vue'));
const AppSidebar = defineAsyncComponent(() => import('@/components/layout/AppSidebar.vue'));
const BottomNav = defineAsyncComponent(() => import('@/components/layout/BottomNav.vue'));
const AppFooter = defineAsyncComponent(() => import('@/components/layout/AppFooter.vue'));
const BaseAlert = defineAsyncComponent(() => import('@/components/base/BaseAlert.vue'));
const BaseLoader = defineAsyncComponent(() => import('@/components/base/BaseLoader.vue'));
const BaseSkeleton = defineAsyncComponent(() => import('@/components/base/BaseSkeleton.vue'));
const BaseModal = defineAsyncComponent(() => import('@/components/base/BaseModal.vue'));
import apiClient from '@/api';
import { ensureQuestionsCache, handleQuestionsEvent } from '@/services/questionsSync';
import { initOfflineSync, flushOfflineQueue } from '@/services/offlineSync';
import { queueSize } from '@/utils/offlineQueue';
import { startRealtime, stopRealtime } from '@/utils/realtime';
import { useSkeletonConfig } from '@/composables/useSkeletonConfig.js';
import { useGlobalLoader } from '@/composables/useGlobalLoader.js';
import { updateAvailable, applyUpdate, dismissUpdate } from '@/services/pwa';
import { useSidebar } from '@/composables/useSidebar';
import { getToken, setToken, setUser } from '@/utils/authStorage';

const store = useStore();
const router = useRouter();
const route = useRoute();

const isPageLoading = ref(false);
const showSessionModal = ref(false);
const { globalLoaderVisible, hideLoader } = useGlobalLoader();
const sessionMinutesLeft = ref(5);
const sessionSecondsLeft = ref(0);
const sessionModalLoading = ref(false);
const isAuthChecked = ref(false);
const isOnline = ref(navigator.onLine);
const offlineBannerDismissed = ref(
  (() => {
    try {
      return sessionStorage.getItem('offlineBannerDismissed') === '1';
    } catch (e) {
      return false;
    }
  })()
);

function dismissOfflineBanner() {
  offlineBannerDismissed.value = true;
  try {
    sessionStorage.setItem('offlineBannerDismissed', '1');
  } catch (e) {
    // Brak dostępu do sessionStorage — ukrywamy tylko do końca życia strony.
  }
}
const pendingChanges = ref(queueSize());

const globalAlert = ref();
const globalLoader = ref();

const { collapsed: sidebarCollapsed } = useSidebar();
const currentTheme = computed(() => store.getters['ui/currentTheme']);
const showNavbar = computed(() => route.name !== 'Login' && route.name !== 'Register');
// Tryb skupienia: quiz i egzamin bez nawigacji (sidebar/navbar/stopka).
const isFocusMode = computed(() => ['QuizView', 'ExamView'].includes(route.name));
const showAppNavigation = computed(() => showNavbar.value && !isFocusMode.value);
const showBottomNav = computed(() => showAppNavigation.value);
const showFooter = computed(() => !isFocusMode.value);

// Skeleton logic
const {
  skeletonVariant,
  skeletonCardCount,
  showSkeletonCards,
  getLineWidths,
  skeletonContainerClass,
  skeletonGridCols,
  showSkeletonHeader,
  showSkeletonSubtitle,
  showSkeletonLines,
} = useSkeletonConfig();

// Alert helpers
function showAlert(type, message, duration = 3000) {
  globalAlert.value?.show(type, message, duration);
}
function hideAlert() {
  globalAlert.value?.hide();
}
provide('showAlert', showAlert);
provide('hideAlert', hideAlert);

// Loader helpers
function $hideLoader() {
  hideLoader();
  globalLoader.value?.hide();
}

// Session modal logic
async function refreshSessionToken() {
  sessionModalLoading.value = true;
  try {
    const res = await apiClient.silentPost('/auth/refresh', {});
    if (res.data && res.data.token) {
      setToken(res.data.token);
      showAlert('success', 'Sesja została odświeżona!');
      showSessionModal.value = false;
    } else {
      showAlert('error', 'Nie udało się odświeżyć sesji.');
    }
  } catch (e) {
    showAlert('error', 'Błąd podczas odświeżania sesji.');
  } finally {
    sessionModalLoading.value = false;
  }
}
let sessionCountdownInterval;
function showSessionExpirationModal(minutesLeft = 5) {
  sessionMinutesLeft.value = minutesLeft;
  sessionSecondsLeft.value = minutesLeft * 60;
  showSessionModal.value = true;

  clearInterval(sessionCountdownInterval);
  sessionCountdownInterval = setInterval(() => {
    if (sessionSecondsLeft.value > 0) {
      sessionSecondsLeft.value--;
    }
    if (sessionSecondsLeft.value <= 0) {
      clearInterval(sessionCountdownInterval);
    }
  }, 1000);
}

// Token expiration check
function checkTokenExpiration() {
  const token = getToken();
  if (!token) return;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    if (!decoded.exp) return;
    const currentTime = Math.floor(Date.now() / 1000);
    const timeRemaining = decoded.exp - currentTime;
    if (timeRemaining < 5 * 60 && timeRemaining > 0) {
      if (!showSessionModal.value) {
        showSessionExpirationModal(Math.ceil(timeRemaining / 60));
      }
    }
  } catch (e) {
    // Ignoruj błędy parsowania
  }
}

// Autoryzacja na starcie
async function checkAuthOnStart() {
  await router.isReady();
  const token = getToken();
  if (!token) {
    if (route.name !== 'Login' && route.name !== 'Register') {
      await router.replace({ name: 'Login' });
    }
    isAuthChecked.value = true;
    $hideLoader();
    return;
  }
  try {
    await store.dispatch('user/verifySession');
    await refreshData();
    isAuthChecked.value = true;
    $hideLoader();
  } catch (e) {
    if (route.name !== 'Login' && route.name !== 'Register') {
      await router.replace({ name: 'Login' });
    }
    isAuthChecked.value = true;
    $hideLoader();
  }
}

// Obsługa online/offline
function refreshPendingChanges() {
  pendingChanges.value = queueSize();
}

function handleOnline() {
  isOnline.value = true;
  offlineBannerDismissed.value = false;
  try {
    sessionStorage.removeItem('offlineBannerDismissed');
  } catch (e) {
    // ignoruj
  }
  refreshPendingChanges();
}
function handleOffline() {
  isOnline.value = false;
  refreshPendingChanges();
}
async function refreshData() {
  try {
    await store.dispatch('user/fetchUserHistoryAndHQ');
    await store.dispatch('questions/fetchStats');
  } catch (error) {
    console.error('Błąd odświeżania danych:', error);
  }
}

// Weryfikacja sesji po focusie (maks. raz na minutę)
let lastSessionCheck = 0;
async function verifySession() {
  const now = Date.now();
  if (now - lastSessionCheck < 60 * 1000) return;
  lastSessionCheck = now;

  try {
    const token = getToken();
    if (!token) return;
    await store.dispatch('user/verifySession');
  } catch (error) {
    console.error('Sesja wygasła:', error);
    if (route.name !== 'Login') {
      showAlert('warning', 'Twoja sesja wygasła. Zaloguj się ponownie.', 5000);
      router.push('/login');
    }
  }
}

// Motyw (jasny/ciemny/systemowy)
const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme(theme) {
  const isDark = theme === 'dark' || (theme === 'system' && systemThemeQuery.matches);
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

watch(
  currentTheme,
  (newTheme) => {
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  },
  { immediate: true }
);

function handleSystemThemeChange() {
  if (currentTheme.value === 'system') applyTheme('system');
}
systemThemeQuery.addEventListener('change', handleSystemThemeChange);

let sessionCheckInterval;
let statsRefreshTimer = null;

function handleQuestionsChanged(event) {
  // Zmiana danych unieważnia cache GET-ów, żeby inne widoki pobrały świeże dane.
  apiClient.clearCache();
  if (event && event.detail) {
    handleQuestionsEvent(event.detail);
  }
  clearTimeout(statsRefreshTimer);
  statsRefreshTimer = setTimeout(() => {
    store.dispatch('questions/fetchStats');
  }, 300);
}

function handleUserUpdated(event) {
  const incoming = event.detail?.user;
  if (!incoming) return;
  const merged = {
    ...(store.state.user.user || {}),
    ...incoming,
  };
  store.commit('user/SET_USER', merged);
  setUser(merged);
  if (incoming.option) {
    store.dispatch('ui/setTheme', incoming.option);
  }
}

watch(
  () => store.state.user.isAuthenticated,
  (authenticated) => {
    if (authenticated) {
      startRealtime();
      ensureQuestionsCache();
      flushOfflineQueue();
    } else {
      stopRealtime();
    }
  },
  { immediate: true }
);

onMounted(() => {
  window.addEventListener('questions-changed', handleQuestionsChanged);
  window.addEventListener('user-updated', handleUserUpdated);
  window.addEventListener('offline-queue-changed', refreshPendingChanges);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  window.addEventListener('focus', verifySession);

  sessionCheckInterval = setInterval(checkTokenExpiration, 60 * 1000);
  window.testSessionModal = () => showSessionExpirationModal(5);
  checkTokenExpiration();
  checkAuthOnStart();

  // Lokalna kopia pytań (PWA): uruchamiana po zalogowaniu (watch poniżej),
  // a przy powrocie do karty sprawdzamy tylko wersję (max raz na 5 minut).
  initOfflineSync();

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && store.state.user.isAuthenticated) {
      ensureQuestionsCache();
    }
  });
});

onBeforeUnmount(() => {
  clearInterval(sessionCountdownInterval);
  clearInterval(sessionCheckInterval);
  clearTimeout(statsRefreshTimer);
  stopRealtime();
  window.removeEventListener('questions-changed', handleQuestionsChanged);
  window.removeEventListener('user-updated', handleUserUpdated);
  window.removeEventListener('offline-queue-changed', refreshPendingChanges);
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
  window.removeEventListener('focus', verifySession);
  systemThemeQuery.removeEventListener('change', handleSystemThemeChange);
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
