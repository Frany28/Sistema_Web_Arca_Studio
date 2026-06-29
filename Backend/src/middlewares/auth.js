import { authConfig } from "../config/auth.js";
import { findActiveUserById } from "../repositories/userRepository.js";
import { parseCookies } from "../utils/cookies.js";
import { verifyAuthToken } from "../utils/tokens.js";

function getEmptySession() {
  return {
    isAuthenticated: false,
    payload: null,
    token: null,
  };
}

function getBearerToken(req) {
  const authorization = req.headers.authorization;

  if (!authorization || typeof authorization !== "string") {
    return null;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token.trim();
}

function getQueryToken(req) {
  const token = req.query?.access_token;

  return typeof token === "string" && token.trim() ? token.trim() : null;
}

function isTokenOlderThanUser(payload, user) {
  if (!payload.iat || !user.updatedAt) {
    return false;
  }

  const tokenIssuedAt = Number(payload.iat) * 1000;
  const userUpdatedAt = new Date(user.updatedAt).getTime();

  return userUpdatedAt > tokenIssuedAt + 1000;
}

async function resolveSession(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token =
    getBearerToken(req) || cookies[authConfig.cookieName] || getQueryToken(req);
  const payload = verifyAuthToken(token, {
    secret: authConfig.tokenSecret,
  });

  if (!payload?.sub) {
    return {
      session: getEmptySession(),
      user: null,
    };
  }

  const user = await findActiveUserById(payload.sub);

  if (!user || isTokenOlderThanUser(payload, user)) {
    return {
      session: getEmptySession(),
      user: null,
    };
  }

  return {
    session: {
      isAuthenticated: true,
      payload,
      token,
    },
    user,
  };
}

export async function loadSession(req, _res, next) {
  try {
    const { session, user } = await resolveSession(req);

    req.session = session;
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export async function requireAuth(req, res, next) {
  if (!req.session) {
    try {
      const { session, user } = await resolveSession(req);

      req.session = session;
      req.user = user;
    } catch (error) {
      next(error);
      return;
    }
  }

  if (!req.session.isAuthenticated || !req.user) {
    res.status(401).json({
      code: "UNAUTHENTICATED",
      message: "Sesión requerida.",
    });
    return;
  }

  next();
}

export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({
        code: "UNAUTHENTICATED",
        message: "Sesión requerida.",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role.code)) {
      res.status(403).json({
        code: "FORBIDDEN",
        message: "No tienes permisos para realizar esta acción.",
      });
      return;
    }

    next();
  };
}

export function requirePermissions(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({
        code: "UNAUTHENTICATED",
        message: "Sesión requerida.",
      });
      return;
    }

    const userPermissions = new Set(req.user.permissionCodes || []);
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.has(permission),
    );

    if (!hasAllPermissions) {
      res.status(403).json({
        code: "FORBIDDEN",
        message: "No tienes permisos para realizar esta acción.",
      });
      return;
    }

    next();
  };
}
