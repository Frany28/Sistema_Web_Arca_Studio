import crypto from "node:crypto";
import bcrypt from "bcrypt";

import { ConflictError, NotFoundError } from "../errors/appError.js";
import {
  createAdminUserRecord,
  deleteCreatedAdminUser,
  findAdminUserConflict,
  getAdminUserMetrics,
  listAdminUsers,
  updateAdminUserStatusRecord,
} from "../repositories/adminUserRepository.js";
import {
  createPasswordResetToken,
  deletePasswordResetTokensForUser,
} from "../repositories/passwordResetRepository.js";
import {
  createPasswordResetPayload,
  sendPasswordResetEmail,
} from "./passwordResetEmailService.js";
import { mapAdminUser } from "../utils/adminUsers.js";
import { invalidateCachedUser } from "./userSessionCache.js";
import {
  decodeCursor,
  pageResult,
  parsePageLimit,
} from "../utils/pagination.js";

export async function getAdminUsersPage(query = {}) {
  const limit = Math.min(parsePageLimit(query.limit || 10), 50);
  const cursor = decodeCursor(query.cursor);
  const [rows, metrics] = await Promise.all([
    listAdminUsers({
      cursor,
      limit,
      role: query.role,
      search: query.search,
      status: query.status,
    }),
    getAdminUserMetrics(),
  ]);
  const page = pageResult(rows, limit, mapAdminUser, (row) => [
    new Date(row.created_at).toISOString(),
    String(row.id),
  ]);

  return {
    metrics,
    nextCursor: page.nextCursor,
    users: page.items,
  };
}

export async function createAdminUser(payload) {
  const conflict = await findAdminUserConflict({
    email: payload.email,
    phone: payload.phone,
    secondaryPhone: payload.secondaryPhone,
  });
  if (conflict.email_exists) {
    throw new ConflictError("EMAIL_ALREADY_EXISTS", "Este correo electrónico ya está registrado.");
  }
  if (conflict.phone_exists) {
    throw new ConflictError("PHONE_ALREADY_EXISTS", "Uno de los teléfonos ya está registrado.");
  }

  const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString("base64url"), 10);
  let created;
  try {
    created = await createAdminUserRecord({
      ...payload,
      firstName: payload.fullName.firstName,
      lastName: payload.fullName.lastName,
      passwordHash,
    });
  } catch (error) {
    if (error?.code === "23505") {
      const phoneConflict = String(error.constraint || "").includes("phone");
      throw new ConflictError(
        phoneConflict ? "PHONE_ALREADY_EXISTS" : "EMAIL_ALREADY_EXISTS",
        phoneConflict ? "Uno de los teléfonos ya está registrado." : "Este correo electrónico ya está registrado.",
        error,
      );
    }
    throw error;
  }
  if (!created) throw new NotFoundError("ROLE_NOT_FOUND", "El rol seleccionado no está disponible.");

  if (created.status === "active") {
    const invitation = createPasswordResetPayload(created);
    try {
      await createPasswordResetToken(created.id, invitation.tokenHash, invitation.expiresAt);
      await sendPasswordResetEmail({ email: created.email, ...invitation });
    } catch (error) {
      await deletePasswordResetTokensForUser(created.id).catch(() => {});
      await deleteCreatedAdminUser({ userId: created.id, clientId: created.client_id }).catch(() => {});
      throw error;
    }
  }

  return mapAdminUser(created);
}

export async function updateAdminUserStatus({ actorUserId, status, userId }) {
  if (Number(actorUserId) === Number(userId)) {
    throw new ConflictError(
      "SELF_STATUS_CHANGE_NOT_ALLOWED",
      "No puedes cambiar el estado de tu propia cuenta.",
    );
  }

  const updatedUser = await updateAdminUserStatusRecord({ status, userId });
  if (!updatedUser) {
    throw new NotFoundError("USER_NOT_FOUND", "El usuario seleccionado no existe.");
  }

  invalidateCachedUser(userId);
  return mapAdminUser(updatedUser);
}
