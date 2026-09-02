import { getStorageObjectKeyFromFileUrl } from "../config/storage.js";
import { NotFoundError } from "../errors/appError.js";
import { findEnvironmentCommentAuthorProfilePhoto } from "../repositories/environmentCommentRepository.js";
import { findAdminAssigneeProfilePhoto } from "../repositories/adminDashboardRepository.js";
import { findAdminUserProfilePhoto } from "../repositories/adminUserRepository.js";
import { findProjectCommentAuthorProfilePhoto } from "../repositories/projectCommentRepository.js";
import { findAssignedArchitectProfilePhotoForUser } from "../repositories/projectRepository.js";
import { objectStorage } from "./objectStorage.js";
import { uploadPolicies } from "./fileUploadService.js";

const PROFILE_PHOTO_NOT_FOUND_MESSAGE =
  "No se pudo encontrar la foto de perfil.";

/**
 * Obtiene el tipo MIME permitido para la foto de perfil para que el flujo llamador pueda continuar.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @param {unknown} value - Valor de `value` requerido por esta operación.
 * @returns {unknown} Resultado producido por la operación.
 */
function getProfilePhotoContentType(value) {
  const contentType = String(value || "").split(";")[0].trim().toLowerCase();

  return uploadPolicies.avatar.types.has(contentType)
    ? contentType
    : "application/octet-stream";
}

/**
 * Determina si el valor de missing almacenamiento objeto cumple la condición esperada.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @param {Error} error - Error que debe evaluarse o traducirse.
 * @returns {boolean} Resultado producido por la operación.
 */
function isMissingStorageObject(error) {
  return (
    error?.name === "NoSuchKey" || error?.$metadata?.httpStatusCode === 404
  );
}

/**
 * Obtiene el objeto almacenado de la foto de perfil para que el flujo llamador pueda continuar.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @param {string} profilePhotoUrl - Valor de `profilePhotoUrl` requerido por esta operación.
 * @returns {Promise<object>} Resultado producido por la operación.
 * @throws {Error} Cuando una validación o dependencia impide completar la operación.
 */
export async function getProfilePhotoObject(profilePhotoUrl) {
  const storageKey = getStorageObjectKeyFromFileUrl(profilePhotoUrl);

  if (!storageKey) {
    throw new NotFoundError(
      "PROFILE_PHOTO_NOT_FOUND",
      PROFILE_PHOTO_NOT_FOUND_MESSAGE,
    );
  }

  try {
    const object = await objectStorage.get(storageKey);

    return {
      body: object.Body,
      contentLength: object.ContentLength,
      contentType: getProfilePhotoContentType(object.ContentType),
    };
  } catch (error) {
    if (isMissingStorageObject(error)) {
      throw new NotFoundError(
        "PROFILE_PHOTO_NOT_FOUND",
        PROFILE_PHOTO_NOT_FOUND_MESSAGE,
      );
    }

    throw error;
  }
}

/**
 * Obtiene la foto de perfil del responsable administrativo para que el flujo llamador pueda continuar.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @param {object} options - Opciones agrupadas necesarias para ejecutar la operación.
 * @param {string} options.userId - Valor de `options.userId` requerido por esta operación.
 * @returns {Promise<unknown>} Resultado producido por la operación.
 */
export async function getAdminAssigneeProfilePhoto({ userId }) {
  const profilePhotoUrl = await findAdminAssigneeProfilePhoto(userId);

  return getProfilePhotoObject(profilePhotoUrl);
}

/**
 * Obtiene la foto de perfil de un usuario administrado para que el flujo llamador pueda continuar.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @param {object} options - Opciones agrupadas necesarias para ejecutar la operación.
 * @param {string} options.userId - Valor de `options.userId` requerido por esta operación.
 * @returns {Promise<unknown>} Resultado producido por la operación.
 */
export async function getAdminUserProfilePhoto({ userId }) {
  const profilePhotoUrl = await findAdminUserProfilePhoto(userId);

  return getProfilePhotoObject(profilePhotoUrl);
}

/**
 * Obtiene la foto del autor del comentario de proyecto para que el flujo llamador pueda continuar.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @param {object} options - Opciones agrupadas necesarias para ejecutar la operación.
 * @param {string} options.authorUserId - Valor de `options.authorUserId` requerido por esta operación.
 * @param {string} options.projectId - Valor de `options.projectId` requerido por esta operación.
 * @param {unknown} options.user - Valor de `options.user` requerido por esta operación.
 * @returns {Promise<unknown>} Resultado producido por la operación.
 */
export async function getProjectCommentAuthorProfilePhoto({
  authorUserId,
  projectId,
  user,
}) {
  const profilePhotoUrl = await findProjectCommentAuthorProfilePhoto(
    projectId,
    authorUserId,
    user,
  );

  return getProfilePhotoObject(profilePhotoUrl);
}

/**
 * Obtiene la foto del autor del comentario de entorno para que el flujo llamador pueda continuar.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @param {object} options - Opciones agrupadas necesarias para ejecutar la operación.
 * @param {string} options.authorUserId - Valor de `options.authorUserId` requerido por esta operación.
 * @param {unknown} options.user - Valor de `options.user` requerido por esta operación.
 * @returns {Promise<unknown>} Resultado producido por la operación.
 */
export async function getEnvironmentCommentAuthorProfilePhoto({
  authorUserId,
  user,
}) {
  const profilePhotoUrl = await findEnvironmentCommentAuthorProfilePhoto(
    authorUserId,
    user,
  );

  return getProfilePhotoObject(profilePhotoUrl);
}

/**
 * Obtiene la foto de perfil del arquitecto asignado para que el flujo llamador pueda continuar.
 * Aplica las reglas de negocio y coordina las dependencias necesarias para la operación.
 *
 * @param {object} options - Opciones agrupadas necesarias para ejecutar la operación.
 * @param {string} options.projectId - Valor de `options.projectId` requerido por esta operación.
 * @param {unknown} options.user - Valor de `options.user` requerido por esta operación.
 * @returns {Promise<unknown>} Resultado producido por la operación.
 */
export async function getAssignedArchitectProfilePhoto({ projectId, user }) {
  const profilePhotoUrl = await findAssignedArchitectProfilePhotoForUser(
    projectId,
    user,
  );

  return getProfilePhotoObject(profilePhotoUrl);
}
