import { authConfig } from "../config/auth.js";
import { serializeCookie } from "./cookies.js";

export function buildSessionCookie(token, maxAge) {
  return serializeCookie(authConfig.cookieName, token, {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: authConfig.cookieSameSite,
    secure: authConfig.cookieSecure,
  });
}

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

export function preventAuthResponseCaching(res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
}
