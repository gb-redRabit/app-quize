// Node 26 udostępnia eksperymentalny globalny `localStorage`/`sessionStorage`,
// który bez flagi jest `undefined` i przesłania implementację jsdom.
// Podstawiamy prostą pamięć, żeby moduły (store) mogły się zaimportować.
function makeMemoryStorage() {
  const memory = new Map();
  return {
    getItem: (key) => (memory.has(key) ? memory.get(key) : null),
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key),
    clear: () => memory.clear(),
    key: (index) => [...memory.keys()][index] ?? null,
    get length() {
      return memory.size;
    },
  };
}

if (!globalThis.localStorage) {
  globalThis.localStorage = makeMemoryStorage();
}

if (!globalThis.sessionStorage) {
  globalThis.sessionStorage = makeMemoryStorage();
}

// jsdom nie liczy layoutu — `offsetParent` jest zawsze `null`, przez co
// filtry widoczności (np. focus trap w BaseModal) widzą zero elementów.
if (typeof HTMLElement !== 'undefined') {
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    configurable: true,
    get() {
      return this.parentElement || null;
    },
  });
}
