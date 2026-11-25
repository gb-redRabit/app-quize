import { ref } from 'vue';

const STORAGE_KEY = 'sidebar-collapsed';

function readInitial() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

// Współdzielone między App.vue (offsety) i AppSidebar.vue (wygląd).
const collapsed = ref(readInitial());

/** Stan zwiniętego sidebara na desktopie (zapamiętywany w localStorage). */
export function useSidebar() {
  function toggle() {
    collapsed.value = !collapsed.value;
    try {
      localStorage.setItem(STORAGE_KEY, collapsed.value ? '1' : '0');
    } catch {
      // Prywatny tryb / brak dostępu do localStorage — stan działa do odświeżenia.
    }
  }

  return { collapsed, toggle };
}
