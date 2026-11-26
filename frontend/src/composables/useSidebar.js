import { ref } from 'vue';

const STORAGE_KEY = 'sidebar-collapsed';

function readInitial() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === '1' || stored === '0') return stored === '1';
  } catch (e) {
    // Prywatny tryb — wracamy do wartości zależnej od szerokości ekranu.
  }

  // Zgodnie ze specyfikacją: od xl domyślnie rozwinięty, na lg kompaktowy.
  try {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return !window.matchMedia('(min-width: 1280px)').matches;
    }
  } catch (e) {
    // ignore
  }
  return false;
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
