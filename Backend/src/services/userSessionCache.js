const entries = new Map();
const inFlightLoads = new Map();

/**
 * Calcula el valor de ms desde la configuración del entorno.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @returns {unknown} Resultado producido por la operación.
 */
function ttlMs() { return Number(process.env.AUTH_CACHE_TTL_MS || 30000); }
/**
 * Procesa el valor de max entries para completar la responsabilidad asignada al módulo.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @returns {unknown} Resultado producido por la operación.
 */
function maxEntries() { return Number(process.env.AUTH_CACHE_MAX_ENTRIES || 1000); }

/**
 * Obtiene el usuario almacenado en caché para que el flujo llamador pueda continuar.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @param {string} userId - Valor de `userId` requerido por esta operación.
 * @returns {object} Resultado producido por la operación.
 */
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

/**
 * Guarda el usuario para reutilizarlo durante solicitudes posteriores.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @param {string} userId - Valor de `userId` requerido por esta operación.
 * @param {unknown} user - Usuario autenticado que ejecuta la operación.
 * @returns {void} Finalización de la operación.
 */
export function cacheUser(userId, user) {
  if (!user) return;
  const key = String(userId);
  entries.delete(key);
  entries.set(key, { user, expiresAt: Date.now() + ttlMs() });
  while (entries.size > maxEntries()) entries.delete(entries.keys().next().value);
}

/**
 * Obtiene el valor de or load usuario para que el flujo llamador pueda continuar.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @param {string} userId - Valor de `userId` requerido por esta operación.
 * @param {Function} loader - Valor de `loader` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 */
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

/**
 * Invalida el usuario almacenado en caché para impedir que se reutilicen datos desactualizados.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @param {string} userId - Valor de `userId` requerido por esta operación.
 * @returns {void} Finalización de la operación.
 */
export function invalidateCachedUser(userId) {
  const key = String(userId);
  entries.delete(key);
  inFlightLoads.delete(key);
}

/**
 * Vacía la caché de sesiones de usuario para evitar reutilizar información obsoleta.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @returns {void} Finalización de la operación.
 */
export function clearUserSessionCache() {
  entries.clear();
  inFlightLoads.clear();
}
