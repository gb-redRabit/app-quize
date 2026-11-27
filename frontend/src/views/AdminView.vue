<template>
  <div class="app-shell">
    <PageHeader
      eyebrow="Administracja"
      title="Panel administratora"
      subtitle="Zarządzaj pytaniami, kategoriami i użytkownikami. Skróty: N — nowe pytanie, ? — pomoc."
    />

    <div class="lg:flex lg:items-start lg:gap-6">
      <!-- Zakładki -->
      <div
        class="surface mb-5 flex gap-1 overflow-x-auto p-1 lg:mb-0 lg:w-56 lg:shrink-0 lg:flex-col lg:sticky lg:top-20 xl:top-6"
      >
        <BaseButton
          v-for="tab in tabs"
          :key="tab.key"
          :color="activeTab === tab.key ? 'blue' : 'gray'"
          :variant="activeTab === tab.key ? 'solid' : 'ghost'"
          size="sm"
          class="rounded-xl px-4 shrink-0 whitespace-nowrap lg:w-full lg:justify-start"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </BaseButton>
      </div>

      <div class="lg:flex-1 lg:min-w-0">

    <!-- Zawartość zakładek -->
    <AdminQuestionsTab
      v-if="activeTab === 'questions'"
      ref="questionsTabRef"
    />

    <AdminBatchTab v-else-if="activeTab === 'batch'" />

    <AdminUsersTab v-else-if="activeTab === 'users'" />

    <AdminCategoriesTab v-else-if="activeTab === 'categories'" />

      </div>
    </div>

    <BaseModal :show="showShortcuts" @close="showShortcuts = false">
      <template #header>Skróty klawiszowe</template>
      <div class="p-4">
        <dl class="space-y-3 text-sm">
          <div class="flex items-start gap-3">
            <dt class="shrink-0">
              <kbd class="px-2 py-1 rounded-sm border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-mono text-xs">N</kbd>
            </dt>
            <dd class="text-gray-700 dark:text-gray-300">Nowe pytanie</dd>
          </div>
          <div class="flex items-start gap-3">
            <dt class="shrink-0">
              <kbd class="px-2 py-1 rounded-sm border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-mono text-xs">?</kbd>
            </dt>
            <dd class="text-gray-700 dark:text-gray-300">Ta pomoc</dd>
          </div>
          <div class="flex items-start gap-3">
            <dt class="shrink-0">
              <kbd class="px-2 py-1 rounded-sm border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-mono text-xs">Esc</kbd>
            </dt>
            <dd class="text-gray-700 dark:text-gray-300">Zamknij okno</dd>
          </div>
          <div class="flex items-start gap-3">
            <dt class="shrink-0">
              <kbd class="px-2 py-1 rounded-sm border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-mono text-xs">/</kbd>
            </dt>
            <dd class="text-gray-700 dark:text-gray-300">
              Wyszukiwarka pytań (na liście pytań)
            </dd>
          </div>
        </dl>
        <div class="mt-5 flex justify-end">
          <BaseButton color="gray" @click="showShortcuts = false">Zamknij</BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import {
  computed,
  defineAsyncComponent,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import { useStore } from 'vuex';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseModal from '@/components/base/BaseModal.vue';
import PageHeader from '@/components/layout/PageHeader.vue';

const AdminQuestionsTab = defineAsyncComponent(
  () => import('@/components/admin/AdminQuestionsTab.vue')
);
const AdminUsersTab = defineAsyncComponent(
  () => import('@/components/admin/AdminUsersTab.vue')
);
const AdminCategoriesTab = defineAsyncComponent(
  () => import('@/components/admin/AdminCategoriesTab.vue')
);
const AdminBatchTab = defineAsyncComponent(
  () => import('@/components/admin/AdminBatchTab.vue')
);

const tabs = [
  { key: 'questions', label: 'Pytania' },
  { key: 'batch', label: 'Grupowa edycja' },
  { key: 'users', label: 'Użytkownicy' },
  { key: 'categories', label: 'Kategorie' },
];
const activeTab = ref('questions');
const questionsTabRef = ref(null);
const pendingAddQuestion = ref(false);

const store = useStore();
const showAlert = inject('showAlert');

const currentUser = computed(() => store.getters['user/getUser']);
const isAdmin = computed(() => currentUser.value?.rola === 'admin');
const showShortcuts = ref(false);

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

function requestAddQuestion() {
  activeTab.value = 'questions';
  if (questionsTabRef.value?.openAddPopup) {
    questionsTabRef.value.openAddPopup();
  } else {
    pendingAddQuestion.value = true;
  }
}

watch(questionsTabRef, (component) => {
  if (component && pendingAddQuestion.value) {
    pendingAddQuestion.value = false;
    nextTick(() => component.openAddPopup());
  }
});

function handleAdminKeydown(event) {
  if (!isAdmin.value) return;
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (isTypingTarget(event.target)) return;
  if (document.querySelector('[role="dialog"]')) return;

  if (event.key === '?') {
    event.preventDefault();
    showShortcuts.value = !showShortcuts.value;
    return;
  }

  if (event.key === 'n' || event.key === 'N') {
    event.preventDefault();
    requestAddQuestion();
  }
}

onMounted(() => {
  if (!isAdmin.value) {
    showAlert?.('error', 'Brak uprawnień do panelu administratora.');
    return;
  }
  window.addEventListener('keydown', handleAdminKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleAdminKeydown);
});

</script>
