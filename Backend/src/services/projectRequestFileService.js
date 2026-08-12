import { AppError, NotFoundError } from "../errors/appError.js";
import {
  deleteProjectRequestFile,
  findExistingProjectRequestFile,
  findProjectRequestForFileUpload,
  getProjectRequestFileUsage,
  uploadProjectRequestFile,
} from "../repositories/fileRepository.js";

const MAX_FILES = 10;
const MAX_TOTAL_BYTES = 200 * 1024 * 1024;

export async function uploadProjectRequestAttachment({ projectRequestId, upload, user }) {
  const projectRequest = await findProjectRequestForFileUpload(projectRequestId, user);
  if (!projectRequest) {
    throw new NotFoundError(
      "PROJECT_REQUEST_NOT_FOUND",
      "No se encontró un borrador disponible para adjuntar archivos.",
    );
  }

  const existingFile = await findExistingProjectRequestFile({
    originalName: upload.originalName,
    projectRequestId,
    userId: user.id,
  });
  if (existingFile) {
    for await (const _chunk of upload.body) {
      // Drain and validate the retried stream before returning the existing file.
    }
    return {
      id: Number(existingFile.id),
      originalName: existingFile.title,
      reused: true,
    };
  }

  const usage = await getProjectRequestFileUsage(projectRequestId);
  if (usage.count >= MAX_FILES) {
    throw new AppError({
      code: "PROJECT_REQUEST_FILE_LIMIT",
      message: "La solicitud admite un máximo de 10 archivos.",
      status: 409,
    });
  }
  if (usage.totalBytes + upload.size > MAX_TOTAL_BYTES) {
    throw new AppError({
      code: "PROJECT_REQUEST_TOTAL_SIZE_LIMIT",
      message: "Los archivos de la solicitud no pueden superar 200 MB en total.",
      status: 413,
    });
  }

  return uploadProjectRequestFile({ ...upload, projectRequestId, user });
}

export async function deleteProjectRequestAttachment({ fileId, projectRequestId, user }) {
  const deleted = await deleteProjectRequestFile({ fileId, projectRequestId, user });
  if (!deleted) {
    throw new NotFoundError(
      "FILE_NOT_FOUND",
      "No se encontró el archivo en este borrador.",
    );
  }
  return deleted;
}
