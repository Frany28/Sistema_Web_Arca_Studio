import bcrypt from "bcrypt";

import { authConfig } from "../config/auth.js";
import { ConflictError, NotFoundError } from "../errors/appError.js";
import { findActiveUserById } from "../repositories/userRepository.js";
import {
  completePendingRegistration,
  findPendingRegistrationByEmail,
  findRegistrationUserConflict,
  findValidPendingRegistration,
  refreshPendingRegistration,
  upsertPendingRegistration,
} from "../repositories/registrationRepository.js";
import { createAuthToken, verifyAuthToken } from "../utils/tokens.js";
import {
  createRegistrationEmailPayload,
  hashRegistrationToken,
  sendRegistrationEmail,
} from "./registrationEmailService.js";

function conflictError(code) {
  return code === "PHONE_ALREADY_EXISTS"
    ? new ConflictError(code, "Este número de teléfono ya está registrado.")
    : new ConflictError("EMAIL_ALREADY_EXISTS", "Este correo electrónico ya está registrado.");
}

function parseToken(token) {
  const payload = verifyAuthToken(token, { secret: authConfig.tokenSecret });
  if (!payload || payload.purpose !== "user_registration" || !payload.email) return null;
  return { email: String(payload.email).toLowerCase(), tokenHash: hashRegistrationToken(token) };
}

async function assertNoUserConflict({ email, phone }) {
  const conflict = await findRegistrationUserConflict({ email, phone });
  if (conflict.email_exists) throw conflictError("EMAIL_ALREADY_EXISTS");
  if (conflict.phone_exists) throw conflictError("PHONE_ALREADY_EXISTS");
}

export async function startRegistration(payload) {
  await assertNoUserConflict(payload);
  const mail = createRegistrationEmailPayload(payload.email);
  try {
    await upsertPendingRegistration({
      ...payload,
      firstName: payload.fullName.firstName,
      lastName: payload.fullName.lastName,
      tokenHash: mail.tokenHash,
      expiresAt: mail.expiresAt,
    });
  } catch (error) {
    if (error?.constraint === "user_registrations_phone_key") throw conflictError("PHONE_ALREADY_EXISTS");
    throw error;
  }
  await sendRegistrationEmail({ email: payload.email, registrationUrl: mail.registrationUrl });
  return { message: "Enviamos un enlace de verificación a tu correo electrónico." };
}

export async function resendRegistration(email) {
  const pending = await findPendingRegistrationByEmail(email);
  if (!pending) throw new NotFoundError("REGISTRATION_NOT_FOUND", "No encontramos un registro pendiente para este correo.");
  const mail = createRegistrationEmailPayload(pending.email);
  await refreshPendingRegistration({ email, tokenHash: mail.tokenHash, expiresAt: mail.expiresAt });
  await sendRegistrationEmail({ email: pending.email, registrationUrl: mail.registrationUrl });
  return { message: "Enviamos un nuevo enlace de verificación." };
}

export async function verifyRegistration(token) {
  const parsed = parseToken(token);
  const pending = parsed ? await findValidPendingRegistration(parsed) : null;
  if (!pending) throw new NotFoundError("INVALID_REGISTRATION_TOKEN", "El enlace de registro no es válido, expiró o ya fue utilizado.");
  return { email: pending.email, valid: true };
}

export async function completeRegistration({ token, password }) {
  const parsed = parseToken(token);
  if (!parsed) throw new NotFoundError("INVALID_REGISTRATION_TOKEN", "El enlace de registro no es válido, expiró o ya fue utilizado.");
  const passwordHash = await bcrypt.hash(password, 10);
  let completed;
  try {
    completed = await completePendingRegistration({ ...parsed, passwordHash });
  } catch (error) {
    if (["EMAIL_ALREADY_EXISTS", "PHONE_ALREADY_EXISTS"].includes(error?.code)) throw conflictError(error.code);
    if (error?.code === "23505") {
      throw conflictError(String(error.constraint).includes("phone") ? "PHONE_ALREADY_EXISTS" : "EMAIL_ALREADY_EXISTS");
    }
    throw error;
  }
  if (!completed) throw new NotFoundError("INVALID_REGISTRATION_TOKEN", "El enlace de registro no es válido, expiró o ya fue utilizado.");
  const user = await findActiveUserById(completed.userId);
  const sessionToken = createAuthToken(
    { email: user.email, role: user.role.code, sub: String(user.id) },
    { expiresInSeconds: authConfig.tokenExpiresInSeconds, secret: authConfig.tokenSecret },
  );
  return { token: sessionToken, user };
}
