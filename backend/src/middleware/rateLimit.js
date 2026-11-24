/**
 * Prosty limiter in-memory (jedna instancja backendu).
 * Każdy limiter ma własną mapę — logowanie i rejestracja nie dzielą liczników.
 * @param {{ windowMs?: number, max?: number, message?: string }} options
 */
function rateLimit({ windowMs = 15 * 60 * 1000, max = 10, message } = {}) {
  const buckets = new Map();

  // Sprzątanie wygasłych wpisów tego limitera; nie blokuje zamknięcia procesu.
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of buckets) {
      if (entry.resetAt <= now) buckets.delete(key);
    }
  }, Math.min(windowMs, 10 * 60 * 1000));
  if (typeof cleanup.unref === "function") cleanup.unref();

  return (req, res, next) => {
    const key = req.ip || req.socket?.remoteAddress || "unknown";
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    existing.count += 1;
    if (existing.count > max) {
      const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({
        message: message || "Too many requests, try again later",
      });
    }

    return next();
  };
}

module.exports = {
  loginLimiter: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Zbyt wiele prób logowania. Spróbuj ponownie później.",
  }),
  registerLimiter: rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: "Zbyt wiele rejestracji. Spróbuj ponownie później.",
  }),
};
