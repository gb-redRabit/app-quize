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
      <Navbar v-if="showAppNavigation" />
      <div
        v-if="!isOnline && !offlineBannerDismissed"
        class="fixed left-1/2 top-[4.75rem] z-50 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-gray-700/60 bg-gray-900/95 px-3 py-1.5 text-xs text-gray-100 shadow-lg backdrop-blur lg:left-auto lg:right-6 lg:top-auto lg:bottom-6 lg:translate-x-0"
        role="status"
        aria-live="polite"
      >
        <span class="h-2 w-2 shrink-0 rounded-full bg-amber-400" aria-hidden="true"></span>
        <span class="truncate">
          Tryb offline
          <template v-if="pendingChanges > 0">
            · {{ pendingChanges }}
            {{
              pluralizePl(
                pendingChanges,
                'zmiana czeka',
                'zmiany czekają',
                'zmian czeka'
              )
            }}
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
      <ShortcutsModal :show="showShortcuts" @close="showShortcuts = false" />
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
const ShortcutsModal = defineAsyncComponent(
  () => import('@/components/layout/ShortcutsModal.vue')
);
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
import { pluralizePl } from '@/utils/pluralize';
import { registerUiBridge } from '@/services/uiBridge';
import { getToken, setToken, setUser, hasCachedHQuestion } from '@/utils/authStorage';

const store = useStore();
const router = useRouter();
const route = useRoute();

const isPageLoading = ref(false);
const showSessionModal = ref(false);
const { globalLoaderVisible, showLoader, hideLoader } = useGlobalLoader();
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

const showShortcuts = ref(false);
let gPrefixActive = false;
let gPrefixTimer = null;

function isTypingTarget(target) {
  if (!target) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable === true
  );
}

function resetGPrefix() {
  gPrefixActive = false;
  if (gPrefixTimer) {
    clearTimeout(gPrefixTimer);
    gPrefixTimer = null;
  }
}

function handleGlobalShortcuts(event) {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
  if (isTypingTarget(event.target)) return;

  const routeName = String(route.name || '');
  const blockedRoutes = ['QuizView', 'ExamView', 'AdminView'];

  if (
    (event.key === '?' || (event.key === '/' && event.shiftKey)) &&
    !blockedRoutes.includes(routeName)
  ) {
    event.preventDefault();
    resetGPrefix();
    showShortcuts.value = true;
    return;
  }

  if (blockedRoutes.includes(routeName)) return;
  if (document.querySelector('[role="dialog"]')) return;

  if (gPrefixActive) {
    const key = String(event.key || '').toLowerCase();
    resetGPrefix();
    const destinations = {
      h: 'Home',
      q: 'AllQuestions',
      p: 'UserPanel',
      a: 'AdminView',
    };
    const destination = destinations[key];
    if (!destination) return;

    if (destination === 'AdminView' && store.getters['user/getUser']?.rola !== 'admin') {
      return;
    }
    event.preventDefault();
    router.push({ name: destination });
    return;
  }

  if (String(event.key || '').toLowerCase() === 'g') {
    gPrefixActive = true;
    if (gPrefixTimer) clearTimeout(gPrefixTimer);
    gPrefixTimer = setTimeout(() => {
      gPrefixActive = false;
      gPrefixTimer = null;
    }, 1200);
  }
}
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
function getTokenSecondsLeft(token) {
  if (!token) return null;
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
    if (!decoded.exp) return null;
    return decoded.exp - Math.floor(Date.now() / 1000);
  } catch (e) {
    return null;
  }
}

function checkTokenExpiration() {
  const token = getToken();
  const timeRemaining = getTokenSecondsLeft(token);
  if (timeRemaining == null) return;
  if (timeRemaining < 5 * 60 && timeRemaining > 0) {
    if (!showSessionModal.value) {
      showSessionExpirationModal(Math.ceil(timeRemaining / 60));
    }
  }
}

// Autoryzacja na starcie
async function checkAuthOnStart() {
  await router.isReady();
  const token = getToken();
  const secondsLeft = getTokenSecondsLeft(token);
  const onAuthRoute = route.name === 'Login' || route.name === 'Register';

  const goToLogin = async () => {
    if (!onAuthRoute) await router.replace({ name: 'Login' });
    isAuthChecked.value = true;
    $hideLoader();
  };

  // Lokalna kopia danych pozwala pokazać aplikację natychmiast i działać offline.
  const hasCachedData =
    hasCachedHQuestion() && Boolean(localStorage.getItem('stats'));

  // Bez tokenu nie ma sesji. Wygasły token: offline nadal pozwalamy korzystać
  // z zapisanych danych (np. quiz bez internetu), online wymagamy logowania.
  if (!token || (secondsLeft != null && secondsLeft <= 0)) {
    const canWorkOffline = Boolean(token) && !navigator.onLine && hasCachedData;
    if (!canWorkOffline) {
      await goToLogin();
      return;
    }
  }

  // Szybki start: mamy zapisaną sesję i lokalną kopię danych (initUser już
  // wypełnił store). Pokazujemy aplikację od razu, a świeże dane dociągamy
  // w tle — jedno żądanie mniej na ścieżce krytycznej.
  if (hasCachedData) {
    isAuthChecked.value = true;
    $hideLoader();
    refreshData();
    return;
  }

  // Pierwsze uruchomienie bez cache: profil jest potrzebny do weryfikacji sesji.
  try {
    await store.dispatch('user/fetchUserProfile');
  } catch (e) {
    const status = e?.response?.status;
    if (status === 401 || status === 403) {
      await goToLogin();
      return;
    }
    // Błąd sieci (offline) — pokazujemy aplikację z tym, co mamy lokalnie.
  }
  isAuthChecked.value = true;
  $hideLoader();
  refreshData();
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

function handleOfflineConflicts(event) {
  const count = Number(event.detail?.count) || 0;
  if (count > 0) {
    const message = pluralizePl(
      count,
      'zmiana nie została wysłana',
      'zmiany nie zostały wysłane',
      'zmian nie zostało wysłanych'
    );
    showAlert('warning', `${count} ${message} — pytania zmieniono w innym miejscu.`, 8000);
  }
}

function handleOfflineImportFinished(event) {
  const done = event.detail?.done || [];
  const failed = event.detail?.failed || [];

  if (done.length > 0) {
    const added = done.reduce((sum, item) => sum + (Number(item.added) || 0), 0);
    const skipped = done.reduce((sum, item) => sum + (Number(item.skipped) || 0), 0);
    const skippedLabel = skipped ? `, pominięto ${skipped}` : '';
    showAlert('success', `Import z kolejki zakończony: dodano ${added}${skippedLabel}.`, 7000);
  }

  if (failed.length > 0) {
    showAlert(
      'warning',
      `Nie udało się wysłać importu: ${failed[0].message || 'plik odrzucony przez serwer.'}`,
      9000
    );
  }
}
async function refreshData() {
  // Historia/odpowiedzi i statystyki są niezależne — pobieramy je równolegle,
  // zamiast dokładać drugie opóźnienie sieciowe.
  await Promise.allSettled([
    store.dispatch('user/fetchUserHistoryAndHQ'),
    store.dispatch('questions/fetchStats'),
  ]);
}

// Po opróżnieniu kolejki offline serwer ma już nasze dane — dociągamy świeży stan.
function handleUserDataSynced() {
  refreshData();
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
  // Warstwa API nie sięga już do prywatnego `__vue_app__`.
  registerUiBridge({
    loader: { show: showLoader, hide: hideLoader },
    alert: showAlert,
  });
  window.addEventListener('questions-changed', handleQuestionsChanged);
  window.addEventListener('user-updated', handleUserUpdated);
  window.addEventListener('offline-queue-changed', refreshPendingChanges);
  window.addEventListener('offline-conflicts', handleOfflineConflicts);
  window.addEventListener('offline-import-finished', handleOfflineImportFinished);
  window.addEventListener('user-data-synced', handleUserDataSynced);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  window.addEventListener('focus', verifySession);
  window.addEventListener('keydown', handleGlobalShortcuts);

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
  window.removeEventListener('offline-conflicts', handleOfflineConflicts);
  window.removeEventListener('offline-import-finished', handleOfflineImportFinished);
  window.removeEventListener('user-data-synced', handleUserDataSynced);
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
  window.removeEventListener('focus', verifySession);
  window.removeEventListener('keydown', handleGlobalShortcuts);
  resetGPrefix();
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
