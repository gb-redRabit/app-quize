// Ustawia motyw przed pierwszym renderowaniem, żeby uniknąć mignięcia.
(function () {
  try {
    var stored = localStorage.getItem('theme') || 'light';
    var prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = stored === 'dark' || (stored === 'system' && prefersDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch (error) {
    // Brak dostępu do localStorage (tryb prywatny) — zostaje motyw jasny.
  }
})();
