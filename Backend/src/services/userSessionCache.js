const entries = new Map();

function ttlMs() { return Number(process.env.AUTH_CACHE_TTL_MS || 30000); }
function maxEntries() { return Number(process.env.AUTH_CACHE_MAX_ENTRIES || 1000); }

export function getCachedUser(userId) {
  const key = String(userId);
  const entry = entries.get(key);
  if (!entry || entry.expiresAt <= Date.now()) {
    entries.delete(key);
    return null;
  }
  entries.delete(key);
  entries.set(key, entry);
  return entry.user;
}

export function cacheUser(userId, user) {
  if (!user) return;
  const key = String(userId);
  entries.delete(key);
  entries.set(key, { user, expiresAt: Date.now() + ttlMs() });
  while (entries.size > maxEntries()) entries.delete(entries.keys().next().value);
}

export function invalidateCachedUser(userId) { entries.delete(String(userId)); }
export function clearUserSessionCache() { entries.clear(); }
