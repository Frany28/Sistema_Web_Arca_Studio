import {
  createSupportRequestForUser,
  findSupportRequestForUpload,
  uploadSupportRequestFile,
} from "../repositories/supportRepository.js";

const MAX_SUPPORT_SUBJECT_LENGTH = 150;
const MAX_SUPPORT_DESCRIPTION_LENGTH = 5000;
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

export async function createSupportRequest(req, res, next) {
  try {
    const subject = String(req.body?.subject || "").trim();
    const description = String(req.body?.description || "").trim();
    const issueType = String(req.body?.issueType || "").trim();

    if (!subject || subject.length > MAX_SUPPORT_SUBJECT_LENGTH) {
      res.status(400).json({
        code: "INVALID_SUPPORT_SUBJECT",
        message: `El asunto es obligatorio y no puede superar ${MAX_SUPPORT_SUBJECT_LENGTH} caracteres.`,
      });
      return;
    }

    if (!description || description.length > MAX_SUPPORT_DESCRIPTION_LENGTH) {
      res.status(400).json({
        code: "INVALID_SUPPORT_DESCRIPTION",
        message: `La descripcion es obligatoria y no puede superar ${MAX_SUPPORT_DESCRIPTION_LENGTH} caracteres.`,
      });
      return;
    }

    const supportRequest = await createSupportRequestForUser({
      description,
      issueType,
      subject,
      user: req.user,
    });

    res.status(201).json({ supportRequest });
  } catch (error) {
    next(error);
  }
}

export async function uploadSupportRequestAttachment(req, res, next) {
  try {
    const supportRequestId = Number(req.params.supportRequestId);

    if (!Number.isInteger(supportRequestId) || supportRequestId <= 0) {
      res.status(400).json({
        code: "INVALID_SUPPORT_REQUEST_ID",
        message: "La solicitud de soporte no es valida.",
      });
      return;
    }

    const supportRequest = await findSupportRequestForUpload(
      supportRequestId,
      req.user,
    );

    if (!supportRequest) {
      res.status(404).json({
        code: "SUPPORT_REQUEST_NOT_FOUND",
        message: "No se encontro la solicitud de soporte.",
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

    const file = await uploadSupportRequestFile({
      buffer,
      contentType,
      originalName,
      size: fileSize,
      supportRequestId,
      user: req.user,
    });

    res.status(201).json({ file });
  } catch (error) {
    next(error);
  }
}
