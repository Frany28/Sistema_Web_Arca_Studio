import { getStorageObjectKeyFromFileUrl } from "../config/storage.js";
import { NotFoundError } from "../errors/appError.js";
import { findProjectCommentAuthorProfilePhoto } from "../repositories/projectCommentRepository.js";
import { objectStorage } from "./objectStorage.js";
import { uploadPolicies } from "./fileUploadService.js";

const PROFILE_PHOTO_NOT_FOUND_MESSAGE =
  "No se pudo encontrar la foto de perfil.";

function getProfilePhotoContentType(value) {
  const contentType = String(value || "").split(";")[0].trim().toLowerCase();

  return uploadPolicies.avatar.types.has(contentType)
    ? contentType
    : "application/octet-stream";
}

function isMissingStorageObject(error) {
  return (
    error?.name === "NoSuchKey" || error?.$metadata?.httpStatusCode === 404
  );
}

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
