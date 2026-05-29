import crypto from "node:crypto";

const isProduction = process.env.NODE_ENV === "production";

function getRequiredProductionSecret() {
  if (process.env.AUTH_TOKEN_SECRET) {
    return process.env.AUTH_TOKEN_SECRET;
  }

  if (isProduction) {
    throw new Error("AUTH_TOKEN_SECRET is required in production");
  }

  return crypto.randomBytes(32).toString("hex");
}

export const authConfig = {
  cookieName:
    process.env.AUTH_COOKIE_NAME ||
    (isProduction ? "__Host-arca_session" : "arca_session"),
  cookieSameSite: process.env.AUTH_COOKIE_SAMESITE || (isProduction ? "None" : "Lax"),
  cookieSecure:
    process.env.AUTH_COOKIE_SECURE === undefined
      ? isProduction
      : process.env.AUTH_COOKIE_SECURE === "true",
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
