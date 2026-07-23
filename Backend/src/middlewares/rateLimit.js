const stores = new Map();

function clientIp(req) {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function storeFor(name) {
  if (!stores.has(name)) stores.set(name, new Map());
  return stores.get(name);
}

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
