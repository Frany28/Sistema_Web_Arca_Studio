import bcrypt from "bcrypt";

import { authConfig } from "../config/auth.js";
import {
  findUserByEmail,
  findActiveUserById,
  sanitizeUser,
  updateLastLoginAt,
  updateUserPassword,
} from "../repositories/userRepository.js";
import {
  createPasswordResetPayload,
  sendPasswordResetEmail,
} from "../services/passwordResetEmailService.js";
import { serializeCookie } from "../utils/cookies.js";
import { createAuthToken, verifyAuthToken } from "../utils/tokens.js";

const FAKE_BCRYPT_HASH =
  "$2a$10$rN2S9IoJgP1Fx41s6fWaIOY6PksHh4EYoJ.13YZRbrxIJpV66F79i";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildSessionCookie(token, maxAge) {
  return serializeCookie(authConfig.cookieName, token, {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: authConfig.cookieSameSite,
    secure: authConfig.cookieSecure,
  });
}

function buildExpiredSessionCookie() {
  return serializeCookie(authConfig.cookieName, "", {
    expires: new Date(0),
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: authConfig.cookieSameSite,
    secure: authConfig.cookieSecure,
  });
}

function parseResetToken(token) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const payload = verifyAuthToken(token, {
    secret: authConfig.tokenSecret,
  });

  if (
    !payload ||
    payload.purpose !== "password_reset" ||
    !payload.sub ||
    Number.isNaN(Number(payload.sub))
  ) {
    return null;
  }

  return {
    userId: Number(payload.sub),
    email: payload.email,
  };
}

export async function login(req, res, next) {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (
      !isValidEmail(email) ||
      password.length < 8 ||
      password.length > 256
    ) {
      res.status(400).json({
        code: "INVALID_CREDENTIALS",
        message: "Correo o contrasena invalidos.",
      });
      return;
    }

    const userRecord = await findUserByEmail(email);
    const passwordHash = userRecord?.password_hash || FAKE_BCRYPT_HASH;
    const passwordMatches = await bcrypt.compare(password, passwordHash);

    if (
      !userRecord ||
      userRecord.status !== "active" ||
      !passwordMatches
    ) {
      res.status(401).json({
        code: "INVALID_CREDENTIALS",
        message: "Correo o contrasena invalidos.",
      });
      return;
    }

    await updateLastLoginAt(userRecord.id);

    const safeUser = sanitizeUser({
      ...userRecord,
      last_login_at: new Date().toISOString(),
    });
    const token = createAuthToken(
      {
        email: safeUser.email,
        role: safeUser.role.code,
        sub: String(safeUser.id),
      },
      {
        expiresInSeconds: authConfig.tokenExpiresInSeconds,
        secret: authConfig.tokenSecret,
      },
    );

    res.setHeader(
      "Set-Cookie",
      buildSessionCookie(token, authConfig.tokenExpiresInSeconds),
    );
    res.status(200).json({
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
}

export function me(req, res) {
  res.status(200).json({
    user: req.user,
  });
}

export function logout(_req, res) {
  res.setHeader("Set-Cookie", buildExpiredSessionCookie());
  res.status(204).end();
}

export async function forgotPassword(req, res, next) {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();

    if (!isValidEmail(email)) {
      res.status(400).json({
        code: "INVALID_EMAIL",
        message: "Ingresa un correo electronico valido.",
      });
      return;
    }

    const userRecord = await findUserByEmail(email);

    if (!userRecord) {
      res.status(404).json({
        code: "EMAIL_NOT_FOUND",
        message: "No encontramos una cuenta asociada a ese correo.",
      });
      return;
    }

    if (userRecord.status !== "active") {
      res.status(409).json({
        code: "ACCOUNT_NOT_ACTIVE",
        message: "La cuenta no esta activa. Contacta a soporte.",
      });
      return;
    }

    const resetPayload = createPasswordResetPayload(userRecord);

    await sendPasswordResetEmail({
      email: userRecord.email,
      ...resetPayload,
    });

    res.status(202).json({
      message: "Enviamos un enlace de recuperacion a tu correo.",
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyResetToken(req, res, next) {
  try {
    const token = String(req.body?.token || "").trim();
    const payload = parseResetToken(token);

    if (!payload) {
      res.status(400).json({
        code: "INVALID_RESET_TOKEN",
        message: "El enlace de restablecimiento no es válido o expiró.",
      });
      return;
    }

    const userRecord = await findActiveUserById(payload.userId);

    if (!userRecord) {
      res.status(404).json({
        code: "USER_NOT_FOUND",
        message: "No encontramos un usuario válido para este enlace.",
      });
      return;
    }

    res.status(200).json({ valid: true });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const token = String(req.body?.token || "").trim();
    const password = String(req.body?.password || "").trim();

    if (!password || password.length < 8) {
      res.status(400).json({
        code: "INVALID_PASSWORD",
        message: "La contraseña debe tener al menos 8 caracteres.",
      });
      return;
    }

    const payload = parseResetToken(token);

    if (!payload) {
      res.status(400).json({
        code: "INVALID_RESET_TOKEN",
        message: "El enlace de restablecimiento no es válido o expiró.",
      });
      return;
    }

    const userRecord = await findActiveUserById(payload.userId);

    if (!userRecord) {
      res.status(404).json({
        code: "USER_NOT_FOUND",
        message: "No encontramos un usuario válido para este enlace.",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await updateUserPassword(userRecord.id, passwordHash);

    res.status(200).json({
      message: "Tu contraseña ha sido actualizada con éxito.",
    });
  } catch (error) {
    next(error);
  }
}
