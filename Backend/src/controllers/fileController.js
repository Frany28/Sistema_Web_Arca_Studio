import {
  findProjectRequestForFileUpload,
  uploadProjectRequestFile,
} from "../repositories/fileRepository.js";

const MAX_FILE_SIZE_BYTES = Number(
  process.env.FILE_UPLOAD_MAX_BYTES || 25 * 1024 * 1024,
);

function getOriginalFileName(req) {
  const headerValue =
    req.headers["x-file-name"] ||
    req.headers["x-original-file-name"] ||
    "archivo";

  try {
    return decodeURIComponent(String(headerValue));
  } catch {
    return String(headerValue);
  }
}

export async function uploadProjectRequestAttachment(req, res, next) {
  try {
    const projectRequestId = Number(req.params.projectRequestId);

    if (!Number.isInteger(projectRequestId) || projectRequestId <= 0) {
      res.status(400).json({
        code: "INVALID_PROJECT_REQUEST_ID",
        message: "La solicitud de proyecto no es valida.",
      });
      return;
    }

    const projectRequest = await findProjectRequestForFileUpload(
      projectRequestId,
      req.user,
    );

    if (!projectRequest) {
      res.status(404).json({
        code: "PROJECT_REQUEST_NOT_FOUND",
        message: "No se encontro la solicitud de proyecto.",
      });
      return;
    }

    const buffer = Buffer.isBuffer(req.body) ? req.body : null;
    const fileSize = buffer?.length || 0;

    if (!buffer || fileSize === 0) {
      res.status(400).json({
        code: "FILE_REQUIRED",
        message: "Selecciona un archivo para subir.",
      });
      return;
    }

    if (fileSize > MAX_FILE_SIZE_BYTES) {
      res.status(413).json({
        code: "FILE_TOO_LARGE",
        message: "El archivo supera el tamano permitido.",
      });
      return;
    }

    const file = await uploadProjectRequestFile({
      buffer,
      contentType: req.headers["content-type"],
      originalName: getOriginalFileName(req),
      projectRequestId,
      size: fileSize,
      user: req.user,
    });

    res.status(201).json({ file });
  } catch (error) {
    next(error);
  }
}
