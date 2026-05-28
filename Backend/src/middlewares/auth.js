import { authConfig } from "../config/auth.js";
import { findActiveUserById } from "../repositories/userRepository.js";
import { parseCookies } from "../utils/cookies.js";
import { verifyAuthToken } from "../utils/tokens.js";

export async function requireAuth(req, res, next) {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[authConfig.cookieName];
    const payload = verifyAuthToken(token, {
      secret: authConfig.tokenSecret,
    });

    if (!payload?.sub) {
      res.status(401).json({
        code: "UNAUTHENTICATED",
        message: "Sesion requerida.",
      });
      return;
    }

    const user = await findActiveUserById(payload.sub);

    if (!user) {
      res.status(401).json({
        code: "UNAUTHENTICATED",
        message: "Sesion invalida.",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({
        code: "UNAUTHENTICATED",
        message: "Sesion requerida.",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role.code)) {
      res.status(403).json({
        code: "FORBIDDEN",
        message: "No tienes permisos para realizar esta accion.",
      });
      return;
    }

    next();
  };
}
