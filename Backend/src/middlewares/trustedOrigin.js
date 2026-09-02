import { isAllowedOrigin } from "../config/cors.js";

const UNSAFE_METHODS = new Set(["DELETE", "PATCH", "POST", "PUT"]);
const isProduction = process.env.NODE_ENV === "production";

/**
 * Interpreta el valor de boolean y descarta los formatos que no sean válidos.
 * Participa en la cadena HTTP y continúa o rechaza la solicitud según el resultado.
 *
 * @param {unknown} value - Valor de `value` requerido por esta operación.
 * @param {unknown} [fallback] - Valor de `fallback` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 */
function parseBoolean(value, fallback = false) {
  if (value === undefined || value === "") {
    return fallback;
  }

  return String(value).trim().toLowerCase() === "true";
}

/**
 * Obtiene el origen declarado por la solicitud para que el flujo llamador pueda continuar.
 * Participa en la cadena HTTP y continúa o rechaza la solicitud según el resultado.
 *
 * @param {import("express").Request} req - Solicitud HTTP con los datos previamente validados.
 * @returns {unknown} Resultado producido por la operación.
 */
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

/**
 * Exige el valor de trusted origen y detiene el flujo cuando la condición no se cumple.
 * Participa en la cadena HTTP y continúa o rechaza la solicitud según el resultado.
 *
 * @param {import("express").Request} req - Solicitud HTTP con los datos previamente validados.
 * @param {import("express").Response} res - Respuesta HTTP utilizada para devolver el resultado.
 * @param {Function} next - Función que entrega errores o continúa la cadena de middlewares.
 * @returns {void} Finalización de la operación.
 */
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

  if (isAllowedOrigin(requestOrigin)) {
    next();
    return;
  }

  res.status(403).json({
    code: "UNTRUSTED_ORIGIN",
    message: "Origen de solicitud no permitido.",
  });
}
