import bcrypt from "bcrypt";

import { authConfig } from "../config/auth.js";
import {
  buildStorageFileUrl,
  buildUserProfilePhotoObjectKey,
  getStorageObjectKeyFromFileUrl,
  getSupabaseStorageConfig,
} from "../config/storage.js";
import { objectStorage } from "../services/objectStorage.js";
import {
  findUserByEmail,
  findActiveUserById,
  findActiveUserCredentialsById,
  sanitizeUser,
  toPublicUser,
  updateLastLoginAt,
  updateUserPassword,
  updateUserProfilePhotoUrl,
} from "../repositories/userRepository.js";
import {
  consumePasswordResetToken,
  createPasswordResetToken,
  findValidPasswordResetToken,
} from "../repositories/passwordResetRepository.js";
import {
  createPasswordResetPayload,
  hashPasswordResetToken,
  sendPasswordResetEmail,
} from "../services/passwordResetEmailService.js";
import { serializeCookie } from "../utils/cookies.js";
import { createAuthToken, verifyAuthToken } from "../utils/tokens.js";
import { invalidateCachedUser } from "../services/userSessionCache.js";
import { prepareUpload, uploadPolicies } from "../services/fileUploadService.js";

const FAKE_BCRYPT_HASH =
  "$2a$10$rN2S9IoJgP1Fx41s6fWaIOY6PksHh4EYoJ.13YZRbrxIJpV66F79i";
const PASSWORD_RESET_ACCEPTED_RESPONSE = {
  message: "Si el correo está registrado, enviaremos un enlace de recuperación.",
};

function getProfilePhotoContentType(value) {
  const contentType = String(value || "").split(";")[0].trim().toLowerCase();

  return uploadPolicies.avatar.types.has(contentType)
    ? contentType
    : "image/jpeg";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password) {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export function buildSessionCookie(token, maxAge) {
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
    tokenHash: hashPasswordResetToken(token),
  };
}

export async function login(req, res, next) {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || "");

    if (!isValidEmail(email) || password.length < 8 || password.length > 256) {
      res.status(400).json({
        code: "INVALID_CREDENTIALS",
        message: "Correo o contraseña invalidos.",
      });
      return;
    }

    const userRecord = await findUserByEmail(email);
    const passwordHash = userRecord?.password_hash || FAKE_BCRYPT_HASH;
    const passwordMatches = await bcrypt.compare(password, passwordHash);

    if (!userRecord || !passwordMatches) {
      res.status(401).json({
        code: "INVALID_CREDENTIALS",
        message: "Correo o contraseña invalidos.",
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
      user: toPublicUser(safeUser),
    });
  } catch (error) {
    next(error);
  }
}

export function me(req, res) {
  res.status(200).json({
    user: toPublicUser(req.user),
  });
}

export function logout(_req, res) {
  res.setHeader("Set-Cookie", buildExpiredSessionCookie());
  res.status(204).end();
}

export async function changePassword(req, res, next) {
  try {
    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");

    if (
      !currentPassword ||
      currentPassword.length > 256 ||
      !isValidPassword(newPassword) ||
      newPassword.length > 256
    ) {
      res.status(400).json({
        code: "INVALID_PASSWORD",
        message:
          "La nueva contraseña debe tener al menos 8 caracteres, incluir una mayúscula, un número y un carácter especial.",
      });
      return;
    }

    if (currentPassword === newPassword) {
      res.status(400).json({
        code: "PASSWORD_UNCHANGED",
        message: "La nueva contraseña debe ser diferente a la actual.",
      });
      return;
    }

    const credentials = await findActiveUserCredentialsById(req.user.id);
    const currentPasswordMatches =
      typeof credentials?.password_hash === "string" &&
      (await bcrypt.compare(currentPassword, credentials.password_hash));

    if (!currentPasswordMatches) {
      res.status(401).json({
        code: "CURRENT_PASSWORD_INCORRECT",
        message: "La contraseña actual es incorrecta.",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(req.user.id, passwordHash);
    invalidateCachedUser(req.user.id);
    const token = createAuthToken(
      {
        email: req.user.email,
        role: req.user.role.code,
        sub: String(req.user.id),
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
      message: "Tu contraseña ha sido actualizada con éxito.",
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadProfilePhoto(req, res, next) {
  let uploadedStorageKey = null;

  try {
    const { body: fileStream, contentType, originalName, size: fileSize } = prepareUpload(req, uploadPolicies.avatar, { fallbackName: "avatar.jpg" });

    const storageConfig = getSupabaseStorageConfig();

    if (!storageConfig.bucket) {
      throw new Error("SUPABASE_STORAGE_BUCKET is required");
    }

    const uploadedAt = new Date();
    const storageKey = buildUserProfilePhotoObjectKey({
      originalName,
      uploadedAt,
      userId: req.user.id,
    });
    const fileUrl = buildStorageFileUrl(storageKey);
    const previousStorageKey = getStorageObjectKeyFromFileUrl(
      req.user.profilePhotoUrl,
    );
    const previousProfilePhotoPrefix = `users/${req.user.id}/profile-photo/`;
    await objectStorage.put({
        body: fileStream,
        contentLength: fileSize,
        contentType,
        key: storageKey,
        metadata: {
          belongs_to: "user_profile_photo",
          uploaded_by: String(req.user.id),
          uploaded_year: String(uploadedAt.getUTCFullYear()),
          user_id: String(req.user.id),
        },
    });
    uploadedStorageKey = storageKey;

    const user = await updateUserProfilePhotoUrl(req.user.id, fileUrl);
    invalidateCachedUser(req.user.id);

    if (!user) {
      await objectStorage.delete(storageKey).catch(() => {});
      uploadedStorageKey = null;
      res.status(404).json({
        code: "USER_NOT_FOUND",
        message: "No encontramos un usuario activo para actualizar.",
      });
      return;
    }

    const token = createAuthToken(
      {
        email: user.email,
        role: user.role.code,
        sub: String(user.id),
      },
      {
        expiresInSeconds: authConfig.tokenExpiresInSeconds,
        secret: authConfig.tokenSecret,
      },
    );

    if (
      previousStorageKey?.startsWith(previousProfilePhotoPrefix) &&
      previousStorageKey !== storageKey
    ) {
      await objectStorage.delete(previousStorageKey).catch(() => {});
    }

    res.setHeader(
      "Set-Cookie",
      buildSessionCookie(token, authConfig.tokenExpiresInSeconds),
    );
    res.status(200).json({
      user: toPublicUser(user),
    });
    uploadedStorageKey = null;
  } catch (error) {
    if (uploadedStorageKey) {
      try {
        await objectStorage.delete(uploadedStorageKey);
      } catch {
        // Preserve the original failure.
      }
    }

    next(error);
  }
}

export async function getProfilePhotoImage(req, res, next) {
  try {
    // Helmet defaults this header to same-origin. The authenticated image route
    // must also be embeddable when the frontend and API use different origins.
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    const storageKey = getStorageObjectKeyFromFileUrl(req.user?.profilePhotoUrl);

    if (!storageKey) {
      res.status(404).json({
        code: "PROFILE_PHOTO_NOT_FOUND",
        message: "El usuario no tiene una foto de perfil cargada.",
      });
      return;
    }

    const object = await objectStorage.get(storageKey);
    res.status(200);
    res.setHeader(
      "Content-Type",
      getProfilePhotoContentType(object.ContentType),
    );
    res.setHeader("Cache-Control", "private, max-age=60, must-revalidate");
    if (object.ContentLength !== undefined) res.setHeader("Content-Length", String(object.ContentLength));
    object.Body.on?.("error", next);
    object.Body.pipe(res);
  } catch (error) {
    if (
      error?.name === "NoSuchKey" ||
      error?.$metadata?.httpStatusCode === 404
    ) {
      res.status(404).json({
        code: "PROFILE_PHOTO_NOT_FOUND",
        message: "No se pudo encontrar la foto de perfil.",
      });
      return;
    }

    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    if (!isValidEmail(email)) {
      res.status(400).json({
        code: "INVALID_EMAIL",
        message: "Ingresa un correo electronico valido.",
      });
      return;
    }

    const userRecord = await findUserByEmail(email);

    if (!userRecord || userRecord.status !== "active") {
      res.status(202).json(PASSWORD_RESET_ACCEPTED_RESPONSE);
      return;
    }

    const resetPayload = createPasswordResetPayload(userRecord);
    await createPasswordResetToken(
      userRecord.id,
      resetPayload.tokenHash,
      resetPayload.expiresAt,
    );

    await sendPasswordResetEmail({
      email: userRecord.email,
      ...resetPayload,
    });

    res.status(202).json(PASSWORD_RESET_ACCEPTED_RESPONSE);
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
    const resetRecord = userRecord
      ? await findValidPasswordResetToken(payload.userId, payload.tokenHash)
      : null;

    if (!userRecord || !resetRecord) {
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

    if (!isValidPassword(password)) {
      res.status(400).json({
        code: "INVALID_PASSWORD",
        message:
          "La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, un número y un carácter especial.",
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
    const tokenConsumed = userRecord
      ? await consumePasswordResetToken(payload.userId, payload.tokenHash)
      : false;

    if (!userRecord || !tokenConsumed) {
      res.status(404).json({
        code: "USER_NOT_FOUND",
        message: "No encontramos un usuario válido para este enlace.",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await updateUserPassword(userRecord.id, passwordHash);
    invalidateCachedUser(userRecord.id);

    res.status(200).json({
      message: "Tu contraseña ha sido actualizada con éxito.",
    });
  } catch (error) {
    next(error);
  }
}
