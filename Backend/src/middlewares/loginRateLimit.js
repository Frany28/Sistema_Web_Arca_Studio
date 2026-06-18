import { authConfig } from "../config/auth.js";

const attempts = new Map();

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

function getRateLimitKey(req) {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const identity = email || (req.user?.id ? `user-${req.user.id}` : "anonymous");
  return `${getClientIp(req)}:${identity}`;
}

export function loginRateLimit(req, res, next) {
  const key = getRateLimitKey(req);
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    attempts.set(key, {
      count: 1,
      resetAt: now + authConfig.loginRateLimitWindowMs,
    });
    next();
    return;
  }

  if (current.count >= authConfig.loginRateLimitMax) {
    res.status(429).json({
      code: "RATE_LIMITED",
      message: "Demasiados intentos. Intenta de nuevo mas tarde.",
    });
    return;
  }

  current.count += 1;
  attempts.set(key, current);
  next();
}
