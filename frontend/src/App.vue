<template>
  <div
    id="app"
    class="flex flex-col items-center justify-start min-h-screen dark:bg-gray-900 dark:text-gray-200"
    :data-theme="currentTheme"
  >
    <BaseLoader v-if="!isAuthChecked" />
    <template v-else>
      <Navbar v-if="showNavbar" />
      <div
        v-if="!isOnline"
        class="w-full bg-red-600 text-white text-center py-2 fixed top-0 left-0 z-50"
      >
        Brak połączenia z internetem. Niektóre funkcje mogą być niedostępne.
      </div>

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
          class="container my-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
        />
      </router-view>

      <!-- Pasek z czasem ważności tokenu -->
      <!-- <div
        v-if="tokenTimeLeft > 0 && isAuthChecked"
        class="fixed bottom-2 right-2 bg-gray-800 text-white px-4 py-2 rounded shadow-lg text-sm z-50 opacity-90"
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
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-60"
            :disabled="sessionModalLoading"
            @click="refreshSessionToken"
          >
            <span v-if="sessionModalLoading">Odświeżanie...</span>
            <span v-else>Odśwież sesję</span>
          </button>
          <button
            class="ml-2 px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
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
import { useStore, mapGetters } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
const Navbar = defineAsyncComponent(() => import('@/components/layout/Navbar.vue'));
const BaseAlert = defineAsyncComponent(() => import('@/components/base/BaseAlert.vue'));
const BaseLoader = defineAsyncComponent(() => import('@/components/base/BaseLoader.vue'));
const BaseSkeleton = defineAsyncComponent(() => import('@/components/base/BaseSkeleton.vue'));
const BaseModal = defineAsyncComponent(() => import('@/components/base/BaseModal.vue'));
import apiClient from '@/api';
import { useSkeletonConfig } from '@/composables/useSkeletonConfig.js';
import { useGlobalLoader } from '@/composables/useGlobalLoader.js';

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

const globalAlert = ref();
const globalLoader = ref();

const currentTheme = computed(() => store.getters['ui/currentTheme']);
const showNavbar = computed(() => route.name !== 'Login' && route.name !== 'Register');

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
function $showLoader() {
  showLoader();
  globalLoader.value?.show();
}
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
      sessionStorage.setItem('token', res.data.token);
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
  const token = sessionStorage.getItem('token');
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

// Token time left logic
const tokenTimeLeft = ref(0);
const tokenTimeLeftStr = computed(() => {
  if (tokenTimeLeft.value <= 0) return 'wygasł';
  const min = Math.floor(tokenTimeLeft.value / 60);
  const sec = tokenTimeLeft.value % 60;
  return `${min} min ${sec < 10 ? '0' : ''}${sec} s`;
});

function updateTokenTimeLeft() {
  const token = sessionStorage.getItem('token');
  if (!token) {
    tokenTimeLeft.value = 0;
    return;
  }
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
    if (!decoded.exp) {
      tokenTimeLeft.value = 0;
      return;
    }
    const currentTime = Math.floor(Date.now() / 1000);
    tokenTimeLeft.value = Math.max(0, decoded.exp - currentTime);
  } catch (e) {
    tokenTimeLeft.value = 0;
  }
}

// Autoryzacja na starcie
async function checkAuthOnStart() {
  const token = sessionStorage.getItem('token');
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
function handleOnline() {
  isOnline.value = true;
}
function handleOffline() {
  isOnline.value = false;
}
async function refreshData() {
  try {
    await store.dispatch('user/fetchUserHistoryAndHQ');
    await store.dispatch('questions/fetchStats');
  } catch (error) {
    console.error('Błąd odświeżania danych:', error);
  }
}

// Weryfikacja sesji po focusie
async function verifySession() {
  try {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    await store.dispatch('user/verifySession');
    refreshData();
  } catch (error) {
    console.error('Sesja wygasła:', error);
    if (route.name !== 'Login') {
      showAlert('warning', 'Twoja sesja wygasła. Zaloguj się ponownie.', 5000);
      router.push('/login');
    }
  }
}

// Motyw
watch(
  currentTheme,
  (newTheme) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
  },
  { immediate: true }
);

let sessionCheckInterval;

onMounted(() => {
  // Motyw na starcie
  const savedTheme = localStorage.getItem('theme') || currentTheme.value;
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  router.beforeEach((to, from, next) => {
    isPageLoading.value = true;
    next();
  });
  router.afterEach(() => {
    const delay = route.path.includes('/questions') ? 600 : 400;
    setTimeout(() => {
      isPageLoading.value = false;
    }, delay);
  });

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  window.addEventListener('focus', verifySession);

  sessionCheckInterval = setInterval(checkTokenExpiration, 60 * 1000);
  window.testSessionModal = () => showSessionExpirationModal(5);
  checkTokenExpiration();
  checkAuthOnStart();

  setInterval(updateTokenTimeLeft, 1000);
  updateTokenTimeLeft();
});

onBeforeUnmount(() => {
  clearInterval(sessionCountdownInterval);
  clearInterval(sessionCheckInterval);
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
  window.removeEventListener('focus', verifySession);
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
