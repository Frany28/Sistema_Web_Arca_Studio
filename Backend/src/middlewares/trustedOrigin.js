import { getAllowedOrigins } from "../config/cors.js";

const UNSAFE_METHODS = new Set(["DELETE", "PATCH", "POST", "PUT"]);
const isProduction = process.env.NODE_ENV === "production";

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === "") {
    return fallback;
  }

  return String(value).trim().toLowerCase() === "true";
}

function getRequestOrigin(req) {
  const origin = req.headers.origin;

  if (origin) {
    return origin;
  }

  const referer = req.headers.referer;

  if (!referer) {
    return null;
  }

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

export function requireTrustedOrigin(req, res, next) {
  if (!UNSAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const requestOrigin = getRequestOrigin(req);
  const allowRequestsWithoutOrigin = parseBoolean(
    process.env.CSRF_ALLOW_NO_ORIGIN,
    !isProduction,
  );

  if (!requestOrigin) {
    if (allowRequestsWithoutOrigin) {
      next();
      return;
    }

    res.status(403).json({
      code: "UNTRUSTED_ORIGIN",
      message: "Origen de solicitud no permitido.",
    });
    return;
  }

  const allowedOrigins = getAllowedOrigins();

  if (allowedOrigins.includes("*") || allowedOrigins.includes(requestOrigin)) {
    next();
    return;
  }

  res.status(403).json({
    code: "UNTRUSTED_ORIGIN",
    message: "Origen de solicitud no permitido.",
  });
}
