import { ref } from 'vue';

export function useGlobalLoader() {
  const globalLoaderVisible = ref(false);

  function showLoader() {
    globalLoaderVisible.value = true;
  }
  function hideLoader() {
    globalLoaderVisible.value = false;
  }

  return {
    globalLoaderVisible,
    showLoader,
    hideLoader,
  };
}
