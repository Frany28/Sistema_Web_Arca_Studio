import { AppError, ValidationError } from "../errors/appError.js";
import { getUploadStream } from "../utils/uploadStream.js";

const DOCUMENT_EXTENSIONS = new Set([
  "docx",
  "jpeg",
  "jpg",
  "mp4",
  "pdf",
  "png",
  "xlsx",
]);
const DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "video/mp4",
]);
const DOCUMENT_TYPE_BY_EXTENSION = new Map([
  ["docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ["jpeg", "image/jpeg"],
  ["jpg", "image/jpeg"],
  ["mp4", "video/mp4"],
  ["pdf", "application/pdf"],
  ["png", "image/png"],
  ["xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
]);
const AVATAR_EXTENSIONS = new Set(["jpeg", "jpg", "png", "webp"]);
const AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const uploadPolicies = {
  document: {
    extensions: DOCUMENT_EXTENSIONS,
    maxBytes: Number(process.env.FILE_UPLOAD_MAX_BYTES || 50 * 1024 * 1024),
    maxNameLength: 150,
    typeByExtension: DOCUMENT_TYPE_BY_EXTENSION,
    types: DOCUMENT_TYPES,
  },
  avatar: { extensions: AVATAR_EXTENSIONS, types: AVATAR_TYPES, maxBytes: Number(process.env.PROFILE_PHOTO_MAX_BYTES || 50 * 1024 * 1024), maxNameLength: 150 },
};

function originalName(req, fallback) {
  const raw = req.headers["x-file-name"] || req.headers["x-original-file-name"] || fallback;
  try { return decodeURIComponent(String(raw)); } catch { return String(raw); }
}

function extension(name) {
  const index = name.lastIndexOf(".");
  return index > 0 && index < name.length - 1 ? name.slice(index + 1).toLowerCase() : "";
}

export function prepareUpload(req, policy, { fallbackName = "archivo" } = {}) {
  const name = originalName(req, fallbackName).trim();
  const contentType = String(req.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
  const fileExtension = extension(name);
  if (!name || name.length > policy.maxNameLength) throw new ValidationError("El nombre del archivo no es válido.", { fileName: `Máximo ${policy.maxNameLength} caracteres.` });
  if (
    !policy.extensions.has(fileExtension) ||
    !policy.types.has(contentType) ||
    (policy.typeByExtension &&
      policy.typeByExtension.get(fileExtension) !== contentType)
  ) {
    throw new AppError({ code: "UNSUPPORTED_FILE_TYPE", message: "El tipo de archivo no está permitido.", status: 415 });
  }
  const { body, size } = getUploadStream(req, policy.maxBytes);
  return { body, contentType, originalName: name, size };
}

export async function runUpload({ operation, req, policy, fallbackName }) {
  if (req.destroyed) throw new AppError({ code: "UPLOAD_ABORTED", message: "La carga fue cancelada.", status: 499 });
  const upload = prepareUpload(req, policy, { fallbackName });
  return operation(upload);
}
