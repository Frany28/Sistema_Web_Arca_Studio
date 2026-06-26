import {
  deleteProjectRequestFile,
  findProjectRequestForFileUpload,
  findProjectFileForDownload,
  getProjectFileObject,
  uploadProjectRequestFile,
} from "../repositories/fileRepository.js";

const MAX_FILE_SIZE_BYTES = Number(
  process.env.FILE_UPLOAD_MAX_BYTES || 50 * 1024 * 1024,
);
const MAX_FILE_NAME_LENGTH = 150;
const ALLOWED_FILE_EXTENSIONS = new Set(["jpeg", "jpg", "mp4", "pdf", "png"]);
const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "video/mp4",
]);

function getFileExtension(fileName) {
  const normalized = String(fileName || "").trim().toLowerCase();
  const lastDotIndex = normalized.lastIndexOf(".");

  if (lastDotIndex <= 0 || lastDotIndex === normalized.length - 1) {
    return "";
  }

  return normalized.slice(lastDotIndex + 1);
}

function getNormalizedContentType(value) {
  return String(value || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
}

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
    const originalName = getOriginalFileName(req);
    const extension = getFileExtension(originalName);
    const contentType = getNormalizedContentType(req.headers["content-type"]);

    if (!buffer || fileSize === 0) {
      res.status(400).json({
        code: "FILE_REQUIRED",
        message: "Selecciona un archivo para subir.",
      });
      return;
    }

    if (!originalName || originalName.length > MAX_FILE_NAME_LENGTH) {
      res.status(400).json({
        code: "INVALID_FILE_NAME",
        message: `El nombre del archivo no puede superar ${MAX_FILE_NAME_LENGTH} caracteres.`,
      });
      return;
    }

    if (fileSize > MAX_FILE_SIZE_BYTES) {
      res.status(413).json({
        code: "FILE_TOO_LARGE",
        message: "El archivo supera el tamano permitido de 50 MB.",
      });
      return;
    }

    if (
      !ALLOWED_FILE_EXTENSIONS.has(extension) ||
      !ALLOWED_FILE_TYPES.has(contentType)
    ) {
      res.status(415).json({
        code: "UNSUPPORTED_FILE_TYPE",
        message: "Solo se permiten archivos JPEG, PNG, PDF y MP4.",
      });
      return;
    }

    const file = await uploadProjectRequestFile({
      buffer,
      contentType,
      originalName,
      projectRequestId,
      size: fileSize,
      user: req.user,
    });

    res.status(201).json({ file });
  } catch (error) {
    if (error.code === "DUPLICATE_PROJECT_REQUEST_FILE") {
      res.status(409).json({
        code: error.code,
        message: "Ese archivo ya existe en esta solicitud.",
      });
      return;
    }

    if (error.code === "23505") {
      res.status(409).json({
        code: "DUPLICATE_PROJECT_REQUEST_FILE",
        message: "Ese archivo ya existe en esta solicitud.",
      });
      return;
    }

    next(error);
  }
}

export async function deleteProjectRequestAttachment(req, res, next) {
  try {
    const projectRequestId = Number(req.params.projectRequestId);
    const fileId = Number(req.params.fileId);

    if (!Number.isInteger(projectRequestId) || projectRequestId <= 0) {
      res.status(400).json({
        code: "INVALID_PROJECT_REQUEST_ID",
        message: "La solicitud de proyecto no es valida.",
      });
      return;
    }

    if (!Number.isInteger(fileId) || fileId <= 0) {
      res.status(400).json({
        code: "INVALID_FILE_ID",
        message: "El archivo no es valido.",
      });
      return;
    }

    const deletedFile = await deleteProjectRequestFile({
      fileId,
      projectRequestId,
      user: req.user,
    });

    if (!deletedFile) {
      res.status(404).json({
        code: "FILE_NOT_FOUND",
        message: "No se encontro el archivo en esta solicitud.",
      });
      return;
    }

    res.status(200).json(deletedFile);
  } catch (error) {
    next(error);
  }
}

export async function streamProjectFile(req, res, next) {
  try {
    const projectId = Number(req.params.projectId);
    const fileId = Number(req.params.fileId);

    if (!Number.isInteger(projectId) || projectId <= 0) {
      res.status(400).json({
        code: "INVALID_PROJECT_ID",
        message: "El proyecto no es valido.",
      });
      return;
    }

    if (!Number.isInteger(fileId) || fileId <= 0) {
      res.status(400).json({
        code: "INVALID_FILE_ID",
        message: "El archivo no es valido.",
      });
      return;
    }

    const file = await findProjectFileForDownload({
      fileId,
      projectId,
      user: req.user,
    });

    if (!file) {
      res.status(404).json({
        code: "FILE_NOT_FOUND",
        message: "No se encontro el archivo.",
      });
      return;
    }

    const range = req.headers.range;
    const object = await getProjectFileObject({
      fileName: file.fileName,
      range,
    });
    const contentType = object.ContentType || file.fileType || "application/octet-stream";

    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    if (range && object.ContentRange) {
      res.status(206);
      res.setHeader("Content-Range", object.ContentRange);
      res.setHeader("Accept-Ranges", "bytes");
    } else {
      res.status(200);
      res.setHeader("Accept-Ranges", "bytes");
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "private, max-age=300");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(file.originalName)}"`,
    );

    if (object.ContentLength) {
      res.setHeader("Content-Length", object.ContentLength);
    } else if (!range && file.fileSize) {
      res.setHeader("Content-Length", file.fileSize);
    }

    object.Body.pipe(res);
  } catch (error) {
    next(error);
  }
}
