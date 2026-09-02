import { authConfig } from "../config/auth.js";
import { serializeCookie } from "./cookies.js";

/**
 * Construye el valor de sesión cookie a partir de datos previamente validados.
 * Centraliza este comportamiento para que sus consumidores utilicen el mismo criterio.
 *
 * @param {string} token - Valor de `token` requerido por esta operación.
 * @param {number} maxAge - Valor de `maxAge` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 */
export function buildSessionCookie(token, maxAge) {
  return serializeCookie(authConfig.cookieName, token, {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: authConfig.cookieSameSite,
    secure: authConfig.cookieSecure,
  });
}

/**
 * Construye el valor de expired sesión cookie a partir de datos previamente validados.
 * Centraliza este comportamiento para que sus consumidores utilicen el mismo criterio.
 *
 * @returns {unknown} Resultado producido por la operación.
 */
export function buildExpiredSessionCookie() {
  return serializeCookie(authConfig.cookieName, "", {
    expires: new Date(0),
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: authConfig.cookieSameSite,
    secure: authConfig.cookieSecure,
  });
}

/**
 * Procesa el valor de prevent autenticación response caching para completar la responsabilidad asignada al módulo.
 * Centraliza este comportamiento para que sus consumidores utilicen el mismo criterio.
 *
 * @param {import("express").Response} res - Respuesta HTTP utilizada para devolver el resultado.
 * @returns {void} Finalización de la operación.
 */
export function preventAuthResponseCaching(res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
}
