import crypto from "node:crypto";

const isProduction = process.env.NODE_ENV === "production";


/**
 * Obtiene el valor de required production secret para que el flujo llamador pueda continuar.
 * Centraliza esta decisión para mantener consistente la configuración del backend.
 *
 * @returns {unknown} Resultado producido por la operación.
 * @throws {Error} Cuando una validación o dependencia impide completar la operación.
 */
function getRequiredProductionSecret() {
  if (process.env.AUTH_TOKEN_SECRET) {
    return process.env.AUTH_TOKEN_SECRET;
  }

  if (isProduction) {
    throw new Error("AUTH_TOKEN_SECRET is required in production");
  }

  return crypto.randomBytes(32).toString("hex");
}

/**
 * Resuelve la configuración de la cookie de autenticación a partir de la solicitud y la configuración disponible.
 * Centraliza esta decisión para mantener consistente la configuración del backend.
 *
 * @param {unknown} [environment] - Valor de `environment` requerido por esta operación.
 * @returns {object} Resultado producido por la operación.
 */
export function resolveAuthCookieConfig(environment = process.env) {
  const production = environment.NODE_ENV === "production";
  return {
    cookieName: production
      ? "__Host-arca_session"
      : environment.AUTH_COOKIE_NAME || "arca_session",
    cookieSameSite: production
      ? "Lax"
      : environment.AUTH_COOKIE_SAMESITE || "Lax",
    cookieSecure:
      production ||
      (environment.AUTH_COOKIE_SECURE !== undefined &&
        environment.AUTH_COOKIE_SECURE === "true"),
  };
}

export const authConfig = {
  ...resolveAuthCookieConfig(),
  isProduction,
  loginRateLimitMax: Number(process.env.AUTH_LOGIN_RATE_LIMIT_MAX || 5),
  loginRateLimitWindowMs: Number(
    process.env.AUTH_LOGIN_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  ),
  tokenExpiresInSeconds: Number(
    process.env.AUTH_TOKEN_EXPIRES_IN_SECONDS || 12 * 60 * 60,
  ),
  tokenSecret: getRequiredProductionSecret(),
};
