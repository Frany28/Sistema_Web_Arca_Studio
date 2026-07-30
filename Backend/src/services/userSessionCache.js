const entries = new Map();
const inFlightLoads = new Map();

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

export function getOrLoadUser(userId, loader) {
  const cachedUser = getCachedUser(userId);
  if (cachedUser) return Promise.resolve(cachedUser);

  const key = String(userId);
  const currentLoad = inFlightLoads.get(key);
  if (currentLoad) return currentLoad;

  const load = Promise.resolve()
    .then(loader)
    .then((user) => {
      if (user) cacheUser(key, user);
      return user;
    })
    .finally(() => {
      if (inFlightLoads.get(key) === load) inFlightLoads.delete(key);
    });

  inFlightLoads.set(key, load);
  return load;
}

export function invalidateCachedUser(userId) {
  const key = String(userId);
  entries.delete(key);
  inFlightLoads.delete(key);
}

export function clearUserSessionCache() {
  entries.clear();
  inFlightLoads.clear();
}
