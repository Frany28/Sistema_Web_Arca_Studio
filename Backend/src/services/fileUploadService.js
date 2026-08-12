import { AppError, ValidationError } from "../errors/appError.js";
import { getUploadStream } from "../utils/uploadStream.js";
import { Transform } from "node:stream";

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
const PROJECT_REQUEST_EXTENSIONS = new Set(["jpeg", "jpg", "mp4", "pdf", "png"]);
const PROJECT_REQUEST_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "video/mp4",
]);
const PROJECT_REQUEST_TYPE_BY_EXTENSION = new Map([
  ["jpeg", "image/jpeg"],
  ["jpg", "image/jpeg"],
  ["mp4", "video/mp4"],
  ["pdf", "application/pdf"],
  ["png", "image/png"],
]);

export const uploadPolicies = {
  document: {
    extensions: DOCUMENT_EXTENSIONS,
    maxBytes: Number(process.env.FILE_UPLOAD_MAX_BYTES || 50 * 1024 * 1024),
    maxNameLength: 150,
    typeByExtension: DOCUMENT_TYPE_BY_EXTENSION,
    types: DOCUMENT_TYPES,
  },
  avatar: { extensions: AVATAR_EXTENSIONS, types: AVATAR_TYPES, maxBytes: Number(process.env.PROFILE_PHOTO_MAX_BYTES || 50 * 1024 * 1024), maxNameLength: 150 },
  projectRequest: {
    extensions: PROJECT_REQUEST_EXTENSIONS,
    maxBytes: Number(process.env.FILE_UPLOAD_MAX_BYTES || 50 * 1024 * 1024),
    maxNameLength: 150,
    typeByExtension: PROJECT_REQUEST_TYPE_BY_EXTENSION,
    types: PROJECT_REQUEST_TYPES,
    validateSignature: true,
  },
};

function hasExpectedSignature(buffer, contentType) {
  if (contentType === "image/jpeg") {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (contentType === "image/png") {
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"));
  }
  if (contentType === "application/pdf") {
    return buffer.subarray(0, 1024).includes(Buffer.from("%PDF-"));
  }
  if (contentType === "video/mp4") {
    return buffer.length >= 12 && buffer.subarray(4, 8).toString("ascii") === "ftyp";
  }
  return false;
}

function signatureError() {
  return new AppError({
    code: "INVALID_FILE_SIGNATURE",
    message: "El contenido del archivo no coincide con su formato.",
    status: 415,
  });
}

function validateFileSignature(body, contentType) {
  const inspectionBytes = 1024;
  let buffered = [];
  let bufferedLength = 0;
  let validated = false;
  const validator = new Transform({
    transform(chunk, _encoding, callback) {
      if (validated) {
        callback(null, chunk);
        return;
      }
      buffered.push(chunk);
      bufferedLength += chunk.length;
      if (bufferedLength < inspectionBytes) {
        callback();
        return;
      }
      const combined = Buffer.concat(buffered, bufferedLength);
      if (!hasExpectedSignature(combined, contentType)) {
        callback(signatureError());
        return;
      }
      validated = true;
      buffered = [];
      callback(null, combined);
    },
    flush(callback) {
      if (validated) {
        callback();
        return;
      }
      const combined = Buffer.concat(buffered, bufferedLength);
      if (!hasExpectedSignature(combined, contentType)) {
        callback(signatureError());
        return;
      }
      this.push(combined);
      callback();
    },
  });
  body.on("error", (error) => validator.destroy(error));
  body.pipe(validator);
  return validator;
}

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
  return {
    body: policy.validateSignature ? validateFileSignature(body, contentType) : body,
    contentType,
    originalName: name,
    size,
  };
}

export function prepareProjectUpload(req) {
  return prepareUpload(req, uploadPolicies.document);
}

export function prepareProjectRequestUpload(req) {
  return prepareUpload(req, uploadPolicies.projectRequest);
}

export async function runProjectUpload({ operation, req }) {
  if (req.destroyed) {
    throw new AppError({
      code: "UPLOAD_ABORTED",
      message: "La carga fue cancelada.",
      status: 499,
    });
  }

  return operation(prepareProjectUpload(req));
}

export async function runUpload({ operation, req, policy, fallbackName }) {
  if (req.destroyed) throw new AppError({ code: "UPLOAD_ABORTED", message: "La carga fue cancelada.", status: 499 });
  const upload = prepareUpload(req, policy, { fallbackName });
  return operation(upload);
}
