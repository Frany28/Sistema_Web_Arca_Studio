import { authConfig } from "../config/auth.js";
import { findActiveUserById } from "../repositories/userRepository.js";
import { parseCookies } from "../utils/cookies.js";
import { verifyAuthToken } from "../utils/tokens.js";
import { cacheUser, getCachedUser } from "../services/userSessionCache.js";
import { isTokenOlderThanUser } from "../utils/sessionFreshness.js";

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === "") {
    return fallback;
  }

  return String(value).trim().toLowerCase() === "true";
}

const ROUTE_AUTH_DISABLED_FOR_TESTS = parseBoolean(
  process.env.ROUTE_AUTH_DISABLED_FOR_TESTS,
  false,
) && process.env.NODE_ENV !== "production";

function getPublicTestUser() {
  const id = Number(process.env.PUBLIC_TEST_USER_ID || 1);

  return {
    clientId: process.env.PUBLIC_TEST_CLIENT_ID
      ? Number(process.env.PUBLIC_TEST_CLIENT_ID)
      : null,
    email: "pruebas@arca.local",
    firstName: "Usuario",
    id: Number.isInteger(id) && id > 0 ? id : 1,
    lastLoginAt: null,
    lastName: "Pruebas",
    name: "Usuario Pruebas",
    permissionCodes: ["projects.read", "projects.publish"],
    permissions: [
      {
        code: "projects.read",
        description: null,
        id: 0,
        module: "projects",
        name: "Leer proyectos",
      },
      {
        code: "projects.publish",
        description: null,
        id: 0,
        module: "projects",
        name: "Publicar proyectos",
      },
    ],
    phone: "",
    profilePhotoUrl: "",
    role: {
      code: "admin",
      id: 1,
      name: "Administrador",
    },
    status: "active",
    updatedAt: null,
  };
}

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

async function resolveSession(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = getBearerToken(req) || cookies[authConfig.cookieName];
  const payload = verifyAuthToken(token, {
    secret: authConfig.tokenSecret,
  });

  if (!payload?.sub) {
    return {
      session: getEmptySession(),
      user: null,
    };
  }

  let user = getCachedUser(payload.sub);
  if (!user) {
    user = await findActiveUserById(payload.sub);
    cacheUser(payload.sub, user);
  }

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
  if (ROUTE_AUTH_DISABLED_FOR_TESTS) {
    req.session = req.session || {
      isAuthenticated: true,
      payload: {
        role: "admin",
        sub: String(process.env.PUBLIC_TEST_USER_ID || 1),
      },
      token: null,
    };
    req.user = req.user || getPublicTestUser();
    next();
    return;
  }

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
    if (ROUTE_AUTH_DISABLED_FOR_TESTS) {
      req.user = req.user || getPublicTestUser();
      next();
      return;
    }

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
    if (ROUTE_AUTH_DISABLED_FOR_TESTS) {
      req.user = req.user || getPublicTestUser();
      next();
      return;
    }

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
