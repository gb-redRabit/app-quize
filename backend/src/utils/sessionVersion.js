const User = require("../models/User");

const TTL_MS = 60 * 1000;
const cache = new Map();

/**
 * Wersja sesji użytkownika (do unieważniania tokenów).
 * Cache 60 s, żeby nie odpytywać bazy przy każdym żądaniu.
 * @returns {Promise<number|null>} null, gdy użytkownik nie istnieje
 */
async function getSessionVersion(userId) {
  const key = String(userId);
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiresAt > now) return hit.version;

  const user = await User.findById(key).select("tokenVersion").lean();
  if (!user) {
    cache.delete(key);
    return null;
  }

  const version = user.tokenVersion || 0;
  cache.set(key, { version, expiresAt: now + TTL_MS });
  return version;
}

function invalidateSessionVersion(userId) {
  cache.delete(String(userId));
}

/** Podbija wersję sesji — unieważnia wszystkie wcześniejsze tokeny. */
async function bumpSessionVersion(userId) {
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { tokenVersion: 1 } },
    { new: true, select: "tokenVersion" }
  );
  invalidateSessionVersion(userId);
  return user ? user.tokenVersion || 0 : null;
}

module.exports = {
  getSessionVersion,
  invalidateSessionVersion,
  bumpSessionVersion,
};
