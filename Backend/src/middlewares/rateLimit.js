const stores = new Map();

/**
 * Procesa el valor de cliente ip para completar la responsabilidad asignada al módulo.
 * Participa en la cadena HTTP y continúa o rechaza la solicitud según el resultado.
 *
 * @param {import("express").Request} req - Solicitud HTTP con los datos previamente validados.
 * @returns {unknown} Resultado producido por la operación.
 */
function clientIp(req) {
  return req.ip || req.socket.remoteAddress || "unknown";
}

/**
 * Procesa el valor de store for para completar la responsabilidad asignada al módulo.
 * Participa en la cadena HTTP y continúa o rechaza la solicitud según el resultado.
 *
 * @param {string} name - Valor de `name` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 */
function storeFor(name) {
  if (!stores.has(name)) stores.set(name, new Map());
  return stores.get(name);
}

/**
 * Crea el valor de rate limit con los datos validados recibidos.
 * Participa en la cadena HTTP y continúa o rechaza la solicitud según el resultado.
 *
 * @param {object} options - Opciones agrupadas necesarias para ejecutar la operación.
 * @param {string} options.name - Valor de `options.name` requerido por esta operación.
 * @param {number} options.max - Valor de `options.max` requerido por esta operación.
 * @param {number} options.windowMs - Valor de `options.windowMs` requerido por esta operación.
 * @param {string} [options.key] - Valor de `options.key` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 */
export function createRateLimit({ name, max, windowMs, key = (req) => `${clientIp(req)}:${req.user?.id || req.body?.email || "anonymous"}` }) {
  return (req, res, next) => {
    const now = Date.now();
    const store = storeFor(name);
    const normalizedKey = String(key(req)).toLowerCase();
    let entry = store.get(normalizedKey);
    if (!entry || entry.resetAt <= now) entry = { count: 0, resetAt: now + windowMs };
    entry.count += 1;
    store.delete(normalizedKey);
    store.set(normalizedKey, entry);

    const capacity = Number(process.env.RATE_LIMIT_MAX_KEYS || 10000);
    while (store.size > capacity) store.delete(store.keys().next().value);
    if (entry.count > max) {
      const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfter));
      res.status(429).json({ code: "RATE_LIMITED", message: "Demasiadas solicitudes. Intenta de nuevo más tarde.", retryAfter });
      return;
    }
    next();
  };
}
