// composables/useStorage.js
import { reactive, watch } from 'vue';

export function useReactiveStorage(key, defaultValue) {
  const state = reactive({
    value: JSON.parse(localStorage.getItem(key)) ?? defaultValue,
  });

  watch(
    () => state.value,
    (val) => {
      localStorage.setItem(key, JSON.stringify(val));
    },
    { deep: true }
  );

  return state;
}
