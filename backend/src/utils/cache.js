const cache = {};

function setCache(key, value) {
  cache[key] = { value, updatedAt: Date.now() };
}

function getCache(key) {
  return cache[key] ? cache[key].value : null;
}

function clearCache(key) {
  delete cache[key];
}

module.exports = { setCache, getCache, clearCache };