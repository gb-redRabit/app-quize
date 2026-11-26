/**
 * Mostek UI dla warstwy API. Zamiast sięgać do prywatnego `__vue_app__`,
 * App.vue rejestruje tu loader i alerter przy montowaniu.
 */
let loader = null;
let alertFn = null;

export function registerUiBridge({ loader: nextLoader, alert } = {}) {
  loader = nextLoader || null;
  alertFn = typeof alert === 'function' ? alert : null;
}

export function getUiLoader() {
  return loader;
}

export function getUiAlert() {
  return alertFn;
}
